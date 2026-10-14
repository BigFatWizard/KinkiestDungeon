'use strict';
let KDFurniture = {
    "Cage": {
        floor: "Floor",
        sprite: "Cage",
        restraintTag: "cage",
        dollsleep: false,
        restraintSetTags: {
            "steelbondage": 1,
            "leashing": 2,
        },
        tickFunction: (_delta) => {
            if (!KDGameData.PrisonerState) {
                let power = 0;
                if (KDBoundPowerLevel >= 0.35)
                    power = 2;
                else if (KDBoundPowerLevel >= 0.1)
                    power = 1;
                if (KinkyDungeonGoddessRep.Prisoner > 0.25)
                    power += 1;
                if (KinkyDungeonGoddessRep.Prisoner > -0.25)
                    power += 1;
                if (power >= 2) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage",
                        type: "SlowDetection",
                        duration: 1,
                        power: 4.0,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["SlowDetection", "move", "cast"],
                    });
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage2",
                        type: "Sneak",
                        duration: 1,
                        power: 9.95,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["Sneak", "move", "cast"],
                    });
                }
                else if (power >= 1) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage",
                        type: "SlowDetection",
                        duration: 1,
                        power: 4.0,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["SlowDetection", "move", "cast"],
                    });
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage2",
                        type: "Sneak",
                        duration: 1,
                        power: 2.95,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["Sneak", "move", "cast"],
                    });
                }
                if (!KinkyDungeonGetRestraintItem("ItemDevices"))
                    KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), KDBaseLightGreen, 1, true);
            }
        }
    },
    "DisplayStand": {
        floor: "Floor",
        sprite: "DisplayStand",
        restraintTag: "displaystand",
        restraintSetTags: {
            "trap": 5,
        },
        dollsleep: true,
        tickFunction: (_delta) => {
            if (!KDGameData.PrisonerState) {
                let power = 0;
                if (KDBoundPowerLevel >= 0.35)
                    power = 2;
                else if (KDBoundPowerLevel >= 0.1)
                    power = 1;
                if (KinkyDungeonGoddessRep.Prisoner > 0.25)
                    power += 1;
                if (KinkyDungeonGoddessRep.Prisoner > -0.25)
                    power += 1;
                if (power >= 2) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage",
                        type: "SlowDetection",
                        duration: 1,
                        power: 4.0,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["SlowDetection", "move", "cast"],
                    });
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage2",
                        type: "Sneak",
                        duration: 1,
                        power: 9.95,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["Sneak", "move", "cast"],
                    });
                }
                else if (power >= 1) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage",
                        type: "SlowDetection",
                        duration: 1,
                        power: 4.0,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["SlowDetection", "move", "cast"],
                    });
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage2",
                        type: "Sneak",
                        duration: 1,
                        power: 2.95,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["Sneak", "move", "cast"],
                    });
                }
                if (!KinkyDungeonGetRestraintItem("ItemDevices"))
                    KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), KDBaseLightGreen, 1, true);
            }
        }
    },
    "LatexDisplayStand": {
        floor: "Floor",
        sprite: "LatexDisplayStand",
        restraintTag: "latexdollstand",
        restraintSetTags: {
            "latexGag": 3,
            "latexRestraints": 8,
            "latexRestraintsHeavy": 7,
        },
        dollsleep: true,
        restraintSetLevelBonus: 20,
        forceFaction: "Rubber",
        tickFunction: (_delta) => {
            if (!KDGameData.PrisonerState) {
                let power = 0;
                if (KDBoundPowerLevel >= 0.35)
                    power = 2;
                else if (KDBoundPowerLevel >= 0.1)
                    power = 1;
                if (KinkyDungeonGoddessRep.Prisoner > 0.25)
                    power += 1;
                if (KinkyDungeonGoddessRep.Prisoner > -0.25)
                    power += 1;
                if (power >= 2) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage",
                        type: "SlowDetection",
                        duration: 1,
                        power: 4.0,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["SlowDetection", "move", "cast"],
                    });
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage2",
                        type: "Sneak",
                        duration: 1,
                        power: 9.95,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["Sneak", "move", "cast"],
                    });
                }
                else if (power >= 1) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage",
                        type: "SlowDetection",
                        duration: 1,
                        power: 4.0,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["SlowDetection", "move", "cast"],
                    });
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage2",
                        type: "Sneak",
                        duration: 1,
                        power: 2.95,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["Sneak", "move", "cast"],
                    });
                }
                if (!KinkyDungeonGetRestraintItem("ItemDevices"))
                    KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), KDBaseLightGreen, 1, true);
            }
        }
    },
    "FutureBox": {
        floor: "Floor",
        sprite: "FutureBox",
        restraintTag: "futurebox",
        dollsleep: true,
        restraintSetTags: {
            "cyberDollRestraints": 8,
        },
        tickFunction: (_delta) => {
        }
    },
    "Sarcophagus": {
        floor: "Brickwork",
        sprite: "Sarcophagus",
        restraintTag: "sarcophagus",
        restraintSetTags: {
            "mummyRestraints": 8,
        },
        dollsleep: true,
        tickFunction: (_delta) => {
        }
    },
    "IceBase": {
        floor: "Brickwork",
        sprite: "IceBase",
        restraintTag: "iceEncase",
        restraintSetTags: {
            "iceCuffs": 4,
            "iceRestraints": 4,
        },
        tickFunction: (_delta) => {
        }
    },
    "VineBase": {
        floor: "RubbleLooted",
        sprite: "VineBase",
        restraintTag: "vineSuspend",
        restraintSetTags: {
            "vineRestraints": 10,
        },
        dollsleep: true,
        tickFunction: (_delta) => {
        }
    },
    "ShadowBase": {
        floor: "Brickwork",
        sprite: "ShadowBase",
        restraintTag: "shadowBall",
        restraintSetTags: {
            "shadowLatexRestraints": 5,
        },
        tickFunction: (_delta) => {
        }
    },
    "CrystalBase": {
        floor: "RubbleLooted",
        sprite: "CrystalBase",
        restraintTag: "crystalEncase",
        restraintSetTags: {
            "crystalRestraints": 5,
        },
        dollsleep: true,
        tickFunction: (_delta) => {
        }
    },
    "Syb": {
        floor: "Floor",
        sprite: "Syb",
        restraintTag: "saddlemachine",
        restraintSetTags: {
            "leathercuffsSpell": 5,
            "gagSpell": 5,
            "harnessSpell": 5,
            "straitjacketSpell": 3,
            "armbinderSpell": 5,
        },
        dollsleep: true,
        tickFunction: (_delta) => {
        }
    },
    "Bed": {
        floor: "Floor",
        sprite: "Bed",
        restraintTag: "bed",
        tickFunction: (_delta) => {
            KDChangeStamina("bed", "sleep", "tick", 0.1, true, 0, false);
        }
    },
    "DisplayEgyptian": {
        floor: "Floor",
        sprite: "DisplayEgyptian",
        restraintTag: "displaystand",
        restraintSetTags: {
            "mummyRestraints": 8,
        },
        dollsleep: true,
        tickFunction: (_delta) => {
            if (!KDGameData.PrisonerState) {
                let power = 0;
                if (KDBoundPowerLevel >= 0.35)
                    power = 2;
                else if (KDBoundPowerLevel >= 0.1)
                    power = 1;
                if (KinkyDungeonGoddessRep.Prisoner > 0.25)
                    power += 1;
                if (KinkyDungeonGoddessRep.Prisoner > -0.25)
                    power += 1;
                if (power >= 2) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage",
                        type: "SlowDetection",
                        duration: 1,
                        power: 4.0,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["SlowDetection", "move", "cast"],
                    });
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage2",
                        type: "Sneak",
                        duration: 1,
                        power: 9.95,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["Sneak", "darkness", "move", "cast"],
                    });
                }
                else if (power >= 1) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage",
                        type: "SlowDetection",
                        duration: 1,
                        power: 4.0,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["SlowDetection", "move", "cast"],
                    });
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage2",
                        type: "Sneak",
                        duration: 1,
                        power: 2.95,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["Sneak", "darkness", "move", "cast"],
                    });
                }
                if (!KinkyDungeonGetRestraintItem("ItemDevices"))
                    KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), KDBaseLightGreen, 1, true);
            }
        }
    },
    "DollStandReal": {
        floor: "Floor",
        sprite: "DollStandReal",
        restraintTag: "dollstandreal",
        restraintSetTags: {
            "leatherHeels": 8,
        },
        dollsleep: true,
        tickFunction: (_delta) => {
        }
    },
    "DollStandSpreaderReal": {
        floor: "Floor",
        sprite: "DollStandSpreaderReal",
        restraintTag: "dollstandrealspreader",
        restraintSetTags: {
            "leatherHeels": 8,
        },
        dollsleep: true,
        tickFunction: (_delta) => {
        }
    },
    "OneBarTrap": {
        floor: "Floor",
        sprite: "DollStand",
        restraintTag: "onebarprison",
        restraintSetTags: {
            "leatherHeels": 8,
        },
        dollsleep: true,
        tickFunction: (_delta) => {
            if (!KDGameData.PrisonerState) {
                let power = 0;
                if (KDBoundPowerLevel >= 0.35)
                    power = 2;
                else if (KDBoundPowerLevel >= 0.1)
                    power = 1;
                if (KinkyDungeonGoddessRep.Prisoner > 0.25)
                    power += 1;
                if (KinkyDungeonGoddessRep.Prisoner > -0.25)
                    power += 1;
                if (power >= 2) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage",
                        type: "SlowDetection",
                        duration: 1,
                        power: 4.0,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["SlowDetection", "move", "cast"],
                    });
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage2",
                        type: "Sneak",
                        duration: 1,
                        power: 9.95,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["Sneak", "darkness", "move", "cast"],
                    });
                }
                else if (power >= 1) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage",
                        type: "SlowDetection",
                        duration: 1,
                        power: 4.0,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["SlowDetection", "move", "cast"],
                    });
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage2",
                        type: "Sneak",
                        duration: 1,
                        power: 2.95,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["Sneak", "darkness", "move", "cast"],
                    });
                }
                if (!KinkyDungeonGetRestraintItem("ItemDevices"))
                    KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), KDBaseLightGreen, 1, true);
            }
        }
    },
    "OneBarVibeTrap": {
        floor: "Floor",
        sprite: "DollStandVibe",
        restraintTag: "onebarprisonvibe",
        restraintSetTags: {
            "leatherHeels": 8,
        },
        dollsleep: true,
        tickFunction: (_delta) => {
            if (!KDGameData.PrisonerState) {
                let power = 0;
                if (KDBoundPowerLevel >= 0.35)
                    power = 2;
                else if (KDBoundPowerLevel >= 0.1)
                    power = 1;
                if (KinkyDungeonGoddessRep.Prisoner > 0.25)
                    power += 1;
                if (KinkyDungeonGoddessRep.Prisoner > -0.25)
                    power += 1;
                if (power >= 2) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage",
                        type: "SlowDetection",
                        duration: 1,
                        power: 4.0,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["SlowDetection", "move", "cast"],
                    });
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage2",
                        type: "Sneak",
                        duration: 1,
                        power: 9.95,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["Sneak", "darkness", "move", "cast"],
                    });
                }
                else if (power >= 1) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage",
                        type: "SlowDetection",
                        duration: 1,
                        power: 4.0,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["SlowDetection", "move", "cast"],
                    });
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                        id: "cage2",
                        type: "Sneak",
                        duration: 1,
                        power: 2.95,
                        player: true,
                        enemies: true,
                        endSleep: true,
                        maxCount: 1,
                        tags: ["Sneak", "darkness", "move", "cast"],
                    });
                }
                if (!KinkyDungeonGetRestraintItem("ItemDevices"))
                    KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonCage" + power), KDBaseLightGreen, 1, true);
            }
        }
    },
    "OneBarSpreaderTrap": {
        floor: "Floor",
        sprite: "DollStandSpreader",
        restraintTag: "onebarprisonspreader",
        restraintSetTags: {
            "leatherHeels": 8,
        },
        dollsleep: true,
        tickFunction: (_delta) => {
        }
    },
    "OneBarSpreaderVibeTrap": {
        floor: "Floor",
        sprite: "DollStandVibeSpreader",
        restraintTag: "onebarprisonvibespreader",
        restraintSetTags: {
            "leatherHeels": 8,
        },
        dollsleep: true,
        tickFunction: (_delta) => {
        }
    },
};
//# sourceMappingURL=KinkyDungeonFurniture.js.map