"use strict";
let Character = [];
let CharacterNextId = 1;
function CharacterReset(CharacterID) {
    let NewCharacter = {
        ID: CharacterID,
        Name: "",
        Palette: "",
        metadata: DefaultOutfitMetadata(),
        Appearance: [],
        HeightModifier: 0,
        Pose: [],
    };
    if (CharacterID == 0 && !DefaultPlayer) {
        DefaultPlayer = NewCharacter;
        CharacterAppearanceSetDefault(NewCharacter);
    }
    return NewCharacter;
}
function CharacterAddPose(C, NewPose) {
    for (let E = 0; E < NewPose.length; E++)
        if (C.Pose.indexOf(NewPose[E]) < 0)
            C.Pose.push(NewPose[E]);
}
function CharacterItemsHavePoseAvailable(C, Type, Pose) {
    return true;
}
function CharacterDoItemsSetPose(C, pose, excludeClothes = false) {
    return false;
}
function CharacterNaked(C) {
    CharacterAppearanceNaked(C);
}
function CharacterSetActivePose(C, NewPose, ForceChange = false) { }
function CharacterSetFacialExpression(C, AssetGroup, Expression, Timer = null, Color = null) {
    if (StandalonePatched) {
        return;
    }
}
function CharacterResetFacialExpression(C) {
    if (StandalonePatched) {
        return;
    }
}
function CharacterGetCurrent() {
    return DefaultPlayer;
}
function CharacterNickname(C) {
    return "";
}
function CharacterLoadNPC(id, Name, Palette, customColors) {
    const CNew = CharacterReset(id);
    CNew.Name = Name;
    if (Palette)
        CNew.Palette = Palette;
    CNew.metadata = DefaultOutfitMetadata();
    CNew.metadata.palette = Palette || "";
    CNew.metadata.customColors = customColors || {};
    CNew.metadata.name = Name;
    return CNew;
}
function LoadNPC(id, Name, metadata) {
    const CNew = CharacterReset(id);
    CNew.Name = Name;
    if (metadata) {
        for (let key in metadata) {
            CNew[key] = metadata[key];
        }
    }
    return CNew;
}
function CharacterReleaseTotal(C) {
    for (let E = C.Appearance.length - 1; E >= 0; E--) {
        if (C.Appearance[E].Model?.Restraint) {
            C.Appearance.splice(E, 1);
        }
    }
}
//# sourceMappingURL=Character.js.map