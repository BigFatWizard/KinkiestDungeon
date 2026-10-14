"use strict";
function KDGetRegiments(location, Room) {
    if (!KDGameData.Regiments)
        KDGameData.Regiments = {};
    if (!location) {
        return Object.values(KDGameData.Regiments);
    }
}
function UpdateRegiments(coords) {
    let loc = KDGetWorldMapLocation({ x: coords.mapX, y: coords.mapY });
    if (!loc)
        return;
    let Map = loc.data[coords.room];
    Map.Regiments = {};
    for (let reg of KDGetRegiments()) {
        if (KDCompareLocation(reg.location, coords)) {
            Map.Regiments[reg.id] = reg.id;
        }
    }
}
let KDMapTickTime = 50;
let KDMapTickRange = 2;
function KDTickMaps(delta, minFloor, maxFloor, onlyMain, updateReg, updateChests) {
    if (MiniGameKinkyDungeonLevel >= minFloor && MiniGameKinkyDungeonLevel <= maxFloor) {
        KDUpdateRepopQueue(KDMapData, delta);
    }
    if (KinkyDungeonFlags.get("KDMapTick"))
        return false;
    KinkyDungeonSetFlag("KDMapTick", KDMapTickTime);
    let mapsToUpdate = [];
    let mapsWithUpdateNPCs = [];
    for (let y = minFloor; y <= maxFloor; y++) {
        let mapSlot = KDWorldMap[0 + ',' + y];
        if (mapSlot) {
            for (let data of Object.values(mapSlot.data)) {
                mapsToUpdate.push({
                    mapX: 0,
                    mapY: y,
                    room: data.RoomType,
                });
            }
        }
    }
    for (let y = 0; y <= KDGameData.HighestLevelCurrent; y++) {
        let mapSlot = KDWorldMap[0 + ',' + y];
        if (mapSlot) {
            let visitedRooms = {};
            for (let data of Object.values(mapSlot.data)) {
                if (KDGetPersistentNPCCache({
                    mapX: 0,
                    mapY: y,
                    room: data.RoomType,
                })?.length > 0) {
                    mapsWithUpdateNPCs.push({
                        mapX: 0,
                        mapY: y,
                        room: data.RoomType,
                    });
                    visitedRooms[data.RoomType] = true;
                }
            }
            let journeySlot = KDGameData.JourneyMap[(mapSlot.jx != undefined ? mapSlot.jx : 0) + ',' + (mapSlot.jy != undefined ? mapSlot.jy : y)];
            if (journeySlot?.SideRooms) {
                for (let r of journeySlot.SideRooms) {
                    if (KDSideRooms[r]?.altRoom && !visitedRooms[KDSideRooms[r].altRoom]) {
                        if (KDGetPersistentNPCCache({
                            mapX: 0,
                            mapY: y,
                            room: KDSideRooms[r].altRoom,
                        })?.length > 0) {
                            mapsWithUpdateNPCs.push({
                                mapX: 0,
                                mapY: y,
                                room: KDSideRooms[r].altRoom,
                            });
                            visitedRooms[KDSideRooms[r].altRoom] = true;
                        }
                    }
                }
            }
        }
    }
    for (let coords of mapsToUpdate) {
        let loc = KDGetWorldMapLocation({ x: coords.mapX, y: coords.mapY });
        if (!loc)
            continue;
        let data = loc.data[coords.room];
        if (data != KDMapData) {
            KDUpdateRepopQueue(data, KDMapTickTime);
        }
        if (updateReg)
            UpdateRegiments(coords);
        if (updateChests)
            KDRefillChests(data);
    }
    for (let coords of mapsWithUpdateNPCs) {
        let loc = KDGetWorldMapLocation({ x: coords.mapX, y: coords.mapY });
        if (!loc)
            continue;
        let data = loc.data[coords.room];
        if (data) {
        }
        KDSpawnPersistentNPCs(coords, data == KDMapData);
        KDWanderPersistentNPCs(coords, data == KDMapData);
        KDRunPersistentNPCScripts(coords, data == KDMapData);
    }
    return true;
}
let KDRefillChestInterval = 200;
let KDRefillChestChance = 0.5;
function KDRefillChests(data) {
    if (!data.data)
        data.data = {};
    let lastRefill = data.data.lastChestRefill;
    let currentTick = KinkyDungeonCurrentTick;
    if (KDGameData.PrisonerState == 'jail') {
        if (lastRefill + KDRefillChestInterval < currentTick) {
            lastRefill = currentTick;
            for (let x = 0; x < data.GridWidth; x++) {
                for (let y = 0; y < data.GridHeight; y++) {
                    if (data.Tiles[x + ',' + y]?.refill) {
                        KDRefillTick(x, y, data);
                    }
                }
            }
        }
    }
}
function KDRefillTick(x, y, data) {
    let tile = data.Tiles[x + ',' + y];
    if (tile) {
        let type = tile.Type;
        if (KDRefillTypes[type]) {
            KDRefillTypes[type](x, y, tile, data);
        }
    }
}
let KDRefillTypes = {
    Chest: (x, y, tile, data) => {
        let empty = KinkyDungeonMapDataGet(data, x, y) == 'c';
        if (empty
            && (data != KDMapData
                || KDistChebyshev(x - KDPlayer().x, y - KDPlayer().y) > Math.max(GiantMapOptimizations || 0, 10))
            && KDRandom() < KDRefillChestChance) {
            let refillTo = tile.origloot;
            if (refillTo) {
                KinkyDungeonMapDataSet(data, x, y, 'C');
                tile.Loot = refillTo;
                tile.Roll = KDRandom();
                tile.Lock = "White";
            }
        }
    }
};
//# sourceMappingURL=KDRegiments.js.map