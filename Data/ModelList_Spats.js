"use strict";
AddModel({
    Name: "Spats",
    Folder: "Spats",
    Parent: "Spats",
    TopLevel: true,
    Categories: ["Pants"],
    AddPose: ["Spats"],
    Layers: ToLayerMap([
        { Name: "Spats", Layer: "Shorts", Pri: 4,
            Poses: ToMap([...LEGPOSES]),
            HidePrefixPose: ["Encase"], HidePrefixPoseSuffix: ["TorsoLower"],
            MorphPoses: { KneelClosed: "KneelClosed" },
        },
        { Name: "SpatsLeft", Layer: "ShortsLeft", Pri: 7,
            Poses: ToMap(["Kneel", "KneelClosed", "Closed", "Spread"]),
            GlobalDefaultOverride: ToMap(["KneelClosed"]),
            HidePrefixPose: ["Encase"], HidePrefixPoseSuffix: ["TorsoLower"],
            InheritColor: "Spats",
        },
        { Name: "SpatsRight", Layer: "ShortsRight", Pri: 7,
            Poses: ToMap(["Closed", "Spread"]),
            HidePrefixPose: ["Encase"], HidePrefixPoseSuffix: ["TorsoLower"],
            InheritColor: "Spats",
        },
    ])
});
//# sourceMappingURL=ModelList_Spats.js.map