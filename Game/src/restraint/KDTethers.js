"use strict";
let KDLeashPullCost = 0.5;
let KDLeashPullKneelTime = 5;
let KDLeashablePersonalities = {
    "": (entity, leasher) => {
        return (!KDHostile(entity, leasher) && KDFactionRelation(KDGetFaction(entity), KDGetFaction(leasher)) > 0.5) || KDBoundEffects(entity) > 1;
    },
    "Dom": (entity, leasher) => {
        return KDBoundEffects(entity) > 1;
    },
    "Sub": (entity, leasher) => {
        return !KDHostile(entity, leasher) || KDBoundEffects(entity) > 1;
    },
    "Brat": (entity, leasher) => {
        return (!KDHostile(entity, leasher) && entity.leash) || entity.distraction > entity.Enemy.maxhp * 0.25 || KDBoundEffects(entity) > 1;
    },
};
let KDLeashTick = {
    LeashBolt: (delta, entity, leasher) => {
        return KDLeashTick.Retracting(delta, entity, leasher);
    },
    Retracting: (delta, entity, leasher) => {
        let x = leasher?.x || entity.leash.x;
        let y = leasher?.y || entity.leash.y;
        let currLen = entity.leash.length;
        let dd = KDistChebyshev(x - entity.x, y - entity.y);
        if (dd < currLen && currLen > 1.9) {
            entity.leash.length -= 1;
            KinkyDungeonSendTextMessage(10, TextGet("KDLeashRatchet"), KDBaseRed, 2);
            KinkyDungeonMakeNoise(1.5, entity.x, entity.y);
        }
        return false;
    },
};
let KDLeashReason = {
    ShadowTether: (entity) => {
        if (!(entity.leash.entity && KinkyDungeonFindID(entity.leash.entity)?.Enemy?.tags?.shadow))
            return false;
        if (entity.leash.entity && KinkyDungeonFindID(entity.leash.entity)
            && KinkyDungeonIsDisabled(KinkyDungeonFindID(entity.leash.entity)))
            return false;
        if (entity.player) {
            return !!KinkyDungeonPlayerTags.get("Shadow");
        }
        else {
            return KDBoundEffects(entity) > 1 && !KDIsImprisoned(entity);
        }
    },
    PuppetStringTether: (entity) => {
        if (!(entity.leash.entity && (KinkyDungeonFindID(entity.leash.entity)?.Enemy?.tags?.strings
            || KinkyDungeonFindID(entity.leash.entity)?.Enemy?.tags?.dressmaker)))
            return false;
        if (entity.leash.entity && KinkyDungeonFindID(entity.leash.entity)
            && KinkyDungeonIsDisabled(KinkyDungeonFindID(entity.leash.entity)))
            return false;
        if (entity.player) {
            return !!KinkyDungeonPlayerTags.get("PuppetStrings");
        }
        else {
            return KDBoundEffects(entity) > 1 && !KDIsImprisoned(entity);
        }
    },
    LeashBolt: (entity) => {
        if (!(entity.leash.entity || !KinkyDungeonFindID(entity.leash.entity)))
            return false;
        if (entity.leash.entity && KinkyDungeonFindID(entity.leash.entity)
            && KinkyDungeonIsDisabled(KinkyDungeonFindID(entity.leash.entity)))
            return false;
        return KDLeashReason.Default(entity);
    },
    PlayerLeash: (entity) => {
        if (entity
            && !(KDWillingLeash(entity))
            && !(KDCanApplyBondage(entity, KDPlayer()))
            && !(KDHasSpell("LeashSkill") && KDGetNPCRestraints(entity.id) && Object.values(KDGetNPCRestraints(entity.id))
                .some((rest) => { return KDRestraint(rest)?.leash; })))
            return false;
        if (KDPlayerIsDisabled() || KinkyDungeonIsHandsBound(true, true, 0.5))
            return false;
        return !KDIsImprisoned(entity);
    },
    Default: (entity) => {
        if (entity.leash && entity.leash.reason == "Default") {
            if (entity.leash.entity) {
                let leasher = KDLookupID(entity.leash.entity);
                if (!leasher)
                    return false;
                if (!leasher.player) {
                    if (KinkyDungeonIsDisabled(leasher))
                        return false;
                }
            }
        }
        if (entity.player) {
            if (KinkyDungeonPlayerTags.get("Leashable"))
                return !KDIsImprisoned(entity);
            else
                return false;
        }
        return !KDIsImprisoned(entity);
    },
    WolfgirlLeash: (entity) => {
        if (entity.leash && entity.leash.reason == "WolfgirlLeash") {
            if (entity.leash.entity) {
                let leasher = KDLookupID(entity.leash.entity);
                if (!leasher || KDEntityHasFlag(leasher, "aggression")) {
                    return false;
                }
            }
        }
        return KDLeashReason.Default(entity);
    },
    DollLeash: (entity) => {
        if (entity.leash && entity.leash.reason == "DollLeash") {
            if (entity.leash.entity) {
                let leasher = KDLookupID(entity.leash.entity);
                if (!leasher || KDEntityHasFlag(leasher, "aggression") || !KDEntityHasFlag(leasher, "leashPrisoner")) {
                    return false;
                }
            }
        }
        return KDLeashReason.Default(entity);
    },
};
function KDGetLeashedToCount(entity) {
    let n = 0;
    for (let en of KDMapData.Entities.filter((en) => { return en.leash?.entity; })) {
        if (en.leash.entity == entity.id)
            n++;
    }
    if (KDPlayer().leash?.entity == entity.id)
        n++;
    return n;
}
function KDGetLeashedTo(entity) {
    let ret = [];
    for (let en of KDMapData.Entities.filter((en) => { return en.leash?.entity; })) {
        if (en.leash.entity == entity.id)
            ret.push(en);
    }
    if (KDPlayer().leash?.entity == entity.id)
        ret.push(KDPlayer());
    return ret;
}
function KDGetTetherLength(entity) {
    if (!entity)
        entity = KDPlayer();
    if (entity.leash) {
        return entity.leash.length || 2.5;
    }
    return 0;
}
function KDIsPlayerTethered(entity) {
    if (!entity)
        entity = KDPlayer();
    if (entity.leash) {
        KDUpdateLeashCondition(entity);
        return entity.leash != undefined;
    }
    if (entity.player) {
        let found = KinkyDungeonFindID(KDGameData.KinkyDungeonLeashingEnemy);
        if (!found)
            KDGameData.KinkyDungeonLeashingEnemy = 0;
        return KDGameData.KinkyDungeonLeashedPlayer > 0;
    }
    return false;
}
function KDUpdateLeashCondition(entity, noDelete = false) {
    if (entity.leash?.reason) {
        if (!KDLeashReason[entity.leash.reason] || !KDLeashReason[entity.leash.reason](entity)) {
            if (!noDelete)
                delete entity.leash;
            return false;
        }
    }
    return true;
}
function KDRemoveLeashRemovedRestraints(player) {
    if (player.player) {
        for (let inv of KinkyDungeonAllRestraint()) {
            if (KDRestraint(inv).removeOnLeash) {
                KinkyDungeonRemoveRestraint(KDRestraint(inv).Group, false);
                if (KDRestraint(inv).Group == "ItemDevices") {
                    KDReleaseDueToLeashFlags(player);
                }
            }
        }
    }
}
function KinkyDungeonAttachTetherToEntity(dist, entity, player, reason = "Default", color, priority = 5, item = null) {
    if (!player)
        player = KDPlayer();
    if (!player.leash || priority > player.leash.priority) {
        player.leash = {
            x: entity.x,
            y: entity.y,
            entity: entity.player ? -1 : entity.id,
            reason: reason,
            color: color,
            length: dist || 2,
            priority: priority,
            restraintID: item?.id,
        };
        KDRemoveLeashRemovedRestraints(player);
        return player.leash;
    }
    return undefined;
}
function KDIsPlayerTetheredToLocation(player, x, y, entity) {
    if (!player.player)
        return false;
    if (player.leash) {
        if (entity && KDIsPlayerTetheredToEntity(player, KDLookupID(entity.id))) {
            return true;
        }
        else if (player.leash.x == x && player.leash.y == y)
            return true;
        else if (entity && player.leash.x == entity.x && player.leash.y == entity.y)
            return true;
    }
    return false;
}
function KDIsPlayerTetheredToEntity(player, entity) {
    if (!player.player)
        return false;
    if (player.leash) {
        let host = KDLookupID(player.leash.entity);
        if (host?.id == entity?.id) {
            return true;
        }
    }
    return false;
}
function KDBreakTether(player, mapData) {
    if (player?.leash) {
        delete player.leash;
        if (KinkyDungeonAutoWait && (!mapData || mapData != KDMapData)) {
            KDUpdateWaitTime(KDDelayWaitTime());
        }
        return true;
    }
    return false;
}
function KinkyDungeonDrawTethers(CamX, CamY) {
    KDTetherGraphics.clear();
    if (!KDGameBoardAddedTethers) {
        kdgameboard.addChild(KDTetherGraphics);
        KDGameBoardAddedTethers = true;
    }
    let drawTether = (entity) => {
        if (entity.leash && (KinkyDungeonVisionGet(entity.x, entity.y) > 0.5 || KinkyDungeonVisionGet(entity.leash.x, entity.leash.y) > 0.5)) {
            if (KDistChebyshev(entity.visual_x - entity.x, entity.visual_y - entity.y) > 2) {
                entity.visual_x = entity.x;
                entity.visual_y = entity.y;
            }
            let xx = canvasOffsetX + (entity.visual_x - CamX) * KinkyDungeonGridSizeDisplay;
            let yy = canvasOffsetY + (entity.visual_y - CamY) * KinkyDungeonGridSizeDisplay;
            let txx = canvasOffsetX + (entity.leash.x - CamX) * KinkyDungeonGridSizeDisplay;
            let tyy = canvasOffsetY + (entity.leash.y - CamY) * KinkyDungeonGridSizeDisplay;
            let leasher = entity.leash.entity ? KDLookupID(entity.leash.entity) : undefined;
            if (leasher) {
                if (KDistChebyshev(leasher.visual_x - leasher.x, leasher.visual_y - leasher.y) > 2) {
                    leasher.visual_x = leasher.x;
                    leasher.visual_y = leasher.y;
                }
                txx = canvasOffsetX + (leasher.visual_x - CamX) * KinkyDungeonGridSizeDisplay;
                tyy = canvasOffsetY + (leasher.visual_y - CamY) * KinkyDungeonGridSizeDisplay;
                txx += KinkyDungeonGridSizeDisplay * (leasher.flip ? 0.2 : -0.2);
            }
            let dx = (txx - xx);
            let dy = (tyy - yy);
            let dd = 0.1;
            let color = entity.leash.color;
            if (!color || color == "Default")
                color = "#aaaaaa";
            if (Array.isArray(color))
                color = color[0];
            KDTetherGraphics.lineStyle(entity.player ? 3 : 2, string2hex(color), 1);
            for (let d = dd; d < 1 - dd; d += dd) {
                let yOffset = 30 * Math.sin(Math.PI * d);
                let yOffset2 = 30 * Math.sin(Math.PI * (d + dd));
                KDTetherGraphics.moveTo(KinkyDungeonGridSizeDisplay / 2 + xx + dx * d, KinkyDungeonGridSizeDisplay * 0.5 + yOffset + yy + dy * d);
                KDTetherGraphics.lineTo(KinkyDungeonGridSizeDisplay / 2 + xx + dx * (d + dd), KinkyDungeonGridSizeDisplay * 0.5 + yOffset2 + yy + dy * (d + dd));
            }
        }
    };
    drawTether(KDPlayer());
    for (let enemy of KDMapData.Entities) {
        drawTether(enemy);
    }
}
function KDBreakAllLeashedTo(entity, reason) {
    for (let en of KDMapData.Entities) {
        if (en.leash && en.leash.entity == entity.id && (!reason || en.leash.reason == reason)) {
            KDBreakTether(en);
        }
    }
}
let KDLeashTugBalanceAmt = 0.34;
function KinkyDungeonUpdateTether(delta, Msg, Entity, xTo, yTo) {
    if (Entity.player && KinkyDungeonFlags.get("pulled"))
        return false;
    else if (KDEnemyHasFlag(Entity, "pulled"))
        return false;
    KDUpdateLeashCondition(Entity, false);
    if (Entity.leash && KDLeashTick[Entity.leash.reason]) {
        KDLeashTick[Entity.leash.reason](delta, Entity, Entity.leash.entity ? KinkyDungeonFindID(Entity.leash.entity) : undefined);
    }
    if (Entity.leash) {
        let exceeded = false;
        let leash = Entity.leash;
        let tether = leash.length;
        if (leash.entity) {
            let target = KDLookupID(leash.entity);
            if (!target) {
                KDBreakTether(Entity);
                return false;
            }
            else {
                leash.x = target.x;
                leash.y = target.y;
            }
        }
        let restraint = (Entity.player && leash.restraintID) ? KinkyDungeonAllRestraintDynamic().find((inv) => { return inv.item.id == leash.restraintID; }) : undefined;
        if (!restraint && (Entity.player && leash.restraintID)) {
            KDBreakTether(Entity);
        }
        if (Entity.player) {
            KDGameData.KinkyDungeonLeashedPlayer = Math.max(KDGameData.KinkyDungeonLeashedPlayer, 5);
            for (let inv of KinkyDungeonAllRestraint()) {
                if (KDRestraint(inv).removeOnLeash) {
                    KinkyDungeonRemoveRestraint(KDRestraint(inv).Group, false);
                    if (KDRestraint(inv).Group == "ItemDevices") {
                        KDReleaseDueToLeashFlags(Entity);
                    }
                }
            }
        }
        if (xTo || yTo) {
            let pathToTether = KinkyDungeonFindPath(xTo, yTo, leash.x, leash.y, false, !Entity.player, false, KinkyDungeonMovableTilesSmartEnemy, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true, Entity.leash?.entity);
            let playerDist = Math.max(pathToTether?.length || 0, KDistChebyshev(xTo - leash.x, yTo - leash.y));
            if (playerDist > tether && KDistEuclidean(xTo - leash.x, yTo - leash.y) > KDistEuclidean(Entity.x - leash.x, Entity.y - leash.y)) {
                if (Msg && leash.restraintID) {
                    if (restraint) {
                        KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonTetherTooShort").replace("TETHER", KDGetItemName(restraint.item)), KDBaseRed, 2, true);
                    }
                }
                if (Entity.player) {
                    if (KinkyDungeonCanStand() && !KDForcedToGround()) {
                        KDChangeBalanceSrc((leash.entity ? "e" + leash.entity : "") || (leash.restraintID ? "r" + leash.restraintID : ""), "leash", "tug", -KDLeashTugBalanceAmt, false, true);
                        KDChangeWill("leashtug", "restraint", "move", -KDLeashPullCost, false);
                    }
                }
                else {
                    Entity.stun = Math.max(Entity.stun || 0, 3);
                }
                if (Entity.player) {
                    if (KinkyDungeonFlags.get("didLeashTug")) {
                        KinkyDungeonSetFlag("leashtug", 3);
                        KinkyDungeonSetFlag("didLeashTug", 5);
                    }
                }
                else
                    KinkyDungeonSetEnemyFlag(Entity, "leashtug", 3);
                exceeded = true;
            }
        }
        for (let i = 0; i < 10; i++) {
            let pathToTether = KinkyDungeonFindPath(Entity.x, Entity.y, leash.x, leash.y, false, !Entity.player, false, KinkyDungeonMovableTilesSmartEnemy, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true, Entity.leash?.entity);
            let playerDist = pathToTether?.length;
            if (!pathToTether)
                playerDist = KDistChebyshev(Entity.x - leash.x, Entity.y - leash.y);
            if (playerDist > tether) {
                let slot = null;
                if (pathToTether
                    && pathToTether?.length > 0
                    && (KDistEuclidean(pathToTether[0].x - leash.x, pathToTether[0].y - leash.y) > -0.01 + KDistEuclidean(Entity.x - leash.x, Entity.y - leash.y)
                        || KinkyDungeonFindPath(pathToTether[0].x, pathToTether[0].y, leash.x, leash.y, false, !Entity.player, false, KinkyDungeonMovableTilesSmartEnemy, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true, Entity.leash?.entity)?.length < pathToTether.length) && KDistChebyshev(pathToTether[0].x - Entity.x, pathToTether[0].y - Entity.y) < 1.5) {
                    slot = pathToTether[0];
                    if (slot && KinkyDungeonEntityAt(slot.x, slot.y) && KDIsImmobile(KinkyDungeonEntityAt(slot.x, slot.y), true)) {
                        slot = null;
                        KDSetIDFlag(Entity.id, "blocked", 3);
                    }
                }
                if (!slot) {
                    let mindistSQ = playerDist * playerDist;
                    for (let X = Entity.x - 1; X <= Entity.x + 1; X++) {
                        for (let Y = Entity.y - 1; Y <= Entity.y + 1; Y++) {
                            if ((X != Entity.x || Y != Entity.y)
                                && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y))
                                && KDistEuclideanSquared(X - leash.x, Y - leash.y) < mindistSQ
                                && !(KinkyDungeonEntityAt(X - leash.x, Y - leash.y)
                                    && KDIsImmobile(KinkyDungeonEntityAt(X - leash.x, Y - leash.y), true))) {
                                mindistSQ = KDistEuclideanSquared(X - leash.x, Y - leash.y);
                                slot = { x: X, y: Y };
                            }
                        }
                    }
                }
                if (!slot) {
                    slot = { x: leash.x, y: leash.y };
                }
                if (slot && KinkyDungeonEntityAt(slot.x, slot.y) && KDIsImmobile(KinkyDungeonEntityAt(slot.x, slot.y), true)) {
                    slot = null;
                }
                if (slot && (slot.x != Entity.x || slot.y != Entity.y)) {
                    let enemy = KinkyDungeonEntityAt(slot.x, slot.y);
                    if (enemy && !enemy.player) {
                        let slot2 = null;
                        let mindistSQ2 = playerDist * playerDist;
                        for (let X = enemy.x - 1; X <= enemy.x + 1; X++) {
                            for (let Y = enemy.y - 1; Y <= enemy.y + 1; Y++) {
                                if ((X != enemy.x || Y != enemy.y)
                                    && !KinkyDungeonEntityAt(X, Y)
                                    && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y))
                                    && KDistEuclideanSquared(X - Entity.x, Y - Entity.y) < mindistSQ2) {
                                    mindistSQ2 = KDistEuclideanSquared(X - Entity.x, Y - Entity.y);
                                    slot2 = { x: X, y: Y };
                                }
                            }
                        }
                        if (slot2) {
                            KDMoveEntity(enemy, slot2.x, slot2.y, false);
                        }
                        else {
                            let pointSwap = KinkyDungeonGetNearbyPoint(slot.x, slot.y, true, undefined, true, true, undefined, false, false);
                            if (pointSwap)
                                KDMoveEntity(enemy, pointSwap.x, pointSwap.y, false, undefined, undefined, true);
                            else
                                KDMoveEntity(enemy, Entity.x, Entity.y, false, undefined, undefined, true);
                        }
                    }
                    exceeded = true;
                    if (enemy?.player)
                        continue;
                    if (KinkyDungeonMapGet(slot.x, slot.y) == 'D')
                        KinkyDungeonMapSet(slot.x, slot.y, 'd');
                    if (Entity.player) {
                        KDMovePlayer(slot.x, slot.y, false, undefined, undefined);
                    }
                    else {
                        KDMoveEntity(Entity, slot.x, slot.y, false, undefined, undefined);
                    }
                    if (Entity.player)
                        KinkyDungeonSetFlag("pulled", 1);
                    else
                        KinkyDungeonSetEnemyFlag(Entity, "pulled", 1);
                    if (Entity.player)
                        KinkyDungeonSetFlag("leashtug", 3);
                    else
                        KinkyDungeonSetEnemyFlag(Entity, "leashtug", 3);
                    if (Entity.player) {
                        KinkyDungeonInterruptSleep();
                        KinkyDungeonSendEvent("leashTug", { Entity: Entity, slot: slot, item: restraint });
                        if (KinkyDungeonLeashingEnemy()) {
                            KinkyDungeonSetEnemyFlag(KinkyDungeonLeashingEnemy(), "harshpull", 5);
                        }
                        if (Msg && restraint)
                            KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonTetherPull").replace("TETHER", KDGetItemName(restraint.item)), KDBaseRed, 2, true);
                    }
                }
            }
        }
        return exceeded;
    }
    return false;
}
function KDWillingLeash(entity) {
    return entity?.personality != undefined
        && KDLeashablePersonalities[entity.personality]
        && KDLeashablePersonalities[entity.personality](entity, KDPlayer());
}
function KDReleaseDueToLeashFlags(player) {
    KinkyDungeonSetFlag("Released", 15);
    KinkyDungeonSetFlag("nojailbreak", 15);
}
//# sourceMappingURL=KDTethers.js.map