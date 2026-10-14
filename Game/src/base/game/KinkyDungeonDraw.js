"use strict";
let lastExtraTooltipCycleTimeAuto = 0;
let lastExtraTooltipCycleTimeAuto_Delay = 1500;
let lastExtraTooltipCycleTimeAuto_ManualDelay = 30000;
let KDGamePlayerZIndex = 6;
let KDMenuPlayerZIndex = 6;
;
let KDDebugOverlay = false;
let CHIBIMODEND = [
    {
        Layer: "HairBack",
        scale_x: 1.0,
        scale_y: 0.7,
        rotation_x_anchor: 1220,
        rotation_y_anchor: 420,
        offset_x: 1220,
        offset_y: 420,
    },
    {
        Layer: "HairPonytail",
        scale_x: 1.0,
        scale_y: 0.7,
        rotation_x_anchor: 1220,
        rotation_y_anchor: 420,
        offset_x: 1220,
        offset_y: 420,
    },
];
let CHIBIMOD = [
    {
        Layer: "Head",
        scale_x: 2.25,
        scale_y: 2.25,
        rotation_x_anchor: 1190,
        rotation_y_anchor: 690,
        offset_x: 1100,
        offset_y: 620,
    },
];
let KDInspectCamera = { x: 0, y: 0 };
let KDRecentRepIndex = 0;
let KDWallReplacers = "14f6,dDzZbgS";
let KinkyDungeonSuppressSprint = true;
let KDReturnButtonXX = 1450;
let KDIntenseFilter = null;
let KDButtonHovering = 0;
let KDDistractionFlashTime = 700;
let KDDistractionFlashStrengthTime = 200;
let KDDistractionFlashStrength = 0;
let KDDistractionFlashLastTime = 0;
let KDAnimTick = 0;
let KDAnimTickInterval = 2000;
let KDAnimTime = 1600;
let KDFloatAnimTime = 4000;
let KDSquishyAnimTime = 2000;
let KDBreathAnimTime = 1400;
let KDFlipPlayer = false;
let KDBaseButtonAlpha = 0.5;
let pixiview = null;
let pixirenderer = null;
let pixirendererKD = null;
let kdgamefog = new PIXI.Graphics();
let kdBGMask = new PIXI.Graphics();
kdBGMask.zIndex = -99;
let kdgamefogsmoothDark = new PIXI.Container();
kdgamefogsmoothDark.zIndex = -1.05;
let kdgamefogsmooth = new PIXI.Container();
kdgamefogsmooth.zIndex = -1.1;
kdgamefog.zIndex = -1;
let kdgamesound = new PIXI.Container();
kdgamesound.zIndex = 1;
let kdsolidcolorfilter = new PIXI.Filter(null, KDShaders.Solid.code, {});
let kdoutlinefilter = new PIXI.filters.OutlineFilter(2, 0xfffafa, 0.1, 0.5, true);
kdgamesound.filters = [kdoutlinefilter];
let KDOutlineFilterCache = new Map();
let kdminimap = new PIXI.Graphics();
kdminimap.x = 500;
kdminimap.y = 10;
kdminimap.zIndex = 80;
kdminimap.sortableChildren = true;
let kdmapboard = new PIXI.Container();
kdmapboard.zIndex = -2;
kdmapboard.filterArea = new PIXI.Rectangle(0, 0, 2000, 1000);
let kdlightmap = null;
let kdlightmapGFX = null;
let npcTooltipContainer = new PIXI.Container();
npcTooltipContainer.zIndex = 120;
let collectionNPCContainer = new PIXI.Container();
collectionNPCContainer.zIndex = 120;
let kdbrightnessmap = null;
let kdbrightnessmapGFX = null;
if (StandalonePatched) {
    let res = KDResolutionList[parseFloat(localStorage.getItem("KDResolution")) || 0];
    kdbrightnessmapGFX = new PIXI.Container();
    kdbrightnessmap = PIXI.RenderTexture.create({ width: res > 1 ? 2047 : 2000, height: res > 1 ? 1023 : 1000, });
    kdlightmapGFX = new PIXI.Graphics();
    kdlightmap = PIXI.RenderTexture.create({ width: res > 1 ? 2047 : 2000, height: res > 1 ? 1023 : 1000, });
}
let kddarkdesaturatefilter = new PIXI.Filter(null, KDShaders.Darkness.code, {
    radius: .02 * 72 / 2000,
    weight: 0.24,
    mult: 1.1,
    lum_cutoff: 0.65,
    lum_cutoff_rate: 3.5,
    brightness: 1,
    brightness_rate: 0.7,
    contrast: 1,
    contrast_rate: 0.03,
});
let kdfogfilter = new PIXI.Filter(null, KDShaders.FogFilter.code, {
    lightmap: kdlightmap,
    brightness: 1,
    brightness_rate: 0.,
    contrast: 1,
    contrast_rate: 0.03,
    saturation: 0,
});
let kdgammafilterstore = [1.0];
let kdgammafilter = new PIXI.Filter(null, KDShaders.GammaFilter.code, {
    gamma: kdgammafilterstore,
});
let kdmultiplyfilter = new PIXI.Filter(null, KDShaders.MultiplyFilter.code, {
    lightmap: kdbrightnessmap,
});
let KDBoardFilters = [kdmultiplyfilter, kdfogfilter];
kdmapboard.filters = [
    ...KDBoardFilters,
    kdgammafilter,
];
let kdenemyboard = new PIXI.Container();
kdenemyboard.zIndex = 0;
kdenemyboard.sortableChildren = true;
let kdenemystatusboard = new PIXI.Container();
kdenemystatusboard.zIndex = 4;
kdenemystatusboard.sortableChildren = true;
let kdbulletboard = new PIXI.Container();
kdbulletboard.zIndex = 2.3;
kdbulletboard.sortableChildren = true;
let kdeffecttileboard = new PIXI.Container();
kdeffecttileboard.zIndex = -0.1;
kdeffecttileboard.sortableChildren = true;
let kdUItext = new PIXI.Container();
kdUItext.zIndex = 60;
kdUItext.sortableChildren = true;
let kdstatusboard = new PIXI.Container();
kdstatusboard.zIndex = 5;
kdstatusboard.sortableChildren = true;
let kdfloatercanvas = new PIXI.Container();
kdfloatercanvas.zIndex = 200;
kdfloatercanvas.sortableChildren = false;
kdstatusboard.addChild(kdfloatercanvas);
let kddialoguecanvas = new PIXI.Container();
kddialoguecanvas.zIndex = 60;
kddialoguecanvas.sortableChildren = false;
kdstatusboard.addChild(kddialoguecanvas);
let kdenemydialoguecanvas = new PIXI.Container();
kdenemydialoguecanvas.zIndex = 60;
kdenemydialoguecanvas.sortableChildren = false;
kdstatusboard.addChild(kdenemydialoguecanvas);
let kditemsboard = new PIXI.Container();
kditemsboard.zIndex = -2;
kditemsboard.sortableChildren = false;
let kdwarningboard = new PIXI.Container();
kdwarningboard.zIndex = -0.3;
kdwarningboard.sortableChildren = true;
let kdwarningboardOver = new PIXI.Container();
kdwarningboardOver.zIndex = 2.22;
kdwarningboardOver.sortableChildren = false;
let kdgameboard = new PIXI.Container();
kdgameboard.sortableChildren = true;
kdgameboard.zIndex = -50;
kdgameboard.addChild(kdmapboard);
kdgameboard.addChild(kdwarningboard);
kdgameboard.addChild(kdbulletboard);
kdgameboard.addChild(kdenemyboard);
kdgameboard.addChild(kdeffecttileboard);
kdgameboard.addChild(kdgamesound);
kdgameboard.addChild(kdwarningboardOver);
kdgameboard.addChild(kditemsboard);
let kdui = new PIXI.Graphics();
let kdcanvas = new PIXI.Container();
let kdpalettecontainer = new PIXI.Container();
kdcanvas.sortableChildren = true;
kdpalettecontainer.sortableChildren = true;
kdcanvas.addChild(kdstatusboard);
kdcanvas.addChild(kdenemystatusboard);
kdcanvas.addChild(kdUItext);
kdcanvas.addChild(kdminimap);
kdcanvas.addChild(kdpalettecontainer);
kdcanvas.addChild(kdBGMask);
kdcanvas.addChild(npcTooltipContainer);
kdcanvas.addChild(collectionNPCContainer);
let statusOffset = 0;
kdgameboard.addChild(kdgamefogsmooth);
kdgameboard.addChild(kdgamefogsmoothDark);
if (StandalonePatched) {
    statusOffset -= 20;
    kdgameboard.addChild(kdgamefog);
    kdcanvas.addChild(kdgameboard);
}
let kdparticles = new PIXI.Container();
kdparticles.zIndex = 10;
kdparticles.sortableChildren = false;
kdcanvas.addChild(kdparticles);
let KDTextWhite = KDBaseWhite;
let KDTextGray3 = "#aaaaaa";
let KDTextGraymid = "#888888";
let KDBookTextNew = "#efefef";
let KDTextTanNew = "#222222";
let KDBookTextSB = KDBaseBlack;
let KDTextTanSB = "#d6cbc5";
let KDBookText = KDBookTextNew;
let KDTextTan = KDTextTanNew;
let KDTextGray2 = "#333333";
let KDTextGray1 = "#111111";
let KDTextGray05 = "#030303";
let KDTextGray0 = KDBaseBlack;
let KDTextGreen1 = "#001100";
let KDTextBlue1 = "#000011";
let KDTextRed1 = "#110000";
let KDTextRedBG = "#551616";
let KDCurseColor = "#ff55aa";
let KDGoodColor = "#77ff99";
let KDTutorialColor = KDBaseCyan;
let kdSpritesDrawn = new Map();
let kdRTlastLookup = new Map();
let kdTexlastLookup = new Map();
let kdlightsprites = new Map();
let kdpixisprites = new Map();
let kdRTcache = new Map();
let kdRTSpritecache = new Map();
let kdTexcache = new Map();
let kdminimapsprites = new Map();
let kdpixifogsprites = new Map();
let kdpixibrisprites = new Map();
let kdFilterSprites = new Map();
let kdprimitiveparams = new Map();
let kdpixitex = new Map();
function KDWallVert(x, y, noReplace) {
    let tileBelow = KinkyDungeonMapGet(x, y + 1);
    if ((KDWallReplacers.includes(tileBelow)
        && (!noReplace || !noReplace.includes(tileBelow))))
        return true;
    if (!KinkyDungeonVisionGet(x, y + 1) && !(KinkyDungeonFogGet(x, y + 1) > 0))
        return true;
    return false;
}
function KDWallVertAbove(x, y, noReplace) {
    let tileAbove = KinkyDungeonMapGet(x, y - 1);
    if (KDWallReplacers.includes(tileAbove)
        && (!noReplace || !noReplace.includes(tileAbove)))
        return true;
    return false;
}
function KDWallVertBoth(x, y, noReplace) {
    let tileBelow = KinkyDungeonMapGet(x, y + 1);
    let tileAbove = KinkyDungeonMapGet(x, y - 1);
    if (KDWallReplacers.includes(tileBelow)
        && (!noReplace || !noReplace.includes(tileBelow))
        && KDWallReplacers.includes(tileAbove)
        && (!noReplace || !noReplace.includes(tileAbove)))
        return true;
    return false;
}
function KDWallHorizTunnel(x, y) {
    let tileUp = KinkyDungeonMapGet(x, y - 1);
    let tileBelow = KinkyDungeonMapGet(x, y + 1);
    if (KinkyDungeonWallTiles.includes(tileUp)
        && KinkyDungeonWallTiles.includes(tileBelow))
        return true;
    return false;
}
function KDWallVertTunnel(x, y) {
    let tileRight = KinkyDungeonMapGet(x + 1, y);
    let tileLeft = KinkyDungeonMapGet(x - 1, y);
    if (KinkyDungeonWallTiles.includes(tileRight)
        && KinkyDungeonWallTiles.includes(tileLeft))
        return true;
    return false;
}
let KDChainablePillar = 'bdD';
const KDSprites = {
    "5": (x, y, _Fog, _noReplace) => {
        let tile = KinkyDungeonTilesGet(x + "," + y);
        if (tile?.Sprite)
            return tile.Sprite;
        return "Floor";
    },
    "6": (x, y, _Fog, _noReplace) => {
        let tile = KinkyDungeonTilesGet(x + "," + y);
        if (tile?.Sprite)
            return tile.Sprite;
        return "Wall";
    },
    "1": (x, y, _Fog, noReplace) => {
        if (KDWallVert(x, y, noReplace))
            return "WallVert";
        return "Wall";
    },
    "f": (x, y, _Fog, noReplace) => {
        if (KDWallVert(x, y, noReplace))
            return "WallRVert";
        return "WallR";
    },
    "2": (_x, _y, _Fog, _noReplace) => {
        return "Brickwork";
    },
    "3": (_x, _y, Fog, _noReplace) => {
        return Fog ? "Doodad" : "MimicBlock";
    },
    "b": (x, y, _Fog, noReplace) => {
        if (KDWallVertAbove(x, y, noReplace))
            return KDChainablePillar.includes(KinkyDungeonMapGet(x, y - 1)) ? "BarsVertCont" : "BarsVert";
        return "Bars";
    },
    "X": (_x, _y, _Fog, _noReplace) => {
        return "Doodad";
    },
    "4": (x, y, _Fog, noReplace) => {
        if (KDWallVert(x, y, noReplace))
            return "WallVert";
        return "Wall";
    },
    "L": (x, y, _Fog, _noReplace) => {
        if (KinkyDungeonTilesGet(x + "," + y)) {
            let furn = KinkyDungeonTilesGet(x + "," + y).Furniture ? KDFurniture[KinkyDungeonTilesGet(x + "," + y).Furniture] : undefined;
            if (furn) {
                return furn.floor;
            }
        }
        return "Barrel";
    },
    "F": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "?": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "/": (_x, _y, _Fog, _noReplace) => {
        return "RubbleLooted";
    },
    ",": (x, y, _Fog, noReplace) => {
        if (KDWallVert(x, y, noReplace))
            return "WallVert";
        return "Wall";
    },
    "D": (x, y, Fog, noReplace) => {
        if (KinkyDungeonTilesGet(x + "," + y)?.DoorSkin) {
            if (KDWallVertBoth(x, y, noReplace))
                return "Floor";
            return "Wall";
        }
        if (Fog) {
            if (KDMapData.TilesMemory[x + "," + y])
                return KDMapData.TilesMemory[x + "," + y];
        }
        if (KDWallVertBoth(x, y, noReplace))
            KDMapData.TilesMemory[x + "," + y] = KDChainablePillar.includes(KinkyDungeonMapGet(x, y - 1)) ? "DoorVertCont" : "DoorVert";
        else
            KDMapData.TilesMemory[x + "," + y] = "Door";
        return KDMapData.TilesMemory[x + "," + y];
    },
    "d": (x, y, Fog, noReplace) => {
        if (KinkyDungeonTilesGet(x + "," + y)?.DoorSkin) {
            if (KDWallVertBoth(x, y, noReplace))
                return "Floor";
            return "Wall";
        }
        if (Fog) {
            if (KDMapData.TilesMemory[x + "," + y])
                return KDMapData.TilesMemory[x + "," + y];
        }
        if (KDWallVertBoth(x, y, noReplace))
            KDMapData.TilesMemory[x + "," + y] = KDChainablePillar.includes(KinkyDungeonMapGet(x, y - 1)) ? "DoorVertOpenCont" : "DoorVertOpen";
        else
            KDMapData.TilesMemory[x + "," + y] = "DoorOpen";
        return KDMapData.TilesMemory[x + "," + y];
    },
    "Z": (x, y, Fog, noReplace) => {
        if (Fog) {
            if (KDMapData.TilesMemory[x + "," + y])
                return KDMapData.TilesMemory[x + "," + y];
        }
        if (KDWallVertBoth(x, y, noReplace))
            KDMapData.TilesMemory[x + "," + y] = KDChainablePillar.includes(KinkyDungeonMapGet(x, y - 1)) ? "DoorVertCont" : "DoorVert";
        else
            KDMapData.TilesMemory[x + "," + y] = "Door";
        return KDMapData.TilesMemory[x + "," + y];
    },
    "z": (x, y, Fog, noReplace) => {
        if (Fog) {
            if (KDMapData.TilesMemory[x + "," + y])
                return KDMapData.TilesMemory[x + "," + y];
        }
        if (KDWallVertBoth(x, y, noReplace))
            KDMapData.TilesMemory[x + "," + y] = KDChainablePillar.includes(KinkyDungeonMapGet(x, y - 1)) ? "DoorVertOpenCont" : "DoorVertOpen";
        else
            KDMapData.TilesMemory[x + "," + y] = "DoorOpen";
        return KDMapData.TilesMemory[x + "," + y];
    },
    "a": (_x, _y, _Fog, _noReplace) => {
        return "ShrineBroken";
    },
    "A": (x, y, _Fog, _noReplace) => {
        return (KinkyDungeonTilesGet(x + "," + y) && KinkyDungeonTilesGet(x + "," + y).Type == "Shrine" && KinkyDungeonTilesGet(x + "," + y).Name == "Commerce") ? "ShrineC" : ((KinkyDungeonTilesGet(x + "," + y) && KinkyDungeonTilesGet(x + "," + y).drunk) ? "ShrineEmpty" : "Shrine");
    },
    "H": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "s": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "S": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "g": (x, y, _Fog, _noReplace) => {
        if (KDWallHorizTunnel(x, y))
            return "GrateHoriz";
        else if (!KDWallVert(x, y)) {
            return "Grate";
        }
        else if (KDWallVertTunnel(x, y)) {
            return "GrateVert";
        }
        return "Grate";
    },
    "r": (_x, _y, _Fog, _noReplace) => {
        return "RubbleLooted";
    },
    "T": (_x, _y, _Fog, _noReplace) => {
        return (KinkyDungeonBlindLevel > 0) ? "Floor" : "Trap";
    },
    "Y": (_x, _y, _Fog, _noReplace) => {
        return "Doodad";
    },
    "R": (_x, _y, _Fog, _noReplace) => {
        return "RubbleLooted";
    },
    "m": (_x, _y, _Fog, _noReplace) => {
        return "Brickwork";
    },
    "M": (_x, _y, _Fog, _noReplace) => {
        return "Brickwork";
    },
    "O": (_x, _y, _Fog, _noReplace) => {
        return "OrbEmpty";
    },
    "P": (_x, _y, _Fog, _noReplace) => {
        return "OrbEmpty";
    },
    "p": (_x, _y, _Fog, _noReplace) => {
        return "OrbEmpty";
    },
    "o": (_x, _y, _Fog, _noReplace) => {
        return "OrbEmpty";
    },
    "w": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "W": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "]": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "[": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "=": (_x, _y, _Fog, _noReplace) => {
        return "Brickwork";
    },
    "+": (_x, _y, _Fog, _noReplace) => {
        return "Brickwork";
    },
    "-": (_x, _y, _Fog, _noReplace) => {
        return "Brickwork";
    },
    "l": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    ";": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "V": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "v": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "t": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "u": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
    "N": (_x, _y, _Fog, _noReplace) => {
        return "Floor";
    },
};
const KDOverlays = {
    "5": (x, y, _Fog, _noReplace) => {
        let tile = KinkyDungeonTilesGet(x + "," + y);
        if (tile?.Overlay)
            return tile.Overlay;
        return "";
    },
    "6": (x, y, _Fog, _noReplace) => {
        let tile = KinkyDungeonTilesGet(x + "," + y);
        if (tile?.Overlay)
            return tile.Overlay;
        return "";
    },
    "7": (x, y, _Fog, _noReplace) => {
        let tile = KinkyDungeonTilesGet(x + "," + y);
        if (tile?.Overlay)
            return tile.Overlay;
        return "";
    },
    "Z": (_x, _y, _Fog, _noReplace) => {
        return "Signal/AutoLock";
    },
    "H": (_x, _y, _Fog, _noReplace) => {
        let l = KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(_x - 1, _y));
        let r = KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(_x + 1, _y));
        let u = KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(_x, _y - 1));
        let d = KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(_x, _y + 1));
        return (u && !d && l && r) ? "StairsDown" : "SpiralStairsDown";
    },
    "s": (_x, _y, _Fog, _noReplace) => {
        let l = KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(_x - 1, _y));
        let r = KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(_x + 1, _y));
        let u = KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(_x, _y - 1));
        let d = KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(_x, _y + 1));
        return (!d && u) ? "StairsDown" : "SpiralStairsDown";
    },
    "S": (_x, _y, _Fog, _noReplace) => {
        let u = KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(_x, _y - 1));
        let d = KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(_x, _y + 1));
        return (u) ? "StairsUp" : "SpiralStairsUp";
    },
    "-": (_x, _y, _Fog, _noReplace) => {
        return "ChargerSpent";
    },
    "l": (_x, _y, _Fog, _noReplace) => {
        return "Leyline";
    },
    ";": (x, y, _Fog, _noReplace) => {
        let tile = KinkyDungeonTilesGet(x + "," + y);
        if (tile?.Portal)
            return tile.Portal;
        return "";
    },
    "+": (_x, _y, _Fog, _noReplace) => {
        return "Charger";
    },
    "=": (_x, _y, _Fog, _noReplace) => {
        return "ChargerCrystal";
    },
    "Y": (_x, _y, _Fog, _noReplace) => {
        return "Rubble";
    },
    "/": (_x, _y, _Fog, _noReplace) => {
        return "Scrap";
    },
    "R": (_x, _y, _Fog, _noReplace) => {
        return "Rubble";
    },
    "$": (_x, _y, _Fog, _noReplace) => {
        return "Angel";
    },
    "m": (_x, _y, _Fog, _noReplace) => {
        return "TabletSpent";
    },
    "M": (x, y, _Fog, _noReplace) => {
        if (KinkyDungeonTilesGet(x + "," + y) && !Object.keys(KinkyDungeonGoddessRep).includes(KinkyDungeonTilesGet(x + "," + y).Name))
            return "Tablet" + KinkyDungeonTilesGet(x + "," + y).Name;
        return "Tablet";
    },
    "[": (_x, _y, _Fog, _noReplace) => {
        return "Spores";
    },
    "]": (_x, _y, _Fog, _noReplace) => {
        return "HappyGas";
    },
    "w": (_x, _y, _Fog, _noReplace) => {
        return "Water";
    },
    "W": (_x, _y, _Fog, _noReplace) => {
        return "Water";
    },
    "O": (_x, _y, _Fog, _noReplace) => {
        return "Orb";
    },
    "P": (_x, _y, _Fog, _noReplace) => {
        return "Perk";
    },
    ",": (_x, _y, _Fog, _noReplace) => {
        return "HookLow";
    },
    "?": (_x, _y, _Fog, _noReplace) => {
        return "HookHigh";
    },
    "B": (_x, _y, _Fog, _noReplace) => {
        return "Bed";
    },
    "G": (x, y, _Fog, _noReplace) => {
        let sprite = "Ghost";
        if (KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Msg || KinkyDungeonTilesGet(x + "," + y).Dialogue)) {
            sprite = "GhostImportant";
        }
        return sprite;
    },
    "L": (x, y, _Fog, _noReplace) => {
        if (KinkyDungeonTilesGet(x + "," + y)) {
            let furn = KinkyDungeonTilesGet(x + "," + y).Furniture ? KDFurniture[KinkyDungeonTilesGet(x + "," + y).Furniture] : undefined;
            if (furn) {
                return furn.sprite;
            }
        }
    },
    "F": (x, y, _Fog, _noReplace) => {
        let sprite = "Table";
        if (KinkyDungeonTilesGet(x + "," + y)) {
            let table = "Table";
            if (KinkyDungeonTilesGet(x + "," + y).Food) {
                sprite = table + KinkyDungeonTilesGet(x + "," + y).Food;
            }
        }
        return sprite;
    },
    "4": (x, y, _Fog, _noReplace) => {
        let left = KDInteractableTiles.includes(KinkyDungeonMapGet(x - 1, y));
        let right = KDInteractableTiles.includes(KinkyDungeonMapGet(x + 1, y));
        let up = KDInteractableTiles.includes(KinkyDungeonMapGet(x, y - 1));
        let down = KDInteractableTiles.includes(KinkyDungeonMapGet(x, y + 1));
        if (down) {
            return "Crack";
        }
        else if (up) {
            return "CrackHoriz";
        }
        else if (left && right) {
            return "CrackVert";
        }
        else if (left) {
            return "CrackLeft";
        }
        else if (right) {
            return "CrackRight";
        }
        return "CrackNone";
    },
    "c": (x, y, _Fog, _noReplace) => {
        return (KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "gold" || KinkyDungeonTilesGet(x + "," + y).Loot == "lessergold")) ? "ChestGoldOpen" :
            ((KinkyDungeonTilesGet(x + "," + y) && (KDSpecialChests[KinkyDungeonTilesGet(x + "," + y).Loot])) ? KDSpecialChests[KinkyDungeonTilesGet(x + "," + y).Loot] + "Open" :
                ((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "blue")) ? "ChestBlueOpen" :
                    ((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "dark")) ? "ChestDarkOpen" :
                        ((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "pearl" || KinkyDungeonTilesGet(x + "," + y).Loot == "lesserpearl")) ? "ChestPearlOpen" : "ChestOpen"))));
    },
    "C": (x, y, _Fog, _noReplace) => {
        return (KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "gold" || KinkyDungeonTilesGet(x + "," + y).Loot == "lessergold")) ? "ChestGold" :
            ((KinkyDungeonTilesGet(x + "," + y) && (KDSpecialChests[KinkyDungeonTilesGet(x + "," + y).Loot])) ? KDSpecialChests[KinkyDungeonTilesGet(x + "," + y).Loot] :
                ((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "blue")) ? "ChestBlue" :
                    ((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "dark")) ? "ChestDark" :
                        ((KinkyDungeonTilesGet(x + "," + y) && (KinkyDungeonTilesGet(x + "," + y).Loot == "pearl" || KinkyDungeonTilesGet(x + "," + y).Loot == "lesserpearl")) ? "ChestPearl" : "Chest"))));
    },
    "@": (_x, _y, _Fog, _noReplace) => {
        return "Signal/Button";
    },
    "V": (x, y, _Fog, _noReplace) => {
        let tile = KinkyDungeonTilesGet(x + "," + y);
        if (tile) {
            let tU = KinkyDungeonTilesGet(x + "," + (y - 1));
            let tD = KinkyDungeonTilesGet(x + "," + (y + 1));
            let tR = KinkyDungeonTilesGet((x + 1) + "," + y);
            let tL = KinkyDungeonTilesGet((x - 1) + "," + y);
            let sprite = "";
            if (tile.DY == -1) {
                if (tD?.DY == -1)
                    return "Conveyor/Up";
                if (tL?.DX == 1 && tR?.DX == -1)
                    sprite = sprite + "LeftRight";
                else if (tL?.DX == 1)
                    sprite = sprite + "Right";
                else if (tR?.DX == -1)
                    sprite = sprite + "Left";
                sprite = sprite + "Up";
            }
            else if (tile.DY == 1) {
                if (tU?.DY == 1)
                    return "Conveyor/Down";
                if (tL?.DX == 1 && tR?.DX == -1)
                    sprite = sprite + "LeftRight";
                else if (tL?.DX == 1 && !(tR?.DX == -1))
                    sprite = sprite + "Right";
                else if (tR?.DX == -1 && !(tL?.DX == 1))
                    sprite = sprite + "Left";
                sprite = sprite + "Down";
            }
            else if (tile.DX == 1) {
                if (tU?.DY == 1 && tD?.DY == -1)
                    sprite = sprite + "UpDown";
                else if (tU?.DY == 1)
                    sprite = sprite + "Down";
                else if (tD?.DY == -1)
                    sprite = sprite + "Up";
                sprite = sprite + "Right";
            }
            else if (tile.DX == -1) {
                if (tU?.DY == 1 && tD?.DY == -1)
                    sprite = sprite + "UpDown";
                else if (tU?.DY == 1)
                    sprite = sprite + "Down";
                else if (tD?.DY == -1)
                    sprite = sprite + "Up";
                sprite = sprite + "Left";
            }
            return "Conveyor/" + sprite;
        }
        return "Conveyor/Conveyor";
    },
    "v": (x, y, _Fog, _noReplace) => {
        let tile = KinkyDungeonTilesGet(x + "," + y);
        if (tile) {
            let tU = KinkyDungeonTilesGet(x + "," + (y - 1));
            let tD = KinkyDungeonTilesGet(x + "," + (y + 1));
            let tR = KinkyDungeonTilesGet((x + 1) + "," + y);
            let tL = KinkyDungeonTilesGet((x - 1) + "," + y);
            let sprite = "";
            if (tile.DY == -1) {
                if (tD?.DY == -1)
                    return "Conveyor/SafetyUp";
                if (tL?.DX == 1 && tR?.DX == -1)
                    sprite = sprite + "LeftRight";
                else if (tL?.DX == 1)
                    sprite = sprite + "Right";
                else if (tR?.DX == -1)
                    sprite = sprite + "Left";
                sprite = sprite + "Up";
            }
            else if (tile.DY == 1) {
                if (tU?.DY == 1)
                    return "Conveyor/SafetyDown";
                if (tL?.DX == 1 && tR?.DX == -1)
                    sprite = sprite + "LeftRight";
                else if (tL?.DX == 1 && !(tR?.DX == -1))
                    sprite = sprite + "Right";
                else if (tR?.DX == -1 && !(tL?.DX == 1))
                    sprite = sprite + "Left";
                sprite = sprite + "Down";
            }
            else if (tile.DX == 1) {
                if (tU?.DY == 1 && tD?.DY == -1)
                    sprite = sprite + "UpDown";
                else if (tU?.DY == 1)
                    sprite = sprite + "Down";
                else if (tD?.DY == -1)
                    sprite = sprite + "Up";
                sprite = sprite + "Right";
            }
            else if (tile.DX == -1) {
                if (tU?.DY == 1 && tD?.DY == -1)
                    sprite = sprite + "UpDown";
                else if (tU?.DY == 1)
                    sprite = sprite + "Down";
                else if (tD?.DY == -1)
                    sprite = sprite + "Up";
                sprite = sprite + "Left";
            }
            return "Conveyor/Safety" + sprite;
        }
        return "Conveyor/Conveyor";
    },
    "t": (_x, _y, _Fog, _noReplace) => {
        return "DollTerminal";
    },
    "u": (_x, _y, _Fog, _noReplace) => {
        return "DollSupply";
    },
    "N": (x, y, _Fog, _noReplace) => {
        let tile = KinkyDungeonTilesGet(x + ',' + y);
        let tileAbove = KinkyDungeonMapGet(x, y - 1);
        let tileBelow = KinkyDungeonMapGet(x, y + 1);
        if ((tileAbove == 'V' || tileAbove == 'v') && KinkyDungeonTilesGet(x + "," + (y - 1))?.DY == 1) {
            return `BondageMachine/${tile.Binding || "Latex"}Vert`;
        }
        else if ((tileBelow == 'V' || tileBelow == 'v') && KinkyDungeonTilesGet(x + "," + (y + 1))?.DY == -1) {
            return `BondageMachine/${tile.Binding || "Latex"}Vert`;
        }
        return `BondageMachine/${tile.Binding || "Latex"}Horiz`;
    },
    "D": (x, y, Fog, noReplace) => {
        let ds = KinkyDungeonTilesGet(x + "," + y)?.DoorSkin;
        if (ds) {
            if (Fog) {
                if (KDMapData.TilesMemory[x + "," + y])
                    return KDMapData.TilesMemory[x + "," + y];
            }
            if (KDWallVertBoth(x, y, noReplace))
                KDMapData.TilesMemory[x + "," + y] = ds + (KDChainablePillar.includes(KinkyDungeonMapGet(x, y - 1)) ? "DoorVertCont" : "DoorVert");
            else
                KDMapData.TilesMemory[x + "," + y] = ds + "Door";
            return KDMapData.TilesMemory[x + "," + y];
        }
        return "";
    },
    "d": (x, y, Fog, noReplace) => {
        let ds = KinkyDungeonTilesGet(x + "," + y)?.DoorSkin;
        if (ds) {
            if (Fog) {
                if (KDMapData.TilesMemory[x + "," + y])
                    return KDMapData.TilesMemory[x + "," + y];
            }
            if (KDWallVertBoth(x, y, noReplace))
                KDMapData.TilesMemory[x + "," + y] = ds + (KDChainablePillar.includes(KinkyDungeonMapGet(x, y - 1)) ? "DoorVertOpenCont" : "DoorVertOpen");
            else
                KDMapData.TilesMemory[x + "," + y] = ds + "DoorOpen";
            return KDMapData.TilesMemory[x + "," + y];
        }
        return "";
    },
};
const KDOverlays2 = {
    "V": (x, y, _Fog, _noReplace) => {
        let tile = KinkyDungeonTilesGet(x + "," + y);
        if (tile && tile.SwitchMode != undefined) {
            let sprite = "";
            if (tile.DY == -1) {
                sprite = sprite + "Up";
            }
            else if (tile.DY == 1) {
                sprite = sprite + "Down";
            }
            else if (tile.DX == 1) {
                sprite = sprite + "Right";
            }
            else if (tile.DX == -1) {
                sprite = sprite + "Left";
            }
            if (tile.SwitchMode)
                sprite = sprite + tile.SwitchMode;
            return "Conveyor/" + sprite;
        }
        return "";
    },
    "v": (x, y, _Fog, _noReplace) => {
        let tile = KinkyDungeonTilesGet(x + "," + y);
        if (tile && tile.SwitchMode != undefined) {
            let sprite = "";
            if (tile.DY == -1) {
                sprite = sprite + "Up";
            }
            else if (tile.DY == 1) {
                sprite = sprite + "Down";
            }
            else if (tile.DX == 1) {
                sprite = sprite + "Right";
            }
            else if (tile.DX == -1) {
                sprite = sprite + "Left";
            }
            if (tile.SwitchMode)
                sprite = sprite + tile.SwitchMode;
            return "Conveyor/Safety" + sprite;
        }
        return "";
    },
    "W": (_x, _y, _Fog, _noReplace) => {
        return "WaterFoam";
    },
};
function KinkyDungeonGetSprite(code, x, y, Fog, noReplace) {
    let sprite = "Floor";
    if (KDSprites[code])
        sprite = KDSprites[code](x, y, Fog, noReplace);
    return sprite;
}
function KinkyDungeonGetSpriteOverlay2(code, x, y, Fog, noReplace) {
    let sprite = "";
    if (KDOverlays2[code])
        sprite = KDOverlays2[code](x, y, Fog, noReplace);
    if (KinkyDungeonTilesGet(x + "," + y) && KinkyDungeonTilesGet(x + "," + y).Skin2) {
        sprite = KinkyDungeonTilesGet(x + "," + y).Skin2;
    }
    return sprite;
}
function KinkyDungeonGetSpriteOverlay(code, x, y, Fog, noReplace) {
    let sprite = "";
    if (KDOverlays[code])
        sprite = KDOverlays[code](x, y, Fog, noReplace);
    if (KinkyDungeonTilesGet(x + "," + y) && KinkyDungeonTilesGet(x + "," + y).Skin) {
        sprite = KinkyDungeonTilesGet(x + "," + y).Skin;
    }
    return sprite;
}
let KDSpecialChests = {
    "silver": "ChestSilver",
    "shadow": "ChestShadow",
    "lessershadow": "ChestShadow",
    "kitty": "Chests/Kitty",
    "robot": "Chests/Robot",
};
let KDLastKeyTime = {};
function KDDoModalX(_bdata) {
    KinkyDungeonTargetTile = null;
    KinkyDungeonTargetTileLocation = "";
    KDModalArea = false;
    KDPlayerSetPose = false;
}
function KDGetSpellRange(spell) {
    let data = {
        spell: spell,
        range: spell?.range || 0,
    };
    KinkyDungeonSendEvent("calcSpellRange", data);
    return data.range;
}
function KinkyDungeonDrawPlayerNameInMenus() {
    if (KDGameData.PlayerName) {
        DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, KDBaseWhite, KDTextGray0, 32, "center", 20);
    }
    if (KDPlayerTitlesEnabled) {
        if (KDGameData.currentTitle) {
            if (KDGameData.currentTitle == "Auto") {
                DrawTextFitKD(TextGet(`KDPlayerTitle_${KDGameData.currentTitleAuto}`), 250, 57, 480, KDPlayerTitles[KDGameData.currentTitleAuto]?.color ? KDPlayerTitles[KDGameData.currentTitleAuto]?.color : KDBaseWhite, KDTextGray0, 32, "center", 20);
            }
            else if (KDGameData.currentTitle != "None") {
                DrawTextFitKD(TextGet(`KDPlayerTitle_${KDGameData.currentTitle}`), 250, 57, 480, KDPlayerTitles[KDGameData.currentTitle]?.color ? KDPlayerTitles[KDGameData.currentTitle]?.color : KDBaseWhite, KDTextGray0, 32, "center", 20);
            }
        }
    }
}
let KDAutowait_Slow = 25;
let KDAutowait_Med = 50;
let KDAutowait_Fast = 75;
let KDAutowait_Max = 200;
let KDHypnoAngle = KDRandom();
let KDHypnoTime = 6;
let KDHypnoWaveTime = 10;
let KDHypnoIntensity = 3;
function KinkyDungeonDrawGame() {
    KDCurrentEnemyTooltip = null;
    KinkyDungeonGridSizeDisplay = 72 + KDZoomLevels[KDZoomIndex] * 12;
    if (KDModalArea && KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game") {
        let w = 34;
        let h = 33;
        DrawButtonKDEx("modalX", (bdata) => {
            KDDoModalX(bdata);
            return true;
        }, true, KDModalArea_x + KDModalArea_width - w - 1, KDModalArea_y, w, h, "", KDBaseWhite, KinkyDungeonRootDirectory + "UI/Xgold.png", undefined, undefined, true);
    }
    if (StandalonePatched)
        kdoutlinefilter.alpha = 0.5 + 0.1 * Math.sin(2 * Math.PI * (CommonTime() % 2000 / 2000));
    ;
    let tooltips = [];
    if (KDPatched && KinkyDungeonDrawState == "Restart") {
        DrawTextFitKD(TextGet("KinkyDungeon") + " v" + TextGet("KDVersionStr"), 1990, 50, 200, KDBaseWhite, KDTextGray2, undefined, "right");
    }
    KDDrawMinimap(1990 - KDMinimapWCurrent, 25);
    KDDrawPartyMembers(500 + ((KDToggles.BuffSide && !KDToggleShowAllBuffs) ? 60 : 0), 500 + ((KDToggles.BuffSide && KDToggleShowAllBuffs) ? 175 : 0), tooltips);
    if (StandalonePatched)
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;
    let wt = 50;
    if (KinkyDungeonAutoWait) {
        if (KDGameData.FocusControlToggle.AutoWaitSlow)
            wt = KDAutowait_Slow;
        else if (KDGameData.FocusControlToggle.AutoWaitNormal)
            wt = KDAutowait_Med;
        else if (KDGameData.FocusControlToggle.AutoWaitFast)
            wt = KDAutowait_Fast;
        else if (KDGameData.FocusControlToggle.AutoWaitVeryFast)
            wt = KDAutowait_Max;
    }
    if (!KDGameData.LastSave)
        KDGameData.LastSave = KinkyDungeonCurrentTick;
    if (KinkyDungeonCurrentTick > KDGameData.LastSave + wt && KinkyDungeonStatsChoice.get("saveMode")
        && !KDSaveBusy) {
        KDGameData.LastSave = KinkyDungeonCurrentTick;
        KinkyDungeonSaveGame();
    }
    if (KDRefresh) {
        CharacterRefresh(KinkyDungeonPlayer);
    }
    KDNaked = false;
    KDRefresh = false;
    KinkyDungeonCapStats();
    if (KDHoverTypes.includes(KDCurrentHoverBox?.Hover?.type)) {
        KDHoverFunctions[KDCurrentHoverBox?.Hover?.type](KDCurrentHoverBox);
    }
    if (KDContextMenu && KDCurrentHoverButton?.contextMenu) {
        KDDrawGameContextMenu[KDCurrentHoverButton.contextMenu](true, MouseX, MouseY);
    }
    else if (KDContextMenu && KDDrawGameContextMenu[KinkyDungeonDrawState]) {
        KDDrawGameContextMenu[KinkyDungeonDrawState](true, MouseX, MouseY);
    }
    KinkyDungeonDrawDelta = Math.min(CommonTime() - KinkyDungeonLastDraw, KinkyDungeonLastDraw - KinkyDungeonLastDraw2);
    KinkyDungeonLastDraw2 = KinkyDungeonLastDraw;
    KinkyDungeonLastDraw = CommonTime();
    if (!(KinkyDungeonDrawState == "MagicSpells")) {
        KDSwapSpell = -1;
    }
    if (KinkyDungeonDrawState == "Game") {
        let tooltip = "";
        if ((KinkyDungeonIsPlayer() || (KinkyDungeonGameData && CommonTime() < KinkyDungeonNextDataLastTimeReceived + KinkyDungeonNextDataLastTimeReceivedTimeout))) {
            KinkyDungeonUpdateVisualPosition(KinkyDungeonPlayerEntity, KinkyDungeonDrawDelta);
            if (!KinkyDungeonInspect) {
                KDInspectCamera.x = KinkyDungeonPlayerEntity.x;
                KDInspectCamera.y = KinkyDungeonPlayerEntity.y;
            }
            let OX = KDInspectCamera.x - (KinkyDungeonPlayerEntity.x || 0);
            let OY = KDInspectCamera.y - (KinkyDungeonPlayerEntity.y || 0);
            let CamX = KinkyDungeonPlayerEntity.x - (KDToggles.Center ? 0 : Math.ceil(KinkyDungeonGridWidthDisplay / 36)) - Math.floor(KinkyDungeonGridWidthDisplay / 2) + OX;
            let CamY = KinkyDungeonPlayerEntity.y - Math.floor(KinkyDungeonGridHeightDisplay / 2) + OY;
            let CamX_offsetVis = (KinkyDungeonInspect ? KDInspectCamera.x : KinkyDungeonPlayerEntity.visual_x)
                - (KDToggles.Center ? 0 : Math.ceil(KinkyDungeonGridWidthDisplay / 36)) - Math.floor(KinkyDungeonGridWidthDisplay / 2) - CamX;
            let CamY_offsetVis = (KinkyDungeonInspect ? KDInspectCamera.y : KinkyDungeonPlayerEntity.visual_y) - Math.floor(KinkyDungeonGridHeightDisplay / 2) - CamY;
            if (KinkyDungeonFlags.get("Hypnosis") && KDToggles.HypnoOverlay) {
                let hypnosis = KDEntityBuffedStat(KDPlayer(), "Hypnosis");
                KDHypnoAngle = KDHypnoAngle + Math.PI * 2 * KinkyDungeonDrawDelta * 0.001 / (KDHypnoTime);
                if (KDHypnoAngle > Math.PI * 2)
                    KDHypnoAngle -= Math.PI * 2;
                let length = KDHypnoIntensity * 0.01 * hypnosis * Math.sin(((0.001 * CommonTime()) * (Math.PI * 2 / KDHypnoWaveTime)) % (Math.PI * 2))
                    / KinkyDungeonGridWidthDisplay;
                CamX_offsetVis += Math.cos(KDHypnoAngle) * length;
                CamY_offsetVis += Math.sin(KDHypnoAngle) * length;
            }
            KinkyDungeonCamXVis = CamX + CamX_offsetVis;
            KinkyDungeonCamYVis = CamY + CamY_offsetVis;
            if (CamX_offsetVis || CamY_offsetVis) {
                KDRedrawFog = 2;
            }
            if (StandalonePatched) {
                kdgameboard.x = (-CamX_offsetVis) * KinkyDungeonGridSizeDisplay;
                kdgameboard.y = (-CamY_offsetVis) * KinkyDungeonGridSizeDisplay;
                kdbrightnessmapGFX.x = (-CamX_offsetVis) * KinkyDungeonGridSizeDisplay;
                kdbrightnessmapGFX.y = (-CamY_offsetVis) * KinkyDungeonGridSizeDisplay;
                kdlightmapGFX.x = (-CamX_offsetVis) * KinkyDungeonGridSizeDisplay;
                kdlightmapGFX.y = (-CamY_offsetVis) * KinkyDungeonGridSizeDisplay;
                kdenemystatusboard.x = kdgameboard.x;
                kdenemystatusboard.y = kdgameboard.y;
                kdenemydialoguecanvas.x = kdgameboard.x;
                kdenemydialoguecanvas.y = kdgameboard.y;
            }
            let CamX_offset = (StandalonePatched ? 0 : CamX_offsetVis);
            let CamY_offset = (StandalonePatched ? 0 : CamY_offsetVis);
            KinkyDungeonCamXLast = KinkyDungeonCamX;
            KinkyDungeonCamYLast = KinkyDungeonCamY;
            KinkyDungeonCamX = CamX;
            KinkyDungeonCamY = CamY;
            let KinkyDungeonForceRender = "";
            let data = {
                CamX: CamX,
                CamY: CamY,
                CamX_offsetVis: CamX_offsetVis,
                CamY_offsetVis: CamY_offsetVis,
                delta: KDDrawDelta,
                tooltips: tooltips,
            };
            KinkyDungeonSetMoveDirection();
            if (KinkyDungeonCanvas) {
                KinkyDungeonContext.fillStyle = "rgba(0,0,0.0,1.0)";
                KinkyDungeonContext.fillRect(0, 0, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height);
                KinkyDungeonContext.fill();
                let spriteRes = KDDrawMap(CamX, CamY, CamX_offset, CamY_offset, CamX_offsetVis, CamY_offsetVis, KDDebugOverlay);
                if (KinkyDungeonUpdateLightGrid) {
                    KDUpdateFog = true;
                    KDUpdateVision(CamX, CamY, CamX_offset, CamY_offset);
                }
                let CamPos = { x: CamX, y: CamY };
                if (CamPos.x != KDLastCamPos.x || CamPos.y != KDLastCamPos.y)
                    KDUpdateFog = true;
                KDLastCamPos = CamPos;
                KDDrawFog(CamX, CamY, CamX_offset, CamY_offset, CamX_offsetVis, CamY_offsetVis);
                tooltip = spriteRes.tooltip;
                KinkyDungeonForceRender = spriteRes.KinkyDungeonForceRender;
                KDDrawEffectTiles(canvasOffsetX, canvasOffsetY, CamX + CamX_offset, CamY + CamY_offset);
                if (KDToggles.PlayerAura && (KDToggles.ForceWarnings || KDMouseInPlayableArea() || KDMousePlayableAreaStatusFade)) {
                    let aura_scale = 0;
                    let aura_scale_max = 0;
                    for (let b of Object.values(KinkyDungeonPlayerBuffs)) {
                        if (b && b.aura && b.duration > 0) {
                            aura_scale_max += 1;
                        }
                    }
                    let alpha = 1;
                    if (aura_scale_max > 0) {
                        let buffs = Object.values(KinkyDungeonPlayerBuffs);
                        buffs = buffs.sort((a, b) => { return b.duration - a.duration; });
                        for (let b of buffs) {
                            if (b && b.aura && b.duration > 0 && !(b.auraSprite == "Null")) {
                                aura_scale += 1 / aura_scale_max;
                                let s = aura_scale;
                                if (KinkyDungeonSelectedBuffEntity == KDPlayer() && b.id == KinkyDungeonSelectedBuff) {
                                    alpha = (((((performance.now() * (KDAnimSpeed)) % (2000)) > ((performance.now() * (KDAnimSpeed || 0.25)) % 1000)) ? (1.0 - ((performance.now() * (KDAnimSpeed || 0.25)) % 1000 / 1000)) : ((performance.now() * (KDAnimSpeed || 0.25)) % 1000 / 1000)) + 0.3);
                                }
                                if (b.noAuraColor) {
                                    KDDraw(kdstatusboard, kdpixisprites, b.id, KinkyDungeonRootDirectory + "Aura/" + (b.auraSprite ? b.auraSprite : "PlayerAura") + ".png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s, KinkyDungeonGridSizeDisplay * (1 + s), KinkyDungeonGridSizeDisplay * (1 + s), undefined, {
                                        zIndex: 2.1,
                                        alpha: alpha,
                                    });
                                }
                                else {
                                    KDDraw(kdstatusboard, kdpixisprites, b.id, KinkyDungeonRootDirectory + "Aura/" + (b.auraSprite ? b.auraSprite : "PlayerAura") + ".png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay - 0.5 * KinkyDungeonGridSizeDisplay * s, KinkyDungeonGridSizeDisplay * (1 + s), KinkyDungeonGridSizeDisplay * (1 + s), undefined, {
                                        tint: string2hex(b.aura),
                                        zIndex: 2.1,
                                        alpha: alpha,
                                    });
                                }
                            }
                        }
                    }
                }
                KinkyDungeonDrawItems(canvasOffsetX, canvasOffsetY, CamX + CamX_offset, CamY + CamY_offset);
                if (!kdpixitex.get("playertex")) {
                    kdpixitex.set("playertex", PIXI.Texture.from(KinkyDungeonCanvasPlayer));
                }
                let playertex = kdpixitex.get("playertex");
                if (playertex) {
                    KDDraw(kdstatusboard, kdpixisprites, "player", "playertex", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                        zIndex: 0.01,
                    });
                }
                if ((KDGameData.MovePoints < 0 || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowLevel") > 0) && KinkyDungeonSlowLevel < 10) {
                    KDDraw(kdstatusboard, kdpixisprites, "c_slow", KinkyDungeonRootDirectory + "Conditions/Slow.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                }
                if (KinkyDungeonStatBlind > 0) {
                    KDDraw(kdstatusboard, kdpixisprites, "c_stun", KinkyDungeonRootDirectory + "Conditions/Stun.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                }
                if (KinkyDungeonStatFreeze > 0) {
                    KDDraw(kdstatusboard, kdpixisprites, "c_freeze", KinkyDungeonRootDirectory + "Conditions/Freeze.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                }
                if (KinkyDungeonStatBind > 0) {
                    KDDraw(kdstatusboard, kdpixisprites, "c_bind", KinkyDungeonRootDirectory + "Conditions/Bind.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                }
                if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sneak") > 0 || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowDetection") > 0) {
                    KDDraw(kdstatusboard, kdpixisprites, "c_sneak", KinkyDungeonRootDirectory + "Conditions/Sneak.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay - 30 + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                }
                if (KDToggles.PlayerAura && (KDToggles.ForceWarnings || KDMouseInPlayableArea() || KDMousePlayableAreaStatusFade)) {
                    if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackDmg") > 0 || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackAcc") > 0) {
                        KDDraw(kdstatusboard, kdpixisprites, "c_buff", KinkyDungeonRootDirectory + "Conditions/Buff.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                    }
                    if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackDmg") < 0 || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackAcc") < 0) {
                        KDDraw(kdstatusboard, kdpixisprites, "c_dbuff", KinkyDungeonRootDirectory + "Conditions/Debuff.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                    }
                    if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Evasion") > 0) {
                        KDDraw(kdstatusboard, kdpixisprites, "c_eva", KinkyDungeonRootDirectory + "Conditions/EvasionBuff.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                    }
                    if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Block") > 0) {
                        KDDraw(kdstatusboard, kdpixisprites, "c_blk", KinkyDungeonRootDirectory + "Conditions/BlockBuff.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                    }
                    if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellResist") > 0) {
                        KDDraw(kdstatusboard, kdpixisprites, "c_shield", KinkyDungeonRootDirectory + "Conditions/ShieldBuff.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                            zIndex: 0.01,
                        });
                    }
                    else if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellResist") < 0) {
                        KDDraw(kdstatusboard, kdpixisprites, "c_shield", KinkyDungeonRootDirectory + "Conditions/ShieldDeuff.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                            zIndex: 0.01,
                        });
                    }
                    if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Armor") > 0) {
                        KDDraw(kdstatusboard, kdpixisprites, "c_arm", KinkyDungeonRootDirectory + "Conditions/ArmorBuff.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                    }
                    else if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Armor") < 0) {
                        KDDraw(kdstatusboard, kdpixisprites, "c_armd", KinkyDungeonRootDirectory + "Conditions/ArmorDebuff.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                    }
                    if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "DamageAmp") > 0) {
                        KDDraw(kdstatusboard, kdpixisprites, "c_amp", KinkyDungeonRootDirectory + "Conditions/DamageAmp.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                    }
                }
                if (!KDCanAttack()) {
                    KDDraw(kdstatusboard, kdpixisprites, "c_cantAttack", KinkyDungeonRootDirectory + "Conditions/Tired.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay * 0.5 + statusOffset, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                }
                KinkyDungeonDrawFight(canvasOffsetX, canvasOffsetY, CamX + CamX_offset, CamY + CamY_offset);
                KinkyDungeonDrawEnemiesWarning(canvasOffsetX, canvasOffsetY, CamX + CamX_offset, CamY + CamY_offset);
                KinkyDungeonDrawEnemies(canvasOffsetX, canvasOffsetY, CamX + CamX_offset, CamY + CamY_offset);
                KinkyDungeonDrawEnemiesStatus(canvasOffsetX, canvasOffsetY, CamX + CamX_offset, CamY + CamY_offset);
                KDDoStatusFade(KDDrawDelta);
                KinkyDungeonSendEvent("draw", { update: KDDrawUpdate, CamX: CamX, CamY: CamY, CamX_offset: StandalonePatched ? CamX_offsetVis : CamX_offset, CamY_offset: StandalonePatched ? CamY_offsetVis : CamY_offset });
                KDDrawUpdate = 0;
                KinkyDungeonSuppressSprint = false;
                if (!KinkyDungeonMessageToggle && !KDIsAutoAction()
                    && !(KinkyDungeonShowInventory && !KinkyDungeonTargetingSpell) && KinkyDungeonIsPlayer()
                    && KDMouseInPlayableArea()) {
                    if (KinkyDungeonInspect) {
                        KinkyDungeonSetTargetLocation(!KinkyDungeonTargetingSpell && KDToggles.Helper);
                        KDDraw(kdstatusboard, kdpixisprites, "ui_spellreticule", KinkyDungeonRootDirectory + "TargetInspect.png", (KinkyDungeonTargetX - CamX) * KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                            zIndex: 100,
                        });
                    }
                    else if (KDInteracting) {
                        KinkyDungeonSetTargetLocation(!KinkyDungeonTargetingSpell && KDToggles.Helper);
                        KDDraw(kdstatusboard, kdpixisprites, "ui_spellreticule", KinkyDungeonRootDirectory + "UI/Interact.png", (KinkyDungeonTargetX - CamX) * KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                            zIndex: 100,
                        });
                    }
                    else if (KinkyDungeonTargetingSpell) {
                        KinkyDungeonSetTargetLocation(!KinkyDungeonTargetingSpell && KDToggles.Helper);
                        KDDraw(kdstatusboard, kdpixisprites, "ui_spellreticule", KinkyDungeonRootDirectory + "TargetSpell.png", (KinkyDungeonTargetX - CamX) * KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                            zIndex: 100,
                        });
                        let str = "";
                        if (KinkyDungeonTargetingSpellItem) {
                            str = TextGet("KDUsing").replace("${Item}", KDGetItemName(KinkyDungeonTargetingSpellItem));
                        }
                        else if (KinkyDungeonTargetingSpellWeapon) {
                            str = TextGet("KDAiming").replace("${Item}", KDGetItemName(KinkyDungeonTargetingSpellWeapon));
                        }
                        else {
                            str = TextGet("KDCasting").replace("SPNME", TextGet("KinkyDungeonSpell" + KinkyDungeonTargetingSpell.name));
                        }
                        DrawTextKD(str, PIXIWidth / 2 + (KDToggles.Center ? 0 : Math.ceil(KinkyDungeonGridWidthDisplay * 2)), 90, KDBaseLightBlue, undefined, undefined, undefined, 100.1);
                        let spellRange = KDGetSpellRange(KinkyDungeonTargetingSpell) * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "spellRange"));
                        KinkyDungeonSpellValid = KDSpellValid(KinkyDungeonTargetX, KinkyDungeonTargetY, spellRange);
                        if (KDToggles.ShowSpellRange) {
                            for (let X = 0; X < KinkyDungeonGridWidthDisplay; X++) {
                                for (let Y = 0; Y < KinkyDungeonGridHeightDisplay; Y++) {
                                    let XX = X + CamX;
                                    let YY = Y + CamY;
                                    if (KDIsInBounds(XX, YY, 1)) {
                                        if (KDSpellValid(XX, YY, spellRange, true)) {
                                            KDDraw(kdstatusboard, kdpixisprites, XX + "," + YY + "_range", KinkyDungeonRootDirectory + "SpellRange.png", (X) * KinkyDungeonGridSizeDisplay, (Y) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                                                zIndex: 98,
                                                alpha: 0.6,
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        if (KinkyDungeonSpellValid)
                            if (KinkyDungeonTargetingSpell.projectileTargeting === true) {
                                let range = KinkyDungeonTargetingSpell.castRange;
                                if (!range || spellRange > range)
                                    range = spellRange;
                                let dist = Math.sqrt((KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x) * (KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x)
                                    + (KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y) * (KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y));
                                let collision = false;
                                let dt = 1 / Math.sqrt(Math.max(1, Math.max(0.1, KinkyDungeonTargetingSpell.speed || 0)));
                                let bxx = KinkyDungeonMoveDirection.x;
                                let byy = KinkyDungeonMoveDirection.y;
                                let dd = KDistEuclidean(KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x, KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y);
                                if (dd > 0) {
                                    for (let R = 0; R <= Math.max(1, range - 1); R += dt) {
                                        let xx = KDBulletRound(bxx);
                                        let yy = KDBulletRound(byy);
                                        bxx += (KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x) / dd * dt;
                                        byy += (KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y) / dd * dt;
                                        let visible = KinkyDungeonVisionGet(xx + KinkyDungeonPlayerEntity.x, yy + KinkyDungeonPlayerEntity.y) > 0
                                            || KinkyDungeonFogGet(xx + KinkyDungeonPlayerEntity.x, yy + KinkyDungeonPlayerEntity.y) > 0;
                                        if (!KinkyDungeonForceRender) {
                                            let hit = false;
                                            if (visible) {
                                                if (!collision
                                                    && !KinkyDungeonTargetingSpell.passthrough
                                                    && !KinkyDungeonTargetingSpell.piercing
                                                    && !KinkyDungeonOpenObjects.includes(KinkyDungeonMapGet(xx + KinkyDungeonPlayerEntity.x, yy + KinkyDungeonPlayerEntity.y))) {
                                                    collision = true;
                                                    hit = true;
                                                }
                                            }
                                            KDDraw(kdstatusboard, kdpixisprites, xx + "," + yy + "_target" + hit, KinkyDungeonRootDirectory + (collision ? ((!hit && collision) ? "TargetHit2.png" : "TargetHit.png") : (visible ? "Target.png" : "TargetUnknown.png")), (xx + KinkyDungeonPlayerEntity.x - CamX) * KinkyDungeonGridSizeDisplay, (yy + KinkyDungeonPlayerEntity.y - CamY) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                                                zIndex: (!hit && collision) ? 98 : 99,
                                                alpha: (!hit && collision) ? 0.37 : 1
                                            });
                                        }
                                    }
                                }
                            }
                            else if (!KinkyDungeonForceRender) {
                                let rad = KinkyDungeonTargetingSpell.aoe ? KinkyDungeonTargetingSpell.aoe : 0.5;
                                for (let xxx = KinkyDungeonTargetX - Math.ceil(rad); xxx <= KinkyDungeonTargetX + Math.ceil(rad); xxx++)
                                    for (let yyy = KinkyDungeonTargetY - Math.ceil(rad); yyy <= KinkyDungeonTargetY + Math.ceil(rad); yyy++)
                                        if (AOECondition(KinkyDungeonTargetX, KinkyDungeonTargetY, xxx, yyy, rad, KinkyDungeonTargetingSpell.aoetype || "", KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y))
                                            KDDraw(kdstatusboard, kdpixisprites, xxx + "," + yyy + "_target", KinkyDungeonRootDirectory + "Target.png", (xxx - CamX) * KinkyDungeonGridSizeDisplay, (yyy - CamY) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                                                zIndex: 99,
                                            });
                            }
                    }
                    else if ((KinkyDungeonFastMove
                        && !(!KinkyDungeonSuppressSprint && KinkyDungeonToggleAutoSprint && KDCanSprint())
                        && (KinkyDungeonMoveDirection.x != 0 || KinkyDungeonMoveDirection.y != 0))) {
                        KinkyDungeonSetTargetLocation(!KinkyDungeonTargetingSpell && KDToggles.Helper);
                        let allowFog = KDAllowFog();
                        if (KinkyDungeonVisionGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0 || (allowFog && KinkyDungeonFogGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0)
                            || KDistChebyshev(KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x, KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y) < 1.5) {
                            KDDraw(kdstatusboard, kdpixisprites, "ui_movereticule" + KinkyDungeonTargetX + "," + KinkyDungeonTargetY, KinkyDungeonRootDirectory + "Target" + KDGetTargetRetType(KinkyDungeonTargetX, KinkyDungeonTargetY) + ".png", (KinkyDungeonTargetX - CamX) * KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                                zIndex: 100,
                            });
                            if (KinkyDungeonSlowLevel < 10) {
                                let diststart = Math.max(1, Math.round(KinkyDungeonSlowLevel));
                                let dist = diststart;
                                let requireLight = KinkyDungeonVisionGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0;
                                let path = KinkyDungeonFindPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonTargetX, KinkyDungeonTargetY, true, false, false, KDToggles.FastMoveDoors ? KinkyDungeonMovableTilesSmartEnemy : KinkyDungeonMovableTilesEnemy, requireLight, false, true, undefined, false, undefined, false, true, KDToggles.FastMovePassable);
                                if (path?.length > 1) {
                                    dist *= path.length;
                                }
                                if (KDGameData.MovePoints < 0) {
                                    if (path?.length > 1) {
                                        dist -= Math.min(0, KDGameData.MovePoints + 1);
                                    }
                                    else
                                        dist = 1 - KDGameData.MovePoints;
                                }
                                else if (!KDToggles.LazyWalk || KinkyDungeonInDanger()) {
                                    if (path?.length > 1) {
                                        dist -= Math.max(0, diststart - 1);
                                    }
                                    else
                                        dist = 1;
                                }
                                dist = Math.ceil(Math.max(0, dist));
                                DrawTextKD("x" + dist, (KinkyDungeonTargetX - CamX + 0.5) * KinkyDungeonGridSizeDisplay, (KinkyDungeonTargetY - CamY + 0.5) * KinkyDungeonGridSizeDisplay, "#ffaa44");
                                if (path && KDToggles.ShowPath)
                                    for (let p of path) {
                                        if (p.x != KinkyDungeonTargetX || p.y != KinkyDungeonTargetY)
                                            KDDraw(kdstatusboard, kdpixisprites, `ui_movereticule_${p.x},${p.y}`, KinkyDungeonRootDirectory + "UI/PathDisplay.png", (p.x - CamX) * KinkyDungeonGridSizeDisplay, (p.y - CamY) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                                                zIndex: 100,
                                            });
                                    }
                            }
                        }
                    }
                    else if ((mouseDown && KDMouseInPlayableArea()) || (KinkyDungeonMoveDirection.x != 0 || KinkyDungeonMoveDirection.y != 0)) {
                        let xx = KinkyDungeonMoveDirection.x + KinkyDungeonPlayerEntity.x;
                        let yy = KinkyDungeonMoveDirection.y + KinkyDungeonPlayerEntity.y;
                        if (KinkyDungeonSlowLevel < 2 && MouseIn(canvasOffsetX + (xx - CamX) * KinkyDungeonGridSizeDisplay, canvasOffsetY + (yy - CamY) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay)) {
                            KinkyDungeonSuppressSprint = true;
                        }
                        if (!KinkyDungeonSuppressSprint && KinkyDungeonToggleAutoSprint && (KDCanSprint())) {
                            if (KinkyDungeonMoveDirection.x || KinkyDungeonMoveDirection.y) {
                                let newX = KinkyDungeonMoveDirection.x * (KinkyDungeonSlowLevel < 2 ? 2 : 1) + KinkyDungeonPlayerEntity.x;
                                let newY = KinkyDungeonMoveDirection.y * (KinkyDungeonSlowLevel < 2 ? 2 : 1) + KinkyDungeonPlayerEntity.y;
                                let tile = KinkyDungeonMapGet(newX, newY);
                                if (KinkyDungeonMovableTilesEnemy.includes(tile)
                                    && KinkyDungeonNoEnemy(newX, newY)) {
                                    KDDraw(kdstatusboard, kdpixisprites, "ui_movesprint", KinkyDungeonRootDirectory + "Sprint.png", (newX - CamX) * KinkyDungeonGridSizeDisplay, (newY - CamY) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                                        zIndex: 99,
                                    });
                                    DrawTextKD(Math.round(-KDSprintCost() * 10) + "sp", (newX - CamX + 0.5) * KinkyDungeonGridSizeDisplay, (newY - CamY - 0.25) * KinkyDungeonGridSizeDisplay, KDBaseMint, undefined, undefined, undefined, 100.1);
                                    xx = newX;
                                    yy = newY;
                                }
                            }
                        }
                        else if ((KinkyDungeonSlowLevel > 1 || KDGameData.MovePoints < 0) && KinkyDungeonSlowLevel < 10) {
                            if (!KinkyDungeonEnemyAt(xx, yy) || KDCanPassEnemy(KinkyDungeonPlayerEntity, KinkyDungeonEnemyAt(xx, yy))) {
                                let dist = Math.max(1, Math.round(KinkyDungeonSlowLevel));
                                if (KDGameData.MovePoints < 0) {
                                    dist = 1 - KDGameData.MovePoints;
                                }
                                else if (!KDToggles.LazyWalk || KinkyDungeonInDanger())
                                    dist = 1;
                                dist = Math.ceil(Math.max(0, dist));
                                DrawTextKD("x" + dist, (xx - CamX + 0.5) * KinkyDungeonGridSizeDisplay, (yy - CamY + 0.5) * KinkyDungeonGridSizeDisplay, "#ffaa44", undefined, undefined, undefined, 100.1);
                            }
                        }
                        KDDraw(kdstatusboard, kdpixisprites, "ui_movereticule" + KinkyDungeonTargetX + "," + KinkyDungeonTargetY, KinkyDungeonRootDirectory + "Target" + KDGetTargetRetType(xx, yy) + ".png", (xx - CamX) * KinkyDungeonGridSizeDisplay, (yy - CamY) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                            zIndex: 100,
                        });
                    }
                }
                let cursorX = Math.round((MouseX - KinkyDungeonGridSizeDisplay / 2 - canvasOffsetX) / KinkyDungeonGridSizeDisplay) + KinkyDungeonCamX;
                let cursorY = Math.round((MouseY - KinkyDungeonGridSizeDisplay / 2 - canvasOffsetY) / KinkyDungeonGridSizeDisplay) + KinkyDungeonCamY;
                if (NPCTooltipZoomIn) {
                    NPCTooltipZoomIn = false;
                }
                else {
                    NPCTooltipZoomCurrent = Math.max(1, NPCTooltipZoomCurrent - 1.4 * KDDrawDelta * 0.001);
                    if (NPCTooltipZoomX > 0)
                        NPCTooltipZoomX = Math.max(0, NPCTooltipZoomX - 1.4 * KDDrawDelta * 0.001);
                    else if (NPCTooltipZoomX < 0)
                        NPCTooltipZoomX = Math.min(0, NPCTooltipZoomX + 1.4 * KDDrawDelta * 0.001);
                    if (NPCTooltipZoomY > 0)
                        NPCTooltipZoomY = Math.max(0, NPCTooltipZoomY - 1.4 * KDDrawDelta * 0.001);
                    else if (NPCTooltipZoomY < 0)
                        NPCTooltipZoomY = Math.min(0, NPCTooltipZoomY + 1.4 * KDDrawDelta * 0.001);
                }
                if (KDMouseInPlayableArea() && (KinkyDungeonVisionGet(cursorX, cursorY) > 0 || tooltips.length > 0)) {
                    let ambushTile = "";
                    let enemy = KinkyDungeonEnemyAt(cursorX, cursorY);
                    if (enemy && KDCanSeeEnemy(KinkyDungeonEnemyAt(cursorX, cursorY))) {
                        if (!enemy.ambushtrigger && KDAIType[KDGetAI(KinkyDungeonEnemyAt(cursorX, cursorY))]?.ambushtile) {
                            ambushTile = KDAIType[KDGetAI(enemy)].ambushtile;
                            KDShowExtraTooltipCycle = 0;
                            KDShowExtraTooltipMaxCycle = 0;
                        }
                        else {
                            tooltips.push((offset) => KDDrawEnemyTooltip(enemy, offset, true));
                            if (KDToggles.ExtraTooltipCycle
                                && CommonTime() > lastExtraTooltipCycleTimeAuto_Delay + lastExtraTooltipCycleTimeAuto) {
                                lastExtraTooltipCycleTimeAuto = CommonTime();
                                KDShowExtraTooltipCycle = (KDShowExtraTooltipCycle + 1) % (KDShowExtraTooltipMaxCycle + 1);
                            }
                        }
                    }
                    else {
                        KDShowExtraTooltipCycle = 0;
                        KDShowExtraTooltipMaxCycle = 0;
                    }
                    if (!enemy && KDGameData.CurrentDialog) {
                        enemy = KDGetSpeaker(true);
                        if (enemy)
                            tooltips.push((offset) => KDDrawEnemyDialogue(enemy, offset));
                    }
                    let items = KDMapData.GroundItems.filter((item) => { return item.x == cursorX && item.y == cursorY; });
                    if (items.length > 0) {
                        tooltips.push((offset) => KDDrawItemsTooltip(items, offset));
                    }
                    let eTiles = KDGetEffectTiles(cursorX, cursorY);
                    for (let etile of Object.values(eTiles)) {
                        if (KDEffectTileTooltips[etile.name] && KDCanSeeEffectTile(etile)) {
                            tooltips.push((offset) => KDDrawEffectTileTooltip(etile, cursorX, cursorY, offset));
                        }
                    }
                    let tile = ambushTile || KinkyDungeonMapGet(cursorX, cursorY);
                    if (KDTileTooltips[tile] && (KinkyDungeonInspect || KDInteracting || KDTileTooltips[tile](cursorX, cursorY).noInspect)) {
                        tooltips.push((offset) => KDDrawTileTooltip(tile, cursorX, cursorY, offset));
                    }
                }
                else if (KDGameData.CurrentDialog) {
                    let enemy = KDGetSpeaker();
                    if (enemy)
                        tooltips.push((offset) => KDDrawEnemyDialogue(enemy, offset));
                }
                let tooltipOffset = KDFocusControls ? 70 : 0;
                for (let t of tooltips) {
                    tooltipOffset = t(tooltipOffset);
                }
                if (KinkyDungeonFastMoveSuppress) {
                    DrawRectKD(kdcanvas, kdpixisprites, "redborder", {
                        Left: canvasOffsetX,
                        Top: canvasOffsetY,
                        Width: KinkyDungeonCanvas.width,
                        Height: KinkyDungeonCanvas.height,
                        Color: "#ff4444",
                        LineWidth: 2,
                        zIndex: 10,
                    });
                }
                if (KinkyDungeonLastTurnAction == "Struggle" && KinkyDungeonCurrentEscapingItem && KinkyDungeonCurrentEscapingItem.lock) {
                    KDDraw(kdstatusboard, kdpixisprites, "ui_lock", KinkyDungeonRootDirectory + "Lock.png", (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay - 60, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay);
                }
                for (let sprite of kdpixisprites.entries()) {
                    if (!kdSpritesDrawn.has(sprite[0]) && sprite[1] && sprite[1].parent == kdgameboard) {
                        sprite[1].parent.removeChild(sprite[1]);
                        if (kdprimitiveparams.has(sprite[0]))
                            kdprimitiveparams.delete(sprite[0]);
                        kdpixisprites.delete(sprite[0]);
                        delete sprite[1].filters;
                        sprite[1].destroy();
                    }
                }
            }
            if (StandalonePatched) {
                if (KDBGColor) {
                    FillRectKD(kdcanvas, kdpixisprites, "playerbg", {
                        Left: 0,
                        Top: 0,
                        Width: KinkyDungeonDrawState == "Game" ? 500 : 2000,
                        Height: 1000,
                        Color: KDBGColor,
                        zIndex: KinkyDungeonDrawState == "Game" ? -1 : -1000,
                        alpha: StandalonePatched ? KDUIAlpha : 0.01,
                    });
                }
                DrawCharacter(KinkyDungeonPlayer, KDPlayerPos().x, KDPlayerPos().y, KDCharSize, undefined, undefined, undefined, undefined, KinkyDungeonDrawState == "Game" ? KDGamePlayerZIndex : -20, KDToggles.FlipPlayer);
            }
            if (KinkyDungeonSleepiness) {
                CharacterSetFacialExpression(KinkyDungeonPlayer, "Emoticon", "Sleep");
            }
            else
                CharacterSetFacialExpression(KinkyDungeonPlayer, "Emoticon", null);
            let PlayerModel = StandalonePatched ? KDCurrentModels.get(KinkyDungeonPlayer) : null;
            let zoom = KDPlayerZoom(PlayerModel);
            if (KDDrawPlayer)
                KDDrawChibi(PlayerModel.Character, canvasOffsetX
                    + (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay
                    + (KinkyDungeonGridSizeDisplay / 4), canvasOffsetY
                    + (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay
                    + (KinkyDungeonGridSizeDisplay / 6), zoom);
            if ((KDToggles.ShowFacing || KDGetInertia(KDPlayer()) > 0)
                && (KinkyDungeonPlayerEntity.facing_y || KinkyDungeonPlayerEntity.facing_x)) {
                KDDraw(kdstatusboard, kdpixisprites, "ui_playerfacing", KinkyDungeonRootDirectory + "UI/PlayerFacing.png", (KinkyDungeonPlayerEntity.x + KinkyDungeonPlayerEntity.facing_x - CamX + 0.5) * KinkyDungeonGridSizeDisplay, (KinkyDungeonPlayerEntity.y + KinkyDungeonPlayerEntity.facing_y - CamY + 0.5) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, Math.atan2(KinkyDungeonPlayerEntity.facing_y, KinkyDungeonPlayerEntity.facing_x), {
                    zIndex: 100,
                    anchorx: 0.5,
                    anchory: 0.5,
                });
            }
            KinkyDungeonDrawEnemiesHP(KDDrawDelta || 0, canvasOffsetX, canvasOffsetY, CamX + CamX_offset, CamY + CamY_offset, StandalonePatched ? CamX_offsetVis : 0, StandalonePatched ? CamY_offsetVis : 0);
            KinkyDungeonDrawFloaters(CamX + CamX_offsetVis, CamY + CamY_offsetVis);
            if (KinkyDungeonCanvas) {
                if (KDToggles.ForceWarnings || KDMouseInPlayableArea() || KDMousePlayableAreaStatusFade) {
                    let barInt = 0;
                    if (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax * 0.99) {
                        if (KinkyDungeonStatStamina != undefined && !(KinkyDungeonPlayerEntity.visual_stamina == KinkyDungeonStatStamina)) {
                            KinkyDungeonPlayerEntity.visual_stamina = KDEaseValue(KDDrawDelta || 0, (KinkyDungeonPlayerEntity.visual_stamina != undefined ? KinkyDungeonPlayerEntity.visual_stamina : KinkyDungeonStatStaminaMax), KinkyDungeonStatStamina, KDBarAdvanceRate, KDBarAdvanceRateMin * KinkyDungeonStatStaminaMax);
                        }
                        KinkyDungeonBarTo(kdenemystatusboard, canvasOffsetX + (KinkyDungeonPlayerEntity.visual_x - CamX) * KinkyDungeonGridSizeDisplay, canvasOffsetY + (KinkyDungeonPlayerEntity.visual_y - CamY) * KinkyDungeonGridSizeDisplay - 12 - 13 * barInt, KinkyDungeonGridSizeDisplay, 8, 100 * KinkyDungeonPlayerEntity.visual_stamina / KinkyDungeonStatStaminaMax, !KDCanAttack() ? KDBaseRed : "#44ff44", KDTextGray0);
                        barInt += 1;
                    }
                    if (KinkyDungeonStatMana < KinkyDungeonStatManaMax * 0.99 || KinkyDungeonTargetingSpell || KDFlashMana > 0) {
                        KDFlashMana = Math.max(0, KDFlashMana - KDDrawDelta);
                        if (KinkyDungeonStatMana != undefined && !(KinkyDungeonPlayerEntity.visual_mana == KinkyDungeonStatMana)) {
                            KinkyDungeonPlayerEntity.visual_mana = KDEaseValue(KDDrawDelta || 0, (KinkyDungeonPlayerEntity.visual_mana != undefined ? KinkyDungeonPlayerEntity.visual_mana : KinkyDungeonStatManaMax), KinkyDungeonStatMana, KDBarAdvanceRate, KDBarAdvanceRateMin * KinkyDungeonStatManaMax);
                        }
                        KinkyDungeonBarTo(kdenemystatusboard, canvasOffsetX + (KinkyDungeonPlayerEntity.visual_x - CamX) * KinkyDungeonGridSizeDisplay, canvasOffsetY + (KinkyDungeonPlayerEntity.visual_y - CamY) * KinkyDungeonGridSizeDisplay - 12 - 13 * barInt, KinkyDungeonGridSizeDisplay, 8, 100 * KinkyDungeonPlayerEntity.visual_mana / KinkyDungeonStatManaMax, (KDFlashMana > 0 || (KinkyDungeonTargetingSpell && KinkyDungeonStatMana <
                            KinkyDungeonGetManaCost(KinkyDungeonTargetingSpell, !KinkyDungeonTargetingSpell.active && KinkyDungeonTargetingSpell.passive, !KinkyDungeonTargetingSpell.active && KinkyDungeonTargetingSpell.type == "passive"))) ?
                            (KDFlashMana % 500 > 250 ? KDBaseWhite : "#888888") : KDBaseLightBlue, (KDFlashMana % 500 > 250 ? "#444444" : KDTextGray0));
                        barInt += 1;
                    }
                }
                if (KinkyDungeonCurrentEscapingItem && KinkyDungeonFlags.get("escaping")) {
                    let item = KinkyDungeonCurrentEscapingItem;
                    let value = 0;
                    let value2 = 0;
                    let color = "#ecebe7";
                    let color2 = KDBaseRed;
                    if (KinkyDungeonCurrentEscapingMethod == "Struggle") {
                        if (item.struggleProgress)
                            value = item.struggleProgress;
                        if (item.cutProgress)
                            value2 = item.cutProgress;
                    }
                    else if (KinkyDungeonCurrentEscapingMethod == "Pick" && item.pickProgress) {
                        value = item.pickProgress;
                        color = "#ceaaed";
                    }
                    else if (KinkyDungeonCurrentEscapingMethod == "Remove") {
                        if (item.struggleProgress)
                            value = item.struggleProgress;
                        if (item.cutProgress)
                            value2 = item.cutProgress;
                    }
                    else if (KinkyDungeonCurrentEscapingMethod == "Cut") {
                        if (item.struggleProgress)
                            value = item.struggleProgress;
                        if (item.cutProgress)
                            value2 = item.cutProgress;
                    }
                    else if (KinkyDungeonCurrentEscapingMethod == "Unlock" && item.unlockProgress) {
                        value = item.unlockProgress;
                        color = "#d0ffea";
                    }
                    let xAdd = 0;
                    let yAdd = 0;
                    if (KinkyDungeonStruggleTime > CommonTime()) {
                        xAdd = Math.round(-1 + 2 * Math.random());
                        yAdd = Math.round(-1 + 2 * Math.random());
                    }
                    if (value <= 1)
                        KinkyDungeonBar(canvasOffsetX + xAdd + (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, canvasOffsetY + yAdd + (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset) * KinkyDungeonGridSizeDisplay - 24, KinkyDungeonGridSizeDisplay, 12, Math.max(7, Math.min(100, 100 * (value + value2))), color, KDTextGray0);
                    if (value2 && value <= 1) {
                        KinkyDungeonBar(canvasOffsetX + xAdd + (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay, canvasOffsetY + yAdd + (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offset) * KinkyDungeonGridSizeDisplay - 24, KinkyDungeonGridSizeDisplay, 12, Math.max(7, 100 * value2), color2, "none");
                    }
                }
                KinkyDungeonDrawTethers(CamX + CamX_offset, CamY + CamY_offset);
                if (tooltip && KDMouseInPlayableArea()) {
                    DrawTextFitKD(tooltip, MouseX, MouseY - KinkyDungeonGridSizeDisplay / 2, 200, KDBaseWhite, KDTextGray2);
                }
            }
            if (KinkyDungeonPlayerEntity.dialogue) {
                let yboost = 0;
                let xx = canvasOffsetX + (KinkyDungeonPlayerEntity.visual_x - CamX - CamX_offsetVis) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2;
                let yy = yboost + canvasOffsetY + (KinkyDungeonPlayerEntity.visual_y - CamY - CamY_offsetVis) * KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay / 2;
                DrawTextFitKDTo(kddialoguecanvas, KinkyDungeonPlayerEntity.dialogue, xx, yy, 700, KinkyDungeonPlayerEntity.dialogueColor, KDTextGray0, 24, undefined, undefined, (KDFloaterGridCache[Math.round(KDFloaterGridRes * xx / PIXIWidth)
                    + "," + Math.round(KDFloaterGridRes * yy / PIXIHeight)]) ? KDFloaterGridWipedOutAlpha : undefined);
            }
            let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
            if (altType?.drawscript) {
                altType.drawscript(KDDrawDelta, CamX, CamY, CamX_offsetVis, CamY_offsetVis);
            }
            if (!KDModalArea) {
                KDModalArea_x = 600;
                KDModalArea_y = 700;
                KDModalArea_width = 800;
                KDModalArea_height = 100;
            }
            KinkyDungeonDrawInterface(KinkyDungeonIsPlayer());
            if (KDGameData.CurrentDialog) {
                KDDrawDialogue(KinkyDungeonDrawDelta);
            }
            if (!KinkyDungeonTargetingSpell)
                KinkyDungeonDrawMessages();
            if (KDShowQuickInv()) {
                KinkyDungeonDrawQuickInv();
            }
            KinkyDungeonSendEvent("afterDrawFrame", data);
        }
    }
    else {
        if (KDCustomDraw[KinkyDungeonDrawState]) {
            KDCustomDraw[KinkyDungeonDrawState]();
        }
        else if (KinkyDungeonDrawState == "Orb") {
            KinkyDungeonDrawOrb();
            KinkyDungeonDrawPlayerNameInMenus();
        }
        else if (KinkyDungeonDrawState == "PerkOrb") {
            KinkyDungeonDrawPerkOrb();
            KinkyDungeonDrawPlayerNameInMenus();
        }
        else if (KinkyDungeonDrawState == "Heart") {
            KinkyDungeonDrawHeart();
            KinkyDungeonDrawPlayerNameInMenus();
        }
        else if (KinkyDungeonDrawState == "Magic") {
            KDDrawNavBar(-2);
            KinkyDungeonDrawPlayerNameInMenus();
            KinkyDungeonDrawMagic();
        }
        else if (KinkyDungeonDrawState == "MagicSpells") {
            KDDrawNavBar(2);
            KinkyDungeonDrawPlayerNameInMenus();
            KinkyDungeonDrawMagicSpells();
        }
        else if (KinkyDungeonDrawState == "Inventory") {
            KDDrawNavBar(1);
            KinkyDungeonDrawPlayerNameInMenus();
            KinkyDungeonDrawInventory();
        }
        else if (KinkyDungeonDrawState == "Logbook") {
            KDDrawNavBar(3);
            KinkyDungeonDrawPlayerNameInMenus();
            KinkyDungeonDrawLore();
        }
        else if (KinkyDungeonDrawState == "Quest") {
            KDDrawNavBar(3);
            KinkyDungeonDrawPlayerNameInMenus();
            KinkyDungeonDrawQuest();
        }
        else if (KinkyDungeonDrawState == "Titles") {
            KDDrawNavBar(3);
            KinkyDungeonDrawPlayerNameInMenus();
            KinkyDungeonDrawTitles();
        }
        else if (KinkyDungeonDrawState == "Collection") {
            KDDrawNavBar(4);
            KinkyDungeonDrawPlayerNameInMenus();
            KinkyDungeonDrawCollection();
        }
        else if (KinkyDungeonDrawState == "Facilities") {
            KDDrawNavBar(4);
            KinkyDungeonDrawPlayerNameInMenus();
            KinkyDungeonDrawFacilities();
        }
        else if (KinkyDungeonDrawState == "Progress") {
            KDDrawNavBar(1);
            KinkyDungeonDrawPlayerNameInMenus();
            KinkyDungeonDrawProgress();
        }
        else if (KinkyDungeonDrawState == "Container" && KDUI_CurrentContainer) {
            KDDrawNavBar(1);
            KinkyDungeonDrawPlayerNameInMenus();
            KDDrawContainer(KDUI_CurrentContainer, undefined, KDGameData.Containers[KDUI_CurrentContainer]?.filters, KDValidateContainer(KDGameData.Containers[KDUI_CurrentContainer]));
        }
        else if (KinkyDungeonDrawState == "Reputation") {
            KDDrawNavBar(3);
            KinkyDungeonDrawPlayerNameInMenus();
            KinkyDungeonDrawReputation();
        }
        else if (KinkyDungeonDrawState == "Restart") {
            KDDrawNavBar(0);
            if (TestMode) {
                DrawCheckboxVis(600, 20, 64, 64, "Debug Mode", KDDebugMode, false, KDBaseWhite);
                if (KDDebugMode) {
                    ElementPosition("DebugItem", 1650, 212, 300, 64);
                    ElementPosition("DebugEnemy", 1650, 52, 300, 64);
                    let Di = ElementValue("DebugItem");
                    let De = ElementValue("DebugEnemy");
                    let dd = 30;
                    let i = 0;
                    for (let r of KinkyDungeonRestraints) {
                        if (i * dd < 1200 && r.name.includes(Di)) {
                            DrawTextFitKD(r.name, 0, 15 + i * dd, 200, KDBaseWhite, KDTextGray0, undefined, "left");
                            i++;
                        }
                    }
                    i = 0;
                    for (let r of Object.values(KinkyDungeonConsumables)) {
                        if (i * dd < 1200 && r.name.includes(Di)) {
                            DrawTextFitKD(r.name, 200, 15 + i * dd, 200, KDBaseLightBlue, KDTextGray0, undefined, "left");
                            i++;
                        }
                    }
                    i = 0;
                    for (let r of KinkyDungeonEnemies) {
                        if (i * dd < 1200 && r.name.includes(De)) {
                            DrawTextFitKD(r.name, 400, 15 + i * dd, 200, KDBaseRed, KDTextGray0);
                            i++;
                        }
                    }
                    i = 0;
                    for (let r of Object.values(KinkyDungeonWeapons)) {
                        if (i * dd < 1200 && r.name.includes(Di)) {
                            DrawTextFitKD(r.name, 1800, 15 + i * dd, 200, "orange", KDTextGray0);
                            i++;
                        }
                    }
                    i = 0;
                    for (let r of KinkyDungeonOutfitsBase) {
                        if (i * dd < 1200 && r.name.includes(Di)) {
                            DrawTextFitKD(r.name, 900, 15 + i * dd, 200, KDBaseLightGreen, KDTextGray0);
                            i++;
                        }
                    }
                    DrawCheckboxVis(1100, 20, 64, 64, "Verbose Console", KDDebug, false, KDBaseWhite);
                    DrawCheckboxVis(1100, 90, 64, 64, "Changeable Perks", KDDebugPerks, false, KDBaseWhite);
                    DrawCheckboxVis(1100, 160, 64, 64, "Unlimited Gold", KDDebugGold, false, KDBaseWhite);
                    DrawCheckboxKDEx("debujgforceadd", () => { KDDebugforceadds = !KDDebugforceadds; return true; }, true, 850, 230, 64, 64, "Forcibly add restraints from inv", KDDebugforceadds, false, KDBaseWhite);
                    DrawCheckboxKDEx("debuglinkunder", () => { KDDebugLink = !KDDebugLink; return true; }, true, 850, 300, 64, 64, "Link Under", KDDebugLink, false, KDBaseWhite);
                    DrawButtonVis(1500, 100, 100, 64, "Enemy", KDBaseWhite, "");
                    DrawButtonVis(1600, 100, 100, 64, "Ally", KDBaseWhite, "");
                    DrawButtonVis(1700, 100, 100, 64, "Shop", KDBaseWhite, "");
                    DrawButtonVis(1500, 260, 300, 64, "Add to inventory", KDBaseWhite, "");
                    DrawButtonKDEx("debugtelestairs", () => {
                        KDMapData.KeyQuota = 0;
                        KDMapData.ChestQuota = 0;
                        for (let enemy of KDMapData.Entities) {
                            if (KDEnemyHasFlag(enemy, "killtarget")) {
                                KinkyDungeonSetEnemyFlag(enemy, "killtarget", 0);
                            }
                        }
                        if (KDMapData.EndPosition.x < 2)
                            KDMapData.EndPosition.x = 2;
                        if (KDMapData.EndPosition.y < 2)
                            KDMapData.EndPosition.x = 2;
                        if (KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(KDMapData.EndPosition.x, KDMapData.EndPosition.y))) {
                            KinkyDungeonMapSet(KDMapData.EndPosition.x, KDMapData.EndPosition.y, 's');
                        }
                        KDMovePlayer(KDMapData.EndPosition.x, KDMapData.EndPosition.y, false);
                        KDMapData.TrapQuota = 0;
                        KDMapData.QuestQuota = 0;
                        KDGameData.DragonCaptured = true;
                        KinkyDungeonSetFlag("BossUnlocked", -1);
                        KinkyDungeonUpdateLightGrid = true;
                        return true;
                    }, true, 1100, 300, 300, 64, "Teleport to stairs", KDBaseWhite, "");
                    DrawButtonVis(1500, 320, 300, 64, "Get save code", KDBaseWhite, "");
                    DrawButtonVis(1100, 370, 300, 64, "Enter parole mode", KDBaseWhite, "");
                    DrawButtonKDEx("debugDefeat", (_bdata) => {
                        console.log("Defeat Enemy...");
                        KinkyDungeonTargetingSpell = KinkyDungeonHandleSpellCast({ name: "debugDefeat",
                            tags: ["metal", "binding", "utility"],
                            sfx: "MagicSlash",
                            school: "Conjure",
                            manacost: 0,
                            components: [],
                            mustTarget: true,
                            level: 1,
                            type: "special", special: "debugDefeat",
                            onhit: "", time: 1, power: 3.5, range: 15, size: 1, damage: "" });
                        KinkyDungeonTargetingSpellItem = null;
                        KinkyDungeonTargetingSpellWeapon = null;
                        KinkyDungeonDrawState = "Game";
                        KDResetAlternateInventoryRender();
                        return true;
                    }, true, 500, 96, 145, 48, "Defeat", KDBaseWhite, "");
                    DrawButtonKDEx("debugBind", (_bdata) => {
                        console.log("Bind Enemy...");
                        KinkyDungeonTargetingSpell = KinkyDungeonHandleSpellCast({ name: "debugBind",
                            tags: ["metal", "binding", "utility"],
                            sfx: "MagicSlash",
                            school: "Conjure",
                            manacost: 0,
                            components: [],
                            mustTarget: true,
                            level: 1,
                            type: "special", special: "debugBind",
                            onhit: "", time: 1, power: 3.5, range: 15, size: 1, damage: "" });
                        KinkyDungeonTargetingSpellItem = null;
                        KinkyDungeonTargetingSpellWeapon = null;
                        KinkyDungeonDrawState = "Game";
                        KDResetAlternateInventoryRender();
                        return true;
                    }, true, 655, 96, 145, 48, "Bind", KDBaseWhite, "");
                    DrawButtonKDEx("debugAddKey", (_bdata) => {
                        KDAddConsumable("Pick", 10);
                        KDAddConsumable("RedKey", 10);
                        KDAddConsumable("BlueKey", 10);
                        return true;
                    }, true, 500, 160, 300, 64, "Add keys and lockpicks", KDBaseWhite, "");
                    DrawButtonKDEx("debugAddVision", (_bdata) => {
                        KinkyDungeonSeeAll = !KinkyDungeonSeeAll;
                        return true;
                    }, true, 500, 240, 300, 64, "Toggle OmniVision™", KDBaseWhite, "");
                    DrawButtonKDEx("debugAddSP", (_bdata) => {
                        KinkyDungeonSpellPoints += 10;
                        return true;
                    }, true, 500, 320, 300, 64, "Add 10 spell points", KDBaseWhite, "");
                    DrawButtonKDEx("debugClearQuickInv", (_bdata) => {
                        KinkyDungeonInventory.get('looserestraint').clear();
                        KinkyDungeonAdvanceTime(0, true);
                        return true;
                    }, true, 500, 400, 300, 64, "Clear loose restraints", KDBaseWhite, "");
                    DrawButtonKDEx("debugClearPlayerInv", (_bdata) => {
                        KinkyDungeonInventory.get('restraint').clear();
                        KinkyDungeonAdvanceTime(0, true);
                        return true;
                    }, true, 500, 480, 300, 64, "Clear worn restraints", KDBaseWhite, "");
                    DrawButtonKDEx("debugVisitStorage", (_bdata) => {
                        KinkyDungeonSetFlag("storageChestOpened", -1);
                        KDGetContainer("PlayerChest", undefined, undefined, true, KDPlayerChestFilters);
                        KDUI_ContainerBackScreen = KinkyDungeonDrawState;
                        KinkyDungeonDrawState = "Container",
                            KinkyDungeonCurrentFilter = "All";
                        KDUI_CurrentContainer = "PlayerChest";
                        return true;
                    }, true, 710, 560, 200, 64, "Open Storage", KDBaseWhite, "");
                    DrawButtonKDEx("debugaddallrest", (_bdata) => {
                        for (let r of KinkyDungeonRestraints) {
                            if (!KinkyDungeonInventoryGetLoose(r.name))
                                KinkyDungeonInventoryAddLoose(r.name);
                        }
                        return true;
                    }, true, 500, 560, 200, 64, "Add all restraints", KDBaseWhite, "");
                    DrawButtonKDEx("debugIncFloor", (_bdata) => {
                        MiniGameKinkyDungeonLevel += 1;
                        KDCurrentWorldSlot.y += 1;
                        KDGameData.JourneyY += 1;
                        KinkyDungeonSendEvent("tickFlags", { delta: 1 });
                        KDTickSpecialStats();
                        return true;
                    }, true, 500, 640, 300, 64, "Increment Floor", KDBaseWhite, "");
                    DrawButtonKDEx("RestSP", (_bdata) => {
                        KDChangeStamina("", "", "", 100);
                        return true;
                    }, true, 500, 720, 145, 48, "Rest SP", KDBaseWhite, "");
                    DrawButtonKDEx("+maxSP", (_bdata) => {
                        KDGameData.StatMaxBonus.SP += 10;
                        return true;
                    }, true, 655, 720, 145, 48, "+Max SP", "#44ff00", "");
                    DrawButtonKDEx("RestMP", (_bdata) => {
                        KDChangeMana("", "", "", 100);
                        return true;
                    }, true, 500, 780, 145, 48, "Rest MP", KDBaseWhite, "");
                    DrawButtonKDEx("+maxMP", (_bdata) => {
                        KDGameData.StatMaxBonus.MP += 10;
                        return true;
                    }, true, 655, 780, 145, 48, "+Max MP", KDBaseBaby, "");
                    DrawButtonKDEx("RestWP", (_bdata) => {
                        KDChangeWill("", "", "", 100);
                        return true;
                    }, true, 500, 840, 145, 48, "Rest WP", KDBaseWhite, "");
                    DrawButtonKDEx("+maxWP", (_bdata) => {
                        KDGameData.StatMaxBonus.WP += 10;
                        return true;
                    }, true, 655, 840, 145, 48, "+Max WP", KDBaseRed, "");
                    DrawButtonKDEx("RestDP", (_bdata) => {
                        KDChangeDistraction("", "", "", -100);
                        KDChangeDesire("", "", "", -100, true);
                        return true;
                    }, true, 500, 900, 145, 48, "Rest DP", KDBaseWhite, "");
                    DrawButtonKDEx("+maxDP", (_bdata) => {
                        KDGameData.StatMaxBonus.AP += 10;
                        return true;
                    }, true, 655, 900, 145, 48, "+Max DP", "#ffaaaa", "");
                }
            }
            DrawTextFitKD(TextGet("KinkyDungeonRestartConfirm"), 1250, 400, 1000, KDBaseWhite, "#333333");
            DrawButtonKDEx("returnbutton", () => {
                KDResetAlternateInventoryRender();
                KinkyDungeonDrawState = "Game";
                KDRefreshCharacter.set(KinkyDungeonPlayer, true);
                KinkyDungeonDressPlayer();
                return true;
            }, true, 975, 550, 550, 64, TextGet("KinkyDungeonRestartNo"), KDBaseWhite, "");
            DrawButtonVis(975, 650, 550, 64, TextGet(KDSaveBusy ? "KDSaveBusy"
                : (KDGameData.CurrentDialog ? "KinkyDungeonRestartQuitInDialogue" : "KinkyDungeonRestartQuitNoErase")), KDBaseWhite, "");
            DrawButtonVis(975, 800, 550, 64, TextGet("KinkyDungeonRestartCapture" + (KDConfirmDeleteSave ? "Confirm" : "")), (KDGameData.PrisonerState == 'jail' || !KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y)) ? "Pink" : KDBaseWhite, "");
            DrawButtonVis(1650, 900, 300, 64, TextGet("KinkyDungeonCheckPerks"), KDBaseWhite, "");
            DrawButtonKDEx("GameToggles", () => {
                KinkyDungeonState = "Toggles";
                KDOptionFilter = "";
                return true;
            }, true, 1265, 450, 260, 64, TextGet("GameToggles"), KDBaseWhite, "");
            DrawButtonKDEx("ConsentToggles", () => {
                KinkyDungeonPreviousState = KinkyDungeonState;
                KinkyDungeonState = "CConsent";
                KDConsentFilter = "";
                return true;
            }, KDCanConsentIngame(), 975, 450, 260, 64, KDCanConsentIngame() ? TextGet("GameConsent") : TextGet("KDConsentMenuLocked"), KDCanConsentIngame() ? KDBaseWhite : KDBaseLightGrey, "");
        }
        else if (KinkyDungeonDrawState == "Perks2") {
            KinkyDungeonDrawPerks(!KDDebugPerks);
            DrawButtonVis(1650, 920, 300, 64, TextGet("KinkyDungeonLoadBack"), KDBaseWhite, "");
            if (!KDClipboardDisabled)
                DrawButtonKDEx("copyperks", (_bdata) => {
                    let txt = "";
                    for (let k of KinkyDungeonStatsChoice.keys()) {
                        if (!k.startsWith("arousal") && !k.endsWith("Mode"))
                            txt += (txt ? "\n" : "") + k;
                    }
                    navigator.clipboard.writeText(txt);
                    return true;
                }, true, 1400, 930, 200, 54, TextGet("KinkyDungeonCopyPerks"), KDBaseWhite, "");
            else {
                let CF = KDTextField("KDCopyPerks", 1400, 930, 200, 54, undefined, undefined, "10000");
                if (CF.Created) {
                    let txt = "";
                    for (let k of KinkyDungeonStatsChoice.keys()) {
                        if (!k.startsWith("arousal") && !k.endsWith("Mode"))
                            txt += (txt ? "|" : "") + k;
                    }
                    ElementValue("KDCopyPerks", txt);
                }
            }
        }
        else if (KDCustomDrawState[KinkyDungeonDrawState]) {
            KDCustomDrawState[KinkyDungeonDrawState]();
        }
        if (KDShouldDrawFloaters())
            KinkyDungeonDrawFloaters(0, 0, true);
    }
    if (KinkyDungeonDrawState == "Game") {
        if (KinkyDungeonFlags.get("PlayerOrgasmFilter")) {
            FillRectKD(kdcanvas, kdpixisprites, "screenoverlayor", {
                Left: 0,
                Top: 0,
                Width: 2000,
                Height: 1000,
                Color: "#B200FF",
                LineWidth: 1,
                zIndex: 1,
                alpha: 0.1,
            });
        }
        else if (KinkyDungeonStatFreeze > 0) {
            FillRectKD(kdcanvas, kdpixisprites, "screenoverlayfr", {
                Left: 0,
                Top: 0,
                Width: 2000,
                Height: 1000,
                Color: "#92e8c0",
                LineWidth: 1,
                zIndex: 1,
                alpha: 0.1,
            });
        }
        else if (KDToggles.StunFlash && (KinkyDungeonFlags.get("playerStun"))) {
            FillRectKD(kdcanvas, kdpixisprites, "screenoverlayst", {
                Left: 0,
                Top: 0,
                Width: 2000,
                Height: 1000,
                Color: "#aaaaaa",
                LineWidth: 1,
                zIndex: 1,
                alpha: 0.07,
            });
        }
        else if (KDToggles.ArousalHearts) {
            KDDrawArousalParticles(KDGameData.OrgasmTurns / KinkyDungeonOrgasmTurnsMax, KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax, (KDGameData.OrgasmStage / KinkyDungeonMaxOrgasmStage));
        }
        KDDrawArousalScreenFilter(0, 1000, 2000, KinkyDungeonStatDistraction * 100 / KinkyDungeonStatDistractionMax);
        if (KDToggles.VibeHearts) {
            KDDrawVibeParticles(KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax);
        }
        KDDrawHypnoOverlay(0, 0, 1);
    }
    if (!KDPatched)
        DrawButtonVis(1885, 25, 90, 90, "", KDBaseWhite, KinkyDungeonRootDirectory + "UI/Exit.png");
    if (KinkyDungeonKeybindingCurrentKey && KinkyDungeonGameKeyDown()) {
        if (KinkyDungeonKeybindingCurrentKey)
            KDLastKeyTime[KinkyDungeonKeybindingCurrentKey] = CommonTime();
        KinkyDungeonKeybindingCurrentKey = '';
    }
    if ((KinkyDungeonGameKey.keyPressed[9]) && !KinkyDungeonDrawStatesModal.includes(KinkyDungeonDrawState)) {
        if (!KinkyDungeonKeybindingCurrentKey) {
            KinkyDungeonKeybindingCurrentKey = KinkyDungeonKeySkip[0];
            KDCheckCustomKeypress();
            KinkyDungeonKeybindingCurrentKey = "";
        }
    }
    if ((KinkyDungeonGameKey.keyPressed[9] && KinkyDungeonKeybindingCurrentKey != KinkyDungeonKeySkip[0]) && !KinkyDungeonDrawStatesModal.includes(KinkyDungeonDrawState)) {
        if (document.activeElement && (document.activeElement?.type == "text" || document.activeElement?.type == "textarea" || KDFocusableTextFields.includes(document.activeElement.id))) {
            KinkyDungeonGameKey.keyPressed[9] = false;
        }
        else {
            let cancelType = null;
            for (let cancelT of KDCustomCancels) {
                if (cancelT.condition()) {
                    cancelType = cancelT.cancel;
                    break;
                }
            }
            if (cancelType) {
                if (cancelType()) {
                    KDContextMenu = false;
                }
            }
            else if (KinkyDungeonDrawState == "Magic") {
                KinkyDungeonDrawState = "MagicSpells";
                KinkyDungeonGameKey.keyPressed[9] = false;
                KinkyDungeonKeybindingCurrentKey = '';
                KinkyDungeonInspect = false;
                KDInteracting = false;
                KDContextMenu = false;
            }
            else if ((KinkyDungeonDrawState == "Collection" || KinkyDungeonDrawState == "Bondage")
                && (KDCollectionTab || KDCurrentRestrainingTarget || KDCurrentFacilityTarget)) {
                KDCollectionTab = "";
                if (KDCurrentFacilityTarget) {
                    KDCurrentFacilityTarget = "";
                    KDFacilityCollectionCallback = null;
                    KinkyDungeonDrawState = "Facilities";
                }
                KDCurrentRestrainingTarget = 0;
                KinkyDungeonGameKey.keyPressed[9] = false;
                KinkyDungeonKeybindingCurrentKey = '';
                KinkyDungeonInspect = false;
                KDInteracting = false;
                KDContextMenu = false;
            }
            else if (KDAlternateInventoryRender()) {
                KDResetAlternateInventoryRender();
                KinkyDungeonGameKey.keyPressed[9] = false;
                KinkyDungeonKeybindingCurrentKey = '';
                KinkyDungeonInspect = false;
                KDInteracting = false;
                KDContextMenu = false;
            }
            else {
                KDLastForceRefresh = CommonTime() - KDLastForceRefreshInterval - 10;
                KDPlayerSetPose = false;
                KinkyDungeonInspect = false;
                KDInteracting = false;
                KinkyDungeonUpdateLightGrid = true;
                KinkyDungeonDrawState = "Game";
                KDResetAlternateInventoryRender();
                KinkyDungeonMessageToggle = false;
                KinkyDungeonTargetingSpell = null;
                KinkyDungeonTargetingSpellItem = null;
                KinkyDungeonTargetingSpellWeapon = null;
                KinkyDungeonTargetTile = null;
                KinkyDungeonTargetTileLocation = "";
                KinkyDungeonInspect = false;
                KinkyDungeonSpellPress = "";
                KDModalArea = false;
                KDSetFocusControl("");
                KDCloseQuickInv();
                KDRepSelectionMode = "";
                KinkyDungeonGameKey.keyPressed[9] = false;
                KinkyDungeonKeybindingCurrentKey = '';
                KDRefreshCharacter.set(KinkyDungeonPlayer, true);
                KinkyDungeonDressPlayer();
            }
        }
    }
    if (KinkyDungeonDrawState == "Game")
        KinkyDungeonListenKeyMove();
    KDProcessInputs();
    if (KDDrewEnemyTooltipThisFrame) {
        KDDrewEnemyTooltip = KDDrewEnemyTooltipThisFrame;
    }
    else {
        KDDrewEnemyTooltip = "";
    }
    KDDrewEnemyTooltipThisFrame = "";
    KinkyDungeonSelectedBuff = "";
    KinkyDungeonSelectedBuff = null;
}
function KDShouldDrawFloaters() {
    return true;
}
function KDDrawArousalScreenFilter(_y1, _h, _Width, _ArousalOverride, _Color = '255, 100, 176', _AlphaBonus = 0) {
    if ((KDToggles.OScreenFilter && (KinkyDungeonFlags.get("OrgAfterglow")
        || KinkyDungeonFlags.get("OrgDenied")
        || KinkyDungeonFlags.get("OrgEdged"))) || (KDToggles.DistractScreenFilter
        && KDDistractionFlashStrength
        && (CommonTime() - KDDistractionFlashLastTime) < (KDDistractionFlashTime + KDDistractionFlashStrength * KDDistractionFlashStrengthTime))) {
        let mag = Math.max(0.0, Math.min(1.0, 1 - (CommonTime() - KDDistractionFlashLastTime)
            / (KDDistractionFlashTime + KDDistractionFlashStrength * KDDistractionFlashStrengthTime)), Math.min(1.0, (KinkyDungeonFlags.get("OrgAfterglow")
            || KinkyDungeonFlags.get("OrgDenied")
            || KinkyDungeonFlags.get("OrgEdged")) / KDOrgAfterglowTime || 0));
        FillRectKD(kdcanvas, kdpixisprites, "OrgAfterglowFilter", {
            Left: 0,
            Top: 0,
            Width: 2000,
            Height: 1000,
            Color: "#FF00DC",
            LineWidth: 1,
            zIndex: 1,
            alpha: mag * 0.1,
        });
    }
    else {
        KDDistractionFlashStrength = 0;
    }
}
function KDCanAttack() {
    let attackCost = KDAttackCost().attackCost;
    return KinkyDungeonHasStamina(Math.abs(attackCost), true);
}
let KinkyDungeonFloaters = [];
let KinkyDungeonLastFloaterTime = 0;
let KDTimescale = 0.004;
let KDBulletSpeed = 40;
let KDEntitiesFloaterRegisty = new Map();
let KDFloaterSpacing = 18 / KinkyDungeonGridSizeDisplay;
function KinkyDungeonSendFloater(Entity, Amount, Color, Time, LocationOverride, suff = "", size, prefix) {
    if (Entity.x && Entity.y) {
        let II = KDEntitiesFloaterRegisty.get(Entity) || 1;
        II += 1;
        KDEntitiesFloaterRegisty.set(Entity, II);
        let floaterMult = KDToggles.FastFloaters ? 0.33 : 1;
        let stringFloaterMult = KDToggles.FastFloaters ? 0.7 : 1;
        let floater = {
            x: Entity.x + 0.5,
            y: Entity.y - (II - 1) * KDFloaterSpacing,
            override: LocationOverride,
            speed: 30,
            t: 0,
            color: Color,
            size: size,
            text: "" + ((typeof Amount === "string") ? Amount : (prefix || "") + Math.round(Amount * 10) / 10) + suff,
            lifetime: Time ? stringFloaterMult * Time : ((typeof Amount === "string") ? stringFloaterMult * 4 : floaterMult * ((Amount < 3) ? 2 : (Amount > 5 ? 3 : 2))),
        };
        KinkyDungeonFloaters.push(floater);
    }
}
let KDFloaterGridRes = 10;
let KDFloaterGridCache = {};
let KDFloaterGridWipedOutAlpha = 0.25;
function KinkyDungeonDrawFloaters(CamX, CamY, onlyAbs = false) {
    let delta = CommonTime() - KinkyDungeonLastFloaterTime;
    KDFloaterGridCache = {};
    let KDFloaterYCache = [];
    let XCacheRes = 10;
    let max = 40;
    let i = 0;
    let floatermult = 1.5;
    if (delta > 0) {
        for (let floater of KinkyDungeonFloaters) {
            floater.t += floatermult * delta / 1000;
            if (i > max)
                break;
            i += 1;
        }
    }
    let newFloaters = [];
    i = 0;
    for (let floater of KinkyDungeonFloaters.reverse()) {
        if (i <= max && (floater.override || !onlyAbs)) {
            let x = floater.override ? floater.x : canvasOffsetX + (floater.x - CamX) * KinkyDungeonGridSizeDisplay;
            let y = (floater.override ? floater.y : canvasOffsetY + (floater.y - CamY) * KinkyDungeonGridSizeDisplay);
            let overlap = false;
            let overlapAmount = 9;
            for (let iii = -overlapAmount; iii < overlapAmount; iii += 2) {
                if (KDFloaterYCache[Math.round(XCacheRes * x / PIXIWidth)]
                    && KDFloaterYCache[Math.round(XCacheRes * x / PIXIWidth)][Math.round(y + iii)]) {
                    overlap = true;
                }
            }
            let ii = 0;
            let direction = -1;
            while (overlap && ii < 24) {
                floater.y -= (floater.override ? 4 : 4 / KinkyDungeonGridSizeDisplay) * direction;
                x = floater.override ? floater.x : canvasOffsetX + (floater.x - CamX) * KinkyDungeonGridSizeDisplay;
                y = (floater.override ? floater.y : canvasOffsetY + (floater.y - CamY) * KinkyDungeonGridSizeDisplay);
                overlap = false;
                for (let iii = -overlapAmount; iii < overlapAmount; iii += 2) {
                    if (KDFloaterYCache[Math.round(XCacheRes * x / PIXIWidth)]
                        && KDFloaterYCache[Math.round(XCacheRes * x / PIXIWidth)][Math.round(y + iii)]) {
                        overlap = true;
                    }
                }
                ii += 1;
            }
            for (let iii = -overlapAmount; iii < overlapAmount; iii++) {
                if (!KDFloaterYCache[Math.round(XCacheRes * x / PIXIWidth)])
                    KDFloaterYCache[Math.round(XCacheRes * x / PIXIWidth)] = {};
                KDFloaterYCache[Math.round(XCacheRes * x / PIXIWidth)][Math.round(y + iii)] = true;
            }
            let alpha = KDEase(floater.t / floater.lifetime);
            KDFloaterGridCache[Math.round(KDFloaterGridRes * x / PIXIWidth)
                + "," + Math.round(KDFloaterGridRes * (y - floater.speed * floater.t / floatermult) / PIXIHeight)]
                = Math.max(KDFloaterGridCache[Math.round(KDFloaterGridRes * x / PIXIWidth)
                    + "," + Math.round(KDFloaterGridRes * (y - floater.speed * floater.t / floatermult) / PIXIHeight)]
                    || 0, alpha);
            KDFloaterGridCache[(Math.round(KDFloaterGridRes * x / PIXIWidth) + 1)
                + "," + Math.round(KDFloaterGridRes * (y - floater.speed * floater.t / floatermult) / PIXIHeight)]
                = Math.max(KDFloaterGridCache[(1 + Math.round(KDFloaterGridRes * x / PIXIWidth))
                    + "," + Math.round(KDFloaterGridRes * (y - floater.speed * floater.t / floatermult) / PIXIHeight)]
                    || 0, 0.7 * alpha);
            KDFloaterGridCache[(Math.round(KDFloaterGridRes * x / PIXIWidth) - 1)
                + "," + Math.round(KDFloaterGridRes * (y - floater.speed * floater.t / floatermult) / PIXIHeight)]
                = Math.max(KDFloaterGridCache[(-1 + Math.round(KDFloaterGridRes * x / PIXIWidth))
                    + "," + Math.round(KDFloaterGridRes * (y - floater.speed * floater.t / floatermult) / PIXIHeight)]
                    || 0, 0.7 * alpha);
            KDFloaterGridCache[Math.round(KDFloaterGridRes * x / PIXIWidth)
                + "," + (1 + Math.round(KDFloaterGridRes * (y - floater.speed * floater.t / floatermult) / PIXIHeight))]
                = Math.max(KDFloaterGridCache[Math.round(KDFloaterGridRes * x / PIXIWidth)
                    + "," + (1 + Math.round(KDFloaterGridRes * (y - floater.speed * floater.t / floatermult) / PIXIHeight))]
                    || 0, 0.7 * alpha);
            KDFloaterGridCache[Math.round(KDFloaterGridRes * x / PIXIWidth)
                + "," + (-1 + Math.round(KDFloaterGridRes * (y - floater.speed * floater.t / floatermult) / PIXIHeight))]
                = Math.max(KDFloaterGridCache[Math.round(KDFloaterGridRes * x / PIXIWidth)
                    + "," + (-1 + Math.round(KDFloaterGridRes * (y - floater.speed * floater.t / floatermult) / PIXIHeight))]
                    || 0, 0.7 * alpha);
            DrawTextFitKDTo(kdfloatercanvas, floater.text, x, y - floater.speed * floater.t / floatermult, 1000, floater.color, KDTextGray1, floater.size || 20, undefined, undefined, alpha);
        }
        if (floater.t < floater.lifetime) {
            newFloaters.push(floater);
        }
        i += 1;
    }
    KinkyDungeonFloaters = newFloaters.reverse();
    KinkyDungeonLastFloaterTime = CommonTime();
}
function KDEase(value) {
    if (value < 0.25)
        return Math.sin(value * Math.PI * 2);
    else if (value > 0.75)
        return Math.sin(-value * Math.PI * 2);
    else
        return 1;
}
let KinkyDungeonMessageToggle = false;
let KinkyDungeonMessageLog = [];
let KDLogDist = 22;
let KDMSGFontSize = 20;
let KDLogHeight = 700;
let KDMaxLog = Math.floor(700 / KDLogDist);
let KDLogTopPad = 25;
let KDLogIndex = 0;
let KDLogIndexInc = 3;
let KDMsgWidth = 800;
let KDMsgWidthMin = 800;
let KDMsgX = 720;
let KDMsgFadeTime = 10;
let KDMaxConsoleMsg = 6;
let KDLogFilters = [
    "Action",
    "Combat",
    "TotalDamage",
    "Critical",
    "Self",
    "Struggle",
    "Ambient",
    "Dialogue",
    "Items",
    "Kills",
];
let KDLogFilterDefault = {
    TotalDamage: false,
};
function KinkyDungeonDrawMessages(NoLog, shiftx = 0, noBG = false, width = KDMsgWidthMin, heightBonus = 0, subLines = 0) {
    if (!NoLog) {
        DrawButtonKDEx("logtog", (_bdata) => {
            KinkyDungeonMessageToggle = !KinkyDungeonMessageToggle;
            KDLogIndex = 0;
            return true;
        }, true, KDMsgWidthMin + KDMsgX + shiftx + 70, heightBonus + 4, 52, 52, "", KDBaseWhite, KinkyDungeonRootDirectory + (KinkyDungeonMessageToggle ? "UI/LogUp.png" : "UI/LogDown.png"), undefined, undefined, !KinkyDungeonMessageToggle, undefined, undefined, undefined, {
            hotkey: KDHotkeyToText(KinkyDungeonKeyToggle[0]),
            hotkeyPress: KinkyDungeonKeyToggle[0],
            scaleImage: true,
        });
        if (!KDGameData.LogFilters) {
            KDGameData.LogFilters = {};
            for (let filter of KDLogFilters) {
                KDGameData.LogFilters[filter] = KDLogFilterDefault[filter] != undefined ? KDLogFilterDefault[filter] : true;
            }
        }
        let spacing = 51;
        let size = 48;
        let filterCols = 2;
        let yyy = KDLogFilters.length * spacing / filterCols + 30;
        if (!KinkyDungeonTargetingSpell
            && MouseIn(KDMsgWidthMin + KDMsgX + shiftx + 70, heightBonus + 0, 300, yyy) && !KDModalArea) {
            let filterX = KDMsgWidthMin + KDMsgX + shiftx + 70 + 60;
            let filterY = heightBonus + 4;
            let ii = 0;
            for (let filter of KDLogFilters) {
                if (!KDGameData.LogFilters)
                    KDGameData.LogFilters = {};
                if (KDGameData.LogFilters[filter] == undefined)
                    KDGameData.LogFilters[filter] = KDLogFilterDefault[filter] != undefined ? KDLogFilterDefault[filter] : true;
                if (DrawButtonKDEx("logtog" + filter, (_bdata) => {
                    KDGameData.LogFilters[filter] = !KDGameData.LogFilters[filter];
                    return true;
                }, true, filterX + spacing * (ii % filterCols), filterY + spacing * Math.floor(ii / filterCols), size, size, "", KDBaseWhite, KinkyDungeonRootDirectory + "UI/Log/" + filter + ".png", undefined, undefined, !KDGameData.LogFilters[filter], undefined, undefined, undefined, {
                    scaleImage: true,
                })) {
                    DrawTextFitKD(TextGet("KDLogFilter" + filter), filterX + spacing * (ii % filterCols), yyy, 300, KDBaseWhite, KDTextGray1, 14, "right");
                }
                ii++;
            }
        }
    }
    if (!KinkyDungeonMessageToggle || NoLog) {
        let zLevel = KDModalArea ? 50 : undefined;
        let i = 0;
        if (!MouseIn(KDMsgX + shiftx + (KDMsgWidth - KDMsgWidthMin) / 2, heightBonus + 0, KDMsgWidthMin, 62 + KDLogDist * (2 + (KDMaxConsoleMsg - subLines))) || KinkyDungeonDrawState != "Game") {
            let msg2nd = [];
            let ignoreMSG = [];
            let spacing = KDLogDist;
            if (KinkyDungeonActionMessageTime > 0 && KinkyDungeonActionMessageNoPush) {
                DrawTextFitKD(KinkyDungeonActionMessage, KDMsgX + shiftx + KDMsgWidth / 2, heightBonus + 15 + spacing * i, width, KinkyDungeonActionMessageColor, KDTextGray1, KDMSGFontSize, undefined, zLevel);
                ignoreMSG.push(KinkyDungeonActionMessage);
                i++;
            }
            if (KinkyDungeonTextMessageTime > 0 && KinkyDungeonTextMessageNoPush) {
                DrawTextFitKD(KinkyDungeonTextMessage, KDMsgX + shiftx + KDMsgWidth / 2, heightBonus + 15 + spacing * i, width, KinkyDungeonTextMessageColor, KDTextGray1, KDMSGFontSize, undefined, zLevel);
                ignoreMSG.push(KinkyDungeonTextMessage);
                i++;
            }
            for (let ii = 0; ii < KinkyDungeonMessageLog.length && ii < 100; ii++) {
                let index = KinkyDungeonMessageLog.length - 1 - ii;
                let msg = KinkyDungeonMessageLog[index];
                if (!msg)
                    break;
                if (ignoreMSG.includes(msg.text)) {
                    ignoreMSG.splice(ignoreMSG.indexOf(msg.text), 1);
                    continue;
                }
                if (KinkyDungeonCurrentTick - msg.time < KDMsgFadeTime) {
                    let count = 1;
                    for (let iii = 1; iii < 100; iii++) {
                        if (KinkyDungeonMessageLog[index - iii] && KinkyDungeonMessageLog[index - iii].text == msg.text) {
                            count += 1;
                        }
                        else
                            break;
                    }
                    if (count > 1) {
                        ii += count - 1;
                    }
                    msg2nd.push(count == 1 ? msg : Object.assign({}, { text: msg.text + ` (x${count})`, color: msg.color, time: msg.time }));
                }
            }
            if (msg2nd.length > 0) {
                let alpha = 1;
                let alphamin = 0.4;
                for (let msg of msg2nd) {
                    if (i > (KDMaxConsoleMsg - subLines) || (KinkyDungeonDrawState != "Game" && i > 3))
                        break;
                    if (alpha > 0) {
                        if (msg.filter && KDGameData.LogFilters && KDGameData.LogFilters[msg.filter] == false) {
                            continue;
                        }
                        if (msg.antifilter && KDGameData.LogFilters && KDGameData.LogFilters[msg.antifilter] == true) {
                            continue;
                        }
                        alpha = Math.max(0, Math.min(1, 2.0 - i / (KDMaxConsoleMsg - subLines))) * (1 - Math.max(0, Math.min(1, Math.max(0, KinkyDungeonCurrentTick - msg.time - 1) / KDMsgFadeTime)));
                        DrawTextFitKD(msg.text, KDMsgX + shiftx + KDMsgWidth / 2, heightBonus + 15 + spacing * i, width, msg.color, KDTextGray1, KDMSGFontSize, undefined, zLevel, alphamin + (1 - alphamin) * alpha);
                        i++;
                    }
                }
            }
        }
        if (!noBG)
            if (i > 0)
                FillRectKD(kdcanvas, kdpixisprites, "msglogbg", {
                    Left: KDMsgX + shiftx + (KDMsgWidth - KDMsgWidthMin) / 2,
                    Top: heightBonus + 0,
                    Width: KDMsgWidthMin,
                    Height: 22 + KDLogDist * (i),
                    Color: KDBaseBlack,
                    LineWidth: 1,
                    zIndex: (zLevel || 101) - 1,
                    alpha: 0.45,
                });
    }
    else {
        if (!noBG)
            FillRectKD(kdcanvas, kdpixisprites, "msglogbg", {
                Left: KDMsgX + shiftx,
                Top: heightBonus + 0,
                Width: KDMsgWidth,
                Height: KDLogTopPad + KDLogHeight,
                Color: KDTextGray0,
                LineWidth: 1,
                zIndex: 100,
                alpha: 0.6,
            });
        let ii = 0;
        for (let i = 0; i < KinkyDungeonMessageLog.length && i < KDMaxLog; i++) {
            let log = KinkyDungeonMessageLog[Math.max(0, KinkyDungeonMessageLog.length - 1 - (i + KDLogIndex))];
            if (log.filter && KDGameData.LogFilters && KDGameData.LogFilters[log.filter] == false) {
                continue;
            }
            if (log.antifilter && KDGameData.LogFilters && KDGameData.LogFilters[log.antifilter] == true) {
                continue;
            }
            let col = log.color;
            DrawTextFitKD(log.text, KDMsgX + shiftx + KDMsgWidth / 2, heightBonus + KDLogTopPad + ii * KDLogDist + KDLogDist / 2, KDMsgWidth, col, KDTextGray1, KDMSGFontSize, undefined, 101);
            ii++;
        }
        if (KinkyDungeonMessageLog.length > KDMaxLog) {
            DrawButtonKDEx("logscrollup", (_bdata) => {
                if (KDLogIndex > 0)
                    KDLogIndex = Math.max(0, KDLogIndex - KDLogIndexInc);
                return true;
            }, true, 1500, heightBonus + 20, 90, 40, "", KDBaseWhite, KinkyDungeonRootDirectory + "Up.png");
            DrawButtonKDEx("logscrolldown", (_bdata) => {
                if (KDLogIndex < KinkyDungeonMessageLog.length - KDMaxLog)
                    KDLogIndex = Math.min(Math.max(0, KinkyDungeonMessageLog.length - KDMaxLog), KDLogIndex + KDLogIndexInc);
                return true;
            }, true, 1500, heightBonus + 60, 90, 40, "", KDBaseWhite, KinkyDungeonRootDirectory + "Down.png");
            if (KinkyDungeonMessageLog.length > KDMaxLog * 100) {
                KinkyDungeonMessageLog.splice(0, KDMaxLog * 100 - KinkyDungeonMessageLog.length);
            }
        }
    }
}
function KDhexToRGB(h) {
    let r = "", g = "", b = "";
    if (h.length == 4) {
        r = h[1] + h[1];
        g = h[2] + h[2];
        b = h[3] + h[3];
    }
    else if (h.length == 7) {
        r = h[1] + h[2];
        g = h[3] + h[4];
        b = h[5] + h[6];
    }
    return { r: r, g: g, b: b };
}
function KinkyDungeonUpdateVisualPosition(Entity, amount) {
    if (amount < 0 || Entity.visual_x == undefined || Entity.visual_y == undefined) {
        Entity.visual_x = (Entity.xx != undefined) ? Entity.xx : Entity.x;
        Entity.visual_y = (Entity.yy != undefined) ? Entity.yy : Entity.y;
        return -1;
    }
    else {
        let speed = 50 + KDAnimSpeed * 50;
        if (Entity.player && KinkyDungeonSlowLevel > 0 && KDGameData.KinkyDungeonLeashedPlayer < 2 && (KinkyDungeonFastMovePath.length < 1 || KinkyDungeonSlowLevel > 1))
            speed += KDAnimSpeed * 50 * KinkyDungeonSlowLevel;
        if (KDGameData.SleepTurns > 0)
            speed = 100;
        if (speed > 300)
            speed = 250;
        if (Entity.scale)
            speed = KDBulletSpeed;
        let value = amount / speed;
        let tx = (Entity.xx != undefined) ? Entity.xx : Entity.x;
        let ty = (Entity.yy != undefined) ? Entity.yy : Entity.y;
        let offX = 0;
        let offY = 0;
        if (Entity.Enemy && KinkyDungeonVisionGet(Entity.x, Entity.y) > 0) {
            let ret = KDAnimEnemy(Entity);
            offX = ret.offX;
            offY = ret.offY;
        }
        tx += offX;
        ty += offY;
        let dist = Math.sqrt((Entity.visual_x - tx) * (Entity.visual_x - tx) + (Entity.visual_y - ty) * (Entity.visual_y - ty));
        if (dist > 5) {
            value = 1;
        }
        if (Entity.scale != undefined) {
            let scalemult = 0.9;
            if (dist > 0 || !Entity.end || !(Entity.vx || Entity.vy)) {
                if (Entity.vx || Entity.vy) {
                    scalemult = KDistEuclidean(Entity.vx, Entity.vy);
                }
                Entity.scale = Math.min(1.0, Entity.scale + KDTimescale * amount * scalemult);
            }
            else {
                Entity.scale = Math.max(0.0, Entity.scale - KDTimescale * amount * scalemult);
            }
        }
        if (Entity.alpha != undefined) {
            let alphamult = 0.28;
            if (dist > 0 || !Entity.end) {
                Entity.alpha = Math.min(1.0, Entity.alpha + KDTimescale * amount * 3.0);
            }
            else {
                if ((Entity.vx || Entity.vy) || Entity.time > 1) {
                    alphamult = 0;
                }
                Entity.alpha = Math.min(1, Math.max(0.0, Entity.alpha - KDTimescale * amount * alphamult));
            }
        }
        if (Entity.spin != undefined && Entity.spinAngle != undefined) {
            Entity.spinAngle += Entity.spin * KDTimescale * amount;
            if (Entity.spinAngle > Math.PI * 2)
                Entity.spinAngle -= Math.PI * 2;
            else if (Entity.spinAngle < 0)
                Entity.spinAngle += Math.PI * 2;
        }
        if (dist == 0)
            return dist;
        let weightx = Math.abs(Entity.visual_x - tx) / (dist);
        let weighty = Math.abs(Entity.visual_y - ty) / (dist);
        if (Entity.visual_x > tx)
            Entity.visual_x = Math.max(Entity.visual_x - value * weightx, tx);
        else
            Entity.visual_x = Math.min(Entity.visual_x + value * weightx, tx);
        if (Entity.visual_y > ty)
            Entity.visual_y = Math.max(Entity.visual_y - value * weighty, ty);
        else
            Entity.visual_y = Math.min(Entity.visual_y + value * weighty, ty);
        return dist;
    }
}
function KinkyDungeonSetTargetLocation(helper = true, mx, my) {
    if (mx == undefined)
        mx = MouseX;
    if (my == undefined)
        my = MouseY;
    KinkyDungeonTargetX = Math.round((mx - KinkyDungeonGridSizeDisplay / 2 - canvasOffsetX) / KinkyDungeonGridSizeDisplay) + (KinkyDungeonCamX);
    KinkyDungeonTargetY = Math.round((my - KinkyDungeonGridSizeDisplay / 2 - canvasOffsetY) / KinkyDungeonGridSizeDisplay) + (KinkyDungeonCamY);
    if (helper) {
        if (KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(KinkyDungeonTargetX, KinkyDungeonTargetY))
            && !(KinkyDungeonTilesGet(KinkyDungeonTargetX + "," + KinkyDungeonTargetY)?.Type)) {
            let remainderX = (mx - KinkyDungeonGridSizeDisplay / 2 - canvasOffsetX) / KinkyDungeonGridSizeDisplay - Math.round((mx - KinkyDungeonGridSizeDisplay / 2 - canvasOffsetX) / KinkyDungeonGridSizeDisplay);
            let remainderY = ((my - KinkyDungeonGridSizeDisplay / 2 - canvasOffsetY) / KinkyDungeonGridSizeDisplay) - Math.round((my - KinkyDungeonGridSizeDisplay / 2 - canvasOffsetY) / KinkyDungeonGridSizeDisplay);
            let aimThresh = 0.1;
            let aimed = false;
            if (remainderX > aimThresh) {
                if (!KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(KinkyDungeonTargetX + 1, KinkyDungeonTargetY))) {
                    KinkyDungeonTargetX += 1;
                    aimed = true;
                }
            }
            if (!aimed && remainderX < -aimThresh) {
                if (!KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(KinkyDungeonTargetX - 1, KinkyDungeonTargetY))) {
                    KinkyDungeonTargetX -= 1;
                    aimed = true;
                }
            }
            if (!aimed && remainderY > aimThresh) {
                if (!KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(KinkyDungeonTargetX, KinkyDungeonTargetY + 1))) {
                    KinkyDungeonTargetY += 1;
                    aimed = true;
                }
            }
            if (!aimed && remainderY < -aimThresh) {
                if (!KinkyDungeonWallTiles.includes(KinkyDungeonMapGet(KinkyDungeonTargetX, KinkyDungeonTargetY - 1))) {
                    KinkyDungeonTargetY -= 1;
                }
            }
        }
    }
}
function KDGetMoveDirection() {
    let tx = Math.round((MouseX - KinkyDungeonGridSizeDisplay / 2 - canvasOffsetX) / KinkyDungeonGridSizeDisplay) + KinkyDungeonCamX;
    let ty = Math.round((MouseY - KinkyDungeonGridSizeDisplay / 2 - canvasOffsetY) / KinkyDungeonGridSizeDisplay) + KinkyDungeonCamY;
    return { x: tx, y: ty };
}
function KinkyDungeonSetMoveDirection() {
    let point = KDGetMoveDirection();
    KDSendInput("setMoveDirection", { dir: KDGetDirGeometric(point.x - KinkyDungeonPlayerEntity.x, point.y - KinkyDungeonPlayerEntity.y) }, true, true);
}
let KDBoxThreshold = 60;
let KDButtonColor = "rgba(5, 5, 5, 0.5)";
let KDButtonColorIntense = "rgba(5, 5, 5, 0.8)";
let KDBorderColor = KDBaseLightGrey;
let KDUIColorHighlight = KDBaseLightGrey;
let KDHighlightColor = 'rgb(220, 207, 178)';
let KDStrongHighlightColor = 'rgb(217, 173, 78)';
function DrawBoxKD(Left, Top, Width, Height, Color, NoBorder, Alpha, zIndex = 90) {
    DrawBoxKDTo(kdcanvas, Left, Top, Width, Height, Color, NoBorder, Alpha, zIndex);
}
function DrawBoxKDTo(Container, Left, Top, Width, Height, Color, NoBorder, Alpha, zIndex = 90, bordercolor) {
    FillRectKD(Container || kdcanvas, kdpixisprites, "box" + Left + "," + Top + "," + Width + "," + Height + Color + zIndex, {
        Left: Left,
        Top: Top,
        Width: Width,
        Height: Height,
        Color: Color,
        LineWidth: 1,
        zIndex: zIndex,
        alpha: Alpha != undefined ? Alpha : 1,
    });
    if (!NoBorder) {
        DrawRectKD(Container || kdcanvas, kdpixisprites, "boxBorder" + Left + "," + Top + "," + Width + "," + Height + zIndex, {
            Left: Left,
            Top: Top,
            Width: Width,
            Height: Height,
            Color: bordercolor || KDBorderColor,
            LineWidth: 1,
            zIndex: zIndex + 0.003,
        });
    }
}
let KDFont = 'Arial';
function DrawTextFitKD(Text, X, Y, Width, Color, BackColor, FontSize, Align, zIndex = 110, alpha = 1.0, border = undefined, unique = undefined, font, wordwrap = false) {
    return DrawTextFitKDTo(kdcanvas, Text, X, Y, Width, Color, BackColor, FontSize, Align, zIndex, alpha, border, unique, font, wordwrap);
}
function DrawTextFitKDgetHeight(Text, X, Y, Width, Color, BackColor, FontSize, Align, zIndex = 110, alpha = 1.0, border = undefined, unique = undefined, font, wordwrap = false, valign, lineHeight) {
    if (!Text)
        return 0;
    let alignment = Align ? Align : "center";
    return DrawTextVisKD(kdcanvas, kdpixisprites, "tx|" + Text + (!unique ? "," + X + "," + Y : "_unique"), {
        Text: Text,
        X: X,
        Y: Y,
        Width: Width,
        Color: Color,
        BackColor: BackColor ? BackColor : (Color == KDTextGray2 ? KDTextGray0 : (Color == KDTextGray0 ? KDTextGray3 : KDTextGray2)),
        FontSize: FontSize ? FontSize : 30,
        align: alignment,
        zIndex: zIndex,
        alpha: alpha,
        border: border,
        unique: unique,
        font: font,
        wordwrap: wordwrap,
        valign: valign,
        lineHeight: lineHeight
    })[1];
}
function DrawTextFitKDTo(Container, Text, X, Y, Width, Color, BackColor, FontSize, Align, zIndex = 110, alpha = 1.0, border = undefined, unique = undefined, font, wordwrap = false) {
    if (!Text)
        return 0;
    let alignment = Align ? Align : "center";
    return DrawTextVisKD(Container || kdcanvas, kdpixisprites, "tx|" + Text + (!unique ? "," + X + "," + Y : "_unique"), {
        Text: Text,
        X: X,
        Y: Y,
        Width: Width,
        Color: Color,
        BackColor: BackColor ? BackColor : (Color == KDTextGray2 ? KDTextGray0 : (Color == KDTextGray0 ? KDTextGray3 : KDTextGray2)),
        FontSize: FontSize ? FontSize : 30,
        align: alignment,
        zIndex: zIndex,
        alpha: alpha,
        border: border,
        unique: unique,
        font: font,
        wordwrap: wordwrap
    })[0];
}
function DrawTextFitKDTo2(Container, Map, Text, X, Y, Width, Color, BackColor, FontSize, Align, zIndex = 110, alpha = 1.0, border = undefined, unique = undefined, font) {
    if (!Text)
        return 0;
    let alignment = Align ? Align : "center";
    return DrawTextVisKD(Container || kdcanvas, Map, "tx|" + Text + (!unique ? "," + X + "," + Y : "_unique"), {
        Text: Text,
        X: X,
        Y: Y,
        Width: Width,
        Color: Color,
        BackColor: BackColor ? BackColor : (Color == KDTextGray2 ? KDTextGray0 : (Color == KDTextGray0 ? KDTextGray3 : KDTextGray2)),
        FontSize: FontSize ? FontSize : 30,
        align: alignment,
        zIndex: zIndex,
        alpha: alpha,
        border: border,
        unique: unique,
        font: font,
    })[0];
}
function DrawTextKD(Text, X, Y, Color, BackColor, FontSize, Align, zIndex = 110, alpha = 1.0, border = undefined) {
    if (!Text)
        return;
    let alignment = Align ? Align : "center";
    return DrawTextVisKD(kdcanvas, kdpixisprites, "tx|" + Text + "," + X + "," + Y, {
        Text: Text,
        X: X,
        Y: Y,
        Width: undefined,
        Color: Color,
        BackColor: BackColor,
        FontSize: FontSize ? FontSize : 30,
        align: alignment,
        zIndex: zIndex,
        alpha: alpha,
        border: border,
    })[0];
}
let KDAllowText = true;
function DrawTextVisKD(Container, Map, id, Params) {
    if (!KDAllowText)
        return [0];
    let sprite = Map.get(id);
    let same = true;
    let par = kdprimitiveparams.get(id);
    if (sprite && par) {
        for (let p of Object.entries(kdprimitiveparams.get(id))) {
            if (Params[p[0]] != p[1] && ((p[0] != 'X' && p[0] != 'Y') || !Params.unique)) {
                same = false;
                break;
            }
        }
        for (let p of Object.entries(Params)) {
            if (par[p[0]] != p[1] && ((p[0] != 'X' && p[0] != 'Y') || !Params.unique)) {
                same = false;
                break;
            }
        }
    }
    if (!sprite || !same) {
        if (sprite) {
            sprite.destroy(true);
        }
        sprite = new PIXI.Text(Params.wordwrap || Params.Text.includes('|') || Params.Text.includes('\\n') ?
            Params.Text.replaceAll('|', "\n").replaceAll('\\n', "\n")
            : Params.Text, {
            fontFamily: Params.font || KDSelectedFont || KDFontName,
            fontSize: Params.FontSize ? Params.FontSize : 30,
            fill: string2hex(Params.Color),
            stroke: Params.BackColor != "none" ? (Params.BackColor ? string2hex(Params.BackColor) : "#333333") : 0x010203,
            strokeThickness: Params.border != undefined ? Params.border
                : (Params.BackColor != "none" ?
                    (Params.FontSize ? Math.ceil(Params.FontSize / 8) : 2)
                    : 1),
            miterLimit: 2,
            padding: 5,
            wordWrap: Params.wordwrap,
            wordWrapWidth: Params.Width,
            breakWords: Params.wordwrap && CharacterCheckerHasCJK(Params.Text),
            lineHeight: Params.lineHeight,
        });
        if (Params.Width) {
            sprite.scale.x = Math.min(1, Params.Width / Math.max(1, sprite.width));
            sprite.scale.y = sprite.scale.x;
        }
        sprite.roundPixels = true;
        Map.set(id, sprite);
        Container.addChild(sprite);
        if (!kdprimitiveparams.has(id) || !same)
            kdprimitiveparams.set(id, Params);
    }
    if (sprite) {
        sprite.visible = true;
        sprite.name = id;
        sprite.position.x = Params.X + (Params.align == 'center' ? -sprite.width / 2 : (Params.align == 'right' ? -sprite.width : 0));
        sprite.position.y = Params.Y + (Params.valign == 'top' ? 0 : (Params.valign == 'bottom' ? -Math.ceil(sprite.height) : -Math.ceil(sprite.height / 2)));
        sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
        sprite.alpha = Params.alpha ? Params.alpha : 1;
        kdSpritesDrawn.set(id, true);
        return [sprite.width, sprite.height];
    }
    return [0];
}
function DrawRectKD(Container, Map, id, Params) {
    let sprite = Map.get(id);
    let same = true;
    if (sprite && kdprimitiveparams.has(id)) {
        for (let p of Object.entries(kdprimitiveparams.get(id))) {
            if (Params[p[0]] != p[1]) {
                same = false;
                break;
            }
        }
    }
    if (!sprite || !same) {
        if (sprite) {
            sprite.clear();
            sprite.destroy(true);
        }
        sprite = new PIXI.Graphics();
        sprite.lineStyle(Params.LineWidth ? Params.LineWidth : 1, string2hex(Params.Color), 1);
        sprite.drawRect(0, 0, Params.Width, Params.Height);
        Map.set(id, sprite);
        Container.addChild(sprite);
        if (!kdprimitiveparams.has(id) || !same)
            kdprimitiveparams.set(id, Params);
    }
    if (sprite) {
        sprite.visible = true;
        sprite.name = id;
        sprite.position.x = Params.Left;
        sprite.position.y = Params.Top;
        sprite.width = Params.Width;
        sprite.height = Params.Height;
        sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
        sprite.alpha = Params.alpha ? Params.alpha : 1;
        kdSpritesDrawn.set(id, true);
        return true;
    }
    return false;
}
function DrawCircleKD(Container, Map, id, Params) {
    let sprite = Map.get(id);
    let same = true;
    if (sprite && kdprimitiveparams.has(id)) {
        for (let p of Object.entries(kdprimitiveparams.get(id))) {
            if (Params[p[0]] != p[1]) {
                same = false;
                break;
            }
        }
    }
    if (!sprite || !same) {
        if (sprite) {
            sprite.clear();
            sprite.destroy(true);
        }
        sprite = new PIXI.Graphics();
        sprite.lineStyle(Params.LineWidth ? Params.LineWidth : 1, string2hex(Params.Color), 1);
        sprite.drawCircle(Params.Width / 2, Params.Width / 2, Params.Width / 2);
        Map.set(id, sprite);
        Container.addChild(sprite);
        if (!kdprimitiveparams.has(id) || !same)
            kdprimitiveparams.set(id, Params);
    }
    if (sprite) {
        sprite.visible = true;
        sprite.name = id;
        sprite.position.x = Params.Left;
        sprite.position.y = Params.Top;
        sprite.width = Params.Width;
        sprite.height = Params.Height;
        sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
        sprite.alpha = Params.alpha ? Params.alpha : 1;
        kdSpritesDrawn.set(id, true);
        return true;
    }
    return false;
}
function DrawCrossKD(Container, Map, id, Params) {
    let sprite = Map.get(id);
    let same = true;
    if (sprite && kdprimitiveparams.has(id)) {
        for (let p of Object.entries(kdprimitiveparams.get(id))) {
            if (Params[p[0]] != p[1]) {
                same = false;
                break;
            }
        }
    }
    if (!sprite || !same) {
        if (sprite) {
            sprite.clear();
            sprite.destroy(true);
        }
        let linewidth = Params.LineWidth || 2;
        sprite = new PIXI.Graphics();
        sprite.beginFill(string2hex(Params.Color));
        sprite.drawRect(Params.Width / 2 - linewidth / 2, 0, linewidth, Params.Height);
        sprite.drawRect(0, Params.Height / 2 - linewidth / 2, Params.Width, linewidth);
        Map.set(id, sprite);
        Container.addChild(sprite);
        if (!kdprimitiveparams.has(id) || !same)
            kdprimitiveparams.set(id, Params);
    }
    if (sprite) {
        sprite.visible = true;
        sprite.name = id;
        sprite.position.x = Params.Left;
        sprite.position.y = Params.Top;
        sprite.width = Params.Width;
        sprite.height = Params.Height;
        sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
        sprite.alpha = Params.alpha ? Params.alpha : 1;
        kdSpritesDrawn.set(id, true);
        return true;
    }
    return false;
}
function FillCircleKD(Container, Map, id, Params) {
    let sprite = Map.get(id);
    let same = true;
    if (sprite && kdprimitiveparams.has(id)) {
        for (let p of Object.entries(kdprimitiveparams.get(id))) {
            if (Params[p[0]] != p[1]) {
                same = false;
                break;
            }
        }
    }
    if (!sprite || !same) {
        if (sprite) {
            sprite.clear();
            sprite.destroy(true);
        }
        sprite = new PIXI.Graphics();
        sprite.beginFill(string2hex(Params.Color));
        sprite.drawCircle(Params.Radius, Params.Radius, Params.Radius);
        Map.set(id, sprite);
        Container.addChild(sprite);
        if (!kdprimitiveparams.has(id) || !same)
            kdprimitiveparams.set(id, Params);
    }
    if (sprite) {
        sprite.name = id;
        sprite.position.x = Params.Left - Params.Radius;
        sprite.position.y = Params.Top - Params.Radius;
        sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
        sprite.alpha = Params.alpha ? Params.alpha : 1;
        kdSpritesDrawn.set(id, true);
        return true;
    }
    return false;
}
function FillRectKD(Container, Map, id, Params) {
    let sprite = Map.get(id);
    let same = true;
    if (sprite && kdprimitiveparams.has(id)) {
        for (let p of Object.entries(kdprimitiveparams.get(id))) {
            if (Params[p[0]] != p[1]) {
                same = false;
                break;
            }
        }
    }
    if (!sprite || !same) {
        if (sprite) {
            sprite.clear();
            sprite.destroy(true);
        }
        sprite = new PIXI.Graphics();
        sprite.beginFill(string2hex(Params.Color));
        sprite.drawRect(0, 0, Params.Width, Params.Height);
        Map.set(id, sprite);
        Container.addChild(sprite);
        if (!kdprimitiveparams.has(id) || !same)
            kdprimitiveparams.set(id, Params);
    }
    if (sprite) {
        sprite.visible = true;
        sprite.name = id;
        sprite.position.x = Params.Left;
        sprite.position.y = Params.Top;
        sprite.width = Params.Width;
        sprite.height = Params.Height;
        sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
        sprite.alpha = Params.alpha ? Params.alpha : 1;
        kdSpritesDrawn.set(id, true);
        return true;
    }
    return false;
}
function FillCircleBarKD(Container, Map, id, Params) {
    let sprite = Map.get(id);
    let same = true;
    if (sprite && kdprimitiveparams.has(id)) {
        for (let p of Object.entries(kdprimitiveparams.get(id))) {
            if (Params[p[0]] != p[1]) {
                same = false;
                break;
            }
        }
    }
    if (!sprite || !same) {
        let linethickness = (Params.LineWidth ? Params.LineWidth : 2);
        let linecolor = (Params.Color ? string2hex(Params.Color) : 0xE30022);
        let radius = (Params.Radius ? Params.Radius : 10);
        let startingangle = (Params.StartAngle ? Params.StartAngle : 0);
        let endingangle = (Params.EndingAngle ? Params.EndingAngle : Math.PI);
        let counterclockwise = (Params.CounterClockwise ? Params.CounterClockwise : false);
        if (sprite) {
            sprite.clear();
            sprite.destroy(true);
        }
        sprite = new PIXI.Graphics();
        sprite.lineStyle(linethickness, linecolor);
        sprite.arc(0, 0, radius, startingangle, endingangle, counterclockwise);
        Map.set(id, sprite);
        Container.addChild(sprite);
        if (!kdprimitiveparams.has(id) || !same)
            kdprimitiveparams.set(id, Params);
    }
    if (sprite) {
        let rotation = (Params.Rotation ? Params.Rotation : (0 - Math.PI / 2));
        sprite.name = id;
        sprite.position.x = Params.Left;
        sprite.position.y = Params.Top;
        sprite.rotation = rotation;
        sprite.zIndex = Params.zIndex ? Params.zIndex : 0;
        sprite.alpha = Params.alpha ? Params.alpha : 1;
        kdSpritesDrawn.set(id, true);
        return true;
    }
    return false;
}
function DrawButtonVis(Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, Stretch, zIndex = 100, options) {
    DrawButtonVisTo(kdcanvas, Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, Stretch, zIndex, options);
}
function DrawButtonVisTo(Container, Left, Top, Width, Height, Label, Color, Image, HoveringText, Disabled, NoBorder, FillColor, FontSize, ShiftText, Stretch, zIndex = 100, options) {
    let hover = ((MouseX >= Left) && (MouseX <= Left + Width) && (MouseY >= Top) && (MouseY <= Top + Height) && !CommonIsMobile && !Disabled);
    if (!NoBorder || FillColor)
        DrawBoxKDTo(Container, Left, Top, Width, Height, options?.fillcolor != undefined ? options.fillcolor : (FillColor ? FillColor : (hover ? (KDTextGray2) : KDButtonColor)), NoBorder, options?.alpha || KDBaseButtonAlpha, zIndex, options?.bordercolor != undefined ? options.bordercolor : undefined);
    if (hover) {
        let pad = 1;
        DrawRectKD(Container || kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "out", {
            Left: Left + pad,
            Top: Top + pad,
            Width: Width - 2 * pad + 1,
            Height: Height - 2 * pad + 1,
            Color: options?.highlightcolor || KDHighlightColor,
            LineWidth: 2,
            zIndex: zIndex + 0.005,
        });
        KDButtonHovering = 2;
    }
    let textPush = 0;
    let images = Image == null ? [] : (Array.isArray(Image) ? Image : [Image]);
    for (let imgIdx = 0; imgIdx < images.length; imgIdx++) {
        let imgPath = images[imgIdx];
        if (!imgPath)
            continue;
        let img = KDTex(imgPath);
        if (Stretch || options?.scaleImage) {
            let o = {
                zIndex: zIndex + 0.01 + imgIdx * 0.001,
                filters: options?.filters,
            };
            if (options?.tint)
                o['tint'] = options.tint;
            if (options?.spritealpha)
                o['alpha'] = options.spritealpha;
            KDDraw(Container || kdcanvas, kdpixisprites, Left + "," + Top + imgPath + "w" + Width + "h" + Height, imgPath, Left, Top, Math.min(Height, Width), Math.min(Height, Width), undefined, o);
        }
        else {
            let o = {
                zIndex: zIndex + 0.01 + imgIdx * 0.001,
                filters: options?.filters,
            };
            if (options?.tint)
                o['tint'] = options.tint;
            if (options?.spritealpha)
                o['alpha'] = options.spritealpha;
            let centered = options?.centered
                || (img.orig.width > Width
                    && img.orig.height > Height);
            KDDraw(Container || kdcanvas, kdpixisprites, Left + "," + Top + imgPath + "w" + Width + "h" + Height, imgPath, (centered ? Width / 2 - img.orig.width / 2 : 2) + Left, Top + Height / 2 - img.orig.height / 2, img.orig.width, img.orig.height, undefined, o);
        }
        if (imgIdx == 0)
            textPush = options?.scaleImage ? (Math.min(Width, Height)) : img.orig.width;
    }
    if ((HoveringText) && (MouseX >= Left) && (MouseX <= Left + Width) && (MouseY >= Top) && (MouseY <= Top + Height)) {
        DrawTextFitKDTo(Container || kdcanvas, HoveringText, Left + Width / 2 + (ShiftText ? textPush * 0.5 : 0), Top + Math.floor(Height / 2), Width - 4 - Width * 0.04 - (textPush ? (textPush + (ShiftText ? 0 : Width * 0.04)) : Width * 0.04), KDBaseWhite, undefined, undefined, undefined, zIndex + 1, undefined, undefined, undefined, KDButtonFont);
    }
    else if (Label)
        DrawTextFitKDTo(Container || kdcanvas, Label, Left + Width / 2 + (ShiftText ? textPush * 0.5 : 0), Top + Math.floor(Height / 2), (options?.centerText) ? Width : (Width - 4 - Width * 0.04 - (textPush ? (textPush + (ShiftText ? 0 : Width * 0.04)) : Width * 0.04)), Color, (options && options.noTextBG) ? "none" : undefined, FontSize, undefined, zIndex + 0.009, options?.textalpha, undefined, options?.unique, KDButtonFont, options?.wrap);
    if (options?.hotkey) {
        let size = (FontSize * 0.6) || 14;
        DrawTextFitKDTo(Container || kdcanvas, options?.hotkey, Left + Width - 4, Top + (size / 2) + 2, Width * 0.7, KDBaseVLightGrey, (options && options.noTextBG) ? "none" : undefined, size, "right", zIndex + 0.02, options?.textalpha, undefined, undefined, KDButtonFont);
    }
}
function DrawCheckboxVis(Left, Top, Width, Height, Text, IsChecked, Disabled = false, TextColor = KDTextGray0, CheckImage = "UI/Checked.png", options) {
    DrawTextFitKD(Text, Left + 100, Top + 33, 1000, TextColor, "#333333", undefined, "left");
    DrawButtonVis(Left, Top, Width, Height, "", Disabled ? "#ebebe4" : KDBaseWhite, IsChecked ? (KinkyDungeonRootDirectory + CheckImage) : "", null, Disabled, undefined, undefined, undefined, undefined, undefined, options?.zIndex, options);
}
function DrawCheckboxKDEx(name, func, enabled, Left, Top, Width, Height, Text, IsChecked, Disabled = false, TextColor = KDTextGray0, CheckImage = "UI/Checked.png", options) {
    DrawTextFitKD(Text, Left + 10 + Width, Top + Height / 2 + 1, options?.maxWidth || 1000, TextColor, "#333333", options?.fontSize, "left");
    DrawButtonKDEx(name, func, enabled, Left, Top, Width, Height, "", Disabled ? "#ebebe4" : KDBaseWhite, IsChecked ? (KinkyDungeonRootDirectory + CheckImage) : "", null, Disabled, undefined, undefined, undefined, undefined, options);
}
function DrawCheckboxKDExTo(canvas, name, func, enabled, Left, Top, Width, Height, Text, IsChecked, Disabled = false, TextColor = KDTextGray0, CheckImage = "UI/Checked.png", options, priority = 0) {
    DrawTextFitKDTo(canvas, Text, Left + 10 + Width, Top + Height / 2 + 1, options?.maxWidth || 1000, TextColor, "#333333", options?.fontSize, "left");
    DrawButtonKDExTo(canvas, name, func, enabled, Left, Top, Width, Height, "", Disabled ? "#ebebe4" : KDBaseWhite, IsChecked ? (KinkyDungeonRootDirectory + CheckImage) : "", null, Disabled, undefined, undefined, undefined, undefined, options, priority);
}
function DrawBackNextButtonVis(Left, Top, Width, Height, Label, _Color, Image, _BackText, _NextText, Disabled, ArrowWidth, _NoBorder, options) {
    if (ArrowWidth == null || ArrowWidth > Width / 2)
        ArrowWidth = Width / 2;
    const LeftSplit = Left + ArrowWidth;
    const RightSplit = Left + Width - ArrowWidth;
    DrawBoxKD(Left, Top, Width, Height, KDButtonColor, undefined, options?.alpha || KDBaseButtonAlpha);
    if (MouseIn(Left, Top, Width, Height) && !CommonIsMobile && !Disabled) {
        if (MouseX > RightSplit) {
            DrawRectKD(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "a", {
                Left: RightSplit + 4,
                Top: Top + 4,
                Width: ArrowWidth - 8,
                Height: Height - 8,
                Color: KDBaseWhite,
                LineWidth: 1,
                zIndex: 101,
            });
        }
        else if (MouseX <= LeftSplit) {
            DrawRectKD(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "a", {
                Left: Left + 4,
                Top: Top + 4,
                Width: ArrowWidth - 8,
                Height: Height - 8,
                Color: KDBaseWhite,
                LineWidth: 1,
                zIndex: 101,
            });
        }
        else {
            DrawRectKD(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "a", {
                Left: Left + ArrowWidth + 4,
                Top: Top + 4,
                Width: Width - ArrowWidth * 2 - 8,
                Height: Height - 8,
                Color: KDBaseWhite,
                LineWidth: 1,
                zIndex: 101,
            });
        }
    }
    else if (CommonIsMobile && ArrowWidth < Width / 2 && !Disabled) {
        DrawRectKD(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "a1", {
            Left: Left + 4,
            Top: Top + 4,
            Width: ArrowWidth - 8,
            Height: Height - 8,
            Color: KDBaseWhite,
            LineWidth: 1,
            zIndex: 101,
        });
        DrawRectKD(kdcanvas, kdpixisprites, Left + "," + Top + Image + "w" + Width + "h" + Height + "a2", {
            Left: RightSplit + 4,
            Top: Top + 4,
            Width: ArrowWidth - 8,
            Height: Height - 8,
            Color: KDBaseWhite,
            LineWidth: 1,
            zIndex: 101,
        });
    }
    DrawTextFitKD(Label, Left + Width / 2, Top + (Height / 2) + 1, (CommonIsMobile) ? Width - 6 : Width - 36, KDBaseWhite, undefined, undefined, undefined, undefined, undefined, undefined, undefined, options?.font);
}
function KDDrawMap(CamX, CamY, CamX_offset, CamY_offset, _CamX_offsetVis, _CamY_offsetVis, Debug) {
    let tooltip = "";
    let KinkyDungeonForceRender = "";
    let KinkyDungeonForceRenderFloor = "";
    for (let b of Object.values(KinkyDungeonPlayerBuffs)) {
        if (b && b.mushroom) {
            KinkyDungeonForceRender = '2';
            KinkyDungeonForceRenderFloor = "cry";
        }
    }
    let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
    let drawFloor = altType?.skin ? altType.skin : (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint);
    let noReplace = "";
    let noReplace_skin = {};
    for (let tile of Object.values(KDMapData.TilesSkin)) {
        if (tile.skin && noReplace_skin[tile.skin] != undefined) {
            let paramskin = KinkyDungeonMapParams[drawFloor];
            if (paramskin.noReplace)
                noReplace_skin[tile.skin] = paramskin.noReplace;
            else
                noReplace_skin[tile.skin] = "";
        }
    }
    let params = KinkyDungeonMapParams[drawFloor];
    if (params?.noReplace)
        noReplace = params.noReplace;
    let rows = KDMapData.Grid.split('\n');
    for (let R = -1; R <= KinkyDungeonGridHeightDisplay + 1; R++) {
        for (let X = -1; X <= KinkyDungeonGridWidthDisplay + 1; X++) {
            let RY = R + CamY;
            let RX = X + CamX;
            if (!rows[RY])
                continue;
            let allowFog = KDAllowFog();
            if (RY >= 0 && RY < KDMapData.GridHeight && RX >= 0 && RX < KDMapData.GridWidth && (KinkyDungeonVisionGet(RX, RY) > 0 || (allowFog && KinkyDungeonFogGet(RX, RY) > 0))) {
                if (Debug) {
                    if (KDCommanderChokes && KDCommanderChokes[RX + "," + RY]) {
                        DrawTextFitKD("Choke", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, KinkyDungeonGridSizeDisplay, "#aaaaaA");
                    }
                    if (KinkyDungeonTilesGet(RX + "," + RY)) {
                        if (KinkyDungeonTilesGet(RX + "," + RY).Lock)
                            DrawTextFitKD(KinkyDungeonTilesGet(RX + "," + RY).Lock, (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#aaaaaA");
                        if (KinkyDungeonTilesGet(RX + "," + RY).MazeBlock)
                            DrawTextFitKD("MazeBlock", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay + 10, KinkyDungeonGridSizeDisplay, "#aaaaaA");
                        if (KinkyDungeonTilesGet(RX + "," + RY).MazeSeed)
                            DrawTextFitKD("MazeSeed", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay + 10, KinkyDungeonGridSizeDisplay, "#aaaaaA");
                        if (KinkyDungeonTilesGet(RX + "," + RY).AI)
                            DrawTextFitKD(KinkyDungeonTilesGet(RX + "," + RY).AI, (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#aaaaaA");
                        if (KinkyDungeonTilesGet(RX + "," + RY).Type == "Prisoner")
                            DrawTextFitKD("Prisoner", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#aaaaaA");
                        if (KinkyDungeonTilesGet(RX + "," + RY).required && KinkyDungeonTilesGet(RX + "," + RY).required)
                            DrawTextFitKD(KinkyDungeonTilesGet(RX + "," + RY).required[0], (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 3, KinkyDungeonGridSizeDisplay, "#aaaaaA");
                        if (KinkyDungeonTilesGet(RX + "," + RY).Label && KinkyDungeonTilesGet(RX + "," + RY).required)
                            DrawTextFitKD(KinkyDungeonTilesGet(RX + "," + RY).required[0], (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 1.5, KinkyDungeonGridSizeDisplay, "#aaaaaA");
                        if (KDMapData.Traffic[RY][RX] && KinkyDungeonState == "Game")
                            DrawTextFitKD("traffic_" + KDMapData.Traffic[RY][RX], (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 3, KinkyDungeonGridSizeDisplay, KDBaseNeon);
                        if (KinkyDungeonTilesGet(RX + "," + RY).OL)
                            DrawTextFitKD("Offlimits", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 3, KinkyDungeonGridSizeDisplay, KDBaseRed);
                        if (KinkyDungeonTilesGet(RX + "," + RY).NW)
                            DrawTextFitKD("NoWander", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 4, KinkyDungeonGridSizeDisplay, KDBaseRed);
                        if (KinkyDungeonTilesGet(RX + "," + RY).Jail)
                            DrawTextFitKD("Jail", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 5, KinkyDungeonGridSizeDisplay, KDBaseRed);
                        if (KinkyDungeonTilesGet(RX + "," + RY).Priority)
                            DrawTextFitKD("Priority", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay * 0.67, KinkyDungeonGridSizeDisplay, KDBaseNeon);
                    }
                    for (let p of KinkyDungeonPOI) {
                        if (p.x == RX && p.y == RY) {
                            DrawTextFitKD("POI" + (p.requireTags && p.requireTags.includes("endpoint") ? "Endpoint" : ""), (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay / 3, KinkyDungeonGridSizeDisplay, "#999999");
                            DrawTextFitKD((p.favor && p.favor.length > 0 ? p.favor[0] : ""), (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#999999");
                            DrawTextFitKD((p.chance || 1.0) * 100 + "%", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 3, KinkyDungeonGridSizeDisplay, "#999999");
                        }
                    }
                    if (KDMapData.Labels)
                        for (let k of Object.values(KDMapData.Labels)) {
                            for (let p of k) {
                                if (p.x == RX && p.y == RY) {
                                    DrawTextFitKD(p.name, (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay - KinkyDungeonGridSizeDisplay / 3, KinkyDungeonGridSizeDisplay, "#999999");
                                    DrawTextFitKD(p.type, (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, "#999999");
                                }
                            }
                        }
                    for (let p of KDGameData.KeyringLocations) {
                        if (p.x == RX && p.y == RY) {
                            DrawTextFitKD("Keyring", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 2, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay + KinkyDungeonGridSizeDisplay / 3, KinkyDungeonGridSizeDisplay, "#999999");
                        }
                    }
                }
                let floor = KDMapData.TilesSkin[RX + "," + RY] ?
                    (KDMapData.TilesSkin[RX + "," + RY].force ? KDMapData.TilesSkin[RX + "," + RY].skin : KinkyDungeonMapIndex[KDMapData.TilesSkin[RX + "," + RY].skin] || KDMapData.TilesSkin[RX + "," + RY].skin)
                    : drawFloor;
                let vision = KinkyDungeonVisionGet(RX, RY);
                let nR = KDMapData.TilesSkin[RX + "," + RY] ? noReplace : noReplace_skin[floor];
                let code = KinkyDungeonTilesGet(RX + "," + RY)?.SkinCode || rows[RY][RX];
                let sprite = KinkyDungeonGetSprite(code, RX, RY, vision == 0, nR);
                let sprite2 = KinkyDungeonGetSpriteOverlay(code, RX, RY, vision == 0, nR);
                let sprite3 = KinkyDungeonGetSpriteOverlay2(code, RX, RY, vision == 0, nR);
                if (KinkyDungeonForceRender) {
                    sprite = KinkyDungeonGetSprite(KinkyDungeonForceRender, RX, RY, vision == 0, nR);
                    sprite2 = null;
                    sprite3 = null;
                }
                if (KinkyDungeonForceRenderFloor != "")
                    floor = KinkyDungeonForceRenderFloor;
                let lightColor = (StandalonePatched && KDToggles.LightmapFilter) ? 0xfffafa : KDGetLightColor(RX, RY);
                KDDraw(kdmapboard, kdpixisprites, RX + "," + RY, KinkyDungeonRootDirectory + "Floors/Floor_" + floor + "/" + sprite + ".png", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                    zIndex: -2,
                    tint: (StandalonePatched && KDToggles.LightmapFilter) ? undefined : lightColor,
                });
                if (sprite2)
                    KDDraw(kdmapboard, kdpixisprites, RX + "," + RY + "_o", KinkyDungeonRootDirectory + "FloorGeneric/" + sprite2 + ".png", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                        zIndex: -1.1,
                        tint: (StandalonePatched && KDToggles.LightmapFilter) ? undefined : lightColor,
                    });
                if (sprite3)
                    KDDraw(kdmapboard, kdpixisprites, RX + "," + RY + "_o2", KinkyDungeonRootDirectory + "FloorGeneric/" + sprite3 + ".png", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                        zIndex: -1,
                        tint: (StandalonePatched && KDToggles.LightmapFilter) ? undefined : lightColor,
                    });
                if (rows[RY][RX] == "A") {
                    let color = "";
                    if (KinkyDungeonTilesGet(RX + "," + RY)) {
                        color = KDGoddessColor(KinkyDungeonTilesGet(RX + "," + RY).Name);
                    }
                    if (color)
                        KDDraw(kdmapboard, kdpixisprites, RX + "," + RY + "_a", KinkyDungeonRootDirectory + "ShrineAura.png", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                            tint: string2hex(color),
                        });
                    if (KinkyDungeonTilesGet(RX + "," + RY)?.Quest)
                        KDDraw(kdmapboard, kdpixisprites, RX + "," + RY + "_a2", KinkyDungeonRootDirectory + "ShrineAuraQuest.png", (-CamX_offset + X) * KinkyDungeonGridSizeDisplay, (-CamY_offset + R) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, undefined, {
                            tint: color ? string2hex(color) : 0xfffafa,
                        });
                }
                if (KinkyDungeonVisionGet(RX, RY) > 0
                    && (KinkyDungeonTilesGet(RX + "," + RY) && rows[RY][RX] == "A" || KinkyDungeonTilesGet(RX + "," + RY) && rows[RY][RX] == "M")
                    && MouseIn(canvasOffsetX + (-CamX_offset + X) * KinkyDungeonGridSizeDisplay, canvasOffsetY + (-CamY_offset + R) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay)) {
                    tooltip = TextGet("KinkyDungeon" + KinkyDungeonTilesGet(RX + "," + RY).Type + "Tooltip").replace("SHRINETYPE", TextGet("KinkyDungeonShrine" + KinkyDungeonTilesGet(RX + "," + RY).Name));
                }
            }
        }
    }
    return {
        tooltip: tooltip,
        KinkyDungeonForceRender: KinkyDungeonForceRender,
    };
}
function KDDraw(Container, Map, id, Image, Left, Top, Width, Height, Rotation, options, Centered, SpritesDrawn, Scale, Nearest) {
    let sprite = Map.get(id);
    if (!sprite?.parent) {
        sprite = null;
        Map.delete(id);
    }
    ;
    if (!sprite) {
        if (Nearest) {
            PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        }
        else
            PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;
        let tex = KDTex(Image, Nearest);
        if (tex) {
            if (Nearest)
                sprite = PIXI.Sprite.from(KDTex(Image, Nearest), {
                    scaleMode: PIXI.SCALE_MODES.NEAREST,
                });
            else
                sprite = PIXI.Sprite.from(KDTex(Image));
            Map.set(id, sprite);
            Container.addChild(sprite);
        }
        if (Nearest) {
            PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;
        }
    }
    if (sprite) {
        sprite.visible = true;
        sprite.interactive = false;
        let tex = KDTex(Image);
        if (tex)
            sprite.texture = tex;
        sprite.name = id;
        sprite.position.x = Left;
        sprite.position.y = Top;
        if (Width)
            sprite.width = Width;
        if (Height)
            sprite.height = Height;
        if (Scale) {
            sprite.scale.x = Scale;
            sprite.scale.y = Scale;
        }
        if (Centered) {
            sprite.anchor.set(0.5);
        }
        if (Rotation != undefined)
            sprite.rotation = Rotation;
        if (options) {
            if (options.filters && sprite.cacheAsBitmap) {
                sprite.filters = null;
            }
            else {
                for (let [k, v] of Object.entries(options)) {
                    if (v != undefined || k != "tint")
                        sprite[k] = v;
                }
            }
            if (options.zIndex != undefined) {
                sprite.zIndex = options.zIndex;
            }
            if (options.scalex != undefined) {
                sprite.scale.x = sprite.scale.x * options.scalex;
            }
            if (options.scaley != undefined) {
                sprite.scale.y = sprite.scale.y * options.scaley;
            }
            if (options.anchorx != undefined) {
                if (options.normalizeAnchorX) {
                    sprite.anchor.x = options.anchorx * (options.normalizeAnchorX / sprite.texture.width);
                }
                else {
                    sprite.anchor.x = options.anchorx;
                }
            }
            if (options.anchory != undefined) {
                if (options.normalizeAnchorY) {
                    sprite.anchor.y = options.anchory * (options.normalizeAnchorY / sprite.texture.height);
                }
                else {
                    sprite.anchor.y = options.anchory;
                }
            }
        }
        if (SpritesDrawn)
            SpritesDrawn.set(id, true);
        else
            kdSpritesDrawn.set(id, true);
        return sprite;
    }
    return null;
}
let KDAdaptiveTexCache = new Map();
let KDAdaptiveTexCacheThreshold = 2;
let KDAdaptiveTexCacheMax = 10;
function KDTickAdaptiveTexCache(delta) {
    if (delta > 0)
        for (let entry of KDAdaptiveTexCache.entries()) {
            KDAdaptiveTexCache.set(entry[0], entry[1] - delta);
            if (!KDAdaptiveTexCache.get(entry[0]) || KDAdaptiveTexCache.get(entry[0]) < 0)
                KDAdaptiveTexCache.delete(entry[0]);
        }
}
function KDDoAdaptiveTexCache(id, delta) {
    let curr = KDAdaptiveTexCache.get(id) || 0;
    KDAdaptiveTexCache.set(id, Math.min(curr + delta, KDAdaptiveTexCacheMax));
    return curr + delta > KDAdaptiveTexCacheThreshold;
}
function KDGetOrMakeRenderTexture(Image, Nearest, id = "", filters, force = false, useAtlas = true, resolution = 1) {
    let baseTex = KDTex(Image, Nearest);
    if (!force && (!filters || filters.length == 0))
        return baseTex;
    kdTexlastLookup.set(Image + id, CommonTime());
    if (!baseTex)
        return null;
    let res = useAtlas ? baseTex.baseTexture.resource.src : Image;
    if (!res || (!force && !KDDoAdaptiveTexCache(res + id, 1) && !kdRTcache.get(res + id)))
        return null;
    kdRTlastLookup.set(res + id, CommonTime());
    let rt = kdRTcache.get(res + id) || PIXI.RenderTexture.create({
        width: useAtlas ? baseTex.baseTexture.width : baseTex.width,
        height: useAtlas ? baseTex.baseTexture.height : baseTex.height,
        resolution: resolution * (useAtlas ? baseTex.baseTexture.resolution : baseTex.resolution)
    });
    if (!kdRTcache.get(res + id) && res) {
        let sprite = (kdpixisprites.get(res + id) && !kdpixisprites.get(res + id).destroyed) ?
            kdpixisprites.get(res + id) : PIXI.Sprite.from(useAtlas ? baseTex.baseTexture : baseTex);
        sprite.setTransform();
        sprite.filters = filters;
        PIXIapp.renderer.render(sprite, {
            renderTexture: rt,
        });
        kdpixisprites.set(res + id, sprite);
        kdRTSpritecache.set(rt, sprite);
        if (!kdRTcache.get(res + id))
            kdRTcache.set(res + id, rt);
    }
    let tex = kdTexcache.get(Image + id)
        || new PIXI.Texture(rt.baseTexture, useAtlas ? baseTex.frame : undefined, useAtlas ? baseTex.orig : undefined, useAtlas ? baseTex.trim : undefined, useAtlas ? baseTex.rotate : undefined, useAtlas ? baseTex.defaultAnchor : undefined, useAtlas ? baseTex.defaultBorders : undefined);
    if (!kdTexcache.get(Image + id))
        kdTexcache.set(Image + id, tex);
    return tex;
}
function KDDrawRT(Container, Map, id, filterid, Image, Left, Top, Width, Height, Rotation, options, Centered, SpritesDrawn, Scale, Nearest, baseFilters, force = false, useAtlas = true, resolution = 1, autoAdd = true) {
    let sprite = Map.get(id);
    if (!sprite?.parent) {
        sprite = null;
        Map.delete(id);
    }
    ;
    let mergeFilters = false;
    if (!sprite) {
        if (Nearest && StandalonePatched) {
            PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        }
        let tex = KDGetOrMakeRenderTexture(Image, Nearest, filterid, baseFilters, force, useAtlas, resolution);
        if (tex) {
            sprite = new PIXI.Sprite(tex);
            Map.set(id, sprite);
            if (autoAdd)
                Container.addChild(sprite);
        }
        else {
            mergeFilters = true;
            if (Nearest)
                sprite = PIXI.Sprite.from(KDTex(Image, Nearest), {
                    scaleMode: PIXI.SCALE_MODES.NEAREST,
                });
            else
                sprite = PIXI.Sprite.from(KDTex(Image));
            Map.set(id, sprite);
            if (autoAdd)
                Container.addChild(sprite);
        }
        if (Nearest && StandalonePatched) {
            PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.LINEAR;
        }
    }
    if (sprite && sprite.texture && sprite.texture.orig) {
        sprite.visible = true;
        sprite.interactive = false;
        sprite.name = id;
        sprite.path = Image;
        sprite.position.x = Left;
        sprite.position.y = Top;
        if (Width)
            sprite.width = Width;
        if (Height)
            sprite.height = Height;
        if (Scale) {
            sprite.scale.x = Scale;
            sprite.scale.y = Scale;
        }
        if (Centered) {
            sprite.anchor.set(0.5);
        }
        if (Rotation != undefined)
            sprite.rotation = Rotation;
        if (options) {
            if (options.filters && sprite.cacheAsBitmap) {
                sprite.filters = null;
            }
            else {
                for (let [k, v] of Object.entries(options)) {
                    if (v != undefined || k != "tint")
                        sprite[k] = v;
                }
            }
            if (mergeFilters && baseFilters?.length > 0 && options?.filters) {
                sprite.filters = [...options.filters, ...baseFilters];
            }
            if (options.zIndex != undefined) {
                sprite.zIndex = options.zIndex;
            }
            if (options.scalex != undefined) {
                sprite.scale.x = sprite.scale.x * options.scalex;
            }
            if (options.scaley != undefined) {
                sprite.scale.y = sprite.scale.y * options.scaley;
            }
            if (options.anchorx != undefined) {
                if (options.normalizeAnchorX) {
                    sprite.anchor.x = options.anchorx * (options.normalizeAnchorX / sprite.texture.width);
                }
                else {
                    sprite.anchor.x = options.anchorx;
                }
            }
            if (options.anchory != undefined) {
                if (options.normalizeAnchorY) {
                    sprite.anchor.y = options.anchory * (options.normalizeAnchorY / sprite.texture.height);
                }
                else {
                    sprite.anchor.y = options.anchory;
                }
            }
        }
        if (SpritesDrawn)
            SpritesDrawn.set(id, true);
        else
            kdSpritesDrawn.set(id, true);
        return sprite;
    }
    return null;
}
let OPTIONS_NEAREST = { scaleMode: PIXI.SCALE_MODES.NEAREST };
let errorImg = {};
function KDTex(Image, Nearest) {
    if (kdpixitex.has(Image))
        return kdpixitex.get(Image);
    if (errorImg[KDModFiles[Image] || Image])
        return null;
    try {
        let tex = Nearest ? PIXI.Texture.from(KDModFiles[Image] || Image, OPTIONS_NEAREST) : PIXI.Texture.from(KDModFiles[Image] || Image);
        if (!tex) {
            errorImg[KDModFiles[Image] || Image] = true;
        }
        else {
            kdpixitex.set(Image, tex);
        }
        return tex;
    }
    catch (e) {
        console.log("Failed to find texture " + Image);
        return null;
    }
}
function string2hex(str) {
    return PIXI.utils.string2hex(str);
}
function GetAdjacentList(list, index, width) {
    return {
        left: list.slice(0, index),
        right: list.slice(index + width),
    };
}
function KDEnumLights(data) {
    let l = null;
    for (let t of Object.keys(KDMapData.Tiles)) {
        let tile = KinkyDungeonTilesGet(t);
        let x = parseInt(t.split(',')[0]);
        let y = parseInt(t.split(',')[1]);
        if (tile && tile.Light && x && y) {
            l = { x: x, y: y + (tile.Offset ? 1 : 0), y_orig: y, brightness: tile.Light, color: tile.lightColor };
            data.lights.push(l);
            data.maplights.push(l);
        }
    }
    for (let b of KDMapData.Bullets) {
        if (b.bullet?.bulletColor && b.bullet.bulletLight > 0) {
            l = { x: b.x, y: b.y, y_orig: b.y, brightness: b.bullet.bulletLight, color: b.bullet.bulletColor };
            data.lights.push(l);
        }
    }
    for (let location of Object.values(KDMapData.EffectTiles)) {
        for (let tile of Object.values(location)) {
            if (tile.duration > 0) {
                if (tile.lightColor) {
                    l = { x: tile.x + Math.round((tile.xoffset - 0.49) || 0), y: tile.y + Math.round((tile.yoffset - 0.49) || 0), y_orig: tile.y, brightness: tile.brightness, color: tile.lightColor };
                    data.effecttilelights.push(l);
                }
            }
        }
    }
}
function KDUpdateVision(CamX, CamY, _CamX_offset, _CamY_offset) {
    KinkyDungeonUpdateLightGrid = false;
    KDRedrawFog = 2;
    let viewpoints = [{ x: KinkyDungeonPlayerEntity.x, y: KinkyDungeonPlayerEntity.y, brightness: KinkyDungeonDeaf ? 2 : 4 }];
    let data = {
        lights: [],
        maplights: [],
        effecttilelights: [],
    };
    KDEnumLights(data);
    KinkyDungeonSendEvent("getLights", data);
    KinkyDungeonMakeBrightnessMap(KDMapData.GridWidth, KDMapData.GridHeight, KDMapData.MapBrightness, data.lights, KDVisionUpdate);
    KinkyDungeonMakeVisionMap(KDMapData.GridWidth, KDMapData.GridHeight, viewpoints, data.lights, KDVisionUpdate, KDMapData.MapBrightness);
    if (KinkyDungeonUpdateLightGrid) {
        KinkyDungeonMakeVisionMap(KDMapData.GridWidth, KDMapData.GridHeight, viewpoints, data.lights, 0, KDMapData.MapBrightness);
    }
    if (CamX != undefined) {
        if (KDToggles.Bloom && !(KinkyDungeonBlindLevel >= 2)) {
            let pad = (324 - KinkyDungeonGridSizeDisplay) / 2;
            for (let light of [...data.lights, ...data.maplights, ...data.effecttilelights]) {
                if (!light.nobloom && KinkyDungeonVisionGet(light.x_orig || light.x, light.y_orig || light.y)) {
                    KDDraw(kdgameboard, kdlightsprites, `${light.x},${light.y}_${light.brightness}_${light.color || 0xfffafa}`, KinkyDungeonRootDirectory + "Light.png", (light.x - CamX + (light.visualxoffset || 0)) * KinkyDungeonGridSizeDisplay - pad, (-CamY + light.y + (light.visualyoffset || 0)) * KinkyDungeonGridSizeDisplay - pad, KinkyDungeonGridSizeDisplay + pad * 2, KinkyDungeonGridSizeDisplay + pad * 2, undefined, {
                        tint: light.color || 0xfffafa,
                        alpha: Math.min(1, (1 - 0.5 * (KDGameData.visionAdjust || 0)) * Math.max(0.001, light.brightness / 20)),
                        blendMode: PIXI.BLEND_MODES.ADD,
                        zIndex: -0.1,
                    });
                }
            }
        }
        KDCullSpritesList(kdlightsprites);
    }
    KDVisionUpdate = 0;
}
function KDObjectTooltip(x, y, fallback) {
    let tile = KinkyDungeonTilesGet(x + "," + y);
    if (tile) {
        let Type = tile.Type;
        if (Type
            && TileTypeTooltipOverride[Type]
            && tile[Type]
            && TileTypeTooltipOverride[Type][tile[Type]]) {
            Type = TileTypeTooltipOverride[Type][tile[Type]];
        }
        if (Type
            && TileTypeTooltipOverride[Type]
            && tile[Type]
            && TileTypeTooltipOverride[Type][tile[Type]]) {
            Type = TileTypeTooltipOverride[Type][tile[Type]];
        }
        return Type != undefined ? Type : fallback;
    }
    return fallback;
}
let KDTileTooltips = {
    '1': () => { return { color: "#aaaaaa", text: "1" }; },
    '0': () => { return { color: "#444444", text: "0" }; },
    '2': () => { return { color: "#444444", text: "2" }; },
    'R': () => { return { color: KDBaseWhite, noInspect: true, text: "R" }; },
    'Y': () => { return { color: KDBaseWhite, noInspect: true, text: "Y" }; },
    'L': () => { return { color: "#812913", noInspect: true, text: "L" }; },
    'F': () => { return { color: "#812913", noInspect: true, text: "F" }; },
    'A': () => { return { color: "#6d89d7", noInspect: true, text: "A" }; },
    'M': () => { return { color: "#cb6161", noInspect: true, text: "M" }; },
    'a': () => { return { color: KDBaseWhite, text: "a" }; },
    'O': () => { return { color: "#92e8c0", text: "O" }; },
    'o': () => { return { color: KDBaseWhite, text: "o" }; },
    'C': (x, y) => {
        let tile = KinkyDungeonTilesGet(x + ',' + y);
        return { color: "#ffee83", noInspect: true, text: tile?.Faction ? "C2" : "C", desc: tile?.Faction ? TextGet("KDChestTooltip") + TextGet("KinkyDungeonFaction" + (tile.Faction))
                : undefined };
    },
    'c': () => { return { color: KDBaseWhite, text: "c" }; },
    'T': () => { return { color: "#444444", text: "T" }; },
    '4': () => { return { color: "#898989", noInspect: true, text: "4" }; },
    'X': () => { return { color: "#aaaaaa", text: "X" }; },
    '?': () => { return { color: KDBaseWhite, noInspect: true, text: "Hook" }; },
    ',': () => { return { color: KDBaseWhite, noInspect: true, text: "Hook" }; },
    'S': () => { return { color: "#6a8eb3", noInspect: true, text: "S" }; },
    's': () => { return { color: "#96caff", noInspect: true, text: "s" }; },
    '5': (x, y) => {
        let tile = KinkyDungeonTilesGet(x + ',' + y);
        return { color: KDBaseWhite, noInspect: true, text: tile?.Tooltip ? tile.Tooltip : "5",
            desc: tile?.Tooltip ? TextGet("KDEffectTileTooltip" + tile.Tooltip + "Desc") : undefined };
    },
    '6': (x, y) => {
        let tile = KinkyDungeonTilesGet(x + ',' + y);
        return { color: KDBaseWhite, noInspect: true, text: tile?.Tooltip ? tile.Tooltip : "6",
            desc: tile?.Tooltip ? TextGet("KDEffectTileTooltip" + tile.Tooltip + "Desc") : undefined };
    },
    '7': (x, y) => {
        let tile = KinkyDungeonTilesGet(x + ',' + y);
        return { color: KDBaseWhite, noInspect: true, text: tile?.Tooltip ? tile.Tooltip : "7",
            desc: tile?.Tooltip ? TextGet("KDEffectTileTooltip" + tile.Tooltip + "Desc") : undefined };
    },
    'H': (x, y) => {
        let tile = KinkyDungeonTilesGet(x + ',' + y);
        return { color: "#96caff", noInspect: true, text: "H", desc: TextGet("KDLeadsTo").replace("PLCE", KDGetDungeonName({
                mapX: KDGetCurrentLocation().mapX,
                mapY: KDGetCurrentLocation().mapY,
                room: tile?.RoomType
            })) };
    },
    'G': () => { return { color: "#69bf3e", noInspect: true, text: "G" }; },
    'g': () => { return { color: "#aaaaaa", noInspect: true, text: "g", desc: TextGet("KDTileTooltipDescg") }; },
    ']': () => { return { color: "#52244a", noInspect: true, text: "]", desc: TextGet("KDTileTooltipDesc]") }; },
    '[': () => { return { color: "#4b357a", noInspect: true, text: "[", desc: TextGet("KDTileTooltipDesc[") }; },
    'B': () => { return { color: "#5151fb", noInspect: true, text: "B" }; },
    '@': () => { return { color: KDBaseWhite, noInspect: true, text: "@" }; },
    'b': () => { return { color: "#aaaaaa", noInspect: true, text: "b" }; },
    'D': () => { return { color: "#9c4f3e", noInspect: true, text: "D" }; },
    'd': () => { return { color: "#7e4336", noInspect: true, text: "d" }; },
    'Z': () => { return { color: KDBaseWhite, noInspect: true, text: "Z" }; },
    'z': () => { return { color: KDBaseWhite, noInspect: true, text: "z" }; },
    't': () => { return { color: "#aa55ff", noInspect: true, text: "t" }; },
    'u': () => { return { color: KDBaseWhite, noInspect: true, text: "u" }; },
    'V': () => { return { color: KDBaseWhite, noInspect: true, text: "V" }; },
    'v': () => { return { color: KDBaseWhite, noInspect: true, text: "v" }; },
    'N': () => { return { color: "#4c6885", noInspect: true, text: "N" }; },
    '=': () => { return { color: "#aaaaaa", noInspect: true, text: "=" }; },
    '+': () => { return { color: KDBaseWhite, noInspect: true, text: "+" }; },
};
function KDGetTileColor(x, y) {
    let color = "";
    if (!KDIsInBounds(x, y, 0))
        return KDBaseBlack;
    let eTile = KDGetEffectTiles(x, y);
    let maxPri = -1000;
    let maxTile = null;
    for (let tile of Object.entries(eTile)) {
        if (tile[1].priority > maxPri && KDEffectTileTooltips[tile[0]] && KDCanSeeEffectTile(tile[1])) {
            maxTile = tile[0];
            maxPri = tile[1].priority;
        }
    }
    if (maxTile) {
        color = KDEffectTileTooltips[maxTile].color;
    }
    else {
        let tile = KinkyDungeonMapGet(x, y);
        if (KDTileTooltips[tile]) {
            color = KDTileTooltips[tile](x, y).color;
        }
    }
    return color || "#444444";
}
function KDDrawTileTooltip(maptile, x, y, offset) {
    let TooltipList = [];
    TooltipList.push({
        str: TextGet("KDTileTooltip" + KDTileTooltips[maptile](x, y).text),
        fg: KDTileTooltips[maptile](x, y).color,
        bg: KDBaseBlack,
        size: 24,
        center: true,
    });
    if (KDTileTooltips[maptile](x, y).desc)
        TooltipList.push({
            str: KDTileTooltips[maptile](x, y).desc,
            fg: KDBaseWhite,
            bg: KDBaseBlack,
            size: 18,
            center: true,
        });
    return KDDrawTooltip(TooltipList, offset);
}
let KDEffectTileTooltips = {
    'Portals/DarkPortal': {
        color: "#8b53e9",
        code: (tile, _x, _y, TooltipList) => {
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name),
                fg: "#8b53e9",
                bg: KDBaseBlack,
                size: 24,
                center: true,
            });
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 16,
                center: true,
            });
        },
    },
    'DistractionMote': {
        color: "#8b53e9",
        code: (tile, _x, _y, TooltipList) => {
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name),
                fg: "#ff8ed1",
                bg: KDBaseBlack,
                size: 24,
                center: true,
            });
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 16,
                center: true,
            });
        },
    },
    'DistractionMoteContact': {
        color: "#8b53e9",
        code: (tile, _x, _y, TooltipList) => {
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name),
                fg: "#ff8ed1",
                bg: KDBaseBlack,
                size: 24,
                center: true,
            });
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 16,
                center: true,
            });
        },
    },
    'SealSigil': {
        color: "#534fc1",
        code: (tile, _x, _y, TooltipList) => {
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name),
                fg: "#b38eff",
                bg: KDBaseBlack,
                size: 24,
                center: true,
            });
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 16,
                center: true,
            });
        },
    },
    'Runes': {
        color: KDBaseRed,
        code: (tile, _x, _y, TooltipList) => {
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name),
                fg: KDBaseRed,
                bg: KDBaseBlack,
                size: 24,
                center: true,
            });
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 16,
                center: true,
            });
        }
    },
    'RunesTrap': {
        color: "#92e8c0",
        code: (tile, _x, _y, TooltipList) => {
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name),
                fg: "#92e8c0",
                bg: KDBaseBlack,
                size: 24,
                center: true,
            });
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 16,
                center: true,
            });
        }
    },
    'BoobyTrapMagic': {
        color: "#92e8c0",
        code: (tile, _x, _y, TooltipList) => {
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name),
                fg: "#92e8c0",
                bg: KDBaseBlack,
                size: 24,
                center: true,
            });
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 16,
                center: true,
            });
        }
    },
    'BoobyTrap': {
        color: KDBaseWhite,
        code: (tile, _x, _y, TooltipList) => {
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 24,
                center: true,
            });
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 16,
                center: true,
            });
        }
    },
    'NoTeleportPlate': {
        color: KDBaseWhite,
        code: (tile, _x, _y, TooltipList) => {
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 24,
                center: true,
            });
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 16,
                center: true,
            });
        }
    },
    'TeleportPlateMana': {
        color: KDBaseWhite,
        code: (tile, _x, _y, TooltipList) => {
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 24,
                center: true,
            });
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 16,
                center: true,
            });
        }
    },
    'TeleportPlate': {
        color: KDBaseWhite,
        code: (tile, _x, _y, TooltipList) => {
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 24,
                center: true,
            });
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
                fg: KDBaseWhite,
                bg: KDBaseBlack,
                size: 16,
                center: true,
            });
        }
    },
    'Inferno': {
        color: KDBaseOrange,
        code: (tile, _x, _y, TooltipList) => {
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name),
                fg: KDBaseOrange,
                bg: KDBaseBlack,
                size: 24,
                center: true,
            });
            TooltipList.push({
                str: TextGet("KDEffectTileTooltip" + tile.name + "Desc").replace("DAMAGEDEALT", "" + Math.round(10 * KDGetEnvironmentalDmg())),
                fg: "#ffaa55",
                bg: KDBaseBlack,
                size: 16,
                center: true,
            });
        }
    },
    'Ember': {
        color: "#ffaa88",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#ffaa88"); }
    },
    'Ice': {
        color: "#88ffff",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#88ffff"); }
    },
    'Water': {
        color: KDBaseLightBlue,
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseLightBlue); }
    },
    'Vines': {
        color: "#44ff44",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#44ff44", "KDEffectTileTooltipCMDBindings"); }
    },
    'Ropes': {
        color: "#ffae70",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#ffae70", "KDEffectTileTooltipCMDBindings"); }
    },
    'Chains': {
        color: "#aaaaaa",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#aaaaaa", "KDEffectTileTooltipCMDBindings"); }
    },
    'Belts': {
        color: "#8f4d57",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#8f4d57", "KDEffectTileTooltipCMDBindings"); }
    },
    'Fabric': {
        color: KDBaseRed,
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseRed, "KDEffectTileTooltipCMDBindings"); }
    },
    'FabricGreen': {
        color: "#4fd658",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#4fd658", "KDEffectTileTooltipCMDBindings"); }
    },
    'Slime': {
        color: "#d952ff",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#d952ff", "KDEffectTileTooltipCMDSlime"); }
    },
    'Glue': {
        color: "#e7cf1a",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#e7cf1a", "KDEffectTileTooltipCMDGlue"); }
    },
    'Radiance': {
        color: "#ffff00",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseYellow); }
    },
    'Latex': {
        color: "#d952ff",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#d952ff"); }
    },
    'Scanning': {
        color: "#ff527a",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#ff527a"); }
    },
    'LatexThin': {
        color: "#d952ff",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#d952ff"); }
    },
    'LatexBlue': {
        color: "#5294ff",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#5294ff"); }
    },
    'LatexThinBlue': {
        color: "#5294ff",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#5294ff"); }
    },
    'LatexGreen': {
        color: "#52ff9d",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#52ff9d"); }
    },
    'LatexThinGreen': {
        color: "#52ff9d",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#52ff9d"); }
    },
    'LatexPink': {
        color: "#d952ff",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#d952ff"); }
    },
    'LatexThinPink': {
        color: "#d952ff",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#d952ff"); }
    },
    'Steam': {
        color: KDBaseWhite,
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'Smoke': {
        color: KDBaseBlack,
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#888888"); }
    },
    'Torch': {
        color: "#ff8933",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'TorchUnlit': {
        color: "#888888",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'Lantern': {
        color: "#ff8933",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'LanternUnlit': {
        color: "#888888",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'IllusOrb': {
        color: "#ff8933",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'IllusOrbDead': {
        color: "#555555",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'EdgeOrb': {
        color: "#ff8933",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'MotionLamp': {
        color: "#ff8933",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'SpikeTrap': {
        color: KDBaseWhite,
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'SpikeTrapSeen': {
        color: KDBaseWhite,
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'ManaEmpty': {
        color: "#ff8933",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'ManaPartial': {
        color: KDBaseWhite,
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'ManaFull': {
        color: KDBaseWhite,
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'EdgeOrbDead': {
        color: "#555555",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'TorchOrb': {
        color: "#ff8933",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'OrbLantern': {
        color: "#ff8933",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, KDBaseWhite); }
    },
    'Cracked': {
        color: "#ff8844",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#ff8844"); }
    },
    'Rubble': {
        color: "#ff8844",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#ff8844"); }
    },
    'RubbleNoMend': {
        color: "#ff8844",
        code: (tile, _x, _y, TooltipList) => { KDETileTooltipSimple(tile, TooltipList, "#ff8844"); }
    },
};
function KDETileTooltipSimple(tile, TooltipList, color, extra, descColor = KDBaseWhite, extraColor = KDBaseWhite) {
    TooltipList.push({
        str: TextGet("KDEffectTileTooltip" + tile.name),
        fg: color,
        bg: KDBaseBlack,
        size: 24,
        center: true,
    });
    TooltipList.push({
        str: TextGet("KDEffectTileTooltip" + tile.name + "Desc"),
        fg: descColor,
        bg: KDBaseBlack,
        size: 16,
        center: true,
    });
    if (extra) {
        TooltipList.push({
            str: TextGet(extra),
            fg: extraColor,
            bg: KDBaseBlack,
            size: 16,
            center: true,
        });
    }
}
function KDDrawEffectTileTooltip(tile, x, y, offset) {
    let TooltipList = [];
    KDEffectTileTooltips[tile.name].code(tile, x, y, TooltipList);
    return KDDrawTooltip(TooltipList, offset);
}
let KDInspectTooltipZoomedSize = 600;
function KDDrawTooltip(TooltipList, offset, hidebg) {
    let TooltipWidth = 300;
    let TooltipHeight = 0;
    let extra = 5;
    for (let listItem of TooltipList) {
        TooltipHeight += listItem.size + extra;
    }
    TooltipHeight = Math.max(20, TooltipHeight);
    let tooltipX = 2000 - 250 - TooltipWidth;
    let tooltipY = 790 - TooltipHeight - offset;
    let YY = 0;
    if (!hidebg)
        FillRectKD(kdcanvas, kdpixisprites, "inspectTooltip" + offset, {
            Left: tooltipX,
            Top: tooltipY - 25,
            Width: TooltipWidth,
            Height: TooltipHeight + 20,
            Color: KDBaseBlack,
            LineWidth: 1,
            zIndex: 112,
            alpha: 0.7,
        });
    let pad = 10;
    for (let listItem of TooltipList) {
        if (listItem.str)
            DrawTextFitKD(listItem.str, tooltipX + (listItem.center ? TooltipWidth / 2 : pad), tooltipY + YY, TooltipWidth - 2 * pad, listItem.fg, listItem.bg, listItem.size, listItem.center ? "center" : "left", 113);
        if (listItem.npcSprite) {
            let spriteX = tooltipX + (listItem.center ? TooltipWidth / 2 : pad) - (listItem.size) / 4;
            let spriteY = tooltipY + YY - 9;
            let spriteW = TooltipWidth;
            let spriteH = listItem.size;
            let spriteZoom = NPCTooltipZoomCurrent;
            if (listItem.inspect) {
                spriteX -= TooltipWidth * 1.5;
                spriteY = (PIXIHeight - KDInspectTooltipZoomedSize) / 2;
                spriteW = TooltipWidth * 2;
                spriteH = KDInspectTooltipZoomedSize;
                spriteZoom = NPCTooltipZoomCurrent;
            }
            if (KDDrewEnemyTooltipThisFrame) {
                if (!KDDrewEnemyTooltip) {
                    KDRefreshCharacter.set(listItem.npcSprite, true);
                    if (npcTooltipContainer.mask) {
                        let oldmask = npcTooltipContainer.mask;
                        npcTooltipContainer.mask = null;
                        oldmask.destroy();
                    }
                    let mask = new PIXI.Graphics();
                    mask.beginFill(0xffffff);
                    mask.drawRect(spriteX, spriteY, spriteW, spriteH);
                    mask.endFill();
                    npcTooltipContainer.mask = mask;
                }
            }
            if (KDRefreshCharacter.get(listItem.npcSprite)) {
                if (!NPCTags.get(listItem.npcSprite)) {
                    NPCTags.set(listItem.npcSprite, new Map());
                }
                NPCTags.set(listItem.npcSprite, KinkyDungeonUpdateRestraints(listItem.npcSprite, listItem.id, 0));
                KDEntityRestraintMetadata.set(listItem.id, KDUpdateRestraintMetadata(listItem.id, 0));
            }
            KinkyDungeonDressPlayer(listItem.npcSprite, false, false, KDGameData.NPCRestraints ? KDGameData.NPCRestraints[listItem.id + ''] : undefined);
            let zoomX = 0;
            let zoomY = 0;
            let zoomed = false;
            if (!listItem.inspect && KDGameData.CurrentDialog && MouseIn(tooltipX + (listItem.center ? TooltipWidth / 2 : pad) - (listItem.size) / 4, tooltipY + YY - 9, TooltipWidth, listItem.size)) {
                zoomX = 0.8 - 1.6 * (MouseX - (tooltipX + (listItem.center ? TooltipWidth / 2 : pad) - (listItem.size) / 4)) / TooltipWidth;
                zoomY = 1 - 2 * (MouseY - (tooltipY + YY - 9)) / listItem.size;
                zoomed = true;
                NPCTooltipZoomIn = true;
                if (NPCTooltipZoomCurrent == NPCTooltipZoomRatio) {
                    NPCTooltipZoomX = zoomX;
                    NPCTooltipZoomY = zoomY;
                }
                else {
                    if (NPCTooltipZoomCurrent < NPCTooltipZoomRatio) {
                        NPCTooltipZoomCurrent = Math.min(NPCTooltipZoomRatio, NPCTooltipZoomCurrent + 2.4 * KDDrawDelta * 0.001);
                    }
                    if (NPCTooltipZoomX > zoomX)
                        NPCTooltipZoomX = Math.max(zoomX, NPCTooltipZoomX - 2.4 * KDDrawDelta * 0.001);
                    else if (NPCTooltipZoomX < zoomX)
                        NPCTooltipZoomX = Math.min(zoomX, NPCTooltipZoomX + 2.4 * KDDrawDelta * 0.001);
                    if (NPCTooltipZoomY > zoomY)
                        NPCTooltipZoomY = Math.max(zoomY, NPCTooltipZoomY - 2.4 * KDDrawDelta * 0.001);
                    else if (NPCTooltipZoomY < zoomY)
                        NPCTooltipZoomY = Math.min(zoomY, NPCTooltipZoomY + 2.4 * KDDrawDelta * 0.001);
                }
            }
            let xx = (NPCTooltipZoomX * 500 * (TooltipWidth) / 500)
                + spriteX;
            let yy = (NPCTooltipZoomY * 1000 * (listItem.size) / 1000)
                + spriteY;
            let mesh = DrawCharacter(listItem.npcSprite, xx, yy, (listItem.size) / 1000, false, npcTooltipContainer, undefined, undefined, 120, false);
            if (mesh) {
                let zum = (listItem.size) / 1000;
                mesh.scale.x = spriteZoom;
                mesh.scale.y = spriteZoom;
            }
        }
        YY += extra + listItem.size;
    }
    return offset + TooltipHeight + 30;
}
let NPCTooltipZoomRatio = 2;
let NPCTooltipZoomCurrent = 1;
let NPCTooltipZoomX = 0;
let NPCTooltipZoomY = 0;
let NPCTooltipZoomIn = false;
let KDTempElements = new Map();
let KDDrawnElements = new Map();
function KDTextArea(Name, Left, Top, Width, Height) {
    let Element = KDTempElements.get(Name);
    let created = false;
    if (!Element) {
        ElementCreateTextArea(Name);
        Element = document.getElementById(Name);
        KDTempElements.set(Name, Element);
        if (Element)
            created = true;
    }
    KDElementPosition(Name, Left, Top, Width, Height);
    KDDrawnElements.set(Name, Element);
    return { Element: Element, Created: created };
}
function KDTextField(Name, Left, Top, Width, Height, Type = "text", Value = "", MaxLength = "30", TextSize) {
    let Element = KDTempElements.get(Name);
    let created = false;
    if (!Element) {
        ElementCreateInput(Name, Type, Value, MaxLength);
        Element = document.getElementById(Name);
        KDTempElements.set(Name, Element);
        if (Element)
            created = true;
        if (TextSize) {
            Element.setAttribute("fontSize", TextSize);
        }
    }
    KDElementPosition(Name, Left, Top, Width, Height, TextSize);
    KDDrawnElements.set(Name, Element);
    return { Element: Element, Created: created };
}
function KDCullTempElements() {
    for (let Name of KDTempElements.keys()) {
        if (!KDDrawnElements.get(Name)) {
            ElementRemove(Name);
            KDTempElements.delete(Name);
        }
    }
    KDDrawnElements = new Map();
}
function KDElementPosition(ElementID, X, Y, W, H, FS) {
    let E = document.getElementById(ElementID);
    if (!E) {
        console.warn("A call to ElementPosition was made on non-existent element with ID '" + ElementID + "'");
        return;
    }
    if (E.tagName.toLowerCase() === "input" && E.getAttribute("type") === "range" && E.classList.contains("Vertical")) {
        let tmp = W;
        W = H;
        H = tmp;
    }
    documentcache.set(E, {
        x: X,
        y: Y,
    });
    if (!PIXICanvas)
        PIXICanvas = MainCanvas.canvas;
    const HRatio = (PIXICanvas.clientHeight || PIXICanvas.height || 1000) / 1000;
    const WRatio = (PIXICanvas.clientWidth || PIXICanvas.width || 2000) / 2000;
    const Font = (PIXICanvas.clientWidth || PIXICanvas.width || 1000) <= (PIXICanvas.clientHeight || PIXICanvas.height || 2000) * 2 ?
        (PIXICanvas.clientWidth || PIXICanvas.width || 1000) / 50 : (PIXICanvas.clientHeight || PIXICanvas.height || 2000) / 25;
    const Height = H ? H * HRatio : Font * 1.1;
    const Width = W * WRatio;
    const Top = (PIXICanvas.offsetTop || 0) + Y * HRatio - 4;
    const Left = (PIXICanvas.offsetLeft || 0) + (X) * WRatio + 4;
    Object.assign(E.style, {
        fontSize: (FS ? FS : Font) + "px",
        fontFamily: "Verdana",
        position: "fixed",
        left: Left + "px",
        top: Top + "px",
        width: Width + "px",
        height: Height + "px",
        display: "inline"
    });
}
function KDShowQuickInv() {
    return KinkyDungeonShowInventory || (KDGameData.CurrentDialog && KDDialogue[KDGameData.CurrentDialog] && KDDialogue[KDGameData.CurrentDialog].inventory);
}
let KDUpdateFog = false;
let KDLastCamPos = { x: 0, y: 0 };
let KDDrawPlayer = true;
function KDPlayerDrawPoseButtons(C) {
    if (!KDModalArea) {
        KDModalArea_x = 650;
        KDModalArea_y = 430;
        KDModalArea_width = 1000;
        KDModalArea_height = 370;
    }
    KDDrawPoseButtons(C, 700, 580, true, true, true);
}
function KDGetLightColor(x, y) {
    let light = KinkyDungeonBrightnessGet(x, y);
    let color = KDAvgColor(KinkyDungeonColorGet(x, y), KinkyDungeonShadowGet(x, y), light, 1);
    color = KDAvgColor(color, 0xfffafa, 1, 0.5);
    return color;
}
function KDGetLightColorGreyscale(x, y) {
    let light = KinkyDungeonBrightnessGet(x, y);
    let color = KDAvgColor(0xaaaaff, 0x030303, light, 1);
    color = KDAvgColor(color, 0xfffafa, 1, 0.5);
    return color;
}
function KDMouseInModalArea() {
    return KDPointInModalArea(MouseX, MouseY);
}
function KDPointInModalArea(X, Y) {
    return (KDModalArea && PointIn(X, Y, KDModalArea_x, KDModalArea_y, KDModalArea_width, KDModalArea_height));
}
function KDPointInPlayableArea(X, Y) {
    if (KDContextMenu && PointIn(X, Y, KDContextXX, KDContextYY, KDContextW, KDContextH))
        return false;
    if (KinkyDungeonDrawState == "Game" && KDGameData.CurrentDialog && PointIn(X, Y, PIXIWidth / 2 - KDDialogueButtonWidth * 0.6, KDDialogueButtonY - 50, KDDialogueButtonWidth * 1.2, KDDialogueButtonSpacing * KDMaxDialogue + 50))
        return false;
    return PointIn(X, Y, canvasOffsetX, canvasOffsetY, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height)
        && !PointIn(X, Y, 0, 0, 500, PIXIHeight)
        && !PointIn(X, Y, PIXIWidth - 60, 0, 70, PIXIHeight)
        && !PointIn(X, Y, 0, 920, PIXIWidth, 100)
        && !PointIn(X, Y, PIXIWidth - 270, 255, 255, 150)
        && (!KDModalArea || !PointIn(X, Y, KDModalArea_x, KDModalArea_y, KDModalArea_width, KDModalArea_height));
}
function KDMouseInPlayableArea() {
    if (KDContextMenu && MouseIn(KDContextXX, KDContextYY, KDContextW, KDContextH))
        return false;
    return KDPointInPlayableArea(MouseX, MouseY)
        && !KDButtonHovering;
}
function KDHotkeyToText(hotkey) {
    if (!hotkey)
        return "---";
    return hotkey.replace("Digit", "").replace("Key", "").replace("Control", "Ctrl");
}
function KDHotkeyToTextSilent(hotkey) {
    if (!hotkey)
        return undefined;
    return hotkey.replace("Digit", "").replace("Key", "").replace("Control", "Ctrl");
}
function KDGetTargetRetType(x, y) {
    let enemy = KinkyDungeonEnemyAt(x, y);
    if (enemy) {
        let agg = KinkyDungeonAggressive(enemy);
        if (KDCanPassEnemy(KinkyDungeonPlayerEntity, enemy) &&
            (!agg || KDHelpless(enemy)))
            return "Pass";
        if (KDHostile(enemy) && agg)
            return "Attack";
        if (!KDHostile(enemy) && (agg
            || (!KDTalkToEnemy(enemy) && (enemy.playWithPlayer && KDCanDom(enemy)))) && KDCanDom(enemy))
            return "Sub";
        return "Talk";
    }
    let tile = KinkyDungeonMapGet(x, y);
    if (KDInteractableTiles.includes(tile) && !(KinkyDungeonMovableTilesEnemy.includes(tile)))
        return "Action";
    return "Move";
}
let KDPIXIPaletteFilters = new Map();
function KDDrawCustomPalettes(palettes, paletteID, x, y, w, scale = 72, selected, callback, text = "KDSelectPalette", deffault) {
    if (selected == undefined)
        selected = (deffault != undefined ? deffault : KDDefaultPalette);
    let XX = x;
    let YY = y;
    let column = 0;
    let spacing = 80;
    let zero = ["", { Highlight: { "gamma": 1, "saturation": 1, "contrast": 1, "brightness": 1, "red": 1, "green": 1, "blue": 1, "alpha": 1 } }];
    DrawTextFitKDTo(kdpalettecontainer, TextGet(text), x + scale * (0.25), y - 28, scale * w, KDBaseWhite, KDTextGray0, 20, "left");
    for (let value of [zero, ...Object.entries(palettes)]) {
        if (!KDPIXIPaletteFilters.get(paletteID + value[0]))
            KDPIXIPaletteFilters.set(paletteID + value[0], [
                KDGetFilter(value[1].DarkNeutral),
                KDGetFilter(value[1].LightNeutral),
                KDGetFilter(value[1].Highlight),
                KDGetFilter(value[1].Catsuit),
            ]);
        KDDraw(kdpalettecontainer, kdpixisprites, "palette" + value[0], KinkyDungeonRootDirectory + "UI/greyColor.png", XX, YY, scale, scale, undefined, {
            filters: [
                KDPIXIPaletteFilters.get(paletteID + value[0])[0],
            ]
        });
        KDDraw(kdpalettecontainer, kdpixisprites, "paletteL" + value[0], KinkyDungeonRootDirectory + "UI/greyColorLight.png", XX, YY, scale, scale, undefined, {
            filters: [
                KDPIXIPaletteFilters.get(paletteID + value[0])[1],
            ],
            zIndex: 2,
        });
        KDDraw(kdpalettecontainer, kdpixisprites, "paletteH" + value[0], KinkyDungeonRootDirectory + "UI/greyColorHighlight.png", XX, YY, scale, scale, undefined, {
            filters: [
                KDPIXIPaletteFilters.get(paletteID + value[0])[2],
            ],
            zIndex: 3,
        });
        KDDraw(kdpalettecontainer, kdpixisprites, "paletteC" + value[0], KinkyDungeonRootDirectory + "UI/greyColorCatsuit.png", XX, YY, scale, scale, undefined, {
            filters: [
                KDPIXIPaletteFilters.get(paletteID + value[0])[3],
            ],
            zIndex: 4,
        });
        DrawButtonKDExTo(kdpalettecontainer, "choosepalette" + value[0], (_b) => {
            if (callback)
                callback(value[0]);
            else {
                KDDefaultPalette = value[0];
                localStorage.setItem("KDDefaultPalette", value[0]);
                KDRefreshCharacter.set(KinkyDungeonPlayer, true);
                KinkyDungeonCheckClothesLoss = true;
                if (KDFactionRelations.get("Player")) {
                    if (KinkyDungeonPlayerEntity && KDMapData)
                        KinkyDungeonAdvanceTime(0, true, true);
                    KinkyDungeonDressPlayer();
                }
            }
            return true;
        }, true, XX - 3, YY - 3, scale + 7, scale + 7, "", KDBaseWhite, "", undefined, false, value[0] != selected, KDButtonColor, undefined, undefined, {
            zIndex: -10,
        });
        DrawTextFitKDTo(kdpalettecontainer, HasText("KDPalette" + value[0])
            ? TextGet("KDPalette" + value[0])
            : (value[0]), XX + scale / 2, YY + scale - 12, scale, KDBaseWhite, KDTextGray0, 18);
        column++;
        if (column >= w) {
            column = 0;
            YY += spacing;
            XX = x;
        }
        else {
            XX += spacing;
        }
    }
}
function KDDrawPalettes(x, y, w, scale = 72, selected, callback, text = "KDSelectPalette", deffault) {
    KDDrawCustomPalettes(KinkyDungeonFactionFilters, "", x, y, w, scale, selected, callback, text, deffault);
}
function KDGetOutlineFilter(color, alpha, quality, thickness) {
    if (StandalonePatched) {
        if (!KDOutlineFilterCache.get(`${color}_${alpha}_${quality}`)) {
            KDOutlineFilterCache.set(`${color}_${alpha}_${quality}`, new PIXI.filters.OutlineFilter(thickness, color, quality, alpha, true));
        }
        return KDOutlineFilterCache.get(`${color}_${alpha}_${quality}`);
    }
    return null;
}
function KDClearOutlineFilterCache() {
    for (let f of KDOutlineFilterCache.values()) {
        f.destroy();
    }
    KDOutlineFilterCache = new Map();
}
let KDForceAllCull = false;
let KDLastFilterSpritesSanitize = 0;
function KDDoGraphicsSanitize() {
    for (let t of KDRenderTexToDestroy) {
        if (!t.destroyed)
            t.destroy(true);
    }
    KDRenderTexToDestroy = [];
    for (let t of KDMeshToDestroy) {
        if (!t.destroyed) {
            delete t.filters;
            t.destroy({
                children: true,
                texture: true,
                baseTexture: true,
            });
        }
    }
    KDMeshToDestroy = [];
    let map = new Map();
    for (let f of KDFilterCacheToDestroy) {
        if (f.uniformGroup?.uniforms) {
            f.destroy();
            map.set(f, true);
        }
    }
    if (KDFilterCacheToDestroy.length > 0 && CommonTime() > KDLastFilterSpritesSanitize + KDCULLTIME) {
        KDLastFilterSpritesSanitize = CommonTime();
        for (let f of kdFilterSprites.entries()) {
            f[1] = f[1].filter((ff) => {
                return !map.get(ff.filter);
            });
            if (f[1].length > 0) {
                kdFilterSprites.set(f[0], f[1]);
            }
            else {
                kdFilterSprites.delete(f[0]);
            }
        }
    }
    KDFilterCacheToDestroy = [];
    for (let s of KDSpritesToCull) {
        if (!s.destroyed) {
            KDPurgeSpriteRelatedFilters(s);
            delete s.filters;
            s.destroy();
        }
    }
    KDSpritesToCull = [];
}
function KDGetFontMult(font) {
    if (!font)
        font = KDSelectedFont;
    if (KDFontsAlias.get(font)) {
        return KDFontsAlias.get(font).width;
    }
    return 1.0;
}
let KDCustomDraw = {
    "Bondage": () => {
        KDDrawNavBar(1);
        if (KDGameData.PlayerName) {
            DrawTextFitKD(KDGameData.PlayerName, 250, 25, 480, KDBaseWhite, KDTextGray0, 32, "center", 20);
        }
        KinkyDungeonDrawBondage();
    }
};
let KDCustomDrawInvColorFilter = {
    "Bondage": (data) => {
        return (inv) => {
            let slot_temp = KDNPCBindingSelectedSlot;
            let row_temp = KDNPCBindingSelectedRow;
            if (!slot_temp) {
                let container = (data?.entity ? KDGetNPCBindingSlotForItem(KDRestraint(inv.item), data.entity?.id) : null);
                if (container) {
                    slot_temp = container.sgroup;
                    row_temp = container.row;
                }
            }
            if (slot_temp && data?.entity && KDGetNPCRestraints(data.entity.id)
                && KDGetNPCRestraints(data.entity.id)[slot_temp.id]?.name == KDRestraint(inv)?.name
                && !KDCanOverwriteNPCRestraint(inv, KDGetNPCRestraints(data.entity.id)[slot_temp.id])) {
                return "#e64539";
            }
            if (slot_temp && KDRowItemIsValid(KDRestraint(inv.item), slot_temp, row_temp, data.restraints))
                return data.force ? KDTextGray1 : KDCanApplyBondage(data.entity, data.player, inv ? (KDRestraint(inv)?.quickBindCondition ?
                    (t, p) => (KDQuickBindConditions[KDRestraint(inv)?.quickBindCondition](t, p, KDRestraint(inv), inv)) :
                    undefined) : undefined, KDRestraint(inv.item)) ? "#63ab3f" : "#f0b541";
            return "#e64539";
        };
    },
};
function KDPlayerZoom(PlayerModel) {
    return PlayerModel ? KinkyDungeonGridSizeDisplay / 1100
        : KinkyDungeonGridSizeDisplay / 250;
}
function KDDrawChibi(Character, x, y, zoom) {
    return DrawCharacter(Character, x, y, zoom, false, undefined, PIXI.SCALE_MODES.NEAREST, CHIBIMOD, undefined, KDFlipPlayer, ["Sprite"], undefined, CHIBIMODEND);
}
function MouseOverChar() {
    return MouseIn(0, 0, 500, 1000);
}
function KDGetBoxShiftOffset(x, y, w, h, xpad = 5, ypad = 5) {
    let xOff = 0;
    let yOff = 0;
    if (x < xpad) {
        xOff = x - xpad;
    }
    else if (x + w > PIXIWidth - xpad) {
        xOff = (PIXIWidth - xpad) - (x + w);
    }
    if (y < ypad) {
        yOff = y - ypad;
    }
    else if (y + h > PIXIHeight - ypad) {
        yOff = (PIXIHeight - ypad) - (y + h);
    }
    return { x: xOff, y: yOff };
}
let KDContextMenuFontSizeMobile = 32;
let KDContextMenuFontSize = 16;
function KDDrawContextMenu(draw, mouseX, mouseY, options, optionImages, optionActions, optionGrey, optionText, optionColor, optionFilter) {
    let hovered = "";
    if (optionFilter)
        optionFilter.forEach((option) => {
            let ind = options.indexOf(option);
            if (ind >= 0)
                options.splice(ind, 1);
        });
    if (draw && options.length > 0) {
        let bheight = CommonIsMobile ? 64 : 40;
        let bpad = CommonIsMobile ? 10 : 5;
        let bwidth = CommonIsMobile ? 400 : 250;
        let offsets = KDGetBoxShiftOffset(KDContextX - bpad, KDContextY - bpad, bwidth + 3 * bpad, 50 + options.length * (bheight + bpad));
        let XX = KDContextX + offsets.x + 24;
        let YY = KDContextY + offsets.y + 24;
        let II = 0;
        for (let o of options) {
            if (DrawButtonKDEx("contextoption" + II, () => {
                if (optionActions[o]) {
                    optionActions[o](mouseX, mouseY);
                }
                else {
                    KDContextMenu = false;
                }
                return true;
            }, true, XX, YY + II * (bheight + bpad), bwidth, bheight, optionText[o] ? optionText[o] : TextGet("KDContextMenu_" + o), (optionGrey[o] && !optionColor[o]) ? KDBaseLightGrey : (optionColor[o] ? optionColor[o] : KDBaseWhite), optionImages[o] ? (optionImages[o].startsWith(KinkyDungeonRootDirectory) ? optionImages[o]
                : KinkyDungeonRootDirectory
                    + "UI/ContextMenu/"
                    + optionImages[o] + ".png")
                : "", undefined, undefined, optionGrey[o], optionGrey[o] ? KDBaseBlack : undefined, CommonIsMobile ? KDContextMenuFontSizeMobile : KDContextMenuFontSize, optionImages[o] ? true : false, {
                zIndex: 201,
                scaleImage: optionImages[o] ? true : false
            }) && !hovered)
                hovered = o;
            II++;
        }
        DrawBoxKD(XX - bpad, YY - bpad, bwidth + 2 * bpad, options.length * (bheight + bpad) + bpad, "#222222", false, 0.8, 200);
        KDContextXX = XX - bpad;
        KDContextYY = YY - bpad;
        KDContextW = bwidth + 2 * bpad;
        KDContextH = options.length * (bheight + bpad) + bpad;
    }
    return hovered;
}
function KDSpellValid(x, y, spellRange, projAimOverride) {
    let free = KinkyDungeonOpenObjects.includes(KinkyDungeonMapGet(x, y)) || KinkyDungeonVisionGet(x, y) < 0.1;
    if (!KinkyDungeonTargetingSpell.projectileTargeting && !KinkyDungeonTargetingSpell.CastInDark && !KinkyDungeonVisionGet(x, y))
        return false;
    let Valid = (!KinkyDungeonTargetingSpell.castCondition
        || (!KDPlayerCastConditions[KinkyDungeonTargetingSpell.castCondition] || KDPlayerCastConditions[KinkyDungeonTargetingSpell.castCondition](KinkyDungeonPlayerEntity, x, y)))
        && (((!projAimOverride && KinkyDungeonTargetingSpell.projectileTargeting)
            || spellRange >= Math.sqrt((x - KinkyDungeonPlayerEntity.x) * (x - KinkyDungeonPlayerEntity.x) + (y - KinkyDungeonPlayerEntity.y) * (y - KinkyDungeonPlayerEntity.y)))
            && (KinkyDungeonTargetingSpell.projectileTargeting || KinkyDungeonTargetingSpell.CastInWalls || free)
            && (!KinkyDungeonTargetingSpell.WallsOnly || !KinkyDungeonOpenObjects.includes(KinkyDungeonMapGet(x, y))));
    if (KinkyDungeonTargetingSpell.noTargetEnemies) {
        let enemy = KinkyDungeonEnemyAt(x, y);
        let faction = KDGetFaction(enemy);
        if (enemy && (!KinkyDungeonTargetingSpell.exceptionFactions || !KinkyDungeonTargetingSpell.exceptionFactions.includes(faction)))
            Valid = false;
    }
    if (KinkyDungeonTargetingSpell.noTargetAllies) {
        let enemy = KinkyDungeonEnemyAt(x, y);
        if (enemy && KDAllied(enemy))
            Valid = false;
    }
    if (KinkyDungeonTargetingSpell.selfTargetOnly && (KinkyDungeonPlayerEntity.x != x || KinkyDungeonPlayerEntity.y != y))
        Valid = false;
    if ((KinkyDungeonTargetingSpell.requireLOS || (projAimOverride && KinkyDungeonTargetingSpell.projectileTargeting
        && (!KinkyDungeonTargetingSpell.piercing
            && !KinkyDungeonTargetingSpell.noTerrainHit))) &&
        !KinkyDungeonCheckPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, x, y, true, true, 1, true))
        Valid = false;
    if (KinkyDungeonTargetingSpell.noTargetPlayer && KinkyDungeonPlayerEntity.x == x && KinkyDungeonPlayerEntity.y == y)
        Valid = false;
    if (KinkyDungeonTargetingSpell.mustTarget && KinkyDungeonNoEnemy(x, y, true))
        Valid = false;
    if (KinkyDungeonTargetingSpell.minRange && KDistEuclidean(x - KinkyDungeonPlayerEntity.x, y - KinkyDungeonPlayerEntity.y) < KinkyDungeonTargetingSpell.minRange)
        Valid = false;
    return Valid;
}
let KDStatusFadeSpeed = 1;
let KDStatusToggle = true;
let KDMouseOtherStatusFade = 1;
let KDMousePlayableAreaStatusFade = 1;
function KDDoStatusFade(delta) {
    if (KDToggles.ForceWarnings) {
        KDMousePlayableAreaStatusFade = 1;
    }
    else {
        if (KDMouseInPlayableArea()) {
            KDMousePlayableAreaStatusFade = Math.min(1, KDMousePlayableAreaStatusFade + KDStatusFadeSpeed * delta / 1000);
        }
        else {
            KDMousePlayableAreaStatusFade = Math.max(0, KDMousePlayableAreaStatusFade - KDStatusFadeSpeed * delta / 1000);
        }
    }
    if (KDStatusToggle) {
        KDMouseOtherStatusFade = Math.min(1, KDMouseOtherStatusFade + KDStatusFadeSpeed * delta / 1000);
    }
    else {
        KDMouseOtherStatusFade = Math.max(0, KDMouseOtherStatusFade - KDStatusFadeSpeed * delta / 1000);
    }
    KDMousePlayableAreaStatusFade = Math.min(KDMousePlayableAreaStatusFade, KDMouseOtherStatusFade);
    kdenemystatusboard.alpha = KDMouseOtherStatusFade;
    kdstatusboard.alpha = KDMouseOtherStatusFade;
    kdwarningboardOver.alpha = KDMousePlayableAreaStatusFade;
    kdwarningboard.alpha = KDMousePlayableAreaStatusFade;
}
function KDCanConsentIngame() {
    return !KDConsentArray["ConsentIngame"];
}
function KDPlayerX() {
    return 0;
}
function KDPlayerY() {
    return 0;
}
function KDPlayerPos() {
    return {
        x: KDPlayerX() + 250 - 250 * KDCharSize,
        y: KDPlayerY() + 0.5 * PIXIHeight - 0.5 * PIXIHeight * KDCharSize + (1 - KDCharSize) * PIXIHeight * 0.27,
    };
}
function KDGetFilter(filter) {
    if (filter?.hue != null && filter?.hue >= 0) {
        return new HSLFilter({
            alpha: filter.alpha == null ? 1 : filter.alpha,
            hue: filter.hue,
            lightness: filter.brightness,
            contrast: filter.contrast,
            saturation: Math.max(-1, Math.min(filter.saturation - 1, 1)),
            auto: !(filter.colorize > 0.5),
            colorize: filter.colorize > 0.5
        });
    }
    else {
        return new PIXI.filters.AdjustmentFilter(filter);
    }
}
//# sourceMappingURL=KinkyDungeonDraw.js.map