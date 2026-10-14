"use strict";
function KDTickCollectionWanderCollectionEntry(value) {
    if (value?.Facility && KDCollectionWanderTypes[value.Facility]) {
        if (KDGetGlobalEntity(value.id) && KDGetGlobalEntity(value.id).FacilityAction != value.Facility) {
            KDChangeEntityFacilityAction(KDGetGlobalEntity(value.id), value.Facility);
        }
        if (KDGameData.RoomType == KDCollectionWanderTypes[value.Facility].spawnRoom
            && KDGameData.RoomType == KDCollectionWanderTypes[value.Facility].spawnRoom) {
            let spawnFunction = KDCollectionWanderTypes[value.Facility].spawnCondition;
            if (spawnFunction) {
                let entity = KinkyDungeonFindID(value.id);
                if (!entity) {
                    if (spawnFunction(value, entity))
                        value.spawned = true;
                    else
                        value.spawned = false;
                }
                else if (entity.FacilityAction)
                    value.spawned = true;
                else
                    value.spawned = false;
            }
        }
        else if (KDIsNPCPersistent(value.id)
            && (KDGetPersistentNPC(value.id)?.room == KDCollectionWanderTypes[value.Facility].spawnRoom)
            && KDGameData.RoomType != KDCollectionWanderTypes[value.Facility].spawnRoom) {
            let spawnFunction = KDCollectionWanderTypes[value.Facility].spawnConditionRemote;
            if (spawnFunction) {
                if (spawnFunction(value))
                    value.spawned = true;
                else
                    value.spawned = false;
            }
        }
    }
    else if (value.spawned) {
        if (KDGetGlobalEntity(value.id) && KDGetGlobalEntity(value.id).FacilityAction != value.Facility) {
            KDChangeEntityFacilityAction(KDGetGlobalEntity(value.id), value.Facility);
        }
    }
}
function KDTickCollectionWanderEntity(entity, delta) {
    let value = KDGameData.Collection[entity.id + ""];
    if (!value)
        return;
    if (entity.FacilityAction && KDCollectionWanderTypes[entity.FacilityAction]?.maintain) {
        KDCollectionWanderTypes[entity.FacilityAction]
            .maintain(value, entity, delta);
    }
}
function KDChangeEntityFacilityAction(entity, action) {
    let value = KDGameData.Collection[entity.id + ""];
    if (!value)
        return;
    if (entity.FacilityAction && KDCollectionWanderTypes[entity.FacilityAction]?.onChangeFacility) {
        entity.FacilityAction = KDCollectionWanderTypes[entity.FacilityAction]
            .onChangeFacility(value, entity, entity.FacilityAction, action);
    }
    else if (entity.FacilityAction == undefined)
        entity.FacilityAction = "Return";
}
function KDSetServantSpawnTemplate(e) {
    if (e) {
        e.allied = 9999;
        e.hostile = 0;
        e.boundLevel = 0;
        e.faction = "Player";
        KDNPCRefreshBondage(e.id, 0, true);
        KinkyDungeonSetEnemyFlag(e, "NoFollow", -1);
        e.hp = e.Enemy.maxhp;
        e.hostile = undefined;
        e.rage = undefined;
    }
}
function KDSetPrisonerSpawnTemplate(e) {
    if (e) {
        e.boundLevel = 0;
        KDNPCRefreshBondage(e.id, 0, true);
        e.hp = e.Enemy.maxhp;
    }
}
//# sourceMappingURL=KDCollectionWander.js.map