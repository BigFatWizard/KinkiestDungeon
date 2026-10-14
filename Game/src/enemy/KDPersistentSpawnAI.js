"use strict";
let KDPersistentSpawnAIList = {
    Default: {
        cooldown: 50,
        filter: (id, mapData) => {
            let npc = KDGetPersistentNPC(id);
            return KinkyDungeonCurrentTick >= (npc.nextSpawnTick || 0) && !npc.captured && KDNPCCanWander(npc.id);
        },
        chance: (id, mapData) => {
            let npc = KDGetPersistentNPC(id);
            return mapData == KDMapData ? 1.0 : 0.1;
        },
        doSpawn: (id, mapData, entity) => {
            if (!entity && !mapData.Entities.some((ent) => {
                return ent.id == id;
            })) {
                let npc = KDGetPersistentNPC(id);
                if (!npc.entity)
                    return false;
                if (npc.entity.hp <= 0) {
                    let packed = KDUnPackEnemy(npc.entity);
                    if (KDRandom() > npc.entity.hp / Math.max(1, npc.entity.Enemy.maxhp)) {
                        npc.entity.hp = Math.min(npc.entity.Enemy.maxhp, npc.entity.hp + npc.entity.hp * KDNPCHealPercent(npc.entity));
                        if (packed)
                            KDPackEnemy(npc.entity);
                        return true;
                    }
                    if (packed)
                        KDPackEnemy(npc.entity);
                }
                let ent = KDAddEntity(npc.entity, false, false, true, mapData);
                if (mapData == KDMapData) {
                    ent.runSpawnAI = true;
                    ent.spawnTick = KinkyDungeonCurrentTick;
                    entity = ent;
                }
                else {
                    ent.x = mapData.StartPosition.x;
                    ent.y = mapData.StartPosition.y;
                    ent.runSpawnAI = true;
                    ent.spawnTick = KinkyDungeonCurrentTick;
                    return true;
                }
            }
            if (entity && entity.runSpawnAI) {
                let npc = KDGetPersistentNPC(id);
                let point = (npc.fromType == undefined || npc.fromType == -1) ? KinkyDungeonGetRandomEnemyPoint(true, false, undefined, undefined, 10) : mapData.StartPosition;
                if (npc.fromType == 1) {
                    point = mapData.EndPosition;
                }
                else if (npc.fromType == 2) {
                    if (npc.fromIndex)
                        point = KDGetNearestExitTo(npc.fromIndex, mapData.mapX, mapData.mapY, point.x, point.y, mapData, true);
                }
                if (point && KinkyDungeonEntityAt(point.x, point.y)) {
                    let pp = point;
                    point = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, true);
                    if (!point) {
                        point = KinkyDungeonGetNearbyPoint(pp.x, pp.y, true);
                    }
                }
                if (point && (KinkyDungeonCurrentTick != entity.spawnTick || KDistChebyshev(point.x - KDPlayer().x, point.y - KDPlayer().y) > 5)) {
                    KDMoveEntity(entity, point.x, point.y, false, false, false, false, true, mapData);
                    entity.runSpawnAI = false;
                    delete npc.fromIndex;
                    delete npc.fromType;
                    if (!entity.spawnTick || KinkyDungeonCurrentTick > entity.spawnTick + 8) {
                        let time = KinkyDungeonCurrentTick - (entity.spawnTick || 0);
                        let pp2 = KinkyDungeonGetRandomEnemyPointCriteria((x, y) => {
                            return KDistChebyshev(x - point.x, y - point.y) < time;
                        }, false, false);
                        if (pp2) {
                            KDMoveEntity(entity, pp2.x, pp2.y, false, false, false, false, true, mapData);
                        }
                    }
                    entity.visual_x = entity.x;
                    entity.visual_y = entity.y;
                    return true;
                }
                else {
                    KDRemoveEntity(entity, false, false, true, undefined, mapData);
                    return true;
                }
            }
            return false;
        },
    },
    Dragon: {
        cooldown: 50,
        filter: (id, mapData) => {
            let npc = KDGetPersistentNPC(id);
            return KinkyDungeonCurrentTick >= (npc.nextSpawnTick || 0) && !npc.captured && KDNPCCanWander(npc.id);
        },
        chance: (id, mapData) => {
            if (!KDIDHasFlag(id, "LairCheck"))
                return 1.0;
            let npc = KDGetPersistentNPC(id);
            if (npc.nextSpawnTick == KinkyDungeonCurrentTick)
                return 1.0;
            return mapData == KDMapData ? 1.0 : 0.1;
        },
        doSpawn: (id, mapData, entity) => {
            if (!entity && !mapData.Entities.some((ent) => {
                return ent.id == id;
            })) {
                let npc = KDGetPersistentNPC(id);
                if (!npc.entity)
                    return false;
                if (npc.entity.hp <= 0) {
                    let packed = KDUnPackEnemy(npc.entity);
                    if (KDRandom() > npc.entity.hp / Math.max(1, npc.entity.Enemy.maxhp)) {
                        npc.entity.hp = Math.min(npc.entity.Enemy.maxhp, npc.entity.hp + npc.entity.hp * KDNPCHealPercent(npc.entity));
                        if (packed)
                            KDPackEnemy(npc.entity);
                        return true;
                    }
                    if (packed)
                        KDPackEnemy(npc.entity);
                }
                let ent = KDAddEntity(npc.entity, false, false, true, mapData);
                if (mapData == KDMapData) {
                    ent.runSpawnAI = true;
                    ent.spawnTick = KinkyDungeonCurrentTick;
                    entity = ent;
                }
                else {
                    ent.x = mapData.StartPosition.x;
                    ent.y = mapData.StartPosition.y;
                    ent.runSpawnAI = true;
                    ent.spawnTick = KinkyDungeonCurrentTick;
                    return true;
                }
            }
            if (entity && entity.runSpawnAI) {
                let npc = KDGetPersistentNPC(id);
                let point = (npc.fromType == undefined || npc.fromType == -1) ? KinkyDungeonGetRandomEnemyPoint(true, false, undefined, undefined, 10) : mapData.StartPosition;
                if (npc.fromType == 1) {
                    point = mapData.EndPosition;
                }
                else if (npc.fromType == 2) {
                    if (npc.fromIndex)
                        point = KDGetNearestExitTo(npc.fromIndex, mapData.mapX, mapData.mapY, point.x, point.y, mapData, true);
                }
                if (point && KinkyDungeonEntityAt(point.x, point.y)) {
                    let pp = point;
                    point = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, true);
                    if (!point) {
                        point = KinkyDungeonGetNearbyPoint(pp.x, pp.y, true);
                    }
                }
                if (point && (KinkyDungeonCurrentTick != entity.spawnTick || KDistChebyshev(point.x - KDPlayer().x, point.y - KDPlayer().y) > 5)) {
                    KDMoveEntity(entity, point.x, point.y, false, false, false, false, true, mapData);
                    entity.runSpawnAI = false;
                    delete npc.fromIndex;
                    delete npc.fromType;
                    if (!entity.spawnTick || KinkyDungeonCurrentTick > entity.spawnTick + 8) {
                        let time = KinkyDungeonCurrentTick - (entity.spawnTick || 0);
                        let pp2 = KinkyDungeonGetRandomEnemyPointCriteria((x, y) => {
                            return KDistChebyshev(x - point.x, y - point.y) < time;
                        }, false, false);
                        if (pp2) {
                            KDMoveEntity(entity, pp2.x, pp2.y, false, false, false, false, true, mapData);
                        }
                    }
                    entity.visual_x = entity.x;
                    entity.visual_y = entity.y;
                    return true;
                }
                else {
                    KDRemoveEntity(entity, false, false, true, undefined, mapData);
                    return true;
                }
            }
            return false;
        },
    },
};
function KDNPCHealPercent(entity) {
    return 0.04;
}
//# sourceMappingURL=KDPersistentSpawnAI.js.map