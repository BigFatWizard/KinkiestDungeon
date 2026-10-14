"use strict";
function KDGetPotentialBlockingRestraints(Group, _External, specificItem, player) {
    if (!player || player == KDPlayer()) {
        let map = new Map();
        let all = KDAllRestraintDynamicList();
        if (KinkyDungeonPlayerTags.get("ChastityLower") && ["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group)) {
            for (let item of all) {
                if (specificItem?.id == item.id || item == specificItem)
                    break;
                if (!map.get(item) && (item == specificItem || KDRestraint(item)?.chastity)) {
                    map.set(item, true);
                }
            }
        }
        if (KinkyDungeonPlayerTags.get("ChastityUpper") && ["ItemNipples", "ItemNipplesPiercings"].includes(Group)) {
            for (let item of all) {
                if (specificItem?.id == item.id || item == specificItem)
                    break;
                if (!map.get(item) && (item == specificItem || KDRestraint(item)?.chastitybra)) {
                    map.set(item, true);
                }
            }
        }
        if (KinkyDungeonPlayerTags.get("Block_" + Group)) {
            for (let item of all) {
                if (specificItem?.id == item.id || item == specificItem)
                    break;
                if (!map.get(item) && (item == specificItem || KDRestraint(item)?.shrine?.includes("Block_" + Group))) {
                    map.set(item, true);
                }
            }
        }
        if (!specificItem || !KDRestraint(specificItem).alwaysAccessible) {
            let link = KinkyDungeonGetRestraintItem(Group);
            let TagsSoFar = {};
            while (link && KDRestraint(link)) {
                if (link == specificItem)
                    break;
                if ((link == specificItem
                    || KDRestraint(link).inaccessible
                    || (specificItem && KDRestraint(specificItem).alwaysInaccessible)
                    || (specificItem &&
                        !KDRestraint(specificItem).alwaysRender
                        && !(!KDRestraint(specificItem).renderExcept
                            || !KDRestraint(specificItem).renderExcept.some((tag) => {
                                return TagsSoFar[tag];
                            }))
                        && (KDRestraint(link).UnderlinkedAlwaysRender
                            || KDRestraint(link).accessible
                            || (KDRestraint(specificItem).renderWhenLinked
                                && KDRestraint(link).shrine && KDRestraint(specificItem).renderWhenLinked.some((tag) => { return KDRestraint(link).shrine.includes(tag); })))))) {
                    if (KDRestraint(link).shrine) {
                        for (let tag of KDRestraint(link).shrine) {
                            TagsSoFar[tag] = true;
                        }
                    }
                    if (!map.get(link))
                        map.set(link, true);
                }
                link = link.dynamicLink;
            }
        }
        if (Group == "ItemHands") {
            let arms = KinkyDungeonGetRestraintItem("ItemArms");
            if (arms) {
                let link = arms;
                while (link && KDRestraint(link)) {
                    if (KDRestraint(link).inaccessible && !map.get(link)) {
                        map.set(link, true);
                    }
                    link = link.dynamicLink;
                }
            }
        }
        if (specificItem)
            map.set(specificItem, true);
        return [...map.keys()];
    }
    else if (player && KDGetNPCRestraints(player.id)) {
        let map = new Map();
        let restraints = KDGetNPCRestraints(player.id);
        let row = KDGetEncaseGroupRow(Group);
        let all = Object.values(restraints);
        if (["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group)) {
            for (let item of all) {
                if (specificItem?.id == item.id || item == specificItem)
                    break;
                if (!map.get(item) && (item == specificItem || KDRestraint(item)?.chastity)) {
                    map.set(item, true);
                }
            }
        }
        if (["ItemNipples", "ItemNipplesPiercings"].includes(Group)) {
            for (let item of all) {
                if (specificItem?.id == item.id || item == specificItem)
                    break;
                if (!map.get(item) && (item == specificItem || KDRestraint(item)?.chastitybra)) {
                    map.set(item, true);
                }
            }
        }
        if (specificItem && !KDRestraint(specificItem).alwaysAccessible) {
            for (let entry of Object.entries(restraints)) {
                if (specificItem?.id == entry[1].id || entry[1] == specificItem) {
                    let encaseSlots = KDGetEncaseGroupSlot(entry[0])?.encasedBy;
                    if (encaseSlots?.length > 0) {
                        for (let slot of encaseSlots) {
                            if (restraints[slot]) {
                                map.set(restraints[slot], true);
                            }
                        }
                    }
                    break;
                }
            }
        }
        else if (!specificItem) {
            if (restraints[row.encaseGroup.id]) {
                map.set(restraints[row.encaseGroup.id], true);
            }
        }
        if (specificItem)
            map.set(specificItem, true);
        return [...map.keys()];
    }
}
function KDGetBlockersToAddRestraint(restraint, player, bypass) {
    if (!player || player == KDPlayer()) {
        let map = new Map();
        let all = KDAllRestraintDynamicList();
        let Group = restraint.Group;
        if (!bypass) {
            if (KinkyDungeonPlayerTags.get("ChastityLower") && ["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group)) {
                for (let item of all) {
                    if (!map.get(item) && (KDRestraint(item)?.chastity)) {
                        map.set(item, true);
                    }
                }
            }
            if (KinkyDungeonPlayerTags.get("ChastityUpper") && ["ItemNipples", "ItemNipplesPiercings"].includes(Group)) {
                for (let item of all) {
                    if (!map.get(item) && (KDRestraint(item)?.chastitybra)) {
                        map.set(item, true);
                    }
                }
            }
            if (KinkyDungeonPlayerTags.get("Block_" + Group)) {
                for (let item of all) {
                    if (!map.get(item) && (KDRestraint(item)?.shrine?.includes("Block_" + Group))) {
                        map.set(item, true);
                    }
                }
            }
        }
        if (restraint.requireNoTagToEquip) {
            if (!KDIsEligible(restraint)) {
                let r = restraint;
                if (r.requireNoTagToEquip) {
                    for (let tag of r.requireNoTagToEquip) {
                        for (let item of Object.values(all)) {
                            if (KDValidateTagForItem(tag, item)) {
                                map.set(item, true);
                            }
                        }
                    }
                }
            }
        }
        if (!bypass && Group == "ItemHands") {
            let arms = KinkyDungeonGetRestraintItem("ItemArms");
            if (arms) {
                let link = arms;
                while (link && KDRestraint(link)) {
                    if (KDRestraint(link).inaccessible && !map.get(link)) {
                        map.set(link, true);
                    }
                    link = link.dynamicLink;
                }
            }
        }
        return [...map.keys()];
    }
    else if (player && KDGetNPCRestraints(player.id)) {
        let map = new Map();
        let restraints = KDGetNPCRestraints(player.id);
        let Group = restraint.Group;
        let all = Object.values(restraints);
        if (!bypass) {
            if (["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group)) {
                for (let item of all) {
                    if (!map.get(item) && (KDRestraint(item)?.chastity)) {
                        map.set(item, true);
                    }
                }
            }
            if (["ItemNipples", "ItemNipplesPiercings"].includes(Group)) {
                for (let item of all) {
                    if (!map.get(item) && (KDRestraint(item)?.chastitybra)) {
                        map.set(item, true);
                    }
                }
            }
        }
        if (restraint.requireNoTagToEquip) {
            let npcSprite = KDNPCChar.get(player.id);
            if (npcSprite) {
                if (NPCTags.get(npcSprite) && KDIsEligibleNPC(restraint, player.id, NPCTags.get(npcSprite))) {
                    let r = restraint;
                    if (r.requireNoTagToEquip) {
                        for (let tag of r.requireNoTagToEquip) {
                            for (let item of Object.values(restraints)) {
                                if (KDValidateTagForItem(tag, item)) {
                                    map.set(item, true);
                                }
                            }
                        }
                    }
                }
            }
        }
        if (!bypass) {
            let slot = KDGetNPCBindingSlotForItem(restraint, player.id, false, undefined);
            if (!slot) {
                let slotToLook = KDGetNPCBindingSlotForItem(restraint, player.id, true, undefined);
                if (slotToLook && restraints[slotToLook.sgroup.id] != null) {
                    map.set(restraints[slotToLook.sgroup.id], true);
                }
            }
        }
        return [...map.keys()];
    }
}
function KDEnemyPassesSecurity(Group, enemy) {
    if (!enemy)
        return "";
    let blockers = KDGetPotentialBlockingRestraints(Group, true);
    for (let blocker of blockers) {
        if (!KDRestraint(blocker)?.Security)
            return "";
        for (let secure of Object.entries(KDRestraint(blocker).Security)) {
            if (KDGetSecurity(enemy, secure[0]) >= secure[1])
                return secure[0];
        }
    }
    return "";
}
function KDEnemyCanPassSecurity(entity, player, item, group, bypass = true) {
    if (bypass) {
        if (item) {
            let cantUnlock = KDEnemyCantUnlock(entity, item);
            return {
                blockers: !cantUnlock ? null : [
                    { item: item, reason: "Unlock" }
                ],
                success: !cantUnlock,
            };
        }
    }
    else {
        return {
            blockers: null,
            success: true,
        };
    }
    let top = (!player || player.player) ? KinkyDungeonGetRestraintItem(group ? group : KDRestraint(item).Group) : null;
    if (top || (player && !player.player)) {
        if (item) {
            let blockingItems = KDGetBlockingItemsTo(entity, player, item, false);
            if (blockingItems?.length > 0) {
                return {
                    blockers: blockingItems,
                    success: false,
                };
            }
        }
        else {
            let blockingItems = KDGetBlockingItems(entity, player, group, false);
            if (blockingItems?.length > 0) {
                return {
                    blockers: blockingItems,
                    success: false,
                };
            }
        }
    }
    return {
        blockers: null,
        success: true,
    };
}
function KDGetAllBlockingItemsToRestraintsWithShrineTag(entity, player, tag) {
    if (player.player) {
        let relevantRestraints = KDAllRestraintDynamicList().filter((inv) => {
            return KDRestraint(inv)?.shrine?.includes(tag);
        });
        let map = new Map();
        for (let item of relevantRestraints) {
            let blockingItems = KDGetBlockingItemsTo(entity, player, item, false);
            if (blockingItems?.length > 0) {
                for (let inv of blockingItems) {
                    if (!map.get(inv))
                        map.set(inv, true);
                }
            }
        }
        return [...map.keys()];
    }
    else if (entity && KDGetNPCRestraints(entity.id)) {
        let relevantRestraints = Object.values(KDGetNPCRestraints(entity.id)).filter((inv) => {
            return KDRestraint(inv)?.shrine?.includes(tag);
        });
        let map = new Map();
        for (let item of relevantRestraints) {
            let blockingItems = KDGetBlockingItemsTo(entity, player, item, false);
            if (blockingItems?.length > 0) {
                for (let inv of blockingItems) {
                    if (!map.get(inv))
                        map.set(inv, true);
                }
            }
        }
        return [...map.keys()];
    }
}
function KDGetBlockingItemsTo(entity, player, item, nounlock) {
    let group = KDRestraint(item).Group;
    if (player && !player.player) {
        if (KDGetNPCRestraints(player.id)) {
            let restraints = KDGetNPCRestraints(player.id);
            let entries = Object.entries(restraints);
            for (let entry of entries) {
                if (entry[1]?.id == item.id || entry[1] == item) {
                    group = entry[0];
                    break;
                }
            }
        }
        else
            return [];
    }
    let list = KDGetPotentialBlockingRestraints(group, entity != player, item, player);
    let blockers = [];
    for (let i = 0; i < list.length; i++) {
        let current = list[i];
        if (current) {
            if (nounlock)
                blockers.push({
                    item: current,
                    reason: "",
                });
            else {
                let cantUnlock = KDEnemyCantUnlock(entity, current, player);
                if (cantUnlock) {
                    blockers.push({
                        item: current,
                        reason: cantUnlock,
                    });
                }
            }
            if (current == item)
                break;
        }
    }
    return blockers;
}
function KDGetBlockingItems(entity, player, group, nounlock) {
    let list = KDGetPotentialBlockingRestraints(group, entity != player, null, player);
    let blockers = [];
    for (let i = 0; i < list.length; i++) {
        let current = list[i];
        if (current) {
            if (nounlock)
                blockers.push({
                    item: current,
                    reason: "",
                });
            else {
                let cantUnlock = KDEnemyCantUnlock(entity, current, player);
                if (cantUnlock) {
                    blockers.push({
                        item: current,
                        reason: cantUnlock,
                    });
                }
            }
        }
    }
    return blockers;
}
function KDEnemyCantUnlock(entity, item, player) {
    if (item.lock) {
        let canUnlock = KDEnemyCanUnlockLock(entity, item.lock, item, player);
        if (!canUnlock)
            return "Lock";
        let canUncurse = KDEnemyCanUncurseCurse(entity, item.curse, item, player);
        if (!canUncurse)
            return "Curse";
    }
    return KDEnemyCantUnlockRestraint(entity, KDRestraint(item), false, false, player);
}
function KDEnemyCantUnlockRestraint(entity, restraint, useDefaultLock = true, useCurse = true, player) {
    let data = {
        removeDiff: ((restraint.helpChance?.Remove) != undefined ? restraint.helpChance?.Remove : restraint.escapeChance?.Remove) || 0,
        struggleDiff: ((restraint.helpChance?.Struggle) != undefined ? restraint.helpChance?.Struggle : restraint.escapeChance?.Struggle) || 0,
        enemyMod: KDEnemyRank(entity) * KDGlobalEnemyRankRemoveModifier,
        limitModStruggle: ((restraint.limitChance?.Struggle) != undefined ? restraint.helpChance?.Struggle : restraint.escapeChance?.Struggle),
        reason: undefined,
        entity: entity,
        player: player,
    };
    if (data.limitModStruggle == undefined)
        data.limitModStruggle = KDGetBaseLimitChance("Struggle");
    KinkyDungeonSendEvent("calcEnemyCantUnlockRestraint", data);
    if (useCurse) {
        if (!data.reason) {
            let canUncurse = KDEnemyCanUncurseCurse(entity, restraint.curse, undefined, player);
            if (!canUncurse)
                return "Curse";
        }
    }
    if (useDefaultLock) {
        if (!data.reason) {
            let canUnlock = KDEnemyCanUnlockLock(entity, restraint.DefaultLock, undefined, player);
            if (!canUnlock)
                return "Lock";
        }
    }
    if (!data.reason) {
        if (data.struggleDiff + data.enemyMod && data.struggleDiff + data.enemyMod - data.limitModStruggle <= 0) {
            data.reason = "Remove";
        }
    }
    return data.reason;
}
let KDGlobalEnemyRankRemoveModifier = 0.1;
function KDEnemyCanUnlockLock(entity, lock, item, player) {
    let lockType = KDLocks[lock];
    if (!lockType)
        return true;
    if (lockType.entityCanUnlock(entity, player, {
        query: true,
        entity: entity,
        player: player,
    }))
        return true;
    return false;
}
function KDEnemyCanUncurseCurse(entity, curse, item, player) {
    let curseType = KDCurses[curse];
    if (!curseType)
        return true;
    if (curseType.entityCanUnlock(entity, player, {
        query: true,
        entity: entity,
        player: player,
    }))
        return true;
    return false;
}
function KDValidateTagForItem(tag, item) {
    if (KDTagValidationForItem[tag]) {
        return KDTagValidationForItem[tag](tag, item);
    }
    return KDRestraint(item)?.shrine?.includes(tag);
}
function KDValidateTagForRestraint(tag, restraint) {
    if (KDTagValidationForItem[tag]) {
        return KDTagValidationForRestraint[tag](tag, restraint);
    }
    return restraint?.shrine?.includes(tag);
}
let KDTagValidationForItem = {
    KDDefaultTagValidation: (tag, item) => { return KDTagValidationForRestraint.KDDefaultTagValidation(tag, KDRestraint(item)); },
    FeetLinked: (tag, item) => {
        return KDRestraint(item)?.blockfeet || KDTagValidationForItem.KDDefaultTagValidation(tag, item);
    },
    LegBind: (tag, item) => {
        return !KDRestraint(item)?.addTag?.includes("HasSaddleAlternate") && KDTagValidationForItem.KDDefaultTagValidation(tag, item);
    },
};
let KDTagValidationForRestraint = {
    KDDefaultTagValidation: (tag, restraint) => { return restraint.shrine?.includes(tag) || restraint.addTag?.includes(tag); },
    FeetLinked: (tag, restraint) => {
        return restraint.blockfeet || KDTagValidationForRestraint.KDDefaultTagValidation(tag, restraint);
    },
    LegBind: (tag, restraint) => {
        return !restraint.addTag?.includes("HasSaddleAlternate") && KDTagValidationForRestraint.KDDefaultTagValidation(tag, restraint);
    },
};
//# sourceMappingURL=KDRestraintUtility.js.map