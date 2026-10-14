"use strict";
const PIXIWidth = 2000;
const PIXIHeight = 1000;
let isSafari = (navigator.userAgent.indexOf('Safari') != -1
    && navigator.userAgent.indexOf('Chrome') == -1);
let OGVSupported = false;
(() => {
    if (isSafari) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = "Scripts/lib/ogvjs-1.9.0/ogv.js";
        head.appendChild(script).onload = () => {
            OGVSupported = OGVCompat.supported('OGVPlayer');
        };
    }
})();
let resolution = KDResolutionList[parseFloat(localStorage.getItem("KDResolution")) || 0];
KinkyDungeonSetupCrashHandler();
var PIXIapp = new PIXI.Application({
    antialias: false,
    powerPreference: 'high-performance',
    resolution: resolution,
    width: PIXIWidth,
    height: PIXIHeight,
});
PIXI.settings.FILTER_RESOLUTION = resolution;
document.body.appendChild(PIXIapp.view);
PIXIapp.stage.addChild(kdcanvas);
PIXIapp.stage.addChild(kdui);
let ticker = PIXI.Ticker.shared;
window.onload = function () {
    KinkyDungeonRootDirectory = "Game/";
    pixiview = KinkyDungeonGetCanvas("MainCanvas");
    CommonIsMobile = CommonDetectMobile();
    TranslationLoad();
    DrawLoad();
    CommonSetScreen("MiniGame", "KinkyDungeon");
    Character = [];
    CharacterNextId = 1;
    CharacterReset(0);
    CurrentCharacter = null;
    KDSetDefaultKeybindings();
    KinkyDungeonKeybindings = KinkyDungeonKeybindingsTemp;
    if (localStorage.getItem("KinkyDungeonKeybindings") && JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"))) {
        KinkyDungeonKeybindings = JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"));
    }
    KinkyDungeonLoad();
    ticker.add(() => {
        let Timestamp = performance.now();
        DrawProcess(Timestamp);
        TimerRunInterval = Timestamp - TimerLastTime;
        TimerLastTime = Timestamp;
        CurrentTime = CurrentTime + TimerRunInterval;
        if (TimerLastCycleCall + 1700 <= CommonTime()) {
            TimerLastCycleCall = CommonTime();
        }
    });
    PIXIapp.stage.interactiveChildren = false;
    PIXIapp.renderer.gl.canvas.addEventListener('webglcontextlost', () => {
        console.error('WebGl context lost');
        KDForceAllCull = true;
        setTimeout(() => {
            if (PIXIapp.renderer.gl?.getExtension && PIXIapp.renderer.gl.getExtension('WEBGL_lose_context')) {
                PIXIapp.renderer.gl.getExtension('WEBGL_lose_context').restoreContext();
            }
        }, 2000);
    });
};
let ContextLostAlready = false;
let ContextLostFixedAlready = false;
let TimerRunInterval = 0;
let TimerLastTime = 0;
let CurrentTime = 0;
let TimerLastCycleCall = 0;
function MainRun(Timestamp) {
    DrawProcess(Timestamp);
    TimerRunInterval = Timestamp - TimerLastTime;
    TimerLastTime = Timestamp;
    CurrentTime = CurrentTime + TimerRunInterval;
    if (TimerLastCycleCall + 1700 <= CommonTime()) {
        TimerLastCycleCall = CommonTime();
    }
    requestAnimationFrame(MainRun);
}
function KeyDown(event) {
    if (event.repeat)
        return;
    KeyPress = event.keyCode || event.which;
    CommonKeyDown(event);
}
function Click(event) {
}
function TouchStart(event) {
}
function TouchEnd(event) {
}
function TouchMove(touch) {
}
function MouseMove(event, allowOffsetting) {
    if (PIXICanvas) {
        let ol = 0;
        let ot = 0;
        if (allowOffsetting) {
            if (documentcache.get(document.activeElement)) {
                ol = documentcache.get(document.activeElement).x;
                ot = documentcache.get(document.activeElement).y;
            }
        }
        MouseX = Math.round((event.offsetX) * 2000 / PIXICanvas.clientWidth) + ol;
        MouseY = Math.round((event.offsetY) * 1000 / PIXICanvas.clientHeight) + ot;
    }
}
function LoseFocus(event) {
    if (event.relatedTarget || event.toElement) {
        MouseX = -1;
        MouseY = -1;
    }
}
//# sourceMappingURL=Main.js.map