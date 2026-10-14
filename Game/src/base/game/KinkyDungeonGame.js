"use strict";
let KDGameGlobals = {
    Pronouns: ["She", "They", "It"],
};
let KDFocusableTextFields = [
    "PerksFilter",
    "InvFilter",
    "OptionFilter",
    "ConsentFilter",
    "CollFilter",
    "QInvFilter",
    "MagicFilter",
    "RenameNPC",
    "PlayerNameField",
];
let KDSlowedSprintCost = 5.0;
let KDMAXGODDESSQUESTS = 3;
let KDBalanceSprintMult = 3;
let KDBalanceInertiaMult = 1.5;
let KDBalanceAttackMult = 0.4;
let KDBalanceCastArmsMult = 1;
let KDBalanceCastLegsMult = 3;
let KDNumberOfGagMsg = 5;
let KDNumberOfPlugMsg = 3;
let KDNumberOfBraMsg = 3;
let KDNumberOfBeltMsg = 3;
let KDNumberOfClampMsg = 3;
let KDNumberOfClampVMsg = 2;
let KinkyDungeonBraMumbleChance = 0.04;
let KinkyDungeonBeltMumbleChance = 0.015;
let KinkyDungeonClampMumbleChance = 0.07;
let KinkyDungeonClampVMumbleChance = 0.07;
let KinkyDungeonGagMumbleChanceRestraint = 0.3;
let KinkyDungeonGagMumbleChance = 0.02;
let KinkyDungeonGagMumbleChancePerRestraint = 0.0025;
let KinkyDungeonGagMumbleChancePerRestraintMax = 0.05;
let KinkyDungeonPlugThoughChance = 0.02;
let KinkyDungeonPlugThoughChancePerRestraint = 0.0025;
let KinkyDungeonPlugThoughChancePerRestraintMax = 0.05;
let MiniGameKinkyDungeonCheckpoint = "grv";
let MiniGameKinkyDungeonLevel = -1;
let KinkyDungeonMapIndex = {};
let KDWorldMap = {};
let KDCurrentWorldSlot = { x: 0, y: 0 };
let KDMapData = {};
let KDMapExtraData = {
    Boringness: [],
    VisionGrid: [],
    ColorGrid: [],
    ShadowGrid: [],
    BrightnessGrid: [],
};
let KinkyDungeonUpdateLightGrid = true;
let KinkyDungeonGrid_Last = "";
let KinkyDungeonGridSizeDisplay = 72;
let KinkyDungeonGridWidthDisplay = 2000 / KinkyDungeonGridSizeDisplay;
let KinkyDungeonGridHeightDisplay = 1000 / KinkyDungeonGridSizeDisplay;
let KinkyDungeonMoveDirection = KinkyDungeonGetDirection(0, 0);
let KinkyDungeonTextMessagePriority = 0;
let KinkyDungeonTextMessage = "";
let KinkyDungeonTextMessageNoPush = false;
let KinkyDungeonTextMessageTime = 0;
let KinkyDungeonTextMessageColor = KDBaseWhite;
let KinkyDungeonActionMessagePriority = 0;
let KinkyDungeonActionMessage = "";
let KinkyDungeonActionMessageNoPush = false;
let KinkyDungeonActionMessageTime = 0;
let KinkyDungeonActionMessageColor = KDBaseWhite;
let KinkyDungeonSpriteSize = 72;
let KinkyDungeonCanvas = document.createElement("canvas");
let KinkyDungeonContext = null;
let KinkyDungeonCanvasFow = document.createElement("canvas");
let KinkyDungeonContextFow = null;
let KinkyDungeonCanvasPlayer = document.createElement("canvas");
let KinkyDungeonContextPlayer = null;
let KinkyDungeonPOI = [];
let KinkyDungeonStairTiles = 'sSH';
let KDDefaultAvoidTiles = "gtVN@";
let KinkyDungeonGroundTiles = "023wW][?/";
let KDGrowableTiles = '0235][?/t';
let KinkyDungeonWallTiles = "14,6f";
let KDCrackableTiles = '4Xaom-';
let KDMendableTiles = '4';
let KinkyDungeonBlockTiles = "14,6bgX7f";
let KinkyDungeonMovableTilesEnemy = KinkyDungeonGroundTiles + "HB@l;SsRrdzTgLcNVvt5";
let KinkyDungeonMovableTilesSmartEnemy = "D" + KinkyDungeonMovableTilesEnemy;
let KDInteractableTiles = "OPCAMG$Y+=-F67" + KinkyDungeonMovableTilesSmartEnemy;
let KinkyDungeonMovableTiles = KDInteractableTiles;
let KDRandomDisallowedNeighbors = ",?/RAasSHcCHDdOoPp+-=FZMmzgtuVvN567";
let KDTrappableNeighbors = "DA+-F@";
let KDTrappableNeighborsLikely = "COP=";
let KinkyDungeonTransparentObjects = KDInteractableTiles
    .replace("D", "")
    .replace("g", "")
    .replace("Y", "")
    + "OoAaMmCcB@lb+=-FXu7";
let KinkyDungeonTransparentMovableObjects = KDInteractableTiles
    .replace("Z", "")
    .replace("D", "")
    .replace("g", "");
