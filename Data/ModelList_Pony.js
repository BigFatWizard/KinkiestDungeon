"use strict";
AddModel({
    Name: "QuakeCollar",
    Folder: "Pony",
    Parent: "QuakeCollar",
    TopLevel: true,
    Categories: ["Accessories"],
    Layers: ToLayerMap([
        { Name: "Collar", Layer: "Collar", Pri: 100,
            Invariant: true,
            HideWhenOverridden: true,
        },
        { Name: "CollarTag", Layer: "CollarAcc", Pri: 100,
            MorphPoses: { Hogtie: "Hogtie" },
            HideWhenOverridden: true,
        },
    ])
});
AddModel(GetModelRestraintVersion("QuakeCollar", true));
//# sourceMappingURL=ModelList_Pony.js.map