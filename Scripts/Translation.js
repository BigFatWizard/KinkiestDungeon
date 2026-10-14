"use strict";
let TranslationLanguage = "EN";
let TranslationCache = {};
function TranslationLoad() {
    let language;
    if (localStorage.getItem("LanguageChange") == "1") {
        language = localStorage.getItem("BondageClubLanguage");
    }
    else {
        language = GetUserPreferredLanguage();
        if (language != null)
            localStorage.setItem("BondageClubLanguage", language);
    }
    if (language != null)
        TranslationLanguage = language;
}
function GetUserPreferredLanguage() {
    var languages;
    try {
        languages = Intl.DateTimeFormat().resolvedOptions().locale.split("-");
    }
    catch {
        languages = navigator.language.split("-");
    }
    if (!languages) {
        return "";
    }
    for (let i = 0; i < languages.length; i++) {
        let lang = languages[i];
        if (KDLanguages.includes(lang))
            return lang;
    }
    return "";
}
function KDLoadTranslations(text1, text2 = null) {
    let parsedkeys = {};
    let parsedkeystranslation = {};
    const text1array = text1.replace(/\r\n?/g, '\n').trim().split('\n');
    text1array.forEach((line) => {
        try {
            let keyloc = line.indexOf(",");
            const textkey = line.slice(0, keyloc);
            let val = line.slice(keyloc + 1);
            if ((val.startsWith('"') && (val.endsWith('"'))) || ((val.startsWith("'")) && (val.endsWith("'")))) {
                val = val.slice(1, -1);
            }
            if (textkey === null || val === undefined) {
                console.log("Error while parsing line: " + line);
            }
            else {
                parsedkeys[textkey] = val;
            }
        }
        catch (err) {
            console.log(err);
        }
    });
    if (text2 != null) {
        const text2array = text2.replace(/\r\n?/g, '\n').trim().split('\n');
        text2array.forEach((line) => {
            try {
                let keyloc = line.indexOf(",");
                const textkey = line.slice(0, keyloc);
                let val = line.slice(keyloc + 1);
                if ((val.startsWith('"') && (val.endsWith('"'))) || ((val.startsWith("'")) && (val.endsWith("'")))) {
                    val = val.slice(1, -1);
                }
                if (textkey === null || val === undefined) {
                    console.log("Error while parsing line: " + line);
                }
                else {
                    parsedkeystranslation[textkey] = val;
                }
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    const keys = Object.keys(parsedkeys);
    console.log(parsedkeys);
    console.log(parsedkeystranslation);
    keys.forEach((key) => {
        if (parsedkeystranslation[key] != undefined) {
            addTextKey(key, (parsedkeystranslation[key].slice('\r')));
        }
        else {
            addTextKey(key, (parsedkeys[key].slice('\r')));
        }
    });
}
//# sourceMappingURL=Translation.js.map