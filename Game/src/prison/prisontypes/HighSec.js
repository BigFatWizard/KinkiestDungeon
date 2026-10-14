"use strict";
let KDJailStripSearchTime = -1;
let KDJailStripSearchTempTime = 50;
function KDShouldStripSearchPlayer(player, allowFlag = false) {
    if (!player.player)
        return false;
    if (KinkyDungeonCheckRelease(-20) >= 0)
        return false;
    if (allowFlag && KinkyDungeonFlags.get("jailStripSearched"))
        return false;
    let maxItemsCheck = 1 + 3 * (1 - KinkyDungeonCalcVisibility(player, 1));
    let maxWeaponsCheck = 1;
    let currentItems = 0;
    for (let c of KinkyDungeonAllConsumable()) {
        if (KDConsumable(c)?.sub)
            continue;
        let inc = 1;
        if (KDConsumable(c)?.sneakChance)
            inc = KDConsumable(c)?.sneakChance;
        if (c.quantity == undefined)
            currentItems += inc;
        else
            currentItems += inc * c.quantity;
    }
    let currentWeapons = KinkyDungeonAllWeapon().filter((w) => {
        return !KDWeapon(w)?.unarmed;
    }).length;
    return currentItems > maxItemsCheck || currentWeapons > maxWeaponsCheck;
}
function KDDoStripSearchRemove(player, guard) {
    if (!KDGameData.CurrentDialog) {
        KDStartDialog("StripSearch", guard.Enemy.name, true, KDGetPersonality(guard), guard);
    }
    return KDPopSubstate(player);
}
KDPrisonTypes.HighSec = {
    name: "HighSec",
    default_state: "Jail",
    starting_state: "Intro",
    update: (delta) => {
        if (KDGameData.PrisonerState != 'parole') {
            KinkyDungeonSetFlag("noPlay", 12);
        }
        let mainFaction = KDGetMainFaction();
        let idleGuard = [];
        for (let en of KDMapData.Entities) {
            if ((en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner)
                && !KDEnemyHasFlag(en, "conveyed_rec")) {
            }
            else if (en.faction == (mainFaction || "Enemy")
                && en.Enemy?.tags.jailer
                && en != KinkyDungeonJailGuard()
                && en != KinkyDungeonLeashingEnemy()
                && !KDEnemyHasFlag(en, "despawn")
                && (en.idle || KDEnemyHasFlag(en, "idleg"))
                && !en.goToDespawn) {
                idleGuard.push(en);
                KinkyDungeonSetEnemyFlag(en, "idleg", 2);
            }
        }
        let idleGuards = [];
        let guardCount = 0;
        for (let en of KDMapData.Entities) {
            if (en.faction == (mainFaction || "Enemy")
                && !en.goToDespawn
                && !(en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner)) {
                if (en != KinkyDungeonJailGuard() && en != KinkyDungeonLeashingEnemy() && (en.idle && !KDEnemyHasFlag(en, "idlegselect")))
                    idleGuards.push(en);
                if (en.Enemy.tags.jailer)
                    guardCount += 1;
            }
        }
        if (guardCount > 6) {
            let max = guardCount * 0.2;
            let despawning = 0;
            for (let en of idleGuards) {
                if (KDEntityHasFlag(en, "despawn")) {
                    despawning++;
                    continue;
                }
                if (KDEntityHasFlag(en, "spawned")) {
                    continue;
                }
                if ((!en.homeCoord) || !KDCompareLocation(en.homeCoord, KDGetCurrentLocation())) {
                    despawning += 1;
                    KinkyDungeonSetEnemyFlag(en, "despawn", 300);
                    KinkyDungeonSetEnemyFlag(en, "wander", 300);
                    KinkyDungeonSetEnemyFlag(en, "vis_despawn", 300);
                    en.gx = KDMapData.EndPosition.x;
                    en.gy = KDMapData.EndPosition.y;
                    en.despawnX = KDMapData.EndPosition.x;
                    en.despawnY = KDMapData.EndPosition.y;
                    en.goToDespawn = true;
                    if (despawning > max)
                        break;
                }
            }
        }
        else if (!KinkyDungeonFlags.get("guardspawn")) {
            if (KinkyDungeonFlags.get("shiftchange")) {
                KinkyDungeonSetFlag("guardspawn", 4);
            }
            else {
                KinkyDungeonSetFlag("guardspawn", 80);
            }
            if (!KinkyDungeonFlags.get("onshift")) {
                if (!KinkyDungeonFlags.get("shiftchange")) {
                    KinkyDungeonSetFlag("shiftchange", 100, -1);
                    KinkyDungeonSetFlag("onshift", 1000, -1);
                }
            }
            if (KDMapData.Labels && KDMapData.Labels.Deploy?.length > 0) {
                let l = KDMapData.Labels.Deploy[Math.floor(KDRandom() * KDMapData.Labels.Deploy.length)];
                let Enemy = KDGetJailEnemy();
                if (Enemy && !KinkyDungeonEnemyAt(KDMapData.EndPosition.x, KDMapData.EndPosition.y)
                    && KDistChebyshev(KDPlayer().x - KDMapData.EndPosition.x, KDPlayer().y - KDMapData.EndPosition.y)
                        > 7) {
                    let en = DialogueCreateEnemy(KDMapData.EndPosition.x, KDMapData.EndPosition.y, Enemy.name);
                    en.AI = "looseguard";
                    en.faction = mainFaction || "Enemy";
                    en.keys = true;
                    en.gxx = l.x;
                    en.gyy = l.y;
                    en.gx = l.x;
                    en.gy = l.y;
                    KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
                    KinkyDungeonSetEnemyFlag(en, "spawned", 300);
                }
            }
        }
    },
    states: {
        Intro: { name: "Intro",
            init: (params) => {
                let mainFaction = KDGetMainFaction();
                if (KDGameData.PrisonerState == "parole" && KDGetEffSecurityLevel() >= 0)
                    KDGameData.PrisonerState = "jail";
                if (KDMapData.Labels && KDMapData.Labels.Deploy) {
                    for (let l of KDMapData.Labels.Deploy) {
                        let Enemy = KDGetJailEnemy();
                        if (Enemy && !KinkyDungeonEnemyAt(l.x, l.y)) {
                            let en = DialogueCreateEnemy(l.x, l.y, Enemy.name);
                            en.AI = "looseguard";
                            en.faction = mainFaction || "Enemy";
                            en.keys = true;
                            KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
                        }
                    }
                }
                if (KDMapData.Labels && KDMapData.Labels.Patrol) {
                    for (let l of KDMapData.Labels.Patrol) {
                        let Enemy = KDGetJailEnemy();
                        if (Enemy && !KinkyDungeonEnemyAt(l.x, l.y)) {
                            let en = DialogueCreateEnemy(l.x, l.y, Enemy.name);
                            en.AI = "hunt";
                            en.faction = mainFaction || "Enemy";
                            en.keys = true;
                            KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
                        }
                    }
                }
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                KDPrisonCommonGuard(player, undefined, false);
                return "Jail";
            },
        },
        Jail: { name: "Jail",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let TheChosenOne = false;
                if (!KinkyDungeonJailGuard())
                    TheChosenOne = true;
                if (!(KDGameData.GuardTimer > 0) && KDGameData.GuardSpawnTimer <= 1)
                    KDPrisonCommonGuard(player, undefined, false);
                if (TheChosenOne && KinkyDungeonJailGuard()?.hp > 0 && KDGameData.PrisonerState == 'jail') {
                    let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, ["jail"]);
                    if (nearestJail) {
                        let xx = nearestJail.x + KinkyDungeonJailLeashX;
                        let yy = nearestJail.y;
                        KDJailEvents.useCurrentGuard.trigger(KinkyDungeonJailGuard(), xx, yy);
                    }
                }
                KinkyDungeonHandleJailSpawns(delta, KDRandom() < 0.9);
                if (KDGameData.PrisonerState == 'parole')
                    return KDSetPrisonState(player, "Jail");
                let lostTrack = KDLostJailTrackCell(player);
                if (lostTrack == "Unaware") {
                    return KDSetPrisonState(player, "Jail");
                }
                if (KDPrisonIsInFurniture(player)) {
                    let lockType = "Red";
                    let uniformCheck = KDPrisonGetGroups(player, undefined, lockType, KDJAILPOWER);
                    if (uniformCheck.itemsToApply.length > 0) {
                        return KDGoToSubState(player, "Uniform");
                    }
                    KinkyDungeonFlags.set("PrisonStorageTimer", (KinkyDungeonFlags.get("PrisonStorageTimer") || 0) + delta * 2);
                    if (!(KinkyDungeonFlags.get("PrisonStorageTimer") > 50)) {
                        return KDCurrentPrisonState(player);
                    }
                }
                if (KDPrisonTick(player) && !KinkyDungeonFlags.get("suspendJailTick")) {
                    if (KDShouldStripSearchPlayer(player, true)) {
                        return "Strip";
                    }
                    if (KDIsPlayerTethered(KDPlayer())) {
                        return "Jail";
                    }
                    if (!KinkyDungeonPlayerInCell()) {
                        let lockType = "Red";
                        let uniformCheck = KDPrisonGetGroups(player, undefined, lockType, KDJAILPOWER);
                        if ((uniformCheck.groupsToStrip.length > 0 && !KinkyDungeonFlags.get("failStrip")) || uniformCheck.itemsToApply.length > 0) {
                            return "Uniform";
                        }
                        return KDGoToSubState(player, "CellTravel");
                    }
                    return "Cell";
                }
                return "Jail";
            },
            updateStack: (delta) => {
                KinkyDungeonSetFlag("noPlay", 10);
            },
        },
        Uniform: { name: "Uniform",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let guard = KDPrisonCommonGuard(player);
                if (KDPrisonIsInFurniture(player)) {
                    let lockType = "Red";
                    let action = "Follow";
                    if (guard.IntentAction != action)
                        KDIntentEvents[action].trigger(guard, {});
                    else
                        guard.playWithPlayer = Math.max(guard.playWithPlayer, 3);
                    let uniformCheck = KDPrisonGetGroups(player, undefined, lockType, KDJAILPOWER);
                    if (uniformCheck.groupsToStrip.length > 0 && !KinkyDungeonFlags.get("failStrip")) {
                        KDGoToSubState(player, "UniformApply");
                        return KDGoToSubState(player, "UniformRemoveExtra");
                    }
                    else if (uniformCheck.itemsToApply.length > 0) {
                        return KDGoToSubState(player, "UniformApply");
                    }
                    return KDPopSubstate(player);
                }
                return KDGoToSubState(player, "UniformTravel");
            },
        },
        UniformRemoveExtra: { name: "UniformRemoveExtra",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let guard = KDPrisonCommonGuard(player);
                if (guard && KDPrisonIsInFurniture(player)) {
                    let action = "Follow";
                    if (guard.IntentAction != action)
                        KDIntentEvents[action].trigger(guard, {});
                    else
                        guard.playWithPlayer = Math.max(guard.playWithPlayer, 3);
                    KinkyDungeonSetEnemyFlag(guard, "overrideMove", 2);
                    if (KDistChebyshev(guard.x - player.x, guard.y - player.y) < 1.5) {
                        if (KDPrisonIsInFurniture(player)) {
                            let lockType = "Red";
                            return KDDoUniformRemove(player, guard, undefined, lockType, KDJAILPOWER);
                        }
                    }
                    else {
                        return KDCurrentPrisonState(player);
                    }
                }
                return KDGoToSubState(player, "UniformTravel");
            },
        },
        UniformApply: { name: "UniformApply",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let guard = KDPrisonCommonGuard(player);
                if (KDPrisonIsInFurniture(player)) {
                    if (guard) {
                        let action = "Follow";
                        if (guard.IntentAction != action)
                            KDIntentEvents[action].trigger(guard, {});
                        else
                            guard.playWithPlayer = Math.max(guard.playWithPlayer, 3);
                        KinkyDungeonSetEnemyFlag(guard, "overrideMove", 2);
                        if (KDistChebyshev(guard.x - player.x, guard.y - player.y) < 1.5) {
                            let lockType = "Red";
                            return KDDoUniformApply(player, guard, undefined, lockType, KDJAILPOWER);
                        }
                    }
                    else {
                        return KDCurrentPrisonState(player);
                    }
                }
                return KDGoToSubState(player, "UniformTravel");
            },
        },
        UniformTravel: { name: "UniformTravel",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let lostTrack = KDLostJailTrack(player);
                if (lostTrack == "Unaware") {
                    return KDSetPrisonState(player, "Jail");
                }
                if (KDPrisonIsInFurniture(player)) {
                    return KDPopSubstate(player);
                }
                let guard = KDPrisonCommonGuard(player);
                if (guard) {
                    let action = (KDGameData.PrisonerState == 'jail' && !KinkyDungeonAggressive(guard, player)) ? "leashFurniture" : "leashFurnitureAggressive";
                    if (guard.IntentAction != action)
                        KDIntentEvents[action].trigger(guard, {});
                    if (lostTrack) {
                        guard.gx = player.x;
                        guard.gy = player.y;
                        KDUpdateMoveToEntity(guard);
                        KinkyDungeonSetEnemyFlag(guard, "wander", 30);
                        KinkyDungeonSetEnemyFlag(guard, "overrideMove", 10);
                    }
                    if (KDGameData.PrisonerState == 'jail') {
                        KinkyDungeonSetEnemyFlag(guard, "notouchie", 2);
                    }
                }
                else {
                    return KDPopSubstate(player);
                }
                return KDCurrentPrisonState(player);
            },
        },
        Strip: { name: "Strip",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let guard = KDPrisonCommonGuard(player);
                KinkyDungeonSetFlag("noWeaponStop", 10);
                if (KinkyDungeonAggressive(guard, player))
                    return KDPopSubstate(player);
                let nearestfurniture = guard ? KinkyDungeonNearestJailPoint(guard.x, guard.y, ["furniture"], undefined, undefined, true, KDGetFurnitureCriteria(player)) : null;
                if (!nearestfurniture || KDPrisonIsInFurniture(player) && !KinkyDungeonFlags.get("jailStripSearched")) {
                    if (!KinkyDungeonFlags.get("stripSearchComplete")) {
                        KinkyDungeonSetFlag("jailStripSearched", KDJailStripSearchTempTime);
                        return KDGoToSubState(player, "StripRemove");
                    }
                }
                if (KDShouldStripSearchPlayer(player, true))
                    return KDGoToSubState(player, "StripTravel");
                if (!KinkyDungeonPlayerInCell()) {
                    return KDGoToSubState(player, "CellTravel");
                }
                return KDPopSubstate(player);
            },
        },
        StripRemove: { name: "StripRemove",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let guard = KDPrisonCommonGuard(player);
                KinkyDungeonSetFlag("noWeaponStop", 10);
                let nearestfurniture = guard ? KinkyDungeonNearestJailPoint(guard.x, guard.y, ["furniture"], undefined, undefined, true, KDGetFurnitureCriteria(player)) : null;
                if (guard && (!nearestfurniture || KDPrisonIsInFurniture(player))) {
                    guard.gx = player.x;
                    guard.gy = player.y;
                    KDUpdateMoveToEntity(guard);
                    KinkyDungeonSetEnemyFlag(guard, "overrideMove", 2);
                    if (KDistChebyshev(guard.x - player.x, guard.y - player.y) < 1.5) {
                        if (!nearestfurniture || KDPrisonIsInFurniture(player)) {
                            KinkyDungeonSetFlag("jailStripSearched", KDJailStripSearchTime);
                            return KDDoStripSearchRemove(player, guard);
                        }
                    }
                    else {
                        return KDCurrentPrisonState(player);
                    }
                }
                return KDPopSubstate(player);
            },
        },
        StripTravel: { name: "StripTravel",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                KinkyDungeonSetFlag("noWeaponStop", 10);
                let lostTrack = KDLostJailTrack(player);
                if (lostTrack == "Unaware") {
                    return KDSetPrisonState(player, "Jail");
                }
                let guard = KDPrisonCommonGuard(player);
                let nearestfurniture = guard ? KinkyDungeonNearestJailPoint(guard.x, guard.y, ["furniture"], undefined, undefined, true, KDGetFurnitureCriteria(player)) : null;
                if (!nearestfurniture || KDPrisonIsInFurniture(player)) {
                    if (guard)
                        KDResetIntent(guard);
                    return KDPopSubstate(player);
                }
                if (guard) {
                    let action = (KDGameData.PrisonerState == 'jail'
                        && !KinkyDungeonAggressive(guard, player))
                        ? "leashFurniture" : "leashFurnitureAggressive";
                    if (!nearestfurniture)
                        if (guard.IntentAction != action)
                            KDIntentEvents[action].trigger(guard, {});
                    if (lostTrack) {
                        guard.gx = player.x;
                        guard.gy = player.y;
                        KDUpdateMoveToEntity(guard);
                        KinkyDungeonSetEnemyFlag(guard, "wander", 30);
                        KinkyDungeonSetEnemyFlag(guard, "overrideMove", 10);
                    }
                    if (KDGameData.PrisonerState == 'jail') {
                        KinkyDungeonSetEnemyFlag(guard, "notouchie", 2);
                    }
                }
                else {
                    return KDPopSubstate(player);
                }
                return KDCurrentPrisonState(player);
            },
        },
        Cell: { name: "Cell",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                if (KDGameData.PrisonerState == 'parole')
                    return KDPopSubstate(player);
                KDPrisonCommonGuard(player, undefined, false);
                if (KDPrisonIsInFurniture(player)) {
                    KinkyDungeonFlags.set("PrisonCellTimer", (KinkyDungeonFlags.get("PrisonCellTimer") || 0) + delta * 2);
                    if (KinkyDungeonFlags.get("PrisonCellTimer") > 300) {
                        KinkyDungeonSetFlag("PrisonCyberTrainingFlag", 10);
                        return KDSetPrisonState(player, "Jail");
                    }
                    return KDCurrentPrisonState(player);
                }
                if (!KinkyDungeonPlayerInCell()) {
                    return KDGoToSubState(player, "CellTravel");
                }
                return KDSetPrisonState(player, "Jail");
            },
        },
        CellTravel: { name: "CellTravel",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let lostTrack = KDLostJailTrack(player);
                if (lostTrack == "Unaware") {
                    return KDSetPrisonState(player, "Jail");
                }
                let jailPointNearest = KinkyDungeonNearestJailPoint(player.x, player.y, ["jail"], undefined, undefined);
                if (!(jailPointNearest && jailPointNearest.x == player.x && jailPointNearest.y == player.y)) {
                    let guard = KDPrisonCommonGuard(player);
                    if (guard) {
                        let action = "leashCell";
                        if (guard.IntentAction != action) {
                            KDIntentEvents[action].trigger(guard, {});
                        }
                        if (lostTrack) {
                            guard.gx = player.x;
                            guard.gy = player.y;
                            KDUpdateMoveToEntity(guard);
                            KinkyDungeonSetEnemyFlag(guard, "wander", 30);
                            KinkyDungeonSetEnemyFlag(guard, "overrideMove", 10);
                        }
                        if (KinkyDungeonLeashingEnemy() == guard) {
                            KinkyDungeonSetEnemyFlag(guard, "focusLeash", 2);
                        }
                        KinkyDungeonSetEnemyFlag(guard, "notouchie", 2);
                    }
                    else {
                        return KDPopSubstate(player);
                    }
                    return KDCurrentPrisonState(player);
                }
                if (KDPrisonIsInFurniture(player)) {
                    return KDPopSubstate(player);
                }
                return KDCurrentPrisonState(player);
            },
        },
    },
};
//# sourceMappingURL=HighSec.js.map