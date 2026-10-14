"use strict";
KDPrisonTypes.DollShoppe = {
    name: "DollShoppe",
    default_state: "Jail",
    starting_state: "Intro",
    update: (delta) => {
        if (KDGameData.PrisonerState != 'parole') {
            KinkyDungeonSetFlag("noPlay", 12);
        }
        let admirers = [];
        let idleadmirers = [];
        let idleDoll = [];
        let punishDoll = [];
        let idleGuard = [];
        let dollCount = 0;
        for (let en of KDMapData.Entities) {
            if ((en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner) && !KDEnemyHasFlag(en, "conveyed_rec")) {
                dollCount++;
                if (!KDEnemyHasFlag(en, "punished")) {
                    punishDoll.push(en);
                    KinkyDungeonSetEnemyFlag(en, "punishdoll", 9999);
                }
                else
                    idleDoll.push(en);
            }
            else if (en.faction == "Enemy" && en.Enemy?.tags.jailer && en != KinkyDungeonJailGuard() && en != KinkyDungeonLeashingEnemy()
                && !KDEnemyHasFlag(en, "despawn")
                && (en.idle || KDEnemyHasFlag(en, "idleg"))) {
                idleGuard.push(en);
                KinkyDungeonSetEnemyFlag(en, "idleg", 2);
            }
            else if (en.faction == "Adventurer" && en != KinkyDungeonJailGuard() && en != KinkyDungeonLeashingEnemy() && !KDEnemyHasFlag(en, "despawn")) {
                admirers.push(en);
                if (!KDEnemyHasFlag(en, "admiring"))
                    idleadmirers.push(en);
                KinkyDungeonSetEnemyFlag(en, "admirer", 30);
            }
        }
        for (let doll of idleDoll) {
            let gg = null;
            let dist = 11;
            if (KDEnemyHasFlag(doll, "punished")) {
                let storage = KinkyDungeonNearestJailPoint(doll.x, doll.y, ["display"], undefined, undefined);
                if (doll.x == storage?.x && doll.y == storage?.y) {
                    continue;
                }
            }
            for (let guard of idleGuard) {
                if (!KDEnemyHasFlag(guard, "idlegselect") && KDistChebyshev(guard.x - doll.x, guard.y - doll.y) < dist) {
                    gg = guard;
                    dist = KDistChebyshev(guard.x - doll.x, guard.y - doll.y);
                }
            }
            if (gg) {
                if (dist < 1.5) {
                    if (punishDoll.length < 20 && !KDEnemyHasFlag(doll, "punished")) {
                        KinkyDungeonSetEnemyFlag(doll, "punishdoll", 9999);
                        KinkyDungeonSetEnemyFlag(doll, "punished", Math.floor(KDRandom() * 500) + 200);
                        KinkyDungeonSetEnemyFlag(doll, "tryNotToSwap", 9999);
                        punishDoll.push(doll);
                    }
                    else {
                        KinkyDungeonSetEnemyFlag(gg, "leadawayselect", 2);
                        KinkyDungeonSetEnemyFlag(doll, "leadAway", 9999);
                        KinkyDungeonSetEnemyFlag(doll, "tryNotToSwap", 0);
                    }
                }
                else {
                    KinkyDungeonSetEnemyFlag(gg, "idlegselect", 2);
                    KinkyDungeonSetEnemyFlag(gg, "overrideMove", 10);
                    gg.gx = doll.x;
                    gg.gy = doll.y;
                    KDUpdateMoveToEntity(gg);
                }
            }
        }
        let deleteDoll = [];
        for (let en of KDMapData.Entities) {
            if (KDEnemyHasFlag(en, "leadAway")) {
                deleteDoll.push(en);
            }
        }
        for (let doll of deleteDoll) {
            let gg = null;
            let storage = KDGetNearestLabel(doll.x, doll.y, "BackDoor");
            if (doll.x == storage?.x && doll.y == storage?.y) {
                doll.hp = 0;
                continue;
            }
            let dist = 11;
            let canLeash = (guard, dd) => {
                return guard?.Enemy && (!KDEnemyHasFlag(guard, "idlegselect") || !KDEnemyHasFlag(guard, "leadawayselect")) && KDistChebyshev(guard.x - doll.x, guard.y - doll.y) < dd;
            };
            if (doll.leash?.entity && KDLookupID(doll.leash.entity)?.Enemy && idleGuard.some((entity) => { return entity.id == doll.leash.entity; })) {
                gg = KDLookupID(doll.leash.entity);
                dist = KDistChebyshev(gg.x - doll.x, gg.y - doll.y);
            }
            else {
                if (doll.leash?.reason == "DollLeash") {
                    KDBreakTether(doll);
                }
                for (let guard of idleGuard) {
                    if (canLeash(guard, dist)) {
                        gg = guard;
                        dist = KDistChebyshev(guard.x - doll.x, guard.y - doll.y);
                    }
                }
            }
            if (gg) {
                if (dist < 2.5 || doll.leash?.entity == gg.id) {
                    if (storage) {
                        if (dist < 1.5 && KDistChebyshev(gg.x - storage.x, gg.y - storage.y) < 1.5) {
                            doll.hp = 0;
                        }
                        else {
                            KinkyDungeonSetEnemyFlag(gg, "idlegselect", 2);
                            KinkyDungeonSetEnemyFlag(gg, "overrideMove", 10);
                            KinkyDungeonSetEnemyFlag(gg, "leashPrisoner", 3);
                            KinkyDungeonAttachTetherToEntity(1.5, gg, doll, "DollLeash", KDBasePink, 6);
                            gg.gx = storage.x;
                            gg.gy = storage.y;
                            if (dist > 1.5) {
                                let path = KinkyDungeonFindPath(doll.x, doll.y, gg.x, gg.y, true, true, false, KinkyDungeonMovableTilesEnemy, false, false, false);
                                if (path && path.length > 0) {
                                    KDStaggerEnemy(doll);
                                }
                            }
                        }
                    }
                }
                else {
                    KinkyDungeonSetEnemyFlag(gg, "idlegselect", 2);
                    KinkyDungeonSetEnemyFlag(gg, "overrideMove", 10);
                    gg.gx = doll.x;
                    gg.gy = doll.y;
                    KDUpdateMoveToEntity(gg);
                }
            }
        }
        for (let doll of punishDoll) {
            let gg = null;
            let storage = KinkyDungeonNearestJailPoint(doll.x, doll.y, ["display"], undefined, undefined);
            if (doll.x == storage?.x && doll.y == storage?.y) {
                KinkyDungeonSetEnemyFlag(doll, "punished", Math.floor(KDRandom() * 500) + 200);
                continue;
            }
            let dist = Math.floor(KDMapData.GridWidth * 0.4);
            let canLeash = (guard, dd) => {
                return guard?.Enemy && !KDEnemyHasFlag(guard, "idlegselect") && KDistChebyshev(guard.x - doll.x, guard.y - doll.y) < dd;
            };
            if (doll.leash?.entity && KDLookupID(doll.leash.entity)?.Enemy && idleGuard.some((entity) => { return entity.id == doll.leash.entity; })) {
                gg = KDLookupID(doll.leash.entity);
                dist = KDistChebyshev(gg.x - doll.x, gg.y - doll.y);
            }
            else {
                if (doll.leash?.reason == "DollLeash") {
                    KDBreakTether(doll);
                }
                for (let guard of idleGuard) {
                    if (canLeash(guard, dist)) {
                        gg = guard;
                        dist = KDistChebyshev(guard.x - doll.x, guard.y - doll.y);
                    }
                }
            }
            if (gg) {
                if (dist < 2.5 || doll.leash?.entity == gg.id) {
                    if (!doll.preferredX) {
                        let point = KDRandomJailPoint(doll.x, doll.y, ["display"], undefined, undefined, undefined, undefined, undefined, true);
                        if (point)
                            doll.preferredX = point.x;
                        if (point)
                            doll.preferredY = point.y;
                    }
                    let storage = KinkyDungeonNearestJailPoint(doll.preferredX || doll.x, doll.preferredY || doll.y, ["display"], undefined, undefined, true);
                    if (storage) {
                        if (dist < 1.5 && KDistChebyshev(gg.x - storage.x, gg.y - storage.y) < 1.5) {
                            KDMoveEntity(doll, storage.x, storage.y, false, false, false, false);
                            KDTieUpEnemy(doll, (doll.Enemy.maxhp || doll.hp) * (1 + KDNPCStruggleThreshMult(doll)) - (doll.boundLevel || 0), "Latex", undefined, false, 0);
                            KinkyDungeonSetEnemyFlag(doll, "punished", Math.floor(KDRandom() * 500) + 200);
                            KinkyDungeonSetEnemyFlag(doll, "tryNotToSwap", 500);
                            gg.gx = gg.x;
                            gg.gy = gg.y;
                            gg.movePoints = 0;
                        }
                        else {
                            KinkyDungeonSetEnemyFlag(gg, "idlegselect", 2);
                            KinkyDungeonSetEnemyFlag(gg, "overrideMove", 10);
                            KinkyDungeonSetEnemyFlag(gg, "leashPrisoner", 3);
                            KinkyDungeonAttachTetherToEntity(1.5, gg, doll, "DollLeash", KDBasePink, 6);
                            gg.gx = storage.x;
                            gg.gy = storage.y;
                            if (dist > 1.5) {
                                let path = KinkyDungeonFindPath(doll.x, doll.y, gg.x, gg.y, true, true, false, KinkyDungeonMovableTilesEnemy, false, false, false);
                                if (path && path.length > 0) {
                                    KDStaggerEnemy(doll);
                                }
                            }
                        }
                    }
                }
                else {
                    KinkyDungeonSetEnemyFlag(gg, "idlegselect", 2);
                    KinkyDungeonSetEnemyFlag(gg, "overrideMove", 10);
                    gg.gx = doll.x;
                    gg.gy = doll.y;
                    KDUpdateMoveToEntity(gg);
                }
            }
        }
        let idleGuards = [];
        let guardCount = 0;
        for (let en of KDMapData.Entities) {
            if (en.faction == "Enemy" && !(en.Enemy?.tags?.prisoner || en.Enemy?.tags?.formerprisoner)) {
                if (en != KinkyDungeonJailGuard() && en != KinkyDungeonLeashingEnemy() && (en.idle && !KDEnemyHasFlag(en, "idlegselect")))
                    idleGuards.push(en);
                if (en.Enemy.tags.jailer)
                    guardCount += 1;
            }
        }
        if (guardCount > 15) {
            for (let en of idleGuards) {
                KinkyDungeonSetEnemyFlag(en, "despawn", 300);
                KinkyDungeonSetEnemyFlag(en, "vis_despawn", 300);
                KinkyDungeonSetEnemyFlag(en, "wander", 300);
                en.gx = KDMapData.EndPosition.x;
                en.gy = KDMapData.EndPosition.y;
                en.despawnX = KDMapData.EndPosition.x;
                en.despawnY = KDMapData.EndPosition.y;
                en.goToDespawn = true;
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
                let sl = KDMapData.Labels.BackDoor[Math.floor(KDRandom() * KDMapData.Labels.BackDoor.length)];
                let tag = "dressmaker";
                let Enemy = KinkyDungeonGetEnemy([tag, "dressmaker"], MiniGameKinkyDungeonLevel + 4, 'lib', '0', [tag], undefined, { [tag]: { mult: 4, bonus: 10 } }, ["boss"]);
                if (Enemy && !KinkyDungeonEnemyAt(sl.x, sl.y)
                    && KDistChebyshev(KDPlayer().x - sl.x, KDPlayer().y - sl.y)
                        > 7) {
                    let en = DialogueCreateEnemy(sl.x, sl.y, Enemy.name);
                    en.AI = "looseguard";
                    en.faction = "Enemy";
                    en.keys = true;
                    en.gxx = l.x;
                    en.gyy = l.y;
                    en.gx = l.x;
                    en.gy = l.y;
                    KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
                    KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
                }
            }
        }
        for (let admirer of admirers) {
            if (!KDEnemyHasFlag(admirer, "admiring") || (!KinkyDungeonEntityAt(admirer.gx, admirer.gy)
                || !KDHelpless(KinkyDungeonEntityAt(admirer.gx, admirer.gy)))) {
                let nearestdist = KDMapData.GridWidth;
                let nearestDoll = null;
                for (let doll of [...idleDoll, KDPlayer()]) {
                    let dist = KDistChebyshev(doll.x - admirer.x, doll.y - admirer.y);
                    if (dist < nearestdist) {
                        let storage = KinkyDungeonNearestJailPoint(doll.preferredX || doll.x, doll.preferredY || doll.y, ["display"], undefined, undefined, false);
                        if (storage?.x == doll.x && storage?.y == doll.y &&
                            ((doll.player && KDPrisonIsInFurniture(doll))
                                || (!doll.player && KDHelpless(doll)))) {
                            nearestDoll = doll;
                            nearestdist = dist;
                        }
                    }
                }
                if (nearestDoll) {
                    let doll = nearestDoll;
                    KinkyDungeonSetEnemyFlag(admirer, "admiring");
                    admirer.gxx = doll.x;
                    admirer.gyy = doll.y + 1;
                    admirer.gx = doll.x;
                    admirer.gy = doll.y + 1;
                    admirer.AI = "looseguard";
                    KDUpdateMoveToEntity(admirer);
                }
                else if (KDMapData.Labels.Display) {
                    if (!KDEnemyHasFlag(admirer, "newdisplay")) {
                        let label = KDRandomItem(KDMapData.Labels.Display);
                        if (label) {
                            KinkyDungeonSetEnemyFlag(admirer, "newdisplay");
                            admirer.gxx = label.x;
                            admirer.gyy = label.y + 1;
                            admirer.gx = label.x;
                            admirer.gy = label.y + 1;
                            admirer.AI = "looseguard";
                        }
                    }
                }
                else {
                    admirer.AI = "wander";
                }
            }
        }
        if (admirers.filter((en) => { return !KDHelpless(en); }).length > 6) {
            for (let en of admirers) {
                if (!KDEnemyHasFlag(en, "admiring")) {
                    let label = KDMapData.EndPosition;
                    if (KDMapData.Labels.Entrance?.length > 0)
                        label = KDRandomItem(KDMapData.Labels.Entrance) || label;
                    KinkyDungeonSetEnemyFlag(en, "despawn", 300);
                    KinkyDungeonSetEnemyFlag(en, "vis_despawn", 300);
                    KinkyDungeonSetEnemyFlag(en, "wander", 300);
                    en.gx = label.x;
                    en.gy = label.y;
                    en.despawnX = label.x;
                    en.despawnY = label.y;
                    en.goToDespawn = true;
                    break;
                }
            }
        }
        else if (!KinkyDungeonFlags.get("admirerspawn")) {
            KinkyDungeonSetFlag("admirerspawn", 10);
            if (KDMapData.Labels && KDMapData.Labels.Entrance?.length > 0) {
                let l = KDMapData.Labels.Entrance[Math.floor(KDRandom() * KDMapData.Labels.Entrance.length)];
                let Enemy = KinkyDungeonGetEnemy(["adventurer"], MiniGameKinkyDungeonLevel + 4, 'lib', '0', ["adventurer"], undefined, { ["adventurer"]: { mult: 4, bonus: 10 } }, ["boss"]);
                if (Enemy && !KinkyDungeonEnemyAt(l.x, l.y)
                    && KDistChebyshev(KDPlayer().x - l.x, KDPlayer().y - l.y)
                        > 7) {
                    let en = DialogueCreateEnemy(l.x, l.y, Enemy.name);
                    en.AI = "wander";
                    en.faction = "Adventurer";
                    en.specialdialogue = "DollShoppeVisitor";
                }
            }
        }
        for (let en of idleGuards) {
            if (!KDEnemyHasFlag(en, "patrol")
                && !KDEnemyHasFlag(en, "idlegselect")
                && !KDEnemyHasFlag(en, "overrideMove")
                && !KDEnemyHasFlag(en, "despawn")
                && en != KinkyDungeonJailGuard()
                && en != KinkyDungeonLeashingEnemy()) {
                KinkyDungeonSetEnemyFlag(en, "patrol", 100 + Math.floor(KDRandom() * 200));
                let point = CommonRandomItemFromList(null, KDMapData.Labels.Patrol);
                if (point) {
                    en.gx = point.x;
                    en.gy = point.y;
                }
            }
        }
        if (dollCount < 10) {
            let point = CommonRandomItemFromList(null, KDMapData.Labels.BackDoor);
            if (!KinkyDungeonEntityAt(point.x, point.y))
                DialogueCreateEnemy(point.x, point.y, "PrettyDoll");
        }
    },
    states: {
        Intro: { name: "Intro",
            init: (params) => {
                if (KDGameData.PrisonerState == "parole")
                    KDGameData.PrisonerState = "jail";
                if (KDMapData.Labels && KDMapData.Labels.Deploy) {
                    for (let l of KDMapData.Labels.Deploy) {
                        let tag = "dressmaker";
                        let Enemy = KinkyDungeonGetEnemy([tag, "dressmaker"], MiniGameKinkyDungeonLevel + 4, 'bel', '0', [tag], undefined, { [tag]: { mult: 4, bonus: 10 } }, ["boss"]);
                        if (Enemy && !KinkyDungeonEnemyAt(l.x, l.y)) {
                            let en = DialogueCreateEnemy(l.x, l.y, Enemy.name);
                            en.AI = "looseguard";
                            en.faction = "Enemy";
                            en.keys = true;
                            KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
                            KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
                        }
                    }
                }
                if (KDMapData.Labels && KDMapData.Labels.Patrol) {
                    for (let l of KDMapData.Labels.Patrol) {
                        let tag = "dressmaker";
                        let Enemy = KinkyDungeonGetEnemy([tag], MiniGameKinkyDungeonLevel + 4, 'bel', '0', [tag], undefined, { [tag]: { mult: 4, bonus: 10 } }, ["boss", "miniboss", "elite"]);
                        if (Enemy && !KinkyDungeonEnemyAt(l.x, l.y)) {
                            let en = DialogueCreateEnemy(l.x, l.y, Enemy.name);
                            en.AI = "hunt";
                            en.faction = "Enemy";
                            en.keys = true;
                            KinkyDungeonSetEnemyFlag(en, "mapguard", -1);
                            KinkyDungeonSetEnemyFlag(en, "cyberaccess", -1);
                        }
                    }
                }
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                KDPrisonCommonGuard(player);
                return "Jail";
            },
        },
        Jail: { name: "Jail",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                KDPrisonCommonGuard(player);
                let lostTrack = KDLostJailTrack(player);
                if (lostTrack == "Unaware") {
                    return KDSetPrisonState(player, "Jail");
                }
                if (KDGameData.PrisonerState == 'parole')
                    return KDSetPrisonState(player, "Jail");
                if (KDPrisonTick(player)) {
                    let uniformCheck = KDPrisonGetGroups(player, ["dressmaker", "dressRestraints"], "Purple", KDJAILPOWER);
                    if ((uniformCheck.groupsToStrip.length > 0 && !KinkyDungeonFlags.get("failStrip")) || uniformCheck.itemsToApply.length > 0) {
                        return "Uniform";
                    }
                    if (!KinkyDungeonFlags.get("transformCD") && !KinkyDungeonStatsChoice.get("NoDollTransform") && !KinkyDungeonFlags.get("Transformed")
                        && (KinkyDungeonFlags.get("annoy_puppet") || KDEntityBuffedStat(player, "Hypno_Doll") > 25)) {
                        return "Transform";
                    }
                    if (!KinkyDungeonFlags.get("displayCD")) {
                        KinkyDungeonFlags.set("PrisonStorageTimer", 0);
                        return "Display";
                    }
                    return "Storage";
                }
                return "Jail";
            },
            updateStack: (delta) => {
                KinkyDungeonSetFlag("noPlay", 10);
            },
        },
        FurnitureTravel: { name: "FurnitureTravel",
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
        Uniform: { name: "Uniform",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let guard = KDPrisonCommonGuard(player);
                if (KDPrisonIsInFurniture(player)) {
                    KinkyDungeonSetFlag("nojail", 10);
                    KinkyDungeonSetFlag("SuppressGuardCall", 10);
                    let action = "Follow";
                    KinkyDungeonSetEnemyFlag(guard, "sent", 10);
                    if (guard.IntentAction != action)
                        KDIntentEvents[action].trigger(guard, {});
                    else
                        guard.playWithPlayer = Math.max(guard.playWithPlayer, 3);
                    let uniformCheck = KDPrisonGetGroups(player, ["dressmaker", "dressRestraints"], "Purple", KDJAILPOWER);
                    if (uniformCheck.groupsToStrip.length > 0 && !KinkyDungeonFlags.get("failStrip")) {
                        KDGoToSubState(player, "UniformApply");
                        return KDGoToSubState(player, "UniformRemoveExtra");
                    }
                    else if (uniformCheck.itemsToApply.length > 0) {
                        return KDGoToSubState(player, "UniformApply");
                    }
                    return KDPopSubstate(player);
                }
                return KDGoToSubState(player, "FurnitureTravel");
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
                    KinkyDungeonSetEnemyFlag(guard, "sent", 10);
                    if (guard.IntentAction != action)
                        KDIntentEvents[action].trigger(guard, {});
                    else
                        guard.playWithPlayer = Math.max(guard.playWithPlayer, 3);
                    KinkyDungeonSetEnemyFlag(guard, "overrideMove", 2);
                    if (KDistChebyshev(guard.x - player.x, guard.y - player.y) < 1.5) {
                        if (KDPrisonIsInFurniture(player)) {
                            let lockType = "Purple";
                            return KDDoUniformRemove(player, guard, ["dressmaker"], lockType, KDJAILPOWER);
                        }
                    }
                    else {
                        return KDCurrentPrisonState(player);
                    }
                }
                return KDGoToSubState(player, "FurnitureTravel");
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
                        KinkyDungeonSetEnemyFlag(guard, "sent", 10);
                        if (guard.IntentAction != action)
                            KDIntentEvents[action].trigger(guard, {});
                        else
                            guard.playWithPlayer = Math.max(guard.playWithPlayer, 3);
                        KinkyDungeonSetEnemyFlag(guard, "overrideMove", 2);
                        if (KDistChebyshev(guard.x - player.x, guard.y - player.y) < 1.5) {
                            let lockType = "Purple";
                            return KDDoUniformApply(player, guard, ["dressmaker"], lockType, KDJAILPOWER);
                        }
                    }
                    else {
                        return KDCurrentPrisonState(player);
                    }
                }
                return KDGoToSubState(player, "FurnitureTravel");
            },
        },
        Storage: { name: "Storage",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                if (KDGameData.PrisonerState == 'parole')
                    return KDPopSubstate(player);
                KDPrisonCommonGuard(player);
                let jailPoint = KinkyDungeonNearestJailPoint(player.x, player.y, ["storage"]);
                if (!jailPoint || jailPoint.x != player.x || jailPoint.y != player.y) {
                    return KDGoToSubState(player, "StorageTravel");
                }
                if (KDPrisonIsInFurniture(player)) {
                    let uniformCheck = KDPrisonGetGroups(player, ["dressmaker", "dressRestraints"], "Purple", KDJAILPOWER);
                    if (uniformCheck.itemsToApply.length > 0) {
                        return KDGoToSubState(player, "Uniform");
                    }
                    KinkyDungeonFlags.set("PrisonStorageTimer", (KinkyDungeonFlags.get("PrisonStorageTimer") || 0) + delta * 2);
                    if (KinkyDungeonFlags.get("PrisonStorageTimer") > 100 && (KDRandom() < 0.01 || KinkyDungeonFlags.get("PrisonStorageTimer") > 300)) {
                        return KDSetPrisonState(player, "Jail");
                    }
                    KinkyDungeonSetFlag("nojail", 10);
                    KinkyDungeonSetFlag("SuppressGuardCall", 10);
                    return KDCurrentPrisonState(player);
                }
                return KDSetPrisonState(player, "Jail");
            },
        },
        StorageTravel: { name: "StorageTravel",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let lostTrack = KDLostJailTrack(player);
                if (lostTrack == "Unaware") {
                    return KDSetPrisonState(player, "Jail");
                }
                let jailPointTarget = KDRandomJailPoint(player.x, player.y, ["storage"], undefined, undefined);
                let jailPointNearest = KinkyDungeonNearestJailPoint(player.x, player.y, ["storage"], undefined, undefined);
                if (!(jailPointTarget && jailPointTarget.x == player.x && jailPointTarget.y == player.y)
                    && !(jailPointNearest && jailPointNearest.x == player.x && jailPointNearest.y == player.y)) {
                    let guard = KDPrisonCommonGuard(player);
                    if (guard) {
                        let action = "leashStorage";
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
        Display: { name: "Display",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                if (KDGameData.PrisonerState == 'parole')
                    return KDPopSubstate(player);
                let label = KDMapData.Labels?.Display ? KDGetUnoccupiedLabel(KDMapData.Labels.Display, player, true, true) : null;
                let rad = 3;
                if (label && (KDistEuclidean(label.x - player.x, label.y - player.y) > rad)) {
                    KDSelectLabel(player, label);
                    KinkyDungeonSetFlag("displayCD", 900);
                    KDRerollJailFlags(player);
                    KinkyDungeonSetFlag("JailRandom", 900);
                    return KDGoToSubState(player, "DisplayTravel");
                }
                if (KinkyDungeonFlags.get("displayStart")) {
                    KinkyDungeonSetFlag("nojail", 10);
                    KinkyDungeonSetFlag("SuppressGuardCall", 10);
                    return KDCurrentPrisonState(player);
                }
                return KDSetPrisonState(player, "Jail");
            },
            updateStack: (delta) => {
            },
        },
        DisplayTravel: { name: "DisplayTravel",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let label = KDMapData.Labels?.Display ? KDGetUnoccupiedLabel(KDMapData.Labels.Display, player, true, true) : null;
                let rad = 3;
                let lostTrack = KDLostJailTrack(player);
                if (lostTrack == "Unaware") {
                    return KDSetPrisonState(player, "Jail");
                }
                if (label && (KDistEuclidean(label.x - player.x, label.y - player.y) > rad) && KDPlayerLeashable(player)) {
                    KDSelectLabel(player, label);
                    let guard = KDPrisonCommonGuard(player);
                    if (guard) {
                        let action = "leashToPoint_Furn";
                        if (guard.IntentAction != action) {
                            guard.gx = player.x;
                            guard.gy = player.y;
                            KDUpdateMoveToEntity(guard);
                            KDIntentEvents[action].trigger(guard, { point: label, radius: 1, target: player });
                            guard.IntentLeashPointType = "display";
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
                KinkyDungeonSetFlag("displayStart", 300);
                return KDPopSubstate(player);
            },
        },
        Transform: { name: "Transform",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let label = KDMapData.Labels?.Stand ? KDGetUnoccupiedLabel(KDMapData.Labels.Stand, player, true, true) : null;
                let rad = 3;
                if (label && (KDistEuclidean(label.x - player.x, label.y - player.y) > rad)) {
                    KDSelectLabel(player, label);
                    return KDGoToSubState(player, "TransformTravel");
                }
                if (!KinkyDungeonFlags.get("transformCD")) {
                    KinkyDungeonSetFlag("transformCD", 3000);
                    KinkyDungeonSetFlag("transformAwait", 15);
                    return KDGoToSubState(player, "TransformAwait");
                }
                return KDSetPrisonState(player, "Jail");
            },
            updateStack: (delta) => {
            },
            finally: (delta, currentState, stackPop) => {
                let labels = KDMapData.Labels?.TrainingDoor;
                if (labels?.length > 0) {
                    for (let td of labels) {
                        if ("dD".includes(KinkyDungeonMapGet(td.x, td.y))) {
                            KinkyDungeonMapSet(td.x, td.y, '2');
                            let door = KinkyDungeonTilesGet(td.x + ',' + td.y);
                            if (door) {
                                delete door.Type;
                                delete door.Lock;
                                delete door.ReLock;
                            }
                        }
                    }
                }
            },
        },
        TransformAwait: { name: "TransformAwait",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                if (!KDPrisonPuppetmasterGuard(player)) {
                    let en = DialogueCreateEnemy(KDMapData.EndPosition.x, KDMapData.EndPosition.y, "Puppetmaster");
                    en.AI = "looseguard";
                    en.faction = "Dressmaker";
                    en.keys = true;
                    en.gxx = KDPlayer().x;
                    en.gyy = KDPlayer().y;
                    en.gx = KDPlayer().x;
                    en.gy = KDPlayer().y;
                    KDUpdateMoveToEntity(en);
                    KDPrisonPuppetmasterGuard(player);
                }
                if (KinkyDungeonJailGuard() && (KDPrisonIsInFurniture(player)) && KinkyDungeonFlags.get("transformAwait")
                    && !KinkyDungeonStatsChoice.get("SpeciesDoll")) {
                    let guard = KinkyDungeonJailGuard();
                    let action = "initiateDialogue";
                    if (guard.IntentAction != action && !KDGameData.CurrentDialog) {
                        guard.gx = player.x;
                        guard.gy = player.y;
                        KDUpdateMoveToEntity(guard);
                        KDIntentEvents[action].trigger(guard, {});
                        guard.intentDialogue = "DollTransform";
                    }
                    return KDCurrentPrisonState(player);
                }
                return KDPopSubstate(player);
            },
        },
        TransformTravel: { name: "TransformTravel",
            init: (params) => {
                return "";
            },
            update: (delta) => {
                let player = KinkyDungeonPlayerEntity;
                let label = KDMapData.Labels?.Stand ? KDGetUnoccupiedLabel(KDMapData.Labels.Stand, player, true, true) : null;
                let rad = 3;
                let lostTrack = KDLostJailTrack(player);
                if (lostTrack == "Unaware") {
                    return KDSetPrisonState(player, "Jail");
                }
                if (label && (KDistEuclidean(label.x - player.x, label.y - player.y) > rad || !KDPrisonIsInFurniture(player))
                    && KDPlayerLeashable(player)) {
                    KDSelectLabel(player, label);
                    let guard = KDPrisonCommonGuard(player);
                    if (guard) {
                        let action = "leashToPoint_Furn";
                        if (guard.IntentAction != action) {
                            guard.gx = player.x;
                            guard.gy = player.y;
                            KDUpdateMoveToEntity(guard);
                            KDIntentEvents[action].trigger(guard, { point: label, radius: 1, target: player });
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
                KinkyDungeonSetFlag("transformAwaitFurniture", 6);
                return KDPopSubstate(player);
            },
        },
    },
};
function KDPrisonPuppetmasterGuard(player, _call = false, suppressCall = true) {
    KinkyDungeonSetFlag("SuppressGuardCall", 10);
    let guard = KDGetNearestFactionGuard(player.x, player.y, ((en) => {
        return !!en.Enemy?.tags?.puppeteer && (KDEnemyHasFlag(en, "mapguard")
            || (KDGetFaction(en) == KDGetMainFaction()
                && en.Enemy?.tags.jailer)) && !KDHelpless(en) && !KinkyDungeonIsDisabled(en);
    }));
    if (guard)
        KDGameData.JailGuard = guard.id;
    return KinkyDungeonJailGuard();
}
function KDGetUnoccupiedLabel(labels, entity, getLabelCurrentlyOn, getSelected) {
    labels = labels.filter((label) => {
        return !KinkyDungeonEntityAt(label.x, label.y) || entity == KinkyDungeonEntityAt(label.x, label.y);
    });
    if (getSelected && entity && KDGetLabel(entity)) {
        let lb = labels.filter((label) => {
            return label.x == KDGetLabel(entity).x && label.y == KDGetLabel(entity).y;
        });
        if (lb.length > 0)
            return lb[0];
    }
    if (getLabelCurrentlyOn && entity) {
        let lb = labels.filter((label) => {
            return label.x == entity.x && label.y == entity.y;
        });
        if (lb.length > 0)
            return lb[0];
    }
    if (labels.length > 0)
        return CommonRandomItemFromList(null, labels);
    return null;
}
function KDSelectLabel(entity, label) {
    if (!KDGameData.selectedLabel)
        KDGameData.selectedLabel = {};
    if (label && !KDGameData.selectedLabel[entity.id])
        KDGameData.selectedLabel[entity.id] = label;
    else if (!label)
        delete KDGameData.selectedLabel[entity.id];
}
function KDGetLabel(entity) {
    if (!KDGameData.selectedLabel)
        KDGameData.selectedLabel = {};
    return KDGameData.selectedLabel[entity.id];
}
//# sourceMappingURL=DollShoppe.js.map