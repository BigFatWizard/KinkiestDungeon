'use strict';
function KDGetNearestFactionGuard(x, y, condition) {
    condition = condition || ((en) => {
        return (KDEnemyHasFlag(en, "mapguard")
            || (KDGetFaction(en) == KDGetMainFaction()
                && en.Enemy?.tags.jailer)) && !KDHelpless(en) && !KinkyDungeonIsDisabled(en);
    });
    if (KinkyDungeonJailGuard()?.aware && condition(KinkyDungeonJailGuard()))
        return KinkyDungeonJailGuard();
    let dist = KDMapData.GridWidth * KDMapData.GridWidth + KDMapData.GridHeight * KDMapData.GridHeight;
    let cand = null;
    let dd = dist;
    let entities = KDNearbyEnemies(x, y, 10).filter((en) => { return condition(en); });
    if (entities.length == 0)
        entities = KDMapData.Entities;
    for (let en of entities) {
        if (condition(en)) {
            dd = KDistEuclidean(x - en.x, y - en.y);
            if (dd < dist) {
                dist = dd;
                cand = en;
            }
        }
    }
    return cand || KinkyDungeonJailGuard();
}
function KDPrisonCommonGuard(player, _call = false, suppressCall = true) {
    KinkyDungeonSetFlag("SuppressGuardCall", 10);
    let guard = KDGetNearestFactionGuard(player.x, player.y);
    if (guard)
        KDGameData.JailGuard = guard.id;
    return KinkyDungeonJailGuard();
}
function KDPrisonGetGroups(_player, jailLists, lock, maxPower) {
    let groupsToStrip = [];
    let itemsToApply = [];
    let itemsApplied = {};
    let itemsToKeep = {};
    let itemsToStrip = {};
    let jailList = KDGetJailRestraints(jailLists, false, false);
    for (let prisonGroup of KDPRISONGROUPS) {
        let strip = false;
        for (let g of prisonGroup) {
            let restraints = KinkyDungeonGetJailRestraintsForGroup(g, jailList, false, lock);
            let restraints2 = KinkyDungeonGetJailRestraintsForGroup(g, jailList, true, lock, true, true);
            if (restraints2.length > 0) {
                for (let r of restraints2) {
                    itemsToKeep[r.restraint.name] = true;
                }
                let restraintStack = KDDynamicLinkList(KinkyDungeonGetRestraintItem(g), true);
                if (restraintStack.length > 0) {
                    for (let r of restraintStack) {
                        if (KinkyDungeonRestraintPower(r, true) < maxPower) {
                            strip = true;
                            itemsToStrip[r?.id] = true;
                        }
                    }
                }
            }
            if (restraints.length > 0) {
                restraints.sort((a, b) => {
                    return b.def.Level - a.def.Level;
                });
                for (let r of restraints) {
                    if (!itemsApplied[r.restraint.name + "--" + r.variant]) {
                        itemsApplied[r.restraint.name + "--" + r.variant] = true;
                        itemsToApply.push({ item: r.restraint.name, variant: r.variant });
                    }
                }
            }
        }
        if (strip) {
            groupsToStrip.push(...prisonGroup);
        }
    }
    return {
        groupsToStrip: groupsToStrip,
        itemsToApply: itemsToApply,
        itemsToKeep: itemsToKeep,
        itemsToStrip: itemsToStrip,
    };
}
function KDPrisonTick(_player) {
    if (!KinkyDungeonFlags.get("prisonCheck")) {
        KinkyDungeonSetFlag("prisonCheck", 3 + Math.floor(KDRandom() * 3));
        return true;
    }
    return false;
}
function KDPrisonIsInFurniture(player) {
    if (KinkyDungeonPlayerTags.get("Furniture")) {
        let tile = KinkyDungeonTilesGet(player.x + "," + player.y);
        if (tile?.Furniture) {
            return true;
        }
    }
    return false;
}
function KDGoToSubState(_player, state) {
    KDMapData.PrisonStateStack.unshift(KDMapData.PrisonState);
    return state;
}
function KDPopSubstate(_player) {
    let state = KDMapData.PrisonStateStack[0];
    if (state) {
        KDMapData.PrisonStateStack.splice(0, 1);
        return state;
    }
    return KDPrisonTypes[KDMapData.PrisonType]?.default_state || "";
}
function KDSetPrisonState(_player, state) {
    if (KDMapData.PrisonStateStack?.length > 0) {
        for (let s of KDMapData.PrisonStateStack) {
            if (KDPrisonTypes[KDMapData.PrisonType].states[s].finally)
                KDPrisonTypes[KDMapData.PrisonType].states[s].finally(0, state, true);
        }
    }
    KDMapData.PrisonStateStack = [];
    return state;
}
function KDCurrentPrisonState(_player) {
    return KDMapData.PrisonState;
}
function KDDoUniformRemove(player, guard, jailGroups, lockType, power) {
    let uniformCheck = KDPrisonGetGroups(player, undefined, lockType, power);
    if (uniformCheck.groupsToStrip.length == 0) {
        return KDPopSubstate(player);
    }
    if (KinkyDungeonPlayerTags.get("SpecialDress"))
        KinkyDungeonSetFlag("specialDressRemove", 2);
    else {
        let succeedAny = false;
        for (let grp of uniformCheck.groupsToStrip) {
            if (succeedAny)
                break;
            let rr = KinkyDungeonGetRestraintItem(grp);
            if (rr) {
                let restraintStack = KDDynamicLinkList(rr, true);
                if (restraintStack.length > 0) {
                    let succeed = false;
                    for (let r of restraintStack) {
                        if (!uniformCheck.itemsToKeep[KDRestraint(r)?.name] && KinkyDungeonRestraintPower(r, true) < power) {
                            succeed = KinkyDungeonRemoveRestraintSpecific(r, false, false, false).length > 0;
                            if (succeed) {
                                let msg = TextGet("KinkyDungeonRemoveRestraints")
                                    .replace("EnemyName", TextGet("Name" + guard.Enemy.name));
                                if (r)
                                    msg = msg.replace("OldRestraintName", KDGetItemName(r));
                                KinkyDungeonSendTextMessage(5, msg, "yellow", 1);
                                break;
                            }
                        }
                    }
                    if (!succeed) {
                    }
                    else {
                        succeedAny = true;
                        break;
                    }
                }
            }
        }
        if (!succeedAny) {
            KinkyDungeonSetFlag("failStrip", 100);
            return KDPopSubstate(player);
        }
    }
    return KDCurrentPrisonState(player);
}
function KDDoUniformApply(player, guard, jailGroups, lockType, power) {
    let uniformCheck = KDPrisonGetGroups(player, jailGroups, lockType, power);
    if (uniformCheck.itemsToApply.length == 0) {
        return KDPopSubstate(player);
    }
    if (KinkyDungeonPlayerTags.get("SpecialDress"))
        KinkyDungeonSetFlag("specialDressAdd", 2);
    else {
        let restraint = uniformCheck.itemsToApply[0];
        if (restraint) {
            if (KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(restraint.item), 2, KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, lockType, false, false, undefined, KDAddFactionForEntity(guard), KinkyDungeonStatsChoice.has("TightRestraints") ? true : undefined, undefined, KinkyDungeonJailGuard(), false, undefined, undefined, undefined, restraint.variant ? KDApplyVariants[restraint.variant] : undefined)) {
                let msg = TextGet("KinkyDungeonAddRestraints")
                    .replace("EnemyName", TextGet("Name" + guard.Enemy.name));
                msg = msg.replace("NewRestraintName", KDGetItemNameString(restraint.item));
                KinkyDungeonSendTextMessage(9, msg, "yellow", 1);
            }
        }
    }
    return KDCurrentPrisonState(player);
}
//# sourceMappingURL=KDPrison.js.map