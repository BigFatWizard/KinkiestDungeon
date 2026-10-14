'use strict';
let KDELEMENTS = [
    "fire",
    "soap",
    "crush",
    "stun",
    "electric",
    "ice",
];
let KDSPELLELEMENTS = [
    "fire",
    "water",
    "earth",
    "air",
    "electric",
    "ice",
];
let KDSPELLELEMENTSMAP = {
    "fire": "fire",
    "water": "soap",
    "earth": "crush",
    "air": "stun",
    "electric": "electric",
    "ice": "ice",
};
let KDELEMENTSMAP = {
    "fire": "fire",
    "soap": "water",
    "crush": "earth",
    "stun": "air",
    "electric": "electric",
    "ice": "ice",
};
let KDModifierEffectVariantList = {
    "Common": [
        "SpellDamageBuff",
        "ElementalBuff",
        "ElementalResist",
    ],
};
let KDModifierConditionVariantList = {
    "Common": [
        "OnTease",
        "OnElementalSpell",
    ],
};
let KDModifierEffects = {
    SpellDamageBuff: {
        tags: ['buff', 'positive', 'temp', 'magic'],
        types: {
            2: null,
            1: null,
            0: {
                level: 6,
                filter: (_item, _positive, _data) => {
                    return true;
                },
                weight: (_item, _positive, _data) => {
                    return 10;
                },
                events: (item, _positive, data) => {
                    let power = Math.max(KDGetItemPower(item), 2);
                    let amt = 5 + Math.round((0.4 + 0.6 * KDRandom()) * 4 * Math.pow(power, 0.7));
                    amt = KDGenericMultEnchantmentAmount(amt, item, data.Loot, data.curse, data.primaryEnchantment);
                    let time = 12 + Math.floor(KDRandom() * amt * 0.35);
                    return [
                        { trigger: "CONDITION", inheritLinked: true, type: "BuffSelf", buffType: "spellDamageBuff", time: time, power: 0.01 * amt, desc: "SpellDamageBuff", buffSprite: "SpellDamageUp", },
                        { original: "SpellDamageBuff", inheritLinked: true, trigger: "inventoryTooltip", type: "effectModifier", msg: "SpellDamageBuff", power: amt, duration: time, color: KDBaseBlack, bgcolor: KDBaseLightBlue },
                        { original: "SpellDamageBuff", inheritLinked: true, trigger: "icon", type: "tintIcon", power: 4, color: "#ff8933" },
                    ];
                },
            },
        }
    },
    ElementalBuff: {
        tags: ['buff', 'positive', 'temp', 'magic', "element"],
        types: {
            2: null,
            1: null,
            0: {
                level: 5,
                filter: (_item, _positive, _data) => {
                    return true;
                },
                weight: (_item, _positive, _data) => {
                    return 10;
                },
                onSelect: (_item, data) => {
                    if (!data.element)
                        data.element = CommonRandomItemFromList("", KDSPELLELEMENTS);
                    if (!data.elementdmg)
                        data.elementdmg = KDSPELLELEMENTSMAP[data.element];
                },
                events: (item, _positive, data) => {
                    let type = data.elementdmg;
                    let power = Math.max(KDGetItemPower(item), 2);
                    let amt = 8 + Math.round((0.4 + 0.6 * KDRandom()) * 5 * Math.pow(power, 0.75));
                    amt = KDGenericMultEnchantmentAmount(amt, item, data.Loot, data.curse, data.primaryEnchantment);
                    let time = 6 + Math.floor(KDRandom() * amt * 0.2);
                    return [
                        { trigger: "CONDITION", inheritLinked: true, type: "BuffSelf", buffType: type + "DamageBuff", time: time, power: 0.01 * amt, desc: "ElementalBuff", damage: data.elementdmg, buffSprite: "SpellDamageUp", },
                        { original: "ElementalBuff", inheritLinked: true, trigger: "inventoryTooltip", type: "effectModifier", msg: "ElementalBuff", damage: data.elementdmg, power: amt, duration: time, color: KDBaseBlack,
                            bgcolor: KinkyDungeonDamageTypes[type].color },
                        { original: "ElementalBuff", inheritLinked: true, trigger: "icon", type: "tintIcon", power: 4, color: KinkyDungeonDamageTypes[type].color },
                    ];
                },
            },
        }
    },
    ElementalResist: {
        tags: ['buff', 'positive', 'temp', 'magic', "element"],
        types: {
            2: null,
            1: null,
            0: {
                level: 4,
                filter: (_item, _positive, _data) => {
                    return true;
                },
                weight: (_item, _positive, _data) => {
                    return 10;
                },
                onSelect: (_item, data) => {
                    if (!data.element)
                        data.element = CommonRandomItemFromList("", KDSPELLELEMENTS);
                    if (!data.elementdmg)
                        data.elementdmg = KDSPELLELEMENTSMAP[data.element];
                },
                events: (item, _positive, data) => {
                    let type = data.elementdmg;
                    let power = Math.max(KDGetItemPower(item), 2);
                    let amt = 20 + Math.round((0.4 + 0.6 * KDRandom()) * 15 * Math.pow(power, 0.75));
                    amt = KDGenericMultEnchantmentAmount(amt, item, data.Loot, data.curse, data.primaryEnchantment);
                    let time = 15 + Math.floor(KDRandom() * amt * 0.15);
                    return [
                        { trigger: "CONDITION", inheritLinked: true, type: "BuffSelf", buffType: type + "DamageResist", time: time, power: 0.01 * amt, desc: "ElementalResist", damage: data.elementdmg, buffSprite: "SpellDamageUp", },
                        { original: "ElementalResist", inheritLinked: true, trigger: "inventoryTooltip", type: "effectModifier", msg: "ElementalResist", damage: data.elementdmg, power: amt, duration: time, color: KDBaseBlack,
                            bgcolor: KinkyDungeonDamageTypes[type].color },
                        { original: "ElementalResist", inheritLinked: true, trigger: "icon", type: "tintIcon", power: 4, bgcolor: KinkyDungeonDamageTypes[type].color },
                    ];
                },
            },
        }
    },
};
let KDModifierConditions = {
    OnTease: {
        tags: ['accessible', 'melee', 'common', 'riskmed'],
        types: {
            2: null,
            1: null,
            0: {
                level: 6,
                filter: (_item, _pos, _neut, _neg, _data) => {
                    return true;
                },
                weight: (_item, _pos, _neut, _neg, _data) => {
                    return 10;
                },
                events: (item, pos, neut, neg, data) => {
                    let effects = KDGenericEffects(item, ModifierEnum.restraint, pos, neut, neg, data);
                    for (let eff of effects) {
                        if (eff.trigger == "CONDITION") {
                            eff.trigger = "playerAttack";
                            eff.targetType = "enemy";
                            eff.attackerType = "KDPLAYER";
                            eff.condition = "DamageTypeTeasing";
                            eff.dynamic = true;
                        }
                    }
                    return [
                        { original: "OnTease", inheritLinked: true, trigger: "inventoryTooltip", type: "conditionModifier",
                            msg: "OnTease", color: KDBaseBlack, bgcolor: KDBaseWhite },
                        ...effects
                    ];
                },
            },
        }
    },
    OnElementalSpell: {
        tags: ['accessible', 'melee', 'common', 'riskmed'],
        types: {
            2: null,
            1: null,
            0: {
                level: 6,
                filter: (_item, _pos, _neut, _neg, data) => {
                    return data.element && KDSPELLELEMENTS.includes(data.element);
                },
                weight: (_item, _pos, _neut, _neg, _data) => {
                    return 100;
                },
                events: (item, pos, neut, neg, data) => {
                    let effects = KDGenericEffects(item, ModifierEnum.restraint, pos, neut, neg, data);
                    for (let eff of effects) {
                        if (eff.trigger == "CONDITION") {
                            eff.trigger = "playerCast";
                            eff.targetType = "enemy";
                            eff.attackerType = "KDPLAYER";
                            eff.condition = "spellType";
                            eff.element = data.element;
                            eff.damage = data.elementdmg;
                            eff.kind = data.element;
                            eff.dynamic = true;
                        }
                    }
                    return [
                        { original: "OnElementalSpell", inheritLinked: true, trigger: "inventoryTooltip", type: "conditionModifier",
                            msg: "OnElementalCast", element: data.element, damage: data.elementdmg, color: KDBaseBlack, bgcolor: KDBaseWhite },
                        ...effects
                    ];
                },
            },
        }
    },
};
function KDGenericEffects(item, type, pos, neut, neg, data) {
    let effects = [];
    for (let eff of [...pos]) {
        effects.push(...eff.types[type].events(item, PosNeutNeg.positive, data));
    }
    for (let eff of [...neut]) {
        effects.push(...eff.types[type].events(item, PosNeutNeg.neutral, data));
    }
    for (let eff of [...neg]) {
        effects.push(...eff.types[type].events(item, PosNeutNeg.negative, data));
    }
    return effects;
}
//# sourceMappingURL=KDModifier.js.map