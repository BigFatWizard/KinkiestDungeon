"use strict";
let KDCreationScripts = {
    DragonLair: (entity, coord) => {
        KDSetSpawnAndWanderAI(KDGetPersistentNPC(entity.id, entity, true), undefined, undefined);
        KDGetPersistentNPC(entity.id, entity, true).special = true;
        let slot = KDGetWorldMapLocation(KDCoordToPoint(entity.homeCoord || coord));
        let res = KDCreateDragonLair(entity, "DragonLair", slot);
        if (res) {
            entity.homeCoord = {
                mapX: (entity.homeCoord || coord).mapX,
                mapY: (entity.homeCoord || coord).mapY,
                room: res,
            };
        }
        return !!res;
    },
    Boss: (entity, coord) => {
        KDSetSpawnAndWanderAI(KDGetPersistentNPC(entity.id, entity, true), undefined, undefined);
        KDGetPersistentNPC(entity.id, entity, true).special = true;
        entity.homeCoord = {
            mapX: (coord).mapX,
            mapY: (coord).mapY,
            room: coord.room,
        };
        return true;
    }
};
//# sourceMappingURL=KDCreationScripts.js.map