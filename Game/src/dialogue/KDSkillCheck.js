"use strict";
var KDSkillCheckType;
(function (KDSkillCheckType) {
    KDSkillCheckType["Fitness"] = "Fitness";
    KDSkillCheckType["Agility"] = "Agility";
})(KDSkillCheckType || (KDSkillCheckType = {}));
let KDSkillCheckTypes = {
    Fitness: (en, player, target, diffMod) => {
        return 1 - 1 / Math.max(0.1, 1 + KDFitnessMult(player))
            + KDEntityBuffedStat(player, "meleeDamageBuff")
            - diffMod;
    },
    Agility: (en, player, target, diffMod) => {
        return 1 - 1 / Math.max(0.1, 1 + KDReflexMult(player))
            + KDEntityBuffedStat(player, "Evasion")
            - diffMod
            + (target ? 0.5 * KDGetSlowMult(target) : 0)
            + (target
                ? 1 * (KDEntityBuffedStat(KinkyDungeonPlayerEntity, "TimeSlow") - KDEntityBuffedStat(target, "TimeSlow"))
                : 0);
    },
};
function KDGetSkillCheck(en, player, target, type, diffMod = 0) {
    return KDSkillCheckTypes[type](en, player, target, diffMod);
}
//# sourceMappingURL=KDSkillCheck.js.map