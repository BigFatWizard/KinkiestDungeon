"use strict";
AddModel({
    Name: "Goggles",
    Folder: "Visors",
    Parent: "Goggles",
    TopLevel: true,
    Categories: ["Accessories", "Face"],
    Layers: ToLayerMap([
        { Name: "Dollmaker", Layer: "Goggles", Pri: 14,
            InheritColor: "Goggles",
            Invariant: true,
            HideWhenOverridden: true,
        },
    ])
});
AddModel(GetModelRestraintVersion("Goggles", true));
AddModel({
    Name: "FullVisor",
    Folder: "Visors",
    Parent: "Goggles",
    TopLevel: false,
    Categories: ["Accessories", "Face"],
    Layers: ToLayerMap([
        { Name: "DollmakerFull", Layer: "MaskOver", Pri: 50,
            InheritColor: "FullVisor",
            Invariant: true,
            HideWhenOverridden: true,
            DisplacementSources: ["Head", "FaceGag"],
        },
    ])
});
AddModel({
    Name: "FullVisorRim",
    Folder: "Visors",
    Parent: "Goggles",
    TopLevel: false,
    Categories: ["Accessories", "Face"],
    Layers: ToLayerMap([
        { Name: "DollmakerFull", Layer: "MaskOver", Pri: 50,
            InheritColor: "FullVisor",
            Invariant: true,
            HideWhenOverridden: true,
            DisplacementSources: ["Head", "FaceGag"],
        },
        { Name: "DollmakerFullRim", Layer: "MaskOver", Pri: 50.1,
            InheritColor: "Rim",
            Invariant: true,
            NoOverride: true, TieToLayer: "DollmakerFull",
            DisplacementSources: ["Head", "FaceGag"],
        },
    ])
});
AddModel(GetModelRestraintVersion("FullVisor", true));
AddModel(GetModelRestraintVersion("FullVisorRim", true));
AddModel({
    Name: "GasMask",
    Folder: "Gasmask",
    Parent: "GasMask",
    TopLevel: true,
    Categories: ["Accessories", "Face"],
    Layers: ToLayerMap([
        { Name: "Mask", Layer: "GagMuzzle", Pri: 10,
            OffsetX: 942,
            OffsetY: 200,
            Invariant: true,
            HideWhenOverridden: true,
            DisplacementSources: ["Head", "FaceGag"],
        },
        { Name: "Valves", Layer: "GagMuzzle", Pri: 20,
            OffsetX: 942,
            OffsetY: 200,
            Invariant: true,
            NoOverride: true, TieToLayer: "Mask",
            DisplacementSources: ["Head", "FaceGag"],
        },
        { Name: "Center", Layer: "GagMuzzle", Pri: 10.1,
            OffsetX: 942,
            OffsetY: 200,
            Invariant: true,
            NoOverride: true, TieToLayer: "Mask",
            DisplacementSources: ["Head", "FaceGag"],
        },
        { Name: "Nose", Layer: "GagMuzzle", Pri: 10.2,
            OffsetX: 942,
            OffsetY: 200,
            Invariant: true,
            NoOverride: true, TieToLayer: "Mask",
        },
        { Name: "Plugs", Layer: "GagMuzzle", Pri: 20.2,
            OffsetX: 942,
            OffsetY: 200,
            Invariant: true,
            NoOverride: true, TieToLayer: "Valves",
            DisplacementSources: ["Head", "FaceGag"],
        },
    ])
});
AddModel(GetModelRestraintVersion("GasMask", true));
//# sourceMappingURL=ModelList_Visors.js.map