"use strict";
let MainCanvas;
let TempCanvas;
let ColorCanvas;
let CharacterCanvas;
let BlindFlash = false;
let DrawingBlindFlashTimer = 0;
const DrawCacheImage = new Map();
let DrawCacheLoadedImages = 0;
let DrawCacheTotalImages = 0;
let DrawLastDarkFactor = 0;
let DrawLastCharacters = [];
let DrawHoverElements = [];
function DrawHexToRGB(color) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    color = color.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {
        r: 0,
        g: 0,
        b: 0
    };
}
function DrawRGBToHex(color) {
    const rgb = color[2] | (color[1] << 8) | (color[0] << 16);
    return '#' + (0x1000000 + rgb).toString(16).slice(1).toUpperCase();
}
let PIXICanvas = null;
function DrawLoad() {
    PIXICanvas = KinkyDungeonGetCanvas("MainCanvas");
}
function DrawGetImageOnLoad() {
    ++DrawCacheLoadedImages;
}
function DrawGetImageOnError(Img, IsAsset) {
    if (Img.errorcount == null)
        Img.errorcount = 0;
    Img.errorcount += 1;
    if (Img.errorcount < 3) {
        Img.src = Img.src;
    }
    else {
        console.log("Error loading image " + Img.src);
        if (IsAsset)
            DrawGetImageOnLoad();
    }
}
function DrawCircle(CenterX, CenterY, Radius, LineWidth, LineColor, FillColor = null, Canvas = null) {
    if (!Canvas)
        Canvas = MainCanvas;
    Canvas.beginPath();
    Canvas.arc(CenterX, CenterY, Radius, 0, 2 * Math.PI, false);
    if (FillColor) {
        Canvas.fillStyle = FillColor;
        Canvas.fill();
    }
    Canvas.lineWidth = LineWidth;
    Canvas.strokeStyle = LineColor;
    Canvas.stroke();
}
function DrawProgressBar(x, y, w, h, value, foreground = "#66FF66", background = "red") {
    if (value < 0)
        value = 0;
    if (value > 100)
        value = 100;
    DrawRectKD(kdcanvas, kdpixisprites, `progbar,${x}_${y}_${w}_${h}_${value}`, {
        Left: x,
        Top: y,
        Width: w,
        Height: h,
        Color: "#aaaaaa",
        LineWidth: 2,
        zIndex: 100.02,
    });
    FillRectKD(kdcanvas, kdpixisprites, `progbar2,${x}_${y}_${w}_${h}_${value}`, {
        Left: x + 2,
        Top: y + 2,
        Width: Math.floor((w - 4) * value / 100),
        Height: h - 4,
        Color: foreground,
        LineWidth: 1,
        zIndex: 100.01,
    });
    FillRectKD(kdcanvas, kdpixisprites, `progbar3,${x}_${y}_${w}_${h}_${value}`, {
        Left: Math.floor(x + 2 + (w - 4) * value / 100),
        Top: y + 2,
        Width: Math.floor((w - 4) * (100 - value) / 100),
        Height: h - 4,
        Color: background,
        LineWidth: 1,
        zIndex: 100,
        alpha: 0.8,
    });
}
function DrawProcess(time) {
    DrawLastCharacters = [];
    DisableButtonsOneFrame = false;
    KinkyDungeonRun();
    DrawProcessHoverElements();
}
function DrawProcessHoverElements() {
    for (let E = 0; E < DrawHoverElements.length; E++)
        if (typeof DrawHoverElements[0] === "function")
            (DrawHoverElements.shift())();
}
//# sourceMappingURL=Drawing.js.map