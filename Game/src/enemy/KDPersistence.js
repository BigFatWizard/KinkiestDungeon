"use strict";
function KDPersistentAddData(id, key, data) {
    let npc = KDPersistentNPCs[id];
    if (npc) {
        if (!npc.data) {
            npc.data = {};
        }
        npc.data[key] = data;
        return true;
    }
    return false;
}
function KDPersistentGetData(id, key) {
    let npc = KDPersistentNPCs[id];
    if (npc) {
        if (npc.data) {
            return npc.data[key];
        }
    }
    return undefined;
}
function KDGetEnemyStoredParty(partyid) {
    let npc = KDIsNPCPersistent(partyid) ? KDGetPersistentNPC(partyid) : undefined;
    if (npc) {
        return npc.storedParty || [];
    }
    return [];
}
function KDGetEnemyPersistentParty(partyid) {
    let npc = KDIsNPCPersistent(partyid) ? KDGetPersistentNPC(partyid) : undefined;
    if (npc) {
        return npc.persistentParty?.filter((id) => {
            return KDIsNPCPersistent(id);
        }).map((id) => {
            return KDGetGlobalEntity(id);
        }) || [];
    }
    return [];
}
function KDGetEnemyStoredPartyIDs(partyid) {
    let npc = KDIsNPCPersistent(partyid) ? KDGetPersistentNPC(partyid) : undefined;
    if (npc) {
        return npc.storedParty?.map((en) => { return en.id; }) || [];
    }
    return [];
}
function KDGetEnemyPersistentPartyIDs(partyid) {
    let npc = KDIsNPCPersistent(partyid) ? KDGetPersistentNPC(partyid) : undefined;
    if (npc) {
        return npc.persistentParty?.filter((id) => {
            return KDIsNPCPersistent(id);
        }) || [];
    }
    return [];
}
function KDGetEnemyParty(partyid) {
    return [...KDGetEnemyPersistentParty(partyid), ...KDGetEnemyStoredParty(partyid)];
}
function KDGetEnemyPartyIDs(partyid) {
    return [...KDGetEnemyPersistentPartyIDs(partyid), ...KDGetEnemyStoredPartyIDs(partyid)];
}
function KDNPCInParty(pmid, partyid) {
    let npc = KDGetPersistentNPC(partyid, undefined, false);
    if (KDIsNPCPersistent(pmid)) {
        if (npc.persistentParty) {
            return npc.persistentParty.includes(pmid);
        }
    }
    else {
        if (npc.storedParty) {
            return npc.storedParty.some((pm) => { return pm.id == pmid; });
        }
    }
    return false;
}
function KDStoreEnemyPartyMember(enemy, partyid, location) {
    if (!enemy)
        return false;
    let npc = KDGetPersistentNPC(partyid, undefined, undefined, location);
    if (npc) {
        if (KDIsNPCPersistent(enemy.id)) {
            if (!npc.persistentParty)
                npc.persistentParty = [];
            if (!npc.persistentParty.some((pm) => { return enemy.id == pm; })) {
                npc.persistentParty.push(enemy.id);
                KDGetPersistentNPC(enemy.id).partyLeader = partyid;
                enemy.partyLeader = partyid;
                return true;
            }
        }
        else {
            if (!npc.storedParty)
                npc.storedParty = [];
            if (!npc.storedParty.some((pm) => { return enemy.id == pm.id; })) {
                npc.storedParty.push(enemy);
                enemy.partyLeader = partyid;
                return true;
            }
        }
    }
    return false;
}
function KDPopEnemyPartyMember(pmid, partyid, freeFromParty) {
    let npc = KDIsNPCPersistent(partyid) ? KDGetPersistentNPC(partyid) : undefined;
    if (npc) {
        if (KDIsNPCPersistent(pmid)) {
            if (!npc.persistentParty || npc.persistentParty.length == 0)
                return null;
            let index = pmid ? npc.persistentParty.findIndex((pm) => { return pmid == pm; }) : 0;
            if (index >= 0) {
                let id = npc.persistentParty.splice(index, 1)[0];
                let pnpc = KDGetPersistentNPC(id);
                pnpc.partyLeader = undefined;
                let en = KDGetGlobalEntity(id);
                if (freeFromParty)
                    en.partyLeader = undefined;
                return en;
            }
        }
        else {
            if (!npc.storedParty || npc.storedParty.length == 0)
                return null;
            let index = pmid ? npc.storedParty.findIndex((pm) => { return pmid == pm.id; }) : 0;
            if (index >= 0) {
                let en = npc.storedParty.splice(index, 1)[0];
                if (freeFromParty)
                    en.partyLeader = undefined;
                return en;
            }
        }
    }
    return null;
}
function KDDespawnParty(partyid, mapData) {
    let pleader = KinkyDungeonFindID(partyid, mapData);
    for (let en of mapData.Entities) {
        if (en.partyLeader == partyid
            && (!KDHelpless(en)
                || KDistChebyshev(en.x - KDPlayer().x, en.y - KDPlayer().y) > 16)
            && KDEnemyCanDespawn(en.id, mapData, pleader ? KDistChebyshev(en.x - pleader.x, en.y - pleader.y) : undefined)) {
            KDRemoveEntity(en, false, false, true, undefined, mapData);
        }
    }
}
function KDChangeParty(pmid, partyid) {
    let en = KDGetGlobalEntity(pmid);
    if (en) {
        let npc = KDGetPersistentNPC(partyid, undefined, true);
        if (npc) {
            if (en.partyLeader) {
                KDPopEnemyPartyMember(pmid, partyid, true);
            }
            KDStoreEnemyPartyMember(en, npc.id, KDGetNPCLocation(npc.id));
        }
    }
    return false;
}
function KDIsPartyLeaderCapturedOrGone(partyid) {
    let npc = KDGetPersistentNPC(partyid, undefined, true);
    if (npc) {
        return npc.captured || KDIsImprisoned(KDGetGlobalEntity(partyid));
    }
    return true;
}
function KDIsInEnemyParty(entity) {
    if (entity.partyLeader) {
        let npc = KDGetPersistentNPC(entity.partyLeader, undefined, true);
        if (npc) {
            return true;
        }
    }
    return false;
}
function KDPurgeParty(partyid) {
    let npc = KDGetPersistentNPC(partyid, undefined, true);
    if (npc) {
        let party = KDGetEnemyPartyIDs(partyid);
        for (let p of party) {
            let en = KDPopEnemyPartyMember(p, partyid, true);
            if (en && (!en.homeCoord)) {
                en.goToDespawn = true;
            }
        }
        KDPurgePartyGlobal(partyid);
    }
}
function KDPersistentWatch() {
    let slot = KDGetWorldMapLocation(KDCoordToPoint(KDGetCurrentLocation()));
    if ((!slot.main && !KDMapData.RoomType) || KDMapData.RoomType == slot.main) {
        KDWatchMainPersistent();
    }
}
function KDWatchMainPersistent() {
    if (KDGameData.MaidKnightFloor == undefined || KDGameData.MaidKnightFloor == MiniGameKinkyDungeonLevel) {
        KDGameData.MaidKnightFloor = MiniGameKinkyDungeonLevel;
        let point = KinkyDungeonGetRandomEnemyPoint(true);
        if (!point) {
            KDGameData.MaidKnightFloor++;
            if (KDGameData.MaidKnightFloor % KDLevelsPerCheckpoint == 0)
                KDGameData.MaidKnightFloor++;
            return;
        }
        let nearpoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, true);
        if (!nearpoint) {
            KDGameData.MaidKnightFloor++;
            if (KDGameData.MaidKnightFloor % KDLevelsPerCheckpoint == 0)
                KDGameData.MaidKnightFloor++;
            return;
        }
        let en = DialogueCreateEnemy(point.x, point.y, "MaidKnightHeavy");
        if (en) {
            KinkyDungeonSetEnemyFlag(en, "leader", -1);
            if (!KDProcessCustomPatron(en.Enemy, en, 0.2, true))
                KDMakePersistent(en, undefined, true);
            KDRunCreationScript(en, KDGetCurrentLocation());
        }
        let en2 = DialogueCreateEnemy(nearpoint.x, nearpoint.y, "MaidKnightLight");
        if (en2) {
            KinkyDungeonSetEnemyFlag(en2, "led", -1);
            if (!KDProcessCustomPatron(en2.Enemy, en2, 0.2, true))
                KDMakePersistent(en2, undefined, true);
            KDRunCreationScript(en2, KDGetCurrentLocation());
            en2.master = {
                range: 4.5,
                loose: true,
                type: "MaidKnightHeavy",
                aggressive: true,
            };
        }
        if (en && en2) {
            let npc = KDGetPersistentNPC(en.id);
            let npc2 = KDGetPersistentNPC(en2.id);
            if (!npc.data)
                npc.data = {};
            if (!npc2.data)
                npc2.data = {};
            npc.data.MaidKnightHeavyID = npc.id;
            npc2.data.MaidKnightHeavyID = npc.id;
            npc.data.MaidKnightLightID = npc2.id;
            npc2.data.MaidKnightLightID = npc2.id;
        }
    }
}
function KDMakePersistent(e, custom, special = true) {
    let npc = KDGetPersistentNPC(e.id, e, true);
    KDSetSpawnAndWanderAI(npc, custom?.spawnAI, custom?.wanderAI);
    KDSetSpecialScript(npc, custom?.specialScript);
    if (special)
        npc.special = true;
    if (custom?.name)
        KDGameData.NamesGenerated[custom.name] = e.id;
}
function KDPurgePartyGlobal(pid) {
    for (let v of Object.values(KDWorldMap)) {
        if (v.data) {
            for (let d of Object.values(v.data)) {
                if (d?.Entities) {
                    for (let en of d.Entities) {
                        if (en.partyLeader == pid) {
                            delete en.partyLeader;
                            if (!en.homeCoord ||
                                (en.homeCoord.mapX != d.mapX
                                    || en.homeCoord.mapY != d.mapY
                                    || en.homeCoord.room != d.RoomType)) {
                                en.goToDespawn = true;
                            }
                        }
                    }
                }
            }
        }
    }
}
function KDGetPartyOnLevel(partyid, spawnedOnly) {
    let party = KDGetEnemyParty(partyid);
    let loc = KDGetCurrentLocation();
    return party.filter((en) => {
        return (!spawnedOnly && KDIsNPCPersistent(en.id) && KDCompareLocation(KDGetNPCLocation(en.id), loc))
            || KinkyDungeonFindID(en.id);
    });
}
function KDGetPartyAtCoord(partyid, spawnedOnly, coord) {
    let party = KDGetEnemyParty(partyid);
    let mapData = KDGetMapData(coord);
    return party.filter((en) => {
        return (KDIsNPCPersistent(en.id)
            && (!spawnedOnly || KDGetPersistentNPC(en.id).spawned)
            && KDCompareLocation(KDGetNPCLocation(en.id), coord))
            || (mapData && KinkyDungeonFindID(en.id, mapData));
    });
}
function KDMovePersistentNPC(id, coord) {
    let PNPC = KDPersistentNPCs[id];
    if (PNPC) {
        let oldCoord = {
            room: PNPC.room,
            mapX: PNPC.mapX,
            mapY: PNPC.mapY,
        };
        let altered = false;
        if (PNPC.mapX != coord.mapX) {
            altered = true;
            PNPC.mapX = coord.mapX;
        }
        if (PNPC.mapY != coord.mapY) {
            altered = true;
            PNPC.mapY = coord.mapY;
        }
        if (PNPC.room != coord.room) {
            altered = true;
            PNPC.room = coord.room;
        }
        if (altered) {
            PNPC.spawned = false;
            if (PNPC.persistentParty) {
                for (let pmid of PNPC.persistentParty) {
                    let loc = KDGetNPCLocation(pmid);
                    if (!loc || KDCompareLocation(oldCoord, loc)) {
                        let npc = KDGetPersistentNPC(pmid);
                        if (npc) {
                            npc.spawned = false;
                            npc.room = coord.room;
                            npc.mapY = coord.mapY;
                            npc.mapX = coord.mapX;
                        }
                    }
                }
            }
            if (KDGameData.PersistentNPCCache) {
                delete KDGameData.PersistentNPCCache[coordHash(oldCoord)];
                delete KDGameData.PersistentNPCCache[coordHash(coord)];
            }
        }
        return altered;
    }
    return false;
}
function coordHash(coord) {
    return coord.room + ',' + coord.mapX + ',' + coord.mapY;
}
let KDPersistentNPCs = {};
let KDDeletedIDs = {};
function KDGetPersistentNPCCache(coord) {
    if (!KDGameData.PersistentNPCCache)
        KDGameData.PersistentNPCCache = {};
    if (KDGameData.PersistentNPCCache[coordHash(coord)]) {
        return KDGameData.PersistentNPCCache[coordHash(coord)];
    }
    let ret = KDGetPersistentNPCInlevel(coord);
    KDGameData.PersistentNPCCache[coordHash(coord)] = ret;
    return ret;
}
function KDGetPersistentNPCInlevel(coord) {
    let ids = [];
    for (let npc of Object.values(KDPersistentNPCs)) {
        if (npc.mapX == coord.mapX && npc.mapY == coord.mapY && npc.room == coord.room) {
            ids.push(npc.id);
        }
    }
    return ids;
}
function KDUpdatePersistentNPC(id, force = false) {
    if (KDPersistentNPCs[id] || (force && KDGetPersistentNPC(id))) {
        let enemy = KinkyDungeonFindID(id);
        if (enemy) {
            let entry = KDPersistentNPCs[id];
            entry.entity = enemy;
            let value = KDGameData.Collection[enemy.id + ""];
            if (value) {
                entry.outfit = value.outfit;
                entry.hairstyle = value.hairstyle;
                entry.bodystyle = value.bodystyle;
                entry.facestyle = value.facestyle;
                entry.cosplaystyle = value.cosplaystyle;
                if (entry.entity.personality != undefined)
                    value.personality = entry.entity.personality;
                else if (value.personality != undefined)
                    entry.entity.personality = value.personality;
            }
            KDMovePersistentNPC(id, KDGetCurrentLocation());
            if (enemy.opinion == undefined && KDGameData.Collection[id]?.Opinion != undefined) {
                enemy.opinion = KDGameData.Collection[id].Opinion;
            }
        }
    }
}
function KDRefreshPersistentNPC(id) {
    if (KDPersistentNPCs[id]) {
        let enemy = KinkyDungeonFindID(id);
        if (enemy) {
            let entry = KDPersistentNPCs[id];
            let index = KDMapData.Entities.findIndex((entity) => { return entity.id == id; });
            if (index >= 0)
                KDMapData.Entities[index] = entry.entity;
        }
    }
}
function KDGetGlobalEntity(id) {
    if (id == -1)
        return KDPlayer();
    let entity = KinkyDungeonFindID(id);
    if (entity)
        return entity;
    if (KDIsNPCPersistent(id))
        return KDGetPersistentNPC(id).entity;
    return undefined;
}
function KDIsNPCPersistent(id) {
    return KDPersistentNPCs[id] != undefined;
}
function KDGetPersistentNPC(id, entity, force = true, location, special) {
    let addToParty = 0;
    let addMember = null;
    if (!KDPersistentNPCs[id] && force) {
        let enemy = entity || KinkyDungeonFindID(id);
        if (enemy) {
            if (KDDeletedIDs[id + ""])
                delete KDDeletedIDs[id + ""];
            if (enemy.partyLeader) {
                if (KDPopEnemyPartyMember(enemy.id, enemy.partyLeader)) {
                    addToParty = enemy.partyLeader;
                }
            }
            let entry = {
                Name: enemy.CustomName || KDGenEnemyName(enemy),
                id: enemy.id,
                entity: enemy,
                mapX: location ? location.mapX : KDCurrentWorldSlot.x,
                mapY: location ? location.mapY : KDCurrentWorldSlot.y,
                room: location ? location.room : KDGameData.RoomType,
                collect: false,
                captured: false,
                opinion: enemy.opinion || 0,
                outfit: KDGameData.Collection[enemy.id + ""]?.outfit,
                hairstyle: KDGameData.Collection[enemy.id + ""]?.outfit,
                bodystyle: KDGameData.Collection[enemy.id + ""]?.bodystyle,
                facestyle: KDGameData.Collection[enemy.id + ""]?.facestyle,
                cosplaystyle: KDGameData.Collection[enemy.id + ""]?.cosplaystyle,
            };
            if (enemy.outfit)
                entry.outfit = enemy.outfit;
            if (enemy.style) {
                let style = KDModelStyles[enemy.style];
                if (style) {
                    if (!entry.bodystyle && style.Bodystyle) {
                        entry.bodystyle = style.Bodystyle[Math.floor(Math.random() * style.Bodystyle.length)];
                    }
                    if (!entry.hairstyle && style.Hairstyle) {
                        entry.hairstyle = style.Hairstyle[Math.floor(Math.random() * style.Hairstyle.length)];
                    }
                    if (!entry.facestyle && style.Facestyle) {
                        entry.facestyle = style.Facestyle[Math.floor(Math.random() * style.Facestyle.length)];
                    }
                    if (!entry.cosplaystyle && style.Cosplay) {
                        entry.cosplaystyle = style.Cosplay[Math.floor(Math.random() * style.Cosplay.length)];
                    }
                }
            }
            if (special || enemy.Enemy?.special)
                entry.special = true;
            KDPersistentNPCs[enemy.id] = entry;
            if (addToParty)
                addMember = enemy;
            KDUpdatePersistentNPC(id);
        }
    }
    if (addToParty && addMember) {
        KDStoreEnemyPartyMember(addMember, addToParty, location);
        KDUpdatePersistentNPC(id);
    }
    return KDPersistentNPCs[id];
}
function KDGetCurrentLocation() {
    return {
        mapX: KDCurrentWorldSlot.x,
        mapY: KDCurrentWorldSlot.y,
        room: KDGameData.RoomType,
    };
}
function KDGetNPCLocation(id) {
    let npc = KDPersistentNPCs[id];
    if (npc) {
        return {
            mapX: npc.mapX,
            mapY: npc.mapY,
            room: npc.room,
        };
    }
    return undefined;
}
function KDCompareLocation(loc1, loc2) {
    if (loc1.mapX !== loc2.mapX)
        return false;
    if (loc1.mapY !== loc2.mapY)
        return false;
    if (loc1.room !== loc2.room)
        return false;
    return true;
}
function KDCheckBrokenDespawned() {
    let start = performance.now();
    let found = {};
    let unpersistent = {};
    for (let slot in KDWorldMap) {
        if (KDWorldMap[slot].data) {
            for (let data in KDWorldMap[slot].data) {
                let md = KDWorldMap[slot].data[data];
                let altType = KDGetAltType(md.mapY, md.MapMod, md.RoomType);
                if (!altType || !altType.alwaysRegen || altType.persist) {
                    if (md.Entities) {
                        for (let entity of KDWorldMap[slot].data[data].Entities) {
                            found[entity.id] = true;
                        }
                    }
                }
                else if (!KDCompareLocation(KDGetCoordFromMapData(md), KDGetCurrentLocation())) {
                    if (md.Entities) {
                        for (let entity of KDWorldMap[slot].data[data].Entities) {
                            unpersistent[entity.id] = true;
                        }
                    }
                }
            }
        }
    }
    let count = 0;
    for (let npc in KDPersistentNPCs) {
        if (KDPersistentNPCs[npc].spawned && !found[KDPersistentNPCs[npc].id]) {
            if (KDIsImprisoned((KDPersistentNPCs[npc].entity)) && KDCapturable(KDPersistentNPCs[npc].entity)) {
                KDPersistentNPCs[npc].spawned = false;
                KDPersistentNPCs[npc].captured = true;
                if (!unpersistent[KDPersistentNPCs[npc].id])
                    KDPersistentNPCs[npc].jailed = true;
                else
                    KDPersistentNPCs[npc].jailed = undefined;
            }
            else {
                KDPersistentNPCs[npc].spawned = false;
                KDFreeNPC(KDPersistentNPCs[npc].entity, false);
                KDPersistentNPCs[npc].jailed = undefined;
            }
            count++;
        }
    }
    console.log("Took " + (performance.now() - start) + " ms to fix " + count + " npcs");
}
function KDRepopulatePersistentNPCs() {
    KDCheckBrokenDespawned();
    let jp = KDMapData.JailPoints.filter((p) => {
        if (p.requireLeash)
            return false;
        if (!KinkyDungeonTilesGet(p.x + ',' + p.y).Furniture)
            return false;
        if (KinkyDungeonEntityAt(p.x, p.y))
            return false;
        return true;
    });
    let jailPoints = [];
    if (jp.length > 0) {
        while (jp.length > 0) {
            let index = Math.floor(jp.length * KDRandom());
            jailPoints.push(jp[index]);
            jp.splice(index, 1);
        }
    }
    let count = 0;
    let spawned = 0;
    let maxCount = jailPoints.length * 0.7;
    for (let point of jailPoints) {
        if (KDRandom() < 0.7) {
            let result = SetpieceSpawnPrisoner(point.x, point.y, true);
            if (result.success)
                spawned++;
            count++;
            if (count >= maxCount)
                break;
        }
    }
    if (jailPoints.length == 0) {
        let capturedPersistent = KDGetCapturedPersistent(MiniGameKinkyDungeonLevel, KDGameData.RoomType, KDGameData.MapMod, KDMapData.MapFaction, true).filter((en) => {
            return !en.entity?.Enemy?.tags?.noPrisoner;
        });
        let amountToSpawn = Math.min(8, capturedPersistent.length || 0);
        for (let i = 0; i < amountToSpawn; i++) {
            let point = KinkyDungeonGetRandomEnemyPoint(true, false, undefined, undefined, undefined, false, undefined);
            if (point) {
                let result = SetpieceSpawnPrisoner(point.x, point.y, true, undefined, undefined, true);
                if (result.success)
                    spawned++;
            }
        }
    }
    console.log("Spawned " + spawned + " npcs");
}
function KDSpawnPersistentNPCs(coord, searchEntities) {
    let spawned = [];
    let slot = KDGetWorldMapLocation({ x: coord.mapX, y: coord.mapY });
    if (!slot)
        return spawned;
    let data = slot.data[coord.room];
    if (!data)
        return spawned;
    let cache = KDGetPersistentNPCCache(coord);
    if (cache.length > 0) {
        for (let id of cache) {
            let PNPC = KDGetPersistentNPC(id, undefined, false);
            if (PNPC && !PNPC.spawned && IsPNPCActive(PNPC)) {
                let spawnAI = PNPC.spawnAI || "Default";
                if (KDGameData.Party && KDGameData.Party.some((pm) => {
                    return pm.id == PNPC.id;
                })) {
                    spawnAI = "Default";
                }
                let AI = KDPersistentSpawnAIList[spawnAI];
                if (AI && AI.filter(id, data)) {
                    if (AI.chance(id, data) > KDRandom()) {
                        if (AI.doSpawn(id, data, searchEntities ? KinkyDungeonFindID(id, data) : undefined)) {
                            PNPC.nextSpawnTick = AI.cooldown + KinkyDungeonCurrentTick;
                        }
                    }
                }
            }
        }
    }
    return spawned;
}
function KDRunPersistentNPCScripts(coord, searchEntities) {
    let spawned = [];
    let slot = KDGetWorldMapLocation({ x: coord.mapX, y: coord.mapY });
    if (!slot)
        return spawned;
    let data = slot.data[coord.room];
    let cache = KDGetPersistentNPCCache(coord);
    if (cache.length > 0) {
        for (let id of cache) {
            let PNPC = KDGetPersistentNPC(id, undefined, false);
            if (PNPC && IsPNPCActive(PNPC)) {
                let specialScript = PNPC.specialScript || "";
                if (KDGameData.Party && KDGameData.Party.some((pm) => {
                    return pm.id == PNPC.id;
                })) {
                    specialScript = "PartyMember";
                }
                let AI = KDPersistentScriptList[specialScript];
                if (AI && AI.filter(id, data)) {
                    if (AI.chance(id, data) > KDRandom()) {
                        if (AI.doScript(id, data, searchEntities ? KinkyDungeonFindID(id, data) : undefined)) {
                            PNPC.nextScriptTick = AI.cooldown + KinkyDungeonCurrentTick;
                        }
                    }
                }
            }
        }
    }
    return spawned;
}
function KDWanderPersistentNPCs(coord, searchEntities) {
    let spawned = [];
    let slot = KDGetWorldMapLocation({ x: coord.mapX, y: coord.mapY });
    if (!slot)
        return spawned;
    let data = slot.data[coord.room];
    let cache = KDGetPersistentNPCCache(coord);
    if (cache.length > 0) {
        for (let id of cache) {
            let PNPC = KDGetPersistentNPC(id, undefined, false);
            if (PNPC && IsPNPCActive(PNPC) && (!PNPC.partyLeader || !cache.includes(PNPC.partyLeader))) {
                let wanderAI = PNPC.wanderAI || "GoToMain";
                let AI = KDIsInPartyID(PNPC.id) ? KDPersistentWanderAIList.PartyMember
                    : KDPersistentWanderAIList[wanderAI];
                if (AI && AI.filter(id, data)) {
                    if (AI.chance(id, data) > KDRandom()) {
                        if (AI.doWander(id, data, searchEntities ? KinkyDungeonFindID(id, data) : undefined)) {
                            PNPC.nextWanderTick = AI.cooldown + KinkyDungeonCurrentTick;
                        }
                    }
                }
            }
        }
    }
    return spawned;
}
function IsPNPCActive(npc) {
    return npc && !npc.deactivated;
}
function KDGetCapturedPersistent(Level, RoomType, MapMod, faction, sameLocation = false) {
    let altType = KDGetAltType(Level, MapMod, RoomType);
    let mapFaction = faction || altType?.faction || KDMapMods[MapMod ? MapMod : KDGameData.MapMod]?.faction;
    if (!mapFaction)
        mapFaction = "";
    let capturedPersistent = Object.values(KDPersistentNPCs).filter((npc) => {
        return npc.captured && KDCapturable(npc.entity) && ((!sameLocation && !npc.jailed && !npc.collect) || (npc.jailed && KDCompareLocation(KDGetNPCLocation(npc.id), KDGetCurrentLocation())
            && IsPNPCActive(npc)
            && !KinkyDungeonFindID(npc.id)));
    });
    let eligible = [];
    let eligible_faction = [];
    for (let npc of capturedPersistent) {
        let oldEnemy = npc.entity.Enemy;
        if (typeof npc.entity.Enemy == "string") {
            npc.entity.Enemy = KinkyDungeonGetEnemyByName(npc.entity.Enemy);
        }
        else if (!npc.entity.Enemy.maxhp) {
            KDUnPackEnemy(npc.entity);
        }
        if (!KinkyDungeonFindID(npc.id)) {
            if (KDPersonalAlt[KDMapData.RoomType]?.OwnerNPC) {
                if (KDPersonalAlt[KDMapData.RoomType]?.OwnerNPC == npc.captureCaptor
                    || KDPersonalAlt[KDMapData.RoomType]?.OwnerFaction == npc.captureFaction) {
                    eligible.push(npc);
                }
            }
            else {
                if (!mapFaction || mapFaction == npc.captureFaction
                    || (eligible_faction.length == 0 && KDFactionRelation(mapFaction, KDGetFaction(npc.entity)))) {
                    eligible.push(npc);
                    if (mapFaction && mapFaction == npc.captureFaction) {
                        eligible_faction.push(npc);
                    }
                }
            }
        }
        npc.entity.Enemy = oldEnemy;
    }
    if (eligible_faction.length > 0)
        eligible = eligible_faction;
    return eligible;
}
function KDSetSpawnAndWanderAI(npc, customSpawnAI, customWanderAI) {
    let enemy = npc.entity.Enemy;
    if (typeof npc.entity.Enemy == "string") {
        enemy = KinkyDungeonGetEnemyByName(npc.entity.Enemy);
    }
    let aitype = "Default";
    let waitype = "Default";
    if (customSpawnAI)
        aitype = customSpawnAI;
    else if (enemy.spawnAISetting)
        aitype = enemy.spawnAISetting;
    if (customWanderAI)
        waitype = customWanderAI;
    else if (enemy.wanderAISetting)
        waitype = enemy.wanderAISetting;
    if (SpawnAISettingList[aitype])
        npc.spawnAI = SpawnAISettingList[aitype](npc, enemy);
    if (WanderAISettingList[waitype])
        npc.wanderAI = WanderAISettingList[waitype](npc, enemy);
}
function KDSetSpecialScript(npc, specialScript) {
    let enemy = npc.entity.Enemy;
    if (typeof npc.entity.Enemy == "string") {
        enemy = KinkyDungeonGetEnemyByName(npc.entity.Enemy);
    }
    let script = specialScript || "";
    if (!script && enemy.specialScript)
        script = enemy.specialScript;
    if (SpecialPersistentScriptSettingList[script])
        npc.specialScript = SpecialPersistentScriptSettingList[script](npc, enemy);
}
function KDNPCCanWander(id) {
    let npc = KDIsNPCPersistent(id) ? KDGetPersistentNPC(id) : null;
    return npc && (!npc.collect && !(KDGameData.Collection[id] && npc.room == "Summit")) && !KDIsInCapturedPartyID(id);
}
function KDGetSideroomWanderTags(slot) {
    let rooms = {};
    let journeySlot = KDGameData.JourneyMap[(slot.jx != undefined ? slot.jx : 0) + ','
        + (slot.jy != undefined ? slot.jy : slot.y)];
    if (journeySlot) {
        for (let room of journeySlot.SideRooms) {
            if (KDSideRooms[room]?.wandertags) {
                rooms[KDSideRooms[room]?.altRoom || ""] = Object.assign({}, KDSideRooms[room].wandertags);
            }
            else
                rooms[KDSideRooms[room]?.altRoom || ""] = {};
        }
    }
    return rooms;
}
function KDGetLairWanderTags(roomFilter, slot) {
    let results = {};
    if (slot.outposts) {
        for (let outpost of Object.entries(slot.outposts)) {
            if (roomFilter == undefined || outpost[1] == roomFilter) {
                let tags = {};
                let alt = KDPersonalAlt[outpost[0]];
                if (alt) {
                    if (alt.OwnerFaction)
                        tags["faction_" + alt.OwnerFaction] = 1;
                    if (alt.OwnerNPC)
                        tags["owner_" + alt.OwnerNPC] = 1;
                    if (alt.RoomType)
                        tags["type_" + alt.RoomType] = 1;
                }
                if (KinkyDungeonAltFloor(outpost[0])?.wanderTags) {
                    Object.assign(tags, KinkyDungeonAltFloor(outpost[0])?.wanderTags);
                }
                results[outpost[0]] = tags;
            }
        }
    }
    return results;
}
function KDGetWeightedAvgWithTags(tags, rooms) {
    let results = {};
    for (let room of Object.entries(rooms)) {
        let weight = 0;
        for (let tag of Object.entries(tags)) {
            let tagMult = tag[1] * (room[1][tag[0]] || 0);
            weight += tagMult;
        }
        results[room[0]] = Math.max(0, weight);
    }
    return results;
}
function KDGetPersistentWanderWeightsForRoom(AITags, coord, includeMain = true) {
    let results = {};
    let slot = KDGetWorldMapLocation(KDCoordToPoint(coord));
    if (!slot)
        return results;
    let sideRooms = KDGetWeightedAvgWithTags(AITags, KDGetSideroomWanderTags(slot));
    let lairs = KDGetWeightedAvgWithTags(AITags, KDGetLairWanderTags(coord.room, slot));
    if (includeMain) {
        let main = slot.main || "";
        sideRooms[main] = (AITags.generic || 0) + (AITags.main || 0);
    }
    return Object.assign(sideRooms, lairs);
}
//# sourceMappingURL=KDPersistence.js.map