"use strict";
PIXI.Assets.init();
let KDFontName = "Inconsolata Medium";
let KDBaseFonts = [
    ["Inconsolata", {
            alias: "Inconsolata",
            src: 'Fonts/Inconsolata/Inconsolata-Regular.ttf',
            mono: true,
            width: 1.25,
        }],
    ["Inconsolata Medium", {
            alias: "Inconsolata Medium",
            src: 'Fonts/Inconsolata/Inconsolata-Medium.ttf',
            mono: true,
            width: 1.25,
        }],
    ["Inconsolata Light", {
            alias: "Inconsolata Light",
            src: 'Fonts/Inconsolata/Inconsolata-Light.ttf',
            mono: true,
            width: 1.25,
        }],
    ["Inconsolata Condensed Medium", {
            alias: "Inconsolata Condensed Medium",
            src: 'Fonts/Inconsolata/Inconsolata_Condensed-Medium.ttf',
            mono: true,
            width: 1.5,
        }],
    ["Inconsolata Condensed Light", {
            alias: "Inconsolata Condensed Light",
            src: 'Fonts/Inconsolata/Inconsolata_Condensed-Light.ttf',
            mono: true,
            width: 1.5,
        }],
    ["3270", {
            alias: "3270 Regular",
            src: 'Fonts/3270/3270-Regular.ttf',
            mono: true,
            width: 1.0,
        }],
    ["3270 Condensed", {
            alias: "3270condensed Regular",
            src: 'Fonts/3270/3270Condensed-Regular.ttf',
            mono: true,
            width: 1.5,
        }],
    ["Courier New", {
            alias: "Courier New",
            src: '',
            mono: true,
            width: 1.0,
        }],
    ["Lekton", {
            alias: "Lekton Regular",
            src: 'Fonts/Lekton/Lekton-Regular.ttf',
            mono: true,
            width: 1.25,
        }],
    ["System", {
            alias: "Fsex302",
            src: 'Fonts/System/FSEX302.ttf',
            mono: true,
            width: 1.1,
        }],
    ["Iosevka Regular", {
            alias: "Iosevka Regular",
            src: 'Fonts/Iosevka/Iosevka-Regular.ttf',
            mono: true,
            width: 1.25,
        }],
    ["Iosevka Medium", {
            alias: "Iosevka Medium",
            src: 'Fonts/Iosevka/Iosevka-Medium.ttf',
            mono: true,
            width: 1.25,
        }],
    ["Iosevka Slab Regular", {
            alias: "Iosevkaslab Regular",
            src: 'Fonts/Iosevka/IosevkaSlab-Regular.ttf',
            mono: true,
            width: 1.25,
        }],
    ["Iosevka Slab Medium", {
            alias: "Iosevkaslab Medium",
            src: 'Fonts/Iosevka/IosevkaSlab-Medium.ttf',
            mono: true,
            width: 1.25,
        }],
    ["Iosevka Curly Regular", {
            alias: "Iosevkacurly Regular",
            src: 'Fonts/Iosevka/IosevkaCurly-Regular.ttf',
            mono: true,
            width: 1.25,
        }],
    ["Iosevka Curly Medium", {
            alias: "Iosevkacurly Medium",
            src: 'Fonts/Iosevka/IosevkaCurly-Medium.ttf',
            mono: true,
            width: 1.25,
        }],
    ["Nanum Gothic Coding", {
            alias: "Nanumgothiccoding Regular",
            src: 'Fonts/Nanum/NanumGothicCoding-Regular.ttf',
            mono: true,
            width: 1.25,
        }],
    ["Roboto", {
            alias: "Roboto Regular",
            src: 'Fonts/Roboto/Roboto-Regular.ttf',
            mono: false,
            width: 1.3,
        }],
];
let KDFonts = new Map();
for (let obj of KDBaseFonts) {
    KDFonts.set(obj[0], obj[1]);
}
let KDFontsAlias = new Map();
for (let obj of KDBaseFonts) {
    if (typeof obj[1] !== "string")
        KDFontsAlias.set(obj[1].alias, obj[1]);
}
let KDSelectedFont = KDFontName;
let KDSelectedFontListIndex = 0;
let KDSelectedFontList = Array.from(KDFonts.keys());
let KDButtonFont = KDFontName;
let KDButtonFontListIndex = 0;
let KDButtonFontList = Array.from(KDFonts.keys());
let KDOptimizeDisplacementMapInfo = {
    'DisplacementMaps/CorsetSquish.png': {
        xPad: 0,
        yPad: 1000,
    }
};
let DisplacementMaps = [];
let DisplacementScale = 0.25;
let displacementList = [
    ...DisplacementMaps.map((e) => { return "DisplacementMaps/" + e; }),
];
KDLoadToggles();
let linearList = [];
if (KDToggles.MobileTextures) {
    linearList.push(...[
        "TextureAtlas/models_mobile_0000.json",
    ]);
}
else {
    linearList.push(...[
        "TextureAtlas/models_0000.json",
    ]);
}
linearList.push("TextureAtlas/displacement_0000.json");
let nearestList = [
    "TextureAtlas/game_0000.json",
];
let CurrentLoading = "";
let lastProgress = 0;
function incrementProgress(amount) {
    return (progress) => {
        console.log(progress);
        if (progress < lastProgress)
            lastProgress = 0;
        KDLoadingDone += (progress - lastProgress) * amount;
        lastProgress = progress;
    };
}
let buildSuff = "";
async function LoadTextureAtlas(list, scale_mode, preload = false) {
    PIXI.BaseTexture.defaultOptions.scaleMode = scale_mode;
    for (let dataFile of list) {
        console.log("Found atlas: " + dataFile);
        let amount = 100;
        KDLoadingMax += amount;
    }
    for (let dataFile of list) {
        let result = preload ? await PIXI.Assets.backgroundLoad(dataFile + buildSuff).then((value) => {
            let amount = 100;
            CurrentLoading = "Loaded " + dataFile;
            KDLoadingDone += amount;
        }, () => {
            let amount = 100;
            CurrentLoading = "Error Loading " + dataFile;
            KDLoadingDone += amount;
        })
            : await PIXI.Assets.load(dataFile + buildSuff).then((value) => {
                for (let s of Object.values(value.linkedSheets)) {
                    for (let t of Object.keys(s.textures)) {
                        let tsprite = PIXI.Sprite.from(KDTex(t, scale_mode == PIXI.SCALE_MODES.NEAREST));
                        let rt = PIXI.RenderTexture.create({ width: 100, height: 100,
                            resolution: 1 });
                        PIXIapp.renderer.render(tsprite, {
                            clear: true,
                            renderTexture: rt,
                            blit: true,
                        });
                        tsprite.destroy();
                        rt.destroy(true);
                    }
                }
                let amount = 100;
                CurrentLoading = "Loaded " + dataFile;
                KDLoadingDone += amount;
            }, () => {
                let amount = 100;
                CurrentLoading = "Error Loading " + dataFile;
                KDLoadingDone += amount;
            });
    }
}
async function PreloadDisplacement(list) {
    for (let dataFile of list) {
        let amount = 1;
        KDLoadingMax += amount;
    }
    for (let dataFile of list) {
        let amount = 1;
        let texture = PIXI.Texture.fromURL(dataFile + buildSuff, {
            resourceOptions: {
                scale: DisplacementScale,
            }
        });
        texture.then((value) => {
            CurrentLoading = "Loaded " + dataFile;
            KDTex(dataFile, false);
            KDLoadingDone += amount;
        }, () => {
            CurrentLoading = "Error Loading " + dataFile;
            console.log(CurrentLoading);
            KDLoadingDone += amount;
        });
    }
}
async function load() {
    for (let font of KDFonts.values()) {
        if (font.src) {
            try {
                const url_to_font_name = font.src;
                const font_name = new FontFace(font.alias, `url(${url_to_font_name})`);
                document.fonts.add(font_name);
                font_name.load();
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    PIXI.BaseTexture.defaultOptions.mipmap = PIXI.MIPMAP_MODES.ON;
    PIXI.Assets.load("Logo.png");
    await LoadTextureAtlas(nearestList, KDToggles.NearestNeighbor ? PIXI.SCALE_MODES.NEAREST : PIXI.SCALE_MODES.LINEAR);
    await LoadTextureAtlas(linearList, PIXI.SCALE_MODES.LINEAR);
    setTimeout(() => {
        LoadTextureAtlas(nearestList, KDToggles.NearestNeighbor ? PIXI.SCALE_MODES.NEAREST : PIXI.SCALE_MODES.LINEAR);
        LoadTextureAtlas(linearList, PIXI.SCALE_MODES.LINEAR);
    }, 700);
    PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;
}
load();
(() => {
    let extensions = PIXI.extensions;
    const modAtlasLoader = {
        extension: {
            type: PIXI.ExtensionType.LoadParser,
            name: 'modAtlasLoader',
        },
        name: 'modAtlasLoader',
        async load(url) {
            if (KDModFiles[url])
                url = KDModFiles[url];
            else {
                url = url.substring(url.indexOf("blob:http:/"));
                url = url.replace("blob:http:/", "blob:http://");
            }
            const response = await PIXI.settings.ADAPTER.fetch(url);
            const json = await response.json();
            console.log(json);
            return json;
        },
    };
    extensions.add(modAtlasLoader);
    const validImageExtensions = ['.jpeg', '.jpg', '.png', '.webp', '.avif'];
    const validImageMIMEs = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
    ];
    const modTextureLoader = {
        extension: {
            type: PIXI.ExtensionType.LoadParser,
            name: 'modTextureLoader',
            priority: PIXI.LoaderParserPriority.High + 1,
        },
        name: 'modTextureLoader',
        config: {
            preferWorkers: true,
            preferCreateImageBitmap: true,
            crossOrigin: 'anonymous',
        },
        test(url) {
            return (PIXI.checkDataUrl(url, validImageMIMEs) || PIXI.checkExtension(url, validImageExtensions)) && KDModFiles[url];
        },
        async load(url, asset, loader) {
            if (KDModFiles[url])
                url = KDModFiles[url];
            const useImageBitmap = globalThis.createImageBitmap && this.config.preferCreateImageBitmap;
            let src;
            if (useImageBitmap) {
                src = await PIXI.loadImageBitmap(url);
            }
            else {
                src = await new Promise((resolve, reject) => {
                    const src = new Image();
                    src.crossOrigin = this.config.crossOrigin;
                    src.src = url;
                    if (src.complete) {
                        resolve(src);
                    }
                    else {
                        src.onload = () => resolve(src);
                        src.onerror = (e) => reject(e);
                    }
                });
            }
            const options = { ...asset.data };
            options.resolution ?? (options.resolution = PIXI.utils.getResolutionOfUrl(url));
            if (useImageBitmap && options.resourceOptions?.ownsImageBitmap === undefined) {
                options.resourceOptions = { ...options.resourceOptions };
                options.resourceOptions.ownsImageBitmap = true;
            }
            const base = new PIXI.BaseTexture(src, options);
            base.resource.src = url;
            return PIXI.createTexture(base, loader, url);
        },
        unload(texture) {
            texture.destroy(true);
        }
    };
    extensions.add(modTextureLoader);
    const resolveModURL = {
        extension: {
            type: PIXI.ExtensionType.ResolveParser,
            name: 'resolveModURL',
            priority: PIXI.LoaderParserPriority.High,
        },
        test: (url) => KDModFiles[url] != undefined,
        parse: (value) => ({
            resolution: parseFloat(PIXI.settings.RETINA_PREFIX.exec(value)?.[1] ?? '1'),
            format: PIXI.utils.path.extname(value).slice(1),
            src: KDModFiles[value],
        }),
    };
    extensions.add(resolveModURL);
})();
//# sourceMappingURL=Preload.js.map