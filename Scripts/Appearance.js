"use strict";
let CharacterAppearancePreviousEmoticon = null;
function CharacterAppearanceSetDefault(C) {
    C.Appearance = [];
    C.Pose = [];
    C.metadata = DefaultOutfitMetadata();
    C.Palette = "";
}
function DefaultOutfitMetadata() {
    return {
        customColors: {},
        name: "",
        palette: "",
    };
}
function CharacterAppearanceNaked(C) {
    for (let A = C.Appearance.length - 1; A >= 0; A--)
        if (C.Appearance[A].Model && !KDModelIsProtected(C.Appearance[A].Model))
            C.Appearance.splice(A, 1);
}
function CharacterAppearanceSetItem(C, Group, ItemAsset, NewColor, DifficultyFactor = 0, ItemMemberNumber = -1, Refresh = true) { }
function CharacterAppearanceStringify(C, metadata) {
    return JSON.stringify({
        metadata: metadata,
        appearance: AppearanceItemStringify(C.Appearance),
    });
}
function AppearanceItemStringify(Item) {
    for (let r of Item) {
        if (r.Model?.Filters)
            r.Filters = r.Model.Filters;
        if (r.Model?.Properties)
            r.Properties = r.Model.Properties;
        if (r.Model?.factionFilters)
            r.factionFilters = r.Model.factionFilters;
    }
    return JSON.stringify(Item, (key, value) => {
        if (key === "Asset") {
            return value.Group.Family + "/" + value.Group.Name + "/" + value.Name;
        }
        if (key === "Model") {
            return value.Name;
        }
        return value;
    });
}
function CharacterAppearanceRestore(C, backup, clothesOnly = false, noProtected = false) {
    let parsed = JSON.parse(LZString.decompressFromBase64(backup) || backup);
    let newAppearance = AppearanceItemParse(parsed?.metadata ? parsed.appearance : backup);
    C.metadata = parsed.metadata;
    if (!clothesOnly) {
        C.Appearance = newAppearance;
        KDRefreshSelectedModel(C);
        return;
    }
    let finalAppearance = [];
    for (let item of newAppearance) {
        if (noProtected || !KDModelIsProtected(item.Model)) {
            finalAppearance.push(item);
        }
    }
    if (!noProtected)
        for (let item of C.Appearance) {
            if (KDModelIsProtected(item.Model)) {
                finalAppearance.push(item);
            }
        }
    C.Appearance = finalAppearance;
    KDRefreshSelectedModel(C);
}
function KDRefreshSelectedModel(C) {
    if (KDSelectedModel) {
        if (KDCurrentModels.get(C)?.Models.has(KDSelectedModel.Name)) {
            KDSelectedModel = C.Appearance.find((value) => {
                return value.Model.Name == KDSelectedModel.Name;
            })?.Model;
        }
        else
            KDSelectedModel = null;
    }
}
function AppearanceItemParse(stringified) {
    let ret = JSON.parse(stringified, (key, value) => {
        if (key === "Model" && ModelDefs[value]) {
            return JSON.parse(JSON.stringify(ModelDefs[value]));
        }
        if (key === "Model" && value.Name && ModelDefs[value.Name]) {
            let model = value;
            if (ModelDefs[value.Name]) {
                model.Layers = JSON.parse(JSON.stringify(ModelDefs[value.Name])).Layers;
            }
            return model;
        }
        return value;
    });
    ret = ret.filter((elem) => {
        return elem.Model != undefined && ModelDefs[elem.Model.Name] != undefined;
    });
    for (let r of ret) {
        if (r.Filters && r.Model && r.Model.Name)
            r.Model.Filters = r.Filters;
        if (r.Properties && r.Model && r.Model.Name)
            r.Model.Properties = r.Properties;
        if (r.factionFilters && r.Model && r.Model.Name)
            r.Model.factionFilters = r.factionFilters;
    }
    return ret;
}
function AppearanceCleanup(C) {
    for (let A = 0; A < C.Appearance.length; A++) {
        if (!C.Appearance[A].Model || !ModelDefs[C.Appearance[A].Model.Name]) {
            C.Appearance.splice(A, 1);
            A -= 1;
        }
    }
}
//# sourceMappingURL=Appearance.js.map