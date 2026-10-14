"use strict";
let KDLeashConditions = {
    dollmakerLeash: {
        check: (enemy, player) => {
            return !!KinkyDungeonFlags.get("BossUnlocked");
        }
    },
    wardenLeash: {
        check: (enemy, player) => {
            return !!KinkyDungeonFlags.get("BossUnlocked");
        }
    },
    fuukaLeash: {
        check: (enemy, player) => {
            return !!KinkyDungeonFlags.get("BossUnlocked");
        }
    },
};
//# sourceMappingURL=KDLeashCondition.js.map