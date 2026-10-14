"use strict";
let KDCutAdditionalLimitChance = 0.05;
let KDAllyLimitChanceRedMult = 0.5;
let KDAllyLimitChanceRedFlat = 0.05;
let KDAngelStruggleBonus = {
    Struggle: 0.12,
    Cut: 0.15,
    Remove: 0.20,
    Unlock: 0.25,
    Default: 0.1,
};
let KDBaseSpeedMult = {
    Struggle: 1.5,
    Remove: 2.0,
    Cut: 1.1,
    Unlock: 3.0,
    Pick: 1.0,
};
let KDWillEscapePenalty = 0.15;
let KDWillEscapePenaltyArms = 0.1;
let KDWillEscapePenaltyStart = 0.2;
let KDWillEscapePenaltyStartArms = 0.1;
let KDWillEscapePenaltyEnd = 0.05;
let KDMinEscapeRate = 0.4;
let KDMinPickRate = 0.2;
let KDStruggleTime = 4;
let KDBaseEscapeSpeed = 2.0;
let KDUpfrontWill = true;
let StruggleTypeHandThresh = {
    Struggle: 0.01,
    Unlock: 0.7,
    Pick: 0.45,
    Cut: 0.7,
    Remove: 0.8,
};
let InvFilterShrineBlacklist = ["Cursed"];
let KDRestraintArchetypes = ["Rope", "Latex", "Ribbon", "Leather", "Cyber", "Metal", "Armbinders", "Boxbinders", "Straitjackets", "Legbinders"];
let KDCustomAffinity = {
    Wall: (data) => {
        if (KDNearbyMapTiles(data.entity.x, data.entity.y, 1.1)?.some((tile) => { return KinkyDungeonBlockTiles.includes(tile.tile); }))
            return true;
        return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
    },
    HookOrFoot: (data) => {
        if (KinkyDungeonCanUseFeetLoose(false)) {
            if (data.Message) {
                KinkyDungeonSendTextMessage(7, TextGet("KDUseFootAffinity"), KDBaseLightGreen, 2, false, false, undefined, "Struggle");
            }
            return true;
        }
        return KinkyDungeonGetAffinity(data.Message, "Hook", data.group);
    },
    Tug: (data) => {
        if (KinkyDungeonFlags.get("leashtug")) {
            if (data.Message) {
                KinkyDungeonSendTextMessage(7, TextGet("KDUseTugAffinity"), KDBaseLightGreen, 2, false, false, undefined, "Struggle");
            }
            return true;
        }
        return false;
    },
    SharpHookOrFoot: (data) => {
        if (!KinkyDungeonGetAffinity(data.Message, "Sharp", data.group))
            return false;
        if (KinkyDungeonCanUseFeetLoose(false)) {
            if (data.Message) {
                KinkyDungeonSendTextMessage(7, TextGet("KDUseFootAffinity"), KDBaseLightGreen, 2, false, false, undefined, "Struggle");
            }
            return true;
        }
        return KinkyDungeonGetAffinity(data.Message, "Hook", data.group);
    },
    SharpTug: (data) => {
        if (!KinkyDungeonGetAffinity(data.Message, "Sharp", data.group))
            return false;
        if (KinkyDungeonFlags.get("leashtug")) {
            if (data.Message) {
                KinkyDungeonSendTextMessage(7, TextGet("KDUseTugAffinity"), KDBaseLightGreen, 2, false, false, undefined, "Struggle");
            }
            return true;
        }
        return false;
    },
};
function KDGetTightnessEffect(escapeChance, struggleType, T = 0) {
    let mult = (struggleType == "Cut" || struggleType == "Remove") ? 0.5 : 1.0;
    let x1 = 1 - 0.1 * mult;
    let x2 = escapeChance > 0 ? (escapeChance - 0.03 * mult) / escapeChance : 0;
    let val = Math.max(x1, Math.min(x2, 1 - 0.05 * mult));
    val = 1 - (1 - val) * (100 / (100 + T));
    return val;
}
function KDRestraintPowerMult(player, restraint, augmentedInventory) {
    if (player != KinkyDungeonPlayerEntity)
        return 1;
    if (!restraint)
        return 1;
    let keyProperties = restraint.shrine.filter((element) => { return KDRestraintArchetypes.includes(element); });
    let relatedRestraints = [];
    let opposedRestraints = [];
    let mult = 1.0;
    for (let rr of KinkyDungeonAllRestraintDynamic()) {
        let r = rr.item;
        if (keyProperties.some((element) => {
            return KDRestraint(r).shrine.includes(element);
        })) {
            relatedRestraints.push(r);
        }
        else {
            opposedRestraints.push(r);
        }
    }
    if (augmentedInventory) {
        for (let name of augmentedInventory) {
            let r = { name: name };
            if (KDRestraint(r)) {
                if (keyProperties.some((element) => {
                    return KDRestraint(r).shrine.includes(element);
                })) {
                    relatedRestraints.push(r);
                }
                else {
                    opposedRestraints.push(r);
                }
            }
        }
    }
    let maxMult = 2;
    for (let r of relatedRestraints) {
        mult += Math.max(0, (maxMult - mult) * (Math.max(1, KDRestraint(r).power) + Math.max(1, restraint.power)) / Math.max(1, restraint.power));
    }
    for (let r of opposedRestraints) {
        mult *= 1 - Math.min(0.15, Math.max(1, restraint.power) / (Math.max(1, KDRestraint(r).power) + Math.max(1, restraint.power)));
    }
    return Math.min(2, Math.max(0.5, mult || 0));
}
function KDGetWillPenalty(StruggleType) {
    let perc = KinkyDungeonStatWill;
    let scale = 0;
    let scalestart = KDWillEscapePenaltyStart;
    let max = KDWillEscapePenalty;
    if (!KinkyDungeonIsArmsBound(true, undefined, undefined, true)) {
        scalestart = KDWillEscapePenaltyStartArms;
        max = KDWillEscapePenaltyArms;
    }
    if (perc < scalestart) {
        if (scalestart - KDWillEscapePenaltyEnd > 0)
            scale = Math.min(1.0, (scalestart - perc) / (scalestart - KDWillEscapePenaltyEnd));
        else if (perc <= 0)
            scale = 1.0;
    }
    return scale * max * ((StruggleType == "Cut") ? 0.5 : (StruggleType == "Struggle" ? 1.0 : 0.1));
}
let KinkyDungeonCurrentEscapingItem = null;
let KinkyDungeonCurrentEscapingMethod = null;
let KinkyDungeonStruggleTime = 0;
let KinkyDungeonMultiplayerInventoryFlag = false;
let KinkyDungeonItemDropChanceArmsBound = 0.2;
let KinkyDungeonKeyJamChance = 0.33;
let KinkyDungeonKeyPickBreakAmount = 12;
let KinkyDungeonKeyPickBreakAmountBase = 12;
let KinkyDungeonPickBreakProgress = 0;
let KinkyDungeonKnifeBreakAmount = 10;
let KinkyDungeonKnifeBreakAmountBase = 10;
let KinkyDungeonKnifeBreakProgress = 0;
let KinkyDungeonEnchKnifeBreakAmount = 24;
let KinkyDungeonEnchKnifeBreakAmountBase = 24;
let KinkyDungeonEnchKnifeBreakProgress = 0;
let KinkyDungeonMaxImpossibleAttempts = 3;
let KinkyDungeonEnchantedKnifeBonus = 0.1;
let KDLocksmithPickBonus = 0.15;
let KDLocksmithBonus = 0.15;
let KDLocksmithSpeedBonus = 2.0;
let KDCluelessPickBonus = -0.2;
let KDCluelessBonus = -0.25;
let KDCluelessSpeedBonus = 0.5;
let KDFlexibleBonus = 0.1;
let KDFlexibleSpeedBonus = 1.5;
let KDInflexibleMult = 1.25;
let KDInflexibleSpeedBonus = 0.75;
let KDStrugglePerLevelBonus = 0.005;
let KDPainfulChoicePenalty = 0.5;
let KDPainfulChoiceBonus = 0.1;
let KDPainfulChoiceMax = 1.5;
let KDClearVisionBonus = 0.1;
let KDUnchainedBonus = 0.1;
let KDDamselBonus = 1.3;
let KDDamselPickAmount = 6;
let KDArtistBonus = 0.1;
let KDBunnyBonus = 1.3;
let KDBunnyKnifeAmount = 5;
let KDBunnyEnchKnifeAmount = 12;
let KDSlipperyBonus = 0.1;
let KDDollBonus = 1.3;
let KDEscapeeBonus = 0.1;
let KDDragonBonus = 1.3;
let KDStrongBonus = 0.075;
let KDWeakBonus = -0.1;
let KDBondageLoverAmount = 1;
let KinkyDungeonRestraintsCache = new Map();
function KDRestraint(item) {
    if (KinkyDungeonRestraintVariants[item.inventoryVariant || item.name])
        return KinkyDungeonRestraintsCache.get(KinkyDungeonRestraintVariants[item.inventoryVariant || item.name].template);
    return KinkyDungeonRestraintsCache.get(item.name);
}
function KDRest(name) {
    if (KinkyDungeonRestraintVariants[name])
        return KinkyDungeonRestraintsCache.get(KinkyDungeonRestraintVariants[name].template);
    return KinkyDungeonRestraintsCache.get(name);
}
function KDRestraintBondageMult(item, target) {
    let r = KDRestraint(item);
    if (r) {
        let data = {
            item: item,
            target: target,
            restraint: r,
            type: KDRestraintBondageType(item),
            override: undefined,
            overridePriority: 0,
            mult: r.npcBondageMult || 2,
        };
        if (r.quickBindMult && target && !KinkyDungeonIsDisabled(target)) {
            data.mult *= r.quickBindMult;
            data['quickBind'] = true;
        }
        KinkyDungeonSendEvent("calcBondageMult", data);
        return data.mult * ((KDSpecialBondage[data.type]) ? (KDSpecialBondage[data.type].enemyBondageMult || 1) : 1);
    }
    return 1;
}
function KDRestraintBondageType(item, initdata) {
    let r = KDRestraint(item);
    if (r) {
        let data = initdata || {
            item: item,
            restraint: r,
            type: "",
            override: r.npcBondageType,
            overridePriority: 0,
        };
        if (r.shrine) {
            for (let s of r.shrine) {
                if (KDNPCRestraintBondageTypesByTag[s]) {
                    let entry = KDNPCRestraintBondageTypesByTag[s];
                    if (entry.priority > data.overridePriority) {
                        data.type = entry.tagname;
                        data.overridePriority = entry.priority;
                    }
                }
            }
            if (r.magic && data.overridePriority < 4) {
                data.type = "Magic";
                data.overridePriority = 4;
            }
        }
        KinkyDungeonSendEvent("calcBondageType", data);
        return data.override || data.type;
    }
    return "Vine";
}
function KDGetEntityRestraintList(player, includeDynamic) {
    if (player.id == KDPlayer().id) {
        return includeDynamic ? KDAllRestraintDynamicList() : KinkyDungeonAllRestraint();
    }
    else {
        if (KDGetNPCRestraints(player?.id))
            return Object.values(KDGetNPCRestraints(player.id));
    }
    return [];
}
function KDRestraintBondageConditions(item) {
    let r = KDRestraint(item);
    if (r) {
        let data = {
            item: item,
            restraint: r,
            conditions: [],
            override: undefined,
            overridePriority: 0,
        };
        if (r.shrine.includes("Armbinders")
            || r.shrine.includes("Boxbinders")
            || r.shrine.includes("Yokes")
            || r.shrine.includes("Fiddles")
            || r.shrine.includes("BindingDress")
            || r.shrine.includes("Straitjackets")
            || r.shrine.includes("Petsuits")) {
            data.conditions.push("HeavyBondage");
        }
        if (r.requireAllTagsToEquip || r.requireSingleTagToEquip || r.requireNoTagToEquip) {
            data.conditions.push("Extra");
        }
        KinkyDungeonSendEvent("calcBondageConditions", data);
        return data.conditions.length > 0 ? data.conditions : null;
    }
    return null;
}
function KDRestraintBondageStatus(item) {
    let r = KDRestraint(item);
    if (r) {
        let data = {
            item: item,
            restraint: r,
            status: {
                silence: 0,
                bind: 0,
                slow: 0,
                blind: 0,
                disarm: 0,
                reduceaccuracy: 0,
                toy: 0,
                plug: 0,
                belt: 0,
                immobile: 0,
            },
            override: undefined,
            overridePriority: 0,
        };
        let powerMult = Math.max(0.2, 0.2 * Math.max(r.power));
        if (r.gag) {
            data.status.silence = Math.ceil(powerMult * r.gag * 1.3);
        }
        if (r.blindfold) {
            data.status.blind = Math.ceil(powerMult * r.blindfold * 1.7);
        }
        if (r.freeze) {
            data.status.bind = Math.ceil(powerMult);
        }
        if (r.hobble || r.blockfeet) {
            data.status.slow = Math.ceil(powerMult * 4);
        }
        if (r.bindhands) {
            data.status.disarm = Math.ceil(powerMult * Math.max(r.bindarms ? 0.3 : 0, r.bindhands || 0.1));
        }
        else if (r.bindarms) {
            data.status.reduceaccuracy = powerMult * 3;
        }
        if (r.chastity || r.chastitybra) {
            data.status.belt = r.chastity ? 2 : 1;
        }
        if (r.plugSize) {
            data.status.plug = r.plugSize;
        }
        if (r.vibeLocation) {
            data.status.toy = 1;
        }
        KinkyDungeonSendEvent("calcBondageStatus", data);
        return data.override || data.status;
    }
    return {
        silence: 0,
        bind: 0,
        slow: 0,
        blind: 0,
        disarm: 0,
        reduceaccuracy: 0,
        toy: 0,
        plug: 0,
        belt: 0,
        immobile: 0,
    };
}
function KDItemIsMagic(item) {
    let res = KinkyDungeonRestraintsCache.get(item.name);
    if (!res.magic)
        return false;
    let disenchlevel = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Disenchant");
    return !(disenchlevel > res.power);
}
const KinkyDungeonStrictnessTable = new Map([
    ["ItemHood", ["ItemHead", "ItemEars", "ItemMouth", "ItemMouth2", "ItemMouth3"]],
    ["ItemHead", ["ItemEars", "ItemMouth"]],
    ["ItemMouth", ["ItemMouth"]],
    ["ItemNeck", ["ItemMouth", "ItemArms"]],
    ["ItemArms", ["ItemHands"]],
    ["ItemHands", ["ItemHands"]],
    ["ItemTorso", ["ItemArms", "ItemLegs", "ItemPelvis", "ItemBreast"]],
    ["ItemLegs", ["ItemFeet", "ItemBoots"]],
    ["ItemFeet", ["ItemBoots"]],
]);
let KDProgressiveOrder = {};
KDProgressiveOrder['Capture'] = [
    "ItemArms",
    "ItemLegs",
    "ItemNeck",
    "ItemNeckAccessories",
    "ItemNeckRestraints",
    "ItemMouth",
    "ItemTorso",
    "ItemHands",
    "ItemBreast",
    "ItemPelvis",
    "ItemBoots",
    "ItemEars",
    "ItemFeet",
    "ItemHead",
];
KDProgressiveOrder['AntiMage'] = [
    "ItemMouth",
    "ItemArms",
    "ItemNeck",
    "ItemNeckAccessories",
    "ItemNeckRestraints",
    "ItemHands",
    "ItemTorso",
    "ItemLegs",
    "ItemHead",
    "ItemBreast",
    "ItemPelvis",
    "ItemBoots",
    "ItemEars",
    "ItemFeet",
];
KDProgressiveOrder['Immobilize'] = [
    "ItemLegs",
    "ItemBoots",
    "ItemFeet",
    "ItemArms",
    "ItemNeck",
    "ItemNeckAccessories",
    "ItemNeckRestraints",
    "ItemHands",
    "ItemTorso",
    "ItemMouth",
    "ItemHead",
    "ItemBreast",
    "ItemPelvis",
    "ItemEars",
];
KDProgressiveOrder['Strict'] = [
    "ItemTorso",
    "ItemBreast",
    "ItemPelvis",
    "ItemBoots",
    "ItemEars",
    "ItemHead",
    "ItemLegs",
    "ItemHands",
    "ItemMouth",
    "ItemFeet",
    "ItemArms",
    "ItemNeck",
    "ItemNeckAccessories",
    "ItemNeckRestraints",
];
KDProgressiveOrder['Fun1'] = [
    "ItemTorso",
    "ItemVulva",
    "ItemPelvis",
    "ItemMouth",
    "ItemHands",
    "ItemLegs",
    "ItemNipples",
    "ItemBreast",
    "ItemNeck",
    "ItemNeckAccessories",
    "ItemNeckRestraints",
    "ItemHead",
    "ItemEars",
    "ItemBoots",
    "ItemArms",
    "ItemFeet",
];
KDProgressiveOrder['Fun2'] = [
    "ItemVulva",
    "ItemButt",
    "ItemVulvaPiercings",
    "ItemNipples",
    "ItemTorso",
    "ItemPelvis",
    "ItemMouth",
    "ItemHands",
    "ItemBoots",
    "ItemArms",
    "ItemBreast",
    "ItemLegs",
    "ItemNeck",
    "ItemNeckAccessories",
    "ItemNeckRestraints",
    "ItemHead",
    "ItemFeet",
    "ItemEars",
];
KDProgressiveOrder['Fun3'] = [
    "ItemPelvis",
    "ItemBreast",
    "ItemMouth",
    "ItemHands",
    "ItemArms",
    "ItemLegs",
    "ItemNeck",
    "ItemNeckAccessories",
    "ItemNeckRestraints",
    "ItemBoots",
    "ItemHead",
    "ItemFeet",
    "ItemTorso",
    "ItemEars",
    "ItemVulva",
    "ItemButt",
    "ItemVulvaPiercings",
    "ItemNipples",
];
function KDGetProgressiveOrderFun() {
    return KDProgressiveOrder["Fun" + Math.floor(3 * KDRandom() + 1)];
}
let KDRestraintsCache = new Map();
let KDTetherGraphics = new PIXI.Graphics;
KDTetherGraphics.zIndex = 2;
let KDGameBoardAddedTethers = false;
function KinkyDungeonKeyGetPickBreakChance(modifier) {
    let mult = (modifier) ? modifier : 1.0;
    let chance = 0;
    KinkyDungeonPickBreakProgress += mult;
    if (KinkyDungeonPickBreakProgress > KinkyDungeonKeyPickBreakAmount / 1.5)
        chance = (KinkyDungeonPickBreakProgress - KinkyDungeonKeyPickBreakAmount / 1.5) / (KinkyDungeonKeyPickBreakAmount + 1);
    return chance;
}
function KinkyDungeonGetKnifeBreakChance(modifier) {
    let mult = (modifier) ? modifier : 1.0;
    let chance = 0;
    KinkyDungeonKnifeBreakProgress += mult;
    if (KinkyDungeonKnifeBreakProgress > KinkyDungeonKnifeBreakAmount / 1.5)
        chance = (KinkyDungeonKnifeBreakProgress - KinkyDungeonKnifeBreakAmount / 1.5) / (KinkyDungeonKnifeBreakAmount + 1);
    return chance;
}
function KinkyDungeonGetEnchKnifeBreakChance(modifier) {
    let mult = (modifier) ? modifier : 1.0;
    let chance = 0;
    KinkyDungeonEnchKnifeBreakProgress += mult;
    if (KinkyDungeonEnchKnifeBreakProgress > KinkyDungeonEnchKnifeBreakAmount / 1.5)
        chance = (KinkyDungeonEnchKnifeBreakProgress - KinkyDungeonEnchKnifeBreakAmount / 1.5) / (KinkyDungeonEnchKnifeBreakAmount + 1);
    return chance;
}
function KinkyDungeonIsLockable(restraint) {
    if (restraint && restraint.escapeChance && (restraint.escapeChance.Pick != undefined || restraint.escapeChance.Unlock != undefined))
        return true;
    return false;
}
function KinkyDungeonLock(item, lock, NoEvent = false, Link = false, pick = false, normalUnlock, remover, particleDelay) {
    KDUpdateItemEventCache = true;
    if (lock != "") {
        if (KinkyDungeonIsLockable(KDRestraint(item))) {
            if (KDLocks[lock] && KDLocks[lock].doLock)
                KDLocks[lock].doLock({ item: item, link: Link });
            if (lock != "None")
                item.lock = lock;
            item.pickProgress = 0;
            KDDoLockParticlePlayer(lock, KDRestraint(item), particleDelay);
        }
    }
    else {
        let cancel = false;
        if (KDLocks[item.lock] && KDLocks[item.lock].doUnlock)
            cancel = !KDLocks[item.lock].doUnlock({ item: item, link: Link,
                unlock: normalUnlock != undefined ? normalUnlock : !pick,
                pick: pick, NoEvent: NoEvent,
                remover: remover != undefined ? remover : KDPlayer()
            });
        if (!cancel) {
            if (item.lock)
                KDDoLockParticlePlayer("Unlock", KDRestraint(item), particleDelay);
            item.lock = lock;
            if (!NoEvent) {
                if (item.events) {
                    for (let e of item.events) {
                        if (e.trigger == "postUnlock" && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
                            KinkyDungeonHandleInventoryEvent("postUnlock", e, item, { item: item, id: KinkyDungeonGetItemID() });
                        }
                    }
                }
                KinkyDungeonSendEvent("postUnlock", { item: item });
            }
        }
    }
}
function KDGetCurse(item) {
    return item?.curse || KDRestraint(item)?.curse;
}
function KDIsBinding(item) {
    let r = KDRestraint(item);
    if (r) {
        return !(!(!r.nonbinding && (r.bindarms
            || r.bindhands
            || r.blindfold > 1
            || r.gag > 0.25
            || r.blockfeet
            || r.freeze
            || r.immobile
            || r.hobble > 1
            || r.enclose
            || r.binding)));
    }
    return false;
}
function KinkyDungeonSingleRestraintMatchesShrine(item, shrine, ignoreGold, ignoreShrine, forceIgnoreNonBinding) {
    return KinkyDungeonAllowTagMatch(item, ignoreGold, ignoreShrine, forceIgnoreNonBinding) &&
        KDRestraint(item).shrine &&
        KDRestraint(item).shrine.includes(shrine);
}
function KinkyDungeonAllowTagMatch(item, ignoreGold, ignoreShrine, forceIgnoreNonBinding) {
    return ((!forceIgnoreNonBinding || KDIsBinding(item))
        && KinkyDungeonCurseOrItemAllowMatch(item, ignoreShrine)
        && KinkyDungeonLockAllowMatch(item, ignoreGold));
}
function KinkyDungeonCurseOrItemAllowMatch(item, ignoreShrine) {
    return (!KDRestraint(item).noShrine &&
        (!KDGetCurse(item) || !KDCurses[KDGetCurse(item)].noShrine)) ||
        ignoreShrine;
}
function KinkyDungeonLockAllowMatch(item, ignoreGold) {
    return ignoreGold || !KDLocks[item.lock]?.shrineImmune;
}
function KinkyDungeonGetRestraintsWithShrine(shrine, ignoreGold, recursive, ignoreShrine, forceIgnoreNonBinding, ignoreFavorite) {
    let ret = [];
    for (let item of KinkyDungeonAllRestraint()) {
        if (KinkyDungeonSingleRestraintMatchesShrine(item, shrine, ignoreGold, ignoreShrine, forceIgnoreNonBinding)) {
            if (!ignoreFavorite || !(KDGameData.ItemPriority[item.inventoryVariant || item.name] > 9))
                ret.push(item);
        }
        if (recursive) {
            let link = item.dynamicLink;
            while (link) {
                if (KinkyDungeonSingleRestraintMatchesShrine(link, shrine, ignoreGold, ignoreShrine, forceIgnoreNonBinding)) {
                    if (!ignoreFavorite || !(KDGameData.ItemPriority[link.inventoryVariant || link.name] > 9))
                        ret.push(link);
                }
                link = link.dynamicLink;
            }
        }
    }
    return ret;
}
function KinkyDungeonRemoveRestraintsWithShrine(shrine, maxCount, recursive, noPlayer, ignoreGold, ignoreShrine, Keep, forceIgnoreNonBinding, forceFavorite, Remover) {
    let count = 0;
    let condition = (r) => {
        return (forceFavorite || !(KDGameData.ItemPriority[r.inventoryVariant || r.name] > 9))
            && KinkyDungeonSingleRestraintMatchesShrine(r, shrine, ignoreGold, ignoreShrine, forceIgnoreNonBinding);
    };
    for (let i = 0; i < (maxCount ? maxCount : 100); i++) {
        let items = (recursive ?
            KDAllRestraintDynamicList() : KinkyDungeonAllRestraint()).filter((r) => {
            return condition(r);
        });
        let item = items.length > 0 ? items.reduce((prev, current) => (KinkyDungeonRestraintPower(prev, true) > KinkyDungeonRestraintPower(current, true)) ? prev : current) : null;
        item = item ? KinkyDungeonGetRestraintItem(KDRestraint(item).Group) : undefined;
        if (item && condition(item)) {
            if (item.curse && KDCurses[item.curse]) {
                let res = KDCurses[item.curse].remove(item, KDGetRestraintHost(item), true);
                KinkyDungeonSendEvent("removeCurse", {
                    curse: item.curse,
                    unlock: true,
                    result: res,
                    item: item,
                });
            }
            let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
            item.curse = undefined;
            if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
                KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
            }
            KinkyDungeonRemoveRestraint(KDRestraint(item).Group, Keep, false, false, true, undefined, !noPlayer ? KinkyDungeonPlayerEntity : undefined);
            KDSendStatus('escape', item.name, "shrine_" + shrine);
            count++;
        }
        if (recursive && count < (maxCount ? maxCount : 100)) {
            items = KinkyDungeonGetRestraintsWithShrine(shrine, ignoreGold, true, ignoreShrine, forceIgnoreNonBinding);
            items = items.filter((r) => {
                return (forceFavorite || !(KDGameData.ItemPriority[r.inventoryVariant || r.name] > 9));
            });
            item = items.length > 0 ? items.reduce((prev, current) => {
                return (((KinkyDungeonRestraintPower(prev, true) > KinkyDungeonRestraintPower(current, true)))
                    ? prev : current);
            }) : null;
            if (item) {
                let groupItem = KinkyDungeonGetRestraintItem(KDRestraint(item).Group);
                if (groupItem == item) {
                    if (item.curse && KDCurses[item.curse]) {
                        let res = KDCurses[item.curse].remove(item, KDGetRestraintHost(item), true);
                        KinkyDungeonSendEvent("removeCurse", {
                            curse: item.curse,
                            unlock: true,
                            result: res,
                            item: item,
                        });
                    }
                    let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
                    item.curse = undefined;
                    if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
                        KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
                    }
                    KinkyDungeonRemoveRestraint(KDRestraint(item).Group, Keep, false, false, true, undefined, !noPlayer ? KinkyDungeonPlayerEntity : undefined);
                    KDSendStatus('escape', item.name, "shrine_" + shrine);
                    count++;
                }
                else {
                    let host = groupItem;
                    let link = host.dynamicLink;
                    while (link) {
                        if (link == item) {
                            if (item.curse && KDCurses[item.curse]) {
                                let res = KDCurses[item.curse].remove(item, KDGetRestraintHost(item), true);
                                KinkyDungeonSendEvent("removeCurse", {
                                    curse: item.curse,
                                    unlock: true,
                                    result: res,
                                    item: item,
                                });
                            }
                            let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
                            item.curse = undefined;
                            if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
                                KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
                            }
                            KinkyDungeonRemoveDynamicRestraint(host, Keep, false, !noPlayer ? KinkyDungeonPlayerEntity : undefined);
                            KDSendStatus('escape', item.name, "shrine_" + shrine);
                            count++;
                            link = null;
                        }
                        else {
                            host = link;
                            link = link.dynamicLink;
                        }
                    }
                }
            }
        }
    }
    KinkyDungeonSendEvent("postRemoval", { item: null, keep: Keep, shrine: false, Link: false, dynamic: true, Character: KinkyDungeonPlayer, Remover: Remover });
    return count;
}
function KDRemoveThisItem(item, Keep, NoEvent, Shrine, Remover, ForceRemove = false) {
    let r = KinkyDungeonGetRestraintItem(KDRestraint(item).Group);
    if (r == item) {
        KinkyDungeonRemoveRestraint(KDRestraint(item).Group, Keep, false, NoEvent, Shrine, false, Remover, true);
    }
    else {
        let host = r;
        r = r.dynamicLink;
        while (r) {
            if (r == item) {
                KinkyDungeonRemoveDynamicRestraint(host, Keep, NoEvent, Remover, true);
            }
            host = r;
            r = r.dynamicLink;
        }
    }
}
function KinkyDungeonRemoveRestraintsWithName(name) {
    let count = 0;
    for (let inv of KinkyDungeonAllRestraintDynamic()) {
        if (inv.item.name == name) {
            if (inv.host)
                KinkyDungeonRemoveDynamicRestraint(inv.host, false, false, undefined);
            else
                KinkyDungeonRemoveRestraint(KDRestraint(inv.item).Group, false, false);
            KDSendStatus('escape', inv.item.name, "special");
            count++;
        }
    }
    return count;
}
function KinkyDungeonUnlockRestraintsWithShrine(shrine) {
    let count = 0;
    for (let item of KinkyDungeonAllRestraint()) {
        if (item.lock && !KDRestraint(item).noShrine && (!KDGetCurse(item) || !KDCurses[KDGetCurse(item)].noShrine) && KDRestraint(item).shrine && KDRestraint(item).shrine.includes(shrine) && KDLocks[item.lock] && !KDLocks[item.lock]?.shrineImmune) {
            KinkyDungeonLock(item, "", true, false, false, false);
            count++;
        }
    }
    return count;
}
function KinkyDungeonPlayerGetLockableRestraints() {
    let ret = [];
    for (let item of KinkyDungeonAllRestraint()) {
        if (!item.lock && !KDGetCurse(item) && KDRestraint(item).escapeChance && KDRestraint(item).escapeChance.Pick != undefined) {
            ret.push(item);
        }
    }
    return ret;
}
function KinkyDungeonPlayerGetRestraintsWithLocks(Locks, recursive) {
    let ret = [];
    for (let itemhost of (recursive ? KinkyDungeonAllRestraintDynamic() : KinkyDungeonAllRestraint())) {
        let item = itemhost.item ? itemhost.item : itemhost;
        if (item && item.lock && Locks.includes(item.lock)) {
            ret.push(item);
        }
    }
    return ret;
}
function KinkyDungeonRemoveKeysUnlock(lock) {
    if (KDLocks[lock])
        KDLocks[lock].removeKeys({ unlock: true });
}
function KinkyDungeonRemoveKeysDropped(lock, keytype) {
    if (KDLocks[lock])
        KDLocks[lock].removeKeys({ dropped: true, keytype: keytype });
}
function KinkyDungeonGetKey(lock) {
    if (KDLocks[lock])
        return KDLocks[lock].key;
    return "";
}
function KinkyDungeonHasGhostHelp() {
    return ((KinkyDungeonTargetTile && ((KinkyDungeonTargetTile.Type == "Ghost" && KinkyDungeonTargetTile.GhostDecision <= 0) || KinkyDungeonTargetTile.Type == "Angel")));
}
function KinkyDungeonHasHelp() {
    return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp() || KinkyDungeonHasAngelHelp();
}
function KinkyDungeonHasAllyHelp() {
    return (KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((enemy) => {
        return (KDEnemyHasFlag(enemy, "HelpMe") || enemy.Enemy.tags?.alwayshelp)
            && enemy.Enemy.bound
            && !enemy.Enemy.tags?.nohelp
            && !KDHelpless(enemy)
            && KDBoundEffects(enemy) < 4;
    })
        || (!KinkyDungeonStatsChoice.get("NoHelp") && KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((enemy) => {
            return enemy.Enemy.bound
                && !enemy.Enemy.tags?.nohelp
                && KDAllied(enemy)
                && !KDHelpless(enemy)
                && KDBoundEffects(enemy) < 4;
        })));
}
KinkyDungeonSetFlag("HelpMeFlag", 20);
function KinkyDungeonHasAngelHelp() {
    return (KinkyDungeonTargetTile && KinkyDungeonTargetTile.Type == "Angel");
}
function KinkyDungeonIsWearingLeash() {
    for (let restraint of KinkyDungeonAllRestraint()) {
        if (KDRestraint(restraint) && KDRestraint(restraint).leash) {
            return true;
        }
    }
    return false;
}
let KDAffinityList = ["Hook", "Edge", "Sticky", "Sharp"];
function KinkyDungeonGetAffinity(Message, affinity, group, entity) {
    if (!entity)
        entity = KinkyDungeonPlayerEntity;
    let data = {
        forceTrue: 0,
        forceFalse: 0,
        affinity: affinity,
        group: group,
        Message: Message,
        entity: entity,
        msgedstand: false,
        canStand: KinkyDungeonCanStand() && !KDForcedToGround(),
        groupIsHigh: !group || (group.startsWith("ItemM")
            || group == "ItemArms"
            || (group == "ItemHands" || !KinkyDungeonIsArmsBound(false, true, group, false, !Message))
            || group == "ItemEars"
            || group == "ItemHood"
            || group == "ItemHead"
            || group == "ItemNeck"
            || group == "ItemNeckAccessories"
            || group == "ItemNeckRestraints"),
    };
    KinkyDungeonSendEvent("affinity", data);
    if (data.forceFalse > 0 && data.forceFalse >= data.forceTrue) {
        if (Message)
            KinkyDungeonSetFlag("embarrassed", 8);
        return false;
    }
    if (data.forceTrue > 0)
        return true;
    let effectTiles = KDGetEffectTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
    if (effectTiles)
        for (let t of Object.values(effectTiles)) {
            if (t.affinities && t.affinities.includes(affinity))
                return true;
            else if (data.canStand && data.groupIsHigh && t.affinitiesStanding && t.affinitiesStanding.includes(affinity))
                return true;
            else if (Message && !data.msgedstand && (!data.canStand || !data.groupIsHigh) && t.affinitiesStanding && t.affinitiesStanding.includes(affinity)) {
                data.msgedstand = true;
                KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonHookHighFail"), KDBaseRed, 2, false, false, undefined, "Struggle");
            }
        }
    if (KDCustomAffinity[data.affinity]) {
        return KDCustomAffinity[data.affinity](data);
    }
    if (affinity == "Hook") {
        let tile = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
        if (tile == '?') {
            if (data.canStand && data.groupIsHigh)
                return true;
            else if (!data.msgedstand && Message)
                KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonHookHighFail"), KDBaseRed, 2, false, false, undefined, "Struggle");
        }
        else if (KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y - 1) == ',')
            return true;
        return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
    }
    else if (affinity == "Edge") {
        for (let X = KinkyDungeonPlayerEntity.x - 1; X <= KinkyDungeonPlayerEntity.x + 1; X++) {
            for (let Y = KinkyDungeonPlayerEntity.y - 1; Y <= KinkyDungeonPlayerEntity.y + 1; Y++) {
                let tile = KinkyDungeonMapGet(X, Y);
                if (KDCornerTiles[tile]) {
                    return true;
                }
                else if (tile == 'C' && Message) {
                    KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNeedOpenChest"), KDBaseRed, 2, true, false, undefined, "Struggle");
                }
            }
        }
        return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
    }
    else if (affinity == "Sticky") {
        return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
    }
    else if (affinity == "Sharp") {
        let hasHelp = KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
        if (((KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp())
            && KinkyDungeonAllWeapon().some((inv) => {
                return (hasHelp || KDWeapon(inv).light)
                    && KDWeapon(inv).cutBonus != undefined;
            }))
            || KinkyDungeonWeaponCanCut(false))
            return true;
        if (KinkyDungeonAllWeapon().some((inv) => { return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined; }) && (!KinkyDungeonIsArmsBound(true, false, group, undefined, !Message) || KinkyDungeonStatsChoice.has("Psychic") || KinkyDungeonWallCrackAndKnife(false)))
            return true;
        let tile = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
        if (tile == '/') {
            if (Message)
                KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonScrapUse"), KDBaseLightGreen, 2, false, false, undefined, "Struggle");
            return true;
        }
        for (let X = KinkyDungeonPlayerEntity.x - 1; X <= KinkyDungeonPlayerEntity.x + 1; X++) {
            for (let Y = KinkyDungeonPlayerEntity.y - 1; Y <= KinkyDungeonPlayerEntity.y + 1; Y++) {
                let tile2 = KinkyDungeonMapGet(X, Y);
                if (tile2 == '-'
                    || tile == 'a') {
                    if (Message)
                        KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonScrapObjectUse"), KDBaseLightGreen, 2, false, false, undefined, "Struggle");
                    return true;
                }
            }
        }
        if (Message)
            KinkyDungeonSetFlag("embarrassed", 8);
        return false;
    }
    let ret = KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
    if (Message && !ret)
        KinkyDungeonSetFlag("embarrassed", 3);
    return ret;
}
function KinkyDungeonWallCrackAndKnife(Message) {
    for (let X = KinkyDungeonPlayerEntity.x - 1; X <= KinkyDungeonPlayerEntity.x + 1; X++) {
        for (let Y = KinkyDungeonPlayerEntity.y - 1; Y <= KinkyDungeonPlayerEntity.y + 1; Y++) {
            if (X == KinkyDungeonPlayerEntity.x || Y == KinkyDungeonPlayerEntity.y) {
                let tile = KinkyDungeonMapGet(X, Y);
                if (tile == '4' || tile == '\\') {
                    if (!KinkyDungeonIsArmsBound(true) || (KinkyDungeonCanStand() && !KDForcedToGround())) {
                        if (Message) {
                            if (!KinkyDungeonIsArmsBound(true))
                                KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonUseCrack"), KDBaseLightGreen, 2, true);
                            else
                                KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonUseCrackLegs"), KDBaseLightGreen, 2, true);
                        }
                        return true;
                    }
                    else {
                        if (Message) {
                            KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNeedCrack"), KDBaseRed, 2, true);
                        }
                        return false;
                    }
                }
            }
        }
    }
    return false;
}
function KDIsItemAccessible(item) {
    let base = KinkyDungeonGetRestraintItem(KDRestraint(item)?.Group);
    if (base) {
        let link = base;
        while (link && KDRestraint(link)) {
            if (link == item || link.id == item.id)
                return true;
            if (KDRestraint(link).inaccessible)
                return false;
            link = link.dynamicLink;
        }
    }
    return false;
}
function KDIsTreeAccessible(item) {
    let link = item;
    while (link && KDRestraint(link)) {
        if (KDRestraint(link).inaccessible)
            return false;
        link = link.dynamicLink;
    }
    return true;
}
function KDIsTreeChastity(item) {
    let link = item;
    while (link && KDRestraint(link)) {
        if (KDRestraint(link).chastity)
            return false;
        link = link.dynamicLink;
    }
    return true;
}
function KDIsTreeChastityBra(item) {
    let link = item;
    while (link && KDRestraint(link)) {
        if (KDRestraint(link).chastitybra)
            return false;
        link = link.dynamicLink;
    }
    return true;
}
function KDGroupBlocked(Group, _External) {
    if (KinkyDungeonPlayerTags.get("ChastityLower") && ["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group))
        return true;
    if (KinkyDungeonPlayerTags.get("ChastityUpper") && ["ItemNipples", "ItemNipplesPiercings"].includes(Group))
        return true;
    if (KinkyDungeonPlayerTags.get("Block_" + Group))
        return true;
    return false;
}
function KDGetBlockingSecurity(Group, External, player) {
    let items = KDGetPotentialBlockingRestraints(Group, External, null, player);
    items = items.filter((item) => {
        return KDRestraint(item)?.Security != undefined;
    });
    return items;
}
function KinkyDungeonCanUseKey(Other = true) {
    return !KinkyDungeonIsHandsBound(true, Other, 0.7) || KinkyDungeonStatsChoice.has("Psychic");
}
function KinkyDungeonIsHandsBound(ApplyGhost, Other, Threshold = 0.99, group, NoEvent, query = true) {
    let hasHelp = KinkyDungeonHasHelp();
    if (!NoEvent) {
        let data = {
            hasHelp: hasHelp,
            C: KinkyDungeonPlayer,
            ApplyGhost: ApplyGhost,
            Other: Other,
            group: group,
            forceResult: undefined,
            forceResultPower: 0,
            query: query,
        };
        KinkyDungeonSendEvent("getHandsBound", data);
        if (data.forceResult != undefined) {
            return data.forceResult;
        }
        ApplyGhost = data.ApplyGhost;
        Other = data.Other;
        group = data.group;
        hasHelp = data.hasHelp;
    }
    let blocked = KDHandBondageTotal(Other) > Threshold;
    let help = ApplyGhost && (hasHelp);
    if (!Other && (!ApplyGhost || !(help)) && KinkyDungeonStatsChoice.get("Butterfingers") && KinkyDungeonIsArmsBound(ApplyGhost, Other, group, NoEvent, query))
        return true;
    return (!ApplyGhost || !(help)) &&
        blocked;
}
function KinkyDungeonIsHandsBoundFast(ApplyGhost, Other, group, NoEvent, query = true) {
    let hasHelp = KinkyDungeonHasHelp();
    if (!NoEvent) {
        let data = {
            hasHelp: hasHelp,
            C: KinkyDungeonPlayer,
            ApplyGhost: ApplyGhost,
            Other: Other,
            group: group,
            forceResult: undefined,
            forceResultPower: 0,
            fast: true,
            query: query,
        };
        KinkyDungeonSendEvent("getHandsBound", data);
        if (data.forceResult != undefined) {
            return data.forceResult;
        }
        ApplyGhost = data.ApplyGhost;
        Other = data.Other;
        group = data.group;
        hasHelp = data.hasHelp;
    }
    let blocked = !!KinkyDungeonPlayerTags.get("BoundHands");
    let help = ApplyGhost && (hasHelp);
    if (!Other && (!ApplyGhost || !(help)) && KinkyDungeonStatsChoice.get("Butterfingers")
        && KinkyDungeonIsArmsBoundFast(ApplyGhost, Other))
        return true;
    return (!ApplyGhost || !(help)) &&
        blocked;
}
function KDHandBondageTotal(Other = false) {
    let total = 0;
    for (let rest of KinkyDungeonAllRestraintDynamic()) {
        let inv = rest.item;
        if (KDRestraint(inv).bindhands)
            total += KDRestraint(inv).bindhands;
        if (!Other && KDRestraint(inv).restricthands)
            total += KDRestraint(inv).restricthands;
    }
    if (KinkyDungeonStatsChoice.get("SomaticMinus"))
        total *= 2;
    else if (KinkyDungeonStatsChoice.get("SomaticPlus") && total < 0.99)
        total *= 0.75;
    return total;
}
function KinkyDungeonCanUseFeet(bootsPrevent = true, group) {
    return KinkyDungeonStatsChoice.get("Flexible") && KinkyDungeonSlowLevel < 1
        && (!bootsPrevent ||
            (!KinkyDungeonPlayerTags.get("HinderFeet")
                && !KinkyDungeonPlayerTags.get("BoundFeet")
                && !KinkyDungeonPlayerTags.get("Boots")
                && !KinkyDungeonPlayerTags.get("BootsArmor")));
}
function KinkyDungeonCanUseFeetLoose(bootsPrevent = true) {
    return KinkyDungeonCanUseFeet(bootsPrevent) || (!KDForcedToGround());
}
function KinkyDungeonIsArmsBound(ApplyGhost, Other, group = "", NoEvent = false, query = true) {
    let hasHelp = KinkyDungeonHasHelp();
    if (!NoEvent) {
        let data = {
            hasHelp: hasHelp,
            C: KinkyDungeonPlayer,
            ApplyGhost: ApplyGhost,
            Other: Other,
            group: group,
            forceResult: undefined,
            forceResultPower: 0,
            fast: true,
            query: query
        };
        KinkyDungeonSendEvent("getArmsBound", data);
        if (data.forceResult != undefined) {
            return data.forceResult;
        }
        ApplyGhost = data.ApplyGhost;
        Other = data.Other;
        group = data.group;
        hasHelp = data.hasHelp;
    }
    let blocked = KDGroupBlocked("ItemArms");
    if (!blocked && KinkyDungeonPlayerTags.get("BoundArms"))
        blocked = true;
    return (!ApplyGhost || !(hasHelp)) &&
        blocked;
}
function KinkyDungeonIsArmsBoundFast(ApplyGhost, Other, group = "", NoEvent = false, query = true) {
    let hasHelp = KinkyDungeonHasHelp();
    if (!NoEvent) {
        let data = {
            hasHelp: hasHelp,
            C: KinkyDungeonPlayer,
            ApplyGhost: ApplyGhost,
            Other: Other,
            group: group,
            forceResult: undefined,
            forceResultPower: 0,
            fast: true,
            query: query,
        };
        KinkyDungeonSendEvent("getArmsBound", data);
        if (data.forceResult != undefined) {
            return data.forceResult;
        }
        ApplyGhost = data.ApplyGhost;
        Other = data.Other;
        group = data.group;
        hasHelp = data.hasHelp;
    }
    let blocked = KDGroupBlocked("ItemArms");
    if (!blocked)
        if (KinkyDungeonPlayerTags.get("BoundArms"))
            return (!ApplyGhost || !(hasHelp)) &&
                blocked;
}
function KinkyDungeonIsArmsBoundC(C, ApplyGhost, Other, group = "", NoEvent = false, query = true) {
    let hasHelp = KinkyDungeonHasHelp();
    if (!NoEvent) {
        let data = {
            hasHelp: hasHelp,
            C: C,
            ApplyGhost: ApplyGhost,
            Other: Other,
            group: group,
            forceResult: undefined,
            forceResultPower: 0,
            query: query,
        };
        KinkyDungeonSendEvent("getArmsBound", data);
        if (data.forceResult != undefined) {
            return data.forceResult;
        }
        C = data.C;
        ApplyGhost = data.ApplyGhost;
        Other = data.Other;
        group = data.group;
        hasHelp = data.hasHelp;
    }
    if (C == KinkyDungeonPlayer) {
        return KinkyDungeonIsArmsBound(ApplyGhost, Other, group, NoEvent, query);
    }
    else {
        for (let inv of KDGetRestraintsForCharacter(C)) {
            if (KDRestraint(inv)?.bindarms) {
                return true;
            }
        }
        return false;
    }
}
function KinkyDungeonStrictness(ApplyGhost, Group, excludeItem) {
    if (ApplyGhost && (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()))
        return 0;
    let strictness = 0;
    for (let invItem of KinkyDungeonAllRestraintDynamic()) {
        let inv = invItem.item;
        while (inv && (!excludeItem || KDRestraint(inv).Group != Group)) {
            if (inv != excludeItem && ((KDRestraint(inv).strictness && KDRestraint(inv).strictness > strictness))) {
                let strictGroups = KDRestraint(inv).strictnessZones || KinkyDungeonStrictnessTable.get(KDRestraint(inv).Group);
                if (strictGroups) {
                    for (let s of strictGroups) {
                        if (s == Group) {
                            if (KDRestraint(inv).strictness > strictness)
                                strictness = KDRestraint(inv).strictness;
                            break;
                        }
                    }
                }
            }
            inv = inv.dynamicLink;
        }
    }
    if (excludeItem) {
        let inv = KinkyDungeonGetRestraintItem(Group);
        let i = 0;
        let stack = [];
        while (inv) {
            stack.push(inv);
            inv = inv.dynamicLink;
        }
        i = stack.length - 1;
        inv = stack[i];
        while (i >= 0) {
            if (inv == excludeItem) {
                break;
            }
            else {
                if (inv != excludeItem && ((KDRestraint(inv).strictness && KDRestraint(inv).strictness > strictness))) {
                    let strictGroups = KDRestraint(inv).strictnessZones || KinkyDungeonStrictnessTable.get(KDRestraint(inv).Group);
                    if (strictGroups) {
                        for (let s of strictGroups) {
                            if (s == Group) {
                                if (KDRestraint(inv).strictness > strictness)
                                    strictness = KDRestraint(inv).strictness;
                                break;
                            }
                        }
                    }
                }
            }
            i--;
            inv = i >= 0 ? stack[i] : undefined;
        }
    }
    return strictness;
}
function KinkyDungeonGetStrictnessItems(Group, excludeItem) {
    let list = [];
    for (let inv of KinkyDungeonAllRestraint()) {
        while (inv) {
            if (inv != excludeItem && KDRestraint(inv).strictness) {
                let strictGroups = KDRestraint(inv).strictnessZones || KinkyDungeonStrictnessTable.get(KDRestraint(inv).Group);
                if (strictGroups) {
                    for (let s of strictGroups) {
                        if (s == Group) {
                            if (KDRestraint(inv).strictness)
                                list.push(KDRestraint(inv).name);
                            break;
                        }
                    }
                }
            }
            inv = inv.dynamicLink;
        }
    }
    return list;
}
function KinkyDungeonGetPickBaseChance() {
    let bonus = 0;
    if (KinkyDungeonStatsChoice.get("Locksmith"))
        bonus += KDLocksmithPickBonus;
    if (KinkyDungeonStatsChoice.get("Clueless"))
        bonus += KDCluelessPickBonus;
    if (KinkyDungeonStatsChoice.get("LocksmithMaster"))
        bonus += 0.15;
    return 0.33 / (1.0 + 0.02 * MiniGameKinkyDungeonLevel) + bonus;
}
function KinkyDungeonGetPickBonus() {
    let bonus = 0;
    if (KinkyDungeonStatsChoice.get("Locksmith"))
        bonus += KDLocksmithBonus;
    if (KinkyDungeonStatsChoice.get("Clueless"))
        bonus += KDCluelessBonus;
    if (KinkyDungeonStatsChoice.get("LocksmithMaster"))
        bonus += 0.15;
    return bonus;
}
function KinkyDungeonPickAttempt() {
    let Pass = "Fail";
    let escapeChance = KinkyDungeonGetPickBaseChance();
    let cost = KinkyDungeonStatStaminaCostPick;
    let wcost = KinkyDungeonStatWillCostPick;
    let lock = KinkyDungeonTargetTile.Lock;
    if (!KinkyDungeonTargetTile.pickProgress)
        KinkyDungeonTargetTile.pickProgress = 0;
    if (!lock)
        return;
    KinkyDungeonInterruptSleep();
    if (KDLocks[lock] && !KDLocks[lock].canPick({ target: KinkyDungeonTargetTile, location: KinkyDungeonTargetTileLocation })) {
        KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggleCantPick" + lock + "Lock"), "orange", 2, true);
        Pass = "Fail";
    }
    let handsBound = KinkyDungeonIsHandsBound(false, true, 0.55, undefined, undefined, false) && !KinkyDungeonCanUseFeet();
    let armsBound = KinkyDungeonIsArmsBound(false, true, undefined, undefined, false);
    let strict = KinkyDungeonStrictness(false, "ItemHands");
    if (!strict)
        strict = 0;
    if (armsBound) {
        escapeChance = Math.max(0.0, escapeChance - 0.25);
    }
    if (handsBound && strict < 0.5)
        escapeChance = Math.max(0, escapeChance - 0.5);
    else if (strict)
        escapeChance = Math.max(0, escapeChance - strict);
    escapeChance /= 1.0 + KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax * KinkyDungeonDistractionUnlockSuccessMod;
    let chargecosts = true;
    if (wcost > 0 && !KinkyDungeonHasWill(-wcost, false)) {
        chargecosts = false;
        KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle"), KDBaseRed, 2, true);
    }
    else if (!KinkyDungeonHasStamina(-cost, true)) {
        chargecosts = false;
        KinkyDungeonWaitMessage(true, 0);
    }
    else if (KinkyDungeonTargetTile && KinkyDungeonTargetTile.pickProgress >= 1) {
        Pass = "Success";
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Unlock.ogg");
    }
    else if (KDLocks[lock] && KDLocks[lock].breakChance({})) {
        Pass = "Break";
        KDAddConsumable("Pick", -1);
        KinkyDungeonPickBreakProgress = 0;
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/PickBreak.ogg");
    }
    else if (!KinkyDungeonStatsChoice.get("Psychic") && (handsBound || (armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
        KinkyDungeonDropItem({ name: "Pick" }, KinkyDungeonPlayerEntity, true);
        KDAddConsumable("Pick", -1);
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Miss.ogg");
    }
    else {
        KinkyDungeonTargetTile.pickProgress += escapeChance;
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Pick.ogg");
    }
    KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonAttemptPick" + Pass).replace("TargetRestraint", TextGet("KinkyDungeonObject" + (KinkyDungeonTargetTile.Type || "Lock"))), (Pass == "Success") ? KDBaseLightGreen : KDBaseRed, 1);
    if (chargecosts) {
        KDChangeStamina(KinkyDungeonTargetTileLocation, "map", "pick", cost, true);
        KDChangeWill(KinkyDungeonTargetTileLocation, "map", "pick", wcost);
    }
    KinkyDungeonSetFlag("tryescaping", 3);
    return Pass == "Success";
}
function KinkyDungeonUnlockAttempt(lock) {
    let Pass = "Fail";
    let escapeChance = 1.0;
    KinkyDungeonInterruptSleep();
    let handsBound = KinkyDungeonIsHandsBound(false, true, 0.85, undefined, undefined, false) && !KinkyDungeonCanUseFeet();
    let armsBound = KinkyDungeonIsArmsBound(false, true, undefined, undefined, false);
    let strict = KinkyDungeonStrictness(false, "ItemHands");
    if (!strict)
        strict = 0;
    if (armsBound)
        escapeChance = Math.max(0.1, escapeChance - 0.25);
    if (handsBound && strict < 0.5)
        escapeChance = Math.max(0, escapeChance - 0.5);
    else if (strict)
        escapeChance = Math.max(0, escapeChance - strict);
    if (KinkyDungeonStatsChoice.get("Psychic"))
        escapeChance = Math.max(escapeChance, 0.33);
    if (KDRandom() < escapeChance)
        Pass = "Success";
    KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonStruggleUnlock" + Pass).replace("TargetRestraint", TextGet("KinkyDungeonObject")), (Pass == "Success") ? KDBaseLightGreen : KDBaseRed, 1);
    if (Pass == "Success") {
        KinkyDungeonRemoveKeysUnlock(lock);
        if (KDLocks[lock] && KDLocks[lock].loot_special && KinkyDungeonTargetTile && KinkyDungeonTargetTile.Loot == "normal")
            KinkyDungeonSpecialLoot = true;
        else if (KDLocks[lock] && KDLocks[lock].loot_locked && KinkyDungeonTargetTile && KinkyDungeonTargetTile.Loot == "normal")
            KinkyDungeonLockedLoot = true;
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Unlock.ogg");
        return true;
    }
    else if (!KinkyDungeonStatsChoice.get("Psychic") && (handsBound || (armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
        let keytype = KinkyDungeonGetKey(lock);
        if (keytype) {
            KinkyDungeonRemoveKeysDropped(lock, keytype);
        }
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Miss.ogg");
    }
    else {
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Pick.ogg");
    }
    KinkyDungeonSetFlag("tryescaping", 3);
    return false;
}
function KDGetRestraintAffinity(item, data) {
    data.item = item;
    data.affinity = "";
    data.overrideAffinity = false;
    if (KDRestraint(item) && KDRestraint(item).affinity) {
        if (KDRestraint(item).affinity[data.StruggleType]) {
            for (let a of KDRestraint(item).affinity[data.StruggleType]) {
                data.affinity = a;
                if (KinkyDungeonGetAffinity(false, a, data.StruggleGroup))
                    break;
            }
        }
    }
    KinkyDungeonSendEvent("beforeAffinityCalc", data);
    if (!data.overrideAffinity && data.affinity == "") {
        switch (data.StruggleType) {
            case "Struggle":
                data.affinity = "Hook";
                break;
            case "Remove":
                data.affinity = "Edge";
                break;
            case "Cut":
                data.affinity = "Sharp";
                break;
            case "Pick":
                data.affinity = "";
                break;
            case "Unlock":
                data.affinity = "Sticky";
                break;
        }
    }
    return data.affinity;
}
function KDApplyPlayerStruggleBonuses(player, data, ApplyPlayerBonus) {
    let StruggleType = data.struggleType;
    let escapeChance = data.escapeChance;
    let limitChance = data.limitChance;
    let restraint = data.restraint;
    if (ApplyPlayerBonus) {
        if (StruggleType == "Pick") {
            if (KinkyDungeonStatsChoice.get("Locksmith")) {
                escapeChance += KDLocksmithBonus;
            }
            if (KinkyDungeonStatsChoice.get("Clueless"))
                limitChance -= KDCluelessBonus;
        }
        else if (StruggleType == "Remove" || StruggleType == "Unlock") {
            if (KinkyDungeonStatsChoice.get("Flexible")) {
                escapeChance += KDFlexibleBonus;
            }
            if (KinkyDungeonStatsChoice.get("Inflexible"))
                limitChance *= KDInflexibleMult;
        }
        else if (StruggleType == "Struggle") {
            if (KinkyDungeonStatsChoice.get("Strong")) {
                escapeChance += KDStrongBonus;
            }
            if (KinkyDungeonStatsChoice.get("Weak"))
                limitChance -= KDWeakBonus;
        }
    }
    if (StruggleType != "Unlock") {
        if (KinkyDungeonStatsChoice.get("HighSecurity")) {
            KinkyDungeonKeyPickBreakAmount = KDDamselPickAmount;
        }
        else {
            KinkyDungeonKeyPickBreakAmount = KinkyDungeonKeyPickBreakAmountBase;
        }
        if (KinkyDungeonStatsChoice.get("ShoddyKnives")) {
            KinkyDungeonKnifeBreakAmount = KDBunnyKnifeAmount;
            KinkyDungeonEnchKnifeBreakAmount = KDBunnyEnchKnifeAmount;
        }
        else {
            KinkyDungeonKnifeBreakAmount = KinkyDungeonKnifeBreakAmountBase;
            KinkyDungeonEnchKnifeBreakAmount = KinkyDungeonEnchKnifeBreakAmountBase;
        }
        if (KinkyDungeonStatsChoice.get("FreeSpirit") && (KDRestraint(restraint).chastity || KDRestraint(restraint).chastitybra))
            escapeChance += 0.5;
        if (KinkyDungeonStatsChoice.get("StrugglePerLevel")) {
            escapeChance += KDStrugglePerLevelBonus * Math.max(0, Math.min(KinkyDungeonMaxLevel - 1, 1 + MiniGameKinkyDungeonLevel));
        }
        else if (KinkyDungeonStatsChoice.get("StrugglePerLevelNeg")) {
            limitChance += KDStrugglePerLevelBonus * Math.max(0, Math.min(KinkyDungeonMaxLevel - 1, 1 + MiniGameKinkyDungeonLevel));
        }
        if (KinkyDungeonStatsChoice.get("EasierBlindfolds") && KDRestraint(restraint).Group == "ItemHead") {
            escapeChance += KDClearVisionBonus * (1 + Math.max(0, Math.min(1, KDRestraint(restraint).power / 20)));
        }
        if (KinkyDungeonStatsChoice.get("Unchained") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Metal")) {
            escapeChance += (StruggleType == "Cut" ? 0.5 : 1) * KDUnchainedBonus;
        }
        else if (KinkyDungeonStatsChoice.get("Artist") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Rope")) {
            escapeChance += (StruggleType == "Cut" ? 0.5 : 1) * KDArtistBonus;
        }
        else if (KinkyDungeonStatsChoice.get("Slippery") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Latex")) {
            escapeChance += (StruggleType == "Cut" ? 0.5 : 1) * KDSlipperyBonus;
        }
        else if (KinkyDungeonStatsChoice.get("Escapee") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Leather")) {
            escapeChance += (StruggleType == "Cut" ? 0.5 : 1) * KDEscapeeBonus;
        }
        if (KinkyDungeonStatsChoice.get("Damsel") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Metal")) {
            if (escapeChance > 0)
                limitChance += escapeChance * 0.2;
            if (StruggleType != "Pick" && StruggleType != "Unlock" && limitChance > 0 && limitChance < -KDDamselBonus)
                limitChance *= KDDamselBonus;
        }
        else if (KinkyDungeonStatsChoice.get("Bunny") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Rope")) {
            if (escapeChance > 0)
                limitChance += escapeChance * 0.2;
            if (StruggleType != "Pick" && StruggleType != "Unlock" && limitChance > 0 && limitChance < -KDBunnyBonus)
                limitChance *= KDBunnyBonus;
        }
        else if (KinkyDungeonStatsChoice.get("Doll") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Latex")) {
            if (escapeChance > 0)
                limitChance += escapeChance * 0.2;
            if (StruggleType != "Pick" && StruggleType != "Unlock" && limitChance > 0 && limitChance < -KDDollBonus)
                limitChance *= KDDollBonus;
        }
        else if (KinkyDungeonStatsChoice.get("Dragon") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Leather")) {
            if (escapeChance > 0)
                limitChance += escapeChance * 0.2;
            if (StruggleType != "Pick" && StruggleType != "Unlock" && limitChance > 0 && limitChance < -KDDragonBonus)
                limitChance *= KDDragonBonus;
        }
        if (KinkyDungeonStatsChoice.get("PainfulChoice")) {
            if (escapeChance > 0) {
                let num = 0;
                for (let grp of KinkyDungeonStruggleGroupsBase) {
                    let items = KDDynamicLinkList(KinkyDungeonGetRestraintItem(grp));
                    for (let inv of items) {
                        if (KDIsBinding(inv)) {
                            num++;
                            break;
                        }
                    }
                }
                escapeChance *= Math.min(KDPainfulChoiceMax, KDPainfulChoicePenalty + num * KDPainfulChoiceBonus);
            }
        }
    }
    data.limitChance = limitChance;
    data.escapeChance = escapeChance;
}
function KDGetEscapeChance(restraint, StruggleType, escapeChancePre, limitChancePre, ApplyGhost, ApplyPlayerBonus, Msg) {
    let escapeChance = escapeChancePre != undefined ? escapeChancePre : KDRestraint(restraint).escapeChance[StruggleType] != undefined ? KDRestraint(restraint).escapeChance[StruggleType] : 1.0;
    if (KDGetCurse(restraint))
        escapeChance = -100;
    let lockType = (restraint.lock && KDLocks[restraint.lock]) ? KDLocks[restraint.lock] : null;
    if (lockType) {
        let extraChance = (StruggleType == "Pick" && lockType.pick_diff) ? lockType.pick_diff : 0;
        if (extraChance)
            escapeChance += extraChance;
        if (StruggleType == "Unlock" && lockType.unlock_diff) {
            escapeChance -= lockType.unlock_diff;
        }
    }
    let limitChance = limitChancePre != undefined ? limitChancePre : (KDRestraint(restraint).limitChance != undefined && KDRestraint(restraint).limitChance[StruggleType] != undefined) ? KDRestraint(restraint).limitChance[StruggleType] :
        ((StruggleType == "Unlock" || StruggleType == "Pick") ? 0 : 0.12);
    let data = {
        restraint: restraint,
        escapeChance: escapeChance,
        limitChance: limitChance,
        struggleType: StruggleType,
        escapeChancePre: escapeChancePre,
        limitChancePre: limitChancePre,
        ApplyGhost: ApplyGhost,
        ApplyPlayerBonus: ApplyPlayerBonus,
        GoddessBonus: 0,
        Msg: Msg,
    };
    KDApplyPlayerStruggleBonuses(KDPlayer(), data, ApplyPlayerBonus);
    let GoddessBonus = KDGetItemGoddessBonus(restraint, data);
    if (GoddessBonus > 0) {
        data.escapeChance += GoddessBonus;
    }
    else {
        data.limitChance -= GoddessBonus;
    }
    data.GoddessBonus = GoddessBonus;
    KinkyDungeonSendEvent("perksStruggleCalc", data);
    return {
        escapeChance: data.escapeChance,
        limitChance: data.limitChance,
        escapeChanceData: data,
    };
}
let KDUnboundAffinityOverride = {
    "Sticky": true,
    "Edge": true,
    "Hook": true,
};
function KDGetDynamicItem(group, index) {
    let restraint = KinkyDungeonGetRestraintItem(group);
    let host = restraint;
    if (index) {
        let surfaceItems = KDDynamicLinkListSurface(restraint);
        let dynamicItems = KDDynamicLinkList(restraint, true);
        if (surfaceItems[index]) {
            restraint = surfaceItems[index];
            for (let h_item of dynamicItems) {
                if (h_item.dynamicLink == restraint) {
                    host = h_item;
                    break;
                }
            }
        }
        else
            console.log("Error! Please report the item combination and screenshot to Ada!");
    }
    return { restraint: restraint, host: host };
}
function KDGetStruggleData(data) {
    if (data.struggleType == "Cut")
        data.cost = KinkyDungeonStatStaminaCostTool;
    else if (data.struggleType == "Pick")
        data.cost = KinkyDungeonStatStaminaCostPick;
    else if (data.struggleType == "Remove")
        data.cost = KinkyDungeonStatStaminaCostRemove;
    else if (data.struggleType == "Unlock")
        data.cost = KinkyDungeonStatStaminaCostPick;
    if (data.struggleType == "Cut")
        data.wcost = KinkyDungeonStatWillCostTool;
    else if (data.struggleType == "Pick")
        data.wcost = KinkyDungeonStatWillCostPick;
    else if (data.struggleType == "Remove")
        data.wcost = KinkyDungeonStatWillCostRemove;
    else if (data.struggleType == "Unlock")
        data.wcost = KinkyDungeonStatWillCostUnlock;
    if (data.struggleType == "Unlock")
        data.cost = 0;
    KinkyDungeonSendEvent("beforeStruggleCalc", data);
    if (!data.restraint.pickProgress)
        data.restraint.pickProgress = 0;
    if (!data.restraint.struggleProgress)
        data.restraint.struggleProgress = 0;
    if (!data.restraint.unlockProgress)
        data.restraint.unlockProgress = 0;
    if (!data.restraint.cutProgress)
        data.restraint.cutProgress = 0;
    data.lowEscapeChance = Math.min(data.escapeChance, data.lowEscapeChance);
    let EC = KDGetEscapeChance(data.restraint, data.struggleType, data.escapeChance, data.limitChance, true, true, !data.query);
    data.escapeChance = EC.escapeChance;
    data.limitChance = EC.limitChance;
    data.lowEscapeChance = Math.min(data.escapeChance, data.lowEscapeChance);
    if (KDGroupBlocked(data.struggleGroup) && !KDRestraint(data.restraint).alwaysStruggleable) {
        data.escapeChance = 0;
        if (!data.query) {
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                    + ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint).Blocked) ?
                        KDGetEscapeSFX(data.restraint).Blocked : "Struggle")
                    + ".ogg");
            KinkyDungeonSendActionMessage(10, TextGet("KDStruggleBlocked")
                .replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), KDBaseRed, 2, true);
            KinkyDungeonLastAction = "Struggle";
            KDPauseBalance(5);
            KinkyDungeonSendEvent("struggle", {
                restraint: data.restraint,
                group: data.struggleGroup,
                struggleType: data.struggleType,
                result: "Blocked",
            });
            return "Blocked";
        }
    }
    let toolMult = Math.max(0, 1 + data.toolBonus) * data.toolMult;
    let cutMult = Math.max(0, 1 + data.cutMultBonus) * data.cutMult;
    let buffMult = Math.max(0, 1 + data.buffBonus) * data.buffMult;
    if (data.struggleType == "Pick" || data.struggleType == "Unlock")
        data.escapeChance += KinkyDungeonGetPickBonus() * toolMult;
    data.origEscapeChance = data.escapeChance;
    let increasedAttempts = false;
    data.handsBound = KinkyDungeonIsHandsBound(true, false, StruggleTypeHandThresh[data.struggleType], data.struggleGroup, false, data.query) && !KinkyDungeonCanUseFeet(undefined, data.struggleGroup);
    data.handBondage = data.handsBound ? 1.0 : Math.min(1, Math.max(0, KDHandBondageTotal(false)));
    if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostStruggle"))
        data.escapePenalty -= KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostStruggle");
    if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostStruggle_" + data.struggleType))
        data.escapePenalty -= KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostStruggle_" + data.struggleType);
    KinkyDungeonSendEvent("calcEscapePenalty", data);
    let armsBound = KinkyDungeonIsArmsBound(true, false, data.struggleGroup, false, data.query);
    let armsBoundOverride = false;
    let handsBoundOverride = false;
    let returnType = "";
    let returnFunction = () => { };
    if (data.struggleType == "Cut") {
        if (data.hasAffinity) {
            if (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp() || !KinkyDungeonPlayerDamage) {
                let maxBonus = 0;
                let weaponsToTest = KinkyDungeonAllWeapon();
                for (let inv of weaponsToTest) {
                    if (KDWeapon(inv).cutBonus > maxBonus)
                        maxBonus = KDWeapon(inv).cutBonus;
                    if (KDWeapon(inv).cutBonus != undefined && KDWeaponIsMagic(inv))
                        data.canCutMagic = true;
                }
                data.cutBonus = maxBonus * cutMult;
                data.escapeChance += data.cutBonus;
                data.origEscapeChance += data.cutBonus;
            }
            else if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.cutBonus) {
                data.cutBonus = KinkyDungeonPlayerDamage.cutBonus * cutMult;
                data.escapeChance += data.cutBonus;
                data.origEscapeChance += data.cutBonus;
            }
        }
        let bc = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostCutting");
        if (bc) {
            data.cutBonus += bc * (bc > 0 ? cutMult : 1.0);
            data.escapePenalty -= bc * (bc > 0 ? cutMult : 1.0);
        }
        if (!data.query && (!data.hasAffinity ||
            (!data.canCutMagic && KDRestraint(data.restraint)?.magic))) {
            if (!KinkyDungeonPlayerDamage || !KinkyDungeonPlayerDamage.cutBonus) {
                if (!KinkyDungeonFlags.get("tut_cut")) {
                    KinkyDungeonSetFlag("tut_cut", -1);
                    KinkyDungeonSendTextMessage(10, TextGet("KDTut_Cut"), KDTutorialColor, 10);
                }
            }
            else if (data.handsBound || data.armsBound || (!data.canCutMagic && KDRestraint(data.restraint)?.magic)) {
                if (!KinkyDungeonFlags.get("tut_cutcrack") || !KinkyDungeonFlags.get("tut_cutmagic")) {
                    let maxBonus = 0;
                    let canCutMagic = false;
                    let weaponsToTest = KinkyDungeonAllWeapon();
                    for (let inv of weaponsToTest) {
                        if (KDWeapon(inv).cutBonus > maxBonus)
                            maxBonus = KDWeapon(inv).cutBonus;
                        if (KDWeapon(inv).cutBonus != undefined && KDWeaponIsMagic(inv))
                            canCutMagic = true;
                    }
                    if (!KinkyDungeonFlags.get("tut_cutmagic") && !data.canCutMagic && KDRestraint(data.restraint)?.magic) {
                        if (!canCutMagic) {
                            KinkyDungeonSendTextMessage(10, TextGet("KDTut_CutMagic"), KDTutorialColor, 10);
                            KinkyDungeonSetFlag("tut_cutmagic", -1);
                        }
                        else {
                            KinkyDungeonSendTextMessage(10, TextGet("KDTut_CutMagicHas"), KDTutorialColor, 10);
                            KinkyDungeonSetFlag("tut_cutmagic", -1);
                        }
                    }
                    else if (!KinkyDungeonFlags.get("tut_cutcrack") && maxBonus && !(!data.canCutMagic && KDRestraint(data.restraint)?.magic)) {
                        KinkyDungeonSetFlag("tut_cutcrack", -1);
                        KinkyDungeonSendTextMessage(10, TextGet("KDTut_CutCrack2"), KDTutorialColor, 10);
                        KinkyDungeonSendTextMessage(10, TextGet("KDTut_CutCrack"), KDTutorialColor, 10);
                    }
                }
            }
        }
        if (data.angelHelp) {
            data.cutBonus += KDAngelStruggleBonus.Cut;
            data.escapePenalty -= KDAngelStruggleBonus.Cut;
        }
        let bcm = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostCuttingMinimum");
        if (bcm) {
            let diff = bcm - data.cutBonus;
            if (diff > 0) {
                data.cutBonus = bcm;
                data.escapePenalty -= bcm;
            }
        }
    }
    if (data.struggleType == "Cut" && !KDRestraint(data.restraint).magic && KinkyDungeonWeaponCanCut(false, true)) {
        data.escapeChance += KinkyDungeonEnchantedKnifeBonus * toolMult;
        data.origEscapeChance += KinkyDungeonEnchantedKnifeBonus * toolMult;
    }
    if (KDUnboundAffinityOverride[data.affinity] && (!data.handsBound || handsBoundOverride) && (!armsBound || armsBoundOverride))
        data.hasAffinity = true;
    if (data.struggleType == "Remove" &&
        (!data.handsBound && (KinkyDungeonWeaponCanCut(true) || KinkyDungeonItemCount("Pick"))
            || (data.struggleGroup == "ItemHands" && KinkyDungeonCanTalk() && !armsBound))) {
        data.escapeChance = Math.max(data.escapeChance, Math.min(1, data.escapeChance + 0.15 * toolMult));
        data.origEscapeChance = Math.max(data.origEscapeChance, Math.min(1, data.origEscapeChance + 0.15 * toolMult));
    }
    if (data.struggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic"))
        data.escapeChance = Math.max(data.escapeChance, 0.25);
    if (data.restriction > 0 && !KinkyDungeonHasHelp()) {
        let restrictionMult = 1 - 10 / (10 + data.restriction);
        if (data.escapeChance > 0) {
            let penalty = 0;
            switch (data.struggleType) {
                case "Struggle": {
                    penalty = 0.3;
                    break;
                }
                case "Cut": {
                    penalty = 0.6;
                    break;
                }
                case "Unlock": {
                    penalty = 0.3;
                    break;
                }
                case "Pick": {
                    penalty = 0.4;
                    break;
                }
                case "Remove": {
                    penalty = 0.4;
                    break;
                }
            }
            data.escapePenalty += data.escapeChance * penalty * restrictionMult;
        }
    }
    let edgeBonus = 0.12 * toolMult;
    if ((data.struggleType == "Struggle" || data.struggleType == "Cut") && data.hasAffinity)
        data.escapeChance += edgeBonus * (0.4 + 0.2 * Math.max(2 - KinkyDungeonSlowLevel, 0));
    else if ((data.struggleType == "Remove") && data.hasAffinity)
        data.escapeChance += edgeBonus * (0.2 + 0.15 * Math.max(2 - KinkyDungeonSlowLevel, 0));
    if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Lockdown")) {
        KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonBuffLockdownTry")
            .replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), KDBaseRed, 1);
        data.escapeChance -= KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Lockdown") * 0.1;
    }
    if (data.escapePenalty < 0)
        data.escapePenalty *= buffMult;
    let minAmount = 0.1 - Math.max(0, 0.01 * KDRestraint(data.restraint).power);
    if (data.struggleType == "Remove" && !data.hasAffinity)
        minAmount = 0;
    if (data.upfrontWill && data.willEscapePenalty) {
        data.escapePenalty += data.willEscapePenalty;
        if (data.escapeChance - data.escapePenalty + data.willEscapePenalty > 0
            && data.escapeChance - data.escapePenalty < 0) {
            if (!data.query) {
                if (!returnType) {
                    returnType = "Will";
                    returnFunction = () => {
                        if (KDSoundEnabled())
                            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                + ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint).NoWill) ? KDGetEscapeSFX(data.restraint).NoWill : "Struggle")
                                + ".ogg");
                        KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle")
                            .replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), KDBaseRed, 2, true);
                        KinkyDungeonLastAction = "Struggle";
                        KDPauseBalance(5);
                        KinkyDungeonSendEvent("struggle", {
                            restraint: data.restraint,
                            group: data.struggleGroup,
                            struggleType: data.struggleType,
                            result: "Will",
                        });
                    };
                }
            }
        }
    }
    if (data.escapePenalty) {
        data.escapeChance -= data.escapePenalty;
    }
    if (!KDRestraint(data.restraint).noaffinity && (data.struggleType == "Struggle") && !data.hasAffinity
        && data.escapeChance <= 0 && data.escapeChance >= -edgeBonus && (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
        let typesuff = "";
        if (!data.query) {
            if (!returnType) {
                returnType = "NeedEdge";
                returnFunction = () => {
                    if (KDSoundEnabled())
                        AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                            + ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint).Struggle) ? KDGetEscapeSFX(data.restraint).Struggle : "Struggle")
                            + ".ogg");
                    if (data.affinity && !KinkyDungeonGetAffinity(false, data.affinity, data.struggleGroup))
                        typesuff = "Wrong" + data.affinity;
                    if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.1)
                        typesuff = typesuff + "Aroused";
                    KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "NeedEdge" + typesuff)
                        .replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), KDBaseRed, 2, true);
                    KinkyDungeonLastAction = "Struggle";
                    KDPauseBalance(5);
                    KinkyDungeonSendEvent("struggle", {
                        restraint: data.restraint,
                        group: data.struggleGroup,
                        struggleType: data.struggleType,
                        result: "NeedEdge",
                    });
                };
            }
        }
    }
    let removeFail = ((data.struggleType == "Unlock" && !KinkyDungeonStatsChoice.get("Psychic")) || data.struggleType == "Pick") && !(KinkyDungeonHasHelp()) && KDGetEscapeChance(data.restraint, "Remove", undefined, undefined, false, false).escapeChance <= 0;
    if (removeFail) {
        data.escapeChance = 0;
    }
    if (data.escapeChance <= 0
        && (!KDRestraint(data.restraint).alwaysEscapable
            || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
        if (!data.restraint.attempts)
            data.restraint.attempts = 0;
        if (!data.query && data.restraint.attempts < KinkyDungeonMaxImpossibleAttempts) {
            increasedAttempts = true;
            data.restraint.attempts += 1;
            if (data.escapeChance <= -0.5)
                data.restraint.attempts += 1;
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                    + ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
                    + ".ogg");
            return "Fail";
        }
        else {
            if (!data.query) {
                if (!returnType) {
                    returnType = "Impossible";
                    returnFunction = () => {
                        let typesuff = "";
                        if (removeFail || (data.origEscapeChance <= 0 && data.helpChance))
                            typesuff = "3";
                        else if (KDRestraint(data.restraint).specStruggleTypes && KDRestraint(data.restraint).specStruggleTypes.includes(data.struggleType))
                            typesuff = "2";
                        if (KDSoundEnabled())
                            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                + ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
                                + ".ogg");
                        if (typesuff == "" && data.failSuffix)
                            typesuff = data.failSuffix;
                        if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.1)
                            typesuff = typesuff + "Aroused";
                        KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "Impossible" + typesuff)
                            .replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), KDBaseRed, 2, true);
                        if (EC.escapeChanceData.GoddessBonus < 0 && EC.escapeChanceData.escapeChance < 0 && EC.escapeChance - EC.escapeChanceData.GoddessBonus > 0) {
                            KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonStruggle" + data.struggleType + "ImpossibleGoddess")
                                .replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), KDBaseRed, 2, true);
                        }
                        if (KinkyDungeonHasStamina(-data.cost)) {
                            KinkyDungeonLastAction = "Struggle";
                            KDPauseBalance(5);
                            KinkyDungeonSendEvent("struggle", {
                                restraint: data.restraint,
                                group: data.struggleGroup,
                                struggleType: data.struggleType,
                                result: "Impossible",
                            });
                            if (!KinkyDungeonFlags.get("tut_shrinebondage")) {
                                KinkyDungeonSetFlag("tut_shrinebondage", -1);
                                KinkyDungeonSendTextMessage(10, TextGet("KDTut_Bondage"), KDTutorialColor, 10);
                            }
                            KDChangeStamina(data.struggleGroup, data.struggleType, "struggle", data.cost, true, 1);
                            KDChangeWill(data.struggleGroup, data.struggleType, "struggle", data.wcost);
                            if (KinkyDungeonStatsChoice.get("BondageLover") && !KDRestraint(data.restraint)?.armor)
                                KDChangeDistraction("BondageLover", "perk", "struggle", KDBondageLoverAmount, false, 0.1);
                        }
                        KinkyDungeonAdvanceTime(1);
                        KinkyDungeonSetFlag("escapeimpossible", 2);
                        KinkyDungeonSetFlag("embarrassed", 8);
                    };
                }
            }
            if (!returnType)
                returnType = "Impossible";
        }
    }
    if (data.escapeChance > 0 && !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && data.struggleType != "Struggle" && armsBound) {
        if (data.struggleGroup == "ItemArms")
            data.escapeChance *= 0.8;
        else if (data.struggleGroup != "ItemHands")
            data.escapeChance *= 0.7;
        else
            data.escapeChance *= 0.6;
    }
    if (data.escapeChance > minAmount && data.struggleType != "Struggle" && armsBound) {
        data.escapeChance = Math.max(minAmount, data.escapeChance - (data.struggleGroup != "ItemArms" ? 0.18 : 0.09));
    }
    else if (data.escapeChance > minAmount && data.struggleType == "Remove" && !armsBound && !data.handsBound)
        data.escapeChance = Math.max(minAmount, data.escapeChance + 0.07 * (1 - KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax));
    if (((data.struggleType == "Unlock" && !KinkyDungeonStatsChoice.get("Psychic")) || data.struggleType == "Pick" || data.struggleType == "Remove") && data.handsBound)
        data.escapeChance = (data.escapeChance > 0 ? (data.struggleGroup != "ItemHands" ? 0.6 : 0.8) : 1)
            * Math.max((data.struggleType == "Remove" && data.hasAffinity) ?
                Math.max(0, (data.escapeChance > 0 ? data.escapeChance * 0.8 : data.escapeChance)) : 0, data.escapeChance - 0.07 - 0.1 * data.handBondage);
    if (data.struggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic"))
        data.escapeChance = Math.max(data.escapeChance, 0.2);
    if (!KDRestraint(data.restraint).noaffinity && (data.struggleType == "Remove") && !data.hasAffinity && data.escapeChance == 0 && (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
        let typesuff = "";
        if (!data.query) {
            if (!returnType) {
                returnType = "NeedEdge";
                returnFunction = () => {
                    if (KDSoundEnabled())
                        AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                            + ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
                            + ".ogg");
                    if (data.affinity && !KinkyDungeonGetAffinity(false, data.affinity, data.struggleGroup))
                        typesuff = "Wrong" + data.affinity;
                    if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.1)
                        typesuff = typesuff + "Aroused";
                    KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "NeedEdge" + typesuff)
                        .replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), KDBaseRed, 2, true);
                    KinkyDungeonLastAction = "Struggle";
                    KDPauseBalance(5);
                    KinkyDungeonSendEvent("struggle", {
                        restraint: data.restraint,
                        group: data.struggleGroup,
                        struggleType: data.struggleType,
                        result: "NeedEdge",
                    });
                };
            }
        }
    }
    let possible = data.escapeChance > 0;
    if (data.strict && data.struggleType == "Struggle") {
        data.escapeChance = data.escapeChance > 0 ? Math.max(0, data.escapeChance - data.strict * 0.9)
            : data.escapeChance - data.strict * 0.9;
    }
    if (data.struggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic"))
        data.escapeChance = Math.max(data.escapeChance, 0.2);
    if (possible && data.escapeChance == 0 && (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
        let typesuff = "";
        if (!data.query) {
            if (!returnType) {
                returnType = "Strict";
                returnFunction = () => {
                    if (KDSoundEnabled())
                        AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                            + ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
                            + ".ogg");
                    if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.1)
                        typesuff = typesuff + "Aroused";
                    KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "Strict" + typesuff)
                        .replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), KDBaseRed, 2, true);
                    KinkyDungeonLastAction = "Struggle";
                    KDPauseBalance(5);
                    KinkyDungeonSendEvent("struggle", {
                        restraint: data.restraint,
                        group: data.struggleGroup,
                        struggleType: data.struggleType,
                        result: "Strict",
                    });
                    if (!KinkyDungeonFlags.get("tut_shrinebondage")) {
                        KinkyDungeonSetFlag("tut_shrinebondage", -1);
                        KinkyDungeonSendTextMessage(10, TextGet("KDTut_Bondage"), KDTutorialColor, 10);
                    }
                };
            }
        }
    }
    if (data.escapeChance > 0 && data.struggleType == "Cut" && KinkyDungeonIsHandsBound(true, false, undefined, data.struggleGroup, false, data.query)) {
        if (KinkyDungeonAllWeapon().some((inv) => { return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined; })) {
            if (KinkyDungeonWallCrackAndKnife(true)) {
                data.escapeChance *= 0.92;
                data.limitChance *= 0.9;
            }
            else if (!KinkyDungeonIsArmsBound(true, false, data.struggleGroup, false, data.query)) {
                data.escapeChance *= 0.7;
                data.limitChance *= 0.8;
            }
            else if (KinkyDungeonStatsChoice.get("Psychic")) {
                data.escapeChance *= 0.7;
                data.limitChance *= 0.8;
            }
            else if (data.hasAffinity) {
                data.escapeChance *= 0.5;
                data.limitChance *= 0.6;
            }
            else {
                KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNeedGrip"), KDBaseRed, 2, true);
                data.escapeChance *= 0.0;
            }
        }
        else if (data.hasAffinity)
            data.escapeChance *= 0.5;
        else {
            data.escapeChance = 0;
        }
    }
    if (data.escapeChance > 0
        && !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp())
        && (data.struggleType == "Pick" || data.struggleType == "Unlock" || data.struggleType == "Remove"))
        data.escapeChance /= 1.0 + KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax * KinkyDungeonDistractionUnlockSuccessMod;
    if (data.lockType && data.lockType.penalty && data.lockType.penalty[data.struggleType]) {
        data.escapeChance = data.escapeChance > 0 ? Math.max(0, data.escapeChance - data.lockType.penalty[data.struggleType])
            : (data.escapeChance - data.lockType.penalty[data.struggleType]);
    }
    if (data.struggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic"))
        data.escapeChance = Math.max(data.escapeChance, 0.15);
    let belt = null;
    let bra = null;
    if (data.escapeChance > 0) {
        if (data.struggleGroup == "ItemVulva" || data.struggleGroup == "ItemVulvaPiercings" || data.struggleGroup == "ItemButt")
            belt = KinkyDungeonGetRestraintItem("ItemPelvis");
        if (belt && KDRestraint(belt) && KDRestraint(belt).chastity) {
            data.escapeChance = 0.0;
        }
        if (data.struggleGroup == "ItemNipples" || data.struggleGroup == "ItemNipplesPiercings")
            bra = KinkyDungeonGetRestraintItem("ItemBreast");
        if (bra && KDRestraint(bra) && KDRestraint(bra).chastitybra) {
            data.escapeChance = 0.0;
        }
    }
    if (!data.query) {
        KinkyDungeonSetFlag(data.struggleType, 1);
        KinkyDungeonSetFlag("escaping", 1);
    }
    if (data.escapeChance <= 0
        && (!KDRestraint(data.restraint).alwaysEscapable || !KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
        if (!data.restraint.attempts)
            data.restraint.attempts = 0;
        if (data.restraint.attempts < KinkyDungeonMaxImpossibleAttempts || increasedAttempts) {
            if (!increasedAttempts) {
                data.restraint.attempts += 0.5;
                if (data.escapeChance <= -0.5)
                    data.restraint.attempts += 0.5;
            }
            if (data.query) {
                if (!returnType)
                    returnType = "Fail";
            }
            else
                return "Fail";
        }
        else {
            if (!data.query) {
                if (!returnType) {
                    returnType = "Impossible";
                    returnFunction = () => {
                        if (KDSoundEnabled())
                            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                + ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint)[data.struggleType]) ? KDGetEscapeSFX(data.restraint)[data.struggleType] : "Struggle")
                                + ".ogg");
                        let suff = "";
                        if (suff == "" && data.failSuffix)
                            suff = data.failSuffix;
                        if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.1)
                            suff = suff + "Aroused";
                        KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + data.struggleType + "ImpossibleBound" + suff)
                            .replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), KDBaseRed, 2, true);
                        if (KinkyDungeonHasStamina(-data.cost)) {
                            KinkyDungeonLastAction = "Struggle";
                            KDPauseBalance(5);
                            KinkyDungeonSendEvent("struggle", {
                                restraint: data.restraint,
                                group: data.struggleGroup,
                                struggleType: data.struggleType,
                                result: "Impossible",
                            });
                            if (!KinkyDungeonFlags.get("tut_shrinebondage")) {
                                KinkyDungeonSetFlag("tut_shrinebondage", -1);
                                KinkyDungeonSendTextMessage(10, TextGet("KDTut_Bondage"), KDTutorialColor, 10);
                            }
                            KDChangeStamina(data.struggleGroup, data.struggleType, "struggle", data.cost, true, 1);
                            KDChangeWill(data.struggleGroup, data.struggleType, "struggle", data.wcost);
                            if (KinkyDungeonStatsChoice.get("BondageLover") && !KDRestraint(data.restraint)?.armor)
                                KDChangeDistraction("BondageLover", "perk", "struggle", KDBondageLoverAmount, false, 0.1);
                        }
                        KinkyDungeonAdvanceTime(1);
                        KinkyDungeonSetFlag("escapeimpossible", 2);
                        KinkyDungeonSetFlag("embarrassed", 8);
                    };
                }
            }
        }
    }
    if (data.escapeChance > 0) {
        if (KDRestraint(data.restraint) && KDRestraint(data.restraint).escapeMult != undefined)
            data.escapeChance *= KDRestraint(data.restraint).escapeMult;
        if (KDRestraint(data.restraint) && KDRestraint(data.restraint).struggleMult
            && KDRestraint(data.restraint).struggleMult[data.struggleType] != undefined)
            data.escapeChance *= KDRestraint(data.restraint).struggleMult[data.struggleType];
        if (KDRestraint(data.restraint) && KDRestraint(data.restraint).limitMult
            && KDRestraint(data.restraint).limitMult[data.struggleType] != undefined)
            data.limitChance *= KDRestraint(data.restraint).limitMult[data.struggleType];
    }
    if (!data.upfrontWill && data.willEscapePenalty) {
        data.limitChance += data.willEscapePenalty;
        if (data.escapeChance - data.limitChance + data.willEscapePenalty > 0
            && data.escapeChance - data.limitChance < 0) {
            if (!data.query) {
                if (!returnType) {
                    returnType = "Will";
                    returnFunction = () => {
                        if (KDSoundEnabled())
                            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                + ((KDGetEscapeSFX(data.restraint) && KDGetEscapeSFX(data.restraint).NoWill) ? KDGetEscapeSFX(data.restraint).NoWill : "Struggle")
                                + ".ogg");
                        KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle")
                            .replace("TargetRestraint", TextGet("Restraint" + data.restraint.name)), KDBaseRed, 2, true);
                        KinkyDungeonLastAction = "Struggle";
                        KDPauseBalance(5);
                        KinkyDungeonSendEvent("struggle", {
                            restraint: data.restraint,
                            group: data.struggleGroup,
                            struggleType: data.struggleType,
                            result: "Will",
                        });
                    };
                }
            }
        }
    }
    if (data.escapeChance > Math.max(0, data.limitChance, data.extraLim)
        || (KDRestraint(data.restraint).alwaysEscapable
            && KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
        data.minSpeed = (KDRestraint(data.restraint).struggleMinSpeed && KDRestraint(data.restraint).struggleMinSpeed[data.struggleType]) ? KDRestraint(data.restraint).struggleMinSpeed[data.struggleType] : data.minSpeed;
        data.escapeChance = Math.max(data.escapeChance, data.minSpeed);
    }
    if (data.escapeChance > 0 && data.struggleType != "Unlock") {
        for (let T = 0; T < data.restraint.tightness; T++) {
            data.escapeChance *= KDGetTightnessEffect(data.escapeChance, data.struggleType, T);
        }
    }
    if (KDRestraint(data.restraint) && KDRestraint(data.restraint).struggleMaxSpeed && KDRestraint(data.restraint).struggleMaxSpeed[data.struggleType] != undefined)
        data.escapeChance = Math.min(data.escapeChance, KDRestraint(data.restraint).struggleMaxSpeed[data.struggleType]);
    if (data.escapeChance < data.limitChance && (KDRestraint(data.restraint).alwaysEscapable
        && KDRestraint(data.restraint).alwaysEscapable.includes(data.struggleType))) {
        data.escapeChance = Math.max((data.minSpeed) || 0, data.limitChance + 0.01);
    }
    returnFunction();
    return returnType;
}
function KinkyDungeonStruggle(struggleGroup, StruggleType, index, query = false, retData) {
    if (!query && KinkyDungeonPlayerEntity && !KinkyDungeonCanTalk() && KDRandom() < KinkyDungeonGagMumbleChanceRestraint) {
        let msg = "KinkyDungeonGagStruggle" + (StruggleType != "Struggle" ? "Quiet" : "");
        let gagMsg = Math.floor(KDRandom() * 3);
        msg = msg + gagMsg;
        KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet(msg), KDBaseWhite, 5, 3);
    }
    if (!query)
        KinkyDungeonSetFlag("tryescaping", 3);
    let restraint = KinkyDungeonGetRestraintItem(struggleGroup);
    let host = restraint;
    if (index) {
        let surfaceItems = KDDynamicLinkListSurface(restraint);
        let dynamicItems = KDDynamicLinkList(restraint, true);
        if (surfaceItems[index]) {
            restraint = surfaceItems[index];
            for (let h_item of dynamicItems) {
                if (h_item.dynamicLink == restraint) {
                    host = h_item;
                    break;
                }
            }
        }
        else
            console.log("Error! Please report the item combination and screenshot to Ada!");
    }
    if (!restraint)
        return "Fail";
    KinkyDungeonCurrentEscapingItem = restraint;
    KinkyDungeonCurrentEscapingMethod = StruggleType;
    KinkyDungeonStruggleTime = CommonTime() + 750;
    let Pass = "Fail";
    let restraintEscapeChancePre = KDRestraint(restraint).escapeChance[StruggleType] != undefined ? KDRestraint(restraint).escapeChance[StruggleType] : 1.0;
    let restraintLimitChancePre = (KDRestraint(restraint).limitChance && KDRestraint(restraint).limitChance[StruggleType] != undefined) ? KDRestraint(restraint).limitChance[StruggleType] : 0.12;
    let helpChance = (KDRestraint(restraint).helpChance != undefined && KDRestraint(restraint).helpChance[StruggleType] != undefined) ? KDRestraint(restraint).helpChance[StruggleType] : 0.0;
    let limitChance = (KDRestraint(restraint).limitChance != undefined && KDRestraint(restraint).limitChance[StruggleType] != undefined) ? KDRestraint(restraint).limitChance[StruggleType] :
        ((StruggleType == "Unlock" || StruggleType == "Pick") ? 0 : KDGetBaseLimitChance(StruggleType));
    let speedmult = (KDRestraint(restraint).speedMult != undefined && KDRestraint(restraint).speedMult[StruggleType] != undefined) ? KDRestraint(restraint).speedMult[StruggleType] :
        1;
    if (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) {
        if (!query)
            KinkyDungeonSetFlag("HelpMeFlag", 8);
        if (helpChance)
            restraintEscapeChancePre = helpChance;
        if (limitChance > 0 && StruggleType != "Cut") {
            let limchance = limitChance;
            limchance = Math.max(0, limitChance - KDAllyLimitChanceRedFlat);
            limchance *= KDAllyLimitChanceRedMult;
            let diff = limchance - limitChance;
            if (diff < 0) {
                restraintEscapeChancePre -= diff;
            }
        }
    }
    if (!query)
        KinkyDungeonInterruptSleep();
    let affinity = KDGetRestraintAffinity(restraint, { StruggleType: StruggleType });
    let data = {
        minSpeed: KDMinEscapeRate,
        handBondage: 0,
        handsBound: false,
        armsBound: false,
        query: query,
        cutBonus: 0,
        cutVulnerability: KDRestraint(restraint).cutVulnerability,
        restraint: restraint,
        struggleType: StruggleType,
        struggleGroup: struggleGroup,
        escapeChance: restraintEscapeChancePre,
        lowEscapeChance: restraintEscapeChancePre,
        origEscapeChance: restraintEscapeChancePre,
        origLimitChance: restraintLimitChancePre,
        limitChance: limitChance,
        helpChance: helpChance,
        cutSpeed: 0.25,
        affinity: affinity,
        noise: StruggleType == "Struggle" ? 4 : 0,
        strict: KinkyDungeonStrictness(true, struggleGroup, restraint),
        hasAffinity: KDRestraint(restraint)?.noaffinity ? false : KinkyDungeonGetAffinity(!query, affinity, struggleGroup),
        restraintEscapeChance: KDRestraint(restraint).escapeChance[StruggleType],
        cost: KinkyDungeonStatStaminaCostStruggle,
        wcost: KinkyDungeonStatWillCostStruggle,
        escapePenalty: -KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StrugglePower"),
        willEscapePenalty: KDGetWillPenalty(StruggleType),
        canCut: KinkyDungeonWeaponCanCut(false, false),
        canCutMagic: KinkyDungeonWeaponCanCut(false, true),
        toolBonus: 0.0,
        cutMultBonus: 0.0,
        toolMult: 1.0,
        cutMult: 1.0,
        buffBonus: 0.0,
        failSuffix: "",
        buffMult: 1.0,
        struggleTime: 1.0,
        restriction: KDGameData.Restriction || 0,
        speedMult: (speedmult || 1) * (KinkyDungeonHasHelp() ? 2.0 : 1.0) * (KDBaseSpeedMult[StruggleType] || 1),
        escapeSpeed: 0,
        maxLimit: 1,
        result: "",
        lockType: (restraint.lock && KDLocks[restraint.lock]) ? KDLocks[restraint.lock] : null,
        extraLim: 0,
        extraLimPenalty: 0,
        extraLimThreshold: 0,
        angelHelp: KinkyDungeonHasAngelHelp(),
        upfrontWill: KDUpfrontWill,
    };
    if (restraint && KDRestraint(restraint).failSuffix && KDRestraint(restraint).failSuffix[StruggleType]) {
        data.failSuffix = KDRestraint(restraint).failSuffix[StruggleType];
    }
    if (data.angelHelp) {
        if (KDAngelStruggleBonus[StruggleType] != undefined) {
            if (StruggleType != "Cut")
                data.escapePenalty -= KDAngelStruggleBonus[StruggleType];
        }
        else {
            data.escapePenalty -= KDAngelStruggleBonus.Default;
        }
    }
    if ((data.struggleType == "Pick" || data.struggleType == "Unlock") && !data.lockType)
        return "Fail";
    data.escapeSpeed = KDBaseEscapeSpeed * data.speedMult;
    data.extraLim = (data.struggleType == "Pick" && data.lockType?.pick_lim) ? Math.max(0, data.lockType.pick_lim) : 0;
    data.extraLimPenalty = (data.struggleType == "Pick") ? data.extraLim * data.restraint.pickProgress : 0;
    data.extraLimThreshold = Math.min(1, (data.escapeChance / data.extraLim));
    let result = KDGetStruggleData(data);
    if (retData)
        Object.assign(retData, data);
    if (!query) {
        if (data.lockType && (StruggleType == "Unlock" && !data.lockType.canUnlock(data))
            || (StruggleType == "Pick" && data.lockType && !data.lockType.canPick(data))) {
            KinkyDungeonSetFlag("embarrassed", 3);
            if (StruggleType == "Unlock")
                KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggleUnlockNo" + restraint.lock + "Key")
                    .replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "orange", 2, true);
            else
                KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggleCantPick" + restraint.lock + "Lock")
                    .replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "orange", 2, true);
        }
        else if (result != "Impossible") {
            let maxLimit = 100;
            if (!KinkyDungeonHasStamina(-data.cost, true)) {
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                        + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).NoStamina) ? KDGetEscapeSFX(restraint).NoStamina : "Struggle")
                        + ".ogg");
                KinkyDungeonWaitMessage(true, 0);
            }
            else if (data.escapeChance > 0) {
                let cutStruggleProgress = Math.min(1, (data.restraint.struggleProgress || 0) + (data.restraint.cutProgress || 0));
                if ((data.limitChance > 0 || data.extraLim > 0) && data.escapeChance > 0) {
                    let threshold = 0.75;
                    if (data.limitChance > data.escapeChance) {
                        threshold = Math.min(threshold, 0.9 * (data.escapeChance / data.limitChance));
                    }
                    let limitProgress = 0;
                    let maxPossible = 1;
                    switch (StruggleType) {
                        case "Struggle":
                            limitProgress = (data.restraint.struggleProgress) ? ((data.restraint.struggleProgress) < threshold ?
                                threshold * (data.restraint.struggleProgress)
                                : 1.0)
                                : 0;
                            if (data.limitChance > 0 && data.limitChance > data.escapeChance) {
                                maxPossible = threshold;
                            }
                            break;
                        case "Cut":
                            threshold = KDMaxCutDepth(threshold, data.cutBonus, data.origEscapeChance, data.origLimitChance, data.cutVulnerability);
                            limitProgress = (data.restraint.cutProgress || 0) ? ((data.restraint.cutProgress || 0) < threshold ? (Math.min(0.9, data.restraint.cutProgress || 0) / Math.max(0.1, threshold)) : 1.0)
                                : 0;
                            if (data.limitChance > 0) {
                                maxPossible = threshold;
                            }
                            break;
                        default:
                            limitProgress = cutStruggleProgress ?
                                Math.min(1, 1.15 - 1.15 * cutStruggleProgress)
                                : 1;
                            break;
                    }
                    let limitPenalty = Math.max(0, Math.min(1, limitProgress) * data.limitChance, data.extraLimPenalty);
                    if (StruggleType == "Cut" && data.escapeChance > 0) {
                        limitPenalty = Math.min(limitPenalty, data.escapeChance * limitProgress);
                    }
                    if (data.extraLim > data.escapeChance) {
                        maxPossible = Math.min(data.extraLimThreshold, maxPossible);
                    }
                    if (maxPossible < 1)
                        maxLimit = maxPossible;
                    if (data.extraLimPenalty > 0 && data.extraLimPenalty > limitPenalty) {
                        data.escapeChance -= data.extraLimPenalty;
                        if (data.escapeChance <= 0) {
                            if (KDSoundEnabled())
                                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                    + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint)[data.struggleType]) ? KDGetEscapeSFX(restraint)[data.struggleType] : "Struggle")
                                    + ".ogg");
                            KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeon" + StruggleType + "Limit")
                                .replace("TargetRestraint", TextGet("Restraint" + restraint.name)), KDBaseRed, 2, true);
                            KinkyDungeonLastAction = "Struggle";
                            KDPauseBalance(5);
                            KinkyDungeonSendEvent("struggle", {
                                restraint: restraint,
                                group: struggleGroup,
                                struggleType: StruggleType,
                                result: "LimitExtra",
                            });
                            return "LimitExtra";
                        }
                    }
                    else if (limitPenalty > 0) {
                        data.escapeChance -= limitPenalty;
                        if (data.escapeChance <= 0) {
                            if (KDSoundEnabled())
                                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                    + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint)[data.struggleType]) ? KDGetEscapeSFX(restraint)[data.struggleType] : "Struggle")
                                    + ".ogg");
                            KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeon" + StruggleType + "Limit")
                                .replace("TargetRestraint", TextGet("Restraint" + restraint.name)), KDBaseRed, 2, true);
                            KinkyDungeonLastAction = "Struggle";
                            KDPauseBalance(5);
                            KinkyDungeonSendEvent("struggle", {
                                restraint: restraint,
                                group: struggleGroup,
                                struggleType: StruggleType,
                                result: "Limit",
                            });
                            return "Limit";
                        }
                    }
                }
                let progress = restraint.cutProgress ? restraint.cutProgress : 0;
                if (data.escapeChance <= 0 || Math.abs(progress - maxLimit) < 0.005) {
                    if (KDSoundEnabled())
                        AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                            + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint)[data.struggleType]) ? KDGetEscapeSFX(restraint)[data.struggleType] : "Struggle")
                            + ".ogg");
                    KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeon" + StruggleType + "Barely")
                        .replace("TargetRestraint", TextGet("Restraint" + restraint.name)), KDBaseRed, 2, true);
                    KinkyDungeonLastAction = "Struggle";
                    KDPauseBalance(5);
                    KinkyDungeonSendEvent("struggle", {
                        restraint: restraint,
                        group: struggleGroup,
                        struggleType: StruggleType,
                        result: "Barely",
                    });
                    return "Barely";
                }
                data.struggleTime *=
                    KinkyDungeonStatsChoice.get("FranticStruggle") ? 1 :
                        Math.max(1, KDStruggleTime
                            - KinkyDungeonGetBuffedStat(KinkyDungeonPlayerEntity, "FastStruggle"));
                if (KinkyDungeonStatsChoice.get("FranticStruggle"))
                    data.cost *= 1.5;
                if (maxLimit >= 1 && ((StruggleType == "Cut" && progress >= 1 - data.escapeChance / Math.max(1, data.struggleTime))
                    || (StruggleType == "Pick" && restraint.pickProgress >= 1 - data.escapeChance / Math.max(1, data.struggleTime))
                    || (StruggleType == "Unlock" && restraint.unlockProgress >= 1 - data.escapeChance / Math.max(1, data.struggleTime))
                    || (StruggleType == "Remove" && progress >= 1 - data.escapeChance / Math.max(1, data.struggleTime))
                    || (progress >= 1 - data.escapeChance / Math.max(1, data.struggleTime)))
                    && !(StruggleType == "Pick" && data.lockType && !data.lockType.canPick(data))) {
                    Pass = "Success";
                    if (StruggleType == "Unlock") {
                        KinkyDungeonRemoveKeysUnlock(restraint.lock);
                        KinkyDungeonLock(restraint, "", undefined, false, false, true);
                    }
                    else
                        KDSuccessRemove(StruggleType, restraint, data.lockType, index, data, host);
                }
                else {
                    if (StruggleType == "Cut") {
                        if (((data.handsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound) || (data.armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound)) && KinkyDungeonWeaponCanCut(false) && KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name) {
                            if (KDSoundEnabled())
                                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                    + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).KnifeDrop) ? KDGetEscapeSFX(restraint).KnifeDrop : "Miss")
                                    + ".ogg");
                            Pass = "Drop";
                            KinkyDungeonDisarm(KinkyDungeonPlayerEntity, "Cut");
                        }
                        else {
                            if (KDItemIsMagic(restraint) && !data.canCutMagic) {
                                if (KDSoundEnabled())
                                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                        + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).NoMagic) ? KDGetEscapeSFX(restraint).NoMagic : "SoftShield")
                                        + ".ogg");
                                Pass = "Fail";
                            }
                            else {
                                if (KDSoundEnabled()) {
                                    if (KDItemIsMagic(restraint))
                                        AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                            + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).MagicCut) ? KDGetEscapeSFX(restraint).MagicCut : "Cut")
                                            + ".ogg");
                                    else
                                        AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                            + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).Cut) ? KDGetEscapeSFX(restraint).Cut : "Cut")
                                            + ".ogg");
                                }
                                let mult = 1.0 - 0.9 * Math.min(1.0, progress);
                                if (KinkyDungeonStatsChoice.get("Flexible"))
                                    mult *= KDFlexibleSpeedBonus;
                                if (KinkyDungeonStatsChoice.get("Inflexible"))
                                    mult *= KDInflexibleSpeedBonus;
                                let speed = data.cutSpeed * mult + Math.max(0, data.escapeChance) * 0.5;
                                mult *= 0.75 + 0.25 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
                                KDAddDelayedStruggle(data.escapeSpeed * speed * (0.3 + 0.2 * KDRandom() + 0.6 * Math.max(0, (KinkyDungeonStatStamina) / KinkyDungeonStatStaminaMax)), data.struggleTime, StruggleType, struggleGroup, index, data, restraint.cutProgress, maxLimit);
                                if (speed > 0) {
                                    let debris = "";
                                    let debrisFlag = KDRestraint(restraint).Group + "deb";
                                    if (!KinkyDungeonFlags.get(debrisFlag)) {
                                        if (KDRestraint(restraint)?.debris && KDRandom() < KDRestraint(restraint)?.debrisChance ? KDRestraint(restraint)?.debrisChance : 1.0)
                                            debris = KDRestraint(restraint)?.debris;
                                    }
                                    if (debris) {
                                        KinkyDungeonSetFlag(debrisFlag, 4);
                                        KDCreateDebris(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, {
                                            aoe: 1.5,
                                            dist: 0.5,
                                            kind: debris,
                                            number: 1,
                                        });
                                    }
                                }
                            }
                        }
                    }
                    else if (StruggleType == "Pick") {
                        if (data.lockType && data.lockType.breakChance(data)) {
                            Pass = "Break";
                            if (KDSoundEnabled())
                                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                    + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).PickBreak) ? KDGetEscapeSFX(restraint).PickBreak : "PickBreak")
                                    + ".ogg");
                            KDAddConsumable("Pick", -1);
                            KinkyDungeonPickBreakProgress = 0;
                        }
                        else if (!KinkyDungeonStatsChoice.get("Psychic") && (data.handsBound || (data.armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
                            if (KDSoundEnabled())
                                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                    + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).PickDrop) ? KDGetEscapeSFX(restraint).PickDrop : "Miss")
                                    + ".ogg");
                            Pass = "Drop";
                            KinkyDungeonDropItem({ name: "Pick" }, KinkyDungeonPlayerEntity, true);
                            KDAddConsumable("Pick", -1);
                        }
                        else {
                            if (KDSoundEnabled())
                                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                    + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).Pick) ? KDGetEscapeSFX(restraint).Pick : "Pick")
                                    + ".ogg");
                            if (!restraint.pickProgress)
                                restraint.pickProgress = 0;
                            let mult = 0.5 + 0.6 * (progress);
                            if (data.lockType?.pick_speed)
                                mult /= data.lockType.pick_speed;
                            if (KinkyDungeonStatsChoice.get("Locksmith"))
                                mult *= KDLocksmithSpeedBonus;
                            if (KinkyDungeonStatsChoice.get("Clueless"))
                                mult *= KDCluelessSpeedBonus;
                            mult *= 0.5 + 0.5 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
                            KDAddDelayedStruggle(data.escapeSpeed * mult * (data.escapeChance > 0 ? (KDMinPickRate * (data.escapeChance > 0.5 ? 2 : 1)) : 0) * (0.8 + 0.4 * KDRandom() - 0.4 * Math.max(0, (KinkyDungeonStatDistraction) / KinkyDungeonStatDistractionMax)), data.struggleTime, StruggleType, struggleGroup, index, data, restraint.pickProgress, maxLimit);
                        }
                    }
                    else if (StruggleType == "Unlock") {
                        if (!KinkyDungeonStatsChoice.get("Psychic") && (data.handsBound || (data.armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
                            if (KDSoundEnabled())
                                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                    + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).KeyDrop) ? KDGetEscapeSFX(restraint).KeyDrop : "Miss")
                                    + ".ogg");
                            Pass = "Drop";
                            let keytype = KinkyDungeonGetKey(restraint.lock);
                            if (keytype) {
                                KinkyDungeonRemoveKeysDropped(restraint.lock, keytype);
                            }
                        }
                        else {
                            if (KDSoundEnabled())
                                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                    + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).Pick) ? KDGetEscapeSFX(restraint).Pick : "Pick")
                                    + ".ogg");
                            let mult = 0.2 + 1.8 * (progress);
                            if (KinkyDungeonStatsChoice.get("Flexible"))
                                mult *= KDFlexibleSpeedBonus;
                            if (KinkyDungeonStatsChoice.get("Inflexible"))
                                mult *= KDInflexibleSpeedBonus;
                            if (KinkyDungeonStatsChoice.get("Locksmith"))
                                mult *= KDLocksmithSpeedBonus;
                            mult *= 0.5 + 0.5 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
                            KDAddDelayedStruggle(data.escapeSpeed * mult * Math.max(data.escapeChance > 0 ? data.minSpeed : 0, data.escapeChance) * (0.8 + 0.4 * KDRandom() - 0.4 * Math.max(0, (KinkyDungeonStatDistraction) / KinkyDungeonStatDistractionMax)), data.struggleTime, StruggleType, struggleGroup, index, data, restraint.unlockProgress, maxLimit);
                        }
                    }
                    else if (StruggleType == "Remove") {
                        if (KDSoundEnabled())
                            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).Remove) ? KDGetEscapeSFX(restraint).Remove : "Struggle")
                                + ".ogg");
                        let mult = 0.3 + 1.7 * (progress * progress);
                        if (KinkyDungeonStatsChoice.get("Flexible"))
                            mult *= KDFlexibleSpeedBonus;
                        if (KinkyDungeonStatsChoice.get("Inflexible"))
                            mult *= KDInflexibleSpeedBonus;
                        mult *= 0.75 + 0.25 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
                        KDAddDelayedStruggle(data.escapeSpeed * mult * Math.max(data.escapeChance > 0 ? data.minSpeed : 0, data.escapeChance) * (0.8 + 0.4 * KDRandom() - 0.3 * Math.max(0, (KinkyDungeonStatDistraction) / KinkyDungeonStatDistractionMax)), data.struggleTime, StruggleType, struggleGroup, index, data, restraint.struggleProgress, maxLimit);
                    }
                    else if (StruggleType == "Struggle") {
                        if (KDSoundEnabled())
                            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                                + ((KDGetEscapeSFX(restraint) && KDGetEscapeSFX(restraint).Struggle) ? KDGetEscapeSFX(restraint).Struggle : "Struggle")
                                + ".ogg");
                        let mult = 1.25 - 0.75 * (progress);
                        if (KinkyDungeonStatsChoice.get("Flexible"))
                            mult *= KDFlexibleSpeedBonus;
                        if (KinkyDungeonStatsChoice.get("Inflexible"))
                            mult *= KDInflexibleSpeedBonus;
                        mult *= 0.5 + 0.5 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
                        KDAddDelayedStruggle(data.escapeSpeed * mult * Math.max(data.escapeChance > 0 ? data.minSpeed : 0, data.escapeChance) * (0.5 + 0.4 * KDRandom() + 0.3 * Math.max(0, (KinkyDungeonStatStamina) / KinkyDungeonStatStaminaMax)), data.struggleTime, StruggleType, struggleGroup, index, data, restraint.struggleProgress, maxLimit);
                    }
                }
            }
            let suff = "";
            if (Pass == "Fail" && data.escapeChance > 0 && data.origEscapeChance <= 0) {
                if ((KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && data.helpChance)
                    suff = "3";
                else
                    suff = "2";
            }
            else if (Pass == "Fail") {
                if (suff == "" && data.failSuffix)
                    suff = data.failSuffix;
            }
            if ((suff == "" || (Pass == "Fail" && suff == data.failSuffix)) && (Pass == "Fail" || Pass == "Success") && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.1)
                suff = suff + "Aroused";
            if (Pass != "Success")
                KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonStruggle" + StruggleType + Pass + suff).replace("TargetRestraint", TextGet("Restraint" + KDRestraint(restraint).name)), (Pass == "Success") ? KDBaseLightGreen : KDBaseRed, 2);
            if (KinkyDungeonHasStamina(-data.cost)) {
                KDChangeStamina(data.struggleGroup, data.struggleType, "struggle", data.cost, true, 1);
                KDChangeWill(data.struggleGroup, data.struggleType, "struggle", data.wcost);
                if (KinkyDungeonStatsChoice.get("BondageLover") && !KDRestraint(data.restraint)?.armor)
                    KDChangeDistraction("BondageLover", "perk", "struggle", KDBondageLoverAmount, false, 0.1);
                if (Pass != "Success") {
                    if (StruggleType == "Struggle") {
                        restraint.pickProgress = Math.max(0, restraint.pickProgress * 0.5 - 0.01);
                        restraint.unlockProgress = Math.max(0, restraint.unlockProgress * 0.5 - 0.01);
                    }
                    else if (StruggleType == "Pick") {
                        restraint.unlockProgress = Math.max(0, restraint.unlockProgress * 0.5 - 0.01);
                    }
                    else if (StruggleType == "Unlock") {
                        restraint.pickProgress = Math.max(0, restraint.pickProgress * 0.5 - 0.01);
                    }
                    if (StruggleType == "Remove") {
                        restraint.pickProgress = Math.max(0, restraint.pickProgress * 0.5 - 0.01);
                        restraint.unlockProgress = Math.max(0, restraint.unlockProgress * 0.5 - 0.01);
                    }
                }
                else if (!KDRestraint(restraint)?.armor && KinkyDungeonGoddessRep.Ghost < 0 && (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()))
                    KinkyDungeonChangeRep("Ghost", 1);
                KinkyDungeonSendEvent("struggle", {
                    restraint: restraint,
                    group: struggleGroup,
                    struggleType: StruggleType,
                    result: Pass,
                });
                KinkyDungeonLastAction = "Struggle";
                KDPauseBalance(5);
                if (data.noise) {
                    KinkyDungeonMakeNoise(data.noise, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
                }
            }
            KinkyDungeonAdvanceTime(1);
            if (KDGameData.DelayedActions?.length > 0)
                KDUpdateWaitTime(KDWaitTimeDelayedAction());
            if (Pass == "Success")
                KinkyDungeonCurrentEscapingItem = null;
            return Pass;
        }
        KinkyDungeonSetFlag("escapeimpossible", 2);
        KinkyDungeonSetFlag("embarrassed", 8);
        return "Impossible";
    }
    else {
        return result || ((data.escapeChance - Math.max(0, data.limitChance, data.extraLim) > 0) ? "Success" : "Impossible");
    }
}
function KinkyDungeonGetRestraintItem(group, index) {
    for (let item of KinkyDungeonAllRestraint()) {
        if (item.type == Restraint && KDRestraint(item).Group == group) {
            if (index) {
                let link = item;
                let count = 0;
                while (count < index && link) {
                    count += 1;
                    link = link.dynamicLink;
                }
                if (count == index)
                    return link;
                return null;
            }
            return item;
        }
    }
    return null;
}
function KinkyDungeonRefreshRestraintsCache() {
    KinkyDungeonRestraintsCache = new Map();
    for (let r of KinkyDungeonRestraints) {
        KinkyDungeonRestraintsCache.set(r.name, r);
    }
}
function KinkyDungeonGetRestraintByName(Name) {
    if (KinkyDungeonRestraintsCache.size > 0) {
    }
    else {
        KinkyDungeonRefreshRestraintsCache();
    }
    if (KinkyDungeonRestraintVariants[Name])
        Name = KinkyDungeonRestraintVariants[Name].template;
    return KinkyDungeonRestraintsCache.get(Name);
}
function KinkyDungeonGetLockMult(Lock, item, curse, restraint) {
    if (restraint && !KinkyDungeonIsLockable(restraint))
        return 1;
    let mult = 1;
    if (Lock && KDLocks[Lock])
        mult = KDLocks[Lock].lockmult;
    if (item && KDGetCurse(item))
        mult = KDCurseMult(KDGetCurse(item));
    if (curse)
        mult = KDCurseMult(curse);
    return mult;
}
let KDHeavyRestraintPrefs = [
    "More_Petsuits",
    "More_Armbinders",
    "More_Boxbinders",
    "More_Jackets",
    "More_Yokes",
    "Less_Armbinders",
    "Less_Boxbinders",
    "Less_Jackets",
    "Less_Yokes",
    "Less_Tickle",
];
let KDNoOverrideTags = [
    "NoVibes",
    "Unmasked",
    "NoSenseDep",
    "NoHood",
    "FreeBoob",
    "NoBelt",
    "Unchained",
    "EasierBlindfolds",
    "ClearVision",
    "StrugglePerLevel",
    "StrugglePerLevelNeg",
    "Damsel",
    "NoPet",
    "NoKigu",
    "NoBlindfolds",
    "Blackout",
    "NoInvis",
    "NoBoots",
    "BubbleOptout",
    "BubblePref",
    "SlimePref",
    "SlimeOptout",
    "Estim",
    "RobotVetoTape",
    "RobotVetoLatex",
    "TapePref",
    "BallsuitOptout",
    "Less_Tickle",
    "TapeOptout",
    "arousalMode",
    "arousalModePlug",
    "arousalModePlugNoFront",
    "arousalModePlugFront",
    "arousalModePlugNoRear",
    "arousalModePiercing",
    ...KDHeavyRestraintPrefs,
];
function KDGetWillPercent(applier, penalty = 0) {
    let data = {
        willPercent: (KinkyDungeonStatWill / KinkyDungeonStatWillMax - 0.15 * KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax)
            / (1 + (KinkyDungeonGoddessRep.Ghost + 50) / 100),
        willMult: (KinkyDungeonSlowLevel > 0) ? (0.6 + 0.4 * Math.min(1, Math.max(0, 1 - KinkyDungeonSlowLevel / 3))) : 0,
        willPenalty: penalty,
        applier: applier,
    };
    KinkyDungeonSendEvent("calcWillPercent", data);
    data.willPercent *= data.willMult;
    data.willPercent = Math.max(0, Math.min(1, data.willPercent - data.willPenalty));
    return data.willPercent;
}
let geteligrest_lastTagsEnemy = null;
let geteligrest_lastIgnoreTags = null;
let geteligrest_lastExtraTags = null;
let geteligrest_lastTags = new Map();
function KDGeteligrest_gettags(effLevel, enemy, ignoreTags, extraTags) {
    let tags = new Map();
    if (enemy.tags.length) {
        for (let t of enemy.tags) {
            tags.set(t, true);
        }
    }
    else {
        for (let t of Object.keys(enemy.tags)) {
            tags.set(t, true);
        }
    }
    if (extraTags)
        for (let t of Object.entries(extraTags)) {
            if (effLevel >= +t[1])
                tags.set(t[0], true);
        }
    if (ignoreTags) {
        for (let ft of ignoreTags) {
            tags.delete(ft);
        }
    }
    return tags;
}
function KDGetRestraintsEligible(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, filterEps = 0.9, minWeightFallback = true, useAugmented = false, augmentedInventory = undefined, options) {
    let RestraintsList = [];
    let effLevel = Level;
    if (!options?.suppressTightPerk && KinkyDungeonStatsChoice.has("TightRestraints")) {
        effLevel *= KDTightRestraintsMult;
        effLevel += KDTightRestraintsMod;
    }
    if (KinkyDungeonStatsChoice.has("NoWayOut"))
        RequireWill = false;
    let willPercent = KDGetWillPercent(securityEnemy, options?.willBonus);
    let useMemo = geteligrest_lastTagsEnemy === enemy
        && geteligrest_lastIgnoreTags == filter?.ignoreTags
        && geteligrest_lastExtraTags == extraTags;
    let tags = useMemo ? geteligrest_lastTags : new Map();
    if (!useMemo) {
        tags = KDGeteligrest_gettags(effLevel, enemy, filter?.ignoreTags, extraTags);
        geteligrest_lastTags = tags;
        geteligrest_lastTagsEnemy = enemy;
        geteligrest_lastIgnoreTags = filter?.ignoreTags;
        geteligrest_lastExtraTags = extraTags;
    }
    let arousalMode = KinkyDungeonStatsChoice.get("arousalMode");
    let cache = [];
    for (let restraint of KinkyDungeonRestraints) {
        if (filter?.requireTags && !filter.requireTags.every((tag) => { return restraint.shrine?.includes(tag); }))
            continue;
        if ((effLevel >= restraint.minLevel
            || KinkyDungeonNewGame > 0
            || (restraint.ignoreMinLevelTags?.some((t) => { return tags.get(t); }))
            || filter?.require?.includes(restraint.name)) && (!restraint.maxLevel
            || effLevel < restraint.maxLevel
            || (restraint.ignoreMaxLevelTags?.some((t) => { return tags.get(t); }))) && (restraint.allFloors
            || restraint.floors[Index]
            || (restraint.ignoreFloorTags?.some((t) => { return tags.get(t); })))) {
            if (!restraint.arousalMode || arousalMode) {
                if (filter?.filterGroups?.some((fg) => {
                    return fg == restraint.Group;
                })) {
                }
                else {
                    let enabled = false;
                    let weight = restraint.weight;
                    for (let t of tags.keys()) {
                        if (restraint.enemyTags[t] != undefined) {
                            weight += restraint.enemyTags[t];
                            enabled = true;
                        }
                    }
                    if (restraint.enemyTagsMult)
                        for (let t of tags.keys()) {
                            if (restraint.enemyTagsMult[t] != undefined) {
                                weight *= restraint.enemyTagsMult[t];
                            }
                        }
                    if (enabled) {
                        cache.push({ r: restraint, w: weight });
                    }
                }
            }
        }
    }
    if (options?.extraOptions) {
        for (let opt of options.extraOptions) {
            if (KDRest(opt))
                cache.push({ r: KDRest(opt), w: options?.inventoryWeight || 100, name: opt, inventory: true });
        }
    }
    let add = false;
    let addedVar = false;
    for (let r of cache) {
        let restraint = r.r;
        if (filter && !r.inventory) {
            if (filter.currentWill != undefined && r.r.maxwill != undefined && filter.currentWill > r.r.maxwill)
                continue;
            if (filter.allowedGroups && !filter.allowedGroups.includes(r.r.Group))
                continue;
            if (filter.maxPower && r.r.power > filter.maxPower && (!filter.looseLimit || !r.r.unlimited))
                continue;
            if (filter.minPower && r.r.power < filter.minPower && (!filter.looseLimit || !r.r.limited) && !r.r.unlimited)
                continue;
            if (filter.onlyUnlimited && r.r.limited)
                continue;
            if (filter.noUnlimited && r.r.unlimited)
                continue;
            if (filter.noLimited && r.r.limited)
                continue;
            if (filter.onlyLimited && !r.r.limited && !r.r.unlimited)
                continue;
            if (filter.ignore && filter.ignore.includes(r.r.name))
                continue;
            if (filter.require && !filter.require.includes(r.r.name))
                continue;
        }
        if ((!LeashingOnly || (restraint.Group == "ItemNeck" || restraint.Group == "ItemNeckRestraints" || restraint.leash))
            && (!RequireWill || !restraint.maxwill || willPercent <= restraint.maxwill || (LeashingOnly && (restraint.Group == "ItemNeck" || restraint.Group == "ItemNeckRestraints" || restraint.leash)))) {
            if (restraint.arousalMode && !KinkyDungeonStatsChoice.get("arousalMode"))
                continue;
            if (restraint.Group == "ItemButt" && !KinkyDungeonStatsChoice.get("arousalModePlug"))
                continue;
            if (restraint.Group == "ItemVulva" && restraint.shrine.includes("Plugs")
                && KinkyDungeonStatsChoice.get("arousalModePlugNoFront"))
                continue;
            add = false;
            addedVar = false;
            if (agnostic || KDCanAddRestraint(restraint, Bypass, Lock, NoStack, undefined, options?.ForceDeep || KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, options?.noOverpower, securityEnemy, useAugmented, curse, augmentedInventory, undefined, options)) {
                if (restraint.playerTags)
                    for (let tag in restraint.playerTags)
                        if ((!agnostic || KDNoOverrideTags.includes(tag)) && KinkyDungeonPlayerTags.get(tag))
                            r.w += restraint.playerTags[tag];
                if (restraint.playerTagsMult)
                    for (let tag in restraint.playerTagsMult)
                        if ((!agnostic || KDNoOverrideTags.includes(tag)) && KinkyDungeonPlayerTags.get(tag))
                            r.w *= restraint.playerTagsMult[tag];
                if (restraint.playerTagsMissing)
                    for (let tag in restraint.playerTagsMissing)
                        if ((!agnostic || KDNoOverrideTags.includes(tag)) && !KinkyDungeonPlayerTags.get(tag))
                            r.w += restraint.playerTagsMissing[tag];
                if (restraint.playerTagsMissingMult)
                    for (let tag in restraint.playerTagsMissingMult)
                        if ((!agnostic || KDNoOverrideTags.includes(tag)) && !KinkyDungeonPlayerTags.get(tag))
                            r.w *= restraint.playerTagsMissingMult[tag];
                if (!agnostic && !(options?.dontAugmentWeight === false)) {
                    let mult = KDRestraintPowerMult(KinkyDungeonPlayerEntity, restraint, augmentedInventory);
                    if (Math.sign(mult) != Math.sign(r.w))
                        mult = 1;
                    r.w *= mult;
                }
                if (r.w > 0 && (r.w > filterEps)) {
                    add = true;
                }
            }
            if (options?.ApplyVariants && restraint.ApplyVariants && !r.inventory) {
                for (let variant of Object.entries(restraint.ApplyVariants)) {
                    if (Level >= KDApplyVariants[variant[0]].minfloor && !(Level >= KDApplyVariants[variant[0]].maxfloor)
                        && (!variant[1].enemyTags || Object.keys(variant[1].enemyTags).some((tag) => { return tags.get(tag) != undefined; }))
                        && (agnostic || KDCanAddRestraint(restraint, Bypass, Lock, NoStack, undefined, KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, options?.noOverpower, securityEnemy, useAugmented, curse, augmentedInventory, KDApplyVariants[variant[0]].powerBonus, options))) {
                        let w = r.w * (variant[1].weightMult || 1) + (variant[1].weightMod || 0);
                        if (variant[1].enemyTags)
                            for (let tag in variant[1].enemyTags)
                                if (tags.get(tag))
                                    w += variant[1].enemyTags[tag];
                        if (variant[1].enemyTagsMult)
                            for (let tag in variant[1].enemyTagsMult)
                                if (tags.get(tag))
                                    w *= variant[1].enemyTagsMult[tag];
                        if (variant[1].playerTags)
                            for (let tag in variant[1].playerTags)
                                if ((!agnostic || KDNoOverrideTags.includes(tag)) && KinkyDungeonPlayerTags.get(tag))
                                    w += variant[1].playerTags[tag];
                        if (variant[1].playerTagsMult)
                            for (let tag in variant[1].playerTagsMult)
                                if ((!agnostic || KDNoOverrideTags.includes(tag)) && KinkyDungeonPlayerTags.get(tag))
                                    w *= variant[1].playerTagsMult[tag];
                        if (variant[1].playerTagsMissing)
                            for (let tag in variant[1].playerTagsMissing)
                                if ((!agnostic || KDNoOverrideTags.includes(tag)) && !KinkyDungeonPlayerTags.get(tag))
                                    w += variant[1].playerTagsMissing[tag];
                        if (variant[1].playerTagsMissingMult)
                            for (let tag in variant[1].playerTagsMissingMult)
                                if ((!agnostic || KDNoOverrideTags.includes(tag)) && !KinkyDungeonPlayerTags.get(tag))
                                    w *= variant[1].playerTagsMissingMult[tag];
                        if (r.w > 0 && (r.w > filterEps)) {
                            addedVar = true;
                            RestraintsList.push({
                                restraint: restraint,
                                variant: KDApplyVariants[variant[0]],
                                weight: w,
                            });
                            if (options?.QuitOnFirst)
                                return RestraintsList;
                        }
                    }
                }
            }
            if (add && (!addedVar || options?.dontPreferVariant)) {
                RestraintsList.push({
                    restraint: restraint,
                    weight: r.w,
                    inventoryVariant: (r.name && KinkyDungeonRestraintVariants[r.name]) ? r.name : undefined,
                });
                if (options?.QuitOnFirst)
                    return RestraintsList;
            }
        }
    }
    let RestraintsList2 = [];
    if (!options?.allowLowPower) {
        let groupPower = {};
        for (let r of RestraintsList) {
            if (!groupPower[r.restraint.Group] || r.restraint.power >= groupPower[r.restraint.Group][0].restraint.power) {
                if (!groupPower[r.restraint.Group])
                    groupPower[r.restraint.Group] = [r];
                else {
                    if (r.restraint.power > groupPower[r.restraint.Group][0].restraint.power)
                        groupPower[r.restraint.Group] = [r];
                    else
                        groupPower[r.restraint.Group].push(r);
                }
            }
        }
        for (let value of Object.values(groupPower)) {
            RestraintsList2.push(...value);
        }
    }
    if (minWeightFallback && RestraintsList.length == 0) {
        return KDGetRestraintsEligible(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, (filterEps || 0.05) > 0.1 ? filterEps * 0.1 : 0, filterEps > 0.1, useAugmented, augmentedInventory, options);
    }
    if (!options?.allowLowPower) {
        return RestraintsList2;
    }
    else
        return RestraintsList;
}
function KinkyDungeonGetRestraint(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, useAugmented, augmentedInventory, options) {
    let restraintWeightTotal = 0;
    let restraintWeights = [];
    let Restraints = KDGetRestraintsEligible(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, undefined, undefined, useAugmented, augmentedInventory, options);
    for (let rest of Restraints) {
        let restraint = rest.restraint;
        let weight = rest.weight;
        restraintWeights.push({ restraint: restraint, weight: restraintWeightTotal, inventoryVariant: rest.inventoryVariant });
        weight += rest.weight;
        restraintWeightTotal += Math.max(0, weight);
    }
    let selection = KDRandom() * restraintWeightTotal;
    for (let L = restraintWeights.length - 1; L >= 0; L--) {
        if (selection > restraintWeights[L].weight) {
            return restraintWeights[L].restraint;
        }
    }
}
function KDGetRestraintWithVariants(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, useAugmented, augmentedInventory, options) {
    let restraintWeightTotal = 0;
    let restraintWeights = [];
    if (!options)
        options = { ApplyVariants: true, };
    else
        options.ApplyVariants = true;
    let Restraints = KDGetRestraintsEligible(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter, securityEnemy, curse, undefined, undefined, useAugmented, augmentedInventory, options);
    for (let rest of Restraints) {
        let restraint = rest.restraint;
        let weight = rest.weight;
        restraintWeights.push({ restraint: restraint, variant: rest.variant, weight: restraintWeightTotal, inventoryVariant: rest.inventoryVariant });
        weight += rest.weight;
        restraintWeightTotal += Math.max(0, weight);
    }
    let selection = KDRandom() * restraintWeightTotal;
    for (let L = restraintWeights.length - 1; L >= 0; L--) {
        if (selection > restraintWeights[L].weight) {
            return { r: restraintWeights[L].restraint, v: restraintWeights[L].variant, iv: restraintWeights[L].inventoryVariant };
        }
    }
}
function KinkyDungeonUpdateRestraints(C, id, _delta, customRestraints, extraTags) {
    if (!C && !id)
        C = KinkyDungeonPlayer;
    if (C == KinkyDungeonPlayer && !customRestraints) {
        let playerTags = new Map();
        for (let inv of KinkyDungeonAllRestraintDynamic()) {
            if (inv.item.inventoryVariant) {
                if (!KDGameData.IdentifiedObj)
                    KDGameData.IdentifiedObj = {};
                KDGameData.IdentifiedObj[inv.item.inventoryVariant] = 2;
            }
            let group = KDRestraint(inv.item).Group;
            if (group) {
                if (KDGroupBlocked(group))
                    playerTags.set(group + "Blocked", true);
                playerTags.set(group + "Full", true);
                playerTags.set(inv.item.name + "Worn", true);
                if (inv.item.inventoryVariant)
                    playerTags.set(inv.item.inventoryVariant + "Worn", true);
            }
        }
        for (let sg of KinkyDungeonStruggleGroupsBase) {
            let group = sg;
            if (!KinkyDungeonGetRestraintItem(group))
                playerTags.set(group + "Empty", true);
        }
        let outfit = KDOutfit({ name: KinkyDungeonCurrentDress });
        for (let inv2 of KinkyDungeonAllRestraintDynamic()) {
            let inv = inv2.item;
            playerTags.set("Item_" + inv.name, true);
            if ((!inv.faction || KDToggles.ForcePalette || outfit?.palette || (KinkyDungeonPlayer.metadata?.palette || KinkyDungeonPlayer.Palette))
                && (KDToggles.ApplyPaletteRestraint && (outfit?.palette || (KinkyDungeonPlayer.metadata?.palette || KinkyDungeonPlayer.Palette) || !KDDefaultPalette
                    || GetPalette(C, KDDefaultPalette)))) {
                inv.faction = (KDToggles.NoOutfitPalette ? undefined : outfit?.palette)
                    || (KDToggles.NoOutfitPalette ? undefined : (KinkyDungeonPlayer.metadata?.palette || KinkyDungeonPlayer.Palette))
                    || KDDefaultPalette;
            }
            if (KDRestraint(inv).Link)
                playerTags.set("LinkTo_" + KDRestraint(inv).Link, true);
            if (KDRestraint(inv).UnLink)
                playerTags.set("UnLinkTo_" + KDRestraint(inv).UnLink, true);
            if (KDRestraint(inv).addTag)
                for (let tag of KDRestraint(inv).addTag) {
                    if (!playerTags.get(tag))
                        playerTags.set(tag, true);
                }
            if (KDRestraint(inv).chastity)
                playerTags.set("ChastityLower", true);
            if (KDRestraint(inv).chastitybra)
                playerTags.set("ChastityUpper", true);
            if (KDRestraint(inv).hobble)
                playerTags.set("Hobble", true);
            if (KDRestraint(inv).blockfeet)
                playerTags.set("BoundFeet", true);
            if (KDRestraint(inv).bindarms)
                playerTags.set("BoundArms", true);
            if (KDRestraint(inv).gag)
                playerTags.set("Gagged", true);
            if (KDRestraint(inv).bindhands)
                playerTags.set("BoundHands", true);
            if (KDRestraint(inv).blindfold)
                playerTags.set("Blindfolded", true);
            if (KDRestraint(inv).shrine) {
                for (let tag of KDRestraint(inv).shrine) {
                    if (!playerTags.get(tag))
                        playerTags.set(tag, true);
                }
            }
        }
        for (let t of KDHeavyRestraintPrefs) {
            if (KinkyDungeonStatsChoice.get(t))
                playerTags.set(t, true);
        }
        for (let t of KDNoOverrideTags) {
            if (KinkyDungeonStatsChoice.get(t))
                playerTags.set(t, true);
        }
        if (KinkyDungeonStatsChoice.get("Deprived"))
            playerTags.set("NoVibes", true);
        if (KinkyDungeonStatsChoice.get("Unmasked"))
            playerTags.set("Unmasked", true);
        if (KinkyDungeonStatsChoice.get("NoSenseDep"))
            playerTags.set("NoSenseDep", true);
        if (KinkyDungeonStatsChoice.get("NoHood"))
            playerTags.set("NoHood", true);
        if (KinkyDungeonStatsChoice.get("FreeBoob2"))
            playerTags.set("FreeBoob", true);
        if (KinkyDungeonStatsChoice.get("FreeBoob1") && !KinkyDungeonPlayerTags.get("ItemNipples"))
            playerTags.set("FreeBoob", true);
        if (KinkyDungeonStatsChoice.get("NoBelt2"))
            playerTags.set("NoBelt", true);
        if (KinkyDungeonStatsChoice.get("NoBelt1")
            && !KinkyDungeonPlayerTags.get("ItemVulva")
            && !KinkyDungeonPlayerTags.get("ItemVulvaPiercings")
            && !KinkyDungeonPlayerTags.get("ItemButt"))
            playerTags.set("NoBelt", true);
        if (KinkyDungeonStatsChoice.get("NoBelt2"))
            playerTags.set("NoBelt", true);
        if (KinkyDungeonStatsChoice.get("NoBelt1") && !KinkyDungeonPlayerTags.get("ItemNipples"))
            playerTags.set("NoBelt", true);
        if (KinkyDungeonStatsChoice.get("NoKigu"))
            playerTags.set("NoKigu", true);
        if (KinkyDungeonStatsChoice.get("NoBlindfolds"))
            playerTags.set("NoBlindfolds", true);
        if (KinkyDungeonStatsChoice.get("NoPet"))
            playerTags.set("NoPet", true);
        if (KinkyDungeonStatsChoice.get("Unchained"))
            playerTags.set("Unchained", true);
        if (KinkyDungeonStatsChoice.get("ClearVision"))
            playerTags.set("ClearVision", true);
        if (KinkyDungeonStatsChoice.get("EasierBlindfolds"))
            playerTags.set("EasierBlindfolds", true);
        if (KinkyDungeonStatsChoice.get("StrugglePerLevel"))
            playerTags.set("StrugglePerLevel", true);
        if (KinkyDungeonStatsChoice.get("StrugglePerLevelNeg"))
            playerTags.set("StrugglePerLevelNed", true);
        if (KinkyDungeonStatsChoice.get("Damsel"))
            playerTags.set("Damsel", true);
        if (KinkyDungeonStatsChoice.get("arousalMode"))
            playerTags.set("arousalMode", true);
        if (KinkyDungeonStatsChoice.get("arousalModePlug"))
            playerTags.set("arousalModePlug", true);
        if (KinkyDungeonStatsChoice.get("arousalModePlugNoFront"))
            playerTags.set("arousalModePlugNoFront", true);
        if (KinkyDungeonStatsChoice.get("arousalModePiercing"))
            playerTags.set("arousalModePiercing", true);
        let tags = extraTags || [];
        KinkyDungeonAddTags(tags, MiniGameKinkyDungeonLevel);
        for (let t of tags) {
            playerTags.set(t, true);
        }
        KinkyDungeonSendEvent("updatePlayerTags", { tags: playerTags, player: KinkyDungeonPlayerEntity });
        return playerTags;
    }
    else if (customRestraints) {
        let playerTags = new Map();
        for (let inv of customRestraints) {
            let group = KDRestraint(inv)?.Group;
            if (inv.inventoryVariant) {
                if (!KDGameData.IdentifiedObj)
                    KDGameData.IdentifiedObj = {};
                KDGameData.IdentifiedObj[inv.inventoryVariant] = KDGameData.IdentifiedObj[inv.inventoryVariant] || 1;
            }
            if (group) {
                if (KDGroupBlocked(group))
                    playerTags.set(group + "Blocked", true);
                playerTags.set(group + "Full", true);
                playerTags.set(inv.name + "Worn", true);
                if (inv.inventoryVariant)
                    playerTags.set(inv.inventoryVariant + "Worn", true);
            }
        }
        for (let sg of KinkyDungeonStruggleGroupsBase) {
            let group = sg;
            if (!customRestraints.some((rest) => {
                return KDRestraint(rest)?.Group == group;
            }))
                playerTags.set(group + "Empty", true);
        }
        for (let inv of customRestraints) {
            if (!KDRestraint(inv))
                continue;
            playerTags.set("Item_" + inv.name, true);
            if (KDRestraint(inv).Link)
                playerTags.set("LinkTo_" + KDRestraint(inv).Link, true);
            if (KDRestraint(inv).UnLink)
                playerTags.set("UnLinkTo_" + KDRestraint(inv).UnLink, true);
            if (KDRestraint(inv).addTag)
                for (let tag of KDRestraint(inv).addTag) {
                    if (!playerTags.get(tag))
                        playerTags.set(tag, true);
                }
            if (KDRestraint(inv).chastity)
                playerTags.set("ChastityLower", true);
            if (KDRestraint(inv).chastitybra)
                playerTags.set("ChastityUpper", true);
            if (KDRestraint(inv).hobble)
                playerTags.set("Hobble", true);
            if (KDRestraint(inv).blockfeet)
                playerTags.set("BoundFeet", true);
            if (KDRestraint(inv).bindarms)
                playerTags.set("BoundArms", true);
            if (KDRestraint(inv).gag)
                playerTags.set("Gagged", true);
            if (KDRestraint(inv).bindhands)
                playerTags.set("BoundHands", true);
            if (KDRestraint(inv).blindfold)
                playerTags.set("Blindfolded", true);
            if (KDRestraint(inv).shrine) {
                for (let tag of KDRestraint(inv).shrine) {
                    if (!playerTags.get(tag))
                        playerTags.set(tag, true);
                }
            }
        }
        if (extraTags)
            for (let t of extraTags) {
                playerTags.set(t, true);
            }
        KinkyDungeonSendEvent("updateCustomTags", { tags: playerTags, npc: id });
        return playerTags;
    }
    else if (KDGameData.NPCRestraints && KDGameData.NPCRestraints[id + ""]) {
        return KDGetNPCRestraintTags(KDGameData.NPCRestraints[id + ""], extraTags, id);
    }
    return new Map();
}
function KDUpdateRestraintMetadata(id, delta, customRestraints) {
    let metadata = undefined;
    if (id == -1 && !customRestraints) {
        metadata = {
            blockedtags: {},
        };
        for (let inv of KDAllRestraintDynamicList()) {
            if (KDRestraint(inv)?.blockRestraintsWithTag) {
                for (let blockedtag of KDRestraint(inv).blockRestraintsWithTag) {
                    metadata.blockedtags[blockedtag] = Math.max(metadata.blockedtags[blockedtag] || 0, KDRestraintPower(KDRestraint(inv), inv.inventoryVariant, inv.lock, inv.curse));
                }
            }
        }
        KinkyDungeonSendEvent("updatePlayerRestraintMetadata", { metadata: metadata, player: KinkyDungeonPlayerEntity, delta: delta, customRestraints: customRestraints });
        return metadata;
    }
    else if (customRestraints) {
        metadata = {
            blockedtags: {},
        };
        for (let inv of customRestraints) {
            if (KDRestraint(inv)?.blockRestraintsWithTag) {
                for (let blockedtag of KDRestraint(inv).blockRestraintsWithTag) {
                    metadata.blockedtags[blockedtag] = Math.max(metadata.blockedtags[blockedtag] || 0, KDRestraintPower(KDRestraint(inv), inv.variant || inv.inventoryVariant, inv.lock, inv.curse));
                }
            }
        }
        KinkyDungeonSendEvent("updateCustomRestraintsMetadata", { metadata: metadata, player: KDGetGlobalEntity(id), delta: delta, customRestraints: customRestraints });
        return metadata;
    }
    else if (KDGameData.NPCRestraints && KDGameData.NPCRestraints[id + ""]) {
        metadata = {
            blockedtags: {},
        };
        let already = {};
        for (let entry of Object.entries(KDGameData.NPCRestraints[id + ""])) {
            let inv = entry[1];
            if (!already[entry[0]]) {
                already[entry[0]] = true;
                if (KDRestraint(inv)?.blockRestraintsWithTag) {
                    for (let blockedtag of KDRestraint(inv).blockRestraintsWithTag) {
                        metadata.blockedtags[blockedtag] = Math.max(metadata.blockedtags[blockedtag] || 0, KDRestraintPower(KDRestraint(inv), inv.variant || inv.inventoryVariant, inv.lock, inv.curse));
                    }
                }
            }
        }
        KinkyDungeonSendEvent("updateNPCRestraintsMetadata", { metadata: metadata, player: KDGetGlobalEntity(id), delta: delta, customRestraints: customRestraints });
        return metadata;
    }
    return metadata;
}
function KDGetNPCRestraintTags(restraintList, extraTags, id = -1, addTags = true, events = true) {
    let playerTags = new Map();
    if (restraintList)
        for (let inv of Object.values(restraintList)) {
            let group = KDRestraint(inv)?.Group;
            if (group) {
                if (KDGroupBlocked(group))
                    playerTags.set(group + "Blocked", true);
                playerTags.set(group + "Full", true);
                playerTags.set(inv.name + "Worn", true);
                if (inv.inventoryVariant)
                    playerTags.set(inv.inventoryVariant + "Worn", true);
            }
        }
    for (let sg of KinkyDungeonStruggleGroupsBase) {
        let group = sg;
        if (!restraintList || !Object.values(restraintList).some((rest) => {
            return KDRestraint(rest)?.Group == group;
        }))
            playerTags.set(group + "Empty", true);
    }
    if (restraintList)
        for (let inv of Object.values(restraintList)) {
            if (!KDRestraint(inv))
                continue;
            playerTags.set("Item_" + inv.name, true);
            if (KDRestraint(inv).Link)
                playerTags.set("LinkTo_" + KDRestraint(inv).Link, true);
            if (KDRestraint(inv).UnLink)
                playerTags.set("UnLinkTo_" + KDRestraint(inv).UnLink, true);
            if (KDRestraint(inv).addTag)
                for (let tag of KDRestraint(inv).addTag) {
                    if (!playerTags.get(tag))
                        playerTags.set(tag, true);
                }
            if (KDRestraint(inv).chastity)
                playerTags.set("ChastityLower", true);
            if (KDRestraint(inv).chastitybra)
                playerTags.set("ChastityUpper", true);
            if (KDRestraint(inv).hobble)
                playerTags.set("Hobble", true);
            if (KDRestraint(inv).blockfeet)
                playerTags.set("BoundFeet", true);
            if (KDRestraint(inv).bindarms)
                playerTags.set("BoundArms", true);
            if (KDRestraint(inv).bindhands)
                playerTags.set("BoundHands", true);
            if (KDRestraint(inv).blindfold)
                playerTags.set("Blindfolded", true);
            if (KDRestraint(inv).shrine) {
                for (let tag of KDRestraint(inv).shrine) {
                    if (!playerTags.get(tag))
                        playerTags.set(tag, true);
                }
            }
        }
    let tags = extraTags || [];
    if (addTags)
        KinkyDungeonAddTags(tags, MiniGameKinkyDungeonLevel);
    for (let t of tags) {
        playerTags.set(t, true);
    }
    if (events)
        KinkyDungeonSendEvent("updateNPCTags", { tags: playerTags, npc: id });
    return playerTags;
}
function KDGetCursePower(item) {
    if (!item || !KDGetCurse(item))
        return 0;
    return KDCursePower(KDGetCurse(item));
}
function KDGetVariantPower(item) {
    if (item && KinkyDungeonRestraintVariants[item.inventoryVariant || item.name]) {
        return KinkyDungeonRestraintVariants[item.inventoryVariant || item.name].power || 0;
    }
    return 0;
}
function KDVariantPower(variant) {
    if (variant && KinkyDungeonRestraintVariants[variant]) {
        return KinkyDungeonRestraintVariants[variant].power || 0;
    }
    return 0;
}
function KinkyDungeonRestraintPower(item, NoLink, toLink, newLock, newCurse) {
    if (item && item.type == Restraint) {
        let lockMult = item ? KinkyDungeonGetLockMult(item.lock, item) : 1;
        let power = KDRestraint(item).power * lockMult + KDGetCursePower(item) + KDGetVariantPower(item);
        if (item.dynamicLink && !NoLink) {
            let link = item.dynamicLink;
            if (!toLink || !(KinkyDungeonIsLinkable({
                oldRestraint: KinkyDungeonGetRestraintByName(link.name),
                newRestraint: toLink,
                item: link,
                props: {
                    newLock: newLock,
                    newCurse: newCurse,
                },
            }) && KDCheckLinkSize(link, toLink, true, false, undefined, undefined, {
                newLock: newLock,
                newCurse: newCurse,
            }))) {
                let lock = link.lock;
                let mult = KinkyDungeonGetLockMult(lock, link);
                let pp = link ? (KDRest(link.name).power) : 0;
                power = Math.max(power, pp * mult + KDGetCursePower(link));
            }
        }
        return power;
    }
    return 0;
}
function KDRestraintPower(r, variant, newLock, newCurse) {
    if (r) {
        let lockMult = r ? KinkyDungeonGetLockMult(newLock || r.DefaultLock) : 1;
        let power = r.power * lockMult + KDCursePower(newCurse || r.curse);
        +KDVariantPower(variant);
        return power;
    }
    return 0;
}
function KinkyDungeonLinkableAndStricter(oldRestraint, newRestraint, item, Lock, Curse, ignoreItem, power) {
    if (oldRestraint && newRestraint) {
        if (!KDIsEligible(newRestraint))
            return false;
        return KinkyDungeonIsLinkable({ oldRestraint: oldRestraint, newRestraint: newRestraint, power: power, item: item, ignoreItem: ignoreItem, props: { newLock: Lock, newCurse: Curse } });
    }
    return false;
}
function KDIsEligibleNPC(r, id, tags, allowOverride = false) {
    if (r.requireAllTagsToEquip) {
        for (let tag of r.requireAllTagsToEquip) {
            if (!tags.get(tag)) {
                return "MissingTag1";
            }
        }
    }
    if (r.requireSingleTagToEquip) {
        for (let tag of r.requireSingleTagToEquip) {
            if (tags.get(tag)) {
                return "";
            }
        }
        return "MissingTag2";
    }
    if (!allowOverride) {
        if (r.requireNoTagToEquip) {
            for (let tag of r.requireNoTagToEquip) {
                if (tags.get(tag)) {
                    return "NoTag";
                }
            }
            return "";
        }
    }
    else {
        let rPower = r.allowOverrideBasedOnTagFilters ? KDRestraintPower(r) : -100;
        let dontCheck = (!r.allowOverrideBasedOnTagFilters || rPower <= 0) && (r.requireNoTagToEquip);
        let itemlist = !dontCheck ? Object.values(KDGetNPCRestraints(id) || []) : null;
        if (dontCheck || itemlist?.every((item) => {
            return (!r.allowOverrideBasedOnTagFilters.some((tag) => {
                return !KDRestraint(item)[tag] && !KDRestraint(item).shrine?.includes(tag);
            }))
                || (rPower < KDGetNPCRestraintPower(item));
        })) {
            if (r.requireNoTagToEquip) {
                for (let tag of r.requireNoTagToEquip) {
                    if (tags.get(tag)) {
                        return "NoTag";
                    }
                }
                return "";
            }
        }
    }
    return "";
}
function KDIsEligible(restraint, player, allowOverride = false) {
    if (restraint.requireSingleTagToEquip && !restraint.requireSingleTagToEquip.some((tag) => { return KinkyDungeonPlayerTags.get(tag); }))
        return false;
    if (restraint.requireAllTagsToEquip && restraint.requireAllTagsToEquip.some((tag) => { return !KinkyDungeonPlayerTags.get(tag); }))
        return false;
    if (!allowOverride) {
        if (restraint.requireNoTagToEquip && restraint.requireNoTagToEquip.some((tag) => { return KinkyDungeonPlayerTags.get(tag); }))
            return false;
    }
    else {
        let rPower = restraint.allowOverrideBasedOnTagFilters ? KDRestraintPower(restraint) : -100;
        let dontCheck = !restraint.allowOverrideBasedOnTagFilters || rPower <= 0;
        let itemlist = !dontCheck ? KDAllRestraintDynamicList() : null;
        if (dontCheck || itemlist?.every((item) => {
            return (!restraint.allowOverrideBasedOnTagFilters.some((tag) => {
                return !KDRestraint(item)[tag] && !KDRestraint(item).shrine?.includes(tag);
            }))
                || (rPower < KinkyDungeonRestraintPower(item));
        })) {
            if (restraint.requireNoTagToEquip && restraint.requireNoTagToEquip.some((tag) => { return KinkyDungeonPlayerTags.get(tag); }))
                return false;
        }
    }
    return true;
}
function KinkyDungeonGenerateRestraintTrap() {
    let enemy = KinkyDungeonGetEnemy(["chestTrap"], KDGetEffLevel(), KDCurrIndex(), '0', ["chestTrap"]);
    if (enemy)
        return enemy.name;
    return "GreedyGhast";
}
function KDGetLockVisual(item) {
    return KDGetLockImage(item.lock);
}
function KDGetLockImage(lock) {
    return `Locks/${lock}.png`;
}
function KDGetLockImageRoot(lock) {
    return KinkyDungeonRootDirectory + `Locks/${lock}.png`;
}
function KDCanAddRestraint(restraint, Bypass, Lock, NoStack, r, Deep, noOverpower, securityEnemy, useAugmentedPower, curse, augmentedInventory, powerBonus = 0, options) {
    if (!restraint) {
        console.log("Warning: Requested restraint was empty!");
        return false;
    }
    if (!KinkyDungeonIsLockable(restraint))
        Lock = "";
    if (!curse && restraint.curse)
        curse = restraint.curse;
    if (restraint.bypass)
        Bypass = true;
    if (restraint.shrine && restraint.shrine.includes("Vibes") && KinkyDungeonPlayerTags.get("NoVibes"))
        return false;
    if (restraint.arousalMode && !KinkyDungeonStatsChoice.get("arousalMode"))
        return false;
    if (restraint.Group == "ItemButt" && !KinkyDungeonStatsChoice.get("arousalModePlug"))
        return false;
    if (restraint.Group == "ItemVulva" && restraint.shrine.includes("Plugs") && KinkyDungeonStatsChoice.get("arousalModePlugNoFront"))
        return false;
    if (restraint.Group == "ItemDevices" && options?.noOverpowerMetaTags)
        noOverpower = true;
    if (!KDIsEligible(restraint, KDPlayer(), !noOverpower))
        return false;
    let rPower = undefined;
    let blockers = KDGetBlockersToAddRestraint(restraint, KDPlayer(), Bypass);
    if (blockers.length > 0) {
        if (rPower == undefined)
            rPower = KDRestraintPower(restraint, undefined, Lock, curse) + powerBonus;
        if (blockers.some((blocker) => {
            return rPower < KinkyDungeonRestraintPower(blocker);
        })) {
            return false;
        }
    }
    let metadata = KDEntityRestraintMetadata.get(KDPlayer().id);
    if (metadata) {
        if (metadata.blockedtags) {
            for (let blockedtag of Object.entries(metadata.blockedtags)) {
                if (rPower == undefined)
                    rPower = KDRestraintPower(restraint, undefined, Lock, curse) + powerBonus;
                if (KDValidateTagForRestraint(blockedtag[0], restraint)
                    && (noOverpower || rPower < blockedtag[1] || options?.noOverpowerMetaTags)) {
                    return false;
                }
            }
        }
    }
    if (restraint.shrine.includes("Raw"))
        return false;
    function bypasses() {
        return ((!((KinkyDungeonPlayerTags.get("SupremeBra")
            && (restraint.Group == "ItemNipples" || restraint.Group == "ItemNipplesPiercings"))
            || (KinkyDungeonPlayerTags.get("SupremeBelt")
                && (restraint.Group == "ItemVulva" || restraint.Group == "ItemVulvaPiercings" || restraint.Group == "ItemButt")))
            && (Bypass || restraint.bypass || !KDGroupBlocked(restraint.Group, true)))
            || KDEnemyPassesSecurity(restraint.Group, securityEnemy));
    }
    if (!r)
        r = KinkyDungeonGetRestraintItem(restraint.Group);
    let power = (KinkyDungeonRestraintPower(r, true, restraint, Lock, curse) * (r && useAugmentedPower ? Math.max(0.9, KDRestraintPowerMult(KinkyDungeonPlayerEntity, KDRestraint(r), augmentedInventory)) : 1));
    let linkUnder = KDGetLinkUnder(r, restraint, Bypass, NoStack, Deep, securityEnemy, Lock, curse, powerBonus, !noOverpower);
    let linkableCurrent = r && KDRestraint(r) && KinkyDungeonLinkableAndStricter(KDRestraint(r), restraint, r);
    if (linkUnder && bypasses())
        return true;
    let link = r?.dynamicLink;
    while (link && !linkableCurrent) {
        let linkableUnder = KinkyDungeonLinkableAndStricter(KDRestraint(link), restraint, link, Lock, curse);
        if (!linkableUnder) {
            power = Math.max(power, KinkyDungeonRestraintPower(link, true, restraint, Lock, curse)
                * (useAugmentedPower ? Math.max(0.9, KDRestraintPowerMult(KinkyDungeonPlayerEntity, KDRestraint(link), augmentedInventory)) : 1));
            link = link.dynamicLink;
        }
        else {
            link = null;
        }
    }
    let newLock = (Lock && KinkyDungeonIsLockable(restraint)) ? Lock : restraint.DefaultLock;
    let allowOverpower = r && !linkableCurrent && !noOverpower && !KDRestraint(r).enchanted;
    if (!r
        || linkableCurrent
        || allowOverpower) {
        let augMult = allowOverpower ?
            (useAugmentedPower ?
                KDRestraintPowerMult(KinkyDungeonPlayerEntity, restraint, augmentedInventory)
                : 1)
            : 1;
        let compPower = allowOverpower ? (-0.01
            + (curse ? (KDCursePower(curse)) : 0)
            + (restraint.power + powerBonus)
                * augMult
                * KinkyDungeonGetLockMult(newLock, undefined, curse, restraint)) : 0;
        if (!allowOverpower || (Math.max(0.99, power * 1.1) < compPower)) {
            if (bypasses())
                return true;
        }
    }
    return false;
}
function KDGetLinkUnder(currentRestraint, restraint, bypass, NoStack, Deep, securityEnemy, Lock, Curse, powerBonus, allowOverride) {
    let link = currentRestraint;
    if (restraint.bypass)
        bypass = true;
    while (link) {
        if (KDCanLinkUnder(link, restraint, bypass, NoStack, securityEnemy, Lock, Curse, undefined, powerBonus, allowOverride)) {
            return link;
        }
        if (Deep)
            link = link.dynamicLink;
        else
            link = null;
    }
    return null;
}
function KDCanLinkUnder(currentRestraint, restraint, bypass, NoStack, securityEnemy, Lock, Curse, ignoreItem, powerBonus, allowOverride) {
    if (restraint.bypass)
        bypass = true;
    let linkUnder = currentRestraint
        && (bypass || (KDRestraint(currentRestraint).accessible) || (KDRestraint(currentRestraint).deepAccessible) || KDEnemyPassesSecurity(KDRestraint(currentRestraint).Group, securityEnemy))
        && KinkyDungeonIsLinkable({
            oldRestraint: restraint,
            newRestraint: KDRestraint(currentRestraint),
            item: ignoreItem || { name: restraint.name, id: -1 },
            ignoreItem: currentRestraint,
            linkUnderItem: currentRestraint,
        });
    let power = (allowOverride && !NoStack) ? (-0.01
        + (Curse ? (KDCursePower(Curse)) : 0)
        + (restraint.power + powerBonus)
            * KinkyDungeonGetLockMult(Lock, undefined, Curse, restraint)) : 0;
    let linkUnderOver = (!currentRestraint.dynamicLink || KinkyDungeonIsLinkable({
        oldRestraint: KDRestraint(currentRestraint.dynamicLink),
        newRestraint: restraint,
        item: currentRestraint.dynamicLink,
        ignoreItem: ignoreItem || { name: restraint.name, id: -1 },
        power: power,
        props: {
            newLock: Lock,
            newCurse: Curse,
        }
    }));
    if (!linkUnder || !linkUnderOver)
        return false;
    if (KDCheckLinkSize(currentRestraint, restraint, bypass, NoStack, securityEnemy, ignoreItem, {
        newLock: Lock,
        newCurse: Curse,
    }, power)) {
        return true;
    }
}
function KDCurrentItemLinkable(currentItem, newItem) {
    return (KinkyDungeonLinkableAndStricter(KDRestraint(currentItem), newItem, currentItem) &&
        ((newItem.linkCategory && !newItem.linkCategories && KDLinkCategorySize(currentItem, newItem.linkCategory) + KDLinkSize(newItem) <= 1.0)
            || (newItem.linkCategories && newItem.linkCategories.every((lc, index) => { return KDLinkCategorySize(currentItem, lc) + KDLinkSize(newItem, index) <= 1.0; }))
            || (!newItem.linkCategory && !newItem.linkCategories && !KDDynamicLinkList(currentItem, true).some((inv) => { return newItem.name == inv.name; }))));
}
function KDCheckLinkSize(currentRestraint, restraint, bypass, NoStack, _securityEnemy, ignoreItem, props, power) {
    if (restraint.bypass)
        bypass = true;
    let linkCategories = restraint.linkCategories || (restraint.linkCategory ? [restraint.linkCategory] : []);
    return (linkCategories.length == 0 || linkCategories.every((lc, index) => {
        return KDLinkCategorySize(KinkyDungeonGetRestraintItem(KDRestraint(currentRestraint).Group), lc, ignoreItem, power) + KDLinkSize(restraint, index) <= (NoStack ? 0.01 : 1.0);
    }))
        && ((linkCategories.length > 0 && !restraint.noDupe)
            || !KDDynamicLinkList(KinkyDungeonGetRestraintItem(KDRestraint(currentRestraint).Group), true).some((item) => {
                if (restraint.name == KDRestraint(item).name && (!ignoreItem || ignoreItem?.id != item.id)) {
                    if (!props)
                        return true;
                    if ((!KDGetCurse(item) && props.newCurse)
                        || (!props.newCurse && props.newLock && !KDGetCurse(item) && !item.lock)
                        || (props.newCurse && KDCurses[props.newCurse].level > KDCurses[KDGetCurse(item)]?.level + 0.01)
                        || (props.newLock && KDLocks[props.newLock].lockmult > (KDLocks[item.lock]?.lockmult) + 0.01))
                        return false;
                    return true;
                }
                return false;
            }));
}
function KDApplyVarToInvVar(restraint, variant) {
    let events = [];
    let restvar = {
        template: restraint.name,
        events: events,
        curse: variant.curse,
        noKeep: variant.noKeep,
    };
    for (let e of variant.hexes) {
        events.push(...JSON.parse(JSON.stringify(KDEventHexModular[e].events({ variant: restvar }))));
    }
    for (let e of variant.enchants) {
        events.push(...JSON.parse(JSON.stringify(KDEventEnchantmentModular[e].types[KDModifierEnum.restraint].events(restraint.name, undefined, undefined, variant.enchants[0], variant.enchants.slice(1)))));
    }
    return restvar;
}
function KDLinkUnder(restraint, Tightness, Bypass, Lock, Keep, _Trapped, events, faction, Deep, Curse, securityEnemy, _reserved, inventoryAs, data, powerBonus = 0, noOverpower = false) {
    KDRestraintDebugLog.push("LKUndering " + restraint.name);
    let r = KinkyDungeonGetRestraintItem(restraint.Group);
    if (r) {
        let compPower = (-0.01
            + (Curse ? (KDCursePower(Curse)) : 0)
            + (restraint.power + powerBonus)
                * KinkyDungeonGetLockMult(Lock, undefined, Curse, restraint));
        if (!KDCheckLinkSize(r, restraint, true, false, undefined, undefined, undefined)) {
            let dynamicList = [];
            let iii = 0;
            do {
                iii++;
                if (!KDCheckLinkSize(r, restraint, true, false, undefined, undefined, undefined))
                    dynamicList = KDDynamicLinkList(r, true).filter((inv) => {
                        if ((KDRestraint(inv).linkCategories ? KDRestraint(inv).linkCategories : (KDRestraint(inv).linkCategory ? [KDRestraint(inv).linkCategory] : [])).some((category) => {
                            return (restraint.linkCategories || [restraint.linkCategory]).includes(category);
                        }))
                            return true;
                        return false;
                    });
                else
                    dynamicList = [];
                let cand = null;
                let candPower = -100;
                for (let inv of dynamicList) {
                    let pwr = KinkyDungeonRestraintPower(inv, true);
                    if (pwr > candPower) {
                        cand = inv;
                        candPower = pwr;
                    }
                }
                if (cand && compPower > candPower) {
                    KinkyDungeonRemoveRestraintSpecific(cand, Keep, false);
                    r = KinkyDungeonGetRestraintItem(restraint.Group);
                    if (!r)
                        dynamicList = [];
                }
            } while (dynamicList.length > 0 && iii < 100);
        }
    }
    let linkUnder = null;
    linkUnder = KDGetLinkUnder(r, restraint, Bypass, undefined, Deep, securityEnemy, Lock, Curse, powerBonus, !noOverpower);
    let linkableCurrent = r
        && KDRestraint(r)
        && KinkyDungeonLinkableAndStricter(KDRestraint(r), restraint, r);
    let ret = null;
    let alwaysLinkUnder = false;
    if (!linkableCurrent && linkUnder && (!linkableCurrent || !restraint.inaccessible || alwaysLinkUnder)) {
        KDRestraintDebugLog.push("Linking " + restraint.name + " under " + linkUnder.name);
        let safeLink = KDGetLinkUnder(r, restraint, Bypass, undefined, Deep, securityEnemy, undefined, undefined, undefined);
        linkUnder.dynamicLink = { name: restraint.name, id: KinkyDungeonGetItemID(), type: Restraint, events: events ? events : KDGetEventsForRestraint(inventoryAs || restraint.name),
            data: data,
            tightness: Tightness, curse: Curse,
            faction: faction != undefined ? faction : KDDefaultItemPalette(restraint.name, inventoryAs),
            dynamicLink: linkUnder.dynamicLink };
        ret = linkUnder.dynamicLink;
        KDUpdateItemEventCache = true;
        let lk = linkUnder.dynamicLink;
        if (!Curse && (Lock))
            KinkyDungeonLock(linkUnder.dynamicLink, Lock, undefined, undefined, undefined, undefined, undefined, KDRestraintParticleLifetime * KDRestraintParticleLifetimeMult);
        else if (restraint.DefaultLock)
            KinkyDungeonLock(linkUnder.dynamicLink, restraint.DefaultLock, undefined, undefined, undefined, undefined, undefined, KDRestraintParticleLifetime * KDRestraintParticleLifetimeMult);
        if (inventoryAs)
            linkUnder.dynamicLink.inventoryVariant = inventoryAs;
        if (!safeLink) {
            let link = KinkyDungeonGetRestraintItem(restraint.Group);
            if (lk.name == restraint.name && ((KDGetCurse(lk) || '') == (Curse || '') && ((lk.lock || '') == (Lock || '')))) {
                let end = false;
                while (link) {
                    if (lk.name == link.name && ((!KDGetCurse(link) && Curse)
                        || (!Curse && Lock && !KDGetCurse(link) && !link.lock)
                        || (Curse && KDCurses[Curse].level > KDCurses[KDGetCurse(link)]?.level + 0.01)
                        || (Lock && KDLocks[Lock].lockmult > (KDLocks[link.lock]?.lockmult) + 0.01))) {
                        KinkyDungeonRemoveRestraintSpecific(link, true, false, false, false, false, undefined, false);
                        r = KinkyDungeonGetRestraintItem(restraint.Group);
                        KDUpdateItemEventCache = true;
                        link = null;
                        end = true;
                    }
                    else {
                        link = link.dynamicLink;
                    }
                }
                if (!end) {
                }
            }
        }
        linkUnder = KinkyDungeonAllRestraint().find((inv) => { return inv.dynamicLink == lk; });
        if (Curse && KDCurses[Curse] && KDCurses[Curse].onApply) {
            KDCurses[Curse].onApply(lk, linkUnder);
            KinkyDungeonSendEvent("addCurse", {
                prevCurse: undefined,
                curse: Curse,
                item: lk,
            });
        }
        if (r)
            KDUpdateLinkCaches(r);
        KinkyDungeonSendEvent("postApply", { player: KinkyDungeonPlayerEntity, item: lk, host: linkUnder, keep: Keep, Link: true, UnLink: false, attacker: securityEnemy });
        let sfx = (restraint && KDGetRestraintSFX(restraint)) ? KDGetRestraintSFX(restraint) : "Struggle";
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
    }
    return ret;
}
function KinkyDungeonAddRestraintIfWeaker(restraint, Tightness, Bypass, Lock, Keep, Trapped, events, faction, Deep, Curse, securityEnemy, useAugmentedPower, inventoryAs, data, augmentedInventory, variant, powerBonus = 0, NoActionPrune = false, options) {
    let player = KDPlayer();
    if (typeof restraint === "string") {
        KDRestraintDebugLog.push("Lookup" + restraint);
        restraint = KinkyDungeonGetRestraintByName(restraint);
    }
    else {
        KDRestraintDebugLog.push("AddWeaker" + restraint.name);
    }
    if (!KinkyDungeonIsLockable(restraint))
        Lock = "";
    if (variant) {
        return KDEquipInventoryVariant(KDApplyVarToInvVar(restraint, variant), variant.prefix, Tightness, Bypass, Lock, Keep, Trapped, faction, Deep, Curse, securityEnemy, useAugmentedPower, inventoryAs, variant.nonstackable ? "" : variant.prefix, undefined, powerBonus + variant.powerBonus, NoActionPrune);
    }
    if (restraint.bypass)
        Bypass = true;
    if (KDCanAddRestraint(restraint, Bypass, Lock, false, undefined, Deep, options?.noOverpower, securityEnemy, useAugmentedPower, Curse, augmentedInventory)) {
        let r = KinkyDungeonGetRestraintItem(restraint.Group);
        let linkableCurrent = r
            && KDRestraint(r)
            && KinkyDungeonLinkableAndStricter(KDRestraint(r), restraint, r);
        let ret = 0;
        let preserve_tether = restraint.leash && KDIsPlayerTethered(KinkyDungeonPlayerEntity) && KinkyDungeonLeashingEnemy();
        let tether_len = preserve_tether ? KDGetTetherLength(KinkyDungeonPlayerEntity) : 0;
        if (!restraint.good && !restraint.armor) {
            KinkyDungeonSetFlag("restrained", 2);
            KinkyDungeonSetFlag("restrained_recently", 5);
        }
        if (restraint.Group == "ItemNeck"
            && !KinkyDungeonPlayerTags.get("Collars")
            && restraint.shrine.includes("Collars")
            && KinkyDungeonInDanger()) {
            KinkyDungeonSetFlag("collared", 5);
        }
        ret = KinkyDungeonAddRestraint(restraint, Tightness + Math.round(0.1 * KinkyDungeonDifficulty), Bypass, Lock, Keep, false, !linkableCurrent, events, faction, undefined, undefined, Curse, undefined, securityEnemy, inventoryAs, data, undefined, undefined, undefined, NoActionPrune);
        if (preserve_tether && !KDIsPlayerTethered(KinkyDungeonPlayerEntity))
            KinkyDungeonAttachTetherToEntity(tether_len, KinkyDungeonLeashingEnemy(), player);
        if (KinkyDungeonPlayerEntity && !KinkyDungeonCanTalk() && KDRandom() < KinkyDungeonGagMumbleChanceRestraint) {
            let msg = "KinkyDungeonGagRestraint";
            let gagMsg = Math.floor(KDRandom() * 3);
            if (restraint.power > 8 && KDRandom() < .8)
                gagMsg = 2;
            else if (restraint.power > 4 && KDRandom() < .5)
                gagMsg = 2;
            msg = msg + gagMsg;
            KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet(msg), KDBaseWhite, 5, 3);
            KDSendGagParticles(KDPlayer());
        }
        return ret;
    }
    return 0;
}
function KDAddRestraintItem(restraint, Tightness, Bypass, Lock, Keep, Trapped, events, faction, Deep, Curse, securityEnemy, useAugmentedPower, inventoryAs, data, augmentedInventory, variant, powerBonus = 0, NoActionPrune = false, options) {
    let player = KDPlayer();
    if (typeof restraint === "string") {
        KDRestraintDebugLog.push("Lookup" + restraint);
        restraint = KinkyDungeonGetRestraintByName(restraint);
    }
    else {
        KDRestraintDebugLog.push("AddWeaker" + restraint.name);
    }
    if (!KinkyDungeonIsLockable(restraint))
        Lock = "";
    if (variant) {
        return KDEquipRestraintVariant(KDApplyVarToInvVar(restraint, variant), variant.prefix, Tightness, Bypass, Lock, Keep, Trapped, faction, Deep, Curse, securityEnemy, useAugmentedPower, inventoryAs, variant.nonstackable ? "" : variant.prefix, undefined, powerBonus + variant.powerBonus, NoActionPrune);
    }
    if (restraint.bypass)
        Bypass = true;
    if (KDCanAddRestraint(restraint, Bypass, Lock, false, undefined, Deep, options?.noOverpower, securityEnemy, useAugmentedPower, Curse, augmentedInventory)) {
        let r = KinkyDungeonGetRestraintItem(restraint.Group);
        let linkableCurrent = r
            && KDRestraint(r)
            && KinkyDungeonLinkableAndStricter(KDRestraint(r), restraint, r);
        let ret = null;
        let preserve_tether = restraint.leash && KDIsPlayerTethered(KinkyDungeonPlayerEntity) && KinkyDungeonLeashingEnemy();
        let tether_len = preserve_tether ? KDGetTetherLength(KinkyDungeonPlayerEntity) : 0;
        if (!restraint.good && !restraint.armor) {
            KinkyDungeonSetFlag("restrained", 2);
            KinkyDungeonSetFlag("restrained_recently", 5);
        }
        if (restraint.Group == "ItemNeck"
            && !KinkyDungeonPlayerTags.get("Collars")
            && restraint.shrine.includes("Collars")
            && KinkyDungeonInDanger()) {
            KinkyDungeonSetFlag("collared", 5);
        }
        ret = KDAddRestraintForce(restraint, Tightness + Math.round(0.1 * KinkyDungeonDifficulty), Bypass, Lock, Keep, false, !linkableCurrent, events, faction, undefined, undefined, Curse, undefined, securityEnemy, inventoryAs, data, undefined, undefined, undefined, NoActionPrune);
        if (preserve_tether && !KDIsPlayerTethered(KinkyDungeonPlayerEntity))
            KinkyDungeonAttachTetherToEntity(tether_len, KinkyDungeonLeashingEnemy(), player);
        if (KinkyDungeonPlayerEntity && !KinkyDungeonCanTalk() && KDRandom() < KinkyDungeonGagMumbleChanceRestraint) {
            let msg = "KinkyDungeonGagRestraint";
            let gagMsg = Math.floor(KDRandom() * 3);
            if (restraint.power > 8 && KDRandom() < .8)
                gagMsg = 2;
            else if (restraint.power > 4 && KDRandom() < .5)
                gagMsg = 2;
            msg = msg + gagMsg;
            KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet(msg), KDBaseWhite, 5, 3);
            KDSendGagParticles(KDPlayer());
        }
        return ret;
    }
    return null;
}
function KinkyDungeonIsLinkable(data) {
    if (data.newRestraint.NoLinkOver)
        return false;
    if (data.item && !KDCheckLinkSize(data.item, data.newRestraint, false, false, undefined, data.ignoreItem, data.props, data.power || 0))
        return false;
    if (data.oldRestraint && data.newRestraint && data.oldRestraint && data.oldRestraint.Link) {
        if (data.newRestraint.name == data.oldRestraint.Link)
            return true;
    }
    if (data.item && !KDCheckLinkTotal(data.item, data.newRestraint, data.linkUnderItem, data.props?.newLock, data.props?.newCurse, data.useAugmentedPower, data.augmentedInventory))
        return false;
    if (data.oldRestraint && data.newRestraint && data.oldRestraint && (data.newRestraint.AlwaysLinkable || data.oldRestraint.LinkableBy || data.oldRestraint.LinkAll) && data.newRestraint.shrine) {
        if (data.oldRestraint.LinkAll)
            return true;
        if (data.newRestraint.AlwaysLinkable)
            return true;
        for (let l of data.oldRestraint.LinkableBy) {
            for (let s of data.newRestraint.shrine) {
                if (l == s) {
                    return true;
                }
            }
        }
    }
    return false;
}
function KDCheckLinkTotal(oldRestraint, newRestraint, linkUnderHost, _lock = "", _curse = "", _useAugmentedPower = false, _augmentedInventory = undefined) {
    if (KDRestraint(oldRestraint).Link && KDRestraint(oldRestraint).Link == newRestraint.name) {
        return true;
    }
    if (newRestraint.UnLink && oldRestraint.name == newRestraint.UnLink) {
        return true;
    }
    let host = linkUnderHost || oldRestraint;
    let target = linkUnderHost ? KDRestraint(oldRestraint) : newRestraint;
    if (linkUnderHost) {
        let RestraintTree = [];
        let topLevel = KinkyDungeonGetRestraintItem(newRestraint.Group);
        if (topLevel) {
            let link = topLevel;
            RestraintTree.push(KDRestraint(link));
            while (link.dynamicLink && link != linkUnderHost) {
                link = link.dynamicLink;
                RestraintTree.push(KDRestraint(link));
            }
            if (!target.LinkAll) {
                for (let r of RestraintTree) {
                    if (!r.AlwaysLinkable) {
                        let pass = false;
                        if (target.LinkableBy && r.shrine) {
                            for (let l of target.LinkableBy) {
                                if (!pass)
                                    for (let s of r.shrine) {
                                        if (l == s) {
                                            pass = true;
                                        }
                                    }
                            }
                        }
                        if (!pass)
                            return false;
                    }
                }
            }
            if (link.linkCache) {
                for (let s of target.shrine) {
                    if (link.linkCache.includes(s))
                        return true;
                }
            }
            if (link)
                link = link.dynamicLink;
            while (link) {
                let pass = false;
                let r = KDRestraint(link);
                if (r.LinkAll) {
                    pass = true;
                }
                else if (target.AlwaysLinkable) {
                    pass = true;
                }
                else if (r.LinkableBy && target.shrine) {
                    for (let l of r.LinkableBy) {
                        if (!pass)
                            for (let s of target.shrine) {
                                if (l == s) {
                                    pass = true;
                                }
                            }
                    }
                }
                if (!pass)
                    return false;
                link = link.dynamicLink;
            }
        }
        else {
            return false;
        }
    }
    else {
        if (host.linkCache) {
            for (let s of target.shrine) {
                if (host.linkCache.includes(s))
                    return true;
            }
        }
        let link = oldRestraint;
        while (link) {
            let pass = false;
            let r = KDRestraint(link);
            if (link != linkUnderHost) {
                if (r.LinkAll) {
                    pass = true;
                }
                else if (newRestraint.AlwaysLinkable) {
                    pass = true;
                }
                else if (r.LinkableBy && newRestraint.shrine) {
                    for (let l of r.LinkableBy) {
                        if (!pass)
                            for (let s of newRestraint.shrine) {
                                if (l == s) {
                                    pass = true;
                                }
                            }
                    }
                }
                if (!pass)
                    return false;
            }
            link = link.dynamicLink;
        }
    }
    return true;
}
function KDUpdateLinkCaches(restraint) {
    let link = restraint;
    while (link) {
        link.linkCache = KDGetLinkCache(link);
        link = link.dynamicLink;
    }
}
function KDGetLinkCache(restraint) {
    let cache = Object.assign([], KDRestraint(restraint).LinkableBy || []);
    let link = restraint.dynamicLink;
    while (link) {
        let r = KDRestraint(link);
        if (r.LinkableBy) {
            for (let l of cache) {
                if (!r.LinkableBy.includes(l))
                    cache.splice(cache.indexOf(l), 1);
            }
        }
        else if (!r.LinkAll)
            return [];
        link = link.dynamicLink;
    }
    return cache;
}
let KinkyDungeonRestraintAdded = false;
let KinkyDungeonCancelFlag = false;
function KinkyDungeonAddRestraint(restraint, Tightness, Bypass, Lock, Keep, Link, SwitchItems, events, faction, Unlink, dynamicLink, Curse, autoMessage = true, securityEnemy = undefined, inventoryAs = undefined, data, powerBonus = 0, NoEvent = false, ForceRemove = false, NoActionPrune = false, flags) {
    let res = KDAddRestraintForce.apply(null, arguments);
    return res ? Math.max(1, KDRestraint(res)?.power) : 0;
}
function KDAddRestraintForce(restraint, Tightness, Bypass, Lock, Keep, Link, SwitchItems, events, faction, Unlink, dynamicLink, Curse, autoMessage = true, securityEnemy = undefined, inventoryAs = undefined, data, powerBonus = 0, NoEvent = false, ForceRemove = false, NoActionPrune = false, flags) {
    if (!NoActionPrune)
        KDDelayedActionPrune(["Restrain"]);
    if (restraint.bypass)
        Bypass = true;
    KDStruggleGroupLinkIndex = {};
    let start = performance.now();
    let tight = (Tightness) ? Tightness : 0;
    let Remover = securityEnemy;
    let addedItem = null;
    if (restraint) {
        if (restraint.Group == "ItemButt" && !KinkyDungeonStatsChoice.get("arousalModePlug"))
            return null;
        if (restraint.Group == "ItemVulva" && restraint.shrine.includes("Plugs") && KinkyDungeonStatsChoice.get("arousalModePlugNoFront"))
            return null;
        if (!Link && !Unlink) {
            let blockers = KDGetBlockersToAddRestraint(restraint, KDPlayer(), Bypass);
            if (blockers.length > 0) {
                for (let blocker of blockers) {
                    KinkyDungeonSetFlag("remove_incidental", 5);
                    KinkyDungeonRemoveRestraintSpecific(blocker, Keep, true, false, false, false, securityEnemy, ForceRemove);
                }
            }
        }
        if (!Unlink) {
            let ret = KDLinkUnder(restraint, Tightness, Bypass, Lock, Keep, false, events, faction, true, Curse, securityEnemy, true, inventoryAs, data, powerBonus);
            if (ret) {
                KDUpdateWaitTime(200);
                if (!Link && !Unlink && KinkyDungeonState == "Game")
                    KDDoRestraintParticlePlayer(restraint);
                return ret;
            }
        }
        let r = KinkyDungeonGetRestraintItem(restraint.Group);
        KDRestraintDebugLog.push("StartAdd " + restraint.name);
        if (!KDGroupBlocked(restraint.Group, true) || Bypass || KDEnemyPassesSecurity(restraint.Group, securityEnemy)) {
            KinkyDungeonEvasionPityModifier = 0;
            KinkyDungeonMiscastPityModifier = 0;
            let linkable = !Unlink && (!Link && r && KinkyDungeonIsLinkable({
                oldRestraint: KDRestraint(r),
                newRestraint: restraint,
                item: r,
            }));
            let linked = false;
            if (linkable) {
                linked = true;
                let lk = KinkyDungeonLinkItem(restraint, r, Tightness, Lock, Keep, faction, Curse, autoMessage, inventoryAs, events, data);
                if (lk) {
                    KinkyDungeonCancelFlag = true;
                    addedItem = lk;
                }
            }
            let eventsAdd = false;
            let oldevents = null;
            let prevR = null;
            if (!KinkyDungeonCancelFlag) {
                KinkyDungeonSetFlag("remove_incidental", 5);
                KinkyDungeonRemoveRestraint(restraint.Group, Keep && !Link, Link || Unlink, undefined, undefined, Unlink, Remover, ForceRemove);
                let newR = KinkyDungeonGetRestraintItem(restraint.Group);
                if (r && r.events) {
                    oldevents = r.events;
                    eventsAdd = newR != undefined;
                    prevR = r;
                }
                r = newR;
                KinkyDungeonCancelFlag = r != undefined;
            }
            if (!KinkyDungeonCancelFlag) {
                KinkyDungeonSetFlag("remove_incidental", 5);
                KinkyDungeonRemoveRestraint(restraint.Group, Keep, false, undefined, undefined, r && r.dynamicLink && restraint.name == r.dynamicLink.name, Remover);
                if (restraint.remove)
                    for (let remove of restraint.remove) {
                        InventoryRemove(KinkyDungeonPlayer, remove);
                    }
                if (restraint.removeShrine)
                    for (let remove of restraint.removeShrine) {
                        for (let removeR of KinkyDungeonAllRestraint()) {
                            let host = removeR;
                            let link = removeR.dynamicLink;
                            let iter = 0;
                            while (link && iter < 100) {
                                if (KDRestraint(link).shrine && KDRestraint(link).shrine.includes(remove)) {
                                    KinkyDungeonRemoveDynamicRestraint(host, Keep, false);
                                    host = removeR;
                                    link = removeR.dynamicLink;
                                }
                                else {
                                    host = link;
                                    link = link.dynamicLink;
                                }
                                iter += 1;
                            }
                            if (KDRestraint(removeR).shrine && KDRestraint(removeR).shrine.includes(remove)) {
                                KinkyDungeonSetFlag("remove_incidental", 5);
                                KinkyDungeonRemoveRestraint(KDRestraint(removeR).Group, Keep, false, false, false, false, Remover);
                            }
                        }
                    }
                KinkyDungeonSendFloater({ x: 1100, y: 600 - KDRecentRepIndex * 40 }, `+${TextGet("Restraint" + restraint.name)}!`, "pink", 5, true);
                KDRecentRepIndex += 1;
                let item = {
                    name: restraint.name,
                    id: KinkyDungeonGetItemID(),
                    type: Restraint,
                    curse: Curse,
                    events: events ? events : KDGetEventsForRestraint(inventoryAs || restraint.name),
                    tightness: tight,
                    lock: "",
                    faction: faction != undefined ? faction : KDDefaultItemPalette(restraint.name, inventoryAs),
                    dynamicLink: dynamicLink,
                    data: data,
                    flags: flags,
                };
                if (inventoryAs)
                    item.inventoryVariant = inventoryAs;
                KDRestraintDebugLog.push("Adding " + item.name);
                KinkyDungeonInventoryAdd(item);
                addedItem = item;
                KDUpdateItemEventCache = true;
                if (!NoEvent)
                    KinkyDungeonSendEvent("postApply", { player: KinkyDungeonPlayerEntity, item: item, host: undefined, keep: Keep, Link: Link, UnLink: Unlink, attacker: securityEnemy });
                KDUpdateItemEventCache = true;
                if (Curse && KDCurses[Curse] && KDCurses[Curse].onApply) {
                    KDCurses[Curse].onApply(item, undefined);
                    KinkyDungeonSendEvent("addCurse", {
                        prevCurse: undefined,
                        curse: Curse,
                        item: item,
                    });
                }
                if (Lock)
                    KinkyDungeonLock(item, Lock, false, Unlink, undefined, undefined, undefined, KDRestraintParticleLifetime * KDRestraintParticleLifetimeMult);
                else if (restraint.DefaultLock && !Unlink)
                    KinkyDungeonLock(item, KDProcessLock(restraint.DefaultLock), undefined, undefined, undefined, undefined, undefined, KDRestraintParticleLifetime * KDRestraintParticleLifetimeMult);
                KDUpdateLinkCaches(item);
                KDUpdateItemEventCache = true;
                if (!Link && !Unlink && KinkyDungeonState == "Game")
                    KDDoRestraintParticlePlayer(restraint);
            }
            else if ((!Link && !linked) || SwitchItems) {
                KinkyDungeonCancelFlag = false;
                r = KinkyDungeonGetRestraintItem(restraint.Group);
                if (SwitchItems) {
                    KDUpdateItemEventCache = true;
                    addedItem = KDAddRestraintItem(restraint, Tightness, Bypass, Lock, Keep, false, undefined, faction, undefined, Curse, securityEnemy, undefined, inventoryAs, data);
                }
                else if (r && KDRestraint(r) && KinkyDungeonIsLinkable({
                    oldRestraint: KDRestraint(r),
                    newRestraint: restraint,
                    item: r,
                })) {
                    addedItem = KinkyDungeonLinkItem(restraint, r, Tightness, Lock, Keep, faction, Curse, undefined, inventoryAs, events, data);
                }
            }
            if (oldevents) {
                if (prevR.events) {
                    for (let e of oldevents) {
                        if (e.trigger == "postRemoval" && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
                            KinkyDungeonHandleInventoryEvent("postRemoval", e, prevR, { item: prevR, Character: KinkyDungeonPlayer, add: eventsAdd, keep: Keep, Link: Link, shrine: undefined, Remover: Remover });
                        }
                    }
                }
                KinkyDungeonSendEvent("postRemoval", { item: prevR, Character: KinkyDungeonPlayer, add: eventsAdd, keep: Keep, Link: Link, shrine: undefined });
            }
            KDUpdateItemEventCache = true;
            KinkyDungeonCancelFlag = false;
        }
        KinkyDungeonPlayerTags = KinkyDungeonUpdateRestraints();
        KDEntityRestraintMetadata.set(KDPlayer().id, KDUpdateRestraintMetadata(KDPlayer().id, 1));
        KinkyDungeonCalculateSlowLevel();
        KDRefreshCharacter.set(KinkyDungeonPlayer, true);
        KinkyDungeonDressPlayer();
        KinkyDungeonMultiplayerInventoryFlag = true;
        KinkyDungeonUpdateStruggleGroups();
        if (!KinkyDungeonRestraintAdded) {
            KinkyDungeonRestraintAdded = true;
            let sfx = (restraint && KDGetRestraintSFX(restraint)) ? KDGetRestraintSFX(restraint) : "Struggle";
            if (KDSoundEnabled() && !Unlink)
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
        }
        let end = performance.now();
        if (KDDebug)
            console.log(`Took ${end - start} milliseconds to add restraint ${restraint.name}`);
        KDUpdateWaitTime(200);
        return addedItem;
    }
    return null;
}
function KinkyDungeonRemoveRestraintSpecific(item, Keep, Add, NoEvent, Shrine, UnLink, Remover, ForceRemove) {
    KDUpdateItemEventCache = true;
    let rest = KinkyDungeonGetRestraintItem(KDRestraint(item)?.Group);
    if (rest == item) {
        return KinkyDungeonRemoveRestraint(KDRestraint(item).Group, Keep, Add, NoEvent, Shrine, UnLink, Remover, ForceRemove);
    }
    else if (KDRestraint(item)) {
        let list = KDDynamicLinkList(rest, true);
        for (let i = 1; i < list.length; i++) {
            if (list[i] == item) {
                return KinkyDungeonRemoveDynamicRestraint(list[i - 1], Keep, NoEvent, Remover, ForceRemove);
            }
        }
    }
    return [];
}
function KinkyDungeonRemoveRestraint(Group, Keep, Add, NoEvent, Shrine, UnLink, Remover, ForceRemove) {
    let rem = [];
    KDRestraintDebugLog.push("Removing " + Group);
    KDDelayedActionPrune(["Remove"]);
    KDStruggleGroupLinkIndex = {};
    for (let item of KinkyDungeonAllRestraint()) {
        const rest = KinkyDungeonRestraintsCache.get(item.name);
        if (rest.Group == Group) {
            let AssetGroup = rest && rest.AssetGroup ? rest.AssetGroup : Group;
            if (!NoEvent)
                KinkyDungeonSendEvent("remove", { item: rest, add: Add, keep: Keep, shrine: Shrine });
            if (!KinkyDungeonCancelFlag && !Add && !UnLink) {
                KDRestraintDebugLog.push("Unlinking " + item.name);
                let rr = KinkyDungeonUnLinkItem(item, Keep, undefined, ForceRemove, Remover);
                if (rr.length > 0) {
                    KinkyDungeonCancelFlag = true;
                    rem.push(...rr);
                }
            }
            if (!KinkyDungeonCancelFlag) {
                InventoryRemove(KinkyDungeonPlayer, AssetGroup);
                let removed = [];
                for (let _item of KinkyDungeonInventory.get(Restraint).values()) {
                    if (_item && KDRestraint(_item).Group == Group) {
                        KDRestraintDebugLog.push("Deleting " + _item.name);
                        KinkyDungeonInventoryRemove(_item);
                        removed.push(_item);
                        break;
                    }
                }
                if (removed.length > 0 && ((!Add && !UnLink) || (Add && UnLink)))
                    for (let invitem of (!Add && !UnLink) ? KDDynamicLinkList(item, true) : removed) {
                        let invrest = KDRestraint(invitem);
                        rem.push(JSON.parse(JSON.stringify(invitem)));
                        let inventoryAs = invitem.inventoryVariant || invitem.inventoryAs || (Remover?.player ? invrest.inventoryAsSelf : invrest.inventoryAs);
                        if (invitem.conjured) {
                            KinkyDungeonSendTextMessage(1, TextGet("KDConjuredItemVanish")
                                .replace("ITMN", KDGetItemName(invitem)), KDBaseWhite, 1);
                        }
                        if (invrest.inventory && !ForceRemove && !invitem.conjured
                            && (Keep
                                || ((invrest.enchanted
                                    || (invrest.alwaysKeep)
                                    || (invrest.armor)
                                    || (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs] && !KinkyDungeonRestraintVariants[inventoryAs].noKeep))))) {
                            if (inventoryAs) {
                                let origRestraint = KinkyDungeonGetRestraintByName(inventoryAs);
                                if (origRestraint && invrest.shrine?.includes("Cursed") && !origRestraint.shrine?.includes("Cursed")) {
                                    KinkyDungeonSendTextMessage(10, TextGet("KDCursedArmorUncurse").replace("RestraintName", TextGet("Restraint" + invrest.name)), "#aaffaa", 1, false, false, undefined, "Struggle");
                                }
                                if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
                                    KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
                                }
                                if (!KinkyDungeonInventoryGetLoose(inventoryAs)) {
                                    let loose = { name: inventoryAs, id: KinkyDungeonGetItemID(), type: LooseRestraint, events: invitem.events || origRestraint.events, quantity: 1 };
                                    if (invitem.inventoryVariant)
                                        loose.inventoryVariant = invitem.inventoryVariant;
                                    if (KinkyDungeonRestraintVariants[inventoryAs])
                                        loose.showInQuickInv = true;
                                    KinkyDungeonInventoryAdd(loose);
                                    KDUpdateItemEventCache = true;
                                }
                                else {
                                    if (!KinkyDungeonInventoryGetLoose(inventoryAs).quantity)
                                        KinkyDungeonInventoryGetLoose(inventoryAs).quantity = 0;
                                    KinkyDungeonInventoryGetLoose(inventoryAs).quantity += 1;
                                }
                            }
                            else {
                                if (!KinkyDungeonInventoryGetLoose(invrest.name)) {
                                    KinkyDungeonInventoryAdd({ name: invrest.name, id: KinkyDungeonGetItemID(), type: LooseRestraint, events: invrest.events, quantity: 1 });
                                    KDUpdateItemEventCache = true;
                                }
                                else {
                                    if (!KinkyDungeonInventoryGetLoose(invrest.name).quantity)
                                        KinkyDungeonInventoryGetLoose(invrest.name).quantity = 0;
                                    KinkyDungeonInventoryGetLoose(invrest.name).quantity += 1;
                                }
                            }
                        }
                        else if (Keep && rest.disassembleAs) {
                            let dropped = { x: KDPlayer().x, y: KDPlayer().y,
                                name: rest.disassembleAs,
                                amount: rest.disassembleCount || 1 };
                            let newPoint = KinkyDungeonGetNearbyPoint(KDPlayer().x, KDPlayer().y, false, undefined, true);
                            if (newPoint) {
                                dropped.x = newPoint.x;
                                dropped.y = newPoint.y;
                            }
                            KDMapData.GroundItems.push(dropped);
                        }
                        if (!NoEvent) {
                            if (invrest.events) {
                                for (let e of invrest.events) {
                                    if (e.trigger == "postRemoval" && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
                                        KinkyDungeonHandleInventoryEvent("postRemoval", e, invitem, { item: invitem, Character: KinkyDungeonPlayer, id: KinkyDungeonGetItemID(), add: Add, keep: Keep, shrine: Shrine });
                                    }
                                }
                            }
                            KinkyDungeonSendEvent("postRemoval", { item: invrest, Character: KinkyDungeonPlayer, add: Add, keep: Keep, shrine: Shrine, Remover: Remover });
                        }
                    }
                if (rest.Group == "ItemNeck" && !Add && !KinkyDungeonPlayerTags.get("Collars"))
                    rem.push(...KinkyDungeonRemoveRestraint("ItemNeckRestraints", true, undefined, undefined, Shrine, undefined, Remover, ForceRemove));
                let sfx = (rest && KDGetRemoveSFX(rest)) ? KDGetRemoveSFX(rest) : "Struggle";
                if (KDSoundEnabled() && !Add && !UnLink)
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
                KinkyDungeonCalculateSlowLevel();
                KDRefreshCharacter.set(KinkyDungeonPlayer, true);
                KinkyDungeonDressPlayer();
                KinkyDungeonMultiplayerInventoryFlag = true;
                KinkyDungeonUpdateStruggleGroups();
            }
            KinkyDungeonCancelFlag = false;
            if (KinkyDungeonPlayerWeapon != KDGameData.PlayerWeaponLastEquipped && KinkyDungeonInventoryGet(KDGameData.PlayerWeaponLastEquipped || "")) {
                KDSetWeapon(KDGameData.PlayerWeaponLastEquipped || "");
            }
            if (KDGameData.OffhandOld && !KDGameData.Offhand
                && KinkyDungeonInventoryGetWeapon(KDGameData.OffhandOld)
                && KinkyDungeonCanUseWeapon(false, undefined, KDWeapon(KinkyDungeonInventoryGetWeapon(KDGameData.OffhandOld)))
                && KDCanOffhand(KinkyDungeonInventoryGetWeapon(KDGameData.OffhandOld))) {
                KDGameData.Offhand = KDGameData.OffhandOld;
            }
            return rem;
        }
    }
    return rem;
}
function KDIInsertRestraintUnderneath(_restraint) {
    return false;
}
function KinkyDungeonRemoveDynamicRestraint(hostItem, Keep, NoEvent, Remover, ForceRemove) {
    let item = hostItem.dynamicLink;
    let rem = [];
    if (item) {
        const rest = KDRestraint(item);
        if (!NoEvent)
            KinkyDungeonSendEvent("remove", { item: rest, keep: Keep, shrine: false, dynamic: true });
        if (!KinkyDungeonCancelFlag) {
            let inventoryAs = item.inventoryVariant || item.inventoryAs || (Remover?.player ? rest.inventoryAsSelf : rest.inventoryAs);
            if (item.conjured) {
                KinkyDungeonSendTextMessage(1, TextGet("KDConjuredItemVanish")
                    .replace("ITMN", KDGetItemName(item)), KDBaseWhite, 1);
            }
            if (rest.inventory && !ForceRemove && !item.conjured
                && (Keep
                    || rest.enchanted
                    || rest.armor
                    || rest.alwaysKeep
                    || (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs] && !KinkyDungeonRestraintVariants[inventoryAs].noKeep))) {
                if (inventoryAs) {
                    let origRestraint = KinkyDungeonGetRestraintByName(inventoryAs);
                    if (origRestraint && rest.shrine?.includes("Cursed") && !origRestraint.shrine?.includes("Cursed")) {
                        KinkyDungeonSendTextMessage(10, TextGet("KDCursedArmorUncurse").replace("RestraintName", TextGet("Restraint" + rest.name)), "#aaffaa", 1, false, false, undefined, "Struggle");
                        if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
                            KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
                        }
                    }
                    if (!KinkyDungeonInventoryGetLoose(inventoryAs)) {
                        let loose = { name: inventoryAs, id: KinkyDungeonGetItemID(), type: LooseRestraint, events: item.events || KDGetEventsForRestraint(inventoryAs), quantity: 1 };
                        if (item.inventoryVariant)
                            loose.inventoryVariant = item.inventoryVariant;
                        if (KinkyDungeonRestraintVariants[inventoryAs])
                            loose.showInQuickInv = true;
                        KinkyDungeonInventoryAdd(loose);
                        KDUpdateItemEventCache = true;
                    }
                    else {
                        if (!KinkyDungeonInventoryGetLoose(inventoryAs).quantity)
                            KinkyDungeonInventoryGetLoose(inventoryAs).quantity = 0;
                        KinkyDungeonInventoryGetLoose(inventoryAs).quantity += 1;
                    }
                }
                else {
                    if (!KinkyDungeonInventoryGetLoose(rest.name)) {
                        KinkyDungeonInventoryAdd({ name: rest.name, id: KinkyDungeonGetItemID(), type: LooseRestraint, events: rest.events, quantity: 1 });
                        KDUpdateItemEventCache = true;
                    }
                    else {
                        if (!KinkyDungeonInventoryGetLoose(rest.name).quantity)
                            KinkyDungeonInventoryGetLoose(rest.name).quantity = 0;
                        KinkyDungeonInventoryGetLoose(rest.name).quantity += 1;
                    }
                }
            }
            else if (Keep && rest.disassembleAs) {
                let dropped = { x: KDPlayer().x, y: KDPlayer().y,
                    name: rest.disassembleAs,
                    amount: rest.disassembleCount || 1 };
                let newPoint = KinkyDungeonGetNearbyPoint(KDPlayer().x, KDPlayer().y, false, undefined, true);
                if (newPoint) {
                    dropped.x = newPoint.x;
                    dropped.y = newPoint.y;
                }
                KDMapData.GroundItems.push(dropped);
            }
            KDRestraintDebugLog.push("Removing Dynamic " + item.name);
            hostItem.dynamicLink = item.dynamicLink;
            item.dynamicLink = undefined;
            rem.push(JSON.parse(JSON.stringify(item)));
            KDUpdateItemEventCache = true;
            let r = KinkyDungeonGetRestraintItem(KDRestraint(hostItem).Group);
            if (r)
                KDUpdateLinkCaches(r);
            if (!NoEvent) {
                if (rest.events) {
                    for (let e of rest.events) {
                        if (e.trigger == "postRemoval" && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
                            KinkyDungeonHandleInventoryEvent("postRemoval", e, item, { item: item, id: KinkyDungeonGetItemID(), Character: KinkyDungeonPlayer, keep: Keep, shrine: false, dynamic: true, Remover: Remover });
                        }
                    }
                }
                KinkyDungeonSendEvent("postRemoval", { item: rest, keep: Keep, shrine: false, dynamic: true, Character: KinkyDungeonPlayer, Remover: Remover });
            }
            let sfx = (rest && KDGetRemoveSFX(rest)) ? KDGetRemoveSFX(rest) : "Struggle";
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
            KinkyDungeonCalculateSlowLevel();
            KDRefreshCharacter.set(KinkyDungeonPlayer, true);
            KinkyDungeonDressPlayer();
            KinkyDungeonMultiplayerInventoryFlag = true;
            KinkyDungeonUpdateStruggleGroups();
        }
        KinkyDungeonCancelFlag = false;
    }
    return rem;
}
function KinkyDungeonRestraintTypes(ShrineFilter) {
    let ret = [];
    for (let invItem of KinkyDungeonAllRestraintDynamic()) {
        let inv = invItem.item;
        if (KDRestraint(inv).shrine) {
            for (let shrine of KDRestraint(inv).shrine) {
                if (ShrineFilter.includes(shrine) && !ret.includes(shrine))
                    ret.push(shrine);
            }
        }
    }
    return ret;
}
function KinkyDungeonLinkItem(newRestraint, oldItem, tightness, Lock, Keep, faction, Curse, autoMessage = true, inventoryAs = null, events = undefined, data) {
    if (newRestraint && oldItem && oldItem.type == Restraint) {
        if (newRestraint) {
            KDRestraintDebugLog.push("Adding Linking " + newRestraint.name);
            KinkyDungeonAddRestraint(newRestraint, tightness, true, Lock, Keep, true, undefined, events, faction, undefined, oldItem, Curse, undefined, undefined, inventoryAs, data);
            let newItem = KinkyDungeonGetRestraintItem(newRestraint.Group);
            if (newItem)
                newItem.dynamicLink = oldItem;
            if (newRestraint.UnLink && KDRestraint(oldItem).Link == newRestraint.name) {
                if (oldItem.name != newRestraint.UnLink) {
                    oldItem.name = newRestraint.UnLink;
                    oldItem.events = Object.assign([], KDRestraint(oldItem).events);
                }
            }
            KDUpdateItemEventCache = true;
            KDUpdateLinkCaches(newItem);
            if (autoMessage && KDRestraint(oldItem).Link)
                KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonLink" + oldItem.name), KDBaseRed, 2, false, false, undefined, "Struggle");
            if (KinkyDungeonState == "Game")
                KDDoRestraintParticlePlayer(newRestraint);
            KinkyDungeonSendEvent("postApply", { player: KinkyDungeonPlayerEntity, item: newItem, host: undefined, keep: Keep, Link: true, UnLink: false, attacker: undefined });
            KDUpdateItemEventCache = true;
            return newItem;
        }
    }
    return null;
}
function KinkyDungeonUnLinkItem(item, Keep, _dynamic, ForceRemove, Remover) {
    let rem = [];
    if (item.type == Restraint) {
        let UnLink = null;
        if (item.dynamicLink) {
            UnLink = item.dynamicLink;
        }
        if (UnLink) {
            let newRestraint = KinkyDungeonGetRestraintByName(UnLink.name);
            if (newRestraint) {
                KDRestraintDebugLog.push("Adding Unlinked " + newRestraint.name);
                KinkyDungeonAddRestraint(newRestraint, UnLink.tightness, true, UnLink.lock, Keep, undefined, undefined, UnLink?.events, UnLink.faction, true, UnLink.dynamicLink, UnLink.curse, undefined, undefined, UnLink.inventoryVariant, UnLink.data, undefined, undefined, ForceRemove, undefined, UnLink.flags);
                KinkyDungeonSendEvent("postRemoval", { item: null, keep: Keep, shrine: false, Link: false, dynamic: true, Character: KinkyDungeonPlayer, Remover: Remover });
                if (KDRestraint(item).UnLink) {
                    KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonUnLink" + item.name), KDBaseLightGreen, 2, false, false, undefined, "Struggle");
                }
                else
                    KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonUnLink"), KDBaseLightGreen, 2, false, false, undefined, "Struggle");
                return [item];
            }
        }
    }
    return rem;
}
function KDCreateDebris(x, y, options) {
    let count = options.number ? options.number : 1;
    let rad = options.aoe ? options.aoe : 1.5;
    let minrad = options.dist;
    for (let i = 0; i < count; i++) {
        let slots = [];
        for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
            for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
                if (Math.sqrt(X * X + Y * Y) <= rad && (!minrad || Math.sqrt(X * X + Y * Y) >= minrad)) {
                    if ((x + X > 0 && y + Y > 0 && x + X < KDMapData.GridWidth && y + Y < KDMapData.GridHeight)
                        && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x + X, y + Y)))
                        slots.push({ x: X, y: Y });
                }
            }
        if (slots.length > 0) {
            let slot = slots[Math.floor(KDRandom() * slots.length)];
            if (slot) {
                KDCreateEffectTile(x + slot.x, y + slot.y, {
                    name: options.kind,
                    duration: options.duration
                }, options.durationExtra || 0);
            }
        }
    }
}
function KDSuccessRemove(StruggleType, restraint, lockType, index, data, host) {
    let progress = restraint.cutProgress ? restraint.cutProgress : 0;
    data.destroyChance = (StruggleType == "Cut" || restraint.cutProgress) ? 1.0 : 0;
    if (restraint.struggleProgress && restraint.struggleProgress > 0) {
        progress += restraint.struggleProgress;
        data.destroyChance = restraint.cutProgress / progress;
    }
    if (KDRestraint(restraint)?.struggleBreak && StruggleType == "Struggle")
        data.destroyChance = 1.0;
    let destroy = false;
    let group = KDRestraint(restraint)?.Group;
    KinkyDungeonFastStruggleType = "";
    KinkyDungeonFastStruggleGroup = "";
    KinkyDungeonSendEvent("beforeSuccessRemove", data);
    if (StruggleType == "Pick" || StruggleType == "Unlock") {
        if (StruggleType == "Unlock") {
            if (lockType && lockType.canUnlock(data)) {
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                        + ((KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Unlock) ? KDGetFinishEscapeSFX(restraint).Unlock : "Unlock")
                        + ".ogg");
                KinkyDungeonRemoveKeysUnlock(restraint.lock);
                KinkyDungeonLock(restraint, "", false, false, false, true);
            }
        }
        else {
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                    + ((KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Unlock) ? KDGetFinishEscapeSFX(restraint).Unlock : "Unlock")
                    + ".ogg");
            KinkyDungeonLock(restraint, "", false, false, true);
        }
    }
    else {
        if (KDSoundEnabled()) {
            if (StruggleType == "Cut")
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                    + ((KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Cut) ? KDGetFinishEscapeSFX(restraint).Cut : "Cut")
                    + ".ogg");
            else if (StruggleType == "Remove")
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                    + ((KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Remove) ? KDGetFinishEscapeSFX(restraint).Remove : "Unbuckle")
                    + ".ogg");
            else
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                    + ((KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Struggle) ? KDGetFinishEscapeSFX(restraint).Struggle : "Struggle")
                    + ".ogg");
        }
        if (KDRandom() < data.destroyChance) {
            if (KDAlwaysKeep({ name: restraint.name, id: 0 }, KinkyDungeonPlayerEntity)) {
                KinkyDungeonSendTextMessage(9, TextGet("KinkyDungeonStruggleCutDestroyFail").replace("TargetRestraint", TextGet("Restraint" + restraint.name)), KDBaseRed, 2, false, false, undefined, "Struggle");
            }
            else {
                KinkyDungeonSendTextMessage(9, TextGet("KinkyDungeonStruggleCutDestroy").replace("TargetRestraint", TextGet("Restraint" + restraint.name)), KDBaseRed, 2, false, false, undefined, "Struggle");
            }
            destroy = true;
        }
        let trap = restraint.trap;
        KDSendStatus('escape', restraint.name, StruggleType);
        if (KDSoundEnabled() && destroy) {
            if (KDGetFinishEscapeSFX(restraint) && KDGetFinishEscapeSFX(restraint).Destroy) {
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/"
                    + (KDGetFinishEscapeSFX(restraint).Destroy)
                    + ".ogg");
            }
        }
        KinkyDungeonSetFlag("remove_incidental", 0);
        if (index) {
            KinkyDungeonRemoveDynamicRestraint(host, !destroy, false, KinkyDungeonPlayerEntity);
        }
        else {
            KinkyDungeonRemoveRestraint(KDRestraint(restraint).Group, !destroy, undefined, undefined, undefined, undefined, KinkyDungeonPlayerEntity);
        }
        if (KinkyDungeonStatsChoice.get("FutileStruggles") && data.escapeChance < 0.25)
            KDChangeWill("FutileStruggles", "perk", "struggle", KinkyDungeonStatWillCostEscape);
        if (trap) {
            let summon = KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, trap, 1, 2.5).length;
            if (summon) {
                KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonSummonTrapMonster"), KDBaseRed, 2, false, false, undefined, "Struggle");
            }
        }
    }
    let suff = "";
    if (KDRestraint(restraint)?.customEscapeSucc)
        suff = KDRestraint(restraint)?.customEscapeSucc;
    else if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.1)
        suff = "Aroused";
    KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonStruggle" + StruggleType + "Success" + suff).replace("TargetRestraint", TextGet("Restraint" + KDRestraint(restraint).name)), KDBaseLightGreen, 2);
    KinkyDungeonSendEvent("afterSuccessRemove", data);
    KDSortInventory(KDPlayer());
    KDGameData.DelayedActions = KDPruneSameStruggleActions(KDGameData.DelayedActions, group, index);
    return destroy;
}
function KDPruneSameStruggleActions(list, group, index) {
    let newList = [];
    for (let action of list) {
        if (action.commit == "Struggle") {
            if (!(action.data?.index === index && action.data?.group === group)) {
                newList.push(action);
            }
        }
    }
    let timeAdv = list.length - newList.length;
    if (timeAdv > 0) {
        for (let action of newList) {
            if (action.tick > 0 && action.time > 0) {
                action.tick -= timeAdv;
                action.time -= timeAdv;
            }
        }
    }
    return newList;
}
function KDAddDelayedStruggle(amount, time, _StruggleType, struggleGroup, index, data, progress = 0, limit = 100) {
    let cur = progress || 0;
    for (let t = 1; t <= time; t++) {
        let plus = Math.min(amount / time, Math.max(0, (limit > 0 ? (limit - cur) : 1)));
        if (plus > 0 && plus < 0.04)
            plus = 0.04;
        cur += plus;
        KDAddDelayedAction({
            commit: "Struggle",
            data: {
                group: struggleGroup,
                index: index,
                amount: plus,
                escapeData: data,
                delta: time == 1 ? 0 : 1,
            },
            time: t,
            tick: t - 1,
            maxtime: time,
            tags: ["Action", "Remove", "Restrain", "Hit", "Auto"],
        });
    }
    if (time > 1)
        KDDelayedActionStart();
}
function KDGetManaBonus(bonus, penalty, threshold, bonusscale, penaltyscale) {
    if (KinkyDungeonStatMana > threshold)
        return bonus * (KinkyDungeonStatMana - threshold) / bonusscale;
    else if (KinkyDungeonStatMana < threshold)
        return penalty * (KinkyDungeonStatMana - threshold) / penaltyscale;
    return 0;
}
function KDGetItemGoddessBonus(item, data) {
    if (!item)
        return 0;
    if (data) {
        if (data.struggleType == "Unlock")
            return 0;
    }
    let bonus = 0;
    let avg = 0;
    for (let s of KDRestraint(item)?.shrine) {
        if (KinkyDungeonGoddessRep[s] != undefined) {
            bonus += KDGetGoddessBonus(s);
            avg += 1;
        }
    }
    if (avg > 0)
        bonus = bonus / avg;
    return bonus;
}
function KDChooseRestraintFromListGroupPri(RestraintList, GroupOrder, skip = true) {
    let cycled = false;
    for (let i = 0; i < GroupOrder.length; i++) {
        let group = GroupOrder[i];
        if (skip && (!cycled ||
            (KinkyDungeonGetRestraintItem(group)
                && !KDRestraint(KinkyDungeonGetRestraintItem(group))?.armor
                && !KDRestraint(KinkyDungeonGetRestraintItem(group))?.good))) {
            if (i == GroupOrder.length - 1 && !cycled) {
                i = 0;
                cycled = true;
            }
            continue;
        }
        let Restraints = RestraintList.filter((rest) => {
            return rest.restraint.Group == group;
        });
        if (Restraints.length > 0) {
            let restraintWeightTotal = 0;
            let restraintWeights = [];
            for (let rest of Restraints) {
                let restraint = rest.restraint;
                let weight = rest.weight;
                restraintWeights.push({ restraint: restraint, weight: restraintWeightTotal });
                weight += restraint.weight;
                restraintWeightTotal += Math.max(0, weight);
            }
            let selection = KDRandom() * restraintWeightTotal;
            for (let L = restraintWeights.length - 1; L >= 0; L--) {
                if (selection > restraintWeights[L].weight) {
                    return restraintWeights[L].restraint;
                }
            }
        }
        if (i == GroupOrder.length - 1 && !cycled) {
            i = 0;
            cycled = true;
        }
    }
    return null;
}
function KDChooseRestraintFromListGroupPriWithVariants(RestraintList, GroupOrder, skip = true) {
    let cycled = false;
    for (let i = 0; i < GroupOrder.length; i++) {
        let group = GroupOrder[i];
        if (skip && (!cycled && i < GroupOrder.length - 1 &&
            (KinkyDungeonGetRestraintItem(group)
                && !KDRestraint(KinkyDungeonGetRestraintItem(group))?.armor
                && !KDRestraint(KinkyDungeonGetRestraintItem(group))?.good)))
            continue;
        let Restraints = RestraintList.filter((rest) => {
            return rest.restraint.Group == group;
        });
        if (Restraints.length > 0) {
            let restraintWeightTotal = 0;
            let restraintWeights = [];
            for (let rest of Restraints) {
                let restraint = rest.restraint;
                let weight = rest.weight;
                restraintWeights.push({ restraint: restraint, variant: rest.variant, weight: restraintWeightTotal, iv: rest.inventoryVariant });
                weight += rest.weight;
                restraintWeightTotal += Math.max(0, weight);
            }
            let selection = KDRandom() * restraintWeightTotal;
            for (let L = restraintWeights.length - 1; L >= 0; L--) {
                if (selection > restraintWeights[L].weight) {
                    return { r: restraintWeights[L].restraint, v: restraintWeights[L].variant, iv: restraintWeights[L].iv };
                }
            }
        }
        if (i == GroupOrder.length - 1 && !cycled) {
            i = -1;
            cycled = true;
        }
    }
    return null;
}
let KDSlimeParts = {
    "Collar": { enemyTagSuffix: "Collar", enemyTagExtra: { "livingCollar": 10 } },
    "Boots": {},
    "Feet": {},
    "Legs": {},
    "Arms": {},
    "Head": {},
    "Mouth": {},
    "Hands": {},
    "Raw": {},
};
let KDRopeParts = {
    "Collar": { enemyTagSuffix: "Collar", enemyTagExtra: { "livingCollar": 10 } },
    "ArmsBoxtie": {},
    "ArmsWrist": {},
    "Cuffs": {},
    "CuffsAdv": {},
    "CuffsAdv2": { enemyTagSuffix2: "Nonbind" },
    "HogtieLink": { enemyTagSuffix: "Hogtie" },
    "Feet": {},
    "Feet2": {},
    "Feet3": {},
    "Legs": {},
    "Legs2": {},
    "Legs3": {},
    "Belt": {},
    "Harness": { enemyTagSuffix2: "Nonbind" },
    "Crotch": { enemyTagSuffix2: "Nonbind" },
    "Toes": {},
    "Raw": {},
};
let KDCuffParts = {
    "LivingCollar": { base: true, enemyTagSuffix: "LivingCollar", enemyTagOverride: { "livingCollar": 10 } },
    "AnkleCuffs": { base: true, },
    "LegCuffs": { base: true, },
    "ArmCuffs": { base: true, },
};
function KDAddCuffVariants(CopyOf, idSuffix, ModelSuffix, tagBase, extraTags, allTag, removeTag, addPower, properties, extraEvents = [], addStruggle, premultStruggle, addStruggleLink, premultStruggleLink, Filters, baseWeight = 10, noGeneric, CuffAssets = {}, CuffModels = {}, noLockBase, noLockLink, Properties, ExtraProps) {
    for (let part of Object.entries(KDCuffParts)) {
        let cuffPart = part[0];
        let cuffInfo = part[1];
        let origRestraint = KinkyDungeonGetRestraintByName(CopyOf + cuffPart);
        if (origRestraint) {
            let enemyTags = {};
            if (cuffInfo.base) {
                enemyTags[tagBase + (cuffInfo.enemyTagSuffix || "Cuffs")] = baseWeight;
                if (cuffInfo.enemyTagOverride) {
                    for (let tag in cuffInfo.enemyTagOverride) {
                        enemyTags[tag] = cuffInfo.enemyTagOverride[tag];
                    }
                }
                else {
                    if (!noGeneric) {
                        enemyTags[tagBase + ("Restraints")] = baseWeight;
                        enemyTags[tagBase + ("LessCuffs")] = 0.1 - baseWeight;
                        enemyTags[tagBase + ("NoCuffs")] = -1000;
                    }
                    if (extraTags) {
                        for (let t of Object.entries(extraTags)) {
                            enemyTags[t[0]] = t[1];
                        }
                    }
                }
            }
            let enemyTagsMult = {};
            if (cuffInfo.base)
                enemyTagsMult[tagBase + (cuffInfo.enemyTagSuffix || "")] = 1;
            let shrine = [...allTag, ...KDGetRestraintTags(origRestraint)];
            for (let t of removeTag) {
                if (shrine.includes(t))
                    shrine.splice(shrine.indexOf(t), 1);
            }
            let props = {
                Model: CuffModels[cuffPart] || (origRestraint.Model + ModelSuffix + (cuffInfo.ModelSuffix || "")),
                Asset: CuffAssets[cuffPart] || (origRestraint.Asset),
                power: origRestraint.power + addPower,
                shrine: shrine,
                enemyTags: enemyTags,
                enemyTagsMult: enemyTagsMult,
                events: cuffInfo.base ? [...extraEvents, ...(origRestraint.events || [])] : [...(origRestraint.events || [])],
                escapeChance: Object.assign({}, origRestraint.escapeChance),
                Filters: origRestraint.Filters ? Object.assign({}, origRestraint.Filters) : {},
                Properties: origRestraint.Properties ? Object.assign({}, origRestraint.Properties) : {},
                cloneTag: tagBase + "Restraints",
            };
            if (cuffInfo.Link)
                props.Link = idSuffix + cuffInfo.Link;
            if (cuffInfo.UnLink)
                props.UnLink = idSuffix + cuffInfo.UnLink;
            if (Filters && props.Filters) {
                for (let layer of Object.keys(Filters)) {
                    props.Filters[layer] = Object.assign({}, Filters[layer]);
                }
            }
            if (origRestraint.disassembleAs)
                props.disassembleAs = idSuffix + "Raw";
            if (Properties && props.Properties) {
                for (let layer of Object.keys(Properties)) {
                    props.Properties[layer] = Object.assign({}, Properties[layer]);
                }
            }
            if (cuffInfo.base) {
                if (premultStruggle) {
                    for (let type of Object.entries(premultStruggle)) {
                        props.escapeChance[type[0]] = Math.round(10000 * ((props.escapeChance[type[0]] || 0) * type[1])) / 10000;
                    }
                }
                if (addStruggle) {
                    for (let type of Object.entries(addStruggle)) {
                        props.escapeChance[type[0]] = Math.round(10000 * ((props.escapeChance[type[0]] || 0) + type[1])) / 10000;
                    }
                }
                if (noLockBase) {
                    delete props.escapeChance.Pick;
                    delete props.escapeChance.Unlock;
                }
            }
            else {
                if (premultStruggleLink) {
                    for (let type of Object.entries(premultStruggleLink)) {
                        props.escapeChance[type[0]] = Math.round(10000 * ((props.escapeChance[type[0]] || 0) * type[1])) / 10000;
                    }
                }
                if (addStruggleLink) {
                    for (let type of Object.entries(addStruggleLink)) {
                        props.escapeChance[type[0]] = Math.round(10000 * ((props.escapeChance[type[0]] || 0) + type[1])) / 10000;
                    }
                }
                if (noLockLink) {
                    delete props.escapeChance.Pick;
                    delete props.escapeChance.Unlock;
                }
            }
            let pp = Object.assign(props, properties);
            if (ExtraProps && ExtraProps[cuffPart]) {
                pp = Object.assign(pp, ExtraProps[cuffPart]);
            }
            KinkyDungeonCloneRestraint(CopyOf + cuffPart, idSuffix + cuffPart, pp);
        }
    }
}
function KDAddRopeVariants(CopyOf, idSuffix, ModelSuffix, tagBase, allTag, removeTag, basePower, properties, extraEvents = [], addStruggle, premultStruggle, Filters, baseWeight = 10, Enchantable = false, Properties) {
    for (let part of Object.entries(KDRopeParts)) {
        let ropePart = part[0];
        let origRestraint = KinkyDungeonGetRestraintByName(CopyOf + ropePart);
        if (origRestraint) {
            let enemyTags = {};
            enemyTags[tagBase + (part[1].enemyTagSuffix || "")] = baseWeight;
            if (part[1].enemyTagSuffix2)
                enemyTags[tagBase + (part[1].enemyTagSuffix2 || "")] = baseWeight;
            if (part[1].enemyTagExtra) {
                for (let tag in part[1].enemyTagExtra) {
                    enemyTags[tag] = part[1].enemyTagExtra[tag];
                }
            }
            let enemyTagsMult = {};
            enemyTagsMult[tagBase + (part[1].enemyTagSuffix || "")] = 1;
            if (part[1].enemyTagSuffix2)
                enemyTagsMult[tagBase + (part[1].enemyTagSuffix2 || "")] = 1;
            let shrine = [...allTag, ...KDGetRestraintTags(origRestraint)];
            for (let t of removeTag) {
                if (shrine.includes(t))
                    shrine.splice(shrine.indexOf(t), 1);
            }
            let props = {
                Model: origRestraint.Model + ModelSuffix,
                power: origRestraint.power + basePower,
                shrine: shrine,
                enemyTags: enemyTags,
                enemyTagsMult: enemyTagsMult,
                events: [...extraEvents, ...(origRestraint.events || [])],
                escapeChance: Object.assign({}, origRestraint.escapeChance),
                Filters: origRestraint.Filters ? Object.assign({}, origRestraint.Filters) : {},
                Properties: origRestraint.Properties ? Object.assign({}, origRestraint.Properties) : {},
                cloneTag: tagBase,
                linkCategories: origRestraint.linkCategories ? JSON.parse(JSON.stringify(origRestraint.linkCategories)) : undefined,
                linkSizes: origRestraint.linkSizes ? JSON.parse(JSON.stringify(origRestraint.linkSizes)) : undefined,
            };
            if (origRestraint.disassembleAs)
                props.disassembleAs = idSuffix + "Raw";
            if (!Enchantable && props.linkCategories) {
                for (let i = 0; i < props.linkCategories.length; i++) {
                    if (props.linkCategories[i].includes("Enchantable")) {
                        props.linkCategories.splice(i, 1);
                        if (props.linkSizes && props.linkSizes[i])
                            props.linkSizes.splice(i, 1);
                        break;
                    }
                }
            }
            if (Filters && props.Filters) {
                for (let layer of Object.keys(Filters)) {
                    props.Filters[layer] = Object.assign({}, Filters[layer]);
                }
            }
            if (Properties && props.Properties) {
                for (let layer of Object.keys(Properties)) {
                    props.Properties[layer] = Object.assign({}, Properties[layer]);
                }
            }
            if (premultStruggle) {
                for (let type of Object.entries(premultStruggle)) {
                    props.escapeChance[type[0]] = Math.round(10000 * ((props.escapeChance[type[0]] || 0) * type[1])) / 10000;
                }
            }
            if (addStruggle) {
                for (let type of Object.entries(addStruggle)) {
                    props.escapeChance[type[0]] = Math.round(10000 * ((props.escapeChance[type[0]] || 0) + type[1])) / 10000;
                }
            }
            KinkyDungeonCloneRestraint(CopyOf + ropePart, idSuffix + ropePart, Object.assign(props, properties));
        }
    }
}
function KDAddHardSlimeVariants(CopyOf, idSuffix, ModelSuffix, tagBase, allTag, removeTag, basePower, properties, extraEvents = [], addStruggle, premultStruggle, Filters, baseWeight = 100, restraintType, Properties) {
    for (let part of Object.entries(KDSlimeParts)) {
        let restraintPart = part[0];
        let origRestraint = KinkyDungeonGetRestraintByName(CopyOf + restraintPart);
        if (origRestraint) {
            let enemyTags = {};
            enemyTags[tagBase + (part[1].enemyTagSuffix || "")] = baseWeight;
            if (part[1].enemyTagSuffix2)
                enemyTags[tagBase + (part[1].enemyTagSuffix2 || "")] = baseWeight;
            enemyTags[tagBase + (part[1].enemyTagSuffix || "") + "Random"] = baseWeight + 8;
            if (part[1].enemyTagExtra) {
                for (let tag in part[1].enemyTagExtra) {
                    enemyTags[tag] = part[1].enemyTagExtra[tag];
                }
            }
            let shrine = [...allTag, ...KDGetRestraintTags(origRestraint)];
            for (let t of removeTag) {
                if (shrine.includes(t))
                    shrine.splice(shrine.indexOf(t), 1);
            }
            let props = {
                Model: origRestraint.Model + ModelSuffix,
                power: origRestraint.power + basePower,
                shrine: shrine,
                enemyTags: enemyTags,
                events: JSON.parse(JSON.stringify([...extraEvents, ...(origRestraint.events || [])])),
                escapeChance: Object.assign({}, origRestraint.escapeChance),
                Filters: origRestraint.Filters ? Object.assign({}, origRestraint.Filters) : {},
                Properties: origRestraint.Properties ? Object.assign({}, origRestraint.Properties) : {},
                cloneTag: tagBase,
            };
            if (Filters && props.Filters) {
                for (let layer of Object.keys(Filters)) {
                    props.Filters[layer] = Object.assign({}, Filters[layer]);
                }
            }
            if (origRestraint.disassembleAs)
                props.disassembleAs = idSuffix + "Raw";
            if (Properties && props.Properties) {
                for (let layer of Object.keys(Properties)) {
                    props.Properties[layer] = Object.assign({}, Properties[layer]);
                }
            }
            if (premultStruggle) {
                for (let type of Object.entries(premultStruggle)) {
                    props.escapeChance[type[0]] = Math.round(10000 * ((props.escapeChance[type[0]] || 0) * type[1])) / 10000;
                }
            }
            if (addStruggle) {
                for (let type of Object.entries(addStruggle)) {
                    props.escapeChance[type[0]] = Math.round(10000 * ((props.escapeChance[type[0]] || 0) + type[1])) / 10000;
                }
            }
            if (restraintType) {
                for (let ev of props.events) {
                    if (ev.type == "slimeSpread")
                        ev.restraint = restraintType;
                }
            }
            KinkyDungeonCloneRestraint(CopyOf + restraintPart, idSuffix + restraintPart, Object.assign(props, properties));
        }
    }
}
function KDGetRestraintTags(restraint) {
    return [...restraint.shrine];
}
function KDItemDataQuery(item, name) {
    if (item?.data) {
        return item.data[name];
    }
    return undefined;
}
function KDItemDataSet(item, name, value) {
    if (!item.data) {
        item.data = {};
    }
    item.data[name] = value;
}
function KDItemFlagQuery(item, name) {
    if (item?.flags) {
        return item.flags[name];
    }
    return undefined;
}
function KDItemFlagSet(item, name, value) {
    if (!item.flags) {
        item.flags = {};
    }
    if (value == -1) {
        item.flags[name] = value;
    }
    else if (value > (item.flags[name] || 0)) {
        item.flags[name] = value;
    }
}
function KDChangeItemName(item, type, name) {
    if (item.name == name)
        return;
    if (KinkyDungeonInventory.get(type).get(item.name)) {
        KinkyDungeonInventory.get(type).set(name, item);
        KinkyDungeonInventory.get(type).delete(item.name);
    }
    item.name = name;
    KDUpdateItemEventCache = true;
}
function KDChangeRestraintType(item, type, name) {
    if (KinkyDungeonRestraintVariants[item.inventoryVariant || item.name]) {
        KinkyDungeonRestraintVariants[item.inventoryVariant || item.name].template = name;
    }
    if ((item.inventoryVariant || !KinkyDungeonRestraintVariants[item.inventoryVariant || item.name])
        && item.inventoryVariant != item.name)
        KDChangeItemName(item, type, name);
}
function KDChangeNPCRestraint(inv, newRes) {
    let rrr = {
        lock: inv.lock,
        name: newRes,
        id: inv.id,
        faction: inv.faction != undefined ? inv.faction : KDPalettePrefsNPC[newRes],
        inventoryVariant: inv.inventoryVariant,
        powerbonus: inv.inventoryVariant ? KinkyDungeonRestraintVariants[inv.inventoryVariant]?.power : inv.powerbonus,
    };
    if (inv.inventoryVariant && KinkyDungeonRestraintVariants[inv.inventoryVariant]) {
        KinkyDungeonRestraintVariants[inv.inventoryVariant].template = newRes;
    }
    if (inv.inventoryVariant) {
        rrr.events = KDGetEventsForRestraint(newRes);
        if (rrr.events && KinkyDungeonRestraintVariants[inv.inventoryVariant]?.events)
            Object.assign(rrr.events, JSON.parse(JSON.stringify(KinkyDungeonRestraintVariants[inv.inventoryVariant]?.events)));
    }
    else if (inv.events) {
        rrr.events = JSON.parse(JSON.stringify(inv.events));
    }
    Object.assign(inv, rrr);
    return rrr;
}
function KDCurseCount(activatedOnly) {
    let restraints = KinkyDungeonAllRestraintDynamic();
    let data = {
        restraints: restraints,
        activatedOnly: activatedOnly,
        count: 0,
    };
    KinkyDungeonSendEvent("curseCount", data);
    return data.count;
}
function KDGetTotalRestraintPower(_player, requireSingleTag, requireAllTags, ignoregold, ignoreShrine, forceIgnoreNonBinding, forceFavorite = false) {
    let power = 0;
    for (let inv of KinkyDungeonAllRestraintDynamic()) {
        let item = inv.item;
        let restraint = KDRestraint(item);
        if (!forceFavorite && !!(KDGameData.ItemPriority[item.inventoryVariant || item.name] > 9))
            continue;
        if (requireSingleTag.length > 0) {
            if (!restraint.shrine || !requireSingleTag.some((tag) => { return restraint.shrine.includes(tag); })) {
                continue;
            }
        }
        if (requireAllTags.length > 0) {
            if (!restraint.shrine || requireAllTags.some((tag) => { return !restraint.shrine.includes(tag); })) {
                continue;
            }
        }
        if (!KinkyDungeonAllowTagMatch(item, ignoregold, ignoreShrine, forceIgnoreNonBinding)) {
            continue;
        }
        power += KinkyDungeonRestraintPower(item);
    }
    return power;
}
function KDGetEscapeSFX(restraint) {
    if (KDRestraint(restraint).sfxEscape)
        return KDRestraint(restraint).sfxEscape;
    if (KDRestraint(restraint).sfxGroup && KDSFXGroups[KDRestraint(restraint).sfxGroup]) {
        return KDSFXGroups[KDRestraint(restraint).sfxGroup].sfxEscape;
    }
    return null;
}
function KDGetRestraintSFX(restraint) {
    if (KDRestraint(restraint).sfx)
        return KDRestraint(restraint).sfx;
    if (KDRestraint(restraint).sfxGroup && KDSFXGroups[KDRestraint(restraint).sfxGroup]) {
        return KDSFXGroups[KDRestraint(restraint).sfxGroup].sfx;
    }
    return null;
}
function KDGetFinishEscapeSFX(restraint) {
    if (KDRestraint(restraint).sfxFinishEscape)
        return KDRestraint(restraint).sfxFinishEscape;
    if (KDRestraint(restraint).sfxGroup && KDSFXGroups[KDRestraint(restraint).sfxGroup]) {
        return KDSFXGroups[KDRestraint(restraint).sfxGroup].sfxFinishEscape;
    }
    return null;
}
function KDGetRemoveSFX(restraint) {
    if (KDRestraint(restraint).sfxRemove)
        return KDRestraint(restraint).sfxRemove;
    if (KDRestraint(restraint).sfxGroup && KDSFXGroups[KDRestraint(restraint).sfxGroup]) {
        return KDSFXGroups[KDRestraint(restraint).sfxGroup].sfxRemove;
    }
    return null;
}
function KDHasRemovableCurse(item, level) {
    if (item.curse && KDCurses[item.curse] && KDCurses[item.curse].level <= level) {
        return true;
    }
    return false;
}
function KDHasRemovableHex(item, level) {
    if (item.events && item.events.some((event) => {
        return event.trigger == "CurseTransform" && KDEventHexModular[event.original] && KDEventHexModular[event.original].level <= level;
    })) {
        return true;
    }
    return false;
}
function KDGetRemovableHex(item, level) {
    if (item.events) {
        return item.events.filter((event) => {
            return KDEventHexModular[event.original] && KDEventHexModular[event.original].level <= level;
        });
    }
    return [];
}
let KDRestraintDebugLog = [];
function KDGetItemName(item, type, variant) {
    let base = TextGet("KinkyDungeonInventoryItem" + item.name);
    switch (type || item.type) {
        case Restraint:
        case LooseRestraint:
            base = TextGet("Restraint" + KDRestraint(item).name);
            if (variant == undefined)
                variant = KinkyDungeonRestraintVariants[item.inventoryVariant || item.name];
            break;
        case Consumable:
            base = TextGet("KinkyDungeonInventoryItem" + KDConsumable(item).name);
            if (variant == undefined)
                variant = KinkyDungeonConsumableVariants[item.inventoryVariant || item.name];
            break;
        case Weapon:
            base = TextGet("KinkyDungeonInventoryItem" + KDWeapon(item).name);
            if (variant == undefined)
                variant = KinkyDungeonWeaponVariants[item.inventoryVariant || item.name];
            break;
    }
    let unidentified = KinkyDungeonStatsChoice.get("UnidentifiedWear") && KDIsUnidentified(item);
    if (unidentified
        && (item.type == LooseRestraint || item.type == Weapon || item.type == Consumable)) {
        return TextGet("KDUnidentified") + base;
    }
    if (variant?.suffix)
        return base + " " + TextGet("KDVarSuff" + variant.suffix);
    if (variant?.prefix)
        return TextGet("KDVarPref" + variant.prefix) + " " + base;
    return base;
}
function KDGetRestraintName(restraint, variant) {
    let base = TextGet("Restraint" + restraint.name);
    if (variant?.suffix)
        return base + " " + TextGet("KDVarSuff" + variant.suffix);
    if (variant?.prefix)
        return TextGet("KDVarPref" + variant.prefix) + " " + base;
    return base;
}
function KDGetConsumableName(consumable, variant) {
    let base = TextGet("KinkyDungeonInventoryItem" + consumable.name);
    if (variant?.suffix)
        return base + " " + TextGet("KDVarSuff" + variant.suffix);
    if (variant?.prefix)
        return TextGet("KDVarPref" + variant.prefix) + " " + base;
    return base;
}
function KDGetWeaponName(weapon, variant) {
    let base = TextGet("KinkyDungeonInventoryItem" + weapon.name);
    if (variant?.suffix)
        return base + " " + TextGet("KDVarSuff" + variant.suffix);
    if (variant?.prefix)
        return TextGet("KDVarPref" + variant.prefix) + " " + base;
    return base;
}
function KDGetItemNameString(name) {
    let base = TextGet((KinkyDungeonGetRestraintByName(name) ? "Restraint" : "KinkyDungeonInventoryItem") + name);
    let variant = KinkyDungeonRestraintVariants[name] || KinkyDungeonWeaponVariants[name] || KinkyDungeonConsumableVariants[name];
    if (variant) {
        base = TextGet((KinkyDungeonGetRestraintByName(variant.template) ? "Restraint" : "KinkyDungeonInventoryItem") + variant.template);
    }
    let unidentified = KinkyDungeonStatsChoice.get("UnidentifiedWear") && KDIsUnidentifiedString(name);
    if (unidentified) {
        return TextGet("KDUnidentified") + base;
    }
    if (variant?.suffix)
        return base + " " + TextGet("KDVarSuff" + variant.suffix);
    if (variant?.prefix)
        return TextGet("KDVarPref" + variant.prefix) + " " + base;
    return base;
}
function KDGetEventsForRestraint(name) {
    if (!KDRest(name))
        return [];
    if (KinkyDungeonRestraintVariants[name])
        return Object.assign([], KinkyDungeonRestraintVariants[name].events);
    return Object.assign([], KDRest(name).events || []);
}
function KDDynamicLinkList(item, includeItem) {
    let ret = [];
    if (includeItem && item)
        ret.push(item);
    if (item && item.dynamicLink) {
        let link = item.dynamicLink;
        while (link) {
            ret.push(link);
            link = link.dynamicLink;
        }
    }
    return ret;
}
function KDDynamicLinkListSurface(item) {
    let stack = [];
    if (item && item.dynamicLink) {
        let last = item;
        let link = item.dynamicLink;
        while (link) {
            stack.push({ item: link, host: last });
            last = link;
            link = link.dynamicLink;
        }
    }
    let ret = [item];
    let inaccess = false;
    let TagsSoFar = {};
    for (let i = 0; i < stack.length; i++) {
        let tuple = stack[i];
        let inv = tuple.item;
        let host = tuple.host;
        if (!inaccess && KDRestraint(host).inaccessible)
            inaccess = true;
        if (!inaccess && KDRestraint(inv).alwaysInaccessible)
            inaccess = true;
        if (KDRestraint(inv).alwaysAccessible || (!inaccess
            && (!KDRestraint(inv).renderExcept
                || !KDRestraint(inv).renderExcept.some((tag) => {
                    return TagsSoFar[tag];
                }))
            && (KDRestraint(host).UnderlinkedAlwaysRender
                || KDRestraint(host).accessible
                || KDRestraint(inv).alwaysRender
                || (KDRestraint(inv).renderWhenLinked
                    && KDRestraint(host).shrine && KDRestraint(inv).renderWhenLinked.some((link) => { return KDRestraint(host).shrine.includes(link); }))))) {
            if (KDRestraint(inv).shrine) {
                for (let tag of KDRestraint(inv).shrine) {
                    TagsSoFar[tag] = true;
                }
            }
            ret.push(inv);
        }
    }
    return ret;
}
function KDLinkSize(restraint, index) {
    if (index != undefined && restraint.linkSizes) {
        return restraint.linkSizes[index];
    }
    return restraint.linkSize ? restraint.linkSize : 1;
}
function KDLinkCategorySize(item, linkCategory, ignoreItem, power) {
    let total = 0;
    let stack = [item];
    if (item && item.dynamicLink) {
        let link = item.dynamicLink;
        while (link) {
            stack.push(link);
            link = link.dynamicLink;
        }
    }
    for (let inv of stack) {
        if (ignoreItem?.id != inv.id) {
            if (KDRestraint(inv).linkCategory == linkCategory) {
                if (!power || KinkyDungeonRestraintPower(inv, true, undefined) >= power)
                    total += KDLinkSize(KDRestraint(inv));
            }
            else if (KDRestraint(inv).linkCategories && KDRestraint(inv).linkCategories.includes(linkCategory)) {
                if (!power || KinkyDungeonRestraintPower(inv, true, undefined) >= power)
                    total += KDLinkSize(KDRestraint(inv), KDRestraint(inv).linkCategories.indexOf(linkCategory));
            }
        }
    }
    return total;
}
function KDGetRestraintHost(item) {
    let host = KinkyDungeonGetRestraintItem(KDRestraint(item)?.Group);
    let link = item.dynamicLink;
    while (link) {
        if (link.id == item.id)
            return host;
        host = link;
        link = link.dynamicLink;
    }
    return host;
}
function KDLinkItemEvent(e, item, data) {
    let added = false;
    if (data.restraintsAdded) {
        for (let r of data.restraintsAdded) {
            if (r.r.name === item.name) {
                added = true;
                break;
            }
        }
    }
    if (!added && (KDCanAddRestraint(KinkyDungeonGetRestraintByName(KDRestraint(item)?.Link), true, undefined, false, undefined, true, true))) {
        let subMult = 1;
        let chance = e.chance ? e.chance : 1.0;
        if (e.subMult !== undefined) {
            let rep = (KinkyDungeonGoddessRep.Ghost + 50) / 100;
            subMult = 1.0 + e.subMult * rep;
        }
        if (e.tags?.includes("lowwill") && KinkyDungeonStatWill < 0.1)
            chance = 1.0;
        if (item && KDRestraint(item).Link && (KDRandom() < chance * subMult) && (!e.noLeash || KDGameData.KinkyDungeonLeashedPlayer < 1)) {
            let newRestraint = KinkyDungeonGetRestraintByName(KDRestraint(item).Link);
            if (KinkyDungeonAddRestraintIfWeaker(newRestraint, item.tightness, true, "", false, undefined, undefined, item.faction, true)) {
                if (KDSoundEnabled() && e.sfx)
                    KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + e.sfx + ".ogg");
            }
        }
    }
}
function KDGetRestriction() {
    let data = {
        restriction: 0
    };
    for (let inv of KinkyDungeonAllRestraintDynamic()) {
        let restraint = KDRestraint(inv.item);
        if (restraint) {
            if (restraint.restriction)
                data.restriction += restraint.restriction;
            if (restraint.blockfeet
                || restraint.bindarms
                || restraint.hobble
                || restraint.freeze)
                data.restriction += 2;
            else if (restraint.bindhands
                || restraint.blindfold
                || restraint.gag
                || restraint.restricthands)
                data.restriction += 1;
        }
    }
    KinkyDungeonSendEvent("restriction", data);
    return data.restriction;
}
function KDAlwaysKeep(item, Remover) {
    let rest = KDRestraint(item);
    let inventoryAs = item.inventoryVariant || (Remover?.player ? rest.inventoryAsSelf : rest.inventoryAs);
    return rest.enchanted
        || rest.armor
        || rest.alwaysKeep
        || (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs] && !KinkyDungeonRestraintVariants[inventoryAs].noKeep);
}
function KDResortRestraints(Group, addedItem, bypass, securityEnemy) {
    let item = KinkyDungeonGetRestraintItem(Group);
    if (item) {
        let pri = (inv) => {
            return ((KDRestraint(inv).linkPriority * 1000) || KinkyDungeonRestraintPower(inv, true) || 0);
        };
        if (!addedItem) {
            let tree = KDDynamicLinkList(item, true);
            let host = tree[0];
            let temp = null;
            let n = tree.length;
            let swapped = false;
            for (let i = 0; i < n - 1; i++) {
                for (let j = 0; j < n - i - 1; j++) {
                    tree[j + 1].linkCache = undefined;
                    if (pri(tree[j]) < pri(tree[j + 1])) {
                        if (KDCanLinkUnder(tree[j + 1], KDRestraint(tree[j]), bypass, false, securityEnemy, tree[j].lock, KDGetCurse(tree[j]), tree[j])) {
                            tree[j].dynamicLink = tree[j + 1].dynamicLink;
                            tree[j + 1].dynamicLink = tree[j];
                            temp = tree[j];
                            tree[j] = tree[j + 1];
                            tree[j + 1] = temp;
                            swapped = true;
                        }
                    }
                }
                if (!swapped) {
                    break;
                }
            }
            host = tree[0];
            for (let iii = 0; iii < n; iii++) {
                if (iii + 1 < n)
                    tree[iii].dynamicLink = tree[iii + 1];
                else
                    tree[iii].dynamicLink = undefined;
            }
            KinkyDungeonInventoryRemove(item);
            KinkyDungeonInventoryAdd(host);
        }
        else if (addedItem) {
            if (bypass) {
            }
            else {
            }
        }
        else {
        }
    }
}
function KDLockoutChance(player) {
    let data = {
        chance: 0,
        bonus: 0,
        player: player,
    };
    if (player.player) {
        data.chance = KDGameData.LockoutChance || 0;
        KinkyDungeonSendEvent("calcLockout", data);
        data.chance += data.bonus;
        return data.chance;
    }
    return 1.0;
}
function KDLockoutGain(player, data, base = 20) {
    data.lockoutgain = 0.75 * base * 0.01 + 0.01 * Math.round(KDRandom() * 0.5 * base);
    if (player.player) {
        KinkyDungeonSendEvent("calcLockoutGain", data);
    }
}
function KDMaxCutDepth(threshold, cutBonus, origEscapeChance, origLimitChance, cutVulnerability) {
    let res = Math.min(1.4 * threshold, Math.max(0, Math.min(1.1, 2.0 * (0.25 + cutBonus + origEscapeChance -
        Math.max(0, origLimitChance)))));
    if (res > 0 && cutVulnerability != undefined) {
        res *= cutVulnerability;
    }
    return res;
}
function KDMaxStrugglePct(threshold, escapeChance, limitChance) {
    if (limitChance > escapeChance) {
        return Math.min(threshold, 0.9 * (escapeChance / limitChance));
    }
    else if (escapeChance > 0) {
        return 1.0;
    }
    else
        return 0.0;
}
function KDGetNecklaceGagType(player) {
    if (player.player) {
        if (KinkyDungeonGetRestraintItem("ItemNeck")) {
            let list = KDDynamicLinkList(KinkyDungeonGetRestraintItem("ItemNeck"), true);
            for (let item of list) {
                if (KDRestraint(item)?.necklaceGagType)
                    return KDRestraint(item)?.necklaceGagType;
            }
        }
    }
    else if (KDGameData.NPCRestraints[player.id + ""]) {
        let items = KDGetNPCRestraints(player.id);
        for (let slot of NPCBindingNeckSlots) {
            if (items[slot]) {
                if (KDRestraint(items[slot])?.necklaceGagType)
                    return KDRestraint(items[slot])?.necklaceGagType;
            }
        }
    }
    return "";
}
function KDAddFurnitureRestraintSet(entity, restraintSet, faction, power = 5) {
    let count = 0;
    if (entity.player) {
        for (let r of Object.entries(restraintSet)) {
            for (let i = 0; i < r[1]; i++) {
                let rest = KDGetRestraintWithVariants({ tags: [r[0]] }, KDGetEffLevel() + power, KDCurrIndex(), !!KinkyDungeonStatsChoice.has("MagicHands"), undefined, false, false, !KinkyDungeonStatsChoice.has("TightRestraints"), undefined, false, undefined, undefined, undefined, true);
                if (rest) {
                    if (KinkyDungeonAddRestraintIfWeaker(rest.r, power, !!KinkyDungeonStatsChoice.has("MagicHands"), undefined, false, false, undefined, faction, true, undefined, undefined, true, undefined, undefined, undefined, rest.v))
                        count++;
                }
            }
        }
    }
    else {
        for (let r of Object.entries(restraintSet)) {
            for (let i = 0; i < r[1]; i++) {
                count += KDBindEnemyWithTags(entity.id, [r[0]], Math.max(entity.Enemy.maxhp * 3, 30), power, true, undefined, true, undefined, undefined, faction, 0).length;
                KDSetToExpectedBondage(entity, 1);
            }
        }
    }
    return count;
}
function KDGetEquipDuration(restraint, player) {
    let bonus = 0;
    if (KinkyDungeonIsHandsBound(true, !player.player))
        bonus += 2;
    if (KinkyDungeonIsArmsBound(true, !player.player))
        bonus += 2;
    return bonus + (KinkyDungeonGetRestraintByName(restraint)?.protection ? 4 : 1);
}
function KDDoEquipDelayed(data, player) {
    if (!player?.player)
        return "";
    KinkyDungeonSetFlag("SelfBondage", 1);
    let success = KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(data.name), 0, true, "", KinkyDungeonGetRestraintItem(data.Group) && !KinkyDungeonLinkableAndStricter(KinkyDungeonGetRestraintByName(data.currentItem), KinkyDungeonGetRestraintByName(data.name)), false, data.events, data.faction, KDDebugLink, data.curse, undefined, undefined, data.inventoryVariant, undefined, undefined, undefined, undefined, true);
    if (success) {
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Unlock.ogg");
        let loose = KinkyDungeonInventoryGetLoose(data.name);
        if (loose) {
            if (!(loose.quantity > 1)) {
                KinkyDungeonInventoryRemove(loose);
            }
            else {
                loose.quantity -= 1;
            }
        }
        let customEq = KDRestraint(loose).customEquip || "";
        let msg = "KinkyDungeonSelfBondage" + customEq;
        if (!customEq) {
            msg = KDCustomEquipMsg(loose) || msg;
        }
        return msg;
    }
    else {
        KinkyDungeonSendTextMessage(10, TextGet("KDCantEquip").replace("RestraintName", KDGetItemNameString(data.name)), "yellow", 1);
        return "KDCantEquip";
    }
}
function KDDoEquipGenericDelayed(data, player) {
    if (!player?.player)
        return "";
    KinkyDungeonSetFlag("SelfBondage", 1);
    let success = KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(data.name), 0, true, "", KinkyDungeonGetRestraintItem(data.Group) && !KinkyDungeonLinkableAndStricter(KinkyDungeonGetRestraintByName(data.currentItem), KinkyDungeonGetRestraintByName(data.name)), false, data.events, data.faction, KDDebugLink, data.curse, undefined, undefined, data.inventoryVariant, undefined, undefined, undefined, undefined, true);
    if (success) {
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Unlock.ogg");
        let loose = KinkyDungeonInventoryGetLoose(data.item.name);
        if (loose) {
            if (!(loose.quantity > 1)) {
                KinkyDungeonInventoryRemove(loose);
            }
            else {
                loose.quantity -= data.quantity;
            }
        }
        let customEq = KDRestraint(loose).customEquip || "";
        let msg = "KinkyDungeonSelfBondage" + customEq;
        if (!customEq) {
            if (KDRestraint(loose).Group == "ItemVulvaPiercings" || KDRestraint(loose).Group == "ItemVulva" || KDRestraint(loose).Group == "ItemButt") {
                if (KinkyDungeonIsChaste(false)) {
                    msg = "KinkyDungeonSelfBondagePlug";
                }
            }
            else if (KDRestraint(loose).Group == "Item") {
                if (KinkyDungeonIsChaste(true)) {
                    msg = "KinkyDungeonSelfBondageNipple";
                }
            }
            else if (KDRestraint(loose).enchanted) {
                msg = "KinkyDungeonSelfBondageEnchanted";
            }
        }
        KinkyDungeonSendTextMessage(10, TextGet(msg).replace("RestraintName", TextGet("Restraint" + KDRestraint(loose).name)), "yellow", 1);
        return msg;
    }
    else {
        KinkyDungeonSendTextMessage(10, TextGet("KDCantEquip").replace("RestraintName", KDGetItemNameString(data.name)), "yellow", 1);
        return "KDCantEquip";
    }
}
function KDGetEvents(item) {
    if (item.events)
        return item.events;
    if (KinkyDungeonRestraintVariants[item.inventoryVariant || item.name])
        return KinkyDungeonRestraintVariants[item.inventoryVariant || item.name].events;
    if (KinkyDungeonWeaponVariants[item.inventoryVariant || item.name])
        return KinkyDungeonWeaponVariants[item.inventoryVariant || item.name].events;
    if (KinkyDungeonConsumableVariants[item.inventoryVariant || item.name])
        return KinkyDungeonConsumableVariants[item.inventoryVariant || item.name].events;
    if (KDRestraint(item)?.events)
        return KDRestraint(item)?.events;
    if (KDWeapon(item)?.events)
        return KDWeapon(item)?.events;
    if (KDOutfit(item)?.events)
        return KDOutfit(item)?.events;
}
function KDResetPreferenceFlags() {
    KinkyDungeonSetFlag("prefer_armbinder", 0);
    KinkyDungeonSetFlag("prefer_petsuit", 0);
    KinkyDungeonSetFlag("prefer_boxbinder", 0);
    KinkyDungeonSetFlag("prefer_jacket", 0);
    KinkyDungeonSetFlag("prefer_yoke", 0);
}
function KDGetPreferenceFlags() {
    let select = [];
    if (!KinkyDungeonStatsChoice.get("NoPet"))
        select.push("prefer_petsuit");
    if (!KinkyDungeonStatsChoice.get("Less_Armbinders"))
        select.push("prefer_armbinder");
    if (!KinkyDungeonStatsChoice.get("Less_Boxbinders"))
        select.push("prefer_boxbinder");
    if (!KinkyDungeonStatsChoice.get("Less_Jackets"))
        select.push("prefer_jacket");
    if (!KinkyDungeonStatsChoice.get("Less_Yokes"))
        select.push("prefer_yoke");
    if (KinkyDungeonStatsChoice.get("More_Petsuits"))
        select.push("prefer_petsuit");
    if (KinkyDungeonStatsChoice.get("More_Armbinders"))
        select.push("prefer_armbinder");
    if (KinkyDungeonStatsChoice.get("More_Boxbinders"))
        select.push("prefer_boxbinder");
    if (KinkyDungeonStatsChoice.get("More_Jackets"))
        select.push("prefer_jacket");
    if (KinkyDungeonStatsChoice.get("More_Yokes"))
        select.push("prefer_yoke");
    return select;
}
function KDUpdatePreferenceFlags() {
    KDResetPreferenceFlags();
    let select = KDGetPreferenceFlags();
    let selected = select.length > 0 ? select[Math.floor(KDRandom() * select.length)] : "";
    if (selected) {
        KinkyDungeonSetFlag(selected, -1);
    }
}
function KDDefaultItemPalette(name, variantName) {
    let variant = KinkyDungeonRestraintVariants[variantName];
    if (variant) {
        return KDPalettePrefsEnchanted[name];
    }
    else {
        return KDPalettePrefs[name];
    }
}
function KDDefaultNPCItemPalette(name) {
    return KDPalettePrefsNPC[name];
}
function KDGetBaseLimitChance(StruggleType) {
    if (StruggleType == "Struggle")
        return 0.05;
    return 0.05;
}
function KDSwapEvents(events, oldRestraint, newRestraint) {
    if (!events)
        return undefined;
    for (let ee of (KDRestraint(oldRestraint)?.events || [])) {
        let str = JSON.stringify(ee);
        let index = events.findIndex((eee) => {
            return str == JSON.stringify(eee);
        });
        if (index >= 0) {
            events.splice(index, 1);
        }
    }
    if (KDRestraint(newRestraint)?.events) {
        for (let i = KDRestraint(newRestraint).events.length - 1; i >= 0; i--) {
            events.unshift(KDRestraint(newRestraint).events[i]);
        }
    }
    return events;
}
function KDTest_ListRestraintsWithFeetLinked() {
    let res = [];
    for (let restraint of Object.values(KinkyDungeonRestraints)) {
        let model = ModelDefs[restraint.Model];
        if (model) {
            if (KDLEGBINDTAGS.some(tag => { return model.AddPose?.includes(tag) || restraint.shrine?.includes(tag); })) {
                if (!["FeetLinked", "LegBind"].some(tag => { return restraint.addTag?.includes(tag) || restraint.shrine?.includes(tag); }))
                    res.push(restraint.name);
                continue;
            }
        }
    }
    console.log(res);
}
let KDRestraintParticleLifetime = 1700;
let KDRestraintParticleLifetimeMult = 0.6;
let KDLockParticleLifetime = 1000;
let KDNPCRestraintParticleLifetime = 1000;
let KDNPCLockParticleLifetime = 800;
let KDRestraintParticleScale = 3;
let KDLockParticleScale = 4;
function KDDoRestraintParticlePlayer(restraint) {
    if (!KDToggles.ParticlesRestrain)
        return;
    let Ystart = PIXIHeight / 2;
    let Xstart = PIXIWidth / 2;
    let Yend = 0;
    let Xend = 500 / 2;
    if (!restraint)
        return;
    let group = restraint.Group;
    Yend += 1000 * KinkyDungeonStruggleGroupsBase.indexOf(group) / KinkyDungeonStruggleGroupsBase.length;
    let preview = KDGetRestraintPreviewImage(restraint);
    let lifetime = KDRestraintParticleLifetime;
    KDAddParticle(Xstart, Ystart, preview, undefined, {
        time: 0,
        lifetime: lifetime,
        vx: (Xend - Xstart) / lifetime,
        vy: (Yend - Ystart) / lifetime,
        zIndex: 1000,
        phase: 0,
        scale: KDRestraintParticleScale,
        scale_delta: -(KDRestraintParticleScale - 0.25) / lifetime,
        fadeEase: "invcos",
        rotation: 0,
        width: 72,
        height: 72,
    });
}
function KDDoRestraintParticle(entity, restraint) {
    if (!entity)
        return;
    if (entity?.player)
        KDDoRestraintParticlePlayer(restraint);
    let lifetime = KDNPCRestraintParticleLifetime;
    let data = {
        time: 0,
        lifetime: lifetime,
        vx: 0,
        vy: -25 / lifetime,
        zIndex: 10,
        phase: 0,
        scale: 0.5,
        scale_delta: 0.7 / lifetime,
        fadeEase: "invcos",
        rotation: 0,
        width: 72,
        height: 72,
    };
    let preview = KDGetRestraintPreviewImage(restraint);
    data['camX'] = KinkyDungeonCamX;
    data['camY'] = KinkyDungeonCamY;
    KDAddParticle((entity.x - data.camX + 0.5) * KinkyDungeonGridSizeDisplay, (entity.y - data.camY + 0.1) * KinkyDungeonGridSizeDisplay, preview, undefined, data);
}
function KDDoLockParticlePlayer(lock, restraint, particleDelay = 0) {
    if (!KDToggles.ParticlesRestrain)
        return;
    if (!lock)
        return;
    let Ystart = PIXIHeight / 2 - 500;
    let Xstart = 500 / 3;
    if (!restraint)
        return;
    let group = restraint.Group;
    Ystart += 1000 * KinkyDungeonStruggleGroupsBase.indexOf(group) / KinkyDungeonStruggleGroupsBase.length;
    let preview = KDGetLockImageRoot(lock);
    let lifetime = KDLockParticleLifetime;
    KDAddParticle(Xstart, Ystart, preview, undefined, {
        time: -particleDelay,
        lifetime: lifetime,
        vx: 0,
        vy: 0,
        zIndex: 1000,
        phase: 0,
        scale: 0.1,
        scale_delta: (KDLockParticleScale - 0.1) / lifetime,
        fadeEase: "invcos",
        rotation: 0,
    });
}
function KDFindRestraint(player, item, filter = Restraint) {
    if (!item)
        return null;
    let group = KDRestraint(item)?.Group;
    if (filter == Restraint) {
        if (KinkyDungeonGetRestraintItem(group)) {
            let tree = KDDynamicLinkList(KinkyDungeonGetRestraintItem(group), true);
            for (let it of tree) {
                if (it.id == item.id && it.name == item.name)
                    return item;
            }
        }
    }
    else {
        return KinkyDungeonInventoryGetLoose(item.name);
    }
    return null;
}
function KDCustomEquipMsg(item) {
    let msg = "";
    if (KDRestraint(item).Group == "ItemVulvaPiercings" || KDRestraint(item).Group == "ItemVulva" || KDRestraint(item).Group == "ItemButt") {
        if (KinkyDungeonIsChaste(false)) {
            msg = "KinkyDungeonSelfBondagePlug";
        }
    }
    else if (KDRestraint(item).Group == "Item") {
        if (KinkyDungeonIsChaste(true)) {
            msg = "KinkyDungeonSelfBondageNipple";
        }
    }
    else if (KDRestraint(item).enchanted) {
        msg = "KinkyDungeonSelfBondageEnchanted";
    }
    else if (KDRestraint(item).armor) {
        msg = "KinkyDungeonSelfBondageArmor";
    }
    return msg;
}
function KDCustomEquipMsgRestraint(restraint) {
    let msg = "";
    if (restraint.Group == "ItemVulvaPiercings" || restraint.Group == "ItemVulva" || restraint.Group == "ItemButt") {
        if (KinkyDungeonIsChaste(false)) {
            msg = "KinkyDungeonSelfBondagePlug";
        }
    }
    else if (restraint.Group == "Item") {
        if (KinkyDungeonIsChaste(true)) {
            msg = "KinkyDungeonSelfBondageNipple";
        }
    }
    else if (restraint.enchanted) {
        msg = "KinkyDungeonSelfBondageEnchanted";
    }
    else if (restraint.armor) {
        msg = "KinkyDungeonSelfBondageArmor";
    }
    return msg;
}
//# sourceMappingURL=KinkyDungeonRestraints.js.map