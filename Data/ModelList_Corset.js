"use strict";
AddModel({
    Name: "BuckleCorset",
    Folder: "Corsets",
    Parent: "BuckleCorset",
    TopLevel: true,
    Categories: ["Corsets"],
    AddPose: ["Corset"],
    Layers: ToLayerMap([
        { Name: "BuckleCorset", Layer: "Bustier", Pri: 50,
            Invariant: true,
            InheritColor: "Corset",
            DisplaceAmount: 150,
            DisplaceLayers: ToMap(["CorsetTorso"]),
            DisplacementSprite: "CorsetSquish",
            DisplacementInvariant: true,
        },
        { Name: "BuckleCorsetBuckles", Layer: "Bustier", Pri: 50.1,
            Invariant: true,
            InheritColor: "Buckles",
            TieToLayer: "BuckleCorset",
        },
        { Name: "BuckleCorsetHardware", Layer: "Bustier", Pri: 50.2,
            Invariant: true,
            InheritColor: "Hardware",
            TieToLayer: "BuckleCorset",
        },
    ])
});
AddModel(GetModelRestraintVersion("BuckleCorset", true));
//# sourceMappingURL=ModelList_Corset.js.map