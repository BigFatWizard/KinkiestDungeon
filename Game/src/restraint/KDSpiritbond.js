"use strict";
function KDGetSpiritBondEntityLocal(player, item) {
    let id = item?.data?.npc;
    if (id) {
        return KinkyDungeonFindID(id);
    }
    return null;
}
function KDGetSpiritBondEntity(player, item) {
    let id = item?.data?.npc;
    if (id) {
        return KDGetGlobalEntity(id);
    }
    return null;
}
function KDGetSpiritBondID(player, item) {
    let id = item?.data?.npc;
    if (id) {
        return id;
    }
    return null;
}
function KDGetSpiritBondID_General(player) {
    for (let item of KDAllRestraintDynamicList()) {
        if (KDRestraint(item)?.spiritbond && KDGetSpiritBondID(player, item))
            return KDGetSpiritBondID(player, item);
    }
    return 0;
}
//# sourceMappingURL=KDSpiritbond.js.map