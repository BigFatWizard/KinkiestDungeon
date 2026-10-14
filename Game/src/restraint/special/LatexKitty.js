"use strict";
function KDSummonLatexKittyTrap(x, y) {
    let enemy = KinkyDungeonGetEnemy(["latexKitty"], KDGetEffLevel(), KDCurrIndex(), '0', ["latexKitty"]);
    if (enemy) {
        let point = { x: x, y: y };
        if (point) {
            let en = DialogueCreateEnemy(point.x, point.y, enemy.name);
            KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/SummonCurse.ogg");
            KinkyDungeonSendTextMessage(8, TextGet("KDSummonLatexKitty"), "#77aaff", 5);
            KDDisableAutoWait();
            return en;
        }
    }
}
//# sourceMappingURL=LatexKitty.js.map