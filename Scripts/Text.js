"use strict";
class TextResPathGenerator {
    constructor(base_path, file_prefix) {
        this.file_path = base_path;
        this.file_prefix = file_prefix;
    }
    genOriginalPath() {
        return `${this.file_path}/${this.file_prefix}.csv`;
    }
    genTranslationPath(language) {
        return `${this.file_path}/${this.file_prefix}_${language.toUpperCase()}.txt`;
    }
    genTranslationMap(allowed_languages) {
        let map = new Map();
        allowed_languages.forEach((lang) => {
            map.set(lang, this.genTranslationPath(lang));
        });
        return map;
    }
}
TextResPathGenerator.BASE_PATH = "Screens/MiniGame/KinkyDungeon";
class ResourceLoader {
    static registerParser(type, parser) {
        this.parserRegistry.set(type, parser);
    }
    static async load(url, type, options) {
        options.nocache = true;
        const cached = this.cache.get(url);
        if (cached && !options?.nocache) {
            return cached;
        }
        const response = await this.fetchWithRetry(url, options);
        const parser = this.parserRegistry.get(type);
        if (!parser) {
            throw new Error(`No parser registered for type: ${type}`);
        }
        return parser(response);
    }
    static async fetchWithRetry(url, options) {
        const retries = options?.retries ?? 3;
        let attempt = 0;
        while (attempt <= retries) {
            try {
                const response = await fetch(url, {
                    ...options?.requestInit,
                    signal: options?.signal,
                });
                if (response.ok)
                    return response;
                throw new Error(`HTTP ${response.status}`);
            }
            catch (error) {
                if (++attempt > retries)
                    throw error;
                await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
            }
        }
        throw new Error("Unreachable");
    }
}
ResourceLoader.cache = new Map();
ResourceLoader.parserRegistry = new Map([
    ["text", (r) => r.text()],
    ["json", (r) => r.json()],
    ["blob", (r) => r.blob()],
]);
class TranslationTextParser {
    static parseLines(text) {
        return text.split(/\r?\n/);
    }
    static parseTranslationText(text) {
        const textTranslationMap = new Map();
        const tagTranslationMap = new Map();
        const lines = this.parseLines(text);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trimStart();
            if (line.startsWith("-")) {
                textTranslationMap.set(line.slice(1).trimStart(), lines[++i].trimStart());
            }
            else if (line.startsWith("::")) {
                tagTranslationMap.set(line.slice(2).trimStart(), lines[++i].trimStart());
            }
        }
        return { textTranslationMap, tagTranslationMap };
    }
}
ResourceLoader.registerParser("original-csv", async (r) => {
    const text = await r.text();
    return new Map(CommonParseCSV(text).map(([key, value]) => [key, value]));
});
ResourceLoader.registerParser("translation-txt", async (r) => {
    const text = await r.text();
    return TranslationTextParser.parseTranslationText(text);
});
const AvaliableLanguages = ["EN", "CN", "DE", "ES", "JP", "KR", "RU"];
const NormalSupportedLanguages = AvaliableLanguages.filter((lang) => lang !== "EN");
class TextGroupManager {
    constructor() {
        this.sourceTextGroupMap = new Map();
    }
    setGroup(groupId, sourceText) {
        this.sourceTextGroupMap.set(groupId, sourceText);
    }
    removeGroup(groupId) {
        this.sourceTextGroupMap.delete(groupId);
    }
    getGroup(groupId) {
        let group = this.sourceTextGroupMap.get(groupId);
        if (!group) {
            group = new Map();
            this.setGroup(groupId, group);
        }
        return group;
    }
    appendTextMap(groupId, sourceText) {
        const group = this.getGroup(groupId);
        this.mergeMaps(group, sourceText);
    }
    appendText(groupId, key, value) {
        this.appendTextMap(groupId, new Map([[key, value]]));
    }
    mergeMaps(target, source) {
        source.forEach((v, k) => target.set(k, v));
    }
}
class LocalizationService {
    constructor() {
        this.currentLanguage = "EN";
        this.localizationMap = new Map();
    }
    getCurrentTranslation() {
        return this.localizationMap.get(this.currentLanguage) || null;
    }
    setTranslation(language, translation) {
        this.localizationMap.set(language, translation);
    }
    appendTranslation(language, translation) {
        const current = this.localizationMap.get(language);
        if (!current) {
            this.localizationMap.set(language, translation);
        }
        else {
            this.mergeLocalizationResources(current, translation);
        }
    }
    mergeLocalizationResources(target, source) {
        source.textTranslationMap.forEach((v, k) => target.textTranslationMap.set(k, v));
        source.tagTranslationMap.forEach((v, k) => target.tagTranslationMap.set(k, v));
    }
    translate(tag, text) {
        const currentLocalization = this.getCurrentTranslation();
        if (!currentLocalization) {
            return null;
        }
        const translation = currentLocalization.tagTranslationMap.get(tag);
        if (translation) {
            return translation;
        }
        return currentLocalization.textTranslationMap.get(text) || null;
    }
    async setLanguage(lang) {
        if (this.currentLanguage === lang) {
            return;
        }
        this.currentLanguage = lang;
    }
}
class TextResourceLoader {
    constructor() {
        this.resourcePromiseCache = new Map();
        this.abortController = new AbortController();
    }
    pushLoad(url, loadType) {
        const cached = this.resourcePromiseCache.get(url);
        if (cached)
            return cached;
        const promise = ResourceLoader.load(url, loadType, {
            signal: this.abortController.signal,
        });
        promise.catch(() => {
            console.error(`Loading resource failed: ${url}`);
            this.resourcePromiseCache.delete(url);
        });
        this.resourcePromiseCache.set(url, promise);
        return promise;
    }
    abortAll() {
        this.abortController.abort();
        this.abortController = new AbortController();
    }
    isLoaded() {
        return this.resourcePromiseCache.size === 0;
    }
    clearCache() {
        this.resourcePromiseCache.clear();
    }
    async waitAll() {
        await Promise.all(this.resourcePromiseCache.values());
    }
}
class TextProvider {
    constructor() {
        this.defaultGroupId = "default";
        this._debugMode = false;
        this.currentLanguage = null;
        this.textGroupManager = new TextGroupManager();
        this.translationServiceGroup = new Map();
        this.originalTextLoader = new TextResourceLoader();
        this.translationTextLoader = new TextResourceLoader();
        this.textResourceConfig = [];
        this.initializeDefaultConfig();
    }
    initializeDefaultConfig() {
        const pathGener = new TextResPathGenerator("Screens/MiniGame/KinkyDungeon", "Text_KinkyDungeon");
        this.appendTextResource({
            groupId: this.defaultGroupId,
            original: pathGener.genOriginalPath(),
            localizationDictionary: pathGener.genTranslationMap(NormalSupportedLanguages),
        });
    }
    setDebugMode(debug) {
        this._debugMode = debug;
    }
    static get instance() {
        return this._instance;
    }
    getText(tag, params, legacy) {
        return this.getTextFromGroup(this.defaultGroupId, tag, params, legacy);
    }
    hasText(tag, params) {
        return !!this.getTextFromGroupStrict(this.defaultGroupId, tag, params);
    }
    queryResourceConfig(groupId) {
        return this.textResourceConfig.filter((config) => config.groupId === groupId);
    }
    appendTextResource(config) {
        this.textResourceConfig.push(config);
        this.loadAndSetupOriginalText(config.groupId, config.original);
        const currentLang = this.currentLanguage;
        if (!config.localizationDictionary.has(currentLang))
            return;
        this.loadAndSetupTranslationText(config.groupId, config.localizationDictionary.get(currentLang), currentLang);
    }
    getTextFromGroup(groupId, tag, params, legacy) {
        let src = this.getTextFromGroupStrict(groupId, tag, params);
        return src != undefined ? src : (legacy ? tag : ("[NotFound] " + tag));
    }
    getTextFromGroupStrict(groupId, tag, params) {
        const source = this.getGroupManager().getGroup(groupId);
        const translationService = this.getTranslationService(groupId);
        const sourceText = source.get(tag);
        let text = translationService.translate(tag, sourceText) || sourceText;
        if (text && params) {
            text = TextProvider.applyTemplate(text, params);
        }
        if (this._debugMode) {
            text = `${tag}::${text}`;
        }
        return text;
    }
    getTranslationService(groupId) {
        let service = this.translationServiceGroup.get(groupId);
        if (!service) {
            service = new LocalizationService();
            this.translationServiceGroup.set(groupId, service);
        }
        return service;
    }
    getGroupManager() {
        return this.textGroupManager;
    }
    loadAndSetupOriginalText(groupId, url) {
        this.originalTextLoader.pushLoad(url, "original-csv").then((source) => {
            this.textGroupManager.appendTextMap(groupId, source);
        });
    }
    loadAndSetupTranslationText(groupId, url, language) {
        const translationService = this.getTranslationService(groupId);
        this.translationTextLoader
            .pushLoad(url, "translation-txt")
            .then((translation) => {
            translationService.appendTranslation(language, translation);
        });
    }
    setLanguage(language) {
        if (this.currentLanguage === language)
            return;
        this.currentLanguage = language;
        this.textResourceConfig.forEach((config) => {
            const groupId = config.groupId;
            const localizationMap = config.localizationDictionary;
            const translationService = this.getTranslationService(groupId);
            translationService.setLanguage(language);
            if (!localizationMap.has(language))
                return;
            this.loadAndSetupTranslationText(groupId, localizationMap.get(language), language);
        });
        this.translationTextLoader.waitAll().then(() => {
            this.translationTextLoader.clearCache();
        });
    }
    async readyAll() {
        await this.originalTextLoader.waitAll();
        await this.translationTextLoader.waitAll();
        return this;
    }
    static applyTemplate(text, params) {
        return text.replace(/\$\{(\w+)\}/g, (match, key) => {
            const value = params[key];
            return value !== undefined ? String(value) : match;
        });
    }
}
TextProvider._instance = new TextProvider();
const textProvider = TextProvider.instance;
function TextGet(TextTag, params) {
    if (KDToggles.ModCompat && !params) {
        return textProvider.getText(TextTag, params, true);
    }
    return textProvider.getText(TextTag, params);
}
function HasText(TextTag, params) {
    return textProvider.hasText(TextTag, params);
}
function TextLoad() {
    textProvider.setLanguage(TranslationLanguage);
}
function addTextKey(Name, Text) {
    textProvider
        .getGroupManager()
        .appendText("default", Name, Text);
}
//# sourceMappingURL=Text.js.map