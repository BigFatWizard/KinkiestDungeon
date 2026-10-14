"use strict";
let KDOverrideDeviceNPCBinding = true;
function KDGetNPCBindingSlotForItem(restraint, id, treatAsEmpty = false, power) {
    let restraints = KDGetNPCRestraints(id);
    if (KDOverrideDeviceNPCBinding && restraint?.Group == "ItemDevices") {
        let row = KDDeviceRow;
        let sgroup = row.encaseGroup;
        if (KDRowItemIsValid(restraint, sgroup, row, restraints, treatAsEmpty, power))
            return { row: row, sgroup: sgroup };
        else
            return null;
    }
    for (let row of NPCBindingGroups) {
        for (let sgroup of [row.encaseGroup, ...row.layers]) {
            if (KDRowItemIsValid(restraint, sgroup, row, restraints, treatAsEmpty, power))
                return { row: row, sgroup: sgroup };
        }
    }
    return null;
}
function KDGetBulletBindingTags(bindType, playerEffect, merge) {
    let ret = [];
    if (bindType && KDBindTypeTagLookup[bindType])
        ret = [...KDBindTypeTagLookup[bindType]];
    if (!merge && ret.length > 0)
        return ret;
    if (playerEffect?.tag) {
        ret.push(playerEffect.tag);
    }
    if (playerEffect?.tags) {
        ret.push(...playerEffect.tags);
    }
    return ret;
}
function KDGetNPCRestraintPower(restraint) {
    let power = KDRestraint(restraint)?.power || 0;
    if (restraint.inventoryVariant) {
        if (KinkyDungeonRestraintVariants[restraint.inventoryVariant]?.power)
            power += KinkyDungeonRestraintVariants[restraint.inventoryVariant]?.power;
    }
    else if (restraint.powerbonus)
        power += restraint.powerbonus;
    return power;
}
function KDGetByRestraintEligibleEntry(entries) {
    if (!(entries?.length > 0))
        return null;
    let key_weight = {};
    let key_value = {};
    for (let en of entries) {
        key_value[en.restraint?.name + ((en.applyVariant?.prefix + en.applyVariant?.suffix + en.applyVariant?.curse) || "")] = en;
        key_weight[en.restraint?.name + ((en.applyVariant?.prefix + en.applyVariant?.suffix + en.applyVariant?.curse) || "")] = Math.max(0, en.weight);
    }
    return key_value[KDGetByWeight(key_weight)];
}
let KDDefaultNPCEps = 0.05;
function KDGetNPCEligibleRestraints_fromTags(id, tags, options) {
    let ret = [];
    let eps = options?.eps != undefined ? options.eps : KDDefaultNPCEps;
    let effLevel = 4 + (options?.forceEffLevel != undefined ? options.forceEffLevel : undefined) || KDGetEffLevel();
    let arousalMode = KinkyDungeonStatsChoice.get("arousalMode");
    let cache = [];
    for (let restraint of options?.allowedRestraints || KinkyDungeonRestraints) {
        if ((effLevel >= restraint.minLevel
            || KinkyDungeonNewGame > 0
            || (restraint.ignoreMinLevelTags?.some((t) => { return tags.includes(t); }))
            || options?.allowedRestraintNames?.includes(restraint.name)) && (!restraint.maxLevel
            || effLevel < restraint.maxLevel
            || (restraint.ignoreMaxLevelTags?.some((t) => { return tags.includes(t); }))) && (restraint.allFloors
            || restraint.floors[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint]
            || (restraint.ignoreFloorTags?.some((t) => { return tags.includes(t); })))) {
            if (options?.currentWill != undefined
                && (restraint.maxwill != undefined || restraint.maxwillEnemy)
                && (restraint.maxwillEnemy != undefined ? restraint.maxwillEnemy : restraint.maxwill) < options.currentWill)
                continue;
            if (!restraint.arousalMode || arousalMode) {
                let enabled = false;
                let weight = restraint.weight;
                if (options?.requireTags && !options.requireTags.every(tag => {
                    return restraint.shrine?.includes(tag);
                }))
                    continue;
                for (let t of tags) {
                    if (restraint.enemyTags[t] != undefined) {
                        weight += restraint.enemyTags[t];
                        enabled = true;
                    }
                }
                if (restraint.enemyTagsMult)
                    for (let t of tags) {
                        if (restraint.enemyTagsMult[t] != undefined) {
                            weight *= restraint.enemyTagsMult[t];
                        }
                    }
                if (enabled && KDCanEquipItemOnNPC(restraint, id, false, options?.forceLock || restraint.DefaultLock || options?.fallbackLock, options?.forceCurse || restraint.curse || options?.fallbackCurse))
                    continue;
                if (enabled && weight > 0) {
                    cache.push({ r: restraint, w: weight });
                }
                if (enabled && options?.allowVariants && restraint.ApplyVariants) {
                    for (let variant of Object.entries(restraint.ApplyVariants)) {
                        if (effLevel >= KDApplyVariants[variant[0]].minfloor && !(effLevel >= KDApplyVariants[variant[0]].maxfloor)
                            && (!variant[1].enemyTags || Object.keys(variant[1].enemyTags).some((tag) => { return tags.includes(tag); }))) {
                            let w = weight * (variant[1].weightMult || 1) + (variant[1].weightMod || 0);
                            if (variant[1].enemyTags)
                                for (let tag in variant[1].enemyTags)
                                    if (tags[tag])
                                        w += variant[1].enemyTags[tag];
                            if (variant[1].enemyTagsMult)
                                for (let tag in variant[1].enemyTagsMult)
                                    if (tags[tag])
                                        w *= variant[1].enemyTagsMult[tag];
                            if (w > 0) {
                                cache.push({
                                    r: restraint,
                                    v: KDApplyVariants[variant[0]],
                                    w: w,
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    let cachePossible = [];
    if (options?.noOverride) {
        for (let c of cache) {
            let slot = KDGetNPCBindingSlotForItem(c.r, id, false, -1000);
            if (slot)
                cachePossible.push({ r: c.r, w: c.w, v: c.v, row: slot.row, sgroup: slot.sgroup });
        }
    }
    else {
        for (let c of cache) {
            let power = KDGetNPCRestraintPower({
                name: c.r.name,
                powerbonus: c.v?.powerBonus,
                id: -1,
                lock: "",
            });
            let slot = KDGetNPCBindingSlotForItem(c.r, id, false, power);
            if (slot)
                cachePossible.push({ r: c.r, w: c.w, v: c.v, row: slot.row, sgroup: slot.sgroup });
        }
    }
    let maxweight = 0;
    for (let cp of cachePossible) {
        maxweight = Math.max(cp.w, maxweight);
        ret.push({
            applyVariant: cp.v,
            forceConjure: cp.r.forceConjure || options?.forceConjure,
            lock: KinkyDungeonIsLockable(cp.r) ?
                (options?.forceLock != undefined ? options.forceLock : cp.r.DefaultLock) || options?.fallbackLock
                : undefined,
            curse: (options?.forceCurse != undefined ? options.forceCurse : cp.r.curse) || options?.fallbackCurse,
            restraint: cp.r,
            row: cp.row,
            slot: cp.sgroup,
            weight: cp.w
        });
    }
    if (eps > 0) {
        let filtered = ret.filter((r) => {
            return r.weight > maxweight * eps;
        });
        if (filtered.length > 0) {
            ret = filtered;
        }
    }
    return ret;
}
//# sourceMappingURL=KDGenRestraintUniform.js.map