"use strict";
;
;
;
;
;
;
;
;
;
var PosNeutNeg;
(function (PosNeutNeg) {
    PosNeutNeg[PosNeutNeg["positive"] = 1] = "positive";
    PosNeutNeg[PosNeutNeg["neutral"] = 0] = "neutral";
    PosNeutNeg[PosNeutNeg["negative"] = -1] = "negative";
})(PosNeutNeg || (PosNeutNeg = {}));
var ModifierEnum;
(function (ModifierEnum) {
    ModifierEnum[ModifierEnum["restraint"] = 0] = "restraint";
    ModifierEnum[ModifierEnum["weapon"] = 1] = "weapon";
    ModifierEnum[ModifierEnum["consumable"] = 2] = "consumable";
})(ModifierEnum || (ModifierEnum = {}));
;
//# sourceMappingURL=KDTypeDefs.js.map