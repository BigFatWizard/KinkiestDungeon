"use strict";
let KDCancelEvents = {
    JourneyChoice: (_x, _y, _tile, data) => {
        if (data.force)
            return "";
        KinkyDungeonState = "JourneyMap";
        KDGameData.JourneyTarget = null;
        KDGameData.UseJourneyTarget = true;
    },
};
let KDCancelFilters = {
    JourneyChoice: (_x, _y, _tile, data) => {
        if (data.force)
            return "";
        if ((!KDGameData.JourneyTarget || !KDGameData.UseJourneyTarget) && data.AdvanceAmount > 0) {
            if (KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY]?.Connections.length > 0) {
                return "JourneyChoice";
            }
        }
        return "";
    },
    ProtectOldSaves: (_x, _y, _tile, data) => {
        if (!KDMapData.RoomType && (KDMapData.mapX == undefined || !(KDGetWorldMapLocation(KDCoordToPoint(KDGetCurrentLocation()))?.jx !== undefined))) {
            return "NoJourneyTarget";
        }
        return "";
    },
};
function KDWettable(entity) {
    return entity.player || (!entity.Enemy.tags.acidimmune && !entity.Enemy.tags.acidresist && !entity.Enemy.tags.nowet);
}
function KDConducting(entity) {
    return entity.player || (!entity.Enemy.tags.electricimmune && !entity.Enemy.tags.electric && !entity.Enemy.tags.noconduct);
}
function KinkyDungeonHandleTilesEnemy(enemy, _delta) {
    let tile = KinkyDungeonMapGet(enemy.x, enemy.y);
    if (tile == 'w') {
        if (KDWettable(enemy) && !KDIsFlying(enemy)) {
            if (!enemy.buffs)
                enemy.buffs = {};
            let b1 = Object.assign({}, KDDrenched);
            b1.duration = 6;
            let b2 = Object.assign({}, KDDrenched2);
            b2.duration = 6;
            let b3 = Object.assign({}, KDDrenched3);
            b3.duration = 6;
            KinkyDungeonApplyBuffToEntity(enemy, b1);
            KinkyDungeonApplyBuffToEntity(enemy, b2);
            KinkyDungeonApplyBuffToEntity(enemy, b3);
            KinkyDungeonApplyBuffToEntity(enemy, KDSlowedSlightly);
        }
    }
}
function KDPeripheralTileEffects(_delta) {
    let tileUp = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y - 1);
    let tileL = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x - 1, KinkyDungeonPlayerEntity.y);
    let tileR = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x + 1, KinkyDungeonPlayerEntity.y);
    let tileD = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y + 1);
    if (tileUp == ",") {
        KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonHookLow"), KDBaseLightGreen, 1, true);
    }
    else if (tileUp == "4" || tileL == '4' || tileR == '4' || tileD == '4') {
        KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonCrack"), KDBaseLightGreen, 1, true);
    }
}
function KinkyDungeonUpdateTileEffects(delta) {
    let tile = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
    if (KDTileUpdateFunctions[tile] && KDTileUpdateFunctions[tile](delta)) {
    }
    else {
        KDPeripheralTileEffects(delta);
    }
    for (let X = 1; X < KDMapData.GridWidth - 1; X++) {
        for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++) {
            let tt = KinkyDungeonMapGet(X, Y);
            if (KDTileUpdateFunctionsLocal[tt])
                KDTileUpdateFunctionsLocal[tt](delta, X, Y);
        }
    }
}
let KinkyDungeonChestConfirm = false;
function KinkyDungeonHandleMoveToTile(toTile) {
    if (toTile == 's' || toTile == 'H' || (toTile == 'S' && ((!KinkyDungeonAltFloor(KDGameData.RoomType)?.noReverse)))) {
        if (KinkyDungeonConfirmStairs && KinkyDungeonLastAction == "Wait") {
            KinkyDungeonConfirmStairs = false;
            KinkyDungeonHandleStairs(toTile);
        }
        else if (!(KDGameData.SleepTurns > 0)) {
            if (KinkyDungeonLastAction == "Move" || KinkyDungeonLastAction == "Wait") {
                KinkyDungeonConfirmStairs = true;
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/ClickError.ogg");
            }
            KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonConfirmStairs"), KDBaseWhite, 1, true);
        }
    }
}
function KDCanEscape(method) {
    return KinkyDungeonEscapeTypes[method].check();
}
function KDGetEscapeMinimapText(method) {
    return KinkyDungeonEscapeTypes[method].minimaptext();
}
function KDGetEscapeDoorText(method) {
    return KinkyDungeonEscapeTypes[method].doortext();
}
function KDGetEscapeMethod(_level) {
    let alt = KDGetAltType(MiniGameKinkyDungeonLevel);
    if (alt?.escapeMethod)
        return alt.escapeMethod;
    if (alt?.nokeys)
        return "None";
    let data = { altType: alt, escapeMethod: KDMapData.EscapeMethod };
    KinkyDungeonSendEvent("calcEscapeMethod", data);
    if (KinkyDungeonEscapeTypes[data.escapeMethod]) {
        KDMapData.EscapeMethod = data.escapeMethod;
        return data.escapeMethod;
    }
    else
        return "None";
}
function KDGetRandomEscapeMethod(RoomType, MapMod, Level, Faction) {
    let choices = {};
    for (let method of Object.keys(KinkyDungeonEscapeTypes)) {
        let weight = KinkyDungeonEscapeTypes[method].filterRandom ?
            KinkyDungeonEscapeTypes[method].filterRandom(RoomType, MapMod, Level, Faction)
            : 1;
        if (KinkyDungeonEscapeTypes[method].selectValid
            && (weight >= 1 || KDRandom() < weight)) {
            choices[method] = weight;
        }
    }
    return KDGetByWeight(choices);
}
function KDEffectTileTagTime(x, y, tag, mapData) {
    let ret = 0;
    let tiles = KDGetEffectTiles(x, y, mapData);
    if (tiles) {
        for (let ti of Object.values(tiles)) {
            if (ti.tags) {
                for (let t of ti.tags) {
                    if (t == tag)
                        ret = Math.max(ret, ti.duration + (ti.pauseDuration || 0));
                }
            }
        }
    }
    return ret;
}
function KDEffectTileTags(x, y, mapData) {
    let ret = {};
    let tiles = KDGetEffectTiles(x, y, mapData);
    if (tiles) {
        for (let t of Object.values(tiles)) {
            if (t.tags) {
                for (let tag of t.tags) {
                    ret[tag] = true;
                }
            }
        }
    }
    return ret;
}
function KDEffectTileTagsLoc(loc, mapData) {
    let tiles = KDGetEffectTilesLoc(loc, mapData);
    if (tiles) {
        let ret = {};
        for (let t of Object.values(tiles)) {
            if (t.tags) {
                for (let tag of t.tags) {
                    ret[tag] = true;
                }
            }
        }
        return ret;
    }
    return undefined;
}
let KinkyDungeonConfirmStairs = false;
function KinkyDungeonHandleMoveObject(moveX, moveY, moveObject) {
    if (KDMapData.GroundItems.some((item) => { return item.x == moveX && item.y == moveY; })) {
        KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
    }
    if (KDMoveObjectFunctions[moveObject]) {
        return KDMoveObjectFunctions[moveObject](moveX, moveY);
    }
    return false;
}
function KDHasEffectTile(x, y) {
    return KinkyDungeonEffectTilesGet(x + "," + y) != undefined;
}
function KDGetEffectTiles(x, y, mapData) {
    let str = x + "," + y;
    if (!mapData)
        mapData = KDMapData;
    return KinkyDungeonEffectTilesGet(str, mapData) ? KinkyDungeonEffectTilesGet(str, mapData) : {};
}
function KDGetEffectTilesLoc(str, mapData) {
    if (!mapData)
        mapData = KDMapData;
    return KinkyDungeonEffectTilesGet(str, mapData) ? KinkyDungeonEffectTilesGet(str, mapData) : {};
}
function KDGetSpecificEffectTile(x, y, tile) {
    return KDGetEffectTiles(x, y)[tile];
}
function KDCreateEffectTile(x, y, tile, durationMod) {
    if (x < 0 || y < 0 || x >= KDMapData.GridWidth || y >= KDMapData.GridHeight)
        return null;
    let existingTile = KDGetSpecificEffectTile(x, y);
    let duration = (tile.duration ? tile.duration : KDEffectTiles[tile.name].duration) + KDRandom() * (durationMod ? durationMod : 0);
    let createdTile = existingTile;
    if (existingTile && existingTile.duration < tile.duration) {
        existingTile.duration = duration;
    }
    else {
        let tt = Object.assign({ x: x, y: y }, KDEffectTiles[tile.name]);
        Object.assign(tt, tile);
        tt.duration = duration;
        if (!KinkyDungeonEffectTilesGet(x + "," + y)) {
            KinkyDungeonEffectTilesSet(x + "," + y, {});
        }
        KDGetEffectTiles(x, y)[tt.name] = tt;
        createdTile = tt;
    }
    if (createdTile) {
        KDInteractNewTile(createdTile);
        return createdTile;
    }
    return null;
}
function KDInteractNewTile(newTile) {
    let Creator = KDEffectTileCreateFunctionsCreator[newTile.functionName || newTile.name];
    let Existing = null;
    for (let tile of Object.values(KDGetEffectTiles(newTile.x, newTile.y))) {
        if (tile != newTile) {
            if (Creator)
                Creator(newTile, tile);
            if (tile.duration > 0) {
                Existing = KDEffectTileCreateFunctionsExisting[tile.functionName || tile.name];
                if (Existing)
                    Existing(newTile, tile);
            }
        }
    }
}
function KDCreateAoEEffectTiles(x, y, tile, durationMod, rad, avoidPoint, density, mod = "", criteria, forEach) {
    for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
        for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
            if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x + X, Y + y))
                && AOECondition(x, y, x + X, y + Y, rad, mod)
                && (!avoidPoint || avoidPoint.x != X + x || avoidPoint.y != Y + y)
                && (density == undefined || KDRandom() < density)
                && (!criteria || criteria(x + X, y + Y))) {
                let tt = KDCreateEffectTile(x + X, y + Y, tile, durationMod);
                if (forEach)
                    forEach(x + X, y + Y, tt);
            }
        }
}
function KDRemoveAoEEffectTiles(x, y, tagsToRemove, rad, avoidPoint, density, mod = "") {
    for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
        for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
            if (AOECondition(x, y, x + X, y + Y, rad, mod) && (!avoidPoint || avoidPoint.x != X + x || avoidPoint.y != Y + y) && (density == undefined || KDRandom() < density)) {
                let tiles = KDGetEffectTiles(x + X, y + Y);
                for (let tile of Object.values(tiles)) {
                    if (tagsToRemove.length == 0) {
                        tile.duration = 0;
                    }
                    else {
                        for (let tag of tagsToRemove) {
                            if (tile.tags && tile.tags.includes(tag)) {
                                tile.duration = 0;
                                break;
                            }
                        }
                    }
                }
            }
        }
}
function KDApplyAlpha(id, alpha, fade, delta, phase = 0) {
    if (!fade)
        return 1.0;
    switch (fade) {
        case "random": {
            if (alpha >= 1 || alpha <= 0)
                KDTileModes[id] = !KDTileModes[id];
            return Math.max(0, Math.min(1, alpha + (KDTileModes[id] ? -delta * 0.001 : delta * 0.001)));
        }
        case "sine3000": {
            return Math.max(0, Math.min(1, .5 + 0.25 * Math.sin(phase + CommonTime() / 3000)));
        }
        case "sine1000": {
            return Math.max(0, Math.min(1, .5 + 0.25 * Math.sin(phase + CommonTime() / 1000)));
        }
        case "scan": {
            return Math.max(0, Math.min(1, .65 + 0.3 * Math.sin(phase + 6.28 * CommonTime() / 600)));
        }
        case "ice": {
            return Math.max(0, Math.min(1, .5 + 0.25 * Math.sin(phase + CommonTime() / 2500)));
        }
    }
}
let KDTileModes = {};
function KDEasePosition(x, y, tx, ty, speed, delta, ease) {
    switch (ease) {
        default: {
            let dd = KDistEuclidean(tx - x, ty - y);
            if (dd > 0) {
                let dx = speed * delta * (tx - x) / dd;
                let dy = speed * delta * (ty - y) / dd;
                if (tx > x)
                    x = Math.min(tx, x + dx);
                else if (tx < x)
                    x = Math.max(tx, x + dx);
                if (ty > y)
                    y = Math.min(ty, y + dy);
                else if (ty < y)
                    y = Math.max(ty, y + dy);
            }
            return { x: x, y: y };
        }
    }
}
let KDLastEffTileUpdate = 0;
function KDDrawEffectTiles(_canvasOffsetX, _canvasOffsetY, CamX, CamY) {
    let delta = CommonTime() - KDLastEffTileUpdate;
    KDLastEffTileUpdate = CommonTime();
    for (let tileLocation of Object.values(KDMapData.EffectTiles)) {
        for (let tile of Object.values(tileLocation)) {
            let sprite = (tile.pauseDuration > 0 && tile.pauseSprite) ? tile.pauseSprite : (tile.skin ? tile.skin : tile.name);
            if (tile.x >= CamX && tile.y >= CamY && tile.x < CamX + KinkyDungeonGridWidthDisplay && tile.y < CamY + KinkyDungeonGridHeightDisplay && KinkyDungeonVisionGet(tile.x, tile.y) > 0) {
                if (!KDCanSeeEffectTile(tile))
                    continue;
                let tileid = tile.x + "," + tile.y + "_" + sprite;
                let color = undefined;
                if (!tile.colorforcetint && tile.tags?.includes("terrain")) {
                    color = KDGetLightColor(tile.x, tile.y);
                }
                let op = {
                    zIndex: -0.1 + 0.01 * tile.priority,
                    alpha: KDApplyAlpha(tileid, kdpixisprites.get(tileid)?.alpha, tile.fade, delta, tile.phase),
                };
                if (tile.spin) {
                    op['anchorx'] = 0.5;
                    op['anchory'] = 0.5;
                    if (tile.spinAngle == undefined)
                        tile.spinAngle = 0;
                    tile.spinAngle += tile.spin * KDTimescale * delta;
                    if (tile.spinAngle > Math.PI * 2)
                        tile.spinAngle -= Math.PI * 2;
                    else if (tile.spinAngle < 0)
                        tile.spinAngle += Math.PI * 2;
                }
                if (KDBulletTransparency) {
                    if (tile.duration < 9000) {
                        op.alpha *= 0.7;
                    }
                }
                if (tile.yfade) {
                    if (!TileYFade[tileid])
                        TileYFade[tileid] = KDRandom();
                    TileYFade[tileid] = KDApplyAlpha(tileid, TileYFade[tileid], tile.yfade, delta, tile.phase);
                }
                if (tile.colorforcetint) {
                    op.tint = string2hex(tile.colorforcetint);
                }
                else {
                    if (color != undefined)
                        op.tint = color;
                    if (tile.colortint) {
                        op.tint = KDAvgColor(string2hex(tile.colortint), color, 3, 1);
                    }
                }
                KDDraw(kdeffecttileboard, kdpixisprites, tileid, KinkyDungeonRootDirectory + "EffectTiles/" + sprite + ".png", (tile.x + (tile.xoffset ? tile.xoffset : 0) - CamX) * KinkyDungeonGridSizeDisplay, (tile.y - CamY + (tile.yoffset ? tile.yoffset : 0) + (tile.yfadeamount ? tile.yfadeamount * TileYFade[tileid] : 0)) * KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KDAnimQuantize(Math.PI / 4 * (tile.spin || 1), tile.spinAngle), op);
            }
        }
    }
}
let TileYFade = {};
function KDCanSeeEffectTile(tile) {
    if (KinkyDungeonState != "TileEditor" && tile.tags?.includes("hiddenmagic")) {
        let rad = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "MagicalSight");
        if (rad <= 0 || KDistEuclidean(tile.x - KinkyDungeonPlayerEntity.x, tile.y - KinkyDungeonPlayerEntity.y) > rad)
            return false;
    }
    return true;
}
function KDUpdateEffectTiles(delta) {
    for (let examinedTile of Object.values(KDGetEffectTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y))) {
        if (examinedTile)
            KinkyDungeonUpdateSingleEffectTile(delta, KinkyDungeonPlayerEntity, examinedTile);
    }
    for (let enemy of KDMapData.Entities) {
        for (let examinedTile of Object.values(KDGetEffectTiles(enemy.x, enemy.y))) {
            if (examinedTile)
                if (examinedTile)
                    KinkyDungeonUpdateSingleEffectTile(delta, enemy, examinedTile);
        }
    }
    for (let loc of Object.entries(KDMapData.EffectTiles)) {
        let location = loc[1];
        for (let t of Object.entries(location)) {
            if (t[1].pauseDuration > 0) {
                t[1].pauseDuration -= delta;
            }
            else if (!t[1].infinite) {
                if (t[1].duration > 0 && t[1].duration < 9000)
                    t[1].duration -= delta;
            }
            if (t[1].pauseDuration <= 0.001)
                t[1].pauseSprite = undefined;
            if (t[1].duration <= 0.001)
                delete location[t[0]];
            else {
                KinkyDungeonUpdateSingleEffectTileStandalone(delta, t[1]);
            }
        }
        if (Object.values(loc[1]).length < 1) {
            delete KDMapData.EffectTiles[loc[0]];
        }
    }
}
function KinkyDungeonUpdateSingleEffectTile(delta, entity, tile) {
    if (tile.duration > 0 && KDEffectTileFunctions[tile.functionName || tile.name]) {
        KDEffectTileFunctions[tile.functionName || tile.name](delta, entity, tile);
    }
}
function KinkyDungeonUpdateSingleEffectTileStandalone(delta, tile) {
    if (tile.noWalls && !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(tile.x, tile.y))) {
        tile.duration = 0;
    }
    if (tile.duration > 0 && KDEffectTileFunctionsStandalone[tile.functionName || tile.name]) {
        KDEffectTileFunctionsStandalone[tile.functionName || tile.name](delta, tile);
    }
}
function KinkyDungeonBulletInteractionSingleEffectTile(b, tile, d) {
    if (tile.duration > 0 && KDEffectTileBulletFunctions[tile.functionName || tile.name]) {
        KDEffectTileBulletFunctions[tile.functionName || tile.name](b, tile, d);
    }
}
function KDEffectTileInteractions(x, y, b, d) {
    for (let examinedTile of Object.values(KDGetEffectTiles(x, y))) {
        if (examinedTile)
            KinkyDungeonBulletInteractionSingleEffectTile(b, examinedTile, d);
    }
}
function KDMoveEntity(enemy, x, y, willing, dash, forceHitBullets, ignoreBlocked, noEvent, mapData) {
    if (!mapData)
        mapData = KDMapData;
    if (noEvent) {
        enemy.x = x;
        enemy.y = y;
        if (mapData == KDMapData && (enemy.x != enemy.lastx || enemy.y != enemy.lasty))
            KDUpdateEnemyCache = true;
        enemy.lastx_avg = ((enemy.lastx_avg || 0) + enemy.x) * 0.5;
        enemy.lasty_avg = ((enemy.lasty_avg || 0) + enemy.y) * 0.5;
        if (Math.abs(enemy.lastx_avg - enemy.x) < 0.05)
            enemy.lastx_avg = enemy.x;
        if (Math.abs(enemy.lasty_avg - enemy.y) < 0.05)
            enemy.lasty_avg = enemy.y;
        enemy.lastx = enemy.x;
        enemy.lasty = enemy.y;
        enemy.lastmove = KinkyDungeonCurrentTick;
        return false;
    }
    enemy.lastx = enemy.x;
    enemy.lasty = enemy.y;
    let cancel = { cancelmove: false, returnvalue: false };
    if (mapData == KDMapData)
        for (let newTile of Object.values(KDGetEffectTiles(x, y))) {
            if (newTile.duration > 0 && KDEffectTileMoveOnFunctions[newTile.name]) {
                cancel = KDEffectTileMoveOnFunctions[newTile.name](enemy, newTile, willing, { x: x - enemy.x, y: y - enemy.y }, dash);
            }
        }
    if (!ignoreBlocked && KinkyDungeonEntityAt(x, y, undefined, undefined, undefined, undefined, mapData))
        cancel.cancelmove = true;
    if (!cancel.cancelmove) {
        enemy.x = x;
        enemy.y = y;
        if (mapData == KDMapData) {
            KinkyDungeonSendEvent("enemyMove", {
                cancelmove: cancel.cancelmove,
                returnvalue: cancel.returnvalue,
                willing: willing,
                sprint: dash,
                lastX: enemy.lastx,
                lastY: enemy.lasty,
                moveX: x,
                moveY: y,
                enemy: enemy,
            });
            KDCheckCollideableBullets(enemy, forceHitBullets);
        }
        enemy.fx = undefined;
        enemy.fy = undefined;
        if (enemy.x != enemy.lastx || enemy.y != enemy.lasty)
            KDUpdateEnemyCache = true;
    }
    return cancel.returnvalue;
}
function KDStaggerEnemy(enemy) {
    enemy.fx = undefined;
    enemy.fy = undefined;
    enemy.movePoints = 0;
    KinkyDungeonSetEnemyFlag(enemy, "stagger", 2);
}
function KDMovePlayer(moveX, moveY, willing, sprint, forceHitBullets, suppressNoise, noEvent) {
    KinkyDungeonPlayerEntity.lastx = KinkyDungeonPlayerEntity.x;
    KinkyDungeonPlayerEntity.lasty = KinkyDungeonPlayerEntity.y;
    KinkyDungeonPlayerEntity.lastx_avg = ((KinkyDungeonPlayerEntity.lastx_avg || 0) + KinkyDungeonPlayerEntity.x) * 0.5;
    KinkyDungeonPlayerEntity.lasty_avg = ((KinkyDungeonPlayerEntity.lasty_avg || 0) + KinkyDungeonPlayerEntity.y) * 0.5;
    if (Math.abs(KinkyDungeonPlayerEntity.lastx_avg - KinkyDungeonPlayerEntity.x) < 0.05)
        KinkyDungeonPlayerEntity.lastx_avg = KinkyDungeonPlayerEntity.x;
    if (Math.abs(KinkyDungeonPlayerEntity.lasty_avg - KinkyDungeonPlayerEntity.y) < 0.05)
        KinkyDungeonPlayerEntity.lasty_avg = KinkyDungeonPlayerEntity.y;
    KinkyDungeonPlayerEntity.lastmove = KinkyDungeonCurrentTick;
    let cancel = { cancelmove: false, returnvalue: false };
    for (let newTile of Object.values(KDGetEffectTiles(moveX, moveY))) {
        if (newTile.duration > 0 && KDEffectTileMoveOnFunctions[newTile.name]) {
            cancel = KDEffectTileMoveOnFunctions[newTile.name](KinkyDungeonPlayerEntity, newTile, willing, { x: moveX - KinkyDungeonPlayerEntity.x, y: moveY - KinkyDungeonPlayerEntity.y }, sprint);
        }
    }
    if (!cancel.cancelmove) {
        if (willing) {
            if (moveX > KinkyDungeonPlayerEntity.x) {
                KDFlipPlayer = true;
            }
            else if (moveX < KinkyDungeonPlayerEntity.x) {
                KDFlipPlayer = false;
            }
        }
        else {
            KinkyDungeonSetFlag("forceMoved", 1);
        }
        KinkyDungeonPlayerEntity.x = moveX;
        KinkyDungeonPlayerEntity.y = moveY;
    }
    let data = {
        cancelmove: cancel.cancelmove,
        returnvalue: cancel.returnvalue,
        willing: willing,
        sprint: sprint,
        lastX: KinkyDungeonPlayerEntity.lastx,
        lastY: KinkyDungeonPlayerEntity.lasty,
        moveX: moveX,
        moveY: moveY,
        sound: (sprint && !suppressNoise) ? (4) : 0,
        dist: KDistChebyshev(KinkyDungeonPlayerEntity.lastx - moveX, KinkyDungeonPlayerEntity.lasty - moveY),
    };
    if (!noEvent)
        KinkyDungeonSendEvent("playerMove", data);
    if (data.sound > 0) {
        KinkyDungeonMakeNoise(data.sound, data.moveX, data.moveY);
    }
    if (!cancel.cancelmove) {
        KDCheckCollideableBullets(KinkyDungeonPlayerEntity, forceHitBullets);
        KinkyDungeonHandleTraps(KinkyDungeonPlayerEntity, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonTrapMoved);
    }
    return cancel.returnvalue;
}
function KDSlip(dir) {
    KinkyDungeonFastMovePath = [];
    let maxSlip = 2;
    let maxReached = 0;
    for (let i = 0; i < maxSlip; i++) {
        let newTiles = KDGetEffectTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
        let oldTiles = KDGetEffectTiles(KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y);
        if ((Object.values(newTiles).some((tile) => {
            return tile.tags?.includes("slippery")
                || ((tile.statuses?.frozen || tile.name.includes("Frozen")) && tile.tags?.includes("slipperywhenfrozen"));
        })
            || Object.values(oldTiles).some((tile) => {
                return tile.tags?.includes("slippery")
                    || ((tile.statuses?.frozen || tile.name.includes("Frozen")) && tile.tags?.includes("slipperywhenfrozen"));
            }))
            && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y))
            && !KinkyDungeonEnemyAt(KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y)) {
            KDMovePlayer(KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y, false, true, false, true);
            KinkyDungeonHandleStepOffTraps(KinkyDungeonPlayerEntity, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y);
            KinkyDungeonHandleTraps(KinkyDungeonPlayerEntity, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true);
            maxReached = i;
        }
        else {
            i = maxSlip;
        }
    }
    if (maxReached) {
        KinkyDungeonSendActionMessage(10, TextGet("KDSlipIce"), "yellow", maxReached + 1);
        KDGameData.SlowMoveTurns = Math.max(KDGameData.SlowMoveTurns, 1);
        KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, { id: "Slipping", type: "none", power: 1.0, duration: 1, });
        return true;
    }
    return false;
}
function KDInferno(existingTile, newTile, duration) {
    if (newTile.tags.includes("fire") || newTile.tags.includes("ignite")) {
        existingTile.duration = 0;
        KDCreateEffectTile(existingTile.x, existingTile.y, {
            name: "Inferno",
            duration: duration,
        }, 2);
        return true;
    }
    return false;
}
function KDGrow(tile, type, duration = 20, chance = 0.1, refreshDuration = 20) {
    if (KDEffectTileTags(tile.x, tile.y).wet && KDRandom() < chance
        && KDGrowableTiles.includes(KinkyDungeonMapGet(tile.x, tile.y))) {
        tile.duration = Math.max(tile.duration, refreshDuration);
        let xx = Math.floor(KDRandom() * 3) - 1;
        let yy = Math.floor(KDRandom() * 3) - 1;
        if (xx == 0 && yy == 0)
            xx = KDRandom() > 0.5 ? 1 : -1;
        KDCreateEffectTile(tile.x + xx, tile.y + yy, {
            name: type,
            duration: duration,
        }, 2);
        return true;
    }
    return false;
}
function KDIgnition(b, tile, _d) {
    if (b.bullet.damage) {
        let type = b.bullet.damage.type;
        if ((KDIgnitionSources.includes(type)) && b.bullet.damage.damage > 0) {
            KDCreateEffectTile(tile.x, tile.y, {
                name: "Ember",
                duration: 2,
            }, 1);
        }
    }
}
function KDConveyor(_delta, X, Y, unwilling) {
    let tile = KinkyDungeonTilesGet(X + "," + Y);
    if (!tile || tile.SwitchMode == "Off")
        return;
    let entity = KinkyDungeonEntityAt(X, Y);
    let tiletype = KinkyDungeonMapGet(X + (tile.DX || 0), Y + (tile.DY || 0));
    if (entity?.Enemy?.tags.prisoner) {
        KDStaggerEnemy(entity);
    }
    if (entity && KinkyDungeonMovableTilesEnemy.includes(tiletype) && !KinkyDungeonEntityAt(X + (tile.DX || 0), Y + (tile.DY || 0))) {
        if (entity.player) {
            if (!KinkyDungeonFlags.get("conveyed") && !KinkyDungeonFlags.get("pulled") && (!tile.Sfty || KDPlayerIsStunned() || unwilling || KinkyDungeonFlags.get("conveyed_rec"))) {
                KinkyDungeonSetFlag("conveyed", 2);
                KinkyDungeonSetFlag("conveyed_rec", 3);
                KDMovePlayer(X + (tile.DX || 0), Y + (tile.DY || 0), false, false, true);
                KinkyDungeonSendTextMessage(4, TextGet("KDConveyorPush"), "#ffff44", 2);
            }
        }
        else if (!KDIsImmobile(entity) && !KDEntityHasFlag(entity, "pulled") && !KDIsFlying(entity) && !entity.Enemy.tags.ignoreconveyor && !entity.Enemy.ethereal
            && !((entity.Enemy.tags.unstoppable && (!KinkyDungeonIsDisabled(entity) || !KinkyDungeonIsSlowed(entity)))
                || (entity.Enemy.tags.unflinching && !KinkyDungeonIsDisabled(entity)))) {
            if (!KDEnemyHasFlag(entity, "conveyed") && (!tile.Sfty || KinkyDungeonIsDisabled(entity) || unwilling || KDEnemyHasFlag(entity, "conveyed_rec") || KDEnemyHasFlag(entity, "stagger"))) {
                KinkyDungeonSetEnemyFlag(entity, "conveyed", 2);
                KinkyDungeonSetEnemyFlag(entity, "conveyed_rec", 4);
                KDMoveEntity(entity, X + (tile.DX || 0), Y + (tile.DY || 0), false, false, true);
            }
        }
    }
}
function KDTickSpecialStats() {
    let player = KDPlayer();
    for (let stat of Object.entries(KDSpecialStats)) {
        let buff = KDEntityGetBuff(player, stat[0] + "Stat");
        if (buff?.power > 0)
            KDAddSpecialStat(stat[0], KDPlayer(), -Math.min(buff.power, stat[1].PerFloor(player, buff?.power || 0)), true, 100);
    }
    KDGameData.LockoutChance = 0;
}
function KDAdvanceLevel(data, closeConnections = true, query = false) {
    if (!query) {
        MiniGameKinkyDungeonLevel += data.AdvanceAmount;
        let currentSlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
        if (KDGameData.JourneyTarget && KDGameData.UseJourneyTarget) {
            KDGameData.JourneyX = KDGameData.JourneyTarget.x;
            KDGameData.JourneyY = KDGameData.JourneyTarget.y;
            KDGameData.JourneyTarget = null;
            KDGameData.UseJourneyTarget = false;
        }
        else {
            let JourneyTarget = KDGetWorldMapLocation({ x: KDCurrentWorldSlot.x, y: MiniGameKinkyDungeonLevel })?.jx || 0;
            KDGameData.JourneyX = JourneyTarget;
            KDGameData.JourneyY = MiniGameKinkyDungeonLevel;
            KDGameData.JourneyTarget = null;
            KDGameData.UseJourneyTarget = false;
        }
        if (currentSlot && closeConnections) {
            for (let c of (currentSlot.Connections)) {
                if (c.x == KDGameData.JourneyX && c.y == KDGameData.JourneyY) {
                    currentSlot.Connections = [c];
                    break;
                }
            }
            KDCullJourneyMap();
        }
    }
    return {
        x: 0,
        y: KDCurrentWorldSlot.y + data.AdvanceAmount,
    };
}
let KDAdvanceAmount = {
    'S': (altRoom, altRoomNext, tile) => {
        let data = {
            toTile: 'S',
            altRoom: altRoom,
            altRoomNext: altRoomNext,
            AdvanceAmount: ((MiniGameKinkyDungeonLevel > 0 && altRoomNext?.skiptunnel) ? -1 : 0),
            dataOverride: null,
        };
        KinkyDungeonSendEvent("floorAdvanceAmount", data);
        return {
            AdvanceAmount: data.AdvanceAmount,
            dataOverride: data.dataOverride,
        };
    },
    's': (altRoom, altRoomNext, tile) => {
        let data = {
            toTile: 's',
            altRoom: altRoom,
            altRoomNext: altRoomNext,
            AdvanceAmount: (altRoom?.skiptunnel ? 1 : 0),
            dataOverride: null,
        };
        let CurrentJourneyTile = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
        if (!altRoom?.noAdvance
            && !tile?.RoomType
            && (!KDGameData.RoomType
                || CurrentJourneyTile?.RoomType == (KDGameData.RoomType || "")
                || altRoom?.alwaysAdvance)) {
            if (MiniGameKinkyDungeonLevel == KDGameData.HighestLevelCurrent
                && data.AdvanceAmount == 0) {
                data.dataOverride = {
                    overrideRoomType: true,
                    roomType: "PerkRoom",
                    mapMod: "",
                };
            }
            else
                data.AdvanceAmount = 1;
        }
        else {
            if (!tile?.RoomType) {
                let journeySlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
                if (journeySlot) {
                    data.dataOverride = {
                        overrideRoomType: true,
                        roomType: journeySlot.RoomType || "",
                        mapMod: journeySlot.MapMod || "",
                    };
                }
                else {
                    data.dataOverride = {
                        overrideRoomType: true,
                        roomType: "",
                        mapMod: "",
                    };
                }
            }
            data.AdvanceAmount = 0;
        }
        KinkyDungeonSendEvent("floorAdvanceAmount", data);
        return {
            AdvanceAmount: data.AdvanceAmount,
            dataOverride: data.dataOverride,
        };
    },
    'H': (altRoom, altRoomNext, tile) => {
        let data = {
            toTile: 'H',
            altRoom: altRoom,
            altRoomNext: altRoomNext,
            AdvanceAmount: 0,
            dataOverride: null,
        };
        KinkyDungeonSendEvent("floorAdvanceAmount", data);
        return {
            AdvanceAmount: data.AdvanceAmount,
            dataOverride: data.dataOverride,
        };
    },
};
function KDShouldLock(x, y, tile) {
    if (tile.OGLock && tile.Jail && KDGameData.PrisonerState == 'parole') {
        let nearestJail = KinkyDungeonNearestJailPoint(x, y);
        if (nearestJail) {
            if (KinkyDungeonPointInCell(KDPlayer().x, KDPlayer().y)) {
                return false;
            }
        }
    }
    return tile.OGLock != undefined;
}
function KDShouldUnLock(x, y, tile) {
    return true;
}
let KDDangerousTiles = "V[]";
function KDIsTileDangerous(entity, x, y, mapData) {
    let tile = KinkyDungeonMapDataGet(mapData, x, y);
    if (KDDangerousTiles.includes(tile))
        return true;
    let tags = KDEffectTileTags(x, y, mapData);
    if (tags.dangerous)
        return true;
    if (entity) {
        if (tags.slimedanger && !KDSlimeWalker(entity))
            return true;
        if (tags.soapdanger && !KDSoapWalker(entity))
            return true;
    }
    for (let pd of Object.values(KDPotentialDangers)) {
        if (pd(entity, x, y, mapData, tags))
            return true;
    }
    return false;
}
let KDPotentialDangers = {
    firedanger: (entity, x, y, mapData, tags) => {
        return tags.firedanger && !KinkyDungeonGetImmunity(entity.Enemy?.tags, entity.Enemy?.Resistance?.profile, "fire", "immune", 1);
    },
    icedanger: (entity, x, y, mapData, tags) => {
        return tags.icedanger && !KinkyDungeonGetImmunity(entity.Enemy?.tags, entity.Enemy?.Resistance?.profile, "ice", "immune", 1);
    },
    chaindanger: (entity, x, y, mapData, tags) => {
        return tags.chaindanger && !KinkyDungeonGetImmunity(entity.Enemy?.tags, entity.Enemy?.Resistance?.profile, "chain", "immune", 1);
    },
    gluedanger: (entity, x, y, mapData, tags) => {
        return tags.gluedanger && !KinkyDungeonGetImmunity(entity.Enemy?.tags, entity.Enemy?.Resistance?.profile, "glue", "immune", 1);
    },
    gasdanger: (entity, x, y, mapData, tags) => {
        return tags.gasdanger && !KinkyDungeonGetImmunity(entity.Enemy?.tags, entity.Enemy?.Resistance?.profile, "poisongas", "immune", 1);
    },
    danger: (entity, x, y, mapData, tags) => {
        return true;
    },
    bullet: (entity, x, y, mapData, tags) => {
        return false;
    },
    rune: (entity, x, y, mapData, tags) => {
        return false;
    },
};
function KDAdvanceOneFloor() {
    KDAdvanceTraining(KDPlayer());
    if (KinkyDungeonStatsChoice.get("Trespasser")) {
        KinkyDungeonChangeRep("Rope", -1);
        KinkyDungeonChangeRep("Metal", -1);
        KinkyDungeonChangeRep("Leather", -1);
        KinkyDungeonChangeRep("Latex", -1);
        KinkyDungeonChangeRep("Will", -1);
        KinkyDungeonChangeRep("Elements", -1);
        KinkyDungeonChangeRep("Conjure", -1);
        KinkyDungeonChangeRep("Illusion", -1);
    }
    if (KDGameData.PrisonerState == "jail") {
        KDGameData.PrisonerState = "";
        KinkyDungeonChangeRep("Prisoner", 5);
    }
    else {
        KinkyDungeonChangeRep("Prisoner", -5);
    }
}
function KDRoomUnwanderable(altType) {
    let altRoom = KinkyDungeonAltFloor(altType);
    if (altRoom?.alwaysRegen
        || altRoom?.removePartyMembers
        || (altRoom && !(altRoom?.makeMain || altRoom?.persist))) {
        return true;
    }
    return !altRoom;
}
//# sourceMappingURL=KinkyDungeonTiles.js.map