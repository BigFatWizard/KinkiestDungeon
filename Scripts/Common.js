"use strict";
let DefaultPlayer;
let KeyPress = "";
let CurrentModule;
let CurrentScreen;
let CurrentCharacter = null;
let CurrentOnlinePlayers = 0;
let CurrentDarkFactor = 1.0;
let CommonIsMobile = CommonDetectMobile();
let CommonCSVCache = {};
let CutsceneStage = 0;
let CommonPhotoMode = false;
let GameVersion = "R0";
const GameVersionFormat = /^R([0-9]+)(?:(Alpha|Beta)([0-9]+)?)?$/;
let CommonVersionUpdated = false;
let CommonTouchList = null;
const CommonChatTags = {
    SOURCE_CHAR: "SourceCharacter",
    DEST_CHAR: "DestinationCharacter",
    DEST_CHAR_NAME: "DestinationCharacterName",
    TARGET_CHAR: "TargetCharacter",
    TARGET_CHAR_NAME: "TargetCharacterName",
    ASSET_NAME: "AssetName",
};
String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
};
const CommonFontStacks = {
    Arial: [["Arial"], "sans-serif"],
    TimesNewRoman: [["Times New Roman", "Times"], "serif"],
    Papyrus: [["Papyrus", "Ink Free", "Segoe Script", "Gabriola"], "fantasy"],
    ComicSans: [["Comic Sans MS", "Comic Sans", "Brush Script MT", "Segoe Print"], "cursive"],
    Impact: [["Impact", "Arial Black", "Franklin Gothic", "Arial"], "sans-serif"],
    HelveticaNeue: [["Helvetica Neue", "Helvetica", "Arial"], "sans-serif"],
    Verdana: [["Verdana", "Helvetica Neue", "Arial"], "sans-serif"],
    CenturyGothic: [["Century Gothic", "Apple Gothic", "AppleGothic", "Futura"], "sans-serif"],
    Georgia: [["Georgia", "Times"], "serif"],
    CourierNew: [["Courier New", "Courier"], "monospace"],
    Copperplate: [["Copperplate", "Copperplate Gothic Light"], "fantasy"],
};
function CommonIsNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function CommonGetFormatDate() {
    let d = new Date();
    let yyyy = d.getFullYear();
    let mm = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
    let dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    let hh = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
    let min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
    let ss = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
function CommonDetectMobile() {
    let mobile = ['iphone', 'ipad', 'android', 'blackberry', 'nokia', 'opera mini', 'windows mobile', 'windows phone', 'iemobile', 'mobile/', 'webos', 'kindle'];
    for (let i in mobile)
        if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0)
            return true;
    if (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform))
        return true;
    if (sessionStorage.desktop)
        return false;
    else if (localStorage.mobile)
        return true;
    return false;
}
function CommonGetBrowser() {
    let ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return { Name: "IE", Version: (tem[1] || "N/A") };
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR|Edge\/(\d+)/);
        if (tem != null)
            return { Name: "Opera", Version: tem[1] || "N/A" };
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null)
        M.splice(1, 1, tem[1]);
    return { Name: M[0] || "N/A", Version: M[1] || "N/A" };
}
function CommonParseCSV(str) {
    let arr = [];
    let quote = false;
    let c;
    let col;
    str = str.replace(/\r\n/g, '\n').trim();
    for (let row = col = c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c + 1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';
        if (cc == '"' && quote && nc == '"') {
            arr[row][col] += cc;
            ++c;
            continue;
        }
        if (cc == '"') {
            quote = !quote;
            continue;
        }
        if (cc == ',' && !quote) {
            ++col;
            continue;
        }
        if (cc == '\n' && !quote) {
            ++row;
            col = 0;
            continue;
        }
        arr[row][col] += cc;
    }
    return arr;
}
function CommonGet(Path, Callback, RetriesLeft = 10) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", Path);
    xhr.onloadend = function () {
        if (this.status < 400)
            Callback.bind(this)(xhr);
        else
            CommonGetRetry(Path, Callback, RetriesLeft);
    };
    xhr.onerror = function () { CommonGetRetry(Path, Callback, RetriesLeft); };
    xhr.send(null);
}
function CommonGetRetry(Path, Callback, RetriesLeft = 10) {
    if (RetriesLeft <= 0) {
        console.error(`GET request to ${Path} failed - no more retries`);
    }
    else {
        const retrySeconds = Math.min(Math.pow(2, Math.max(0, 10 - RetriesLeft)), 60);
        console.warn(`GET request to ${Path} failed - retrying in ${retrySeconds} second${retrySeconds === 1 ? "" : "s"}...`);
        setTimeout(() => CommonGet(Path, Callback, RetriesLeft - 1), retrySeconds * 1000);
    }
}
function CommonClick(event) {
}
function CommonTouchActive(X, Y, W, H, TL) {
    if (!CommonIsMobile)
        return false;
    if (TL == null)
        TL = CommonTouchList;
    if (TL != null)
        for (let Touch of TL) {
            let TouchX = Math.round((Touch.pageX - PIXICanvas.offsetLeft) * 2000 / PIXICanvas.clientWidth);
            let TouchY = Math.round((Touch.pageY - PIXICanvas.offsetTop) * 1000 / PIXICanvas.clientHeight);
            if ((TouchX >= X) && (TouchX <= X + W) && (TouchY >= Y) && (TouchY <= Y + H))
                return true;
        }
    return false;
}
function CommonKeyDown(event) {
    KinkyDungeonKeyDown();
}
function CommonDynamicFunction(FunctionName) {
    if (typeof window[FunctionName.substr(0, FunctionName.indexOf("("))] === "function")
        window[FunctionName.replace("()", "")]();
    else
        console.log("Trying to launch invalid function: " + FunctionName);
}
function CommonDynamicFunctionParams(FunctionName) {
    let Reverse = false;
    if (FunctionName.substring(0, 1) == "!")
        Reverse = true;
    FunctionName = FunctionName.replace("!", "");
    let ParamCount = 1;
    if (FunctionName.indexOf("()") >= 0)
        ParamCount = 0;
    else
        ParamCount = FunctionName.split(",").length;
    let openParenthesisIndex = FunctionName.indexOf("(");
    let closedParenthesisIndex = FunctionName.indexOf(")", openParenthesisIndex);
    let Params = FunctionName.substring(openParenthesisIndex + 1, closedParenthesisIndex).split(",");
    for (let P = 0; P < Params.length; P++)
        Params[P] = Params[P].trim().replace('"', '').replace('"', '');
    FunctionName = FunctionName.substring(0, openParenthesisIndex);
    if ((FunctionName.indexOf("Dialog") != 0) && (FunctionName.indexOf("Inventory") != 0) && (FunctionName.indexOf(CurrentScreen) != 0))
        FunctionName = CurrentScreen + FunctionName;
    if (typeof window[FunctionName] === "function") {
        let Result = true;
        if (ParamCount == 0)
            Result = window[FunctionName]();
        if (ParamCount == 1)
            Result = window[FunctionName](Params[0]);
        if (ParamCount == 2)
            Result = window[FunctionName](Params[0], Params[1]);
        if (ParamCount == 3)
            Result = window[FunctionName](Params[0], Params[1], Params[2]);
        if (Reverse)
            return !Result;
        else
            return Result;
    }
    else {
        console.log("Trying to launch invalid function: " + FunctionName);
        return false;
    }
}
function CommonCallFunctionByName(FunctionName, ...args) {
    let Function = window[FunctionName];
    if (typeof Function === "function") {
        let args = Array.prototype.slice.call(arguments, 1);
        return Function.apply(null, args);
    }
}
function CommonCallFunctionByNameWarn(FunctionName, ...args) {
    let Function = window[FunctionName];
    if (typeof Function === "function") {
        let args = Array.prototype.slice.call(arguments, 1);
        return Function.apply(null, args);
    }
    else {
        console.warn(`Attempted to call invalid function "${FunctionName}"`);
    }
}
function CommonSetScreen(NewModule, NewScreen) {
    CurrentModule = NewModule;
    CurrentScreen = NewScreen;
    CurrentDarkFactor = 1.0;
    TextLoad();
}
function CommonTime() {
    return Date.now();
}
function CommonIsColor(Value) {
    if ((Value == null) || (Value.length < 3))
        return false;
    if (/^#[0-9A-F]{3}$/i.test(Value))
        Value = "#" + Value[1] + Value[1] + Value[2] + Value[2] + Value[3] + Value[3];
    return /^#[0-9A-F]{6}$/i.test(Value);
}
function CommonColorIsValid(Color) {
    if (Color == null || typeof Color === "string")
        return true;
    if (Array.isArray(Color))
        return Color.every(C => C == null || typeof C === "string");
    return false;
}
function CommonRandomItemFromList(ItemPrevious, ItemList) {
    let NewItem = ItemPrevious;
    if (!ItemList || ItemList.length == 0)
        return undefined;
    while (NewItem == ItemPrevious)
        NewItem = ItemList[Math.floor(KDRandom() * ItemList.length)];
    return NewItem;
}
function KDRandomItem(ItemList) {
    if (!ItemList || ItemList.length == 0)
        return undefined;
    return ItemList[Math.floor(KDRandom() * ItemList.length)];
}
function KDRandomItemMath(ItemList) {
    if (!ItemList || ItemList.length == 0)
        return undefined;
    return ItemList[Math.floor(Math.random() * ItemList.length)];
}
function UIItemFromList(ItemPrevious, ItemList) {
    let NewItem = ItemPrevious;
    if (!ItemList || ItemList.length == 0)
        return undefined;
    while (NewItem == ItemPrevious)
        NewItem = ItemList[Math.floor(Math.random() * ItemList.length)];
    return NewItem;
}
function CommonColorsEqual(C1, C2) {
    if (Array.isArray(C1) && Array.isArray(C2)) {
        return CommonArraysEqual(C1, C2);
    }
    return C1 === C2;
}
function CommonArraysEqual(a1, a2) {
    return a1.length === a2.length && a1.every((item, i) => item === a2[i]);
}
function CommonPackItemArray(arr) {
    const res = {};
    for (const I of arr) {
        let G = res[I.Group];
        if (G === undefined) {
            G = res[I.Group] = {};
        }
        let A = G[I.Name];
        if (A === undefined) {
            A = G[I.Name] = [];
        }
        const T = I.Type || "";
        if (!A.includes(T)) {
            A.push(T);
        }
    }
    return res;
}
function CommonUnpackItemArray(arr) {
    const res = [];
    for (const G of Object.keys(arr)) {
        for (const A of Object.keys(arr[G])) {
            for (const T of arr[G][A]) {
                res.push({ Group: G, Name: A, Type: T ? T : undefined });
            }
        }
    }
    return res;
}
function CommonDeepEqual(obj1, obj2) {
    if (obj1 === obj2) {
        return true;
    }
    if (obj1 && obj2 && typeof obj1 === "object" && typeof obj2 === "object") {
        if (Object.getPrototypeOf(obj1) !== Object.getPrototypeOf(obj2)) {
            return false;
        }
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        keys1.sort();
        keys2.sort();
        return keys1.every((key, i) => {
            if (key !== keys2[i]) {
                return false;
            }
            return CommonDeepEqual(obj1[key], obj2[key]);
        });
    }
    return false;
}
function CommonArrayConcatDedupe(dest, src) {
    if (Array.isArray(src) && Array.isArray(dest)) {
        for (const item of src) {
            if (!dest.includes(item))
                dest.push(item);
        }
    }
    return dest;
}
function CommonNoop() {
}
function CommonGetServer() {
    if ((location.href.indexOf("bondageprojects") < 0) && (location.href.indexOf("bondage-europe") < 0))
        return "https://bc-server-test.herokuapp.com/";
    if (location.protocol !== 'https:')
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    return "https://bondage-club-server.herokuapp.com/";
}
//# sourceMappingURL=Common.js.map