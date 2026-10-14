"use strict";
AddModel({
    Name: "OperaGloveLeft",
    Folder: "OperaGloves",
    Parent: "OperaGloves",
    Categories: ["Gloves"],
    Layers: ToLayerMap([
        { Name: "GloveLeft", Layer: "GloveLeft", Pri: 3,
            Poses: ToMap([...ARMPOSES]),
            GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
        },
        { Name: "ForeGloveLeft", Layer: "ForeGloveLeft", Pri: 3,
            Poses: ToMap([...FOREARMPOSES]),
            InheritColor: "GloveLeft",
            GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
            SwapLayerPose: { Crossed: "CrossGloveLeft" },
        },
    ])
});
AddModel({
    Name: "OperaGloveRight",
    Folder: "OperaGloves",
    Parent: "OperaGloves",
    Categories: ["Gloves"],
    Layers: ToLayerMap([
        { Name: "GloveRight", Layer: "GloveRight", Pri: 3,
            Poses: ToMapSubtract([...ARMPOSES], ["Wristtie"]),
            GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
        },
        { Name: "ForeGloveRight", Layer: "ForeGloveRight", Pri: 3,
            Poses: ToMap([...FOREARMPOSES]),
            InheritColor: "GloveRight",
            GlobalDefaultOverride: ToMap(["Front", "Crossed"]),
            SwapLayerPose: { Crossed: "CrossGloveRight" },
        },
    ])
});
AddModel({
    Name: "OperaGloves",
    Folder: "OperaGloves",
    Parent: "OperaGloves",
    TopLevel: true,
    Categories: ["Gloves"],
    Layers: ToLayerMap([
        ...GetModelLayers("OperaGloveLeft"),
        ...GetModelLayers("OperaGloveRight"),
    ])
});
AddModel(GetModelRestraintVersion("OperaGloves", true));
//# sourceMappingURL=ModelList_Opera.js.map