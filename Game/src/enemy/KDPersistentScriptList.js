"use strict";
let KDPersistentScriptList = {
    Default: {
        cooldown: 400,
        filter: (id, mapData) => {
            let npc = KDGetPersistentNPC(id);
            return KinkyDungeonCurrentTick > (npc.nextScriptTick || 0);
        },
        chance: (id, mapData) => {
            return 0;
        },
        doScript: (id, mapData, entity) => {
            return true;
        },
    },
    MaidKnightAndSquire: {
        cooldown: 40,
        filter: (id, mapData) => {
            let npc = KDGetPersistentNPC(id);
            return KinkyDungeonCurrentTick > (npc.nextScriptTick || 0);
        },
        chance: (id, mapData) => {
            return 1;
        },
        doScript: (id, mapData, entity) => {
            let npc = KDGetPersistentNPC(id);
            let maidKnightID = npc.data?.MaidKnightHeavyID;
            let maidSquireID = npc.data?.MaidKnightLightID;
            let angered = false;
            if (id == maidKnightID) {
                if (KDGameData.Collection[maidSquireID + ""] && KDGetPersistentNPC(maidSquireID)?.collect) {
                    angered = true;
                }
            }
            else if (id == maidSquireID) {
                if (KDGameData.Collection[maidKnightID + ""] && KDGetPersistentNPC(maidKnightID)?.collect) {
                    angered = true;
                }
            }
            if (angered) {
                if (!npc.data)
                    npc.data = {};
                npc.data.wanderTarget = KDGetCurrentLocation();
            }
            return true;
        },
    },
    PartyMember: {
        cooldown: 40,
        filter: (id, mapData) => {
            let npc = KDGetPersistentNPC(id);
            return KinkyDungeonCurrentTick > (npc.nextScriptTick || 0);
        },
        chance: (id, mapData) => {
            return 1;
        },
        doScript: (id, mapData, entity) => {
            let npc = KDGetPersistentNPC(id);
            if (!npc.data)
                npc.data = {};
            npc.data.wanderTarget = KDGetCurrentLocation();
            return true;
        },
    },
};
//# sourceMappingURL=KDPersistentScriptList.js.map