let KDOpenDoorTiles = ["DoorOpen", "DoorVertOpenCont", "DoorVertOpen"];
let KinkyDungeonTargetTile = null;
let KinkyDungeonTargetTileLocation = "";
const KinkyDungeonBaseLockChance = 0.12;
const KinkyDungeonScalingLockChance = 0.16;
const KinkyDungeonBlueLockChance = -0.1;
const KinkyDungeonBlueLockChanceScaling = 0.015;
const KinkyDungeonBlueLockChanceScalingMax = 0.4;
const KinkyDungeonGoldLockChance = -0.25;
const KinkyDungeonGoldLockChanceScaling = 0.015;
const KinkyDungeonGoldLockChanceScalingMax = 0.25;
const KinkyDungeonPurpleLockChance = 0;
const KinkyDungeonPurpleLockChanceScaling = 0.02;
const KinkyDungeonPurpleLockChanceScalingMax = 0.6;
let KinkyDungeonCurrentMaxEnemies = 1;
let KinkyDungeonNextDataSendTime = 0;
const KinkyDungeonNextDataSendTimeDelay = 500;
let KinkyDungeonNextDataSendTimeDelayPing = 5000;
let KinkyDungeonNextDataSendStatsTimeDelay = 3000;
let KinkyDungeonNextDataSendStatsTime = 0;
let KinkyDungeonNextDataLastTimeReceived = 0;
let KinkyDungeonNextDataLastTimeReceivedTimeout = 15000;
let KinkyDungeonLastMoveDirection = null;
let KinkyDungeonTargetingSpell = null;
let KDAutoWaitDelayed = false;
let KinkyDungeonTargetingSpellItem = null;
let KinkyDungeonTargetingSpellWeapon = null;
let KinkyDungeonMaxLevel = 21;
let KinkyDungeonLastMoveTimer = 0;
let KinkyDungeonLastMoveTimerStart = 0;
let KinkyDungeonLastMoveTimerCooldown = 175;
let KinkyDungeonLastMoveTimerCooldownStart = 50;
let KinkyDungeonJailLeash = 3;
let KinkyDungeonJailLeashY = 3;
let KinkyDungeonJailLeashX = 3;
let KinkyDungeonSaveInterval = 10;
let KinkyDungeonSFX = [];
function KDIsStairExplored(x, y) {
    return KDMapData.ExpStair ? !!KDMapData.ExpStair[x + ',' + y] : false;
}
function KDExploreStairs(x, y) {
    if (!KDMapData.ExpStair)
        KDMapData.ExpStair = {};
    KDMapData.ExpStair[x + ',' + y] = 1;
}
function KDDefaultMapData(mapX, mapY, RoomType = "", MapMod = "") {
    return {
        Checkpoint: MiniGameKinkyDungeonCheckpoint,
        Title: "",
        RespawnQueue: [],
        ShrineList: [],
        enemyTags: [],
        mapX: mapX,
        mapY: mapY,
        RepopulateQueue: [],
        ExpStair: {},
        TilesAlternate: {},
        SpecialAreas: [],
        Labels: {},
        PrisonState: "",
        PrisonStateStack: [],
        PrisonType: "",
        data: {},
        LairsToPlace: [],
        PotentialEntrances: [],
        UsedEntrances: {},
        Regiments: {},
        RoomType: RoomType,
        MapMod: MapMod,
        RandomPathablePoints: {},
        Tiles: {},
        EffectTiles: {},
        TilesMemory: {},
        TilesSkin: {},
        Bullets: [],
        ConstantX: false,
        GroundItems: [],
        Entities: [],
        FogGrid: [],
        FogMemory: [],
        Grid: "",
        Traffic: [],
        GridWidth: 31,
        GridHeight: 19,
        MapBrightness: 5,
        PatrolPoints: [],
        StartPosition: { x: 1, y: 1 },
        EndPosition: { x: 1, y: 1 },
        ShortcutPositions: {},
        JailPoints: [],
        ShopItems: [],
        PoolUses: 0,
        PoolUsesGrace: 3,
        CategoryIndex: {},
        JailFaction: [],
        GuardFaction: [],
        MapFaction: "",
        EscapeMethod: "Key",
        KillTarget: "",
        KillQuota: -1,
        TrapQuota: -1,
        TrapsTriggered: 0,
        ChestQuota: -1,
        ChestsOpened: 0,
        QuestQuota: -1,
        QuestsAccepted: 0,
        KeyQuota: -1,
        KeysHeld: 0,
        clickHeadpatted: false,
        PerkShrines: [],
        SelectedPerk: -1
    };
}
KDMapData = KDDefaultMapData(0, 0);
function KinkyDungeonEffectTilesSet(location, value) {
    KDMapData.EffectTiles[location] = value;
}
function KinkyDungeonEffectTilesGet(location, mapData) {
    if (!mapData)
        mapData = KDMapData;
    return mapData.EffectTiles[location];
}
function KDSetPlayerTile(value) {
    KDMapData.Tiles[KinkyDungeonPlayerEntity.x + ',' + KinkyDungeonPlayerEntity.y] = value;
    return value;
}
function KDGetPlayerTile() {
    return KDMapData.Tiles[KinkyDungeonPlayerEntity.x + ',' + KinkyDungeonPlayerEntity.y];
}
function KinkyDungeonTilesSet(location, value) {
    KDMapData.Tiles[location] = value;
    return value;
}
function KinkyDungeonTilesGet(location) {
    return KDMapData.Tiles[location];
}
function KinkyDungeonTilesDelete(location) {
    delete KDMapData.Tiles[location];
}
function KDClearTile(location) {
    let tile = KDMapData.Tiles[location];
    if (tile.Type)
        delete tile.Type;
}
function KinkyDungeonSkinSet(location, value) {
    KDMapData.TilesSkin[location] = value;
}
function KinkyDungeonSkinGet(location) {
    return KDMapData.TilesSkin[location];
}
function KinkyDungeonSkinDelete(location) {
    delete KDMapData.TilesSkin[location];
}
function KDAlreadyOpened(x, y) {
    if (KDGameData.AlreadyOpened) {
        for (let ao of KDGameData.AlreadyOpened) {
            if (ao.x == x && ao.y == y) {
                return true;
            }
        }
    }
    return false;
}
function KinkyDungeonPlaySound(src, entity, vol) {
    if (KDSoundEnabled() && !KinkyDungeonSFX.includes(src)) {
        if (!entity || KinkyDungeonVisionGet(entity.x, entity.y) > 0) {
            AudioPlayInstantSoundKD(src, vol);
            KinkyDungeonSFX.push(src);
        }
    }
}
function KinkyDungeonSetCheckPoint(Checkpoint, _AutoSave, _suppressCheckPoint) {
    if (Checkpoint != undefined)
        MiniGameKinkyDungeonCheckpoint = Checkpoint;
    else if (Math.floor(MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint) == MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint)
        MiniGameKinkyDungeonCheckpoint = KDDefaultJourney[Math.min(KDDefaultJourney.length - 1, Math.floor((MiniGameKinkyDungeonLevel) / KDLevelsPerCheckpoint))];
}
function KinkyDungeonNewGamePlus(increaseDiff) {
    KDSetWorldSlot(0, 0, 0, 0);
    let lostItems = [];
    for (let entry of Object.entries(KDGameData.Containers)) {
        if (entry[1].location?.mapY > 0) {
            lostItems.push(...Object.values(entry[1].items));
            delete KDGameData.Containers[entry[0]];
        }
    }
    for (let item of lostItems) {
        KDAddLostItemSingle(item.name, 1);
    }
    let newPersistent = {};
    for (let V of Object.values(KDPersistentNPCs)) {
        if (V.permanent || KDGameData.Collection[V.id + ""]) {
            newPersistent[V.id] = V;
            if (KDGameData.Collection[V.id + ""]) {
                if (V.mapX != 0 || V.mapY != 0 || V.room != "Summit") {
                    V.spawned = false;
                    V.mapX = 0;
                    V.mapY = 0;
                    V.room = "Summit";
                }
            }
            else
                V.room = "";
        }
    }
    if (increaseDiff) {
        if (KinkyDungeonStatsChoice.get("hardMode")) {
            KinkyDungeonStatsChoice.set("extremeMode", true);
        }
        KinkyDungeonStatsChoice.set("hardMode", true);
        KinkyDungeonHardMode = KinkyDungeonStatsChoice.get("hardMode");
        KinkyDungeonExtremeMode = KinkyDungeonStatsChoice.get("extremeMode");
    }
    KDGameData.PersistentNPCCache = {};
    KDPersistentNPCs = newPersistent;
    KinkyDungeonSetCheckPoint("grv", true);
    KDGameData.HighestLevelCurrent = 0;
    KinkyDungeonCreateMap(KinkyDungeonMapParams.grv, "JourneyFloor", "", 0);
    KinkyDungeonNewGame += 1;
    KDGameData.ElevatorsUnlocked = {};
    KDDeletedIDs = {};
    for (let t of KDResertNGTags) {
        if (KinkyDungeonFlags.has(t))
            KinkyDungeonFlags.delete(t);
    }
}
function KDResetData(Data) {
    if (!Data)
        Data = KDGameDataBase;
    KDGameData = JSON.parse(JSON.stringify(Data));
    KDPersistentNPCs = {};
    KDDeletedIDs = {};
    KDPersonalAlt = {};
    for (let control of Object.keys(KDFocusControlButtons)) {
        KDInitFocusControl(control);
    }
    InitFacilities();
}
function InitPersistentGen() {
    KDGameData.MaidKnightFloor = Math.floor(2 + KDRandom() * KinkyDungeonMaxLevel * 0.6);
    if (KDGameData.MaidKnightFloor % KDLevelsPerCheckpoint == 0)
        KDGameData.MaidKnightFloor -= 1;
}
function KDResetEventData(Data) {
    if (!Data)
        Data = KDEventDataBase;
    KDEventData = JSON.parse(JSON.stringify(Data));
}
function KinkyDungeonInitialize(Level, Load) {
    KDCollectionIndex = 0;
    KDWorldMap = {};
    KDMapData = KDDefaultMapData(0, 0);
    KDCurrentWorldSlot = { x: 0, y: 0 };
    KDUpdateChokes = true;
    KDUpdateItemEventCache = true;
    KinkyDungeonCurrentTick = 0;
    if (StandalonePatched)
        KDInitCurrentPose(true);
    if (!afterLoaded) {
        KDModsAfterLoad();
        KinkyDungeonRefreshRestraintsCache();
        KinkyDungeonRefreshEnemiesCache();
        afterLoaded = true;
    }
    KinkyDungeonMessageLog = [];
    KDInitFactions(true);
    CharacterReleaseTotal(KinkyDungeonPlayer);
    KDResetData();
    KDResetEventData();
    KinkyDungeonRefreshRestraintsCache();
    KinkyDungeonRefreshEnemiesCache();
    KinkyDungeonRefreshOutfitCache();
    KinkyDungeonFlags = new Map();
    KinkyDungeonDressSet();
    CharacterAppearanceRestore(KinkyDungeonPlayer, CharacterAppearanceStringify(KinkyDungeonPlayer, KDGetCharMetadata(KinkyDungeonPlayer)), false, true);
    KinkyDungeonDrawState = "Game";
    KDResetAlternateInventoryRender();
    KDRefreshCharacter.set(KinkyDungeonPlayer, true);
    KinkyDungeonCheckClothesLoss = true;
    KinkyDungeonDressPlayer();
    KinkyDungeonMapIndex = {};
    for (let map of KDDefaultJourney) {
        KinkyDungeonMapIndex[map] = map;
    }
    for (let map of KDDefaultAlt) {
        KinkyDungeonMapIndex[map] = map;
    }
    for (let e of KDMapData.Entities) {
        KDClearItems(e);
    }
    KDMapData.Entities = [];
    KDCommanderRoles = new Map();
    KDUpdateEnemyCache = true;
    KDMapData.Bullets = [];
    KDMapData.GroundItems = [];
    KDGameData.Balance = 1;
    KDGameData.Quests = [];
    KinkyDungeonTextMessage = "";
    KinkyDungeonActionMessage = "";
    KDSetWorldSlot(0, Level, 0, 0);
    KinkyDungeonSetCheckPoint();
    KDInitCanvas();
    KinkyDungeonDefaultStats(Load);
    InitFacilities();
}
function KDInitCanvas() {
    KinkyDungeonContextPlayer = KinkyDungeonCanvasPlayer.getContext("2d");
    KinkyDungeonCanvasPlayer.width = KinkyDungeonGridSizeDisplay;
    KinkyDungeonCanvasPlayer.height = KinkyDungeonGridSizeDisplay;
    KinkyDungeonContext = KinkyDungeonCanvas.getContext("2d");
    KinkyDungeonCanvas.height = KinkyDungeonCanvasPlayer.height * KinkyDungeonGridHeightDisplay;
    KinkyDungeonContextFow = KinkyDungeonCanvasFow.getContext("2d");
    KinkyDungeonCanvasFow.width = KinkyDungeonCanvas.width;
    KinkyDungeonCanvasFow.height = KinkyDungeonCanvas.height;
}
function KDCreateBoringness(noBoring) {
    let start = performance.now();
    KDMapExtraData.Boringness = [];
    for (let X = 0; X < KDMapData.GridWidth; X++) {
        for (let Y = 0; Y < KDMapData.GridHeight; Y++)
            KDMapExtraData.Boringness.push(0);
    }
    if (noBoring)
        return;
    let path = KinkyDungeonFindPath(KDMapData.StartPosition.x, KDMapData.StartPosition.y, KDMapData.EndPosition?.x || KDMapData.StartPosition.x, KDMapData.EndPosition?.y || KDMapData.StartPosition.y, false, false, true, KinkyDungeonMovableTilesSmartEnemy, false, false, false, undefined, false, undefined, false, true);
    let pathLength = path ? path.length : 200;
    for (let X = 0; X < KDMapData.GridWidth; X++) {
        for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
            if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y))) {
                let startLength = KinkyDungeonFindPath(X, Y, KDMapData.StartPosition.x, KDMapData.StartPosition.y, false, false, false, KinkyDungeonMovableTilesSmartEnemy, false, false, false, undefined, false, undefined, false, true);
                if (startLength) {
                    let endLength = KinkyDungeonFindPath(X, Y, KDMapData.EndPosition?.x || KDMapData.StartPosition.x, KDMapData.EndPosition?.y || KDMapData.StartPosition.y, false, false, true, KinkyDungeonMovableTilesSmartEnemy, false, false, false, undefined, false, undefined, false, true);
                    if (endLength) {
                        let delta = Math.abs((startLength.length + endLength.length) - pathLength);
                        KinkyDungeonBoringSet(X, Y, delta);
                    }
                    else
                        KinkyDungeonBoringSet(X, Y, 2 * pathLength);
                }
                else
                    KinkyDungeonBoringSet(X, Y, 5 * pathLength);
            }
        }
    }
    console.log("Time to create Boring" + (performance.now() - start));
}
function KDGetMapSize() {
    if (KinkyDungeonStatsChoice.get("MapLarge"))
        return 3;
    if (KinkyDungeonStatsChoice.get("MapHuge"))
        return 6;
    if (KinkyDungeonStatsChoice.get("MapGigantic"))
        return 9;
    if (KinkyDungeonStatsChoice.get("MapAbsurd"))
        return 24;
    return 0;
}
function KDGetMazeParams(params) {
    if (KinkyDungeonStatsChoice.get("MapLarge"))
        return {
            oldest: 0.5,
            newest: 0.4,
            chance_STOP: .25 + 0.75 * (params.deadend || 0),
            opennessMult: .8,
        };
    if (KinkyDungeonStatsChoice.get("MapHuge"))
        return {
            oldest: 0.45,
            newest: 0.35,
            chance_STOP: .45 + 0.55 * (params.deadend || 0),
            opennessMult: .65,
        };
    if (KinkyDungeonStatsChoice.get("MapGigantic"))
        return {
            oldest: 0.4,
            newest: 0.25,
            chance_STOP: .55 + 0.45 * (params.deadend || 0),
            opennessMult: .45,
        };
    if (KinkyDungeonStatsChoice.get("MapAbsurd"))
        return {
            oldest: 0.35,
            newest: 0.04,
            chance_STOP: .85 + 0.15 * (params.deadend || 0),
            opennessMult: .1,
        };
    return {
        oldest: 0.1,
        newest: 0.8,
        chance_STOP: 0 + (params.deadend || 0),
        opennessMult: 1,
    };
}
function KDGetWorldMapLocation(point) {
    return KDWorldMap[point.x + ',' + point.y];
}
function KDCreateWorldLocation(x, y, jx, jy, _main = "") {
    KDWorldMap[x + ',' + y] = {
        data: {},
        x: x,
        y: y,
        jx: jx,
        jy: jy,
        main: "",
        name: "Tile" + x + ',' + y,
        color: KDBaseWhite,
        outposts: {},
        lairs: {},
        lairsToPlace: {},
    };
}
function KDSaveRoom(slot, saveconstantX) {
    slot = slot || KDCurrentWorldSlot;
    let CurrentLocation = KDWorldMap[(saveconstantX ? 0 : slot.x) + "," + slot.y];
    if (!CurrentLocation)
        KDCreateWorldLocation(0, slot.y, KDGameData.JourneyX, KDGameData.JourneyY);
    KDPackEnemies(KDMapData);
    KDMapData.RandomPathablePoints = {};
    RandomPathList = [];
    let CurrentMapData = JSON.parse(JSON.stringify(KDMapData));
    if (CurrentLocation) {
        CurrentLocation.data[CurrentMapData.RoomType] = CurrentMapData;
    }
    return CurrentMapData;
}
function KDUnPackEnemies(data) {
    for (let enemy of data.Entities) {
        if (!enemy.modified) {
            enemy.Enemy = KinkyDungeonGetEnemyByName(enemy.Enemy.name || enemy.Enemy);
        }
    }
}
function KDSyncPersistentEntities(Level, data, removeMissing = true) {
    let newEntities = [];
    for (let enemy of data.Entities) {
        if (KDIsNPCPersistent(enemy.id)) {
            let pers = KDGetPersistentNPC(enemy.id);
            if (removeMissing && (pers.room != data.RoomType || pers.mapY != Level)) {
                enemy = null;
            }
            else {
                enemy = pers.entity;
            }
        }
        if (enemy)
            newEntities.push(enemy);
    }
    let oldEntities = data.Entities;
    data.Entities = newEntities;
    oldEntities.splice(0, oldEntities.length);
}
function KDUnPackEnemy(enemy) {
    let packed = !enemy.Enemy?.maxhp;
    if (!enemy.modified) {
        enemy.Enemy = KinkyDungeonGetEnemyByName(enemy.Enemy.name || enemy.Enemy);
    }
    return packed;
}
function KDPackEnemy(enemy) {
    if (!enemy.modified) {
        enemy.Enemy = { name: enemy.Enemy.name };
    }
}
function KDPackEnemies(data) {
    for (let enemy of data.Entities) {
        if (!enemy.modified) {
            enemy.Enemy = { name: enemy.Enemy.name };
        }
    }
}
function KDLoadMapFromWorld(x, y, room, direction = 0, constantX, ignoreAware = true) {
    let origx = x;
    if (constantX)
        x = 0;
    if (!KDWorldMap[x + ',' + y])
        return KDMapData;
    if (!KDWorldMap[x + ',' + y].data[room])
        return KDMapData;
    let allies = KinkyDungeonGetAllies();
    KDMapData.Entities = KDMapData.Entities.filter((enemy) => {
        return !allies.includes(enemy);
    });
    KDCommanderRoles = new Map();
    KDUpdateEnemyCache = true;
    KDKickEnemies(undefined, ignoreAware, y);
    let retval = KDSaveRoom(KDCurrentWorldSlot, KDMapData.ConstantX);
    let NewMapData = JSON.parse(JSON.stringify(KDWorldMap[x + ',' + y].data[room]));
    KDSyncPersistentEntities(y, NewMapData, true);
    KDUnPackEnemies(NewMapData);
    KDMapData = NewMapData;
    KDWorldMap[x + ',' + y].data[room] = KDMapData;
    KDGameData.RoomType = KDMapData.RoomType;
    KDGameData.MapMod = KDMapData.MapMod;
    MiniGameKinkyDungeonCheckpoint = KDMapData.Checkpoint || MiniGameKinkyDungeonCheckpoint;
    KDMapData.Entities = KDMapData.Entities.filter((enemy) => {
        return (!KDGetNPCLocation(enemy.id) || KDCompareLocation(KDGetNPCLocation(enemy.id), KDGetCurrentLocation()));
    });
    KDInitTempValues();
    if (!KDMapData.Traffic || KDMapData.Traffic.length == 0)
        KDGenerateBaseTraffic();
    KinkyDungeonGenNavMap();
    KDSetWorldSlot(x, y);
    KDBuildLairs();
    KDPlacePlayerBasedOnDirection(direction, KDGameData.ShortcutIndex);
    let aware = KDKickEnemies(undefined, ignoreAware, y);
    if (ignoreAware && aware) {
        KinkyDungeonSetFlag("stairslocked", 10);
        KinkyDungeonSendActionMessage(10, TextGet("KDClimbUpTrapped"), KDBaseRed, 3);
    }
    for (let e of allies) {
        let ent = KDAddEntity(e, true, undefined, true);
    }
    for (let e of KinkyDungeonGetAllies()) {
        let point = KinkyDungeonGetNearbyPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, undefined, true, true);
        if (!point)
            point = KinkyDungeonGetNearbyPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, undefined, undefined, true);
        if (!point)
            point = { x: KinkyDungeonPlayerEntity.x, y: KinkyDungeonPlayerEntity.y };
        KDMoveEntity(e, point.x, point.y, false, undefined, undefined, true);
        e.visual_x = point.x;
        e.visual_y = point.y;
    }
    return retval;
}
function KDPlacePlayerBasedOnDirection(direction = 0, sideRoomIndex = '-1', nomove = false) {
    let journeySlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
    let sp = KDMapData.ShortcutPositions[sideRoomIndex]
        || ((journeySlot?.SideRooms && journeySlot.SideRooms[sideRoomIndex]
            && KDSideRooms[journeySlot.SideRooms[sideRoomIndex]]) ? KDMapData.ShortcutPositions[journeySlot.SideRooms[sideRoomIndex]] : undefined);
    if (!sp) {
        if ((journeySlot?.SideRooms && journeySlot.SideRooms.some((sr) => {
            return KDSideRooms[sr]?.altRoom == sideRoomIndex;
        })))
            sp = KDMapData.ShortcutPositions[journeySlot.SideRooms.findIndex((sr) => {
                return KDSideRooms[sr]?.altRoom == sideRoomIndex;
            })];
    }
    if (sideRoomIndex != '-1' && KDMapData.ShortcutPositions && (sp)) {
        KinkyDungeonPlayerEntity = { MemberNumber: DefaultPlayer.MemberNumber, id: -1, x: sp.x, y: sp.y, player: true };
    }
    else if ((direction == 1) && KDMapData.EndPosition) {
        KinkyDungeonPlayerEntity = { MemberNumber: DefaultPlayer.MemberNumber, id: -1, x: KDMapData.EndPosition.x, y: KDMapData.EndPosition.y, player: true };
    }
    else {
        KinkyDungeonPlayerEntity = { MemberNumber: DefaultPlayer.MemberNumber, id: -1, x: KDMapData.StartPosition.x, y: KDMapData.StartPosition.y, player: true };
    }
    if (!nomove) {
        KDUpdateEnemyCache = true;
        if (KinkyDungeonEnemyAt(KDPlayer().x, KDPlayer().y)) {
            let en = KinkyDungeonEnemyAt(KDPlayer().x, KDPlayer().y);
            let pp = KinkyDungeonGetNearbyPoint(en.x, en.y, true, undefined, undefined, true);
            if (pp) {
                en.aware = true;
                KDMoveEntity(en, pp.x, pp.y, false);
            }
        }
    }
}
function KDInitTempValues(seed) {
    KDGameData.ChestsGenerated = [];
    KDPathfindingCacheFails = 0;
    KDPathfindingCacheHits = 0;
    KDPathCache = new Map();
    KDThoughtBubbles = new Map();
    KinkyDungeonRescued = {};
    KDGameData.ChampionCurrent = 0;
    KinkyDungeonAid = {};
    KDGameData.KinkyDungeonPenance = false;
    KDRestraintsCache = new Map();
    KDEnemiesCache = new Map();
    KDEnemyCache = new Map();
    KinkyDungeonTargetTile = null;
    KinkyDungeonTargetTileLocation = "";
    KDModalArea = false;
    KDGameData.OfferFatigue = 0;
    KDGameData.KeyringLocations = [];
    if (KDMapData.KeysHeld == undefined) {
        KDMapData.KeysHeld = 0;
    }
    KDGameData.RescueFlag = false;
    KinkyDungeonTotalSleepTurns = 0;
    KinkyDungeonFastMovePath = [];
    KinkyDungeonShopIndex = 0;
    if (!seed) {
        KDGameData.AlreadyOpened = [];
        KDrandomizeSeed(true);
        KDGameData.LastMapSeed = KinkyDungeonSeed;
        if (KDGameData.PrisonerState == "chase") {
            KDGameData.PrisonerState = "";
        }
    }
    console.log("Map Seed: " + KinkyDungeonSeed);
    KDsetSeed(KinkyDungeonSeed);
    KDStageBossGenerated = true;
    KDUpdateEnemyCache = true;
    KinkyDungeonUpdateLightGrid = true;
    KDPathCache = new Map();
    KDPathCacheIgnoreLocks = new Map();
}
function KDUpdateOptionGame(start) {
    if (KinkyDungeonStatsChoice.get("NoForceGreet") && !KDGameData.NoForceGreet) {
        KDGameData.NoForceGreet = true;
    }
    else if (!KinkyDungeonStatsChoice.get("NoForceGreet") && KDGameData.NoForceGreet) {
        KDGameData.NoForceGreet = false;
    }
    for (let kurasu of Object.keys(KDClassStart)) {
        let perkname = "MC_" + (KDClassSynonyms[kurasu] || kurasu);
        if (!!KinkyDungeonStatsChoice.get(perkname) && KDPerkStart[perkname]) {
            KDPerkStart[perkname](start);
        }
    }
}
function KDIsHellFloor(Level) {
    if (Level == undefined)
        Level = MiniGameKinkyDungeonLevel;
    return Level == 12 || Level == 16;
}
function KDGetEffLevel() {
    let effLevel = MiniGameKinkyDungeonLevel + Math.round(KinkyDungeonDifficulty / 5);
    if (KinkyDungeonNewGame)
        effLevel += KinkyDungeonMaxLevel;
    return effLevel;
}
function KDGetEffMaxLevel() {
    let effLevel = KDGameData.HighestLevel + Math.round(KinkyDungeonDifficulty / 5);
    if (KinkyDungeonNewGame)
        effLevel += KinkyDungeonMaxLevel;
    return effLevel;
}
function KDRandomizeRedLock() {
    let level = KDGetEffLevel();
    if (KDRandom() < -0.1 + Math.min(0.5, level * 0.03))
        return "Red_Hi";
    if (KDRandom() < 0.25 + Math.min(0.55, level * 0.03))
        return "Red_Med";
    return "Red";
}
function KDGetLockList(Guaranteed, Floor, AllowGold, Type, Data) {
    let ret = {};
    for (let obj of Object.keys(KDLocks)) {
        if (KDLocks[obj].filter(Guaranteed, Floor, AllowGold, Type, Data))
            ret[obj] = KDLocks[obj].weight(Guaranteed, Floor, AllowGold, Type, Data);
    }
    return ret;
}
function KinkyDungeonGenerateLock(Guaranteed, Floor, AllowGold, Type, Data) {
    let level = (Floor) ? Floor : KDGetEffLevel();
    let chance = (level == 0) ? 0 : KinkyDungeonBaseLockChance;
    chance += KinkyDungeonScalingLockChance * level / KDLevelsPerCheckpoint;
    if (Guaranteed)
        chance = 1.0;
    let lock = undefined;
    if (KDRandom() < chance) {
        lock = KDGetByWeight(KDGetLockList(Guaranteed, level, AllowGold, Type, Data));
    }
    return lock;
}
let KDPlaceMode = {
    MODE_PLACENEW: 0x0,
    MODE_MODIFYPOTENTIALANDEXISTING: 0x1,
    MODE_MODIFYEXISTINGONLY: 0x2,
};
function KinkyDungeonPlaceDoors(doorchance, doortrapchance, nodoorchance, doorlockchance, trapChance, grateChance, Floor, width, height, placeMode = KDPlaceMode.MODE_PLACENEW) {
    let doorlist = [];
    let doorlist_2ndpass = [];
    let trapLocations = [];
    for (let X = 1; X < width; X += 1)
        for (let Y = 1; Y < height; Y += 1)
            if (((placeMode == KDPlaceMode.MODE_PLACENEW && KinkyDungeonMapGet(X, Y) != 'D' && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)))
                || ((placeMode == KDPlaceMode.MODE_MODIFYEXISTINGONLY || placeMode == KDPlaceMode.MODE_MODIFYPOTENTIALANDEXISTING) && (KinkyDungeonMapGet(X, Y) == 'd' || KinkyDungeonMapGet(X, Y) == 'D'))
                || (placeMode == KDPlaceMode.MODE_MODIFYPOTENTIALANDEXISTING && (KinkyDungeonTilesGet(X + "," + Y)?.PotentialDoor)))
                && (!KinkyDungeonTilesGet(X + "," + Y)
                    || (!KinkyDungeonTilesGet(X + "," + Y).OL && !KinkyDungeonTilesGet(X + "," + Y).Lock && !KinkyDungeonTilesGet(X + "," + Y).RequiredDoor))) {
                let wallcount = 0;
                let up = false;
                let down = false;
                let left = false;
                let right = false;
                for (let XX = X - 1; XX <= X + 1; XX += 1)
                    for (let YY = Y - 1; YY <= Y + 1; YY += 1) {
                        let get = KinkyDungeonMapGet(XX, YY);
                        if (!(XX == X && YY == Y) && (!KinkyDungeonMovableTilesEnemy.includes(get))) {
                            wallcount += 1;
                            if ("14,b".includes(get)) {
                                if (XX == X + 1 && YY == Y && !KinkyDungeonMovableTilesEnemy.includes(get))
                                    right = true;
                                else if (XX == X - 1 && YY == Y && !KinkyDungeonMovableTilesEnemy.includes(get))
                                    left = true;
                                else if (XX == X && YY == Y + 1 && !KinkyDungeonMovableTilesEnemy.includes(get))
                                    down = true;
                                else if (XX == X && YY == Y - 1 && !KinkyDungeonMovableTilesEnemy.includes(get))
                                    up = true;
                            }
                        }
                        else if (get == 'D')
                            wallcount = 100;
                    }
                if ((placeMode == KDPlaceMode.MODE_PLACENEW ? (wallcount < 5) : (wallcount > 1 && wallcount < 7)) && ((up && down) != (left && right)) && KDRandom() > nodoorchance) {
                    doorlist.push({ x: X, y: Y });
                    doorlist_2ndpass.push({ x: X, y: Y });
                }
            }
    while (doorlist.length > 0) {
        let N = Math.floor(KDRandom() * doorlist.length);
        let door = doorlist[N];
        let X = door.x;
        let Y = door.y;
        let closed = KDRandom() < doorchance;
        KinkyDungeonMapSet(X, Y, (closed ? 'D' : 'd'));
        KinkyDungeonTilesSet("" + X + "," + Y, { Type: "Door" });
        if (closed && KDRandom() < doorlockchance && KinkyDungeonIsAccessible(X, Y)) {
            KinkyDungeonTilesGet("" + X + "," + Y).Lock = KinkyDungeonGenerateLock(true, Floor, undefined, "Door", { x: X, y: Y, tile: KinkyDungeonTilesGet("" + X + "," + Y) });
        }
        if (KDRandom() < doortrapchance) {
            trapLocations.push({ x: X, y: Y });
        }
        doorlist.splice(N, 1);
    }
    while (doorlist_2ndpass.length > 0) {
        let N = Math.floor(KDRandom() * doorlist_2ndpass.length);
        let minLockedRoomSize = 8;
        let maxPlayerDist = 4;
        let door = doorlist_2ndpass[N];
        let X = door.x;
        let Y = door.y;
        let roomDoors = [];
        let trap = KDRandom() < trapChance;
        let grate = KDRandom() < grateChance;
        if ((trap || grate) && KinkyDungeonTilesGet(X + "," + Y) && !KinkyDungeonTilesGet(X + "," + Y).NoTrap && !KinkyDungeonTilesGet(X + "," + Y).OL) {
            let accessible = KinkyDungeonGetAccessibleRoom(X, Y);
            if (accessible.length > minLockedRoomSize) {
                for (let a of accessible) {
                    let split = a.split(',');
                    let XX = parseInt(split[0]);
                    let YY = parseInt(split[1]);
                    let tileType = KinkyDungeonMapGet(XX, YY);
                    if ((tileType == "D" || tileType == 'd') && !KinkyDungeonTilesGet(a).Lock && XX != X && YY != Y) {
                        roomDoors.push({ x: XX, y: YY });
                    }
                }
                let rooms = [];
                let room2 = KinkyDungeonGetAccessibleRoom(X, Y);
                for (let ddoor of roomDoors) {
                    rooms.push({ door: ddoor, room: room2 });
                }
                for (let room of rooms) {
                    let success = room.room.length == accessible.length;
                    for (let tile of accessible) {
                        if (!room.room.includes(tile)) {
                            success = false;
                            break;
                        }
                    }
                    if (success) {
                        if (!KinkyDungeonTilesGet(room.door.x + "," + room.door.y).Lock && !KinkyDungeonTilesGet(X + "," + Y).Lock && !KinkyDungeonTilesGet(room.door.x + "," + room.door.y).NoTrap
                            && ((KinkyDungeonGetAccessibleRoom(X + 1, Y).length != KinkyDungeonGetAccessibleRoom(X - 1, Y).length
                                && KinkyDungeonIsReachable(X + 1, Y, X, Y) && KinkyDungeonIsReachable(X - 1, Y, X, Y))
                                || (KinkyDungeonGetAccessibleRoom(X, Y + 1).length != KinkyDungeonGetAccessibleRoom(X, Y - 1).length)
                                    && KinkyDungeonIsReachable(X, Y + 1, X, Y) && KinkyDungeonIsReachable(X, Y - 1, X, Y))
                            && KinkyDungeonIsAccessible(X, Y)) {
                            let lock = false;
                            if (trap && Math.max(Math.abs(room.door.x - KinkyDungeonPlayerEntity.x), Math.abs(room.door.y - KinkyDungeonPlayerEntity.y)) > maxPlayerDist) {
                                if (KDDebug)
                                    console.log("Trap at " + X + "," + Y);
                                trapLocations.push({ x: room.door.x, y: room.door.y });
                                if (KDRandom() < 0.1) {
                                    let dropped = { x: room.door.x, y: room.door.y, name: "Gold", amount: 1 };
                                    KDMapData.GroundItems.push(dropped);
                                }
                                lock = true;
                            }
                            else if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(room.door.x, room.door.y + 1)) && ((grate && (!room.room || room.room.length > minLockedRoomSize))
                                || (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y + 1)) && Math.max(Math.abs(room.door.x - KinkyDungeonPlayerEntity.x), Math.abs(room.door.y - KinkyDungeonPlayerEntity.y)) <= maxPlayerDist))
                                && room.door.y != KDMapData.StartPosition.y) {
                                KinkyDungeonMapSet(room.door.x, room.door.y, 'g');
                                lock = true;
                            }
                            if (lock) {
                                KinkyDungeonTilesGet("" + X + "," + Y).Lock = KinkyDungeonGenerateLock(true, Floor, false, "Door", { x: X, y: Y, tile: KinkyDungeonTilesGet("" + X + "," + Y) });
                                KinkyDungeonMapSet(X, Y, 'D');
                            }
                        }
                        break;
                    }
                }
            }
        }
        doorlist_2ndpass.splice(N, 1);
    }
    return trapLocations;
}
function KinkyDungeonReplaceDoodads(Chance, barchance, wallRubblechance, wallhookchance, ceilinghookchance, width, height, altType) {
    if (altType && !altType.noClutter) {
        for (let X = 1; X < width - 1; X += 1)
            for (let Y = 1; Y < height - 1; Y += 1) {
                let tl = KinkyDungeonMapGet(X, Y);
                let tr = KinkyDungeonMapGet(X + 1, Y);
                let bl = KinkyDungeonMapGet(X, Y + 1);
                let br = KinkyDungeonMapGet(X + 1, Y + 1);
                if (tl == '1' && br == '1' && KinkyDungeonMovableTilesEnemy.includes(tr) && KinkyDungeonMovableTilesEnemy.includes(bl))
                    KinkyDungeonMapSet(X, Y, 'X');
                else if (tr == '1' && bl == '1' && KinkyDungeonMovableTilesEnemy.includes(tl) && KinkyDungeonMovableTilesEnemy.includes(br))
                    KinkyDungeonMapSet(X, Y + 1, 'X');
            }
        for (let X = 1; X < width - 1; X += 1)
            for (let Y = 1; Y < height - 1; Y += 1) {
                if (KinkyDungeonMapGet(X, Y) == '1' && KDRandom() < barchance
                    && ((KinkyDungeonMapGet(X, Y - 1) == '1' && KinkyDungeonMapGet(X, Y + 1) == '1' && KinkyDungeonMapGet(X - 1, Y) == '0' && KinkyDungeonMapGet(X + 1, Y) == '0')
                        || (KinkyDungeonMapGet(X - 1, Y) == '1' && KinkyDungeonMapGet(X + 1, Y) == '1' && KinkyDungeonMapGet(X, Y - 1) == '0' && KinkyDungeonMapGet(X, Y + 1) == '0'))) {
                    KinkyDungeonMapSet(X, Y, 'b');
                }
                else if ((KinkyDungeonMapGet(X, Y) == '2' || KinkyDungeonMapGet(X, Y) == '0') && ((KDRandom() < wallhookchance && KinkyDungeonMapGet(X - 1, Y) == '1' && KinkyDungeonMapGet(X, Y - 1) == '1' && KinkyDungeonMapGet(X + 1, Y) == '0' && KinkyDungeonMapGet(X + 1, Y - 1) == '0' && KinkyDungeonMapGet(X + 1, Y + 1) == '0')
                    || (KDRandom() < wallhookchance && KinkyDungeonMapGet(X + 1, Y) == '1' && KinkyDungeonMapGet(X, Y - 1) == '1' && KinkyDungeonMapGet(X - 1, Y) == '0' && KinkyDungeonMapGet(X - 1, Y - 1) == '0' && KinkyDungeonMapGet(X - 1, Y + 1) == '0')
                    || (KDRandom() < wallhookchance && KinkyDungeonMapGet(X, Y - 1) == '1' && KinkyDungeonMapGet(X, Y + 1) == '0' && KinkyDungeonMapGet(X + 1, Y + 1) == '0' && KinkyDungeonMapGet(X - 1, Y + 1) == '0')
                    || (KDRandom() < wallhookchance && KinkyDungeonMapGet(X, Y + 1) == '1' && KinkyDungeonMapGet(X, Y - 1) == '1' && KinkyDungeonMapGet(X, Y - 1) == '0' && KinkyDungeonMapGet(X + 1, Y - 1) == '0' && KinkyDungeonMapGet(X - 1, Y - 1) == '0'))) {
                    KinkyDungeonMapSet(X, Y - 1, ',');
                }
                else if (KDRandom() < ceilinghookchance && (KinkyDungeonMapGet(X, Y) == '2' || KinkyDungeonMapGet(X, Y) == '0' &&
                    (KinkyDungeonMapGet(X - 1, Y) != '1'
                        && KinkyDungeonMapGet(X + 1, Y) != '1'
                        && KinkyDungeonMapGet(X, Y - 1) != '1'
                        && KinkyDungeonMapGet(X, Y + 1) != '1'
                        && KinkyDungeonMapGet(X + 1, Y + 1) != '1'
                        && KinkyDungeonMapGet(X + 1, Y - 1) != '1'
                        && KinkyDungeonMapGet(X - 1, Y + 1) != '1'
                        && KinkyDungeonMapGet(X - 1, Y - 1) != '1'))) {
                    KinkyDungeonMapSet(X, Y, '?');
                }
            }
    }
    let addedCave = false;
    for (let X = 1; X < width - 1; X += 1)
        for (let Y = 1; Y < height - 1; Y += 1) {
            let category = (KDMapData.CategoryIndex ? KDGetCategoryIndex(X, Y)?.category : {});
            if (category?.tags?.includes("noWear"))
                continue;
            if (KinkyDungeonMapGet(X, Y) == '1' && KDRandom() < Chance) {
                KinkyDungeonMapSet(X, Y, '4');
                let accessible = false;
                for (let x = X - 1; x <= X + 1; x++) {
                    for (let y = Y - 1; y <= Y + 1; y++) {
                        if (!!KDMapData.RandomPathablePoints[x + ',' + y]) {
                            accessible = true;
                            x = X + 2;
                            y = Y + 2;
                        }
                    }
                }
                let toExcavate = [{ x: X, y: Y }];
                let curXOld = X;
                let curYOld = Y;
                let lastPoint = null;
                for (let a = 0; a < 2; a++) {
                    let curX = curXOld;
                    let curY = curYOld;
                    for (let i = 0; i < 7; i++) {
                        let xd = KDRandom() < 0.33 ? 0 :
                            (KDRandom() < 0.5 ? -1 : 1);
                        let yd = xd ? 0 : (KDRandom() < 0.5 ? -1 : 1);
                        curX += xd;
                        curY += yd;
                        if ((KinkyDungeonMapGet(curX, curY) == '1'
                            && !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(curX + 1, curY))
                            && !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(curX - 1, curY))
                            && !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(curX, curY + 1))
                            && !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(curX, curY - 1)))
                            || KinkyDungeonMapGet(curX, curY) == '4') {
                            KinkyDungeonMapSet(curX, curY, '4');
                            lastPoint = { x: curX, y: curY };
                            toExcavate.push(lastPoint);
                        }
                        else {
                            curX -= xd;
                            curY -= yd;
                        }
                    }
                }
                if (accessible
                    && lastPoint?.x > 0
                    && lastPoint.y > 0
                    && lastPoint.x < KDMapData.GridWidth - 2
                    && lastPoint.y < KDMapData.GridHeight - 2) {
                    KDMapData.PotentialEntrances.push({
                        Excavate: toExcavate,
                        PlaceScript: "Cave",
                        Type: "Cave",
                        x: lastPoint.x,
                        y: lastPoint.y,
                    });
                }
            }
            else if (KinkyDungeonMapGet(X, Y) == '1' && KDRandom() < wallRubblechance && !KDMapData.TilesSkin[X + "," + Y]
                && KDNearbyMapTiles(X, Y, 1.5).some((mt) => {
                    return KinkyDungeonGroundTiles.includes(mt.tile)
                        && KDMapData.RandomPathablePoints["" + mt.x + "," + mt.y];
                })) {
                KinkyDungeonMapSet(X, Y, 'Y');
                KDMapData.PotentialEntrances.push({
                    Excavate: [{ x: X, y: Y }],
                    PlaceScript: "Cave",
                    Type: "Cave",
                    x: X,
                    y: Y,
                });
            }
        }
}
function KinkyDungeonPlaceJailEntrances(width, height, altType) {
    for (let X = 1; X < width - 1; X += 1)
        for (let Y = 1; Y < height - 1; Y += 1) {
            if (KinkyDungeonMapGet(X, Y) == '1' && !KDMapData.TilesSkin[X + "," + Y]
                && !KinkyDungeonTilesGet(X + "," + Y)?.OL
                && !KinkyDungeonTilesGet(X + "," + Y)?.Type) {
                let allow = "14";
                let u = allow.includes(KinkyDungeonMapGet(X, Y - 1));
                let d = allow.includes(KinkyDungeonMapGet(X, Y + 1));
                let r = allow.includes(KinkyDungeonMapGet(X + 1, Y));
                let l = allow.includes(KinkyDungeonMapGet(X - 1, Y));
                let ul = allow.includes(KinkyDungeonMapGet(X - 1, Y - 1));
                let dl = allow.includes(KinkyDungeonMapGet(X - 1, Y + 1));
                let ur = allow.includes(KinkyDungeonMapGet(X + 1, Y - 1));
                let dr = allow.includes(KinkyDungeonMapGet(X + 1, Y + 1));
                let sum = 0;
                let corn = 0;
                if (u)
                    sum += 1;
                if (d)
                    sum += 1;
                if (l)
                    sum += 1;
                if (r)
                    sum += 1;
                if (ul)
                    corn += 1;
                if (dl)
                    corn += 1;
                if (ur)
                    corn += 1;
                if (dr)
                    corn += 1;
                if (sum == 3 && corn == 2) {
                    if ((!u && !ul && !ur)
                        || (!d && !dl && !dr)
                        || (!l && !ul && !dl)
                        || (!r && !ur && !dr)) {
                        let accessible = false;
                        for (let x = X - 1; x <= X + 1; x++) {
                            for (let y = Y - 1; y <= Y + 1; y++) {
                                if (!!KDMapData.RandomPathablePoints[x + ',' + y]) {
                                    accessible = true;
                                    x = X + 2;
                                    y = Y + 2;
                                }
                            }
                        }
                        if (accessible
                            && X > 0
                            && Y > 0
                            && X < KDMapData.GridWidth - 2
                            && Y < KDMapData.GridHeight - 2) {
                            KDMapData.PotentialEntrances.push({
                                Excavate: [],
                                PlaceScript: "Jail",
                                Type: "Jail",
                                x: X,
                                y: Y,
                            });
                        }
                    }
                }
            }
        }
}
function KinkyDungeonPlaceFurniture(barrelChance, cageChance, width, height, altType) {
    if (!altType || !altType.noClutter)
        for (let X = 1; X < width - 1; X += 1)
            for (let Y = 1; Y < height - 1; Y += 1) {
                let category = (KDMapData.CategoryIndex ? KDGetCategoryIndex(X, Y)?.category : {});
                if (category?.tags?.includes("noClutter"))
                    continue;
                if (KinkyDungeonMapGet(X, Y) == '0' && !(KinkyDungeonTilesGet(X + "," + Y) && (KinkyDungeonTilesGet(X + "," + Y).OL || KinkyDungeonTilesGet(X + "," + Y).Skin))
                    && !(Object.values(KinkyDungeonEffectTilesGet(X + ',' + Y) || {})?.length > 0)
                    && (KinkyDungeonMapGet(X + 1, Y) != 'd' && KinkyDungeonMapGet(X + 1, Y) != 'D'
                        && KinkyDungeonMapGet(X - 1, Y) != 'd' && KinkyDungeonMapGet(X - 1, Y) != 'D'
                        && KinkyDungeonMapGet(X, Y + 1) != 'd' && KinkyDungeonMapGet(X, Y + 1) != 'D'
                        && KinkyDungeonMapGet(X, Y - 1) != 'd' && KinkyDungeonMapGet(X, Y - 1) != 'D')
                    && ((KDRandom() < barrelChance * 4 && KinkyDungeonMapGet(X - 2, Y) == '1' && KinkyDungeonMapGet(X + 2, Y) == '1' && KinkyDungeonMapGet(X, Y - 2) == '1' && KinkyDungeonMapGet(X, Y + 2) == '1')
                        || (KDRandom() < barrelChance * 2 && KinkyDungeonMapGet(X - 1, Y - 1) == '1' && KinkyDungeonMapGet(X + 1, Y - 1) == '1' && KinkyDungeonMapGet(X - 1, Y + 1) == '1' && KinkyDungeonMapGet(X - 1, Y + 1) == '1')
                        || (KDRandom() < barrelChance && KinkyDungeonMapGet(X - 1, Y) == '1' && KinkyDungeonMapGet(X + 1, Y) == '0' && KinkyDungeonMapGet(X + 1, Y - 1) == '0' && KinkyDungeonMapGet(X + 1, Y + 1) == '0')
                        || (KDRandom() < barrelChance && KinkyDungeonMapGet(X + 1, Y) == '1' && KinkyDungeonMapGet(X - 1, Y) == '0' && KinkyDungeonMapGet(X - 1, Y - 1) == '0' && KinkyDungeonMapGet(X - 1, Y + 1) == '0')
                        || (KDRandom() < barrelChance && KinkyDungeonMapGet(X, Y - 1) == '1' && KinkyDungeonMapGet(X, Y + 1) == '0' && KinkyDungeonMapGet(X + 1, Y + 1) == '0' && KinkyDungeonMapGet(X - 1, Y + 1) == '0')
                        || (KDRandom() < barrelChance && KinkyDungeonMapGet(X, Y + 1) == '1' && KinkyDungeonMapGet(X, Y - 1) == '0' && KinkyDungeonMapGet(X + 1, Y - 1) == '0' && KinkyDungeonMapGet(X - 1, Y - 1) == '0'))) {
                    KinkyDungeonMapSet(X, Y, 'L');
                    if (KDRandom() < cageChance) {
                        let furn = KinkyDungeonStatsChoice.get("MoreKinkyFurniture") ? 0.8 : 0.1;
                        KinkyDungeonTilesSet(X + "," + Y, { Type: "Furniture", Furniture: furn });
                        KDMapData.JailPoints.push({ x: X, y: Y, type: "furniture", radius: 1 });
                    }
                }
            }
}
let KDFood = {
    "": {
        Food: "",
        Weight: 10,
    },
    Plate: {
        Food: "Plate",
        inedible: true,
        Weight: 1,
    },
    Cookies: {
        Food: "Cookies",
        Theft: "Cookie",
        Weight: 8,
    },
    Donut: {
        Food: "Donut",
        Theft: "Donut",
        Weight: 6,
    },
    Brownies: {
        Food: "Brownies",
        Theft: "Brownies",
        Weight: 3,
    },
    IceCream: {
        Food: "IceCream",
        Weight: 8,
    },
    Pizza: {
        Food: "Pizza",
        Weight: 12,
    },
    IceCreamPoisoned: {
        Food: "IceCreamPoisoned",
        Weight: 2,
        FilterPerk: "No_SleepFood",
        OnEat: "PoisonedFood",
    },
    PizzaPoisoned: {
        Food: "PizzaPoisoned",
        FilterPerk: "No_SleepFood",
        OnEat: "PoisonedFood",
        Weight: 2,
    },
    IceCreamArousal: {
        Food: "IceCreamArousal",
        Weight: 2,
        FilterPerk: "No_ArousalFood",
        OnEat: "ArousalFood",
    },
    PizzaArousal: {
        Food: "PizzaArousal",
        FilterPerk: "No_ArousalFood",
        OnEat: "ArousalFood",
        Weight: 2,
    },
};
let KDOnEatScripts = {
    PoisonedFood: (x, y, tile, food) => {
        KinkyDungeonSendTextMessage(10, TextGet("KDFoodPoison", {
            Food: TextGet("KDFoodName" + food.Food).toLocaleLowerCase()
        }), KDBaseRed, 8);
        KinkyDungeonApplyBuffToEntity(KDPlayer(), KDPoisonSleepLong);
        let sfx = "Damage";
        KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
    },
    ArousalFood: (x, y, tile, food) => {
        KinkyDungeonSendTextMessage(10, TextGet("KDFoodArousal", {
            Food: TextGet("KDFoodName" + food.Food).toLocaleLowerCase()
        }), KDBaseRed, 8);
        KinkyDungeonApplyBuffToEntity(KDPlayer(), KDArousalOverTime);
        KinkyDungeonApplyBuffToEntity(KDPlayer(), KDArousalOverTime2);
        let sfx = "Damage";
        KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
    },
};
function KinkyDungeonPlaceFood(foodChance, width, height, altType) {
    if (altType && altType.noClutter)
        return;
    if (altType && altType.noTables)
        return;
    let foodPoints = new Map();
    let foodList = [];
    for (let X = 1; X < width; X += 1)
        for (let Y = 1; Y < height; Y += 1)
            if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && Math.max(Math.abs(X - KDMapData.StartPosition.x), Math.abs(Y - KDMapData.StartPosition.y)) > KinkyDungeonJailLeash
                && (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OL)) {
                let wallcount = 0;
                let adjcount = 0;
                let diagadj = 0;
                for (let XX = X - 1; XX <= X + 1; XX += 1)
                    for (let YY = Y - 1; YY <= Y + 1; YY += 1) {
                        if (!(XX == X && YY == Y) && (KinkyDungeonMapGet(XX, YY) == '1' || KinkyDungeonMapGet(XX, YY) == 'X')) {
                            wallcount += 1;
                            if (XX == X || YY == Y)
                                adjcount += 1;
                        }
                        else if (!(XX == X && YY == Y) && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY))) {
                            if (!(XX == X || YY == Y)) {
                                if (XX == X + 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X + 1, Y)))
                                    diagadj += 1;
                                else if (XX == X - 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X - 1, Y)))
                                    diagadj += 1;
                                else if (YY == Y + 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y + 1)))
                                    diagadj += 1;
                                else if (YY == Y - 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y - 1)))
                                    diagadj += 1;
                            }
                        }
                    }
                if (wallcount == 7
                    || (wallcount >= 4 && (wallcount - adjcount - diagadj == 0 || (wallcount == 5 && adjcount == 2 && diagadj == 1) || (wallcount == 6 && adjcount == 3 && diagadj == 1))
                        && (KinkyDungeonMapGet(X + 1, Y) == '1' || KinkyDungeonMapGet(X - 1, Y) == '1')
                        && (KinkyDungeonMapGet(X, Y + 1) == '1' || KinkyDungeonMapGet(X, Y - 1) == '1')
                        && (!(KinkyDungeonMapGet(X + 1, Y) == '1' && KinkyDungeonMapGet(X - 1, Y) == '1') || (wallcount == 6 && adjcount == 3 && diagadj == 1))
                        && (!(KinkyDungeonMapGet(X, Y + 1) == '1' && KinkyDungeonMapGet(X, Y - 1) == '1') || (wallcount == 6 && adjcount == 3 && diagadj == 1)))) {
                    if (!foodPoints.get((X + 1) + "," + (Y))
                        && !foodPoints.get((X - 1) + "," + (Y))
                        && !foodPoints.get((X + 1) + "," + (Y + 1))
                        && !foodPoints.get((X + 1) + "," + (Y - 1))
                        && !foodPoints.get((X - 1) + "," + (Y + 1))
                        && !foodPoints.get((X - 1) + "," + (Y - 1))
                        && !foodPoints.get((X) + "," + (Y + 1))
                        && !foodPoints.get((X) + "," + (Y - 1))
                        && !(Object.keys(KDGetEffectTiles(X, Y)).length > 0)
                        && !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X - 1, Y - 1))
                        && !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X, Y - 1))
                        && !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X + 1, Y - 1))
                        && !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X - 1, Y))
                        && !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X + 1, Y))
                        && !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X - 1, Y + 1))
                        && !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X, Y + 1))
                        && !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X + 1, Y + 1))) {
                        foodList.push({ x: X, y: Y, boringness: KinkyDungeonBoringGet(X, Y), priority: 0 });
                        foodPoints.set(X + "," + Y, true);
                    }
                }
            }
    let count = 0;
    let list = [];
    let maxBoringness = Math.max(...KDMapExtraData.Boringness);
    while (foodList.length > 0) {
        let N = Math.floor(KDRandom() * foodList.length);
        let chest = foodList[N];
        if (!chest.boringness)
            chest.boringness = KinkyDungeonBoringGet(chest.x, chest.y);
        if (chest.boringness > 0)
            chest.boringness = chest.boringness + (0.05 + 0.1 * KDRandom()) * maxBoringness;
        else
            chest.boringness = chest.boringness + 0.05 * KDRandom() * maxBoringness;
        if (chest.priority) {
            list.unshift(chest);
        }
        else
            list.push(chest);
        foodList.splice(N, 1);
    }
    list.sort((a, b) => {
        let boringa = a.boringness ? a.boringness : 0;
        let boringb = b.boringness ? b.boringness : 0;
        if (a.priority)
            boringa += 1000;
        if (b.priority)
            boringb += 1000;
        return boringb - boringa;
    });
    let foodcount = list.length * foodChance;
    while (list.length > 0) {
        let N = 0;
        if (count <= foodcount) {
            let shrine = list[N];
            let tile = 'F';
            let type = undefined;
            let WeightTotal = 0;
            let Weights = [];
            for (let obj of Object.values(KDFood)) {
                if (!obj.FilterPerk || !KinkyDungeonStatsChoice.get(obj.FilterPerk)) {
                    Weights.push({ event: obj, weight: WeightTotal });
                    WeightTotal += obj.Weight;
                }
            }
            let selection = KDRandom() * WeightTotal;
            for (let L = Weights.length - 1; L >= 0; L--) {
                if (selection > Weights[L].weight) {
                    type = Weights[L].event.Food;
                    break;
                }
            }
            KinkyDungeonTilesSet("" + shrine.x + "," + shrine.y, { Food: type, Type: "Food" });
            KinkyDungeonMapSet(shrine.x, shrine.y, tile);
            count += 1;
        }
        list.splice(N, 1);
    }
}
function KinkyDungeonPlaceTorches(torchchance, torchlitchance, torchchanceboring, width, height, _altType, torchreplace) {
    for (let X = 1; X < width - 1; X += 1)
        for (let Y = 1; Y < height - 1; Y += 1) {
            if (KinkyDungeonMapGet(X, Y) == '1'
                && KDInteractableTiles.includes(KinkyDungeonMapGet(X, Y + 1))
                && !KinkyDungeonEffectTilesGet((X - 1) + "," + (Y + 1))
                && !KinkyDungeonEffectTilesGet((X) + "," + (Y + 1))
                && !KinkyDungeonEffectTilesGet((X + 1) + "," + (Y + 1))
                && !KinkyDungeonTilesGet((X - 1) + "," + (Y + 1))
                && !KinkyDungeonTilesGet((X) + "," + (Y + 1))
                && !KinkyDungeonTilesGet((X + 1) + "," + (Y + 1))
                && !KinkyDungeonTilesGet((X) + "," + (Y))
                && KDRandom() < torchchance + KinkyDungeonBoringGet(X, Y) * torchchanceboring) {
                let spr = torchreplace ? torchreplace.sprite : "Torch";
                if ((!torchreplace || torchreplace.unlitsprite) && KDRandom() > torchlitchance) {
                    spr = torchreplace ? torchreplace.unlitsprite : "TorchUnlit";
                }
                let torchref = {
                    name: spr,
                    duration: 9999, infinite: true,
                };
                KDCreateEffectTile(X, Y + 1, torchref, 0);
            }
        }
}
function KinkyDungeonReplaceVert(width, height) {
    for (let X = 0; X <= width - 1; X += 1)
        for (let Y = 0; Y <= height - 1; Y += 1) {
            let tileUp = KinkyDungeonMapGet(X, Y);
            let tileBelow = KinkyDungeonMapGet(X, Y + 1);
            if ((tileUp == '1'
                || tileUp == '4') && (tileBelow == '1'
                || tileBelow == '4'
                || tileBelow == 'd'
                || tileBelow == 'D'
                || tileBelow == ',')) {
            }
        }
}
function KinkyDungeonMazeWalls(Cell, Walls, WallsList) {
    if (Walls[(Cell.x + 1) + "," + Cell.y])
        WallsList[(Cell.x + 1) + "," + Cell.y] = { x: Cell.x + 1, y: Cell.y };
    if (Walls[(Cell.x - 1) + "," + Cell.y])
        WallsList[(Cell.x - 1) + "," + Cell.y] = { x: Cell.x - 1, y: Cell.y };
    if (Walls[Cell.x + "," + (Cell.y + 1)])
        WallsList[Cell.x + "," + (Cell.y + 1)] = { x: Cell.x, y: Cell.y + 1 };
    if (Walls[Cell.x + "," + (Cell.y - 1)])
        WallsList[Cell.x + "," + (Cell.y - 1)] = { x: Cell.x, y: Cell.y - 1 };
}
function KinkyDungeonMapSet(X, Y, SetTo, VisitedRooms) {
    let height = KDMapData.GridHeight;
    let width = KDMapData.GridWidth;
    if (X > 0 && X < width - 1 && Y > 0 && Y < height - 1) {
        KDMapData.Grid = KDMapData.Grid.replaceAt(X + Y * (width + 1), SetTo);
        if (VisitedRooms)
            VisitedRooms.push({ x: X, y: Y });
        return true;
    }
    return false;
}
function KinkyDungeonMapSetForce(X, Y, SetTo, VisitedRooms) {
    let width = KDMapData.GridWidth;
    KDMapData.Grid = KDMapData.Grid.replaceAt(X + Y * (width + 1), SetTo);
    if (VisitedRooms)
        VisitedRooms.push({ x: X, y: Y });
    return true;
}
function KinkyDungeonMapDataSet(data, X, Y, SetTo) {
    let height = data.GridHeight;
    let width = data.GridWidth;
    if (X > 0 && X < width - 1 && Y > 0 && Y < height - 1) {
        data.Grid = data.Grid.replaceAt(X + Y * (width + 1), SetTo);
        return true;
    }
    return false;
}
function KinkyDungeonBoringGet(X, Y) {
    return KDMapExtraData.Boringness[X + Y * (KDMapData.GridWidth)];
}
function KinkyDungeonBoringSet(X, Y, SetTo) {
    if (X >= 0 && X <= KDMapData.GridWidth - 1 && Y >= 0 && Y <= KDMapData.GridHeight - 1) {
        KDMapExtraData.Boringness[X + Y * (KDMapData.GridWidth)] = SetTo;
        return true;
    }
    return false;
}
function KinkyDungeonMapGet(X, Y) {
    return KDMapData.Grid[X + Y * (KDMapData.GridWidth + 1)];
}
function KinkyDungeonMapDataGet(data, X, Y) {
    return data.Grid[X + Y * (data.GridWidth + 1)];
}
function KinkyDungeonVisionSet(X, Y, SetTo) {
    if (X >= 0 && X <= KDMapData.GridWidth - 1 && Y >= 0 && Y <= KDMapData.GridHeight - 1) {
        KDMapExtraData.VisionGrid[X + Y * (KDMapData.GridWidth)] = SetTo;
        return true;
    }
    return false;
}
function KinkyDungeonBrightnessSet(X, Y, SetTo, monotonic) {
    if (X >= 0 && X <= KDMapData.GridWidth - 1 && Y >= 0 && Y <= KDMapData.GridHeight - 1) {
        if (!monotonic || SetTo > KDMapExtraData.BrightnessGrid[X + Y * (KDMapData.GridWidth)])
            KDMapExtraData.BrightnessGrid[X + Y * (KDMapData.GridWidth)] = SetTo;
        return true;
    }
    return false;
}
function KinkyDungeonColorSet(X, Y, SetTo, monotonic) {
    if (X >= 0 && X <= KDMapData.GridWidth - 1 && Y >= 0 && Y <= KDMapData.GridHeight - 1) {
        if (!monotonic || SetTo > KDMapExtraData.ColorGrid[X + Y * (KDMapData.GridWidth)])
            KDMapExtraData.ColorGrid[X + Y * (KDMapData.GridWidth)] = SetTo;
        return true;
    }
    return false;
}
function KinkyDungeonShadowSet(X, Y, SetTo, monotonic) {
    if (X >= 0 && X <= KDMapData.GridWidth - 1 && Y >= 0 && Y <= KDMapData.GridHeight - 1) {
        if (!monotonic || SetTo > KDMapExtraData.ShadowGrid[X + Y * (KDMapData.GridWidth)])
            KDMapExtraData.ShadowGrid[X + Y * (KDMapData.GridWidth)] = SetTo;
        return true;
    }
    return false;
}
function KinkyDungeonVisionGet(X, Y) {
    return KDMapExtraData.VisionGrid[X + Y * (KDMapData.GridWidth)];
}
function KinkyDungeonBrightnessGet(X, Y) {
    return KDMapExtraData.BrightnessGrid[X + Y * (KDMapData.GridWidth)];
}
function KinkyDungeonColorGet(X, Y) {
    return KDMapExtraData.ColorGrid[X + Y * (KDMapData.GridWidth)];
}
function KinkyDungeonShadowGet(X, Y) {
    return KDMapExtraData.ShadowGrid[X + Y * (KDMapData.GridWidth)];
}
function KinkyDungeonFogGet(X, Y) {
    return KDMapData.FogGrid[X + Y * (KDMapData.GridWidth)];
}
function KinkyDungeonFogSet(X, Y, val) {
    KDMapData.FogGrid[X + Y * (KDMapData.GridWidth)] = val;
}
function KinkyDungeonFogMemoryGet(X, Y) {
    return KDMapData.FogMemory[X + Y * (KDMapData.GridWidth)];
}
function KinkyDungeonFogMemorySet(X, Y, val) {
    KDMapData.FogMemory[X + Y * (KDMapData.GridWidth)] = val;
}
let canvasOffsetX = 0;
let canvasOffsetY = 0;
const canvasOffsetX_ui = 500;
const canvasOffsetY_ui = 164;
let KDDirectionFactor = 1.5;
let KDDirectionFactorScale = 1;
function KinkyDungeonGetDirection(dx, dy) {
    let X = 0;
    let Y = 0;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5)
        return { x: 0, y: 0, delta: 1 };
    const factor = KDDirectionFactor + KDDirectionFactorScale * Math.min(1, KDistChebyshev(dx, dy) / 5);
    if (dy > 0 && Math.abs(dx) < Math.abs(dy) / factor)
        Y = 1;
    else if (dy < 0 && Math.abs(dx) < Math.abs(dy) / factor)
        Y = -1;
    else if (dx > 0 && Math.abs(dy) < Math.abs(dx) / factor)
        X = 1;
    else if (dx < 0 && Math.abs(dy) < Math.abs(dx) / factor)
        X = -1;
    else if (dy > 0 && dx > dy / factor) {
        Y = 1;
        X = 1;
    }
    else if (dy > 0 && -dx > dy / factor) {
        Y = 1;
        X = -1;
    }
    else if (dy < 0 && dx > -dy / factor) {
        Y = -1;
        X = 1;
    }
    else if (dy < 0 && -dx > -dy / factor) {
        Y = -1;
        X = -1;
    }
    if (X == 0 && Y == 0 && (dx || dy))
        return KDGetDirGeometric(dx, dy);
    return { x: X, y: Y, delta: Math.round(Math.sqrt(X * X + Y * Y) * 2) / 2 };
}
function KDGetDirGeometric(dx, dy) {
    let X = 0;
    let Y = 0;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5)
        return { x: 0, y: 0, delta: 1 };
    if (dy > 0 && Math.abs(dx) < Math.abs(dy) / 2.61312593)
        Y = 1;
    else if (dy < 0 && Math.abs(dx) < Math.abs(dy) / 2.61312593)
        Y = -1;
    else if (dx > 0 && Math.abs(dy) < Math.abs(dx) / 2.61312593)
        X = 1;
    else if (dx < 0 && Math.abs(dy) < Math.abs(dx) / 2.61312593)
        X = -1;
    else if (dy > 0 && dx > dy / 2.61312593) {
        Y = 1;
        X = 1;
    }
    else if (dy > 0 && -dx > dy / 2.61312593) {
        Y = 1;
        X = -1;
    }
    else if (dy < 0 && dx > -dy / 2.61312593) {
        Y = -1;
        X = 1;
    }
    else if (dy < 0 && -dx > -dy / 2.61312593) {
        Y = -1;
        X = -1;
    }
    return { x: X, y: Y, delta: Math.round(Math.sqrt(X * X + Y * Y) * 2) / 2 };
}
function KinkyDungeonGetDirectionRandom(dx, dy) {
    let dir = KinkyDungeonGetDirection(dx, dy);
    let pivot = Math.floor(KDRandom() * 3) - 1;
    if (dir.x == 0 && dir.y == 1)
        dir.x = pivot;
    else if (dir.x == 0 && dir.y == -1)
        dir.x = -pivot;
    else if (dir.x == 1 && dir.y == 0)
        dir.y = pivot;
    else if (dir.x == -1 && dir.y == 0)
        dir.y = -pivot;
    else if (dir.x == 1 && dir.y == 1) {
        if (pivot == 1) {
            dir.y = 0;
        }
        else if (pivot == -1) {
            dir.x = 0;
        }
    }
    else if (dir.x == 1 && dir.y == -1) {
        if (pivot == 1) {
            dir.x = 0;
        }
        else if (pivot == -1) {
            dir.y = 0;
        }
    }
    else if (dir.x == -1 && dir.y == 1) {
        if (pivot == 1) {
            dir.x = 0;
        }
        else if (pivot == -1) {
            dir.y = 0;
        }
    }
    else if (dir.x == -1 && dir.y == -1) {
        if (pivot == 1) {
            dir.y = 0;
        }
        else if (pivot == -1) {
            dir.x = 0;
        }
    }
    dir.delta = Math.round(Math.sqrt(dir.x * dir.x + dir.y * dir.y) * 2) / 2;
    return dir;
}
function KDGetAdjacentTiles(dx, dy) {
    let list = [];
    for (let pivot of [-1, 1]) {
        let dir = KinkyDungeonGetDirection(dx, dy);
        if (dir.x == 0 && dir.y == 1)
            dir.x = pivot;
        else if (dir.x == 0 && dir.y == -1)
            dir.x = -pivot;
        else if (dir.x == 1 && dir.y == 0)
            dir.y = pivot;
        else if (dir.x == -1 && dir.y == 0)
            dir.y = -pivot;
        else if (dir.x == 1 && dir.y == 1) {
            if (pivot == 1) {
                dir.y = 0;
            }
            else if (pivot == -1) {
                dir.x = 0;
            }
        }
        else if (dir.x == 1 && dir.y == -1) {
            if (pivot == 1) {
                dir.x = 0;
            }
            else if (pivot == -1) {
                dir.y = 0;
            }
        }
        else if (dir.x == -1 && dir.y == 1) {
            if (pivot == 1) {
                dir.x = 0;
            }
            else if (pivot == -1) {
                dir.y = 0;
            }
        }
        else if (dir.x == -1 && dir.y == -1) {
            if (pivot == 1) {
                dir.y = 0;
            }
            else if (pivot == -1) {
                dir.x = 0;
            }
        }
        list.push(dir);
    }
    return list;
}
let KinkyDungeonAutoWaitSuppress = false;
function KinkyDungeonControlsEnabled() {
    return !KinkyDungeonInspect
        && KDGameData.SlowMoveTurns < 1
        && KinkyDungeonStatFreeze < 1
        && KDGameData.SleepTurns < 1
        && !KDGameData.CurrentDialog
        && !KinkyDungeonMessageToggle;
}
function KDStartSpellcast(tx, ty, SpellToCast, enemy, player, bullet, data) {
    let spell = KinkyDungeonFindSpell(SpellToCast.name, true);
    let spellname = undefined;
    if (spell) {
        spellname = spell.name;
        spell = undefined;
    }
    else
        spell = SpellToCast;
    return KDSendInput("tryCastSpell", { tx: tx, ty: ty, spell: spell, spellname: spellname, enemy: enemy, player: player, bullet: bullet, ...data });
}
function KinkyDungeonClickGame(event, _Level) {
    let _CharacterRefresh = CharacterRefresh;
    let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
    CharacterRefresh = () => { KDRefresh = true; };
    CharacterAppearanceBuildCanvas = () => { };
    if (KDShowExtraTooltipMaxCycle > 0 && KinkyDungeonInspect) {
        KDShowExtraTooltipCycle = (KDShowExtraTooltipCycle + 1) % (KDShowExtraTooltipMaxCycle + 1);
        lastExtraTooltipCycleTimeAuto = CommonTime() + lastExtraTooltipCycleTimeAuto_ManualDelay;
    }
    let prevSpell = KinkyDungeonTargetingSpell;
    let prevInv = (KinkyDungeonShowInventory && !KinkyDungeonTargetingSpell);
    if (KDGameData.CurrentDialog) {
        let result = false;
        try {
            result = KDHandleDialogue();
        }
        finally {
            CharacterRefresh = _CharacterRefresh;
            CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
        }
        return result;
    }
    if (KinkyDungeonControlsEnabled() && KinkyDungeonHandleHUD()) {
        try {
            if (prevSpell) {
                if (prevInv)
                    KDCloseQuickInv();
                else {
                    KinkyDungeonTargetingSpell = null;
                    KinkyDungeonTargetingSpellItem = null;
                    KinkyDungeonTargetingSpellWeapon = null;
                }
            }
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
            KinkyDungeonGameKey.keyPressed = [
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
            ];
            if (KinkyDungeonAutoWaitSuppress)
                KinkyDungeonAutoWaitSuppress = false;
            else if (KDIsAutoAction()) {
                KDDisableAutoWait();
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Damage.ogg");
            }
        }
        finally {
            CharacterRefresh = _CharacterRefresh;
            CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
        }
        return;
    }
    else if (KDIsAutoAction() && MouseIn(canvasOffsetX, canvasOffsetY, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height)) {
        KDDisableAutoWait();
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Damage.ogg");
    }
    else if (KDFocusControls) {
        KDSetFocusControl("");
    }
    else if ((KinkyDungeonControlsEnabled() || KinkyDungeonInspect) && KinkyDungeonDrawState == "Game") {
        try {
            if (KinkyDungeonInspect) {
                KDInspectCamera.x = KinkyDungeonTargetX;
                KDInspectCamera.y = KinkyDungeonTargetY;
                KDInspectCamera.x = Math.max(-KinkyDungeonGridWidthDisplay, Math.min(KDInspectCamera.x, KDMapData.GridWidth));
                KDInspectCamera.y = Math.max(-KinkyDungeonGridHeightDisplay, Math.min(KDInspectCamera.y, KDMapData.GridHeight));
                KinkyDungeonLastMoveTimer = performance.now() + KinkyDungeonLastMoveTimerCooldown / 2;
                KDLastForceRefresh = CommonTime() - KDLastForceRefreshInterval - 10;
                KinkyDungeonUpdateLightGrid = true;
            }
            else if (KDInteracting) {
                KDSendInput("interact", { x: KinkyDungeonTargetX, y: KinkyDungeonTargetY });
            }
            else if (KDModalArea || KinkyDungeonTargetTile) {
                KDModalArea = false;
                KinkyDungeonTargetTile = null;
                KinkyDungeonTargetTileLocation = "";
            }
            else {
                KinkyDungeonSetMoveDirection();
                if (KinkyDungeonTargetingSpell) {
                    if (KDMouseInPlayableArea()) {
                        if (KinkyDungeonSpellValid) {
                            KDStartSpellcast(KinkyDungeonTargetX, KinkyDungeonTargetY, KinkyDungeonTargetingSpell, undefined, KinkyDungeonPlayerEntity, undefined, { targetingSpellItem: KinkyDungeonTargetingSpellItem, targetingSpellWeapon: KinkyDungeonTargetingSpellWeapon });
                            KinkyDungeonTargetingSpell = null;
                            KinkyDungeonTargetingSpellItem = null;
                            KinkyDungeonTargetingSpellWeapon = null;
                        }
                    }
                    else {
                        KinkyDungeonTargetingSpell = null;
                        KinkyDungeonTargetingSpellItem = null;
                        KinkyDungeonTargetingSpellWeapon = null;
                    }
                }
                else if (KinkyDungeonIsPlayer() && KDMouseInPlayableArea()) {
                    let fastMove = KinkyDungeonFastMove && !KinkyDungeonToggleAutoSprint;
                    if (fastMove && KDistChebyshev(KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x, KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y) > 0.5
                        && (KinkyDungeonVisionGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0
                            || KinkyDungeonFogGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0
                            || KDistChebyshev(KinkyDungeonPlayerEntity.x - KinkyDungeonTargetX, KinkyDungeonPlayerEntity.y - KinkyDungeonTargetY) < 1.5)) {
                        return !!KDFastMoveTo(KinkyDungeonTargetX, KinkyDungeonTargetY);
                    }
                    else if (!fastMove || Math.max(Math.abs(KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x), Math.abs(KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y)) <= 1) {
                        KDSetFocusControl("");
                        KDSendInput("move", { dir: KinkyDungeonMoveDirection, delta: 1, AllowInteract: true, AutoDoor: false, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint });
                    }
                }
            }
        }
        finally {
            CharacterRefresh = _CharacterRefresh;
            CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
        }
    }
    CharacterRefresh = _CharacterRefresh;
    CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
    return;
}
function KinkyDungeonGetMovable() {
    let MovableTiles = KDInteractableTiles;
    if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Squeeze") > 0)
        MovableTiles = MovableTiles + "b";
    return MovableTiles;
}
function KinkyDungeonListenKeyMove() {
    if ((document.activeElement && KDFocusableTextFields.includes(document.activeElement.id)))
        return true;
    if (KinkyDungeonLastMoveTimer < performance.now() && (KinkyDungeonControlsEnabled() || KinkyDungeonInspect)
        && KinkyDungeonDrawState == "Game" && !KDModalArea) {
        let moveDirection = null;
        let moveDirectionDiag = null;
        let MovableTiles = KinkyDungeonGetMovable();
        let itemsAtTile = (x, y) => {
            return KDMapData.GroundItems.some((item) => { return item.x == KinkyDungeonPlayerEntity.x + x && item.y == KinkyDungeonPlayerEntity.y + y; });
        };
        if ((KinkyDungeonGameKey.keyPressed[0]) && (KinkyDungeonInspect || itemsAtTile(0, -1) || MovableTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y - 1))))
            moveDirection = KinkyDungeonGetDirection(0, -1);
        else if ((KinkyDungeonGameKey.keyPressed[1]) && (KinkyDungeonInspect || itemsAtTile(0, +1) || MovableTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y + 1))))
            moveDirection = KinkyDungeonGetDirection(0, 1);
        else if ((KinkyDungeonGameKey.keyPressed[2]) && (KinkyDungeonInspect || itemsAtTile(-1, 0) || MovableTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x - 1, KinkyDungeonPlayerEntity.y))))
            moveDirection = KinkyDungeonGetDirection(-1, 0);
        else if ((KinkyDungeonGameKey.keyPressed[3]) && (KinkyDungeonInspect || itemsAtTile(+1, 0) || MovableTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x + 1, KinkyDungeonPlayerEntity.y))))
            moveDirection = KinkyDungeonGetDirection(1, 0);
        if ((KinkyDungeonGameKey.keyPressed[4]) || (KinkyDungeonGameKey.keyPressed[2] && KinkyDungeonGameKey.keyPressed[0]))
            moveDirectionDiag = KinkyDungeonGetDirection(-1, -1);
        else if ((KinkyDungeonGameKey.keyPressed[5]) || (KinkyDungeonGameKey.keyPressed[3] && KinkyDungeonGameKey.keyPressed[0]))
            moveDirectionDiag = KinkyDungeonGetDirection(1, -1);
        else if ((KinkyDungeonGameKey.keyPressed[6]) || (KinkyDungeonGameKey.keyPressed[2] && KinkyDungeonGameKey.keyPressed[1]))
            moveDirectionDiag = KinkyDungeonGetDirection(-1, 1);
        else if ((KinkyDungeonGameKey.keyPressed[7]) || (KinkyDungeonGameKey.keyPressed[3] && KinkyDungeonGameKey.keyPressed[1]))
            moveDirectionDiag = KinkyDungeonGetDirection(1, 1);
        if ((KinkyDungeonGameKey.keyPressed[8])) {
            moveDirection = KinkyDungeonGetDirection(0, 0);
            moveDirectionDiag = null;
        }
        if (moveDirectionDiag && (KinkyDungeonInspect || itemsAtTile(moveDirectionDiag.x, moveDirectionDiag.y) || MovableTiles.includes(KinkyDungeonMapGet(moveDirectionDiag.x + KinkyDungeonPlayerEntity.x, moveDirectionDiag.y + KinkyDungeonPlayerEntity.y)))) {
            moveDirection = moveDirectionDiag;
        }
        if (moveDirection) {
            if (KinkyDungeonLastMoveTimerStart < performance.now() && KinkyDungeonLastMoveTimerStart > 0) {
                if (KinkyDungeonInspect) {
                    KDInspectCamera.x += moveDirection.x;
                    KDInspectCamera.y += moveDirection.y;
                    KDInspectCamera.x = Math.max(-KinkyDungeonGridWidthDisplay, Math.min(KDInspectCamera.x, KDMapData.GridWidth));
                    KDInspectCamera.y = Math.max(-KinkyDungeonGridHeightDisplay, Math.min(KDInspectCamera.y, KDMapData.GridHeight));
                    KinkyDungeonLastMoveTimer = performance.now() + KinkyDungeonLastMoveTimerCooldown / 2;
                    KDLastForceRefresh = CommonTime() - KDLastForceRefreshInterval - 10;
                    KinkyDungeonUpdateLightGrid = true;
                }
                else if (KDInteracting) {
                    KDSendInput("interact", { x: KDPlayer().x + moveDirection.x, y: KDPlayer().y + moveDirection.y });
                }
                else {
                    let _CharacterRefresh = CharacterRefresh;
                    let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
                    CharacterRefresh = () => { KDRefresh = true; };
                    CharacterAppearanceBuildCanvas = () => { };
                    try {
                        KDSetFocusControl("");
                        KDSendInput("move", { dir: moveDirection, delta: 1, AllowInteract: KinkyDungeonLastMoveTimer == 0, AutoDoor: false, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: false });
                        KinkyDungeonLastMoveTimer = performance.now() + KinkyDungeonLastMoveTimerCooldown;
                    }
                    finally {
                        CharacterRefresh = _CharacterRefresh;
                        CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
                    }
                }
            }
            else if (KinkyDungeonLastMoveTimerStart == 0) {
                KinkyDungeonLastMoveTimerStart = performance.now() + KinkyDungeonLastMoveTimerCooldownStart;
            }
        }
    }
    if (KinkyDungeonLastMoveTimerStart < performance.now() && KinkyDungeonLastMoveTimer == 0)
        KinkyDungeonLastMoveTimerStart = 0;
    if (!KinkyDungeonGameKey.keyPressed.some((element) => { return element; })) {
        KinkyDungeonLastMoveTimer = 0;
    }
}
let KDShopBuyConfirm = false;
function KDEnter() {
    if (KDRenameNPC) {
        KDRenameNPC = false;
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "LockLight" + ".ogg");
    }
}
function KDCheckCustomKeypress() {
    for (let b of Object.entries(KDButtonsCache)) {
        if (b[1].hotkeyPress == KinkyDungeonKeybindingCurrentKey) {
            if (KDClickButton(b[0], "hotkey", KinkyDungeonKeybindingCurrentKey)) {
                if (KinkyDungeonKeybindingCurrentKey == KinkyDungeonKeySkip[0]) {
                    KinkyDungeonGameKey.keyPressed[9] = false;
                }
                return true;
            }
        }
    }
    for (let keybinding of Object.values(KDKeyCheckers)) {
        if (keybinding())
            return true;
    }
    return false;
}
function KinkyDungeonGameKeyDown() {
    let moveDirection = null;
    if (KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey
        && document.activeElement && KDFocusableTextFields.includes(document.activeElement.id)) {
        document.activeElement.blur();
        KDEnter();
    }
    if ((document.activeElement && KDFocusableTextFields.includes(document.activeElement.id)))
        return true;
    if (KDCheckCustomKeypress())
        return true;
    KDShopBuyConfirm = false;
    if (KinkyDungeonState == "TileEditor") {
        if (KinkyDungeonKey[0] == KinkyDungeonKeybindingCurrentKey) {
            KDClickButton("maptileU");
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
            return true;
        }
        else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey) {
            KDClickButton("maptileL");
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
            return true;
        }
        else if (KinkyDungeonKey[2] == KinkyDungeonKeybindingCurrentKey) {
            KDClickButton("maptileD");
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
            return true;
        }
        else if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
            KDClickButton("maptileR");
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
            return true;
        }
    }
    if (KDGameData.CurrentDialog)
        return;
    if (!KinkyDungeonControlsEnabled())
        return;
    if (KDCustomKeyDown.some((c) => { return c(KinkyDungeonKeybindingCurrentKey); }))
        return true;
    else if (moveDirection && KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game") {
        KDSendInput("move", { dir: moveDirection, delta: 1, AutoDoor: false, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: false });
        return true;
    }
    else if (KinkyDungeonKeySpell.includes(KinkyDungeonKeybindingCurrentKey)) {
        if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Magic") {
            if (KinkyDungeonSpellChoices.includes(KinkyDungeonCurrentPage)) {
                KDSendInput("spellRemove", { I: KinkyDungeonSpellChoices.indexOf(KinkyDungeonCurrentPage) });
            }
            KinkyDungeonClickSpellChoice(KinkyDungeonKeySpell.indexOf(KinkyDungeonKeybindingCurrentKey), KinkyDungeonCurrentPage);
        }
        else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game") {
            KinkyDungeonSpellPress = KinkyDungeonKeybindingCurrentKey;
            KinkyDungeonHandleSpell();
        }
        return true;
    }
    else if (KinkyDungeonKeyTab.includes(KinkyDungeonKeybindingCurrentKey)) {
        if (KinkyDungeonState == "Game") {
            let index = 1 + KinkyDungeonKeyTab.indexOf(KinkyDungeonKeybindingCurrentKey);
            if (localStorage.getItem('KinkyDungeonSpellsChoice' + String(index))) {
                KinkyDungeonSpellsConfig = String(index);
                KinkyDungeonLoadSpellsConfig();
            }
        }
    }
    else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonKeyWeapon.includes(KinkyDungeonKeybindingCurrentKey)) {
        KinkyDungeonSpellPress = KinkyDungeonKeybindingCurrentKey;
        KinkyDungeonRangedAttack();
        return true;
    }
    else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game"
        && KinkyDungeonKeyUpcast.includes(KinkyDungeonKeybindingCurrentKey)) {
        if (KinkyDungeonKeybindingCurrentKey == KinkyDungeonKeyUpcast[0]) {
            KDSendInput("upcast", {});
        }
        else {
            KDSendInput("upcastcancel", {});
        }
        return true;
    }
    else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonKeySprint.includes(KinkyDungeonKeybindingCurrentKey)) {
        KinkyDungeonToggleAutoSprint = !KinkyDungeonToggleAutoSprint;
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
        return true;
    }
    else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonKeySwitchWeapon.includes(KinkyDungeonKeybindingCurrentKey)) {
        KDSwitchWeapon();
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
        return true;
    }
    else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonKeySwitchLoadout.includes(KinkyDungeonKeybindingCurrentKey)) {
        let i = 1 + KinkyDungeonKeySwitchLoadout.indexOf(KinkyDungeonKeybindingCurrentKey);
        KDGameData.CurrentLoadout = i;
        KDLoadQuickLoadout(i, true);
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
        return true;
    }
    else if (KinkyDungeonState == "Stats") {
        if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
            KDClickButton("perks>");
        }
        else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey) {
            KDClickButton("perks<");
        }
    }
    else if (KinkyDungeonDrawState != "Restart" && KinkyDungeonDrawState != "Keybindings" && KinkyDungeonDrawState != "Perks2") {
        if (KinkyDungeonDrawState == "Inventory" && (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKeySkip[0] == KinkyDungeonKeybindingCurrentKey)) {
            if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
                KinkyDungeonCurrentPageInventory += 1;
            }
            else if (KinkyDungeonCurrentPageInventory > 0) {
                KinkyDungeonCurrentPageInventory -= 1;
            }
            else if (KinkyDungeonKeySkip[0] == KinkyDungeonKeybindingCurrentKey) {
                KinkyDungeonDrawState = "Game";
                KDResetAlternateInventoryRender();
                KDRefreshCharacter.set(KinkyDungeonPlayer, true);
                KinkyDungeonDressPlayer();
            }
        }
        else if (KinkyDungeonDrawState == "Magic" && (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey)) {
            if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
                KinkyDungeonCurrentPage += 1;
                if (KinkyDungeonCurrentPage >= KinkyDungeonSpells.length) {
                    KinkyDungeonCurrentPage = 0;
                }
            }
            else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey && KinkyDungeonCurrentPage >= 0) {
                KinkyDungeonCurrentPage -= 1;
                if (KinkyDungeonCurrentPage < 0) {
                    KinkyDungeonCurrentPage = KinkyDungeonSpells.length - 1;
                }
            }
            else if (KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey) {
                if (KinkyDungeonPreviewSpell) {
                    if (KinkyDungeonPreviewSpell.hideLearned)
                        KinkyDungeonDrawState = "MagicSpells";
                    KDSendInput("spellLearn", { SpellName: KinkyDungeonPreviewSpell.name });
                }
                else
                    KinkyDungeonDrawState = "MagicSpells";
            }
        }
        else if ((KinkyDungeonDrawState == "Collection" || KinkyDungeonDrawState == "Bondage")
            && (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey)) {
            if (!KDGameData.CollectionSorted) {
                KDSortCollection();
            }
            let index = KDGameData.CollectionSorted.findIndex((entry) => { return entry.id == (KDCollectionSelected || -1); });
            if (index > -1) {
                if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
                    index += 1;
                    if (index >= KDGameData.CollectionSorted.length) {
                        index = 0;
                    }
                }
                else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey && KinkyDungeonCurrentPage >= 0) {
                    index -= 1;
                    if (index < 0) {
                        index = KDGameData.CollectionSorted.length - 1;
                    }
                }
                if (index > -1 && KDGameData.CollectionSorted[index]) {
                    KDCollectionSelected = KDGameData.CollectionSorted[index].id;
                    KDResetCollectionUI();
                    index = KDGameData.CollectionSorted.findIndex((entry) => { return entry.id == (KDCollectionSelected || -1); });
                    while (index >= KDCollectionIndex + KDCollectionColumns * KDCollectionRows) {
                        KDCollectionIndex += KDCollectionColumns;
                    }
                    while (index < KDCollectionIndex) {
                        KDCollectionIndex -= KDCollectionColumns;
                    }
                }
            }
        }
        else if (KinkyDungeonDrawState == "MagicSpells"
            && (KinkyDungeonKey[0] == KinkyDungeonKeybindingCurrentKey
                || KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey
                || KinkyDungeonKey[2] == KinkyDungeonKeybindingCurrentKey
                || KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey
                || KinkyDungeonKeySkip[0] == KinkyDungeonKeybindingCurrentKey)) {
            if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
                KinkyDungeonCurrentSpellsPage += 1;
                if (KinkyDungeonCurrentSpellsPage >= KinkyDungeonLearnableSpells.length)
                    KinkyDungeonCurrentSpellsPage = 0;
            }
            else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey && KinkyDungeonCurrentSpellsPage >= 0) {
                KinkyDungeonCurrentSpellsPage -= 1;
                if (KinkyDungeonCurrentSpellsPage < 0)
                    KinkyDungeonCurrentSpellsPage = KinkyDungeonLearnableSpells.length - 1;
            }
            else if (KinkyDungeonKey[0] == KinkyDungeonKeybindingCurrentKey) {
                KDClickButton("spellsUp");
            }
            else if (KinkyDungeonKey[2] == KinkyDungeonKeybindingCurrentKey) {
                KDClickButton("spellsDown");
            }
            else if (KinkyDungeonKeySkip[0] == KinkyDungeonKeybindingCurrentKey) {
                KinkyDungeonDrawState = "Game";
                KDResetAlternateInventoryRender();
                KDRefreshCharacter.set(KinkyDungeonPlayer, true);
                KinkyDungeonDressPlayer();
            }
        }
        else if (KinkyDungeonKeyMenu.includes(KinkyDungeonKeybindingCurrentKey)) {
            switch (KinkyDungeonKeybindingCurrentKey) {
                case KinkyDungeonKeyMenu[0]:
                    KinkyDungeonShowInventory = !KinkyDungeonShowInventory;
                    break;
                case KinkyDungeonKeyMenu[1]:
                    KinkyDungeonDrawState = KinkyDungeonDrawState == "Inventory" ? "Game" : "Inventory";
                    break;
                case KinkyDungeonKeyMenu[2]:
                    KinkyDungeonDrawState = KinkyDungeonDrawState == "MagicSpells" ? "Game" : "MagicSpells";
                    break;
                case KinkyDungeonKeyMenu[3]:
                    KinkyDungeonDrawState = KinkyDungeonDrawState == "Logbook" ? "Game" : "Logbook";
                    break;
                case KinkyDungeonKeyMenu[5]:
                    KinkyDungeonDrawState = (KinkyDungeonDrawState == "Collection" || KinkyDungeonDrawState == "Bondage") ? "Game" : "Collection";
                    break;
                case KinkyDungeonKeyMenu[4]: {
                    KinkyDungeonDrawState = "Restart";
                    KDConfirmDeleteSave = false;
                    KinkyDungeonReplaceColorConfirm = -999;
                    if (KDDebugMode) {
                        ElementCreateTextArea("DebugEnemy");
                        ElementValue("DebugEnemy", "Maidforce");
                        ElementCreateTextArea("DebugItem");
                        ElementValue("DebugItem", "TrapArmbinder");
                    }
                    else {
                        if (document.getElementById("DebugEnemy")) {
                            ElementRemove("DebugEnemy");
                        }
                        if (document.getElementById("DebugItem")) {
                            ElementRemove("DebugItem");
                        }
                    }
                    break;
                }
            }
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
            return true;
        }
    }
    else if (KinkyDungeonDrawState == "Restart"
        && !((CommonIsMobile || document.activeElement?.type == "text" || document.activeElement?.type == "textarea"))) {
        if (KinkyDungeonKeyMenu.includes(KinkyDungeonKeybindingCurrentKey)) {
            KDResetAlternateInventoryRender();
            switch (KinkyDungeonKeybindingCurrentKey) {
                case KinkyDungeonKeyMenu[0]:
                    KinkyDungeonShowInventory = !KinkyDungeonShowInventory;
                    break;
                case KinkyDungeonKeyMenu[1]:
                    KDShowInventory(null);
                    break;
                case KinkyDungeonKeyMenu[2]:
                    KinkyDungeonDrawState = "MagicSpells";
                    break;
                case KinkyDungeonKeyMenu[3]:
                    KinkyDungeonDrawState = "Logbook";
                    break;
                case KinkyDungeonKeyMenu[5]:
                    KinkyDungeonDrawState = "Collection";
                    break;
                case KinkyDungeonKeySkip[0]:
                case KinkyDungeonKeyMenu[4]:
                    KinkyDungeonDrawState = "Game";
                    break;
            }
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
            return true;
        }
    }
    KinkyDungeonKeybindingCurrentKey = '';
    return false;
}
function KinkyDungeonGameKeyUp(lastPress) {
    let delta = CommonTime() - lastPress;
    if ((document.activeElement && KDFocusableTextFields.includes(document.activeElement.id)))
        return true;
    if (delta > 60000)
        return;
    if (delta < 250 && !(KDToggles.ShiftLatch && !KinkyDungeonKeybindingCurrentKey.includes("Shift") && KinkyDungeonKeybindingCurrentKeyRelease.includes("Shift")))
        return;
    if (KDCustomKeyUp.some((c) => { return c(KinkyDungeonKeybindingCurrentKey); }))
        return true;
    else if (KinkyDungeonState == "Game") {
        if (document.activeElement) {
            if (KinkyDungeonKeySpell.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
                if (KinkyDungeonDrawState == "Game") {
                    KinkyDungeonTargetingSpell = null;
                    KinkyDungeonTargetingSpellItem = null;
                    KinkyDungeonTargetingSpellWeapon = null;
                }
                return true;
            }
            else if (KinkyDungeonDrawState == "Game" && KinkyDungeonKeyWeapon.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
                KinkyDungeonTargetingSpell = null;
                return true;
            }
            else if (KinkyDungeonDrawState == "Game" && KinkyDungeonKeySprint.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
                KinkyDungeonToggleAutoSprint = !KinkyDungeonToggleAutoSprint;
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
                return true;
            }
            else if (KinkyDungeonDrawState == "Game" && KinkyDungeonKeySwitchWeapon.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
                KDSwitchWeapon();
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
                return true;
            }
        }
        if (KinkyDungeonKeyMenu.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
            switch (KinkyDungeonKeybindingCurrentKeyRelease) {
                case KinkyDungeonKeyMenu[0]:
                    if (KinkyDungeonDrawState == 'Game')
                        KinkyDungeonShowInventory = !KinkyDungeonShowInventory;
                    break;
                case KinkyDungeonKeyMenu[1]:
                    KinkyDungeonDrawState = KinkyDungeonDrawState == "Inventory" ? "Game" : "Inventory";
                    break;
                case KinkyDungeonKeyMenu[2]:
                    KinkyDungeonDrawState = KinkyDungeonDrawState == "MagicSpells" ? "Game" : "MagicSpells";
                    break;
                case KinkyDungeonKeyMenu[3]:
                    KinkyDungeonDrawState = KinkyDungeonDrawState == "Logbook" ? "Game" : "Logbook";
                    break;
            }
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
            return true;
        }
        else if (KinkyDungeonKeyToggle.includes(KinkyDungeonKeybindingCurrentKeyRelease) && KinkyDungeonDrawState == 'Game') {
            switch (KinkyDungeonKeybindingCurrentKeyRelease) {
                case KinkyDungeonKeyToggle[1]:
                    KinkyDungeonToggleAutoPass = !KinkyDungeonToggleAutoPass;
                    break;
                case KinkyDungeonKeyToggle[2]:
                    KDInteracting = !KDInteracting;
                    break;
                case KinkyDungeonKeyToggle[3]:
                    KDAutoStruggleClick();
                    break;
                case KinkyDungeonKeyToggle[4]:
                    KinkyDungeonFastMove = !KinkyDungeonFastMove;
                    break;
                case KinkyDungeonKeyToggle[5]:
                    KinkyDungeonInspect = !KinkyDungeonInspect;
                    KinkyDungeonUpdateLightGrid = true;
                    break;
                case KinkyDungeonKeyToggle[10]:
                    KDBulletTransparency = !KDBulletTransparency;
                    break;
                case KinkyDungeonKeyToggle[12]:
                    KDStatusToggle = !KDStatusToggle;
                    break;
            }
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
            return true;
        }
    }
    KinkyDungeonKeybindingCurrentKey = '';
    return false;
}
function KinkyDungeonSendTextMessage(priority, text, color, time, noPush, noDupe, entity, filter = "Self") {
    if (entity && KinkyDungeonVisionGet(entity.x, entity.y) < 1)
        return false;
    if (text) {
        if (!noPush)
            if (!noDupe || KinkyDungeonMessageLog.length == 0 || !KinkyDungeonMessageLog[KinkyDungeonMessageLog.length - 1] || text != KinkyDungeonMessageLog[KinkyDungeonMessageLog.length - 1].text) {
                if (KDLogIndex > 0)
                    KDLogIndex += 1;
                KinkyDungeonMessageLog.push({ text: text, color: color, time: KinkyDungeonCurrentTick, filter: filter });
            }
        if (priority >= KinkyDungeonTextMessagePriority || KinkyDungeonActionMessageTime < 0.5) {
            KinkyDungeonTextMessageTime = time;
            KinkyDungeonTextMessage = text;
            KinkyDungeonTextMessageColor = color;
            KinkyDungeonTextMessagePriority = priority;
            KinkyDungeonTextMessageNoPush = noPush;
            return true;
        }
    }
    return false;
}
function KinkyDungeonSendActionMessage(priority, text, color, time, noPush, noDupe, entity, filter = "Action", antifilter) {
    if (entity && KinkyDungeonVisionGet(entity.x, entity.y) < 1)
        return false;
    if (text) {
        if (!noPush)
            if (!noDupe || KinkyDungeonMessageLog.length == 0 || !KinkyDungeonMessageLog[KinkyDungeonMessageLog.length - 1] || text != KinkyDungeonMessageLog[KinkyDungeonMessageLog.length - 1].text) {
                if (KDLogIndex > 0)
                    KDLogIndex += 1;
                KinkyDungeonMessageLog.push({ text: text, color: color, time: KinkyDungeonCurrentTick, filter: filter, antifilter: antifilter });
            }
        if (priority >= KinkyDungeonActionMessagePriority || KinkyDungeonActionMessageTime < 0.5) {
            KinkyDungeonActionMessageTime = time;
            KinkyDungeonActionMessage = text;
            KinkyDungeonActionMessageColor = color;
            KinkyDungeonActionMessagePriority = priority;
            KinkyDungeonActionMessageNoPush = noPush;
            return true;
        }
    }
    return false;
}
let KinkyDungeonNoMoveFlag = false;
function KDAttackCost(weapon, noEvent) {
    let data = {
        attackCost: KinkyDungeonStatStaminaCostAttack,
        stamPenType: KDWeaponStamPenType(KinkyDungeonPlayerDamage),
        orig: KinkyDungeonStatStaminaCostAttack,
        bonus: KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackStaminaBonus"),
        mult: KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackStamina")),
    };
    if (!weapon)
        weapon = KinkyDungeonPlayerDamage;
    if (weapon && weapon.staminacost)
        data.attackCost = -weapon.staminacost;
    if (!noEvent) {
        if (KDSTAMPENTYPE[data.stamPenType]?.onAttack) {
            KDSTAMPENTYPE[data.stamPenType].onAttack(data);
        }
        KinkyDungeonSendEvent("attackCost", data);
    }
    data.attackCost = Math.min(0, (data.attackCost + data.bonus) * data.mult);
    return data;
}
function KDShouldCapture(Enemy) {
    return Enemy && KDHelpless(Enemy) && Enemy.hp < 0.52;
}
function KDShouldTease(Enemy) {
    return !KDHostile(Enemy) && KDCanDom(Enemy) && Enemy.hp > 0.51
        && !KDEntityHasFlag(Enemy, "stopplay");
}
function KinkyDungeonLaunchAttack(Enemy, skip) {
    let ac = KDAttackCost();
    let attackCost = ac.attackCost;
    let capture = false;
    let result = "fail";
    if (!Enemy.Enemy)
        return result;
    if (Enemy) {
        KDTurnToFace(Enemy.x - KinkyDungeonPlayerEntity.x, Enemy.y - KinkyDungeonPlayerEntity.y);
    }
    let teasesub = KDShouldTease(Enemy);
    if (!teasesub && KDShouldCapture(Enemy)) {
        attackCost = 0;
        capture = true;
    }
    let noadvance = false;
    let talk = KDTalkToEnemy(Enemy);
    if (KinkyDungeonHasStamina(Math.abs(attackCost), true) || talk) {
        if (talk) {
            let d = (Enemy.Enemy.specialdialogue
                && (!KDSpecialDialogueCondition[Enemy.Enemy.specialdialogue]
                    || KDSpecialDialogueCondition[Enemy.Enemy.specialdialogue](Enemy, KDPlayer()))) ? Enemy.Enemy.specialdialogue : "GenericAlly";
            if ((!Enemy.specialdialogue && !Enemy.prisondialogue) && KDIsImprisoned(Enemy))
                d = "PrisonerJailBug";
            else if (Enemy.prisondialogue && KDIsImprisoned(Enemy))
                d = Enemy.prisondialogue;
            else if (Enemy.specialdialogue && (!KDSpecialDialogueCondition[Enemy.specialdialogue]
                || KDSpecialDialogueCondition[Enemy.specialdialogue](Enemy, KDPlayer())))
                d = Enemy.specialdialogue;
            if (d || ((!Enemy.lifetime || Enemy.lifetime > 9000) && !Enemy.Enemy.tags.notalk)) {
                KDStartDialog(d, Enemy.Enemy.name, true, Enemy.personality, Enemy);
                noadvance = true;
                result = "dialogue";
            }
            else {
                KinkyDungeonSendActionMessage(10, TextGet("KDGameData.ConfirmAttack"), KDBaseRed, 1);
                KDGameData.ConfirmAttack = true;
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/ClickError.ogg");
                noadvance = true;
                result = "confirm";
            }
        }
        else {
            if (!capture) {
                let res = KDDoAttack(Enemy, teasesub, attackCost, skip);
                if (res.result)
                    result = res.result;
                skip = res.skip;
            }
            else {
                KDDoCapture(Enemy, attackCost, noadvance, skip);
                result = "capture";
            }
            KinkyDungeonLastAction = "Attack";
            KDPauseBalance(5);
            KDGameData.ConfirmAttack = false;
        }
    }
    else {
        KinkyDungeonWaitMessage(false, 1);
    }
    if (!noadvance) {
        KinkyDungeonInterruptSleep();
        if (!skip)
            KinkyDungeonAdvanceTime(1);
    }
    return result;
}
function KDDoAttack(Enemy, teasesub, attackCost, skip) {
    let result = "";
    let damageInfo = {
        name: KinkyDungeonPlayerDamage.name,
        damage: KinkyDungeonPlayerDamage.damage,
        type: KinkyDungeonPlayerDamage.type,
        distract: KinkyDungeonPlayerDamage.distract,
        distractEff: KinkyDungeonPlayerDamage.distractEff,
        desireMult: KinkyDungeonPlayerDamage.desireMult,
        bind: KinkyDungeonPlayerDamage.bind,
        bindType: KinkyDungeonPlayerDamage.bindType,
        bindEff: KinkyDungeonPlayerDamage.bindEff,
        nodisarm: KinkyDungeonPlayerDamage.nodisarm,
        nocrit: KinkyDungeonPlayerDamage.nocrit,
        noblock: KinkyDungeonPlayerDamage.noblock,
        nokill: KinkyDungeonPlayerDamage.nokill,
        evadeable: false,
        addBind: KinkyDungeonPlayerDamage.addBind,
        bindcrit: KinkyDungeonPlayerDamage.bindcrit,
        crit: KinkyDungeonPlayerDamage.crit,
        sfx: KinkyDungeonPlayerDamage.sfx,
        time: KinkyDungeonPlayerDamage.time,
        ignoreshield: KinkyDungeonPlayerDamage.ignoreshield,
        shield_crit: KinkyDungeonPlayerDamage.shield_crit,
        shield_stun: KinkyDungeonPlayerDamage.shield_stun,
        shield_freeze: KinkyDungeonPlayerDamage.shield_freeze,
        shield_bind: KinkyDungeonPlayerDamage.shield_bind,
        shield_snare: KinkyDungeonPlayerDamage.shield_snare,
        shield_slow: KinkyDungeonPlayerDamage.shield_slow,
        shield_distract: KinkyDungeonPlayerDamage.shield_distract,
        shield_vuln: KinkyDungeonPlayerDamage.shield_vuln,
        boundBonus: KinkyDungeonPlayerDamage.boundBonus,
        novulnerable: KinkyDungeonPlayerDamage.novulnerable,
        tease: KinkyDungeonPlayerDamage.tease
    };
    if (KinkyDungeonPlayerDamage.stam50mult && KinkyDungeonStatStamina / KinkyDungeonStatStaminaMax >= 0.50) {
        damageInfo.damage *= KinkyDungeonPlayerDamage.stam50mult;
    }
    let data = {
        orighp: Enemy.hp,
        origbinding: Enemy.boundLevel,
        target: Enemy,
        enemy: Enemy,
        attackCost: attackCost,
        attackCostOrig: KinkyDungeonPlayerDamage.staminacost ? -KinkyDungeonPlayerDamage.staminacost : 0,
        skipTurn: false,
        attackData: damageInfo,
        missMsg: "KDAttackMiss",
        atkMsg: "",
    };
    if (!KinkyDungeonPlayerDamage.noHands) {
        let nearby = KDNearbyEnemies(KDPlayer().x, KDPlayer().y, 10, undefined, true)
            .filter((en) => {
            return !!en.aware ||
                (!KinkyDungeonPlayerDamage.silent && KDCanHearSound(en, 8, KDPlayer().x, KDPlayer().y));
        });
        let f = "";
        let c = "Arms";
        for (let en of nearby) {
            f = "saw_" + c;
            if (!en.flags || !en.flags[f])
                KDSetIDFlag(en.id, f, -1);
            if (!KDGameData.SawFlags)
                KDGameData.SawFlags = {};
            let faction = KDGetFaction(en);
            if (!KDGameData.SawFlags[faction])
                KDGameData.SawFlags[faction] = {};
            KDGameData.SawFlags[faction][c] = (KDGameData.SawFlags[faction][c] || 0) + 1;
        }
    }
    KinkyDungeonSendEvent("beforePlayerLaunchAttack", data);
    if (attackCost < 0 && KinkyDungeonStatsChoice.has("BerserkerRage")) {
        KDChangeDistraction("BerserkerRage", "perk", "attack", 0.7 - 0.5 * data.attackCost, false, 0.33);
    }
    if (KDGameData.HeelPowerEffective > 0)
        KDChangeBalanceSrc("heels", "debuff", "attack", data.attackCost * KDGetBalanceCost("attack") * (0.75 + 0.5 * KDRandom()) * KDBalanceAttackMult * 10 * KDFitnessMult(), true, true, 1);
    let origHP = Enemy.hp;
    if (KinkyDungeonAttackEnemy(data.target, data.attackData, undefined, undefined, KinkyDungeonPlayerDamage)) {
        result = "hit";
    }
    else {
        result = "miss";
    }
    if (teasesub && origHP > 0.5) {
        Enemy.hp = Math.max(0.51, Enemy.hp);
        KinkyDungeonSetEnemyFlag(Enemy, "stopplay", 4);
        KDAddThought(Enemy.id, "PlayDone", 10, 8);
        Enemy.playWithPlayer = Math.min(Enemy.playWithPlayer || 0, 1);
        KDSetPlayCD(Enemy, 1.5, 3);
    }
    let dmgTotal = -(Enemy.hp - data.orighp);
    let bondageTotal = (Enemy.boundLevel - data.origbinding);
    if (dmgTotal > 0) {
        let atk = bondageTotal > 0 ? "KDAttackBind" : "KDAttack";
        KinkyDungeonSendActionMessage(3.5, TextGet(data.atkMsg || atk)
            .replace("TargetEnemy", TextGet("Name" + Enemy.Enemy.name))
            .replace("DamageDealt", "" + Math.round(dmgTotal * 10))
            .replace("BondageDealt", "" + Math.round(bondageTotal * 10)), KDBaseWhite, 2, undefined, undefined, undefined, "TotalDamage");
    }
    else {
        KinkyDungeonSendActionMessage(3.5, TextGet(data.missMsg).replace("TargetEnemy", TextGet("Name" + Enemy.Enemy.name)).replace("DamageDealt", "" + Math.round(dmgTotal * 10)), KDBaseWhite, 2, undefined, undefined, undefined, "Action", "Combat");
    }
    if (data.skipTurn)
        skip = 1;
    KDChangeStamina("attack", "weapon", "attack", data.attackCost, false, 1);
    KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "attack", 1);
    if (!KinkyDungeonPlayerDamage.noHands) {
        KinkyDungeonSetFlag("armattack", 1);
        let nearby = KDNearbyEnemies(KDPlayer().x, KDPlayer().y, 10, undefined, true)
            .filter((en) => { return !!en.aware; });
        let f = "";
        for (let en of nearby) {
            f = "saw_Arms";
            if (!en.flags || !en.flags[f])
                KDSetIDFlag(en.id, f, -1);
        }
    }
    KinkyDungeonSetEnemyFlag(data.target, "targetedForAttack", 4);
    return { result: result, skip: skip };
}
function KDDoCapture(Enemy, attackCost, noadvance, skip) {
    if ((Enemy.lifetime > 9000 || !Enemy.maxlifetime))
        KinkyDungeonAggro(Enemy, undefined, KinkyDungeonPlayerEntity);
    Enemy.hp = 0;
    KinkyDungeonKilledEnemy = Enemy;
    KDGameData.Guilt = Math.max(0, (KDGameData.Guilt || 0) + KDEnemyRank(Enemy));
    KinkyDungeonSendEvent("capture", { enemy: Enemy, attacker: KinkyDungeonPlayerEntity, skip: skip });
    if (!KDIDHasFlag(Enemy.id, "capOpPen")) {
        KDSetIDFlag(Enemy.id, "capOpPen", -1);
        KDAddOpinionPersistent(Enemy.id, -50);
    }
    KDChangeStamina("capture", "capture", "attack", attackCost, false, 1);
    KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "capture", 1);
    if (KDGameData.Collection[Enemy.id + ""]) {
        KDGameData.Collection[Enemy.id + ""].status = "";
        KDSortCollection();
    }
    let sfx = Enemy.Enemy?.captureSound || "LockHeavyOther";
    if (KDSoundEnabled())
        AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
    KDFreeNPC(Enemy);
    Enemy.hp = 0;
    KDSetToExpectedBondage(Enemy, 0);
    KinkyDungeonSetEnemyFlag(Enemy, "cap", noadvance ? 1 : 2);
    if (KDDoCollect(Enemy)) {
        KDAddCollection(Enemy);
    }
    else {
        KDFreeNPCRestraints(Enemy.id, KDPlayer().id);
        KDReleasePenaltyEntity(Enemy, KDPlayer().id);
        KinkyDungeonSendTextMessage(10, TextGet("KDAutoReleased_NonNotable")
            .replace("NME", KDGetEnemyTypeName(Enemy)), KDBaseWhite, 4);
    }
    if (KDIsNPCPersistent(Enemy.id)) {
        KDGetPersistentNPC(Enemy.id).collect = true;
        KDTPToSummit(Enemy.id);
        KDGetPersistentNPC(Enemy.id).captured = false;
        KDUpdatePersistentNPC(Enemy.id);
    }
}
function KDPlayerCanMove(player, x, y) {
    return KinkyDungeonGetMovable().includes(KinkyDungeonMapGet(x, y));
}
function KinkyDungeonMove(moveDirection, delta, AllowInteract, SuppressSprint, forceSprint) {
    let moveX = moveDirection.x + KinkyDungeonPlayerEntity.x;
    let moveY = moveDirection.y + KinkyDungeonPlayerEntity.y;
    let moved = false;
    let Enemy = KinkyDungeonEnemyAt(moveX, moveY);
    let passThroughSprint = false;
    let nextPosX = moveX * 2 - KinkyDungeonPlayerEntity.x;
    let nextPosY = moveY * 2 - KinkyDungeonPlayerEntity.y;
    let nextTile = KinkyDungeonMapGet(nextPosX, nextPosY);
    if (forceSprint)
        SuppressSprint = false;
    if (KinkyDungeonMovableTilesEnemy.includes(nextTile)
        && KinkyDungeonNoEnemy(nextPosX, nextPosY) && (forceSprint || KinkyDungeonToggleAutoSprint)) {
        let data = {
            canSprint: KDCanSprint(),
            passThru: false,
            nextPosx: moveX,
            nextPosy: moveY,
        };
        KinkyDungeonSendEvent("canSprint", data);
        if (data.canSprint && data.passThru && !SuppressSprint) {
            passThroughSprint = true;
        }
    }
    let allowPass = Enemy
        && KDCanPassEnemy(KinkyDungeonPlayerEntity, Enemy);
    if (Enemy && KDEnemyHasFlag(Enemy, "forcetalk") && KinkyDungeonFastMove) {
        allowPass = false;
        KinkyDungeonSetEnemyFlag(Enemy, "forcetalk", 0);
    }
    if (Enemy && !allowPass && !passThroughSprint) {
        if (AllowInteract) {
            KDDelayedActionPrune(["Action", "Attack"]);
            KinkyDungeonInterruptSleep();
            KinkyDungeonLaunchAttack(Enemy);
            KinkyDungeonFastMovePath = [];
        }
    }
    else {
        let MovableTiles = KinkyDungeonGetMovable();
        let moveObject = KinkyDungeonMapGet(moveX, moveY);
        if (MovableTiles.includes(moveObject) && (passThroughSprint || KinkyDungeonNoEnemy(moveX, moveY) || (Enemy && KDAllied(Enemy)) || allowPass)) {
            KDGameData.ConfirmAttack = false;
            let quick = false;
            if (KinkyDungeonTilesGet("" + moveX + "," + moveY)
                && KinkyDungeonTilesGet("" + moveX + "," + moveY).Type
                && (((KDObjectDraw[KinkyDungeonTilesGet("" + moveX + "," + moveY).Type]
                    || KDObjectClick[KinkyDungeonTilesGet("" + moveX + "," + moveY).Type])
                    && (KinkyDungeonTilesGet("" + moveX + "," + moveY).Type != "Door"
                        || (KinkyDungeonMapGet(moveX, moveY) == 'D'
                            && KinkyDungeonTilesGet("" + moveX + "," + moveY).Lock
                            && KinkyDungeonTilesGet("" + moveX + "," + moveY).Type == "Door"))))) {
                if (AllowInteract) {
                    if (KDObjectClick[KinkyDungeonTilesGet("" + moveX + "," + moveY).Type]) {
                        KDObjectClick[KinkyDungeonTilesGet("" + moveX + "," + moveY).Type](moveX, moveY);
                        if (KDMapData.GroundItems.some((item) => { return item.x == moveX && item.y == moveY; })) {
                            KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
                        }
                    }
                    else {
                        KDDelayedActionPrune(["Action", "World"]);
                        KinkyDungeonTargetTileLocation = "" + moveX + "," + moveY;
                        KinkyDungeonTargetTile = KinkyDungeonTilesGet(KinkyDungeonTargetTileLocation);
                        KinkyDungeonInterruptSleep();
                        KinkyDungeonTargetTileMsg();
                        if (KDMapData.GroundItems.some((item) => { return item.x == moveX && item.y == moveY; })) {
                            KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
                            KinkyDungeonInterruptSleep();
                            KinkyDungeonAdvanceTime(1);
                        }
                    }
                }
            }
            else if (moveX != KinkyDungeonPlayerEntity.x || moveY != KinkyDungeonPlayerEntity.y) {
                KDDelayedActionPrune(["Action", "Move"]);
                let newDelta = 1;
                KinkyDungeonTargetTile = null;
                KinkyDungeonTargetTileLocation = "";
                KDModalArea = false;
                KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
                if (!KinkyDungeonHandleMoveObject(moveX, moveY, moveObject)) {
                    KinkyDungeonNoMoveFlag = false;
                    KinkyDungeonConfirmStairs = false;
                    KinkyDungeonSendEvent("beforeMove", { x: moveX, y: moveY });
                    let sprintcost = KDSprintCost();
                    if (!KinkyDungeonNoMoveFlag) {
                        if (isNaN(KDGameData.MovePoints))
                            KDGameData.MovePoints = 0;
                        KDGameData.MovePoints = Math.min(Math.ceil(KinkyDungeonSlowLevel + 1), KDGameData.MovePoints + delta);
                        let lastFacingX = KinkyDungeonPlayerEntity.facing_x || 0;
                        let lastFacingY = KinkyDungeonPlayerEntity.facing_y || 0;
                        KinkyDungeonPlayerEntity.facing_x = Math.min(1, Math.abs(moveX - KinkyDungeonPlayerEntity.x)) * Math.sign(moveX - KinkyDungeonPlayerEntity.x);
                        KinkyDungeonPlayerEntity.facing_y = Math.min(1, Math.abs(moveY - KinkyDungeonPlayerEntity.y)) * Math.sign(moveY - KinkyDungeonPlayerEntity.y);
                        if (KinkyDungeonPlayerEntity.facing_x || KinkyDungeonPlayerEntity.facing_y) {
                            KinkyDungeonPlayerEntity.facing_x_last = KinkyDungeonPlayerEntity.facing_x;
                            KinkyDungeonPlayerEntity.facing_y_last = KinkyDungeonPlayerEntity.facing_y;
                        }
                        let inertia = KinkyDungeonPlayerEntity.facing_y * lastFacingY + KinkyDungeonPlayerEntity.facing_x * lastFacingX;
                        if ((KinkyDungeonPlayerEntity.facing_y || KinkyDungeonPlayerEntity.facing_x)
                            && (KDGetInertia(KDPlayer()) > 0)) {
                            let D = Math.abs(KinkyDungeonPlayerEntity.facing_y - lastFacingY) ** 2
                                + Math.abs(KinkyDungeonPlayerEntity.facing_x - lastFacingX) ** 2;
                            let dotProd = KinkyDungeonPlayerEntity.facing_y * lastFacingY + KinkyDungeonPlayerEntity.facing_x * lastFacingX;
                            if (dotProd < 0 || ((D > 1 && (lastFacingY || lastFacingX)) && KDGetInertia(KDPlayer()) > 1)) {
                                KDGameData.MovePoints = Math.min(KDGameData.MovePoints, 0);
                                if (D > 2)
                                    KinkyDungeonSendTextMessage(10, TextGet("KDTurn2"), KDBaseWhite, 1);
                                else
                                    KinkyDungeonSendTextMessage(9, TextGet("KDTurn1"), KDBaseWhite, 1);
                            }
                        }
                        if (KinkyDungeonFlags.has("Quickness") && KinkyDungeonSlowLevel < 9) {
                            KDGameData.MovePoints = KinkyDungeonSlowLevel + 1;
                            quick = true;
                        }
                        if (KinkyDungeonStatBind)
                            KDGameData.MovePoints = Math.min(0, KDGameData.MovePoints);
                        let willSprint = (forceSprint || KinkyDungeonToggleAutoSprint) && !SuppressSprint;
                        if (KDGameData.MovePoints >= 1 || (willSprint && KDCanSprint(sprintcost))) {
                            let xx = KinkyDungeonPlayerEntity.x;
                            let yy = KinkyDungeonPlayerEntity.y;
                            let dx = (Enemy?.x || 0) - KinkyDungeonPlayerEntity.x;
                            let dy = (Enemy?.y || 0) - KinkyDungeonPlayerEntity.y;
                            newDelta = Math.max(newDelta, KinkyDungeonMoveTo(moveX, moveY, willSprint, allowPass, sprintcost));
                            if (newDelta > 0) {
                                if (Enemy && allowPass) {
                                    let pushTile = (KinkyDungeonFlags.has("PassthroughAll") || KDEnemyHasFlag(Enemy, "passthrough"))
                                        ? undefined
                                        : KDGetPushTile(Enemy, dx, dy);
                                    if (pushTile && KDMoveEntity(Enemy, pushTile.x, pushTile.y, true, undefined, undefined, true)) {
                                        pushTile = undefined;
                                    }
                                    if (!pushTile) {
                                        KDMoveEntity(Enemy, xx, yy, true, undefined, undefined, true);
                                    }
                                    if (KinkyDungeonFlags.has("Passthrough"))
                                        KinkyDungeonSetFlag("Passthrough", 2);
                                    if (KinkyDungeonFlags.has("PassthroughAll"))
                                        KinkyDungeonSetFlag("PassthroughAll", 2);
                                    if (KinkyDungeonFlags.has("PassthroughP"))
                                        KinkyDungeonSetFlag("PassthroughP", 2);
                                    if (KinkyDungeonFlags.has("PassthroughPAll"))
                                        KinkyDungeonSetFlag("PassthroughPAll", 2);
                                    if (Enemy.Enemy?.stunWhenSwap) {
                                        Enemy.stun = Math.max(Enemy.stun || 0, 2);
                                    }
                                }
                                KinkyDungeonLastAction = "Move";
                                moved = true;
                                if (KDSoundEnabled()) {
                                    if (quick) {
                                        KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Miss.ogg");
                                    }
                                    else {
                                        if (moveObject == 'w' || moveObject == 'W')
                                            KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/FootstepWater.ogg");
                                        else
                                            KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Footstep.ogg");
                                    }
                                }
                                if (moveObject == 'g') {
                                    KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonGrateEnter"), KDBaseWhite, 3);
                                    KDStunTurns(1, true);
                                }
                            }
                        }
                        let plugLevel = Math.round(Math.min(3, KinkyDungeonStatPlugLevel));
                        let dict = KinkyDungeonPlugCount > 1 ? "plugs" : "plug";
                        let dicts = KinkyDungeonPlugCount > 1 ? "" : "s";
                        if (KinkyDungeonSlowLevel == 0 && KinkyDungeonPlugCount > 0)
                            KinkyDungeonSendTextMessage(0, TextGet("KinkyDungeonPlugWalk" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "yellow", 2, true);
                        if (KinkyDungeonSlowLevel == 1 && !KinkyDungeonStatsChoice.has("HeelWalker"))
                            KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonSlowed" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "yellow", 2, true);
                        else if (KinkyDungeonSlowLevel == 2)
                            KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonHopping" + (KDGameData.Crouch ? "Crouch" : "") + plugLevel).replace("plugs", dict).replace("(s)", dicts), "orange", 2, true);
                        else if (KinkyDungeonSlowLevel == 3)
                            KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonInching" + plugLevel).replace("plugs", dict).replace("(s)", dicts), KDBaseRed, 2, true);
                        else if (KinkyDungeonSlowLevel > 3 && KinkyDungeonSlowLevel < 10)
                            KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonCrawling" + plugLevel).replace("plugs", dict).replace("(s)", dicts), KDBaseRed, 2, true);
                        else if (KinkyDungeonSlowLevel >= 10)
                            KinkyDungeonSendActionMessage(1, TextGet("KinkyDungeonCantMove" + plugLevel).replace("plugs", dict).replace("(s)", dicts), KDBaseRed, 2, true);
                        let moveMult = Math.max(1, KinkyDungeonSlowLevel);
                        if (KinkyDungeonStatsChoice.has("Quickness")) {
                            KinkyDungeonSetFlag("BlockQuicknessPerk", 3 + moveMult);
                        }
                        if (quick)
                            moveMult = 1;
                        if (KinkyDungeonSlowLevel > 9)
                            moveMult = 1;
                        if ((moveDirection.x != 0 || moveDirection.y != 0)) {
                            if (moved) {
                                if (KinkyDungeonSlowLevel > 1 || (!KinkyDungeonStatsChoice.has("HeelWalker") && KinkyDungeonSlowLevel > 0)) {
                                    if (KinkyDungeonSlowLevel < 10) {
                                        KDChangeStamina("slow", "debuff", "move", moveMult * (KinkyDungeonStatStaminaRegenPerSlowLevel * KinkyDungeonSlowLevel) * delta, false, moveMult, true);
                                    }
                                }
                                if (KDGameData.HeelPowerEffective > 0 && !KDGameData.Crouch) {
                                    KDChangeBalanceSrc("heels", "debuff", "move", -KDGetBalanceCost("move") * (0.75 + 0.5 * KDRandom()) * (1 + Math.max(-inertia, 0) * KDBalanceInertiaMult) * moveMult, true, true, 1);
                                }
                                else {
                                }
                                let plugIncreaseAmount = (KinkyDungeonStatPlugLevel * KinkyDungeonDistractionPerPlug);
                                KinkyDungeonStatDistraction += plugIncreaseAmount;
                                if (plugIncreaseAmount > 0)
                                    KinkyDungeonStatDistractionLower += plugIncreaseAmount * 0.2;
                                if (KinkyDungeonHasCrotchRope) {
                                    if (KinkyDungeonStatPlugLevel == 0)
                                        KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonCrotchRope"), "pink", 2);
                                    KinkyDungeonStatDistraction += (KinkyDungeonCrotchRopeDistraction);
                                    if (moveMult > 0)
                                        KinkyDungeonStatDistractionLower += (KinkyDungeonCrotchRopeDistraction) * 0.2;
                                }
                            }
                        }
                        else {
                            KinkyDungeonWaitMessage(false, quick ? 0 : 1, KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax);
                            KDGameData.MovePoints = Math.min(KDGameData.MovePoints + 1, 0);
                        }
                        if (KinkyDungeonSlowLevel >= 10) {
                            let data = {
                                player: KinkyDungeonPlayerEntity,
                                moveX: moveX,
                                moveY: moveY,
                                cancelSprint: false,
                            };
                            KinkyDungeonSendEvent("failMove", data);
                        }
                    }
                    if (KDGameData.Balance <= 0 && !KDGameData.Crouch && newDelta < 10 && !quick) {
                        KDTrip(delta + Math.max(1, newDelta));
                    }
                    KinkyDungeonAdvanceTime(quick ? 0 : 1);
                }
                KinkyDungeonInterruptSleep();
                if (newDelta > 1 && newDelta < 10 && !quick) {
                    if (KDToggles.LazyWalk && !KinkyDungeonInDanger()) {
                        KDGameData.SlowMoveTurns = newDelta - 1;
                        KDUpdateWaitTime(200);
                    }
                    else {
                        KDGameData.MovePoints = Math.min(KDGameData.MovePoints, 1 - newDelta);
                    }
                }
                if (KDGameData.MovePoints < 0) {
                    if (!KinkyDungeonFlags.get("tut_slo")) {
                        KinkyDungeonSendTextMessage(10, TextGet("KDTut_Slowed"), KDTutorialColor, 10);
                        KinkyDungeonSetFlag("tut_slo", -1);
                    }
                }
                if (!(KDGameData.KneelTurns > 0))
                    KDPauseBalance(5);
            }
            else {
                KDGameData.MovePoints = Math.min(KDGameData.MovePoints + 1, 0);
                KinkyDungeonPlayerEntity.facing_x = 0;
                KinkyDungeonPlayerEntity.facing_y = 0;
                KinkyDungeonWaitMessage(false, 1);
                KinkyDungeonAdvanceTime(1);
            }
        }
        else if (KDCrackableTiles.includes(moveObject)) {
            if (KDEntityHasBuff(KinkyDungeonPlayerEntity, "TryingToMine") && KinkyDungeonPlayerDamage.digSpell) {
                KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                    id: "TryingToMine",
                    type: "confirm",
                    power: 1,
                    duration: 5
                });
                KDDelayedActionPrune(["Action", "Cast"]);
                let sp = KinkyDungeonFindSpell(KinkyDungeonPlayerDamage.digSpell || "Pickaxe", true);
                if (sp) {
                    let res = KinkyDungeonCastSpell(moveX, moveY, sp, undefined, KDPlayer(), undefined, undefined, {
                        targetingSpellWeapon: KinkyDungeonTargetingSpellWeapon,
                    });
                    if (res.result == "Cast" && sp.sfx) {
                        KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sp.sfx + ".ogg");
                    }
                    if (res.result != "Fail" && !sp.quick) {
                        KinkyDungeonAdvanceTime(res.data.delta);
                    }
                    KinkyDungeonInterruptSleep();
                }
            }
            else if (KDEntityHasBuff(KinkyDungeonPlayerEntity, "TryingToMine")) {
                let wpn = Array.from(KinkyDungeonInventory.get(Weapon).values()).find((item) => {
                    return KDWeapon(item)?.digSpell && KinkyDungeonCanUseWeapon(false, undefined, KDWeapon(item));
                });
                if (KDWeapon(wpn)?.digSpell) {
                    KDSwitchWeapon(wpn.inventoryVariant || wpn.name);
                }
            }
            else if (KinkyDungeonPlayerDamage.digSpell) {
                KinkyDungeonSendActionMessage(2, TextGet("KDWallAttemptToMine"), KDBaseWhite, 2);
                KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                    id: "TryingToMine",
                    type: "confirm",
                    power: 1,
                    duration: 5
                });
            }
            else if (Array.from(KinkyDungeonInventory.get(Weapon).values()).some((item) => {
                return KDWeapon(item)?.digSpell && KinkyDungeonCanUseWeapon(false, undefined, KDWeapon(item));
            })) {
                KinkyDungeonSendActionMessage(2, TextGet("KDWallAttemptToMine"), KDBaseWhite, 2);
                KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                    id: "TryingToMine",
                    type: "confirm",
                    power: 1,
                    duration: 5
                });
            }
        }
        else if (KDMapData.GroundItems.some((item) => { return item.x == moveX && item.y == moveY; })) {
            KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
            KinkyDungeonInterruptSleep();
            KinkyDungeonAdvanceTime(1);
        }
        else {
            if (KinkyDungeonVisionGet(moveX, moveY) <= 1) {
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Footstep.ogg");
                KinkyDungeonSendActionMessage(2, TextGet("KDWallBump"), KDBaseWhite, 2);
                KinkyDungeonInterruptSleep();
                if (moveDirection.y <= 0)
                    KDRevealTile(moveX, moveY + 1, 2);
                if (moveDirection.y >= 0)
                    KDRevealTile(moveX, moveY - 1, 2);
                KDRevealTile(moveX, moveY, 2);
                KinkyDungeonAdvanceTime(1);
            }
        }
    }
    KinkyDungeonLastMoveDirection = moveDirection;
    if (moved) {
        KinkyDungeonSetFlag("moved", 2);
    }
    return moved;
}
function KinkyDungeonWaitMessage(NoTime, delta, msg = true) {
    if (!KDIsAutoAction()) {
        if (msg) {
            if (KinkyDungeonStatWillpowerExhaustion > 1)
                KinkyDungeonSendActionMessage(3, TextGet("WaitSpellExhaustion"), "orange", 2);
            else if (!KinkyDungeonHasStamina(2.5, false))
                KinkyDungeonSendActionMessage(1, TextGet("WaitExhaustion"
                    + (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.33 ?
                        ((KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.67 ?
                            "ArousedHeavy"
                            : "Aroused"))
                        : "")), "yellow", 2);
            else
                KinkyDungeonSendActionMessage(1, TextGet("Wait" + (KinkyDungeonStatDistraction > 12 ? "Aroused" : "")), "silver", 2, undefined, undefined, undefined, "Action");
        }
    }
    if (!NoTime && delta > 0) {
        if (!KDGameData.Wait)
            KDGameData.Wait = 0;
        KDGameData.Wait += delta;
        KDSetIDFlag(KDPlayer().id, "negativeSlowLevel", 0);
    }
    KinkyDungeonLastAction = "Wait";
    KinkyDungeonTrapMoved = false;
}
function KinkyDungeonMoveTo(moveX, moveY, willSprint, _allowPass, sprintCost) {
    let stepOff = false;
    let xx = KinkyDungeonPlayerEntity.x;
    let yy = KinkyDungeonPlayerEntity.y;
    if (KinkyDungeonPlayerEntity.x != moveX || KinkyDungeonPlayerEntity.y != moveY) {
        KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "move", 1);
        if (KDNearbyMapTiles(moveX, moveY, 1.5).some((tile) => { return (tile.x == moveX || tile.y == moveY) && !KinkyDungeonMovableTilesEnemy.includes(tile.tile); })) {
            KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "moveWall", 1);
        }
        else
            KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "moveOpen", 1);
        stepOff = true;
    }
    if (xx != moveX || yy != moveY) {
        KinkyDungeonTrapMoved = true;
    }
    let cencelled = !KinkyDungeonUpdateTether(0, true, KinkyDungeonPlayerEntity, moveX, moveY) ? KDMovePlayer(moveX, moveY, true, willSprint) : true;
    if (stepOff)
        KinkyDungeonHandleStepOffTraps(KinkyDungeonPlayerEntity, xx, yy, moveX, moveY);
    KinkyDungeonSetFlag("Quickness", 0);
    if (KinkyDungeonStatsChoice.has("Quickness")) {
        KinkyDungeonSetFlag("BlockQuicknessPerk", 4);
    }
    if (!cencelled && willSprint) {
        if (KDCanSprint(sprintCost)) {
            let unblocked = KinkyDungeonSlowLevel > 1 || KDGameData.MovePoints < 0;
            if (!unblocked) {
                let nextPosX = moveX * 2 - xx;
                let nextPosY = moveY * 2 - yy;
                let nextTile = KinkyDungeonMapGet(nextPosX, nextPosY);
                if (KinkyDungeonMovableTilesEnemy.includes(nextTile) && KinkyDungeonNoEnemy(nextPosX, nextPosY)) {
                    unblocked = true;
                }
            }
            if (unblocked) {
                let data = {
                    player: KinkyDungeonPlayerEntity,
                    xTo: moveX * 2 - xx,
                    yTo: moveY * 2 - yy,
                    cancelSprint: false,
                    sprintCost: 0,
                };
                data.sprintCost = KDSprintCost(data, sprintCost);
                KinkyDungeonSendEvent("sprint", data);
                if (!data.cancelSprint) {
                    KinkyDungeonSetFlag("sprinted", 2);
                    let nearby = KDNearbyEnemies(KDPlayer().x, KDPlayer().y, 10, undefined, true)
                        .filter((en) => {
                        return !!en.aware ||
                            (!KinkyDungeonPlayerDamage.silent && KDCanHearSound(en, 8, KDPlayer().x, KDPlayer().y));
                    });
                    let f = "";
                    let c = "Legs";
                    for (let en of nearby) {
                        f = "saw_" + c;
                        if (!en.flags || !en.flags[f])
                            KDSetIDFlag(en.id, f, -1);
                        if (!KDGameData.SawFlags)
                            KDGameData.SawFlags = {};
                        let faction = KDGetFaction(en);
                        if (!KDGameData.SawFlags[faction])
                            KDGameData.SawFlags[faction] = {};
                        KDGameData.SawFlags[faction][c] = (KDGameData.SawFlags[faction][c] || 0) + 1;
                    }
                    KDChangeStamina("sprint", "move", "sprint", data.sprintCost, false, 1);
                    KinkyDungeonSendActionMessage(5, TextGet("KDSprinting" + (KinkyDungeonSlowLevel > 1 ? "Hop" : "")), KDBaseLightGreen, 2);
                    KDChangeBalanceSrc("sprint", "move", "sprint", -KDGetBalanceCost("sprint") * (0.5 + 1 * KDRandom()) * KDBalanceSprintMult * 10 * KDFitnessMult(), true);
                    KinkyDungeonSetFlag("sprint", 2);
                    if (KinkyDungeonSlowLevel < 2) {
                        KinkyDungeonTrapMoved = true;
                        KDMovePlayer(moveX * 2 - xx, moveY * 2 - yy, true);
                    }
                }
            }
            KDGameData.MovePoints = 0;
            return 1;
        }
    }
    if (cencelled || (xx == KinkyDungeonPlayerEntity.x && yy == KinkyDungeonPlayerEntity.y)) {
        KDGameData.MovePoints = 0;
        KDSetIDFlag(KDPlayer().id, "negativeSlowLevel", 0);
        return 0;
    }
    KDGameData.MovePoints = 0;
    return Math.max(1, KinkyDungeonSlowLevel);
}
function KDBalanceSprint() {
    let threshold = 0.5 * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BalanceSprintThreshold"));
    return KDGameData.Balance >= threshold;
}
function KDCanSprint(cost) {
    let data = {
        canSprint: KDBalanceSprint(),
        mustStand: true,
        mustNotBeSlow: true,
        cost: cost != undefined ? cost : KDSprintCost()
    };
    KinkyDungeonSendEvent("canSprint", data);
    return data.canSprint && (!data.mustNotBeSlow || KinkyDungeonSlowLevel < 4)
        && KinkyDungeonHasStamina(-data.cost)
        && (!data.mustStand || (KinkyDungeonCanStand() && !KDForcedToGround()));
}
let KinkyDungeonLastAction = "";
let KinkyDungeonLastTurnAction = "";
let KDDrawUpdate = 0;
let KDVisionUpdate = 0;
let KDLastTick = 0;
let KDSawFlagsDecayRate = 0.95;
function KinkyDungeonAdvanceTime(delta, NoUpdate, NoMsgTick) {
    if (delta > 0) {
        KDEventData.sounddesc = [];
    }
    if (!KinkyDungeonPlayerEntity.id)
        KinkyDungeonPlayerEntity.id = -1;
    if (delta > 0) {
        let loudest = 0;
        for (let source of Object.values(KDPlayerNoiseSources)) {
            loudest = Math.max(loudest, source.calc(KDPlayer()));
        }
        KDPlayer().sound = Math.max(Math.max(0, (KDPlayer().sound || 0) * 0.75 - 2 * delta), loudest);
    }
    if (KDGameData.Party) {
        let neww = [];
        for (let en of KDGameData.Party) {
            let enn = KDGetGlobalEntity(en.id);
            if (enn)
                neww.push(enn);
        }
        KDGameData.Party = neww;
    }
    KDUpdateFog = true;
    KDLastTick = performance.now();
    KDGameData.WarningTiles = {};
    if (delta > 0 && CommonTime() > lastFloaterRefresh + 1000) {
        KDEntitiesFloaterRegisty = new Map();
        lastFloaterRefresh = CommonTime();
    }
    let pauseTime = false;
    if (delta > 0) {
        let timeslow = KDEntityBuffedStat(KinkyDungeonPlayerEntity, "TimeSlow");
        if (timeslow) {
            if (!KinkyDungeonFlags.get("TimeSlow")) {
                KinkyDungeonSetFlag("TimeSlow", timeslow);
            }
            else {
                pauseTime = true;
            }
        }
    }
    let _CharacterRefresh = CharacterRefresh;
    let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
    CharacterRefresh = () => { KDRefresh = true; };
    CharacterAppearanceBuildCanvas = () => { };
    let start = performance.now();
    if (KDGameData.MovePoints < -1 && KDGameData.KinkyDungeonLeashedPlayer < 1)
        KDGameData.MovePoints += delta;
    if (delta > 0) {
        KDDrawUpdate = delta;
        KDVisionUpdate = delta;
    }
    KDRecentRepIndex = 0;
    KinkyDungeonRestraintAdded = false;
    KinkyDungeonSFX = [];
    KDPlayerHitBy = [];
    KinkyDungeonUpdateAngel(delta);
    let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
    if (altType?.updatescript) {
        altType.updatescript(delta);
    }
    if (KDPlayer().leash)
        KinkyDungeonUpdateTether(delta, true, KinkyDungeonPlayerEntity);
    for (let enemy of KDMapData.Entities) {
        if (enemy.leash)
            KinkyDungeonUpdateTether(delta, false, enemy);
    }
    KinkyDungeonResetEventVariablesTick(delta);
    KinkyDungeonSendEvent("tick", { delta: delta });
    KinkyDungeonUpdateLightGrid = true;
    if (!NoMsgTick) {
        if (KinkyDungeonTextMessageTime > 0)
            KinkyDungeonTextMessageTime -= 1;
        if (KinkyDungeonTextMessageTime <= 0)
            KinkyDungeonTextMessagePriority = 0;
        if (KinkyDungeonActionMessageTime > 0)
            KinkyDungeonActionMessageTime -= 1;
        if (KinkyDungeonActionMessageTime <= 0)
            KinkyDungeonActionMessagePriority = 0;
    }
    KinkyDungeonItemCheck(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, MiniGameKinkyDungeonLevel);
    if (pauseTime && delta > 0) {
        delta = 0;
        KinkyDungeonFlags.set("TimeSlowTick", 1);
    }
    else
        pauseTime = false;
    for (let enemy of KDMapData.Entities) {
        if (enemy.leash)
            KinkyDungeonUpdateTether(delta, false, enemy);
    }
    KDGameData.ShieldDamage = 0;
    KDUpdateCollectionFlags(delta);
    KDUpdatePersistentNPCFlags(delta);
    for (let value of Object.values(KDGameData.Collection))
        KDTickCollectionWanderCollectionEntry(value);
    KinkyDungeonUpdateBuffs(delta, false);
    KinkyDungeonUpdateEnemies(delta, true);
    KinkyDungeonSendEvent("afterEnemyTick", { delta: delta, allied: true });
    for (let E = 0; E < KDMapData.Entities.length; E++) {
        let enemy = KDMapData.Entities[E];
        KDUnPackEnemy(enemy);
        if (KinkyDungeonEnemyCheckHP(enemy, E, KDMapData)) {
            E -= 1;
            continue;
        }
        if (KDCheckDespawn(enemy, E, KDMapData)) {
            E -= 1;
            continue;
        }
    }
    KinkyDungeonUpdateBullets(delta, true);
    KinkyDungeonUpdateBulletsCollisions(delta);
    KinkyDungeonUpdateEnemies(delta, false);
    KinkyDungeonSendEvent("afterEnemyTick", { delta: delta, allied: false });
    KinkyDungeonUpdateBullets(delta);
    KinkyDungeonUpdateBulletsCollisions(delta, true);
    KinkyDungeonParseExtraWarningTiles(delta);
    KDUpdateEffectTiles(delta);
    KinkyDungeonUpdateTileEffects(delta);
    for (let E = 0; E < KDMapData.Entities.length; E++) {
        let enemy = KDMapData.Entities[E];
        KDUnPackEnemy(enemy);
        if (KinkyDungeonEnemyCheckHP(enemy, E, KDMapData)) {
            E -= 1;
            continue;
        }
        if (KDCheckDespawn(enemy, E, KDMapData)) {
            E -= 1;
            continue;
        }
    }
    KinkyDungeonUpdateTether(0, true, KinkyDungeonPlayerEntity);
    for (let enemy of KDMapData.Entities) {
        if (enemy.leash)
            KinkyDungeonUpdateTether(0, false, enemy);
    }
    KinkyDungeonUpdateJailKeys();
    KDCommanderUpdate(delta);
    if (KDCustomDefeat) {
        KDRunDefeatForEnemy();
    }
    if (pauseTime) {
        delta = 1;
        KinkyDungeonFlags.set("TimeSlowTick", 0);
    }
    KinkyDungeonUpdateStats(delta);
    let toTile = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
    KinkyDungeonHandleMoveToTile(toTile);
    if (!KDGameData.DelayedActions)
        KDGameData.DelayedActions = [];
    let runActions = Object.assign([], KDGameData.DelayedActions);
    KDGameData.DelayedActions = KDGameData.DelayedActions.filter((action) => {
        return action.time - delta > 0;
    });
    for (let action of runActions) {
        action.time -= delta;
        if (action.time <= 0) {
            if (KDDelayedActionCommit[action.commit]) {
                KDDelayedActionCommit[action.commit](action);
            }
        }
        else if (action.update && KDDelayedActionUpdate[action.update]) {
            KDDelayedActionUpdate[action.update](action);
        }
    }
    if (KDGameData.DelayedActions?.length == 0)
        KDAutoWaitDelayed = false;
    if (!NoUpdate)
        KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
    if (KinkyDungeonStatStamina < 5) {
        let msg = "KinkyDungeonStaminaWarningMed";
        if (KinkyDungeonStatStamina < 2.5)
            msg = "KinkyDungeonStaminaWarningLow";
        if (KinkyDungeonStatStamina < 1)
            msg = "KinkyDungeonStaminaWarningNone";
        if (!KinkyDungeonSendActionMessage(1, TextGet(msg), KDBaseForest, 1, true))
            KinkyDungeonSendTextMessage(1, TextGet(msg), KDBaseForest, 1, true);
    }
    KDDoMumble(KDPlayer(), false);
    let end = performance.now();
    if (KDDebug)
        console.log(`Tick ${KinkyDungeonCurrentTick} took ${(end - start)} milliseconds.`);
    KinkyDungeonLastTurnAction = KinkyDungeonLastAction;
    KinkyDungeonLastAction = "";
    if (KDGameData.AncientEnergyLevel > 1)
        KDGameData.AncientEnergyLevel = 1;
    KinkyDungeonUpdateBulletVisuals(delta);
    CharacterRefresh = _CharacterRefresh;
    CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
    if (KinkyDungeonInDanger())
        KinkyDungeonSetFlag("DangerFlag", 3);
    if ((KinkyDungeonStatsChoice.has("Quickness") && !KinkyDungeonFlags.has("BlockQuicknessPerk"))) {
        KinkyDungeonSetFlag("Quickness", -1);
    }
    else if (KDEntityBuffedStat(KinkyDungeonPlayerEntity, "Quickness")) {
        KinkyDungeonSetFlag("Quickness", 1);
    }
    if (KDGameData.MovePoints < 0 || KinkyDungeonStatBlind) {
        KinkyDungeonSetFlag("Quickness", 0);
    }
    for (let en of KDMapData.Entities) {
        if (KDEnemyHasFlag(en, "removeVuln")) {
            en.vulnerable = 0;
        }
    }
    if (delta > 0) {
        KDTickMaps(delta, MiniGameKinkyDungeonLevel - KDMapTickRange, MiniGameKinkyDungeonLevel + KDMapTickRange, false, true, true);
    }
    KinkyDungeonCurrentTick += delta;
    if (KinkyDungeonCurrentTick > 100000)
        KinkyDungeonCurrentTick = 0;
    KinkyDungeonSendEvent("tickAfter", { delta: delta });
    if (KinkyDungeonStatsChoice.get("Forgetful")) {
        for (let X = 0; X < KDMapData.GridWidth; X++) {
            for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
                if (X >= 0 && X <= KDMapData.GridWidth - 1 && Y >= 0 && Y <= KDMapData.GridHeight - 1 && !(KinkyDungeonVisionGet(X, Y) > 0.1)) {
                    if (KinkyDungeonFogMemoryGet(X, Y) > 0) {
                        KinkyDungeonFogMemorySet(X, Y, Math.max(0, KinkyDungeonFogMemoryGet(X, Y) - delta));
                    }
                    else if (KinkyDungeonFogMemoryGet(X, Y) == 0) {
                        KinkyDungeonFogSet(X, Y, 0);
                    }
                }
            }
        }
    }
    KinkyDungeonUpdateStats(0);
    KDTickNeeds(delta);
    let Dstart = performance.now();
    KDUpdateForceOutfit(KinkyDungeonPlayer);
    KinkyDungeonDressPlayer();
    if (KDDebug)
        console.log(`Dressing ${KinkyDungeonCurrentTick} took ${(performance.now() - Dstart)} milliseconds.`);
    KDGetEnemyCache();
    KDAllowDialogue = true;
    if (KDGameData.InventoryAction && KDInventoryAction[KDGameData.InventoryAction].cancel(KinkyDungeonPlayerEntity, delta)) {
        KDGameData.InventoryAction = "";
        KDGameData.InventoryActionContainer = [];
    }
    if (KDGameData.InventoryActionContainer?.length > 0 && KDGameData.InventoryActionContainer[0] != KDGameData.InventoryAction) {
        KDGameData.InventoryActionContainer = [];
    }
    if (KDRestraintDebugLog.length > 100) {
        KDRestraintDebugLog = KDRestraintDebugLog.splice(0, 10);
    }
    KDQuestTick(KDGameData.Quests, delta);
    KinkyDungeonUpdateFlags(delta);
    if (delta > 0) {
        if (KDGameData.RevealedTiles) {
            for (let entry of Object.entries(KDGameData.RevealedTiles)) {
                KDGameData.RevealedTiles[entry[0]] = entry[1] - delta;
                if (KDGameData.RevealedTiles[entry[0]] < 0) {
                    delete KDGameData.RevealedTiles[entry[0]];
                }
            }
        }
        if (KDGameData.RevealedFog) {
            for (let entry of Object.entries(KDGameData.RevealedFog)) {
                KDGameData.RevealedFog[entry[0]] = entry[1] - delta;
                if (KDGameData.RevealedFog[entry[0]] < 0) {
                    delete KDGameData.RevealedFog[entry[0]];
                }
            }
        }
    }
    if (!KDGameData.CurrentDialog) {
        KDCustomExpTmp = {};
    }
    if (delta > 0) {
        if (KinkyDungeonFlags.get("PlayerCombat"))
            KinkyDungeonSetFlag("PlayerCombatRecent", 20);
        if (KDGameData.SawFlags) {
            for (let faction in KDGameData.SawFlags) {
                if (KDGameData.SawFlags[faction]) {
                    for (let flag in KDGameData.SawFlags[faction]) {
                        KDGameData.SawFlags[faction][flag] = KDGameData.SawFlags[faction][flag] * KDSawFlagsDecayRate || 0;
                        if (KDGameData.SawFlags[faction][flag] < 0.01)
                            delete KDGameData.SawFlags[faction][flag];
                    }
                }
            }
        }
    }
}
let KDEntityFlagCache = new Map();
let KDUpdateEntityFlagCache = false;
function KDGetEntityFlagCache() {
    if (!KDEntityFlagCache || KDUpdateEntityFlagCache) {
        KDEntityFlagCache = new Map();
        for (let npc of Object.values(KDPersistentNPCs)) {
            if (npc.entity?.flags) {
                if (Object.entries(npc.entity.flags).some((f) => {
                    return f[1] >= 0;
                })) {
                    KDEntityFlagCache.set(npc, true);
                }
            }
        }
        KDUpdateEntityFlagCache = false;
    }
}
let KDItemEventCache = new Map();
let KDUpdateItemEventCache = false;
function KDGetItemEventCache() {
    if (!KDItemEventCache || KDUpdateItemEventCache) {
        KDItemEventCache = new Map();
        let set = false;
        for (let inv of KinkyDungeonAllRestraintDynamic()) {
            if (!KDRestraint(inv.item))
                continue;
            if (!set && KDRestraint(inv.item)?.events) {
                for (let e of KDRestraint(inv.item)?.events) {
                    if (!KDItemEventCache.get(e.trigger))
                        KDItemEventCache.set(e.trigger, new Map());
                    KDItemEventCache.get(e.trigger).set(KDRestraint(inv.item).Group, true);
                }
            }
            if (!set && inv.item.events) {
                for (let e of inv.item.events) {
                    if (!KDItemEventCache.get(e.trigger))
                        KDItemEventCache.set(e.trigger, new Map());
                    KDItemEventCache.get(e.trigger).set(KDRestraint(inv.item).Group, true);
                }
            }
            if (!set && KDCurses[KDGetCurse(inv.item)]?.events) {
                for (let e of KDCurses[KDGetCurse(inv.item)]?.events) {
                    if (!KDItemEventCache.get(e.trigger))
                        KDItemEventCache.set(e.trigger, new Map());
                    KDItemEventCache.get(e.trigger).set(KDRestraint(inv.item).Group, true);
                }
            }
        }
        KDUpdateItemEventCache = false;
    }
}
let KDAllowDialogue = true;
let lastFloaterRefresh = 0;
function KinkyDungeonTargetTileMsg() {
    if (KDObjectMessages[KinkyDungeonTargetTile.Type]) {
        return KDObjectMessages[KinkyDungeonTargetTile.Type]();
    }
    else if (KinkyDungeonTargetTile.Lock) {
        KinkyDungeonTargetTile.LockSeen =
            KinkyDungeonTargetTile.Lock;
        if (KinkyDungeonTargetTile.Faction)
            KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonObjectFaction")
                .replace("FACTION", TextGet("KinkyDungeonFaction" + KinkyDungeonTargetTile.Faction)), KDBaseRed, 2, true);
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Locked.ogg");
        KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonObjectLock")
            .replace("TYPE", TextGet("KinkyDungeonShrine" + KinkyDungeonTargetTile.Name))
            .replace("LKTP", TextGet(`Kinky${KinkyDungeonTargetTile.Lock}Lock`)), KDBaseWhite, 1, true);
        return true;
    }
    else {
        KinkyDungeonTargetTile.LockSeen = undefined;
        let suff = "";
        if (KinkyDungeonTargetTile.Faction)
            KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonObjectFaction")
                .replace("FACTION", TextGet("KinkyDungeonFaction" + KinkyDungeonTargetTile.Faction)), KDBaseRed, 2, true);
        if (KinkyDungeonTargetTile.Name == "Commerce")
            suff = "Commerce";
        let Type = KinkyDungeonTargetTile.Type;
        if (Type
            && ObjectTypeTooltipOverride[Type]
            && KinkyDungeonTargetTile[Type]
            && ObjectTypeTooltipOverride[Type][KinkyDungeonTargetTile[Type]]) {
            Type = ObjectTypeTooltipOverride[Type][KinkyDungeonTargetTile[Type]];
        }
        if (Type
            && ObjectTypeTooltipOverride[Type]
            && KinkyDungeonTargetTile[Type]
            && ObjectTypeTooltipOverride[Type][KinkyDungeonTargetTile[Type]]) {
            Type = ObjectTypeTooltipOverride[Type][KinkyDungeonTargetTile[Type]];
        }
        KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonObject" + Type + suff).replace("TYPE", TextGet("KinkyDungeonShrine" + KinkyDungeonTargetTile.Name)), KDBaseWhite, 1, true);
        return true;
    }
}
function KDAddAppearance(C, _Group, ItemAsset, NewColor, DifficultyFactor = 0, ItemMemberNumber = -1, _Refresh = true, item) {
    DifficultyFactor = 0;
    let data = {
        color: NewColor,
        item: item,
    };
    KinkyDungeonSendEvent("onWear", data);
    if (ItemAsset != null) {
        const NA = {
            Asset: ItemAsset,
            Difficulty: parseInt((ItemAsset.Difficulty == null) ? 0 : ItemAsset.Difficulty) + parseInt(DifficultyFactor),
            Color: data.color,
            Property: ItemAsset.CharacterRestricted ? { ItemMemberNumber: ItemMemberNumber == null ? -1 : ItemMemberNumber } : undefined
        };
        C.Appearance.push(NA);
        return NA;
    }
    return null;
}
function KDAddModel(C, Group, ItemModel, NewColor, filters, item, Properties, factionFilters) {
    let data = {
        C: C,
        color: NewColor,
        Group: Group,
        item: item,
        Model: ItemModel != null ? JSON.parse(JSON.stringify(ItemModel)) : null,
        Filters: filters,
        Properties: Properties,
        factionFilters: factionFilters,
    };
    KinkyDungeonSendEvent("onWear", data);
    if (ItemModel != null) {
        const NA = {
            Model: data.Model,
            Difficulty: 0,
            Color: data.color,
            Property: undefined,
            Filters: data.Filters,
            Properties: data.Properties,
            factionFilters: data.factionFilters,
        };
        NA.Model.Filters = NA.Filters || NA.Model.Filters;
        NA.Model.Properties = NA.Properties || NA.Model.Properties;
        NA.Model.factionFilters = NA.factionFilters || NA.Model.factionFilters;
        for (let i = 0; i < C.Appearance.length; i++) {
            if (C.Appearance[i]?.Model?.Name == NA.Model.Name) {
                C.Appearance[i] = NA;
                return NA;
            }
        }
        C.Appearance.push(NA);
        return NA;
    }
    return null;
}
function KinkyDungeonCloseDoor(x, y) {
    if (KinkyDungeonStatsChoice.get("Doorknobs") && KinkyDungeonIsArmsBound(true) && KinkyDungeonIsHandsBound(true, true, 0.5))
        KinkyDungeonSendTextMessage(8, TextGet("KDCantCloseDoor"), KDBaseOrange, 2);
    else {
        KinkyDungeonTargetTileLocation = x + ',' + y;
        KinkyDungeonTargetTile = null;
        KinkyDungeonMapSet(x, y, "D");
        KinkyDungeonTargetTileLocation = "";
        KDModalArea = false;
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/DoorClose.ogg");
        KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonCloseDoorDone"), KDBaseWhite, 2);
        KinkyDungeonAdvanceTime(1, true);
    }
}
let KDEnemyCache = null;
let KDEnemyEventCache = null;
let KDUpdateEnemyCache = true;
let KDIDCache = new Map();
function KDGetEnemyCache() {
    if (KDUpdateEnemyCache || !KDEnemyCache) {
        KDUpdateEnemyCache = false;
        KDEnemyCache = new Map();
        KDEnemyEventCache = new Map();
        KDIDCache = new Map();
        for (let e of KDMapData.Entities) {
            KDEnemyCache.set(e.x + "," + e.y, e);
            if (e.Enemy?.events) {
                for (let event of e.Enemy.events) {
                    if (!KDEnemyEventCache.get(event.trigger)) {
                        KDEnemyEventCache.set(event.trigger, new Map());
                    }
                    KDEnemyEventCache.get(event.trigger).set(e.id, true);
                }
            }
            KDEnemyCache.set(e.x + "," + e.y, e);
            KDIDCache.set(e.id, e);
        }
    }
    return KDEnemyCache;
}
let KDTileQuery = "";
let KDTileLast = null;
function KDTile(x, y) {
    if (x == undefined)
        x = KinkyDungeonPlayerEntity.x;
    if (y == undefined)
        y = KinkyDungeonPlayerEntity.y;
    let q = x + "," + y;
    if (q == KDTileQuery)
        return KDTileLast;
    else {
        let t = KinkyDungeonTilesGet(q);
        KDTileLast = t;
        KDTileQuery = q;
        return t;
    }
}
function KDTileDelete(x, y) {
    if (x == undefined)
        x = KinkyDungeonPlayerEntity.x;
    if (y == undefined)
        y = KinkyDungeonPlayerEntity.y;
    KinkyDungeonTilesDelete(x + "," + y);
}
function KDStunTurns(turns, noFlag) {
    if (!noFlag)
        KinkyDungeonSetFlag("playerStun", turns + 1);
    KDGameData.SlowMoveTurns = Math.max(KDGameData.SlowMoveTurns, turns);
    KDUpdateWaitTime(200);
}
function KDKneelTurns(turns) {
    KinkyDungeonSetFlag("playerStun", turns + 1);
    KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns || 0, turns);
}
function ListToRecord(list) {
    let obj = {};
    for (let o of list) {
        obj[o.name] = o;
    }
    return obj;
}
function GetByWeight(list) {
    let WeightTotal = 0;
    let Weights = [];
    let type = null;
    for (let obj of Object.entries(list)) {
        Weights.push({ obj: obj[1], weight: WeightTotal });
        WeightTotal += obj[1].weight;
    }
    let selection = KDRandom() * WeightTotal;
    for (let L = Weights.length - 1; L >= 0; L--) {
        if (selection > Weights[L].weight) {
            type = Weights[L].obj;
            break;
        }
    }
    return type;
}
function KDGetByWeight(list) {
    let WeightTotal = 0;
    let Weights = [];
    let type = "";
    for (let obj of Object.entries(list)) {
        Weights.push({ obj: obj[0], weight: WeightTotal });
        WeightTotal += obj[1];
    }
    let selection = KDRandom() * WeightTotal;
    for (let L = Weights.length - 1; L >= 0; L--) {
        if (selection > Weights[L].weight) {
            type = Weights[L].obj;
            break;
        }
    }
    return type;
}
let KDKeyCheckers = {
    "Toggles": () => {
        if (KinkyDungeonState == 'Game' && KinkyDungeonDrawState == 'Game' && KinkyDungeonKeyToggle.includes(KinkyDungeonKeybindingCurrentKey)) {
            switch (KinkyDungeonKeybindingCurrentKey) {
                case KinkyDungeonKeyToggle[1]:
                    KinkyDungeonToggleAutoPass = !KinkyDungeonToggleAutoPass;
                    break;
                case KinkyDungeonKeyToggle[2]:
                    KDInteracting = !KDInteracting;
                    break;
                case KinkyDungeonKeyToggle[3]:
                    KDAutoStruggleClick();
                    break;
                case KinkyDungeonKeyToggle[4]:
                    KinkyDungeonFastMove = !KinkyDungeonFastMove;
                    break;
                case KinkyDungeonKeyToggle[5]:
                    KinkyDungeonInspect = !KinkyDungeonInspect;
                    KinkyDungeonUpdateLightGrid = true;
                    break;
                case KinkyDungeonKeyToggle[10]:
                    KDBulletTransparency = !KDBulletTransparency;
                    break;
                case KinkyDungeonKeyToggle[12]:
                    KDStatusToggle = !KDStatusToggle;
                    break;
            }
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
            return true;
        }
    },
    "Zoom": () => {
        if (KinkyDungeonState == 'Game' && KinkyDungeonDrawState == 'Game') {
            switch (KinkyDungeonKeybindingCurrentKey) {
                case KinkyDungeonKeyMap[1]:
                    KDChangeZoom(-1);
                    return true;
                case KinkyDungeonKeyMap[2]:
                    KDChangeZoom(+1);
                    return true;
            }
            return false;
        }
    },
    "Shop": () => {
        if (KinkyDungeonState == 'Game' && KinkyDungeonDrawState == 'Game' && KinkyDungeonTargetTile?.Type == "Shrine" && KinkyDungeonTargetTile.Name == "Commerce") {
            if (KinkyDungeonKey[0] == KinkyDungeonKeybindingCurrentKey) {
                KinkyDungeonShopIndex = (KinkyDungeonShopIndex + 1) % KDMapData.ShopItems.length;
                KDShopBuyConfirm = false;
                return true;
            }
            else if (KinkyDungeonKey[2] == KinkyDungeonKeybindingCurrentKey) {
                KinkyDungeonShopIndex = KinkyDungeonShopIndex - 1;
                if (KinkyDungeonShopIndex < 0)
                    KinkyDungeonShopIndex = KDMapData.ShopItems.length - 1;
                KDShopBuyConfirm = false;
                return true;
            }
            else if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey) {
                let cost = KinkyDungeonShrineCost("Commerce");
                if (cost <= KinkyDungeonGold) {
                    if (!KDShopBuyConfirm)
                        KDShopBuyConfirm = true;
                    else {
                        KDSendInput("shrineBuy", { type: "Commerce", shopIndex: KinkyDungeonShopIndex });
                        KDShopBuyConfirm = false;
                    }
                }
                return true;
            }
            else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey) {
                KDShopBuyConfirm = false;
                return true;
            }
        }
    },
    "Dialogue": () => {
        if (KDGameData.CurrentDialog && !(KDGameData.SlowMoveTurns > 0)) {
            if (KinkyDungeonState == 'Game' && KinkyDungeonDrawState == 'Game' && KDGameData.CurrentDialog) {
                if (KinkyDungeonKey[2] == KinkyDungeonKeybindingCurrentKey) {
                    if (KDDialogueData.CurrentDialogueIndex < KDMaxDialogue - 1)
                        KDDialogueData.CurrentDialogueIndex += 1;
                    else
                        KDClickButton("dialogueDOWN");
                    return true;
                }
                else if (KinkyDungeonKey[0] == KinkyDungeonKeybindingCurrentKey) {
                    if (KDDialogueData.CurrentDialogueIndex > 0)
                        KDDialogueData.CurrentDialogueIndex = Math.max(0, KDDialogueData.CurrentDialogueIndex - 1);
                    else
                        KDClickButton("dialogueUP");
                    return true;
                }
                else if (KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey) {
                    KDClickButton(KDOptionOffset + "dialogue" + (KDDialogueData.CurrentDialogueIndex));
                    return true;
                }
                else if (KinkyDungeonKeySkip[0] == KinkyDungeonKeybindingCurrentKey) {
                    let dialogue = KDGetDialogue();
                    if (dialogue.options) {
                        let entries = Object.entries(dialogue.options);
                        let II = -KDOptionOffset;
                        let gagged = KDDialogueGagged();
                        for (let i = 0; i < entries.length && II < KDMaxDialogue; i++) {
                            if ((!entries[i][1].prerequisiteFunction || entries[i][1].prerequisiteFunction(gagged, KinkyDungeonPlayerEntity))
                                && (!entries[i][1].gagRequired || gagged)
                                && (!entries[i][1].gagDisabled || !gagged)) {
                                if (II >= 0) {
                                    if (entries[i][0] == "Leave" || entries[i][0] == "Continue" || entries[i][1].skip) {
                                        KDClickButton(KDOptionOffset + "dialogue" + (II));
                                        return true;
                                    }
                                }
                                II += 1;
                            }
                        }
                    }
                    return true;
                }
            }
        }
    },
};
function KDGetAltType(Floor, MapMod, RoomType) {
    let mapMod = null;
    if (MapMod != undefined ? MapMod : KDGameData.MapMod) {
        mapMod = KDMapMods[MapMod ? MapMod : KDGameData.MapMod];
    }
    let altRoom = RoomType != undefined ? RoomType : KDGameData.RoomType;
    let altType = altRoom ? KinkyDungeonAltFloor((mapMod && mapMod.altRoom) ? mapMod.altRoom : altRoom) : KinkyDungeonBossFloor(Floor);
    return altType;
}
function KDCanPassEnemy(_player, Enemy, force, ignoreIfAlready) {
    return !KDIsImmobile(Enemy)
        && ((!KinkyDungeonAggressive(Enemy) && !Enemy.playWithPlayer) || (KDHelpless(Enemy)))
        && ((force || (KinkyDungeonToggleAutoPass
            && (!KDGameData.FocusControlToggle || ((KDGameData.FocusControlToggle.AutoPassHelplessEnemies || !(KDHostile(Enemy) && KDHelpless(Enemy))) &&
                (KDGameData.FocusControlToggle.AutoPassHelplessAllies || !(!KDHostile(Enemy) && KDHelpless(Enemy))) &&
                (KDGameData.FocusControlToggle.AutoPassAllies || !(KDAllied(Enemy))) &&
                (KDGameData.FocusControlToggle.AutoPassNeutral || !(!KDAllied(Enemy) && !KDAllied(Enemy))) &&
                (KDGameData.FocusControlToggle.AutoPassShop || !(KDEnemyHasFlag(Enemy, "Shop"))) &&
                (KDGameData.FocusControlToggle.AutoPassSpecial || !((Enemy.specialdialogue
                    && (!KDSpecialDialogueCondition[Enemy.specialdialogue] || KDSpecialDialogueCondition[Enemy.specialdialogue](Enemy, _player))) ||
                    (Enemy.prisondialogue && KDIsImprisoned(Enemy)) || ((Enemy.specialdialogue
                    && (!KDSpecialDialogueCondition[Enemy.specialdialogue] || KDSpecialDialogueCondition[Enemy.specialdialogue](Enemy, _player)))))) &&
                (KDGameData.FocusControlToggle.AutoPassSummons || !(Enemy.Enemy.allied)))))) || (!ignoreIfAlready && (KDEnemyHasFlag(Enemy, "passthrough")
            || (KinkyDungeonFlags.has("Passthrough"))
            || Enemy.Enemy.noblockplayer)) || (ignoreIfAlready && !(KDEnemyHasFlag(Enemy, "passthrough")
            || (KinkyDungeonFlags.has("Passthrough"))
            || Enemy.Enemy.noblockplayer)));
}
function KDIsInBounds(x, y, pad = 1) {
    return x >= pad && x <= KDMapData.GridWidth - pad - 1 && y >= pad && y <= KDMapData.GridHeight - pad - 1;
}
function KDSprintCost(sprintdata, sprintCost, accountForSlow = false) {
    if (sprintCost != undefined)
        return sprintCost;
    let data = {
        sprintdata: sprintdata,
        sprintCostMult: KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SprintEfficiency")),
        cost: 0,
        boost: 0,
        sprintCostOverride: sprintCost,
    };
    data.cost = (-KDSprintCostBase - KDSprintCostSlowLevel[Math.min(KDSprintCostSlowLevel.length - 1, Math.round(KinkyDungeonSlowLevel))] + ((accountForSlow && KinkyDungeonSlowLevel > 1) ? -KDSprintAdjustSlowed : 0));
    if (KDGameData.MovePoints < 0)
        data.cost -= KDSlowedSprintCost;
    KinkyDungeonSendEvent("calcSprint", data);
    return (data.cost + data.boost) * data.sprintCostMult;
}
function KDSetMapFlag(map, flag) {
    if (!map)
        return;
    if (!map.flags) {
        map.flags = [];
    }
    if (!map.flags.includes(flag)) {
        map.flags.push(flag);
    }
}
function KDUpdateForceOutfit(C) {
    let forceOutfit = "";
    let forceOutfitPri = 0;
    let r = null;
    for (let inv of KinkyDungeonAllRestraintDynamic()) {
        r = KDRestraint(inv.item);
        if (r?.forceOutfit && (r.forceOutfitPriority || r.power) >= forceOutfitPri) {
            forceOutfitPri = r.forceOutfitPriority || r.power;
            forceOutfit = r.forceOutfit;
        }
    }
    if (forceOutfit && KinkyDungeonCurrentDress != forceOutfit) {
        KinkyDungeonSetDress(forceOutfit, forceOutfit, C);
    }
}
function KDGenerateBaseTraffic(width, height) {
    KDMapData.Traffic = [];
    if (typeof width === 'undefined' || typeof height === 'undefined')
        return;
    for (let X = 0; X < height; X++) {
        let row = [];
        for (let Y = 0; Y < width; Y++)
            row.push(5);
        KDMapData.Traffic.push(row);
    }
}
function KDPruneWorld() {
    for (let slot of Object.values(KDWorldMap)) {
        for (let entry of Object.entries(slot.data)) {
            let alt = KDGetAltType(slot.y, entry[1].MapMod, entry[1].RoomType);
            if (alt?.prune || alt?.alwaysRegen) {
                let lostItems = [];
                for (let entry of Object.entries(KDGameData.Containers)) {
                    if (entry[1].location?.mapY == slot.y
                        && entry[1].location?.mapX == slot.x
                        && entry[1].location?.room == entry[0]) {
                        lostItems.push(...Object.values(entry[1].items));
                        delete KDGameData.Containers[entry[0]];
                    }
                }
                for (let item of lostItems) {
                    KDAddLostItemSingle(item.name, 1);
                }
                delete slot.data[entry[0]];
            }
        }
    }
}
function KDEnemyTurnToFace(enemy, x, y) {
    enemy.fx = x;
    enemy.fy = y;
    if (enemy.fx > enemy.x)
        enemy.flip = true;
    else if (enemy.fx < enemy.x)
        enemy.flip = false;
}
function KDTurnToFace(dx, dy) {
    let origx = KinkyDungeonPlayerEntity.facing_x;
    let origy = KinkyDungeonPlayerEntity.facing_y;
    KinkyDungeonPlayerEntity.facing_x = Math.min(1, Math.abs(dx)) * Math.sign(dx);
    KinkyDungeonPlayerEntity.facing_y = Math.min(1, Math.abs(dy)) * Math.sign(dy);
    if (KinkyDungeonPlayerEntity.facing_x || KinkyDungeonPlayerEntity.facing_y) {
        KinkyDungeonPlayerEntity.facing_x_last = KinkyDungeonPlayerEntity.facing_x;
        KinkyDungeonPlayerEntity.facing_y_last = KinkyDungeonPlayerEntity.facing_y;
    }
    return origx != KinkyDungeonPlayerEntity.facing_x || KinkyDungeonPlayerEntity.facing_y != origy;
}
function KDAddRepopQueue(repopdata, data) {
    if (!data.RepopulateQueue)
        data.RepopulateQueue = [];
    data.RepopulateQueue.push(repopdata);
}
function KDRepopQueueGet(data, x, y) {
    if (data.RepopulateQueue?.length > 0) {
        return data.RepopulateQueue.filter((q) => { return q.x == x && q.y == y; });
    }
    return [];
}
function KDUpdateRepopQueue(data, delta) {
    if (data.RepopulateQueue?.length > 0) {
        for (let e of data.RepopulateQueue) {
            e.time -= delta;
        }
        let currentTodo = data.RepopulateQueue.filter((entry) => {
            return entry.time < 0;
        });
        currentTodo = currentTodo.sort((a, b) => {
            return a.time - b.time;
        });
        for (let current of currentTodo) {
            let point = null;
            if (!KinkyDungeonEntityAt(current.x, current.y, false, undefined, undefined, true)) {
                point = {
                    x: current.x,
                    y: current.y,
                };
            }
            else if (current.loose) {
                point = KinkyDungeonGetNearbyPoint(current.x, current.y, true, undefined, false, true);
            }
            if (point) {
                current.entity.x = point.x;
                current.entity.y = point.y;
                current.entity.visual_x = point.x;
                current.entity.visual_y = point.y;
                KDAddEntity(current.entity, false, false, true, data);
                let ind = data.RepopulateQueue.indexOf(current);
                if (ind >= 0)
                    data.RepopulateQueue.splice(ind, 1);
            }
        }
    }
}
function KDTPToSummit(id) {
    let npc = KDGetPersistentNPC(id);
    if (npc) {
        KDMovePersistentNPC(id, {
            mapX: 0,
            mapY: 0,
            room: "Summit",
        });
    }
}
function KDWaitTimeDelayedAction(forceDanger) {
    return ((forceDanger != undefined ? forceDanger : KinkyDungeonInDanger()) ? 250 : 0)
        + 250 * (0.25 + KDAnimSpeed * 0.75);
}
function KDDelayedActionStart() {
    if (KDToggles.AutoWaitDelayed)
        KDAutoWaitDelayed = true;
    if (KDAutoWaitDelayed) {
        let wt = KDWaitTimeDelayedAction();
        KDUpdateWaitTime(wt);
    }
}
function KDTalkToEnemy(Enemy) {
    return (KDIsImprisoned(Enemy)
        || ((!KinkyDungeonAggressive(Enemy) || KDAllied(Enemy))
            && !(Enemy.playWithPlayer && KDCanDom(Enemy))));
}
function KDFastMoveTo(xx, yy) {
    if (KDistChebyshev(xx - KinkyDungeonPlayerEntity.x, yy - KinkyDungeonPlayerEntity.y) > 0.5
        && (KinkyDungeonVisionGet(xx, yy) > 0
            || KinkyDungeonFogGet(xx, yy) > 0
            || KDistChebyshev(KinkyDungeonPlayerEntity.x - xx, KinkyDungeonPlayerEntity.y - yy) < 1.5)) {
        let requireLight = KinkyDungeonVisionGet(xx, yy) > 0;
        let path = KinkyDungeonFindPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, xx, yy, true, false, false, KDToggles.FastMoveDoors ? KinkyDungeonMovableTilesSmartEnemy : KinkyDungeonMovableTilesEnemy, requireLight, false, true, undefined, false, undefined, false, true, KDToggles.FastMovePassable);
        if (path) {
            KDSetFocusControl("");
            KinkyDungeonFastMovePath = path;
            KDUpdateWaitTime(1);
            KinkyDungeonSetFlag("startPath", 1);
            return path.length;
        }
        else if (KDistChebyshev(KinkyDungeonPlayerEntity.x - xx, KinkyDungeonPlayerEntity.y - yy) < 1.5) {
            KDSetFocusControl("");
            KDSendInput("move", { dir: KinkyDungeonMoveDirection, delta: 1, AllowInteract: true, AutoDoor: false, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint });
            return 1;
        }
    }
    return 0;
}
let KDOverrideWaitTimeThreshold = 950;
function KDUpdateWaitTime(delay, force = false, nooverride = false) {
    if (force)
        KinkyDungeonSleepTime = CommonTime() + delay;
    else {
        let ct = CommonTime();
        if (!nooverride && KinkyDungeonSleepTime > ct) {
            let diff = KinkyDungeonSleepTime - ct;
            if (diff < KDOverrideWaitTimeThreshold) {
                KinkyDungeonSleepTime = CommonTime() + delay;
                return;
            }
        }
        KinkyDungeonSleepTime = Math.max(KinkyDungeonSleepTime, CommonTime() + delay);
    }
}
let KDCustomKeyDown = [
    (key) => {
        if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game"
            && key == KinkyDungeonKeySpellPage[0] && KDShowExtraTooltipMaxCycle > 0) {
            KDShowExtraTooltipCycle = (KDShowExtraTooltipCycle + 1) % (KDShowExtraTooltipMaxCycle + 1);
            lastExtraTooltipCycleTimeAuto = CommonTime() + lastExtraTooltipCycleTimeAuto_ManualDelay;
            return true;
        }
        return false;
    },
];
let KDCustomKeyUp = [];
function KDDoMumble(player, cancel) {
    if (!cancel) {
        let plugChance = 0;
        let plugCount = 0;
        let braChance = 0;
        let beltChance = 0;
        let clampChance = 0;
        let clampVChance = 0;
        let gagchance = KinkyDungeonGagMumbleChance;
        for (let inv of KinkyDungeonAllRestraint()) {
            if (KDRestraint(inv) && gagchance + KinkyDungeonGagMumbleChancePerRestraint < KinkyDungeonGagMumbleChancePerRestraintMax)
                gagchance += KinkyDungeonGagMumbleChancePerRestraint;
            if (KDRestraint(inv).plugSize) {
                plugCount += 1;
                if (plugChance + KDRestraint(inv).plugSize * KinkyDungeonPlugThoughChancePerRestraint < KinkyDungeonPlugThoughChancePerRestraintMax) {
                    plugChance += KDRestraint(inv).plugSize * KinkyDungeonPlugThoughChancePerRestraintMax;
                }
            }
            if (KDRestraint(inv).chastitybra) {
                braChance = KinkyDungeonBraMumbleChance;
            }
            if (KDRestraint(inv).chastity) {
                beltChance = KinkyDungeonBeltMumbleChance;
            }
            if (KDRestraint(inv).nipplevibe) {
                clampVChance = KinkyDungeonClampVMumbleChance;
            }
            else if (KDRestraint(inv).nippleclamp) {
                clampChance = KinkyDungeonClampMumbleChance;
            }
        }
        let done = false;
        if (!done && KDRandom() < clampVChance) {
            done = true;
            let msg = "KDRandomText_ClampV";
            let nn = KDNumberOfClampVMsg;
            let gagMsg = Math.floor(KDRandom() * nn);
            msg = msg + gagMsg;
            KinkyDungeonSendTextMessage(3, TextGet(msg), KDVibeTextColor, 4, true);
        }
        if (!done && (KinkyDungeonLastAction == "Move" || KinkyDungeonLastAction == "Struggle") && braChance == 0 && KDRandom() < clampChance) {
            done = true;
            let msg = "KDRandomText_Clamp";
            let nn = KDNumberOfClampMsg;
            let gagMsg = Math.floor(KDRandom() * nn);
            msg = msg + gagMsg;
            KinkyDungeonSendTextMessage(3, TextGet(msg), KDVibeTextColor, 4, true);
        }
        if (!done && plugChance == 0 && KDRandom() < beltChance) {
            done = true;
            let msg = "KDRandomText_Belt";
            let nn = KDNumberOfBeltMsg;
            let gagMsg = Math.floor(KDRandom() * nn);
            msg = msg + gagMsg;
            KinkyDungeonSendTextMessage(3, TextGet(msg), KDVibeTextColor, 4, true);
        }
        if (!done && KDRandom() < braChance) {
            done = true;
            let msg = "KDRandomText_Bra";
            let nn = KDNumberOfBraMsg;
            let gagMsg = Math.floor(KDRandom() * nn);
            msg = msg + gagMsg;
            KinkyDungeonSendTextMessage(3, TextGet(msg), KDVibeTextColor, 4, true);
        }
        if (!done && plugChance > 0) {
            plugChance += KinkyDungeonPlugThoughChance;
            if (KDRandom() < plugChance) {
                gagchance += 0.3;
                let msg = "KDRandomText_Plug" + (plugCount > 1 ? "s" : "");
                let nn = KDNumberOfPlugMsg;
                if ((KinkyDungeonLastAction == "Move" || KinkyDungeonLastAction == "Struggle") && plugChance + KinkyDungeonPlugThoughChancePerRestraint > KinkyDungeonPlugThoughChance + KinkyDungeonPlugThoughChancePerRestraintMax) {
                    nn += 2;
                }
                let gagMsg = Math.floor(KDRandom() * nn);
                msg = msg + gagMsg;
                KinkyDungeonSendTextMessage(0.1, TextGet(msg), KDVibeTextColor, 4, true);
            }
        }
        if (!done && !KinkyDungeonCanTalk() && KDRandom() < gagchance) {
            done = true;
            let msg = "KinkyDungeonGagMumble";
            let gagMsg = Math.floor(KDRandom() * KDNumberOfGagMsg);
            const GagEffect = KinkyDungeonGagTotal() * 5;
            gagMsg += GagEffect;
            gagMsg = Math.max(0, Math.min(7, Math.floor(gagMsg)));
            if (KDRandom() < KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax)
                msg = "KinkyDungeonGagMumbleAroused";
            msg = msg + gagMsg;
            KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet(msg), KDBaseWhite, 2, 0);
            if (KDToggles.GagParticles) {
                KDSendGagParticles(KDPlayer());
            }
        }
    }
}
//# sourceMappingURL=KinkyDungeonGame.js.map