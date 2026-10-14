"use strict";
let KDJourneyMapMod = {
    "Random": true,
};
let KDElevatorHallEnemies = [
    {
        enemy: "EnforcerBot",
        faction: "Virus",
        minfloor: 0,
        maxfloor: 4,
        obstacles: {
            "": 1,
            OldDrone: 0.5,
            RubberTurret: 0.07,
        },
    },
    {
        enemy: "BotMissile",
        faction: "Virus",
        minfloor: 4,
        obstacles: {
            "": 0.4,
            OldDrone: 0.3,
            OldTapeDrone: 0.5,
            RubberTurret: 0.1,
            RubberSilo: 0.05,
        },
    },
    {
        enemy: "BanditChief",
        faction: "Bandit",
        maxfloor: 8,
        obstacles: {
            "": 1.5,
            Bandit: 0.4,
            BanditPet: 0.3,
            BanditHunter: 0.2,
        },
    },
    {
        enemy: "BanditMerchant",
        faction: "Bandit",
        minfloor: 6,
        obstacles: {
            "": 1.0,
            BanditGuard: 0.5,
            BanditPet: 1.0,
            BanditGrappler: 0.3,
        },
    },
    {
        enemy: "Dollmaker",
        faction: "Dollsmith",
        maxfloor: 4,
        obstacles: {
            "DollsmithDoll": 1.5,
            "": 0.4,
            OldDrone: .25,
        },
    },
    {
        enemy: "Dollmaker",
        faction: "Dollsmith",
        minfloor: 4,
        maxfloor: 9,
        obstacles: {
            "DollsmithDoll": 1.0,
            Dollsmith: 0.1,
            OldDrone: 0.25,
            OldTapeDrone: 0.1,
        },
    },
    {
        enemy: "Dollmaker",
        faction: "Dollsmith",
        minfloor: 8,
        obstacles: {
            "DollsmithDoll": 0.75,
            Dollsmith: 0.25,
            Dollmaker: 0.15,
            OldTapeDrone: 0.5,
        },
    },
];
let KDDefaultMaxFlags = {
    goldchest: 1,
    lessergold: 1,
    silverchest: 2,
    darkchest: 2,
    redchest: 6,
    bluechest: 2,
    forbidden: 1,
    artifact: 2,
    jail: 2,
    playroom: 4,
    supplydepot: 1,
    barracks: 2,
    robotroom: 3,
    laboratory: 1,
    library: 1,
    armory: 1,
    workshop: 2,
    tinker: 1,
    office: 3,
    worship: 1,
    graveyard: 2,
    well: 3,
    wildlife: 2,
    range: 2,
    arena: 1,
    arena_boss: 1,
    arena_miniboss: 5,
    slimespawn: 3,
    beastspawn: 3,
    magicspawn: 3,
    robotspawn: 3,
};
let alts = {
    "Tunnel": {
        name: "Tunnel",
        bossroom: false,
        width: 8,
        height: 8,
        genType: "Tunnel",
        skiptunnel: true,
        spawns: false,
        chests: false,
        shrines: false,
        orbs: 0,
        setpieces: {},
        chargers: false,
        notorches: false,
        heart: false,
        specialtiles: true,
        shortcut: false,
        enemies: false,
        nojail: true,
        nolore: true,
        nokeys: true,
        nostairs: true,
        notraps: true,
        noClutter: true,
        noShrineTypes: ["Commerce", "Will"],
        tickFlags: true,
        noMusic: true,
        persist: true,
        prune: true,
    },
    "PerkRoom": {
        tickFlags: true,
        name: "PerkRoom",
        Title: "PerkRoom",
        skin: "shrine", useDefaultMusic: true,
        useGenParams: "tmp",
        lightParams: "ore",
        bossroom: false,
        persist: true,
        prune: true,
        skiptunnel: true,
        alwaysAdvance: true,
        keepRebels: true,
        removePartyMembers: true,
        requireJourneyTarget: true,
        events: [
            { trigger: "tick", type: "PerkRoom" },
        ],
        torchreplace: {
            sprite: "Lantern",
            unlitsprite: "LanternUnlit",
            brightness: 6,
        },
        updatescript: (_delta) => {
            for (let en of KDMapData.Entities) {
                if (en.hp < en.Enemy.maxhp && KDAllied(en)) {
                    en.hp = Math.min(en.Enemy.maxhp, en.hp + 0.5);
                }
            }
        },
        width: 9,
        height: 8,
        genType: "PerkRoom",
        setpieces: {
            "PearlChest": 100,
        },
        spawns: false,
        chests: false,
        shrines: false,
        orbs: 0,
        chargers: false,
        notorches: false,
        heart: false,
        specialtiles: true,
        shortcut: false,
        enemies: false,
        nojail: true,
        nolore: true,
        nokeys: true,
        nostairs: true,
        notraps: true,
        noClutter: true,
        noShrineTypes: ["Commerce", "Will"],
        noMusic: true,
        keepMainPath: true,
    },
    "Jail": {
        name: "Jail",
        persist: true,
        bossroom: false,
        width: 19,
        height: 19,
        enemyMult: 0.6,
        allowJailEntrances: true,
        setpieces: {
            "GuaranteedCell": 100,
            "ExtraCell": 20,
            "Bedroom": 10,
            "QuadCell": 7,
            "Storage": 12,
        },
        bonusTags: {
            "construct": { bonus: 0, mult: 0 },
        },
        loadscript: (_firsttime) => {
            if (_firsttime) {
                for (let en of KDMapData.Entities) {
                    if (!KDIsImprisoned(en)) {
                        KDAddLabel({
                            assigned: en.id,
                            name: "Deploy",
                            type: "Deploy",
                            x: en.x,
                            y: en.y,
                        });
                    }
                }
            }
            return true;
        },
        genCriteria: (iteration) => {
            if (KinkyDungeonNearestJailPoint(10, 10, ["furniture"])) {
                return KDCheckMainPath();
            }
            return false;
        },
        prisonType: "HighSec",
        isPrison: true,
        factionSpawnsRequired: true,
        genType: "NarrowMaze",
        spawns: false,
        chests: false,
        shrines: true,
        orbs: 0,
        chargers: true,
        notorches: false,
        heart: false,
        specialtiles: true,
        shortcut: false,
        enemies: true,
        nojail: false,
        nokeys: true,
        nostairs: false,
        nostartstairs: true,
        notraps: true,
        noRelease: true,
        releaseOnLowSec: true,
        noShrineTypes: ["Commerce"],
    },
    "DollRoom": {
        name: "DollRoom",
        Title: "DollRoom",
        noWear: true,
        bossroom: false,
        width: 15,
        height: 10,
        nopatrols: true,
        alwaysRegen: true,
        setpieces: {},
        data: {
            dollroom: true,
        },
        genType: "DollRoom",
        spawns: false,
        chests: false,
        shrines: false,
        orbs: 0,
        chargers: false,
        notorches: true,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: false,
        nojail: true,
        nokeys: true,
        nostairs: true,
        nostartstairs: true,
        notraps: false,
        noClutter: true,
        nobrick: true,
        nolore: true,
        noboring: true,
    },
    "DollStorage": {
        name: "DollStorage",
        Title: "DollStorage",
        noWear: true,
        bossroom: false,
        width: 30,
        height: 15,
        nopatrols: true,
        alwaysRegen: true,
        prisonType: "DollStorage",
        isPrison: true,
        setpieces: {},
        data: {
            dollstorage: true,
        },
        skin: "vault",
        musicParams: "DollStorage",
        lightParams: "DollStorage",
        useGenParams: "DollStorage",
        genType: "DollStorage",
        spawns: false,
        chests: false,
        shrines: false,
        orbs: 0,
        chargers: false,
        notorches: true,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: false,
        nojail: true,
        nokeys: true,
        nostairs: true,
        nostartstairs: true,
        notraps: true,
        noClutter: true,
        nobrick: true,
        nolore: true,
        noboring: true,
    },
    "DollShoppe": {
        name: "DollShoppe",
        Title: "DollShoppe",
        noWear: true,
        bossroom: false,
        width: 30,
        height: 15,
        nopatrols: true,
        prisonType: "DollShoppe",
        isPrison: true,
        setpieces: {},
        data: {
            dollshoppe: true,
        },
        skin: "shoppe",
        musicParams: "DollShoppe",
        lightParams: "DollShoppe",
        useGenParams: "DollShoppe",
        genType: "DollShoppe",
        spawns: false,
        chests: false,
        shrines: false,
        orbs: 0,
        chargers: false,
        notorches: true,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: false,
        nojail: true,
        nokeys: true,
        nostairs: true,
        nostartstairs: true,
        notraps: true,
        noClutter: true,
        nobrick: true,
        nolore: true,
        noboring: true,
    },
    "Summit": {
        private: true,
        keepItems: true,
        keepPrisoners: true,
        keepRebels: true,
        name: "Summit",
        Title: "Summit",
        noWear: true,
        bossroom: false,
        width: 12,
        height: 12,
        nopatrols: true,
        alwaysRegen: false,
        persist: true,
        prisonType: "Summit",
        setpieces: {},
        data: {
            summit: true,
        },
        elevatorCondition: (_x, _y) => {
            return true;
        },
        loadscript: (_firstTime) => {
            KDTriggerNPCEscape(10);
            return true;
        },
        drawscript: (_delta, CamX, CamY, CamX_offsetVis, CamY_offsetVis) => {
            if (KDToggles.Backgrounds) {
                let totalScale = 1.5;
                let imgwidth = PIXIWidth * totalScale;
                let imgheight = imgwidth * 0.5;
                let xx = PIXIWidth / 2
                    - imgwidth / 2
                    + imgwidth * (0.5 - (KDPlayer().visual_x / KDMapData.GridWidth)) * (totalScale - 1) / totalScale;
                let yy = PIXIHeight / 2
                    - imgheight / 2
                    + imgheight * (0.5 - (KDPlayer().visual_y / KDMapData.GridHeight)) * (totalScale - 1) / totalScale;
                KDDraw(kdcanvas, kdpixisprites, "summitBG", "Backgrounds/Mountain.png", xx, yy, imgwidth, imgheight, undefined, {
                    zIndex: -100,
                });
                kdBGMask.visible = true;
                setTimeout(() => {
                    kdBGMask.visible = KDGameData.RoomType == "Summit" && KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game";
                }, 20);
                kdBGMask.clear();
                kdBGMask.beginFill(0x010203, 1.0);
                kdBGMask.drawRect((-1 - (CamX + CamX_offsetVis)) * KinkyDungeonGridSizeDisplay, (0 - (CamY + CamY_offsetVis)) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay * (1 + KDMapData.GridWidth), KinkyDungeonGridSizeDisplay * (1 + KDMapData.GridHeight));
                kdBGMask.endFill();
            }
        },
        norestock: true,
        skin: "vault",
        musicParams: "Summit",
        lightParams: "Summit",
        useGenParams: "Summit",
        genType: "Summit",
        spawns: false,
        chests: false,
        shrines: false,
        orbs: 0,
        chargers: false,
        notorches: true,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: false,
        nojail: true,
        notraps: true,
        nokeys: true,
        nostairs: true,
        nostartstairs: true,
        noClutter: true,
        nobrick: true,
        nolore: true,
        noboring: true,
    },
    "DemonTransition": {
        name: "DemonTransition",
        Title: "DemonTransition",
        noWear: false,
        bossroom: false,
        alwaysRegen: true,
        width: 15,
        height: 15,
        nopatrols: false,
        onExit: (data) => {
        },
        afterExit: (_data) => {
            let point = KinkyDungeonGetRandomEnemyPoint(false, false);
            if (point) {
                KDCreateEffectTile(point.x, point.y, {
                    name: "Portals/DarkPortal",
                    duration: 5,
                }, 0);
                KinkyDungeonPlayerEntity.x = point.x;
                KinkyDungeonPlayerEntity.y = point.y;
                KinkyDungeonPlayerEntity.visual_x = point.x;
                KinkyDungeonPlayerEntity.visual_y = point.y;
            }
        },
        setpieces: {},
        data: {
            DemonTransition: true,
        },
        genType: "DemonTransition",
        skin: "DemonTransition",
        musicParams: "DemonTransition",
        lightParams: "DemonTransition",
        useGenParams: "DemonTransition",
        spawns: false,
        chests: true,
        shrines: true,
        orbs: 0,
        chargers: true,
        notorches: false,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: false,
        nojail: true,
        nokeys: true,
        nostairs: true,
        nostartstairs: true,
        placeDoors: true,
        notraps: false,
        noClutter: true,
        nobrick: false,
        nolore: true,
        noboring: false,
    },
    "BanditFort": {
        name: "BanditFort",
        Title: "BanditFort",
        noWear: false,
        bossroom: false,
        width: 15,
        height: 15,
        sizeBonus: true,
        nopatrols: false,
        setpieces: {
            "Cache": 10000,
            "Bedroom": 1,
            "Storage": 12,
        },
        data: {
            BanditFort: true,
        },
        placeJailEntrances: true,
        sameFactionJailOnly: true,
        genType: "Maze",
        skin: "shoppe",
        musicParams: "bandit",
        lightParams: "bandit",
        useGenParams: "bandit",
        spawns: true,
        chests: true,
        shrines: false,
        persist: true,
        orbs: 0,
        chargers: true,
        notorches: false,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: true,
        nojail: true,
        nokeys: true,
        nostairs: true,
        factionSpawnsRequired: true,
        placeDoors: true,
        notraps: false,
        noClutter: false,
        nobrick: false,
        nolore: true,
        noboring: false,
    },
    "Caldera": {
        name: "Caldera",
        Title: "Caldera",
        noWear: false,
        bossroom: false,
        width: 21,
        height: 21,
        nopatrols: false,
        setpieces: {
            GuaranteedCell: 100,
        },
        data: {
            Caldera: true,
        },
        loreCheckpoint: "cst",
        genType: "Caldera",
        skin: "cst",
        musicParams: "cst",
        lightParams: "cst",
        useGenParams: "cst",
        brightness: 40,
        spawns: true,
        chests: true,
        shrines: true,
        persist: true,
        orbs: 0,
        chargers: true,
        notorches: false,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: true,
        nojail: false,
        nokeys: true,
        nostairs: true,
        placeDoors: true,
        notraps: false,
        noClutter: false,
        nobrick: false,
        nolore: true,
        noboring: false,
    },
    "ElevatorRoom": {
        name: "ElevatorRoom",
        Title: "ElevatorRoom",
        noWear: false,
        bossroom: false,
        width: 14,
        height: 16,
        nopatrols: false,
        setpieces: {},
        data: {
            ElevatorRoom: true,
        },
        genType: "ElevatorRoom",
        skin: "bel",
        musicParams: "bel",
        lightParams: "bel",
        useGenParams: "bel",
        spawns: false,
        chests: false,
        shrines: false,
        persist: true,
        orbs: 0,
        chargers: false,
        notorches: false,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: false,
        nojail: true,
        nokeys: true,
        nostairs: true,
        placeDoors: false,
        notraps: true,
        noClutter: false,
        nobrick: false,
        nolore: true,
        noboring: false,
        noSetpiece: true,
    },
    "ElevatorEgyptian": {
        name: "ElevatorEgyptian",
        Title: "ElevatorEgyptian",
        noWear: false,
        bossroom: false,
        width: 14,
        height: 16,
        nopatrols: false,
        setpieces: {},
        data: {
            ElevatorRoom: true,
            noHostileDoodad: true,
        },
        elevatorCondition: (_x, _y) => {
            return !KDMapData.Entities.some((enemy) => {
                return !enemy.maxlifetime && (KDHostile(enemy) || KinkyDungeonAggressive(enemy) || enemy.Enemy?.name == "MummyElevator") && (!KDHelpless(enemy) || enemy.Enemy?.name == "MummyElevator");
            });
        },
        updatescript: (_delta) => {
            KinkyDungeonResetFog();
        },
        genType: "ElevatorEgyptian",
        skin: "tmb",
        musicParams: "tmb",
        lightParams: "tmb",
        useGenParams: "tmb",
        spawns: false,
        chests: false,
        shrines: false,
        persist: true,
        orbs: 0,
        chargers: false,
        notorches: false,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: false,
        nojail: true,
        nokeys: true,
        nostairs: true,
        placeDoors: false,
        notraps: true,
        noClutter: true,
        nobrick: false,
        nolore: true,
        noboring: false,
        noSetpiece: true,
    },
    "ElevatorEgyptian2": {
        name: "ElevatorEgyptian2",
        Title: "ElevatorEgyptian",
        noWear: false,
        bossroom: false,
        width: 14,
        height: 16,
        nopatrols: false,
        setpieces: {},
        data: {
            ElevatorRoom: true,
            noHostileDoodad: true,
        },
        elevatorCondition: (_x, _y) => {
            return !KDMapData.Entities.some((enemy) => {
                return !enemy.maxlifetime && (KDHostile(enemy) || KinkyDungeonAggressive(enemy) || enemy.Enemy?.name == "MummyElevator") && (!KDHelpless(enemy) || enemy.Enemy?.name == "MummyElevator");
            });
        },
        updatescript: (_delta) => {
            if (KDRandom() < 0.2) {
                for (let X = 1; X < KDMapData.GridWidth - 1; X++) {
                    for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++) {
                        if (KinkyDungeonMapGet(X, Y) == 'X'
                            && (KDRandom() < 0.8
                                && KinkyDungeonVisionGet(X, Y) < 0.01
                                && Y > KDPlayer().y + 1)) {
                            let xMod = KDRandom() < 0.5 ? -1 : 1;
                            if (KinkyDungeonMapGet(X + xMod, Y) == '0') {
                                KinkyDungeonMapSet(X, Y, '0');
                                KinkyDungeonMapSet(X + xMod, Y, 'X');
                            }
                        }
                    }
                }
            }
            KinkyDungeonResetFog();
        },
        genType: "ElevatorEgyptian2",
        skin: "tmb",
        musicParams: "tmb",
        lightParams: "tmb",
        useGenParams: "tmb",
        spawns: false,
        chests: false,
        shrines: false,
        persist: true,
        orbs: 0,
        chargers: false,
        notorches: false,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: false,
        nojail: true,
        nokeys: true,
        nostairs: true,
        placeDoors: false,
        notraps: true,
        noClutter: true,
        nobrick: false,
        nolore: true,
        noboring: false,
        noSetpiece: true,
    },
    "GoldVault": {
        name: "GoldVault",
        Title: "GoldVault",
        noWear: false,
        bossroom: false,
        width: 14,
        height: 16,
        nopatrols: false,
        setpieces: {},
        data: {
            GoldVault: true,
        },
        genType: "GoldVault",
        skin: "vault",
        musicParams: "vault",
        lightParams: "vault",
        useGenParams: "vault",
        spawns: false,
        chests: false,
        shrines: false,
        persist: true,
        orbs: 0,
        chargers: false,
        notorches: false,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: false,
        nojail: true,
        nokeys: true,
        nostairs: true,
        placeDoors: false,
        notraps: false,
        noClutter: true,
        nobrick: false,
        nolore: true,
        noboring: false,
        noSetpiece: true,
        restricted: true,
        noPersistentPrisoners: true,
    },
    "TestTile": {
        name: "TestTile",
        noWear: true,
        bossroom: false,
        width: 40,
        height: 40,
        alwaysRegen: true,
        setpieces: {},
        genType: "TestTile",
        spawns: false,
        chests: false,
        shrines: false,
        orbs: 0,
        chargers: false,
        notorches: true,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: true,
        nojail: true,
        nokeys: true,
        nostairs: true,
        nostartstairs: true,
        notraps: false,
        noClutter: true,
        nobrick: true,
        nolore: true,
        noboring: true,
    },
    "JourneyFloor": {
        noReverse: true,
        name: "JourneyFloor",
        Title: "JourneyFloor",
        bossroom: false,
        prune: true,
        width: 12,
        height: 8,
        brightness: 5,
        nostartstairs: true,
        skin: "shrine", useDefaultMusic: true,
        lightParams: "ore",
        removePartyMembers: true,
        keepRebels: true,
        torchreplace: {
            sprite: "Lantern",
            unlitsprite: "LanternUnlit",
            brightness: 6,
        },
        setpieces: {},
        genType: "JourneyFloor",
        spawns: false,
        chests: false,
        shrines: false,
        orbs: 0,
        chargers: false,
        notorches: false,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: false,
        nojail: true,
        nokeys: true,
        nolore: true,
        nostairs: true,
        notraps: true,
        noClutter: true,
    },
    "ShopStart": {
        noReverse: true,
        name: "ShopStart",
        Title: "ShopStart",
        skiptunnel: true,
        bossroom: false,
        persist: true,
        width: 10,
        height: 8,
        skin: "shoppe", useDefaultMusic: true,
        lightParams: "grv",
        noPersistentPrisoners: true,
        keepPrisoners: true,
        keepRebels: true,
        torchreplace: {
            sprite: "Lantern",
            unlitsprite: "LanternUnlit",
            brightness: 6,
        },
        noSetpiece: true,
        setpieces: {},
        alwaysRegen: true,
        genType: "ShopStart",
        spawns: false,
        chests: false,
        shrines: false,
        orbs: 0,
        chargers: false,
        notorches: false,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: false,
        nojail: true,
        nokeys: true,
        nolore: true,
        nostairs: true,
        notraps: true,
        noClutter: true,
        noWear: true,
    },
    "Tutorial": {
        name: "Tutorial",
        bossroom: false,
        width: 30,
        height: 7,
        setpieces: {},
        brightness: 5,
        genType: "Tutorial",
        spawns: false,
        chests: false,
        shrines: false,
        orbs: 0,
        chargers: false,
        notorches: false,
        heart: false,
        specialtiles: false,
        shortcut: false,
        enemies: false,
        nojail: true,
        nokeys: true,
        nolore: true,
        nostairs: true,
        notraps: true,
        noClutter: true,
        startatstartpos: true,
        nostartstairs: true,
    },
};
let KDJourneyList = ["Random", "Harder", "Temple", "Explorer", "Doll"];
let KDJourneyListSkin = {
    Random: 'DemonTransition',
    Harder: 'tmb',
    Temple: 'tmp',
    Explorer: 'jng',
    Doll: 'bel',
};
if (param_test)
    KDJourneyList.push("Test");
