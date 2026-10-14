"use strict";
let KDBasicPotionFields = {
    onMiscast: function (result, inv, quantity, user, target, tx, ty) {
        return result;
    },
    onFailure: function (result, inv, quantity, user, target, tx, ty) {
        return result;
    },
    canAttempt: function (inv, quantity, user, target, tx, ty) {
        return KDCanAttemptPotion(inv, quantity, user, target, tx, ty);
    },
    onAttempt: function (inv, quantity, user, target, tx, ty) {
        return KDAttemptPotion(inv, quantity, user, target, tx, ty);
    }
};
function KDGetPotionRange(item, itemEffect) {
    return KDItemEffects[itemEffect].range;
}
function KDPotionOnUse(itemEffect, inv, quantity, user, target, tx, ty, playerEffect, entityEffect, tileEffect) {
    let item = KDConsumable(inv);
    if (!target && !tx && !ty && user == KDPlayer()) {
        return KDTargetConsumable(inv, quantity, itemEffect);
    }
    else {
        if (!target)
            target = KinkyDungeonEntityAt(tx, ty);
        if (target?.player) {
            return playerEffect(inv, quantity, user, target, tx, ty);
        }
        else if (target) {
            return entityEffect(inv, quantity, user, target, tx, ty);
        }
        else {
            return tileEffect(inv, quantity, user, target, tx, ty);
        }
    }
}
function KDCanAttemptPotion(inv, quantity, user, target, tx, ty) {
    return KinkyDungeonCanDrink() || !!KDConsumable(inv).gagFloor;
}
function KDAttemptPotion(inv, quantity, user, target, tx, ty) {
    let item = KDConsumable(inv);
    if (target == user && KDConsumable(item)?.needMouth) {
        if (target.player) {
            if (!KinkyDungeonCanTalk()) {
                KinkyDungeonSendActionMessage(7, TextGet("KDInvalidTargetSelf_Gagged"), KDBaseOrange, 2);
                return {
                    success: false,
                    componentfailure: "Mouth",
                    failureChance: 0,
                    miscastChance: 0,
                    miscast: false,
                    time: 0,
                    quantity: 0,
                    delayed: false,
                };
            }
        }
        else if (!KDEnemyCanTalk(target)) {
            KinkyDungeonSendActionMessage(7, TextGet("KDInvalidTarget_Gagged"), KDBaseOrange, 2);
            return {
                success: false,
                componentfailure: "Mouth",
                failureChance: 0,
                miscastChance: 0,
                miscast: false,
                time: 0,
                quantity: 0,
                delayed: false,
            };
        }
    }
    if (KDStandardConsumableHandsCheck(inv, quantity)) {
        return {
            success: true,
            componentfailure: "",
            failureChance: 0,
            miscastChance: 0,
            miscast: false,
            time: item.delay != undefined ? item.delay : 2,
            quantity: quantity,
            delayed: !!item.delay || !!KinkyDungeonStatsChoice.has("SavourTheTaste"),
        };
    }
    return {
        success: false,
        componentfailure: "",
        failureChance: 0,
        miscastChance: 0,
        miscast: false,
        time: 0,
        quantity: 0,
        delayed: false,
    };
}
//# sourceMappingURL=KDPotions.js.map