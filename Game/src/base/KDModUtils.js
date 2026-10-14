'use strict';
var KDModifierEnum;
(function (KDModifierEnum) {
    KDModifierEnum[KDModifierEnum["restraint"] = 0] = "restraint";
    KDModifierEnum[KDModifierEnum["looserestraint"] = 0] = "looserestraint";
    KDModifierEnum[KDModifierEnum["weapon"] = 1] = "weapon";
    KDModifierEnum[KDModifierEnum["consumable"] = 2] = "consumable";
})(KDModifierEnum || (KDModifierEnum = {}));
;
const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj));
const defaultRestraint = {
    name: undefined,
    Group: undefined,
    inventory: true,
    power: 0,
    weight: 0,
    minLevel: 0,
    allFloors: true,
    escapeChance: {
        "Struggle": 10,
        "Cut": 10,
        "Remove": 10
    },
    events: [],
    enemyTags: {},
    playerTags: {},
    shrine: [],
};
function KinkyDungeonCreateRestraint(props, displayName, flavorText, functionText) {
    if (!props.name || !props.Group) {
        throw new Error('name, Group props must be provided.');
    }
    const restraint = ({
        ...cloneDeep(defaultRestraint),
        ...props
    });
    KinkyDungeonRestraints.push(restraint);
    if (displayName) {
        KinkyDungeonAddRestraintText(props.name, displayName, flavorText, functionText);
    }
    return restraint;
}
let KDCursedVariantsCreated = {};
function KinkyDungeonAddCursedVariants(Restraint, Variants) {
    for (let v of Variants) {
        if (KDCursedVars[v]) {
            KinkyDungeonCloneRestraint(Restraint.name, Restraint.name + v, KDCursedVars[v].variant(Restraint, Restraint.name + v));
            if (!KDCursedVariantsCreated[Restraint.name])
                KDCursedVariantsCreated[Restraint.name] = {};
            KDCursedVariantsCreated[Restraint.name][v] = KDCursedVars[v].level;
        }
    }
}
function KinkyDungeonGetCurses(Restraint, includeOrig, minLevel, maxLevel) {
    if (KDCursedVariantsCreated[Restraint]) {
        let keys = Object.keys(KDCursedVariantsCreated[Restraint]).filter((key) => {
            return (!minLevel || KDCursedVariantsCreated[Restraint][key] >= minLevel)
                && (!maxLevel || KDCursedVariantsCreated[Restraint][key] < maxLevel);
        }).map((element) => { return Restraint + element; });
        if (includeOrig)
            keys.push(Restraint);
        return keys;
    }
    return [];
}
function KinkyDungeonGetVariantEffectByList(List, Type, minLevel, maxLevel) {
    let temp = [];
    if (typeof List === "string") {
        List = [List];
    }
    for (let l of List) {
        if (KDModifierEffectVariantList[l]) {
            let keys = KDModifierEffectVariantList[l].filter((key) => {
                return (!minLevel || KDModifierEffects[key].types[Type]?.level >= minLevel)
                    && (!maxLevel || KDModifierEffects[key].types[Type]?.level < maxLevel);
            }).map((element) => { return element; });
            temp.push(...keys);
        }
    }
    return temp;
}
function KinkyDungeonGetVariantEffectByListWeighted(List, Type, item, data, minLevel, maxLevel, positive) {
    let list = KinkyDungeonGetVariantEffectByList(List, Type, minLevel, maxLevel);
    let ret = {};
    for (let obj of list) {
        if (KDModifierEffects[obj].types[Type]?.filter(item, positive, data))
            ret[obj] = KDModifierEffects[obj].types[Type].weight(item, positive, data);
    }
    return ret;
}
function KinkyDungeonGetVariantConditionByList(List, Type, minLevel, maxLevel) {
    let temp = [];
    if (typeof List === "string") {
        List = [List];
    }
    for (let l of List) {
        if (KDModifierConditionVariantList[l]) {
            let keys = KDModifierConditionVariantList[l].filter((key) => {
                return (!minLevel || KDModifierConditions[key].types[Type]?.level >= minLevel)
                    && (!maxLevel || KDModifierConditions[key].types[Type]?.level < maxLevel);
            }).map((element) => { return element; });
            temp.push(...keys);
        }
    }
    return temp;
}
function KinkyDungeonGetVariantConditionByListWeighted(List, Type, item, data, minLevel, maxLevel, effect_positive, effect_neutral, effect_negative) {
    let list = KinkyDungeonGetVariantConditionByList(List, Type, minLevel, maxLevel);
    let ret = {};
    for (let obj of list) {
        if (KDModifierConditions[obj].types[Type]?.filter(item, effect_positive, effect_neutral, effect_negative, data))
            ret[obj] = KDModifierConditions[obj].types[Type].weight(item, effect_positive, effect_neutral, effect_negative, data);
    }
    return ret;
}
function KDGenerateEffectConditionPair(ListEffect, ListCondition, Type, item, minLevel, maxLevel, pos, data) {
    let effect = KDGetByWeight(KinkyDungeonGetVariantEffectByListWeighted(ListEffect, Type, item, data, minLevel, maxLevel, pos));
    let epo = [];
    let enu = [];
    let eng = [];
    if (KDModifierEffects[effect]) {
        if (pos == PosNeutNeg.positive)
            epo.push(KDModifierEffects[effect]);
        if (pos == PosNeutNeg.neutral)
            enu.push(KDModifierEffects[effect]);
        if (pos == PosNeutNeg.negative)
            eng.push(KDModifierEffects[effect]);
    }
    else
        return null;
    if (KDModifierEffects[effect].types[Type]?.onSelect)
        KDModifierEffects[effect].types[Type].onSelect(item, data);
    let condition = KDGetByWeight(KinkyDungeonGetVariantConditionByListWeighted(ListCondition, Type, item, data, minLevel, maxLevel, epo, enu, eng));
    if (condition)
        return KDModifierConditions[condition].types[Type].events(item, epo, enu, eng, data);
    return null;
}
function KinkyDungeonGetHexByList(List, includeOrig, minLevel, maxLevel) {
    let temp = [];
    if (typeof List === "string") {
        List = [List];
    }
    for (let l of List) {
        if (KDHexVariantList[l]) {
            let keys = KDHexVariantList[l].filter((key) => {
                return (!minLevel || KDEventHexModular[key].level >= minLevel)
                    && (!maxLevel || KDEventHexModular[key].level < maxLevel);
            }).map((element) => { return element; });
            temp.push(...keys);
        }
    }
    if (includeOrig)
        temp.push("");
    return temp;
}
function KinkyDungeonGetHexByListWeighted(List, item, includeOrig, minLevel, maxLevel, allHex) {
    let list = KinkyDungeonGetHexByList(List, includeOrig, minLevel, maxLevel);
    let ret = {};
    for (let obj of list) {
        ret[obj] = KDEventHexModular[obj].weight(item, allHex, { item: item });
    }
    return ret;
}
function KinkyDungeonGetEnchantmentsByList(List, Type, includeOrig, minLevel, maxLevel) {
    let temp = [];
    if (typeof List === "string") {
        List = [List];
    }
    for (let l of List) {
        if (KDEnchantVariantList[l]) {
            let keys = KDEnchantVariantList[l].filter((key) => {
                return (!minLevel || KDEventEnchantmentModular[key].types[Type].level >= minLevel)
                    && (!maxLevel || KDEventEnchantmentModular[key].types[Type].level < maxLevel);
            }).map((element) => { return element; });
            temp.push(...keys);
        }
    }
    if (includeOrig)
        temp.push("");
    return temp;
}
function KinkyDungeonGetEnchantmentsByListWeighted(List, Type, item, includeOrig, minLevel, maxLevel, allEnchant) {
    let list = KinkyDungeonGetEnchantmentsByList(List, Type, includeOrig, minLevel, maxLevel);
    let ret = {};
    for (let obj of list) {
        if (KDEventEnchantmentModular[obj].types[Type]?.filter(item, allEnchant, { item: item }))
            ret[obj] = KDEventEnchantmentModular[obj].types[Type].weight(item, allEnchant, { item: item });
    }
    return ret;
}
function KinkyDungeonGetWeaponsByList(List, includeOrig, minRarity, maxRarity) {
    let temp = [];
    if (typeof List === "string") {
        List = [List];
    }
    for (let l of List) {
        if (KDWeaponLootList[l]) {
            let keys = Object.keys(KDWeaponLootList[l]).filter((key) => {
                return (!minRarity || KinkyDungeonWeapons[key]?.rarity >= minRarity)
                    && (!maxRarity || KinkyDungeonWeapons[key]?.rarity < maxRarity);
            }).map((element) => { return element; });
            temp.push(...keys);
        }
    }
    if (includeOrig)
        temp.push("");
    return temp;
}
function KinkyDungeonGetWeaponsByListWeighted(WeaponList, includeOrig, minRarity, maxRarity) {
    let list = KinkyDungeonGetWeaponsByList(WeaponList, includeOrig, minRarity, maxRarity);
    let ret = {};
    for (let obj of list) {
        if (obj)
            ret[obj] = KDWeaponLootList[WeaponList][obj];
        else
            ret[obj] = 1;
    }
    return ret;
}
function KinkyDungeonGetCurseByList(List, includeOrig, minLevel, maxLevel) {
    let temp = [];
    if (typeof List === "string") {
        List = [List];
    }
    for (let l of List) {
        if (KDCurseUnlockList[l]) {
            let keys = KDCurseUnlockList[l].filter((key) => {
                return (!minLevel || KDCurses[key].level >= minLevel)
                    && (!maxLevel || KDCurses[key].level < maxLevel);
            }).map((element) => { return element; });
            temp.push(...keys);
        }
    }
    if (includeOrig)
        temp.push("");
    return temp;
}
function KinkyDungeonGetCurseByListWeighted(List, item, includeOrig, minLevel, maxLevel) {
    let list = KinkyDungeonGetCurseByList(List, includeOrig, minLevel, maxLevel);
    let ret = {};
    for (let obj of list) {
        ret[obj] = KDCurses[obj].weight(item);
    }
    return ret;
}
function KinkyDungeonCloneRestraint(clonedName, newName, props) {
    const existingRestraint = KinkyDungeonRestraints.find(restraint => restraint.name === clonedName);
    if (!existingRestraint) {
        throw new Error(`No restraint named ${clonedName}.`);
    }
    const newRestraint = ({
        ...cloneDeep(existingRestraint),
        name: newName
    });
    Object.assign(newRestraint, props);
    KinkyDungeonRestraints.push(newRestraint);
    return newRestraint;
}
function KinkyDungeonAddRestraintText(name, displayName, flavorText, functionText) {
    const baseKey = `Restraint${name}`;
    addTextKey(baseKey, displayName);
    addTextKey(`${baseKey}Desc`, flavorText);
    addTextKey(`${baseKey}Desc2`, functionText);
}
function KinkyDungeonDupeRestraintText(restraint, newRestraint) {
    const oldKey = `Restraint${restraint}`;
    const baseKey = `Restraint${newRestraint}`;
    addTextKey(baseKey, TextGetKD(oldKey));
    addTextKey(`${baseKey}Desc`, TextGetKD(`${oldKey}Desc`));
    addTextKey(`${baseKey}Desc2`, TextGetKD(`${oldKey}Desc2`));
}
function HasPerk(perk) {
    return KinkyDungeonStatsChoice.has(perk);
}
function KDPlayer() {
    return KinkyDungeonPlayerEntity;
}
//# sourceMappingURL=KDModUtils.js.map