function KinkyDungeonAltFloor(Type) {
    if (KDPersonalAlt[Type])
        return alts[KDPersonalAlt[Type].RoomType];
    return alts[Type];
}
let KinkyDungeonCreateMapGenType = {
    "Room": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreateRoom(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "JourneyFloor": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreateJourneyFloor(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "ShopStart": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        let slot = KDGetWorldMapLocation(KDCoordToPoint(KDGetCurrentLocation()));
        if (slot?.jx)
            slot.jx = 0;
        KinkyDungeonCreateShopStart(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "ElevatorRoom": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreateElevatorRoom(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "ElevatorEgyptian": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreateElevatorEgyptian(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "ElevatorEgyptian2": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreateElevatorEgyptian2(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "GoldVault": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreateGoldVault(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "TestTile": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreateTestTile(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "Tutorial": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreateTutorial(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "Tunnel": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreateTunnel(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "PerkRoom": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreatePerkRoom(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "Chamber": (POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) => {
        KinkyDungeonCreateMaze(POI, VisitedRooms, width, height, 2, 1.5, 8, data);
    },
    "Maze": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreateMaze(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "Caldera": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreateCaldera(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "TileMaze": (POI, VisitedRooms, width, height, openness, density, hallopenness, data) => {
        KinkyDungeonCreateTileMaze(POI, VisitedRooms, width, height, openness, density, hallopenness, data);
    },
    "NarrowMaze": (POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) => {
        KinkyDungeonCreateMaze(POI, VisitedRooms, width, height, 0, 10, 0, data);
    },
    "DollRoom": (POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) => {
        KinkyDungeonCreateDollRoom(POI, VisitedRooms, width, height, 0, 10, 0, data);
    },
    "DollStorage": (POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) => {
        KinkyDungeonCreateDollStorage(POI, VisitedRooms, width, height, 0, 10, 0, data);
    },
    "DollShoppe": (POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) => {
        KinkyDungeonCreateDollShoppe(POI, VisitedRooms, width, height, 0, 10, 0, data);
    },
    "Summit": (POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) => {
        KinkyDungeonCreateSummit(POI, VisitedRooms, width, height, 0, 10, 0, data);
    },
    "DemonTransition": (POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) => {
        KinkyDungeonCreateDemonTransition(POI, VisitedRooms, width, height, 0, 10, 0, data);
    },
    "Dollmaker": (POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) => {
        KinkyDungeonCreateDollmaker(POI, VisitedRooms, width, height, 0, 10, 0, data);
    },
    "Warden": (POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) => {
        KinkyDungeonCreateWarden(POI, VisitedRooms, width, height, 0, 10, 0, data);
    },
};
function KinkyDungeonCreateMaze(POI, VisitedRooms, width, height, openness, density, hallopenness, data) {
    let Walls = {};
    let WallsList = {};
    let VisitedCells = {};
    if (KDDebug)
        console.log("Created maze with dimensions " + width + "x" + height + ", openness: " + openness + ", density: " + density);
    VisitedCells[VisitedRooms[0].x + "," + VisitedRooms[0].y] = { x: VisitedRooms[0].x, y: VisitedRooms[0].y };
    for (let X = 2; X < width; X += 2)
        for (let Y = 1; Y < height; Y += 2)
            if (KinkyDungeonMapGet(X, Y) == '1') {
                Walls[X + "," + Y] = { x: X, y: Y };
            }
    for (let X = 1; X < width; X += 2)
        for (let Y = 2; Y < height; Y += 2)
            if (KinkyDungeonMapGet(X, Y) == '1') {
                Walls[X + "," + Y] = { x: X, y: Y };
            }
    KinkyDungeonMazeWalls(VisitedRooms[0], Walls, WallsList);
    let WallKeys = Object.keys(WallsList);
    while (WallKeys.length > 0) {
        let I = Math.floor(KDRandom() * WallKeys.length);
        let wall = Walls[WallKeys[I]];
        let unvisitedCell = null;
        if (wall.x % 2 == 0) {
            if (!VisitedCells[(wall.x - 1) + "," + wall.y])
                unvisitedCell = { x: wall.x - 1, y: wall.y };
            if (!VisitedCells[(wall.x + 1) + "," + wall.y]) {
                if (unvisitedCell)
                    unvisitedCell = null;
                else
                    unvisitedCell = { x: wall.x + 1, y: wall.y };
            }
        }
        else {
            if (!VisitedCells[wall.x + "," + (wall.y - 1)])
                unvisitedCell = { x: wall.x, y: wall.y - 1 };
            if (!VisitedCells[wall.x + "," + (wall.y + 1)]) {
                if (unvisitedCell)
                    unvisitedCell = null;
                else
                    unvisitedCell = { x: wall.x, y: wall.y + 1 };
            }
        }
        if (unvisitedCell) {
            delete Walls[wall.x + "," + wall.y];
            KinkyDungeonMapSet(wall.x, wall.y, '0');
            KinkyDungeonMapSet(unvisitedCell.x, unvisitedCell.y, '0');
            VisitedCells[unvisitedCell.x + "," + unvisitedCell.y] = unvisitedCell;
            KinkyDungeonMazeWalls(unvisitedCell, Walls, WallsList);
        }
        delete WallsList[wall.x + "," + wall.y];
        WallKeys = Object.keys(WallsList);
    }
    for (let X = 1; X < KDMapData.GridWidth; X += 1)
        for (let Y = 1; Y < KDMapData.GridWidth; Y += 1) {
            if ((X % 2 == 0 && Y % 2 == 1) || (X % 2 == 1 && Y % 2 == 0)) {
                let size = 1 + Math.ceil(KDRandom() * (openness));
                if (KDRandom() < 0.4 - 0.02 * density * size * size) {
                    let tile = '0';
                    for (let XX = X; XX < X + size; XX++)
                        for (let YY = Y; YY < Y + size; YY++) {
                            if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY)))
                                KinkyDungeonMapSet(XX, YY, tile);
                            VisitedCells[XX + "," + YY] = { x: XX, y: YY };
                            KinkyDungeonMazeWalls({ x: XX, y: YY }, Walls, WallsList);
                            delete Walls[XX + "," + YY];
                        }
                }
            }
        }
    for (let X = 1; X < KDMapData.GridWidth; X += 1)
        for (let Y = 1; Y < KDMapData.GridWidth; Y += 1) {
            let nearwalls = 0;
            for (let XX = X - 1; XX <= X + 1; XX += 1)
                for (let YY = Y - 1; YY <= Y + 1; YY += 1) {
                    if (KinkyDungeonMapGet(XX, YY) == '1') {
                        nearwalls += 1;
                    }
                }
            if (nearwalls == 7) {
                POI.push({ x: X * 2, y: Y * 2, requireTags: ["endpoint"], favor: [], used: false });
            }
        }
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    for (let Y = 2; Y < KDMapData.GridHeight - 1; Y += 1) {
        if (KDRandom() < 0.4 - 0.04 * hallopenness) {
            let row_top = [];
            let row_mid = [];
            let row_bot = [];
            for (let X = 0; X < KDMapData.GridWidth; X++) {
                row_top.push(KinkyDungeonMapGet(X, Y - 1));
                row_mid.push(KinkyDungeonMapGet(X, Y));
                row_bot.push(KinkyDungeonMapGet(X, Y + 1));
            }
            for (let X = 1; X < KDMapData.GridWidth - 1; X++) {
                if (row_mid[X] == '0') {
                    if (row_mid[X - 1] == '0' || row_mid[X + 1] == '0') {
                        if (row_top[X] == '0' && row_bot[X] == '0' && (row_top[X - 1] == '1' || row_bot[X + 1] == '1')) {
                            if (((row_top[X + 1] == '0' && row_bot[X + 1] == '0') || row_mid[X + 1] == '1')
                                && ((row_top[X - 1] == '0' && row_bot[X - 1] == '0') || row_mid[X - 1] == '1')) {
                                KinkyDungeonMapSet(X, Y, 'X');
                                X++;
                            }
                        }
                    }
                }
            }
        }
    }
    for (let X = 2; X < KDMapData.GridWidth - 1; X += 1) {
        if (KDRandom() < 0.4 - 0.04 * hallopenness) {
            let col_top = [];
            let col_mid = [];
            let col_bot = [];
            for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
                col_top.push(KinkyDungeonMapGet(X - 1, Y));
                col_mid.push(KinkyDungeonMapGet(X, Y));
                col_bot.push(KinkyDungeonMapGet(X + 1, Y));
            }
            for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++) {
                if (col_mid[Y] == '0') {
                    if (col_mid[Y - 1] == '0' || col_mid[Y + 1] == '0') {
                        if (col_top[Y] == '0' && col_bot[Y] == '0' && (col_top[Y - 1] == '1' || col_bot[Y + 1] == '1')) {
                            if (((col_top[Y + 1] == '0' && col_bot[Y + 1] == '0') || col_mid[Y + 1] == '1')
                                && ((col_top[Y - 1] == '0' && col_bot[Y - 1] == '0') || col_mid[Y - 1] == '1')) {
                                KinkyDungeonMapSet(X, Y, '1');
                                Y++;
                            }
                        }
                    }
                }
            }
        }
    }
    for (let X = 2; X < KDMapData.GridWidth; X += 2)
        for (let Y = 2; Y < KDMapData.GridWidth; Y += 2) {
            let size = 2 * Math.ceil(KDRandom() * (openness));
            if (KDRandom() < 0.4 - 0.04 * density * size) {
                let tile = '0';
                if (data.params.floodChance > 0 && KDRandom() < data.params.floodChance)
                    tile = 'w';
                for (let XX = X; XX < X + size; XX++)
                    for (let YY = Y; YY < Y + size; YY++) {
                        if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY)))
                            KinkyDungeonMapSet(XX, YY, tile);
                    }
            }
        }
}
function KinkyDungeonCreateCaldera(POI, VisitedRooms, width, height, openness, density, _hallopenness, data) {
    let Walls = {};
    let WallsList = {};
    let VisitedCells = {};
    if (KDDebug)
        console.log("Created maze with dimensions " + width + "x" + height + ", openness: " + openness + ", density: " + density);
    VisitedCells[VisitedRooms[0].x + "," + VisitedRooms[0].y] = { x: VisitedRooms[0].x, y: VisitedRooms[0].y };
    for (let X = 2; X < width; X += 2)
        for (let Y = 1; Y < height; Y += 2)
            if (KinkyDungeonMapGet(X, Y) == '1') {
                Walls[X + "," + Y] = { x: X, y: Y };
            }
    for (let X = 1; X < width; X += 2)
        for (let Y = 2; Y < height; Y += 2)
            if (KinkyDungeonMapGet(X, Y) == '1') {
                Walls[X + "," + Y] = { x: X, y: Y };
            }
    KinkyDungeonMazeWalls(VisitedRooms[0], Walls, WallsList);
    let WallKeys = Object.keys(WallsList);
    while (WallKeys.length > 0) {
        let I = Math.floor(KDRandom() * WallKeys.length);
        let wall = Walls[WallKeys[I]];
        let unvisitedCell = null;
        if (wall.x % 2 == 0) {
            if (!VisitedCells[(wall.x - 1) + "," + wall.y])
                unvisitedCell = { x: wall.x - 1, y: wall.y };
            if (!VisitedCells[(wall.x + 1) + "," + wall.y]) {
                if (unvisitedCell)
                    unvisitedCell = null;
                else
                    unvisitedCell = { x: wall.x + 1, y: wall.y };
            }
        }
        else {
            if (!VisitedCells[wall.x + "," + (wall.y - 1)])
                unvisitedCell = { x: wall.x, y: wall.y - 1 };
            if (!VisitedCells[wall.x + "," + (wall.y + 1)]) {
                if (unvisitedCell)
                    unvisitedCell = null;
                else
                    unvisitedCell = { x: wall.x, y: wall.y + 1 };
            }
        }
        if (unvisitedCell) {
            delete Walls[wall.x + "," + wall.y];
            KinkyDungeonMapSet(wall.x, wall.y, '0');
            KinkyDungeonMapSet(unvisitedCell.x, unvisitedCell.y, '0');
            VisitedCells[unvisitedCell.x + "," + unvisitedCell.y] = unvisitedCell;
            KinkyDungeonMazeWalls(unvisitedCell, Walls, WallsList);
        }
        delete WallsList[wall.x + "," + wall.y];
        WallKeys = Object.keys(WallsList);
    }
    for (let X = 1; X < KDMapData.GridWidth; X += 1)
        for (let Y = 1; Y < KDMapData.GridWidth; Y += 1) {
            if ((X % 2 == 0 && Y % 2 == 1) || (X % 2 == 1 && Y % 2 == 0)) {
                let size = 1 + Math.ceil(KDRandom() * (openness));
                if (KDRandom() < 0.4 - 0.02 * density * size * size) {
                    let tile = '0';
                    for (let XX = X; XX < X + size; XX++)
                        for (let YY = Y; YY < Y + size; YY++) {
                            if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY)))
                                KinkyDungeonMapSet(XX, YY, tile);
                            VisitedCells[XX + "," + YY] = { x: XX, y: YY };
                            KinkyDungeonMazeWalls({ x: XX, y: YY }, Walls, WallsList);
                            delete Walls[XX + "," + YY];
                        }
                }
            }
        }
    for (let X = 1; X < KDMapData.GridWidth; X += 1)
        for (let Y = 1; Y < KDMapData.GridWidth; Y += 1) {
            let nearwalls = 0;
            for (let XX = X - 1; XX <= X + 1; XX += 1)
                for (let YY = Y - 1; YY <= Y + 1; YY += 1) {
                    if (KinkyDungeonMapGet(XX, YY) == '1') {
                        nearwalls += 1;
                    }
                }
            if (nearwalls == 7) {
                POI.push({ x: X * 2, y: Y * 2, requireTags: ["endpoint"], favor: [], used: false });
            }
        }
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    for (let Y = 2; Y < KDMapData.GridHeight - 1; Y += 1) {
        if (KDRandom() < 0.2) {
            let row_top = [];
            let row_mid = [];
            let row_bot = [];
            for (let X = 0; X < KDMapData.GridWidth; X++) {
                row_top.push(KinkyDungeonMapGet(X, Y - 1));
                row_mid.push(KinkyDungeonMapGet(X, Y));
                row_bot.push(KinkyDungeonMapGet(X, Y + 1));
            }
            for (let X = 1; X < KDMapData.GridWidth - 1; X++) {
                if (row_mid[X] == '0') {
                    if (row_mid[X - 1] == '0' || row_mid[X + 1] == '0') {
                        if (row_top[X] == '0' && row_bot[X] == '0' && (row_top[X - 1] == '1' || row_bot[X + 1] == '1')) {
                            if (((row_top[X + 1] == '0' && row_bot[X + 1] == '0') || row_mid[X + 1] == '1')
                                && ((row_top[X - 1] == '0' && row_bot[X - 1] == '0') || row_mid[X - 1] == '1')) {
                                KinkyDungeonMapSet(X, Y, 'X');
                                X++;
                            }
                        }
                    }
                }
            }
        }
    }
    for (let X = 2; X < KDMapData.GridWidth - 1; X += 1) {
        if (KDRandom() < 0.2) {
            let col_top = [];
            let col_mid = [];
            let col_bot = [];
            for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
                col_top.push(KinkyDungeonMapGet(X - 1, Y));
                col_mid.push(KinkyDungeonMapGet(X, Y));
                col_bot.push(KinkyDungeonMapGet(X + 1, Y));
            }
            for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++) {
                if (col_mid[Y] == '0') {
                    if (col_mid[Y - 1] == '0' || col_mid[Y + 1] == '0') {
                        if (col_top[Y] == '0' && col_bot[Y] == '0' && (col_top[Y - 1] == '1' || col_bot[Y + 1] == '1')) {
                            if (((col_top[Y + 1] == '0' && col_bot[Y + 1] == '0') || col_mid[Y + 1] == '1')
                                && ((col_top[Y - 1] == '0' && col_bot[Y - 1] == '0') || col_mid[Y - 1] == '1')) {
                                KinkyDungeonMapSet(X, Y, 'X');
                                Y++;
                            }
                        }
                    }
                }
            }
        }
    }
    for (let X = 2; X < KDMapData.GridWidth; X += 2)
        for (let Y = 2; Y < KDMapData.GridWidth; Y += 2) {
            let size = 2 * Math.ceil(KDRandom() * (openness));
            if (KDRandom() < 0.4 - 0.04 * density * size) {
                let tile = '0';
                if (data.params.floodChance > 0 && KDRandom() < data.params.floodChance)
                    tile = 'w';
                for (let XX = X; XX < X + size; XX++)
                    for (let YY = Y; YY < Y + size; YY++) {
                        if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY)))
                            KinkyDungeonMapSet(XX, YY, tile);
                    }
            }
        }
    for (let X = 2; X < KDMapData.GridWidth; X += 1)
        for (let Y = 2; Y < KDMapData.GridWidth; Y += 1) {
            if (!"14".includes(KinkyDungeonMapGet(X, Y))) {
                let dd = KDistEuclidean(X - KDMapData.GridWidth / 2, Y - KDMapData.GridHeight / 2);
                if (dd < 4) {
                    KinkyDungeonMapSet(X, Y, '0');
                }
                else if (dd < KDMapData.GridWidth / 3) {
                    KinkyDungeonMapSet(X, Y, (dd < KDMapData.GridWidth / 4) ? 'W' : 'w');
                }
            }
        }
    POI.push({ x: KDMapData.GridWidth / 2, y: KDMapData.GridHeight / 2, requireTags: [], favor: ["GuaranteedCell"], used: false });
}
let usePrimmMaze = false;
function KinkyDungeonCreateTileMaze(_POI, VisitedRooms, width, height, openness, density, _hallopenness, data) {
    VisitedRooms = [];
    let Walls = {};
    let WallsList = {};
    let VisitedCells = {};
    console.log("Created maze with dimensions " + width + "x" + height + ", openness: " + openness + ", density: " + density);
    let genPrimmMaze = () => {
        KDMapData.Grid = "";
        for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
            for (let X = 0; X < KDMapData.GridWidth; X++)
                KDMapData.Grid = KDMapData.Grid + '1';
            KDMapData.Grid = KDMapData.Grid + '\n';
        }
        let genParams = KDGetMazeParams(data.params);
        let maze = KDGenMaze(1, 1, { w: width / KDTE_Scale, h: height / KDTE_Scale }, {
            scale: 1,
            endchance: genParams.chance_STOP,
            newest: genParams.newest,
            oldest: genParams.oldest,
            branchchance: 0.02 * openness * genParams.opennessMult,
        }, undefined);
        for (let t of maze) {
            if (KinkyDungeonMapGet(t.x, t.y) == '1')
                KinkyDungeonMapSet(t.x, t.y, '0');
        }
    };
    if (!usePrimmMaze) {
        genPrimmMaze();
    }
    else {
        KinkyDungeonMapSet(1, 1, '0', VisitedRooms);
        VisitedCells[VisitedRooms[0].x + "," + VisitedRooms[0].y] = { x: VisitedRooms[0].x, y: VisitedRooms[0].y };
        for (let X = 2; X < width; X += 2)
            for (let Y = 1; Y < height; Y += 2)
                if (KinkyDungeonMapGet(X, Y) == '1') {
                    Walls[X + "," + Y] = { x: X, y: Y };
                }
        for (let X = 1; X < width; X += 2)
            for (let Y = 2; Y < height; Y += 2)
                if (KinkyDungeonMapGet(X, Y) == '1') {
                    Walls[X + "," + Y] = { x: X, y: Y };
                }
        KinkyDungeonMazeWalls(VisitedRooms[0], Walls, WallsList);
        let WallKeys = Object.keys(WallsList);
        while (WallKeys.length > 0) {
            let I = Math.floor(KDRandom() * WallKeys.length);
            let wall = Walls[WallKeys[I]];
            let unvisitedCell = null;
            if (wall.x % 2 == 0) {
                if (!VisitedCells[(wall.x - 1) + "," + wall.y])
                    unvisitedCell = { x: wall.x - 1, y: wall.y };
                if (!VisitedCells[(wall.x + 1) + "," + wall.y]) {
                    if (unvisitedCell)
                        unvisitedCell = null;
                    else
                        unvisitedCell = { x: wall.x + 1, y: wall.y };
                }
            }
            else {
                if (!VisitedCells[wall.x + "," + (wall.y - 1)])
                    unvisitedCell = { x: wall.x, y: wall.y - 1 };
                if (!VisitedCells[wall.x + "," + (wall.y + 1)]) {
                    if (unvisitedCell)
                        unvisitedCell = null;
                    else
                        unvisitedCell = { x: wall.x, y: wall.y + 1 };
                }
            }
            if (unvisitedCell) {
                delete Walls[wall.x + "," + wall.y];
                KinkyDungeonMapSet(wall.x, wall.y, '0');
                KinkyDungeonMapSet(unvisitedCell.x, unvisitedCell.y, '0');
                VisitedCells[unvisitedCell.x + "," + unvisitedCell.y] = unvisitedCell;
                KinkyDungeonMazeWalls(unvisitedCell, Walls, WallsList);
            }
            delete WallsList[wall.x + "," + wall.y];
            WallKeys = Object.keys(WallsList);
        }
        for (let X = 1; X < KDMapData.GridWidth; X += 1)
            for (let Y = 1; Y < KDMapData.GridWidth; Y += 1) {
                if ((X % 2 == 0 && Y % 2 == 1) || (X % 2 == 1 && Y % 2 == 0)) {
                    let size = 1;
                    if (KDRandom() < 0.4 - 0.02 * density * size * size) {
                        let tile = '0';
                        for (let XX = X; XX < X + size; XX++)
                            for (let YY = Y; YY < Y + size; YY++) {
                                if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY)))
                                    KinkyDungeonMapSet(XX, YY, tile);
                                VisitedCells[XX + "," + YY] = { x: XX, y: YY };
                                KinkyDungeonMazeWalls({ x: XX, y: YY }, Walls, WallsList);
                                delete Walls[XX + "," + YY];
                            }
                    }
                    if (KDRandom() < 0.02 * openness) {
                        let tile = '0';
                        for (let XX = X - 1; XX <= X + 1; XX++)
                            for (let YY = Y; YY <= Y + 1; YY++)
                                if (XX == 0 || YY == 0) {
                                    if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY)))
                                        KinkyDungeonMapSet(XX, YY, tile);
                                    VisitedCells[XX + "," + YY] = { x: XX, y: YY };
                                    KinkyDungeonMazeWalls({ x: XX, y: YY }, Walls, WallsList);
                                    delete Walls[XX + "," + YY];
                                }
                    }
                }
            }
    }
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    let index_w = 0;
    let index_h = 0;
    for (let x = 1; x * 2 < KDMapData.GridWidth; x += 1) {
        index_w += 1;
        index_h = 0;
        for (let y = 1; y * 2 < KDMapData.GridHeight; y += 1) {
            index_h += 1;
        }
    }
    let starty = 1 + Math.floor(KDRandom() * (index_h - 2));
    let endy = 1 + Math.floor(KDRandom() * (index_h - 2));
    let topx = 1 + Math.floor(KDRandom() * (index_w - 2));
    let botx = 1 + Math.floor(KDRandom() * (index_w - 2));
    let startx = 0;
    let topy = 0;
    let endx = index_w - 1;
    let boty = index_h - 1;
    if (!usePrimmMaze) {
        let maxTries = 10000;
        let tries = 0;
        let test = () => {
            if (KinkyDungeonMapGet(1 + startx * 2, 1 + starty * 2) != '0')
                return false;
            if (KinkyDungeonMapGet(1 + endx * 2, 1 + endy * 2) != '0')
                return false;
            if (KinkyDungeonMapGet(1 + topx * 2, 1 + topy * 2) != '0')
                return false;
            if (KinkyDungeonMapGet(1 + botx * 2, 1 + boty * 2) != '0')
                return false;
            return true;
        };
        while (!test() && tries++ < maxTries) {
            genPrimmMaze();
        }
    }
    let requiredAccess = {};
    requiredAccess[(startx + 1) + "," + (starty + 1)] = true;
    requiredAccess[(topx + 1) + "," + (topy + 1)] = true;
    requiredAccess[(endx + 1) + "," + (endy + 1)] = true;
    requiredAccess[(botx + 1) + "," + (boty + 1)] = true;
    let indices = {};
    for (let x = 1; x < KDMapData.GridWidth; x += 2) {
        for (let y = 1; y < KDMapData.GridHeight; y += 2) {
            let index = "";
            if (KinkyDungeonMapGet(x, y - 1) == '0' || ((x - 1) / 2 == startx && (y - 1) / 2 - 1 == starty) || ((y - 1) / 2 == topy && (x - 1) / 2 == topx) || ((x - 1) / 2 == startx && (y - 1) / 2 == starty))
                index = index + "u";
            if (KinkyDungeonMapGet(x, y + 1) == '0' || ((x - 1) / 2 == startx && (y - 1) / 2 + 1 == starty) || ((y - 1) / 2 == boty && (x - 1) / 2 == botx) || ((x - 1) / 2 == startx && (y - 1) / 2 == starty))
                index = index + "d";
            if (KinkyDungeonMapGet(x - 1, y) == '0' || ((x - 1) / 2 - 1 == startx && (y - 1) / 2 == starty) || ((x - 1) / 2 == startx && (y - 1) / 2 == starty))
                index = index + "l";
            if (KinkyDungeonMapGet(x + 1, y) == '0' || ((x - 1) / 2 + 1 == startx && (y - 1) / 2 == starty) || ((x - 1) / 2 == endx && (y - 1) / 2 == endy) || ((x - 1) / 2 == startx && (y - 1) / 2 == starty))
                index = index + "r";
            indices[(1 + (x - 1) / 2) + "," + (1 + (y - 1) / 2)] = index;
        }
    }
    console.log(indices);
    KDMapData.GridWidth = Math.floor(index_w * KDTE_Scale) + 2;
    KDMapData.GridHeight = Math.floor(index_h * KDTE_Scale) + 2;
    KDMapData.StartPosition = { x: 1 + (startx) * KDTE_Scale, y: 4 + (starty) * KDTE_Scale };
    KDMapData.EndPosition = { x: 7 + (endx) * KDTE_Scale, y: 4 + (endy) * KDTE_Scale };
    KDMapData.ShortcutPositions = {};
    if (KDRandom() < 0.5) {
        KDMapData.ShortcutPositions['0'] = { x: 4 + (botx) * KDTE_Scale, y: 7 + (boty) * KDTE_Scale };
        KDMapData.ShortcutPositions['1'] = { x: 4 + (topx) * KDTE_Scale, y: 1 + (topy) * KDTE_Scale };
    }
    else {
        KDMapData.ShortcutPositions['0'] = { x: 4 + (topx) * KDTE_Scale, y: 1 + (topy) * KDTE_Scale };
        KDMapData.ShortcutPositions['1'] = { x: 4 + (botx) * KDTE_Scale, y: 7 + (boty) * KDTE_Scale };
    }
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + '1';
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    let tagModifiers = data.params.tagModifiers ? data.params.tagModifiers : undefined;
    let maxTagFlags = Object.assign({
        chest: data.params.chestcount || 0,
        shrine: data.params.shrinecount || 0,
        charger: data.params.chargercount || 0,
    }, KDDefaultMaxFlags);
    KDMapTilesPopulate(w, h, indices, data, requiredAccess, maxTagFlags, tagModifiers);
    let floodChance = data.params.floodchance || 0;
    for (let X = 2; X < KDMapData.GridWidth; X += 2)
        for (let Y = 2; Y < KDMapData.GridWidth; Y += 2) {
            let size = 2 * Math.ceil(KDRandom() * (openness));
            if (KDRandom() < 0.4 - 0.04 * density * size) {
                if (floodChance > 0 && KDRandom() < floodChance)
                    for (let XX = X; XX < X + size; XX++)
                        for (let YY = Y; YY < Y + size; YY++) {
                            if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY)))
                                KinkyDungeonMapSet(XX, YY, 'w');
                        }
            }
        }
}
function KinkyDungeonCreateRoom(_POI, _VisitedRooms, width, height, _openness, _density, _hallopenness, _data) {
    KinkyDungeonCreateRectangle(0, 0, width, height, true, false, false, false);
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
}
function KinkyDungeonCreateDollStorage(_POI, VisitedRooms, _width, height, _openness, _density, _hallopenness, data) {
    KDMapData.StartPosition = { x: 7 * 4 - 1, y: 7 * 1 + 2 };
    KDMapData.EndPosition = { x: KDMapData.StartPosition.x, y: KDMapData.StartPosition.y };
    VisitedRooms[0].x = 1;
    VisitedRooms[0].y = Math.floor(height / 2);
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KD_PasteTile(KDMapTilesList.DollRoom, 1, 1, data);
    KDMapData.EndPosition = { x: 2, y: 11 };
    KinkyDungeonMapSet(2, 11, 's');
    if (MiniGameKinkyDungeonLevel == 0 && !KinkyDungeonFlags.get("fg")) {
        KinkyDungeonTilesSet("2,11", { RoomType: "JourneyFloor" });
        KinkyDungeonSetFlag("fg", -1);
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
}
function KinkyDungeonCreateDollShoppe(_POI, VisitedRooms, _width, height, _openness, _density, _hallopenness, data) {
    KDMapData.StartPosition = { x: 7 * 4 - 1, y: 7 * 1 + 2 };
    KDMapData.EndPosition = { x: KDMapData.StartPosition.x, y: KDMapData.StartPosition.y };
    VisitedRooms[0].x = 1;
    VisitedRooms[0].y = Math.floor(height / 2);
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KD_PasteTile(KDMapTilesList.DollStorage, 1, 1, data);
    let jailleft = KDRandom() < 0.5;
    let quadrant_1 = CommonRandomItemFromList(null, KDGetMapTileWithTags(jailleft ? "dollshoppe_storage" : "dollshoppe_jail"))?.name;
    let quadrant_2 = CommonRandomItemFromList(null, KDGetMapTileWithTags(jailleft ? "dollshoppe_jail" : "dollshoppe_storage"))?.name;
    let quadrant_3 = CommonRandomItemFromList(null, KDGetMapTileWithTags("dollshoppe_display"))?.name;
    let quadrant_4 = CommonRandomItemFromList(null, KDGetMapTileWithTags("dollshoppe_display"))?.name;
    if (quadrant_1)
        KD_PasteTile(KDMapTilesList[quadrant_1], Math.floor(w) + 1, 2, data);
    if (quadrant_2)
        KD_PasteTile(KDMapTilesList[quadrant_2], 2, 2, data);
    if (quadrant_3)
        KD_PasteTile(KDMapTilesList[quadrant_3], 2, Math.floor(h) + 1, data);
    if (quadrant_4)
        KD_PasteTile(KDMapTilesList[quadrant_4], Math.floor(w) + 1, Math.floor(h) + 1, data);
    let endX = 1 + Math.floor(0.1 + 0.3 * KDRandom() * (KDMapData.GridWidth - 2)) * 2;
    KDMapData.EndPosition = { x: endX, y: 1 };
    KDMapData.StartPosition = { x: KDMapData.EndPosition.x, y: KDMapData.EndPosition.y };
    KinkyDungeonMapSet(endX, 1, 's');
    let toFillin = [];
    for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++) {
        for (let X = 1; X < KDMapData.GridWidth - 1; X++) {
            if (Math.abs(X - endX) > 2) {
                if (KinkyDungeonMapGet(X, Y) == '0' || (X == KDMapData.EndPosition.x && Y == KDMapData.EndPosition.y)) {
                    let found = false;
                    for (let YY = Math.max(1, Y - 3); !found && YY < KDMapData.GridHeight - 1 && YY <= Y + 3; YY++) {
                        for (let XX = Math.max(1, X - 3); !found && XX < KDMapData.GridWidth - 1 && XX <= X + 3; XX++) {
                            if (KinkyDungeonMapGet(XX, YY) != '0'
                                || KDMapData.Labels.BackDoor.some((door) => { return Math.abs(door.x - X) < 2; })
                                || KDMapData.Labels.Deploy.some((door) => { return Math.abs(door.x - X) < 2; })
                                || KDMapData.Labels.Patrol.some((door) => { return Math.abs(door.x - X) < 2; })) {
                                found = true;
                            }
                        }
                    }
                    if (!found) {
                        toFillin.push({ x: X, y: Y });
                    }
                }
            }
        }
    }
    for (let p of toFillin) {
        KinkyDungeonMapSet(p.x, p.y, '1');
    }
    if (MiniGameKinkyDungeonLevel == 0 && !KinkyDungeonFlags.get("fg")) {
        KinkyDungeonTilesSet("2,11", { RoomType: "JourneyFloor" });
        KinkyDungeonSetFlag("fg", -1);
    }
    if (KDMapData.Labels.BackDoor)
        for (let p of KDMapData.Labels.BackDoor) {
            KinkyDungeonMapSetForce(p.x, p.y - 1, 'D');
        }
    if (KDMapData.Labels.Display)
        for (let p of KDMapData.Labels.Display) {
            KDCreateEffectTile(p.x, p.y, {
                name: "Light"
            }, 0);
        }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
}
function KinkyDungeonCreateSummit(_POI, VisitedRooms, _width, _height, _openness, _density, _hallopenness, data) {
    if (!KinkyDungeonFlags.get("1stSummit")) {
        KinkyDungeonSendTextMessage(10, TextGet("KDSummitIntro"), KDBaseWhite, 12, undefined, undefined, undefined, "");
        KinkyDungeonSetFlag("1stSummit", -1);
    }
    KDMapData.StartPosition = { x: 11, y: 20 };
    KDMapData.EndPosition = { x: KDMapData.StartPosition.x, y: KDMapData.StartPosition.y };
    VisitedRooms[0].x = 1;
    VisitedRooms[0].y = 1;
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KD_PasteTile(KDMapTilesList.Summit, 1, 1, data);
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    KinkyDungeonMapSet(KDMapData.StartPosition.x, KDMapData.StartPosition.y + 2, '6');
    KinkyDungeonTilesSet((KDMapData.StartPosition.x) + ',' + (KDMapData.StartPosition.y + 2), {
        Type: "Elevator",
        Overlay: "Elevator",
    });
}
function KinkyDungeonCreateDollRoom(_POI, _VisitedRooms, width, height, _openness, _density, _hallopenness, _data) {
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    width = KDMapData.GridWidth;
    height = KDMapData.GridHeight;
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + '1';
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    let CellWidth = 10;
    let CellHeight = 12;
    let CellX = width / 2 - CellWidth / 2;
    let CellY = height / 2 - CellHeight / 2;
    let cavityStart = 5;
    let cavityEnd = 2;
    KinkyDungeonCreateRectangle(cavityStart, 0, CellX + CellWidth - cavityEnd, height, false, false, false, false);
    KinkyDungeonCreateRectangle(CellX, CellY, CellWidth, CellHeight, true, false, false, true, true, false, true);
    let leftPassages = [];
    for (let i = 0; i < 6; i++) {
        leftPassages.push(1 + Math.ceil(KDRandom() * 2));
    }
    let rightPassages = [];
    for (let i = 0; i < 6; i++) {
        rightPassages.push(2 + Math.ceil(KDRandom() * 3));
    }
    let ii = 0;
    for (let l of leftPassages) {
        KinkyDungeonCreateRectangle(cavityStart - l, 1 + 3 * ii, l, 2, false, false, false, false);
        KinkyDungeonMapSet(cavityStart, 3 + 3 * ii, 'X');
        KinkyDungeonMapSet(cavityStart, 1 + 3 * ii, '2');
        KinkyDungeonMapSet(cavityStart, 2 + 3 * ii, '2');
        ii += 1;
    }
    ii = 0;
    for (let l of rightPassages) {
        KinkyDungeonCreateRectangle(cavityStart - cavityEnd + CellX + CellWidth, 1 + 3 * ii, l, 2, false, false, false, false);
        KinkyDungeonMapSet(cavityStart - cavityEnd + CellX + CellWidth, 3 + 3 * ii, 'X');
        KinkyDungeonMapSet(cavityStart - cavityEnd + CellX + CellWidth, 1 + 3 * ii, '2');
        KinkyDungeonMapSet(cavityStart - cavityEnd + CellX + CellWidth, 2 + 3 * ii, '2');
        ii += 1;
    }
    KinkyDungeonMapSet(CellX + 2 + Math.floor(KDRandom() * (CellWidth - 5)), KDRandom() < 0.5 ? CellY : (CellY + CellHeight - 1), 'g');
    if (KDRandom() < 0.5)
        KinkyDungeonMapSet(CellX + 2 + Math.floor(KDRandom() * (CellWidth - 5)), KDRandom() < 0.5 ? CellY : (CellY + CellHeight - 1), 'g');
    if (KDRandom() < 0.5)
        KinkyDungeonMapSet(CellX, CellY + 2 + Math.floor(KDRandom() * (CellHeight - 5)), 'g');
    if (KDRandom() < 0.5)
        KinkyDungeonMapSet((CellX + CellWidth - 1), CellY + 2 + Math.floor(KDRandom() * (CellHeight - 5)), 'g');
    for (let xx = CellX + 2; xx < CellX + CellWidth; xx += 5) {
        for (let yy = 2; yy < height; yy += 5) {
            if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(xx, yy))) {
                KinkyDungeonMapSet(xx, yy, '0');
                KinkyDungeonTilesSet((xx) + "," + (yy), Object.assign(KinkyDungeonTilesGet((xx) + "," + (yy)) || {}, { Light: 6, Skin: "LightRaysDoll" }));
            }
        }
    }
    let dollCount = 10;
    for (let i = 0; i < dollCount; i++) {
        let XX = CellX + 1 + Math.round(KDRandom() * (CellWidth - 3));
        let YY = CellY + 1 + Math.round(KDRandom() * (CellHeight - 3));
        let entity = KinkyDungeonEntityAt(XX, YY);
        if (entity || (XX == width / 2 && YY == height / 2))
            continue;
        let Enemy = KinkyDungeonGetEnemy(["bellowsDoll"], KDGetEffLevel(), KDCurrIndex(), '0', ["doll", "peaceful"]);
        if (Enemy) {
            let e = DialogueCreateEnemy(XX, YY, Enemy.name);
            if (KDRandom() < 0.33)
                KDTieUpEnemy(e, 15 + Math.floor(45 * KDRandom()), "Tape");
            else if (KDRandom() < 0.32)
                KDTieUpEnemy(e, 15 + Math.floor(45 * KDRandom()), "Slime");
            else if (KDRandom() < 0.34)
                KDTieUpEnemy(e, 15 + Math.floor(45 * KDRandom()), "Metal");
            if (e.boundLevel > 0 && KDRandom() < 0.33)
                e.hp = 0.5;
        }
    }
    KDMapData.JailPoints.push({ x: width / 2, y: height / 2, type: "dropoff", radius: 1 });
    let takenIndex = 0;
    let takenRight = false;
    if (KDRandom() < 0.5) {
        let cavityNum = Math.floor(KDRandom() * leftPassages.length);
        takenIndex = cavityNum;
        KDMapData.EndPosition = { x: cavityStart - leftPassages[cavityNum], y: 1 + 3 * cavityNum };
    }
    else {
        let cavityNum = Math.floor(KDRandom() * rightPassages.length);
        takenIndex = cavityNum;
        takenRight = true;
        KDMapData.EndPosition = { x: cavityStart - cavityEnd + CellX + CellWidth + rightPassages[cavityNum] - 1, y: 1 + 3 * cavityNum };
    }
    if (KDRandom() < 0.5) {
        let cavityNum = Math.floor(KDRandom() * leftPassages.length);
        if (!takenRight && takenIndex == cavityNum) {
            if (cavityNum > 0)
                cavityNum -= 1;
            else
                cavityNum += 1;
        }
        KDMapData.StartPosition = { x: cavityStart - leftPassages[cavityNum], y: 2 + 3 * cavityNum };
    }
    else {
        let cavityNum = Math.floor(KDRandom() * rightPassages.length);
        if (takenRight && takenIndex == cavityNum) {
            if (cavityNum > 0)
                cavityNum -= 1;
            else
                cavityNum += 1;
        }
        KDMapData.StartPosition = { x: cavityStart - cavityEnd + CellX + CellWidth + rightPassages[cavityNum] - 1, y: 2 + 3 * cavityNum };
    }
    let exitGuardTags = ["robot"];
    KinkyDungeonAddTags(exitGuardTags, MiniGameKinkyDungeonLevel);
    if (KDGameData.DollRoomCount > 0)
        exitGuardTags.push("open");
    let robotTags = ["robot"];
    KinkyDungeonAddTags(robotTags, MiniGameKinkyDungeonLevel);
    let eliteTags = ["robot"];
    KinkyDungeonAddTags(eliteTags, MiniGameKinkyDungeonLevel);
    let robotCount = 5 + Math.min(10, KinkyDungeonDifficulty / 10 + MiniGameKinkyDungeonLevel / 3) + 5 * (KDGameData.DollRoomCount || 0);
    for (let i = 0; i < robotCount; i++) {
        let XX = i % 2 == 0 ?
            (cavityStart + Math.round(KDRandom() * (CellX - cavityStart - 1)))
            : (CellX + CellWidth + 1 + Math.round(KDRandom() * (cavityStart - 2 - cavityEnd)));
        let YY = CellY + 1 + Math.round(KDRandom() * (CellHeight - 2));
        let entity = KinkyDungeonEntityAt(XX, YY);
        if (entity || (XX == width / 2 && YY == height / 2))
            continue;
        let Enemy = KinkyDungeonGetEnemy(robotTags, MiniGameKinkyDungeonLevel + 3, KDCurrIndex(), '0', ["robot"], undefined, undefined);
        if (Enemy) {
            let e = DialogueCreateEnemy(XX, YY, Enemy.name);
            e.faction = "Enemy";
        }
    }
    if (KDGameData.DollRoomCount > 1) {
        for (let i = 0; i < 1 + Math.ceil(robotCount * 0.1); i++) {
            let point = KinkyDungeonGetNearbyPoint(KDMapData.EndPosition.x, KDMapData.EndPosition.y);
            let Enemy = KinkyDungeonGetEnemy(eliteTags, MiniGameKinkyDungeonLevel + 4, KDCurrIndex(), '0', ["robot"], undefined, undefined, ["minor", "miniboss", "noguard"]);
            if (Enemy) {
                let e = DialogueCreateEnemy(point.x, point.y, Enemy.name);
                e.faction = "Enemy";
                if (KDCanOverrideAI(e))
                    e.AI = "looseguard";
                else
                    e.AI = KDGetAIOverride(e, 'looseguard');
            }
        }
    }
    let ExitGuard = KinkyDungeonGetEnemy(exitGuardTags, MiniGameKinkyDungeonLevel + 10, KDCurrIndex(), '0', ["robot", "dollRoomBoss"], undefined, undefined, ["noguard"]);
    if (ExitGuard) {
        let e = DialogueCreateEnemy(KDMapData.EndPosition.x, KDMapData.EndPosition.y, ExitGuard.name);
        e.faction = "Enemy";
        e.AI = "verylooseguard";
    }
    KDMapData.PatrolPoints.push({ x: CellX - 2, y: CellY - 2 });
    KDMapData.PatrolPoints.push({ x: CellX - 2, y: CellY + 2 + CellHeight });
    KDMapData.PatrolPoints.push({ x: CellX + 2 + CellWidth, y: CellY + 2 + CellHeight });
    KDMapData.PatrolPoints.push({ x: CellX + 2 + CellWidth, y: CellY - 2 });
    KinkyDungeonMapSet(KDMapData.EndPosition.x, KDMapData.EndPosition.y, 's');
    if (KDGameData.DollRoomCount > 0) {
        KinkyDungeonMapSet(KDMapData.StartPosition.x, KDMapData.StartPosition.y, 'S');
    }
}
function KinkyDungeonCreateDemonTransition(POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) {
    KinkyDungeonCreateMaze(POI, VisitedRooms, width, height, 0, 10, 0, data);
    KinkyDungeonGenNavMap(KDMapData.StartPosition);
    KDMapData.EndPosition = KinkyDungeonGetRandomEnemyPoint(false, false);
    if (!KDMapData.EndPosition) {
        KinkyDungeonCreateMaze(POI, VisitedRooms, width, height, 0, 10, 0, data);
        KinkyDungeonGenNavMap(KDMapData.StartPosition);
    }
    if (!KDMapData.EndPosition) {
        KDMapData.EndPosition = { x: KDMapData.StartPosition.x, y: KDMapData.StartPosition.x };
    }
    KDMapData.StartPosition = KinkyDungeonGetRandomEnemyPointCriteria((x, y) => { return KDistChebyshev(x - KDMapData.EndPosition.x, y - KDMapData.EndPosition.y) > width / 4; }, false, false);
    KinkyDungeonPlayerEntity.x = KDMapData.StartPosition.x;
    KinkyDungeonPlayerEntity.y = KDMapData.StartPosition.y;
    KinkyDungeonMapSet(KDMapData.EndPosition.x, KDMapData.EndPosition.y, 's');
    DialogueCreateEnemy(KDMapData.EndPosition.x, KDMapData.EndPosition.y, "DemonEye");
    let obscount = 20;
    for (let i = 0; i < obscount; i++) {
        let point1 = KinkyDungeonGetRandomEnemyPoint(true, false, undefined, 10, 10);
        if (point1) {
            DialogueCreateEnemy(point1.x, point1.y, "Observer");
        }
    }
    let count = 20;
    for (let i = 0; i < count; i++) {
        let point1 = KinkyDungeonGetRandomEnemyPointCriteria((x, y) => { return KinkyDungeonMapGet(x, y) != 's' && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(x, y)); }, true, false);
        if (point1) {
            KinkyDungeonMapSet(point1.x, point1.y, 's');
            KinkyDungeonTilesSet(point1.x + "," + point1.y, { AltStairAction: "RandomTeleport" });
        }
    }
}
function KinkyDungeonCreateDollmaker(_POI, _VisitedRooms, _width, _height, _openness, _density, _hallopenness, data) {
    KinkyDungeonSetFlag("NoDollRoomBypass", -1, 1);
    KDPlayMusic("UntitledRobot.ogg", undefined, true);
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + '1';
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    let cavitywidth = 21;
    let cavityheight = 21;
    let cavityStart = 2;
    KDMapData.StartPosition = { x: cavityStart, y: 1 + Math.floor(cavityheight / 2) };
    KinkyDungeonCreateRectangle(cavityStart, 0, cavitywidth, cavityheight, false, false, false, false);
    KD_PasteTile(KDMapTilesList.Arena_Dollmaker, cavityStart, 1, data);
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    DialogueCreateEnemy(KDMapData.StartPosition.x + Math.floor(cavityheight / 2), KDMapData.StartPosition.y, "DollmakerBoss1");
    KDStageBossGenerated = true;
    KDMapData.EndPosition = { x: KDMapData.StartPosition.x + cavitywidth, y: KDMapData.StartPosition.y };
    KinkyDungeonMapSet(KDMapData.EndPosition.x, KDMapData.EndPosition.y, 's');
    KinkyDungeonMapSet(KDMapData.StartPosition.x, KDMapData.StartPosition.y, 'S');
    KinkyDungeonTilesSet(KDMapData.StartPosition.x + ',' + KDMapData.StartPosition.y, {
        RoomType: "PerkRoom",
    });
}
function KinkyDungeonCreateWarden(_POI, _VisitedRooms, _width, _height, _openness, _density, _hallopenness, data) {
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + '1';
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    let cavitywidth = 21;
    let cavityheight = 21;
    let cavityStart = 2;
    KDMapData.StartPosition = { x: cavityStart, y: 1 + Math.floor(cavityheight / 2) };
    KinkyDungeonCreateRectangle(cavityStart, 0, cavitywidth, cavityheight, false, false, false, false);
    KD_PasteTile(KDMapTilesList.Arena_Warden, cavityStart, 1, data);
    DialogueCreateEnemy(KDMapData.StartPosition.x + Math.floor(cavityheight / 2), KDMapData.StartPosition.y, "TheWarden1");
    KDStageBossGenerated = true;
    let en = DialogueCreateEnemy(KDMapData.StartPosition.x + Math.floor(cavityheight / 2) - 6, KDMapData.StartPosition.y - 8, "WardenArcher");
    KinkyDungeonSetEnemyFlag(en, "imprisoned", -1);
    en.prisondialogue = "PrisonerJailOther";
    en = DialogueCreateEnemy(KDMapData.StartPosition.x + Math.floor(cavityheight / 2), KDMapData.StartPosition.y - 8, "WardenFighter");
    KinkyDungeonSetEnemyFlag(en, "imprisoned", -1);
    en.prisondialogue = "PrisonerJailOther";
    en = DialogueCreateEnemy(KDMapData.StartPosition.x + Math.floor(cavityheight / 2) + 6, KDMapData.StartPosition.y - 8, "WardenMage");
    KinkyDungeonSetEnemyFlag(en, "imprisoned", -1);
    en.prisondialogue = "PrisonerJailOther";
    KDMapData.EndPosition = { x: KDMapData.StartPosition.x + cavitywidth, y: KDMapData.StartPosition.y };
    KinkyDungeonMapSet(KDMapData.EndPosition.x, KDMapData.EndPosition.y, 's');
    KinkyDungeonMapSet(KDMapData.StartPosition.x, KDMapData.StartPosition.y, 'S');
    KinkyDungeonTilesSet(KDMapData.StartPosition.x + ',' + KDMapData.StartPosition.y, {
        RoomType: "PerkRoom",
    });
}
function KinkyDungeonCreateTunnel(_POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) {
    KinkyDungeonCreateRectangle(0, 0, width, height, true, true, false, false);
    KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y - 1, width - 3, 2, false, false, false, false);
    KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y, width - 2, 1, false, false, false, false);
    let b1 = 3 + Math.floor(KDRandom() * (width - 7));
    let b2 = 4 + Math.floor(KDRandom() * (width - 6));
    let y1 = VisitedRooms[0].y > 4 ? 1 : VisitedRooms[0].y;
    let h1 = VisitedRooms[0].y > 4 ? Math.abs(y1 - VisitedRooms[0].y) : height - VisitedRooms[0].y - 1;
    let y2 = VisitedRooms[0].y < height - 4 ? VisitedRooms[0].y : 1;
    let h2 = VisitedRooms[0].y < height - 4 ? Math.abs(height - 1 - VisitedRooms[0].y) : VisitedRooms[0].y - 1;
    if (Math.abs(b1 - b2) < 2) {
        if (b1 < width - 4)
            b2 = b1 + 2;
        else
            b2 = b1 - 2;
    }
    KinkyDungeonCreateRectangle(b1, y1, 1, h1, false, false, false, false);
    KinkyDungeonCreateRectangle(b2, y2, 1, h2, false, false, false, false);
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    KinkyDungeonMapSet(b1 * 2, VisitedRooms[0].y > 4 ? 2 : height * 2 - 3, 's');
    KinkyDungeonMapSet(b1 * 2 + 1, VisitedRooms[0].y > 4 ? 2 : height * 2 - 3, 'G');
    KDMapData.EndPosition = { x: width * 2 - 2, y: VisitedRooms[0].y * 2 };
    let quests = KDQuestList(3, KDQuests, "Tunnel", "", data);
    for (let q of quests) {
        if (q.npc)
            KinkyDungeonSummonEnemy(KDMapData.StartPosition.x, KDMapData.StartPosition.y, q.npc, 1, 14, true);
    }
}
function KinkyDungeonCreatePerkRoom(POI, VisitedRooms, width, height, _openness, _density, _hallopenness, _data) {
    KinkyDungeonCreateRectangle(0, 0, width, height, true, true, false, false);
    KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y - 1, 2, 2, false, false, false, false);
    KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y, width - 2, 1, false, false, false, false);
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    KinkyDungeonMapSet(VisitedRooms[0].x * 2 + 3, VisitedRooms[0].y * 2 + 1, 'l');
    KinkyDungeonTilesSet("" + (VisitedRooms[0].x * 2 + 3) + "," + (VisitedRooms[0].y * 2 + 1), { Leyline: true, Light: KDLeylineLight, lightColor: KDLeylineLightColor });
    if (KinkyDungeonFlags.get("SpawnMap")) {
        if (KinkyDungeonSpells.filter((spell) => { return spell.name == "ManaPoolUp"; }).length < Math.ceil(MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint))
            KDMapData.GroundItems.push({ x: VisitedRooms[0].x * 2 + 3, y: (VisitedRooms[0].y * 2), name: "LeylineMap" });
        KinkyDungeonSetFlag("SpawnMap", 0);
    }
    KinkyDungeonMapSet(VisitedRooms[0].x * 2 + 3, VisitedRooms[0].y * 2 - 2, 'A');
    KinkyDungeonTilesSet("" + (VisitedRooms[0].x * 2 + 3) + "," + (VisitedRooms[0].y * 2 - 2), { Type: "Shrine", Name: "Commerce" });
    let py = VisitedRooms[0].y * 2 - 2;
    let p1x = VisitedRooms[0].x * 2 + 5;
    KinkyDungeonCreateRectangle(p1x, py, 5, 2, false, false, false, false);
    POI.push({ x: VisitedRooms[0].x * 2 + 7, y: VisitedRooms[0].y * 2, requireTags: [], favor: ["PearlChest"], used: false });
    let perksplaced = 0;
    if (!KinkyDungeonStatsChoice.get("noperks")) {
        let perkCount = 3;
        let perks = {};
        for (let i = 0; i < perkCount; i++) {
            let newperks = KinkyDungeonStatsChoice.get("perksdebuff") ? KDGetRandomPerks(perks, true) : KDGetRandomPerks(perks);
            let bondage = KDGetPerkShrineBondage(newperks);
            let method = "";
            if (newperks.length > 0) {
                KinkyDungeonMapSet(p1x + i * 2, py, 'P');
                KinkyDungeonTilesSet("" + (p1x + i * 2) + "," + (py), { Perks: newperks,
                    Light: 5,
                    lightColor: 0xffff88,
                    Bondage: bondage, Method: method, Type: "PerkOrb" });
                perksplaced += 1;
                for (let p of newperks) {
                    perks[p] = true;
                }
            }
            if (!KDMapData.PerkShrines) {
                KDMapData.PerkShrines = [];
            }
            KDMapData.PerkShrines.push(`${p1x + i * 2},${py}`);
        }
    }
    if (KinkyDungeonLostItems.length > 0 && !KinkyDungeonStatsChoice.get("itemMode"))
        KDChest(VisitedRooms[0].x * 2 + 0, VisitedRooms[0].y * 2 - 2, "lost_items");
    else if (!KinkyDungeonInventoryGet("Default")) {
        KDChest(VisitedRooms[0].x * 2 + 0, VisitedRooms[0].y * 2 - 2, "lost_clothes");
    }
    if (KinkyDungeonFlags.get("1stSummit") && KDFacilityTypes.Warden.prereq()
        && KDGameData.FacilitiesData["Servants_Warden"]?.length > 0) {
        KinkyDungeonMapSet(VisitedRooms[0].x * 2 - 1, VisitedRooms[0].y * 2 - 1, '7');
        KinkyDungeonTilesSet((VisitedRooms[0].x * 2 - 1) + ',' + (VisitedRooms[0].y * 2 - 1), {
            Type: "WardenCourier",
            Overlay: "TiedCourier",
            Light: 2,
            lightColor: 0xfffafa,
        });
    }
    KinkyDungeonMapSet(VisitedRooms[0].x * 2 - 1, VisitedRooms[0].y * 2 - 2, '7');
    KinkyDungeonTilesSet((VisitedRooms[0].x * 2 - 1) + ',' + (VisitedRooms[0].y * 2 - 2), {
        Type: "Storage",
        Container: "PlayerChest",
        ContainerFilters: KDPlayerChestFilters,
        Overlay: "Chests/Robot",
        Light: 2,
        lightColor: 0xbdcfff,
    });
    if (perksplaced > 0 && KinkyDungeonStatsChoice.get("perksmandatory"))
        KinkyDungeonMapSet(width * 2 - 2, VisitedRooms[0].y * 2, 'b');
    else
        KinkyDungeonMapSet(width * 2 - 2, VisitedRooms[0].y * 2, 's');
    KDMapData.EndPosition = { x: width * 2 - 2, y: VisitedRooms[0].y * 2 };
}
function KinkyDungeonCreateJourneyFloor(_POI, VisitedRooms, width, height, _openness, _density, _hallopenness, _data) {
    KDMapData.StartPosition = { x: 2, y: height };
    VisitedRooms[0].x = 1;
    VisitedRooms[0].y = Math.floor(height / 2);
    KinkyDungeonCreateRectangle(0, 0, width, height, true, true, false, false);
    KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y - 1, 2, 2, false, false, false, false);
    KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y, 4, 1, false, false, false, false);
    let b1 = 4;
    KinkyDungeonCreateRectangle(b1, VisitedRooms[0].y - 3, width - b1, 2, false, false, false, false);
    KinkyDungeonCreateRectangle(b1, VisitedRooms[0].y - 3, 1, 3, false, false, false, false);
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    KinkyDungeonMapSet(b1 * 2 + 2, VisitedRooms[0].y * 2, 's');
    KinkyDungeonMapSet(b1 * 2 + 2, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (b1 * 2 + 2) + "," + (VisitedRooms[0].y * 2), { RoomType: "ShopStart", Skin: "TabletSpent", Journey: "" });
    KinkyDungeonTilesSet("" + (b1 * 2 + 2) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "JourneyNone" });
    KDCreateEffectTile(b1 * 2 + 2, VisitedRooms[0].y * 2, {
        name: "Portals/Portal",
        duration: 9999, infinite: true,
    }, 0);
    KinkyDungeonMapSet(VisitedRooms[0].x * 2 + 3, VisitedRooms[0].y * 2 - 2, 'H');
    KinkyDungeonMapSet(VisitedRooms[0].x * 2 + 3, VisitedRooms[0].y * 2 - 1, 'G');
    KinkyDungeonTilesSet("" + (VisitedRooms[0].x * 2 + 3) + "," + (VisitedRooms[0].y * 2 - 2), { RoomType: "Tutorial", Journey: "", Skin: "TabletSpent" });
    KDCreateEffectTile(VisitedRooms[0].x * 2 + 3, VisitedRooms[0].y * 2 - 2, {
        name: "Portals/Portal",
        duration: 9999, infinite: true,
    }, 0);
    KinkyDungeonTilesSet("" + (VisitedRooms[0].x * 2 + 3) + "," + (VisitedRooms[0].y * 2 - 1), { Type: "Ghost", Msg: "JourneyTutorial" });
    KinkyDungeonMapSet(VisitedRooms[0].x * 2 + 3, VisitedRooms[0].y * 2 - 3, 'X');
    KinkyDungeonMapSet(VisitedRooms[0].x * 2 + 0, VisitedRooms[0].y * 2 - 2, 'X');
    KinkyDungeonMapSet(VisitedRooms[0].x * 2 + 0, VisitedRooms[0].y * 2 - 3, 'X');
    KinkyDungeonMapSet(VisitedRooms[0].x * 2 + 2, VisitedRooms[0].y * 2 - 3, '0');
    KinkyDungeonMapSet(VisitedRooms[0].x * 2 + 1, VisitedRooms[0].y * 2 - 3, '0');
    KinkyDungeonTilesSet("" + (VisitedRooms[0].x * 2 + 0) + "," + (VisitedRooms[0].y * 2 - 3), { SkinCode: "Floor", Skin2: "Dummy2" });
    KinkyDungeonTilesSet("" + (VisitedRooms[0].x * 2 + 3) + "," + (VisitedRooms[0].y * 2 - 3), { SkinCode: "Floor", Skin2: "Dummy1" });
    KinkyDungeonTilesSet("" + (VisitedRooms[0].x * 2 + 0) + "," + (VisitedRooms[0].y * 2 - 2), { SkinCode: "Floor", Skin2: "Dummy0" });
    let x = b1 * 2;
    let i = 0;
    while (x < width * 2 - 2) {
        if (KDJourneyList[i]) {
            KinkyDungeonMapSet(x, VisitedRooms[0].y * 2 - 6, 's');
            KinkyDungeonMapSet(x, VisitedRooms[0].y * 2 - 5, 'G');
            KinkyDungeonTilesSet("" + (x) + "," + (VisitedRooms[0].y * 2 - 6), { RoomType: "ShopStart", Skin: "TabletSpent", Journey: KDJourneyList[i] });
            KinkyDungeonTilesSet("" + (x) + "," + (VisitedRooms[0].y * 2 - 5), { Type: "Ghost", Msg: "Journey" + KDJourneyList[i] });
            if (KDJourneyListSkin[KDJourneyList[i]]) {
                KinkyDungeonSkinArea({ skin: KDJourneyListSkin[KDJourneyList[i]] }, x, (VisitedRooms[0].y * 2 - 6), 0.5);
                KinkyDungeonSkinArea({ skin: KDJourneyListSkin[KDJourneyList[i]] }, x + 1, (VisitedRooms[0].y * 2 - 6), 0.5);
                KinkyDungeonSkinArea({ skin: KDJourneyListSkin[KDJourneyList[i]] }, x, (VisitedRooms[0].y * 2 - 7), 0.5);
                KinkyDungeonSkinArea({ skin: KDJourneyListSkin[KDJourneyList[i]] }, x + 1, (VisitedRooms[0].y * 2 - 7), 0.5);
                KinkyDungeonSkinArea({ skin: KDJourneyListSkin[KDJourneyList[i]] }, x, (VisitedRooms[0].y * 2 - 5), 0.5);
                KinkyDungeonSkinArea({ skin: KDJourneyListSkin[KDJourneyList[i]] }, x + 1, (VisitedRooms[0].y * 2 - 5), 0.5);
            }
            KDCreateEffectTile(x, (VisitedRooms[0].y * 2 - 6), {
                name: "Portals/Portal",
                duration: 9999, infinite: true,
            }, 0);
        }
        i++;
        x += 2;
    }
    KDMapData.EndPosition = { x: b1 * 2 + 2, y: VisitedRooms[0].y * 2 };
}
function KinkyDungeonCreateShopStart(_POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) {
    KDMapData.StartPosition = { x: 2, y: height };
    VisitedRooms[0].x = 1;
    VisitedRooms[0].y = Math.floor(height / 2);
    KinkyDungeonCreateRectangle(0, 0, width, height, true, true, false, false);
    KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y - 1, 4, 2, false, false, false, false);
    KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y, 6, 1, false, false, false, false);
    let b1 = 4;
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    KD_PasteTile(KDMapTilesList.ShopStart, KDMapData.StartPosition.x, KDMapData.StartPosition.y - 4, data);
    DialogueCreateEnemy(KDMapData.StartPosition.x + 5, KDMapData.StartPosition.y, "ShopkeeperStart");
    DialogueCreateEnemy(KDMapData.StartPosition.x + 1, KDMapData.StartPosition.y - 3, "BlacksmithQuest").AI = "guard";
    KinkyDungeonMapSet(KDMapData.StartPosition.x + 1, KDMapData.StartPosition.y - 3, '2');
    KinkyDungeonTilesSet((KDMapData.StartPosition.x + 1) + ',' + (KDMapData.StartPosition.y - 3), { OL: true });
    DialogueCreateEnemy(KDMapData.StartPosition.x + 2, KDMapData.StartPosition.y - 3, "ArmorerQuest").AI = "guard";
    KinkyDungeonMapSet(KDMapData.StartPosition.x + 2, KDMapData.StartPosition.y - 3, '2');
    KinkyDungeonTilesSet((KDMapData.StartPosition.x + 2) + ',' + (KDMapData.StartPosition.y - 3), { OL: true });
    DialogueCreateEnemy(KDMapData.StartPosition.x + 3, KDMapData.StartPosition.y - 3, "BowyerQuest").AI = "guard";
    KinkyDungeonMapSet(KDMapData.StartPosition.x + 3, KDMapData.StartPosition.y - 3, '2');
    KinkyDungeonTilesSet((KDMapData.StartPosition.x + 3) + ',' + (KDMapData.StartPosition.y - 3), { OL: true });
    DialogueCreateEnemy(KDMapData.StartPosition.x + 12, KDMapData.StartPosition.y - 3, "ShadyQuest").AI = "guard";
    KinkyDungeonMapSet(KDMapData.StartPosition.x + 12, KDMapData.StartPosition.y - 3, '2');
    KinkyDungeonTilesSet((KDMapData.StartPosition.x + 12) + ',' + (KDMapData.StartPosition.y - 3), { OL: true });
    DialogueCreateEnemy(KDMapData.StartPosition.x + 4, KDMapData.StartPosition.y - 3, "AntiqueQuest").AI = "guard";
    KinkyDungeonMapSet(KDMapData.StartPosition.x + 4, KDMapData.StartPosition.y - 3, '2');
    KinkyDungeonTilesSet((KDMapData.StartPosition.x + 4) + ',' + (KDMapData.StartPosition.y - 3), { OL: true });
    KDGenerateShopVisitors();
    if (KDRandom() < 0.1 * KDGameData.HighestLevel)
        SetpieceSpawnPrisoner(KDMapData.StartPosition.x + 9, KDMapData.StartPosition.y);
    KinkyDungeonMapSet(b1 * 2 - 1, VisitedRooms[0].y * 2 - 4, 's');
    if (MiniGameKinkyDungeonLevel == 0)
        KinkyDungeonTilesSet("" + (b1 * 2 + 7) + "," + (VisitedRooms[0].y * 2), { RoomType: MiniGameKinkyDungeonLevel > 0 ? "" : "JourneyFloor" });
    KDMapData.EndPosition = { x: b1 * 2 - 1, y: VisitedRooms[0].y * 2 - 4 };
}
function KinkyDungeonCreateGoldVault(_POI, VisitedRooms, _width, height, _openness, _density, _hallopenness, data) {
    KDMapData.StartPosition = { x: 15, y: 2 + 7 * 4 };
    KDMapData.EndPosition = { x: KDMapData.StartPosition.x, y: KDMapData.StartPosition.y };
    VisitedRooms[0].x = 1;
    VisitedRooms[0].y = Math.floor(height / 2);
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KD_PasteTile(KDMapTilesList.GoldVault, KDMapData.StartPosition.x - 7 - 3, KDMapData.StartPosition.y - 7 * 3, data);
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
}
function KinkyDungeonCreateElevatorRoom(_POI, VisitedRooms, _width, height, _openness, _density, _hallopenness, data) {
    KDMapData.StartPosition = { x: 15, y: 2 + 7 * 4 };
    KDMapData.EndPosition = { x: KDMapData.StartPosition.x, y: KDMapData.StartPosition.y };
    VisitedRooms[0].x = 1;
    VisitedRooms[0].y = Math.floor(height / 2);
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KD_PasteTile(KDMapTilesList.ElevatorRoom, KDMapData.StartPosition.x - 7 - 3, KDMapData.StartPosition.y - 7 * 4, data);
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    let dlist = KDElevatorHallEnemies.filter((dragon) => {
        return (!dragon.minfloor || MiniGameKinkyDungeonLevel >= dragon.minfloor) && (!dragon.maxfloor || MiniGameKinkyDungeonLevel <= dragon.maxfloor);
    });
    let def = dlist[Math.floor(KDRandom() * dlist.length)];
    let obstacles = {};
    if (def) {
        if (!def.enemy)
            def.enemy = "DragonGirlCrystal";
        let en = DialogueCreateEnemy(15, 2 + 7, def.enemy);
        if (def.obstacles)
            obstacles = def.obstacles;
        if (en) {
            if (def.faction)
                en.faction = def.faction;
            KinkyDungeonSetEnemyFlag(en, "leader", -1);
            KDRunCreationScript(en, KDGetCurrentLocation());
        }
    }
    let obsSlots = [];
    for (let xx = 1; xx < KDMapData.GridWidth - 1; xx++) {
        for (let yy = 1; yy < KDMapData.GridHeight - 2; yy++) {
            if (KinkyDungeonMapGet(xx, yy) == '0'
                && ((KinkyDungeonMapGet(xx - 1, yy) == '0' && KinkyDungeonMapGet(xx, yy - 1) == '0'
                    && KinkyDungeonMapGet(xx + 1, yy) == '1' && KinkyDungeonMapGet(xx, yy + 1) == '1')
                    ||
                        (KinkyDungeonMapGet(xx + 1, yy) == '0' && KinkyDungeonMapGet(xx, yy + 1) == '0'
                            && KinkyDungeonMapGet(xx - 1, yy) == '1' && KinkyDungeonMapGet(xx, yy - 1) == '1')
                    ||
                        (KinkyDungeonMapGet(xx + 1, yy) == '0' && KinkyDungeonMapGet(xx, yy - 1) == '0'
                            && KinkyDungeonMapGet(xx - 1, yy) == '1' && KinkyDungeonMapGet(xx, yy + 1) == '1')
                    ||
                        (KinkyDungeonMapGet(xx + 1, yy) == '0' && KinkyDungeonMapGet(xx, yy - 1) == '0'
                            && KinkyDungeonMapGet(xx - 1, yy) == '1' && KinkyDungeonMapGet(xx, yy + 1) == '1')
                    ||
                        (KinkyDungeonMapGet(xx - 1, yy) == '0' && KinkyDungeonMapGet(xx, yy - 1) == '0'
                            && KinkyDungeonMapGet(xx + 1, yy) == '0' && KinkyDungeonMapGet(xx, yy + 1) == '1')
                    ||
                        (KinkyDungeonMapGet(xx + 1, yy) == '0' && KinkyDungeonMapGet(xx, yy + 1) == '0'
                            && KinkyDungeonMapGet(xx - 1, yy) == '1' && KinkyDungeonMapGet(xx, yy - 1) == '0')
                    ||
                        (KinkyDungeonMapGet(xx + 1, yy) == '1' && KinkyDungeonMapGet(xx, yy - 1) == '0'
                            && KinkyDungeonMapGet(xx - 1, yy) == '0' && KinkyDungeonMapGet(xx, yy + 1) == '0')
                    ||
                        (KinkyDungeonMapGet(xx + 1, yy) == '0' && KinkyDungeonMapGet(xx, yy - 1) == '1'
                            && KinkyDungeonMapGet(xx - 1, yy) == '0' && KinkyDungeonMapGet(xx, yy + 1) == '0')
                    ||
                        (KinkyDungeonMapGet(xx + 1, yy) == '0' && KinkyDungeonMapGet(xx, yy - 1) == '0'
                            && KinkyDungeonMapGet(xx - 1, yy) == '0' && KinkyDungeonMapGet(xx, yy + 1) == '0'))) {
                obsSlots.push({ x: xx, y: yy });
            }
        }
    }
    for (let i = 0; i < obsSlots.length / 8 && obsSlots.length > 0; i++) {
        let index = Math.floor(KDRandom() * obsSlots.length);
        let slot = obsSlots[index];
        obsSlots.splice(index, 1);
        if (!KinkyDungeonEnemyAt(slot.x, slot.y)) {
            let o = KDGetByWeight(obstacles);
            if (o) {
                let en = DialogueCreateEnemy(slot.x, slot.y, o);
                if (def.faction)
                    en.faction = def.faction;
                KDRunCreationScript(en, KDGetCurrentLocation());
            }
        }
    }
    let faceSlots = [];
    for (let xx = 1; xx < KDMapData.GridWidth - 1; xx++) {
        for (let yy = 1; yy < KDMapData.GridHeight - 2; yy++) {
            if (KinkyDungeonMapGet(xx, yy) == '1' && KinkyDungeonMapGet(xx, yy + 1) == '0') {
                faceSlots.push({ x: xx, y: yy });
            }
        }
    }
    for (let i = 0; i < 3 && faceSlots.length > 0; i++) {
        let index = Math.floor(KDRandom() * faceSlots.length);
        let slot = faceSlots[index];
        faceSlots.splice(index, 1);
        KinkyDungeonMapSet(slot.x, slot.y, '6');
        KinkyDungeonTilesSet((slot.x) + ',' + (slot.y), {
            Type: "Oriel",
            Skin: "Viewscreen",
            Light: 4,
            lightColor: 0x99ff99,
        });
    }
    KinkyDungeonMapSet(KDMapData.StartPosition.x, KDMapData.StartPosition.y - 3, '6');
    KinkyDungeonTilesSet((KDMapData.StartPosition.x) + ',' + (KDMapData.StartPosition.y - 3), {
        Type: "Elevator",
        Overlay: "ElevatorDisabled",
    });
    if (!KinkyDungeonFlags.get("tut_elevator")) {
        KinkyDungeonSetFlag("tut_elevator", -1);
        KinkyDungeonSendTextMessage(10, TextGet("KDTut_Elevator"), KDTutorialColor, 10);
    }
}
function KinkyDungeonCreateElevatorEgyptian(_POI, VisitedRooms, _width, height, _openness, _density, _hallopenness, data) {
    KDMapData.StartPosition = { x: 15, y: 2 + 7 * 4 };
    KDMapData.EndPosition = { x: KDMapData.StartPosition.x, y: KDMapData.StartPosition.y };
    VisitedRooms[0].x = 1;
    VisitedRooms[0].y = Math.floor(height / 2);
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KD_PasteTile(KDMapTilesList.ElevatorEgyptian, KDMapData.StartPosition.x - 7 - 3, KDMapData.StartPosition.y - 7 * 4, data);
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    DialogueCreateEnemy(15, 3, "MummyElevator");
    KinkyDungeonMapSet(KDMapData.StartPosition.x, KDMapData.StartPosition.y - 3, '6');
    KinkyDungeonTilesSet((KDMapData.StartPosition.x) + ',' + (KDMapData.StartPosition.y - 3), {
        Type: "Elevator",
        Overlay: "ElevatorDisabled",
    });
    if (!KinkyDungeonFlags.get("tut_elevator")) {
        KinkyDungeonSetFlag("tut_elevator", -1);
        KinkyDungeonSendTextMessage(10, TextGet("KDTut_Elevator"), KDTutorialColor, 10);
    }
}
function KinkyDungeonCreateElevatorEgyptian2(_POI, VisitedRooms, _width, height, _openness, _density, _hallopenness, data) {
    KDMapData.StartPosition = { x: 15, y: 2 + 7 * 4 };
    KDMapData.EndPosition = { x: KDMapData.StartPosition.x, y: KDMapData.StartPosition.y };
    VisitedRooms[0].x = 1;
    VisitedRooms[0].y = Math.floor(height / 2);
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KD_PasteTile(KDMapTilesList.ElevatorEgyptian2, KDMapData.StartPosition.x - 7 - 3, KDMapData.StartPosition.y - 7 * 4, data);
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    DialogueCreateEnemy(15, 3, "MummyElevator");
    KinkyDungeonMapSet(KDMapData.StartPosition.x, KDMapData.StartPosition.y - 3, '6');
    KinkyDungeonTilesSet((KDMapData.StartPosition.x) + ',' + (KDMapData.StartPosition.y - 3), {
        Type: "Elevator",
        Overlay: "ElevatorDisabled",
    });
    if (!KinkyDungeonFlags.get("tut_elevator")) {
        KinkyDungeonSetFlag("tut_elevator", -1);
        KinkyDungeonSendTextMessage(10, TextGet("KDTut_Elevator"), KDTutorialColor, 10);
    }
}
function KinkyDungeonCreateTestTile(_POI, VisitedRooms, width, height, _openness, _density, _hallopenness, data) {
    KDMapData.StartPosition = { x: 2, y: height };
    VisitedRooms[0].x = 1;
    VisitedRooms[0].y = Math.floor(height / 2);
    KinkyDungeonCreateRectangle(0, 0, width, height, false, false, false, false);
    let b1 = 4;
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    KD_PasteTile(KDTileToTest, KDMapData.StartPosition.x + 4, 3, data);
    KDMapData.EndPosition = { x: b1 * 2 + 5, y: VisitedRooms[0].y * 2 };
}
function KinkyDungeonCreateTutorial(_POI, VisitedRooms, width, height, _openness, _density, _hallopenness, _data) {
    KDMapData.StartPosition = { x: 2, y: height };
    VisitedRooms[0].x = 1;
    VisitedRooms[0].y = Math.floor(height / 2);
    KinkyDungeonCreateRectangle(0, 0, width, height, true, true, false, false);
    KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y - 1, 2, 2, false, false, false, false);
    KinkyDungeonCreateRectangle(VisitedRooms[0].x, VisitedRooms[0].y, width, 1, false, false, false, false);
    let KinkyDungeonOldGrid = KDMapData.Grid;
    let w = KDMapData.GridWidth;
    let h = KDMapData.GridHeight;
    KDMapData.GridWidth = Math.floor(KDMapData.GridWidth * 2);
    KDMapData.GridHeight = Math.floor(KDMapData.GridHeight * 2);
    KDMapData.Grid = "";
    for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
        for (let X = 0; X < KDMapData.GridWidth; X++)
            KDMapData.Grid = KDMapData.Grid + KinkyDungeonOldGrid[Math.floor(X * w / KDMapData.GridWidth) + Math.floor(Y * h / KDMapData.GridHeight) * (w + 1)];
        KDMapData.Grid = KDMapData.Grid + '\n';
    }
    KDGenerateBaseTraffic(KDMapData.GridWidth, KDMapData.GridHeight);
    KinkyDungeonMapSet(width * 2 - 2, VisitedRooms[0].y * 2, 's');
    KinkyDungeonMapSet(width * 2 - 2, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (width * 2 - 2) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "TutorialCongrats" });
    KinkyDungeonMapSet(VisitedRooms[0].x + 3, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (VisitedRooms[0].x + 3) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "Tutorial0" });
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + 7, 3, 2, height * 2, false, false, false, false);
    KinkyDungeonMapSet(VisitedRooms[0].x + 7, VisitedRooms[0].y * 2, 'L');
    KinkyDungeonMapSet(VisitedRooms[0].x + 7, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (VisitedRooms[0].x + 7) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Dialogue: "Tutorial1" });
    KinkyDungeonMapSet(VisitedRooms[0].x + 11, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (VisitedRooms[0].x + 11) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "Tutorial2" });
    let xx = 13;
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + xx + 4, 3, 2, 2, false, false, false, false);
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + xx + 4, 3, 1, 5, false, false, false, false);
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx + 4, 5, 'd');
    KinkyDungeonTilesSet((KDMapData.StartPosition.x + xx + 4) + "," + 5, {
        Type: "Door",
    });
    KDMapData.GroundItems.push({ x: KDMapData.StartPosition.x + xx + 4, y: 4, name: "PotionWill" });
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + xx, 3, 2, 2, false, false, false, false);
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + xx, 3, 1, 5, false, false, false, false);
    KDMapData.GroundItems.push({ x: KDMapData.StartPosition.x + xx, y: 4, name: "PotionWill" });
    KinkyDungeonMapSet(VisitedRooms[0].x + xx + 1, 5, 'T');
    KinkyDungeonTilesSet((VisitedRooms[0].x + xx + 1) + "," + 5, {
        Type: "Trap",
        Trap: "SpecificSpell",
        noVary: true,
        Spell: "TrapSCloud",
    });
    KinkyDungeonMapSet(VisitedRooms[0].x + xx + 3, VisitedRooms[0].y * 2, 'T');
    KinkyDungeonTilesSet((VisitedRooms[0].x + xx + 3) + "," + (VisitedRooms[0].y * 2), {
        Type: "Trap",
        Trap: "SpecificSpell",
        noVary: true,
        Spell: "TrapSCloud",
    });
    KinkyDungeonMapSet(VisitedRooms[0].x + xx + 3, VisitedRooms[0].y * 2 + 1, 'T');
    KinkyDungeonTilesSet((VisitedRooms[0].x + xx + 3) + "," + (VisitedRooms[0].y * 2 + 1), {
        Type: "Trap",
        Trap: "SpecificSpell",
        noVary: true,
        Spell: "TrapSCloud",
    });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx - 1, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx - 1) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "Tutorial2_sp1" });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx + 1, 3, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx + 1) + "," + (3), { Type: "Ghost", Msg: "Tutorial2_sp2" });
    KinkyDungeonMapSet(VisitedRooms[0].x + xx + 4, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (VisitedRooms[0].x + xx + 4) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "Tutorial2_sp3" });
    xx = 22;
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + xx, 3, 2, 2, false, false, false, false);
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + xx, 3, 1, 5, false, false, false, false);
    KDMapData.GroundItems.push({ x: KDMapData.StartPosition.x + xx, y: 4, name: "PotionMana" });
    KinkyDungeonMapSet(VisitedRooms[0].x + xx + 1, 5, 'd');
    KinkyDungeonTilesSet((VisitedRooms[0].x + xx + 1) + "," + 5, {
        Type: "Door",
    });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx - 5, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx - 5) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "Tutorial2_mp1" });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx - 3, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx - 3) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "Tutorial2_mp2" });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx - 1, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx - 1) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Dialogue: "Tutorial2_mp3" });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx + 2, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx + 2) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "Tutorial2_mp4" });
    xx = 28;
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + xx, 3, 7, 2, false, false, false, false);
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + xx, 3, 1, 5, false, false, false, false);
    KDMapData.GroundItems.push({ x: KDMapData.StartPosition.x + xx, y: 4, name: "PotionFrigid" });
    KinkyDungeonMapSet(VisitedRooms[0].x + xx + 1, 5, 'T');
    KinkyDungeonTilesSet((VisitedRooms[0].x + xx + 1) + "," + 5, {
        Type: "Trap",
        Trap: "SpecificSpell",
        noVary: true,
        Spell: "TrapLustCloud",
    });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx - 1, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx - 1) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "Tutorial2_dp1" });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx + 1, 3, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx + 1) + "," + (3), { Type: "Ghost", Dialogue: "Tutorial2_dp2" });
    xx = 36;
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + xx, 3, 5, 2, false, false, false, false);
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + xx, 3, 1, 5, false, false, false, false);
    KDMapData.GroundItems.push({ x: KDMapData.StartPosition.x + xx + 4, y: 4, name: "RedKey" });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx - 1, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx - 1) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "Tutorial3_1" });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx + 4, 3, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx + 4) + "," + (3), { Type: "Ghost", Msg: "Tutorial3_2" });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx + 1, 3, 'C');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx + 1) + "," + (3), { Loot: "tutorial1", Roll: KDRandom() });
    xx = 43;
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + xx, 3, 5, 2, false, false, false, false);
    KinkyDungeonCreateRectangle(KDMapData.StartPosition.x + xx, 3, 1, 5, false, false, false, false);
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx + 4, 4, '?');
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx - 1, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx - 1) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "Tutorial3_3" });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx + 4, 3, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx + 4) + "," + (3), { Type: "Ghost", Msg: "Tutorial3_4" });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx, 3, 'C');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx) + "," + (3), { Loot: "tutorial2", Roll: KDRandom() });
    KinkyDungeonMapSet(KDMapData.StartPosition.x + xx + 4, VisitedRooms[0].y * 2 + 1, 'G');
    KinkyDungeonTilesSet("" + (KDMapData.StartPosition.x + xx + 4) + "," + (VisitedRooms[0].y * 2 + 1), { Type: "Ghost", Msg: "Tutorial4" });
    DialogueCreateEnemy(width * 2 - 7, VisitedRooms[0].y * 2, "FastZombie").AI = "guard";
    DialogueCreateEnemy(width * 2 - 5, VisitedRooms[0].y * 2 + 1, "FastZombie").AI = "guard";
    DialogueCreateEnemy(width * 2 - 3, VisitedRooms[0].y * 2, "FastZombie").AI = "guard";
    DialogueCreateEnemy(width * 2 - 3, VisitedRooms[0].y * 2 + 1, "BlindZombie").AI = "guard";
    KinkyDungeonMapSet(width * 2 - 5, VisitedRooms[0].y * 2, 'C');
    KinkyDungeonTilesSet("" + (width * 2 - 5) + "," + (VisitedRooms[0].y * 2), { Loot: "silver", Roll: KDRandom() });
    KinkyDungeonMapSet(width * 2 - 6, VisitedRooms[0].y * 2, 'C');
    KinkyDungeonTilesSet("" + (width * 2 - 6) + "," + (VisitedRooms[0].y * 2), { Loot: "chest", Roll: KDRandom() });
    KDMapData.EndPosition = { x: width * 2 - 2, y: VisitedRooms[0].y * 2 };
    KinkyDungeonTilesSet("" + (width * 2 - 2) + "," + (VisitedRooms[0].y * 2), { RoomType: "ShopStart" });
}
function KDGenerateShopVisitors() {
    let options = KDEnumerateShopVisitors();
    if (Object.values(options).length > 0) {
        let chosen = KDGetByWeight(options);
        DialogueCreateEnemy(KDMapData.StartPosition.x + 2, KDMapData.StartPosition.y, chosen);
    }
}
function KDEnumerateShopVisitors() {
    let options = {};
    if (KDCountMasterworks(KDPlayer(), true) > 0) {
        options.AdaLovelock = 100;
    }
    return options;
}
//# sourceMappingURL=KinkyDungeonAlt.js.map