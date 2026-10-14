"use strict";
let KDNaughtySetting = false;
let KinkyDungeonOutfitCache = new Map();
let KDProtectedCosplay = [];
function KDOutfit(item) {
    return KinkyDungeonOutfitCache.get(item.name);
}
function KinkyDungeonRefreshOutfitCache() {
    KinkyDungeonOutfitCache = new Map();
    for (let r of KinkyDungeonOutfitsBase) {
        KinkyDungeonOutfitCache.set(r.name, r);
    }
}
let KDClothOverrides = {
    "Cloth": {
        "SleevelessTop": 24.9,
    },
};
let KinkyDungeonDefaultDefaultDress = [
    { Item: "WitchHat1", Group: "Hat", Color: "Default", Lost: false },
    { Item: "LeatherCorsetTop1", Group: "Cloth", Color: "Default", Lost: false },
    { Item: "LatexSkirt1", Group: "ClothLower", Color: "Default", OverridePriority: 17, Lost: false, Skirt: true },
    { Item: "Socks4", Group: "Socks", Color: "#444444", Lost: false },
    { Item: "Heels3", Group: "Shoes", Color: "#222222", Lost: false },
    { Item: "KittyPanties1", Group: "Panties", Color: "#222222", Lost: false },
    { Item: "FullLatexBra", Group: "Bra", Color: "Default", Lost: false },
    { Item: "LatexElbowGloves", Group: "Gloves", Color: "Default", Lost: false },
    { Item: "Necklace4", Group: "Necklace", Color: "#222222", Lost: false },
];
let KinkyDungeonCheckClothesLoss = false;
function KDGetDressList() {
    if (StandalonePatched)
        return KDModelDresses;
    return KinkyDungeonDresses;
}
function KinkyDungeonInitializeDresses() {
    KDRefreshCharacter.set(KinkyDungeonPlayer, true);
    KinkyDungeonUndress = 0;
    if (Object.values(KDGetDressList()).length > 0) {
        for (let d of Object.values(KDGetDressList())) {
            for (let dd of d) {
                if (dd.Lost)
                    dd.Lost = false;
            }
        }
    }
}
let KinkyDungeonNewDress = false;
function KinkyDungeonDressSet(C) {
    if (KinkyDungeonNewDress) {
        KDGetDressList().Default = [];
        if (!C)
            C = KinkyDungeonPlayer;
        for (let A = 0; A < C.Appearance.length; A++) {
            let save = false;
            if (C.Appearance[A].Model && KDModelIsProtected(C.Appearance[A].Model))
                save = true;
            if (!C.Appearance[A].Model?.Restraint)
                save = true;
            if (save) {
                KDGetDressList().Default.push({
                    Item: C.Appearance[A].Model?.Name || C.Appearance[A].Asset?.Name,
                    Group: C.Appearance[A].Model?.Group,
                    Filters: C.Appearance[A].Model?.Filters,
                    Properties: C.Appearance[A].Model?.Properties,
                    factionFilters: C.Appearance[A].Model?.factionFilters,
                    Property: C.Appearance[A].Property,
                    Color: (C.Appearance[A].Color) ? C.Appearance[A].Color : (C.Appearance[A].Model?.DefaultColor ? C.Appearance[A].Model?.DefaultColor : "Default"),
                    Lost: false,
                    Skirt: C.Appearance[A].Model?.Group == "Skirt" || C.Appearance[A].Model?.Categories?.includes("Skirts"),
                });
            }
        }
    }
    KinkyDungeonNewDress = false;
}
let KDCharacterDress = new Map();
function KinkyDungeonSetDress(Dress, Outfit, Character, NoRestraints) {
    if (!Character || Character == KinkyDungeonPlayer) {
        if (Outfit)
            KDGameData.Outfit = Outfit;
        KinkyDungeonCurrentDress = Dress;
    }
    KDCharacterDress.set(Character, Dress);
    if (KDGetDressList()) {
        if (!Character || Character == KinkyDungeonPlayer) {
            for (let clothes of KDGetDressList()[KinkyDungeonCurrentDress]) {
                clothes.Lost = false;
            }
        }
        KDCharacterNaked(Character);
        KDRefreshCharacter.set(Character || KinkyDungeonPlayer, true);
        KinkyDungeonDressPlayer(Character, NoRestraints, false, undefined, undefined, undefined, undefined, undefined, true);
        KDRefresh = true;
    }
}
let KDNaked = false;
let KDRefresh = false;
let KDLastForceRefresh = 0;
let KDLastForceRefreshInterval = 100;
function KinkyDungeonDressPlayer(Character, NoRestraints, Force, npcRestraints, customInventory, customPlayerTags, customFaction, noDressOutfit, forceUseOutfit) {
    if (!Character)
        Character = KinkyDungeonPlayer;
    let _CharacterRefresh = CharacterRefresh;
    let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
    CharacterRefresh = () => { KDRefresh = true; };
    CharacterAppearanceBuildCanvas = () => { };
    let restraints = [];
    if (StandalonePatched) {
        AppearanceCleanup(Character);
    }
    let restraintModels = {};
    let CurrentDress = Character == KinkyDungeonPlayer ? KinkyDungeonCurrentDress
        : (Character == KDPreviewModel ? KinkyDungeonCurrentDress : (KDCharacterDress.get(Character) || "Bandit"));
    let DressList = noDressOutfit ? [] : KDGetDressList()[CurrentDress];
    if (!noDressOutfit && !forceUseOutfit && KDNPCStyle.get(Character)?.customOutfit) {
        DressList = [];
        for (let a of JSON.parse(DecompressB64(KDNPCStyle.get(Character)?.customOutfit))) {
            if (a.Model && !KDModelIsProtected(a.Model) && !a.Model.Restraint && !a.Model.Cosplay) {
                DressList.push({
                    Item: a.Model.Name || a.Model,
                    Group: a.Model.Group || a.Model.Name || a.Model,
                    Color: KDBaseWhite,
                    Lost: false,
                    Filters: a.Model.Filters || a.Filters,
                    Properties: a.Model.Properties || a.Properties,
                    factionFilters: a.Model.factionFilters || a.factionFilters,
                });
            }
        }
    }
    let forceCustomFaction = !!customFaction;
    if ((KinkyDungeonState != "Wardrobe" || KDShowCharacterPalette)) {
        if (Character == KinkyDungeonPlayer) {
            let outfit = KDOutfit({ name: KinkyDungeonCurrentDress });
            let restraintPalette = KDToggles.RestraintPalette ? KDGetRestraintsPalette(Character) : "";
            if (customFaction == undefined && (outfit?.palette || restraintPalette || (Character.metadata?.palette || Character.Palette))) {
                let palette = (KDToggles.NoOutfitPalette ? undefined : outfit?.palette)
                    || restraintPalette
                    || (KDToggles.NoOutfitPalette ? undefined : (Character.metadata?.palette || Character.Palette)) || (KDToggles.ForcePalette ? KDDefaultPalette : "");
                if (palette) {
                    customFaction = palette;
                }
            }
        }
        else {
            if (customFaction == undefined) {
                let palette = (Character.metadata?.palette || Character.Palette);
                if (palette) {
                    customFaction = palette;
                }
            }
        }
    }
    try {
        if (!KDGameData.NPCRestraints)
            KDGameData.NPCRestraints = {};
        let data = {
            hideShrines: {},
            drawnRestraints: [],
            updateRestraints: false,
            updateDress: false,
            updateExpression: false,
            Character: Character,
            extraForceDress: undefined,
            Wornitems: (npcRestraints || (KDGetCharacterID(Character) && KDGameData.NPCRestraints[KDGetCharacterID(Character)])) ?
                Object.values(npcRestraints || KDGameData.NPCRestraints[KDGetCharacterID(Character)])
                    .filter((rest) => { return rest.events; })
                    .map((rest) => { return rest.id; })
                : [],
            NPCRestraintEvents: KDGetCharacterID(Character) ?
                KDGameData.NPCRestraints[KDGetCharacterID(Character)]
                : undefined,
        };
        if (DressList) {
            for (let clothes of DressList) {
                if (clothes.Properties && !clothes.Lost) {
                    for (let p of Object.values(clothes.Properties)) {
                        if (p.HideRestraintsTags) {
                            for (let t of p.HideRestraintsTags) {
                                data.hideShrines[t] = true;
                            }
                        }
                    }
                }
            }
        }
        if (KinkyDungeonCheckClothesLoss)
            KDRefreshCharacter.set(Character, true);
        let drawnRestraints = data.drawnRestraints;
        if (KDRefreshCharacter.get(Character)) {
            if (!KDNaked)
                KDCharacterNaked(Character);
            let clothGroups = {};
            for (let cloth of Object.values(DressList)) {
                clothGroups[cloth.Group || cloth.Item] = true;
            }
            let newAppearance = {};
            for (let A = 0; A < Character.Appearance.length; A++) {
                if (StandalonePatched) {
                    let model = Character.Appearance[A]?.Model;
                    if (model && ((!model.Restraint && !model.Group?.startsWith("Item") && !clothGroups[model.Group || model.Name])
                        || KDModelIsProtected(model) || model.SuperProtected)) {
                        newAppearance[model.Group || model.Name] = Character.Appearance[A];
                        if (model.Properties) {
                            for (let p of Object.values(model.Properties)) {
                                if (p.HideRestraintsTags) {
                                    for (let t of p.HideRestraintsTags) {
                                        data.hideShrines[t] = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            Character.Appearance = Object.values(newAppearance);
            KDRefreshSelectedModel(Character);
            let tags = Character == KinkyDungeonPlayer ? customPlayerTags || KinkyDungeonPlayerTags : new Map();
            if (!NoRestraints) {
                if (!npcRestraints && (Character == KinkyDungeonPlayer || customInventory)) {
                    for (let inv of (customInventory || KinkyDungeonAllRestraint())) {
                        let TagsSoFar = {};
                        let renderTypes = KDRestraint(inv).shrine;
                        let cont = false;
                        if (!(!KDRestraint(inv) || (KDRestraint(inv).armor && !KDToggles.DrawArmor))) {
                            if ((!KDRestraint(inv).renderExcept
                                || !KDRestraint(inv).renderExcept.some((tag) => {
                                    return TagsSoFar[tag];
                                }))) {
                                if (!KDRestraint(inv).hideTags || !KDRestraint(inv).hideTags.some((tag) => {
                                    return tags.get(tag) == true;
                                })) {
                                    let Poses = KDCurrentModels.get(Character)?.Poses;
                                    if (KDRestraint(inv)?.shrine) {
                                        for (let s of KDRestraint(inv)?.shrine) {
                                            if (data.hideShrines[s])
                                                cont = true;
                                        }
                                    }
                                    if (!cont) {
                                        if (!Poses || !KDRestraint(inv)?.noRenderPose?.some((s) => {
                                            return !!Poses[s];
                                        })) {
                                            if (KDRestraint(inv).shrine) {
                                                for (let tag of KDRestraint(inv).shrine) {
                                                    TagsSoFar[tag] = true;
                                                }
                                            }
                                            drawnRestraints.push(inv);
                                            KDApplyItem(Character, inv, customPlayerTags || KinkyDungeonPlayerTags, customFaction, forceCustomFaction);
                                            if (KDRestraint(inv).Model) {
                                                restraintModels[KDRestraint(inv).Model] = true;
                                                restraintModels["Fashion" + KDRestraint(inv).Model] = true;
                                            }
                                        }
                                    }
                                }
                            }
                            restraints.push(inv);
                        }
                        else
                            renderTypes = [];
                        if (inv.dynamicLink) {
                            let accessible = KDRestraint(inv)?.accessible || KDRestraint(inv)?.UnderlinkedAlwaysRender;
                            let link = inv.dynamicLink;
                            for (let I = 0; I < 30; I++) {
                                cont = false;
                                if (!(!KDRestraint(link) || (KDRestraint(link).armor && !KDToggles.DrawArmor))) {
                                    if ((!KDRestraint(link).renderExcept
                                        || !KDRestraint(link).renderExcept.some((tag) => {
                                            return TagsSoFar[tag];
                                        }))) {
                                        if (accessible || KDRestraint(link).alwaysRender
                                            || (KDRestraint(link).renderWhenLinked && KDRestraint(link).renderWhenLinked.some((element) => {
                                                return renderTypes.includes(element);
                                            }))) {
                                            if (!KDRestraint(link).hideTags || !KDRestraint(link).hideTags.some((tag) => {
                                                return tags.get(tag) == true;
                                            })) {
                                                if (KDRestraint(link)?.shrine) {
                                                    for (let s of KDRestraint(link)?.shrine) {
                                                        if (data.hideShrines[s])
                                                            cont = true;
                                                    }
                                                }
                                                if (!cont) {
                                                    let Poses = KDCurrentModels.get(Character)?.Poses;
                                                    if (!Poses || !KDRestraint(link)?.noRenderPose?.some((s) => {
                                                        return !!Poses[s];
                                                    })) {
                                                        if (KDRestraint(link).shrine) {
                                                            for (let tag of KDRestraint(link).shrine) {
                                                                TagsSoFar[tag] = true;
                                                            }
                                                        }
                                                        drawnRestraints.push(link);
                                                        KDApplyItem(Character, link, customPlayerTags || KinkyDungeonPlayerTags, customFaction, forceCustomFaction);
                                                        if (KDRestraint(link).Model) {
                                                            restraintModels[KDRestraint(link).Model] = true;
                                                            restraintModels["Fashion" + KDRestraint(link).Model] = true;
                                                        }
                                                    }
                                                }
                                            }
                                            restraints.push(link);
                                        }
                                    }
                                }
                                if (link.dynamicLink) {
                                    renderTypes = KDRestraint(link).shrine;
                                    link = link.dynamicLink;
                                }
                                else
                                    I = 1000;
                            }
                        }
                    }
                }
                else if (npcRestraints) {
                    let ids = {};
                    for (let inv of Object.values(npcRestraints)) {
                        if (!KDRestraint(inv))
                            continue;
                        if (ids[inv.id])
                            continue;
                        ids[inv.id] = true;
                        if (!KDRestraint(inv).hideTags || !KDRestraint(inv).hideTags.some((tag) => { return tags.get(tag) == true; })) {
                            let Poses = KDCurrentModels.get(Character)?.Poses;
                            if (!Poses || !KDRestraint(inv)?.noRenderPose?.some((s) => {
                                return !!Poses[s];
                            })) {
                                drawnRestraints.push(inv);
                                KDApplyItem(Character, inv, NPCTags.get(Character) || new Map(), customFaction, forceCustomFaction);
                                if (KDRestraint(inv).Model) {
                                    restraintModels[KDRestraint(inv).Model] = true;
                                    restraintModels["Fashion" + KDRestraint(inv).Model] = true;
                                }
                            }
                        }
                        restraints.push({
                            name: inv.name,
                            id: -1,
                            type: Restraint
                        });
                    }
                }
            }
            data.updateRestraints = true;
            KDNaked = true;
            KinkyDungeonUndress = 0;
        }
        let alreadyClothed = {};
        for (let A = 0; A < Character.Appearance.length; A++) {
            let asset = Character.Appearance[A].Asset;
            if (StandalonePatched) {
                if (Character.Appearance[A].Model?.Group)
                    alreadyClothed[Character.Appearance[A].Model?.Group] = true;
            }
            else
                alreadyClothed[asset.Group.Name] = true;
        }
        if (Character == KinkyDungeonPlayer) {
            let noLoss = false;
            for (let clothes of DressList) {
                if (!clothes)
                    continue;
                noLoss = false;
                if (StandalonePatched && !clothes.Lost && KDRefreshCharacter.get(Character)) {
                    if (clothes.Properties && Object.values(clothes.Properties).some((p) => { return p.NoLoss; }))
                        noLoss = true;
                    if (clothes.Item && (restraintModels[clothes.Item] || restraintModels[clothes.Item + "Restraint"])) {
                        clothes.Lost = true;
                    }
                    else if (IsModelLost(Character, clothes.Item))
                        clothes.Lost = true;
                }
                if (alreadyClothed[clothes.Group || clothes.Item])
                    continue;
                data.updateDress = true;
                if (!noLoss && !clothes.Lost && KDRefreshCharacter.get(Character)) {
                    if (clothes.Group == "Necklace") {
                        if (KinkyDungeonGetRestraintItem("ItemTorso") && KDRestraint(KinkyDungeonGetRestraintItem("ItemTorso"))?.harness)
                            clothes.Lost = true;
                        if (KinkyDungeonGetRestraintItem("ItemArms") && KDGroupBlocked("ItemBreast"))
                            clothes.Lost = true;
                    }
                    if (clothes.Group == "Panties" && !clothes.NoLose) {
                        if (KinkyDungeonGetRestraintItem("ItemPelvis")
                            && KDRestraint(KinkyDungeonGetRestraintItem("ItemPelvis"))?.chastity)
                            clothes.Lost = true;
                    }
                    if (ModelDefs[clothes.Item]?.Categories?.includes("Skirts")
                        && !ModelDefs[clothes.Item]?.Categories?.includes("NanoSkirts")) {
                        if (CheckPoseOrTags(Character, "Petsuits"))
                            clothes.Lost = true;
                    }
                    if (clothes.Group == "Shoes" || (StandalonePatched && ModelDefs[clothes.Item]?.Categories?.includes("Shoes"))) {
                        let inv = KinkyDungeonGetRestraintItem("ItemBoots");
                        if (inv && (!KDRestraint(inv).armor || KDToggles.DrawArmor))
                            clothes.Lost = true;
                        if (KinkyDungeonFlags.get("stripShoes"))
                            clothes.Lost = true;
                    }
                    if (!NoRestraints) {
                        for (let inv of drawnRestraints) {
                            if (KDRestraint(inv)?.remove && (!KDRestraint(inv).armor || KDToggles.DrawArmor)) {
                                for (let remove of KDRestraint(inv).remove) {
                                    if (remove == clothes.Group)
                                        clothes.Lost = true;
                                    if (StandalonePatched && ModelDefs[clothes.Item]?.Categories?.includes(remove))
                                        clothes.Lost = true;
                                }
                            }
                        }
                    }
                    if (clothes.Lost)
                        KinkyDungeonUndress += 1 / DressList.length;
                }
                if (!clothes.Lost || noLoss) {
                    if (KDRefreshCharacter.get(Character)) {
                        let filters = clothes.Filters;
                        if (clothes.factionFilters) {
                            filters = clothes.Filters ? JSON.parse(JSON.stringify(clothes.Filters)) : {};
                            if (customFaction) {
                                if (StandalonePatched) {
                                    if (clothes.factionFilters && GetPalette(Character, customFaction)) {
                                        for (let f of Object.entries(clothes.factionFilters)) {
                                            let C = Character;
                                            let faction = customFaction;
                                            if (GetPalette(C, faction)[f[1].color]) {
                                                if (f[1].override) {
                                                    filters[f[0]] = GetPalette(C, faction)[f[1].color];
                                                }
                                                else {
                                                    let origFilters = filters[f[0]];
                                                    if (!filters[f[0]])
                                                        filters[f[0]] = {};
                                                    filters[f[0]].saturation = GetPalette(C, faction)[f[1].color].hue >= -1 ?
                                                        GetPalette(C, faction)[f[1].color].saturation : 0;
                                                    filters[f[0]].contrast = (origFilters)
                                                        ? origFilters.contrast : 1;
                                                    filters[f[0]].gamma = (origFilters)
                                                        ? origFilters.gamma : 1;
                                                    filters[f[0]].brightness = (origFilters)
                                                        ? origFilters.brightness : 1;
                                                    filters[f[0]].red = GetPalette(C, faction)[f[1].color].red;
                                                    filters[f[0]].blue = GetPalette(C, faction)[f[1].color].blue;
                                                    filters[f[0]].green = GetPalette(C, faction)[f[1].color].green;
                                                    filters[f[0]].hue = GetPalette(C, faction)[f[1].color].hue;
                                                    filters[f[0]].colorize = GetPalette(C, faction)[f[1].color].colorize;
                                                }
                                                if (f[1].desaturate) {
                                                    filters[f[0]].saturation = 0;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        let item = KDInventoryWear(Character, clothes.Item, clothes.Group, undefined, clothes.Color, filters, clothes.Properties, clothes.factionFilters);
                        alreadyClothed[clothes.Group || clothes.Item] = true;
                        if (item) {
                            if (clothes.OverridePriority) {
                                if (item) {
                                    if (!item.Property)
                                        item.Property = { OverridePriority: clothes.OverridePriority };
                                    else
                                        item.Property.OverridePriority = clothes.OverridePriority;
                                }
                            }
                            else if (KDClothOverrides[clothes.Group || clothes.Item] && KDClothOverrides[clothes.Group || clothes.Item][clothes.Item] != undefined) {
                                if (!item.Property)
                                    item.Property = { OverridePriority: KDClothOverrides[clothes.Group || clothes.Item][clothes.Item] };
                                else
                                    item.Property.OverridePriority = KDClothOverrides[clothes.Group || clothes.Item][clothes.Item];
                            }
                            if (clothes.Property)
                                item.Property = clothes.Property;
                        }
                    }
                }
                if (!KDNaughtySetting) {
                    if (clothes.Group == "Panties" && !KinkyDungeonGetRestraintItem("ItemPelvis"))
                        clothes.Lost = false;
                    if (clothes.Group == "Bra" && !KinkyDungeonGetRestraintItem("ItemBreast"))
                        clothes.Lost = false;
                }
            }
        }
        else {
            for (let clothes of DressList) {
                if (alreadyClothed[clothes.Group || clothes.Item])
                    continue;
                data.updateDress = true;
                if (KDRefreshCharacter.get(Character)) {
                    let filters = clothes.Filters;
                    if (clothes.factionFilters) {
                        filters = clothes.Filters ? JSON.parse(JSON.stringify(clothes.Filters)) : {};
                        if (customFaction) {
                            if (StandalonePatched) {
                                if (clothes.factionFilters && GetPalette(Character, customFaction)) {
                                    for (let f of Object.entries(clothes.factionFilters)) {
                                        let C = Character;
                                        let faction = customFaction;
                                        if (GetPalette(C, faction)[f[1].color]) {
                                            if (f[1].override) {
                                                filters[f[0]] = GetPalette(C, faction)[f[1].color];
                                            }
                                            else {
                                                let origFilters = filters[f[0]];
                                                if (!filters[f[0]])
                                                    filters[f[0]] = {};
                                                filters[f[0]].saturation = GetPalette(C, faction)[f[1].color].hue >= -1 ?
                                                    GetPalette(C, faction)[f[1].color].saturation : 0;
                                                filters[f[0]].contrast = (origFilters)
                                                    ? origFilters.contrast : 1;
                                                filters[f[0]].gamma = (origFilters)
                                                    ? origFilters.gamma : 1;
                                                filters[f[0]].brightness = (origFilters)
                                                    ? origFilters.brightness : 1;
                                                filters[f[0]].red = GetPalette(C, faction)[f[1].color].red;
                                                filters[f[0]].blue = GetPalette(C, faction)[f[1].color].blue;
                                                filters[f[0]].green = GetPalette(C, faction)[f[1].color].green;
                                                filters[f[0]].hue = GetPalette(C, faction)[f[1].color].hue;
                                                filters[f[0]].colorize = GetPalette(C, faction)[f[1].color].colorize;
                                            }
                                            if (f[1].desaturate) {
                                                filters[f[0]].saturation = 0;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    KDInventoryWear(Character, clothes.Item, clothes.Group, undefined, clothes.Color, filters, clothes.Properties, clothes.factionFilters);
                    alreadyClothed[clothes.Group || clothes.Item] = true;
                }
            }
        }
        if (!NoRestraints) {
            if (KDRefreshCharacter.get(Character)) {
                data.extraForceDress = [];
                KinkyDungeonSendEvent("beforeDressRestraints", data);
                KinkyDungeonWearForcedClothes(Character, restraints, data.extraForceDress, customFaction, forceCustomFaction);
                KinkyDungeonSendEvent("dressRestraints", data);
            }
        }
        if (StandalonePatched && KDCurrentModels.get(Character)) {
            RefreshTempPoses(Character, true);
            KDRefreshPoseOptions(Character);
        }
        let AllowedArmPoses = StandalonePatched ? KDGetAvailablePosesArms(Character, customPlayerTags) : [];
        let AllowedLegPoses = StandalonePatched ? KDGetAvailablePosesLegs(Character, customPlayerTags) : [];
        if (Character == KinkyDungeonPlayer) {
            if (!KinkyDungeonPlayerTags.get("LieDown") && (KDGameData.KneelTurns > 0 || KDGameData.SleepTurns > 0)) {
                if (StandalonePatched) {
                    let newLegPoses = AllowedLegPoses.filter((element) => { return !STANDPOSES.includes(element); });
                    if (newLegPoses.length > 0)
                        AllowedLegPoses = newLegPoses;
                }
            }
        }
        if (StandalonePatched) {
            let CurrentExpression = {};
            CurrentExpression.ArmPose = KDGetPoseOfType(Character, "Arms");
            CurrentExpression.LegPose = KDGetPoseOfType(Character, "Legs");
            for (let pose of KDExpressionPoses) {
                CurrentExpression[pose] = KDGetPoseOfType(Character, pose.replace("Pose", ""));
            }
            let DefaultBound = "Front";
            let DefaultHobbled = "Closed";
            if (!AllowedLegPoses.includes(DefaultHobbled)) {
                DefaultHobbled = "Kneel";
            }
            if (!AllowedLegPoses.includes(DefaultHobbled)) {
                DefaultHobbled = "KneelClosed";
            }
            let PreferredArm = NPCDesiredPoses.get(Character)?.Arms || "Free";
            let PreferredLeg = NPCDesiredPoses.get(Character)?.Legs || "Spread";
            if (!AllowedLegPoses.includes(PreferredLeg)) {
                PreferredLeg = "Closed";
                if (!AllowedLegPoses.includes(PreferredLeg)) {
                    DefaultHobbled = "Kneel";
                    if (!AllowedLegPoses.includes(PreferredLeg)) {
                        DefaultHobbled = "KneelClosed";
                    }
                }
            }
            if (!AllowedArmPoses.includes(CurrentExpression.ArmPose)) {
                CurrentExpression.ArmPose = (AllowedArmPoses.includes(DefaultBound) && KinkyDungeonIsArmsBound(false, false)) ? DefaultBound : AllowedArmPoses[0];
            }
            if (!AllowedLegPoses.includes(CurrentExpression.LegPose)) {
                CurrentExpression.LegPose = (AllowedLegPoses.includes(DefaultHobbled)) ? DefaultHobbled : AllowedLegPoses[0];
            }
            if (CurrentExpression.ArmPose != PreferredArm && AllowedArmPoses.includes(PreferredArm)) {
                CurrentExpression.ArmPose = PreferredArm;
            }
            if (CurrentExpression.LegPose != PreferredLeg && AllowedLegPoses.includes(PreferredLeg)) {
                CurrentExpression.LegPose = PreferredLeg;
            }
            let expression = null;
            let stackedPriorities = {};
            let flags = KDGetEntityFlags(Character);
            for (let e of Object.entries(KDExpressions)) {
                if (!expression || e[1].priority > expression.priority) {
                    if (e[1].criteria(Character, flags)) {
                        expression = e[1];
                    }
                }
                if (e[1].stackable) {
                    if (!e[1].criteria(Character, flags))
                        continue;
                    let result = null;
                    for (let poseType of KDExpressionPoses) {
                        if (e[1].priority > (stackedPriorities[poseType] || 0)) {
                            result = result || e[1].expression(Character, flags);
                            if (result[poseType]) {
                                stackedPriorities[poseType] = e[1].priority;
                                if (!(KDNPCPoses.get(Character) && KDNPCPoses.get(Character)["Current" + poseType]))
                                    CurrentExpression[poseType] = result[poseType];
                            }
                        }
                    }
                }
            }
            if (expression) {
                let result = expression.expression(Character, flags);
                for (let pose of KDExpressionPoses) {
                    if (!(KDNPCPoses.get(Character)
                        && KDNPCPoses.get(Character)["CurrentPose" + pose.replace("Pose", "")])
                        && result[pose])
                        CurrentExpression[pose] = result[pose];
                    else if (KDNPCPoses.get(Character)
                        && KDNPCPoses.get(Character)["CurrentPose" + pose.replace("Pose", "")])
                        CurrentExpression[pose] = KDNPCPoses.get(Character)["CurrentPose" + pose.replace("Pose", "")] || "";
                }
            }
            if (KDCurrentModels.get(Character)) {
                KDCurrentModels.get(Character).Poses = KDGeneratePoseArray(CurrentExpression.ArmPose, CurrentExpression.LegPose, CurrentExpression.EyesPose, CurrentExpression.BrowsPose, CurrentExpression.BlushPose, CurrentExpression.MouthPose, CurrentExpression.Eyes2Pose, CurrentExpression.Brows2Pose, undefined, CurrentExpression.FearPose);
                KDUpdateTempPoses(Character);
            }
        }
        KinkyDungeonSendEvent("afterDress", data);
    }
    finally {
        CharacterRefresh = _CharacterRefresh;
        CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
    }
    if (StandalonePatched && KDCurrentModels.get(Character)) {
        KDRefreshPoseOptions(Character);
        let Xray = [];
        if (KDToggleXRay > 0) {
            Xray = ["Xray"];
            if (KDToggleXRay > 1 && Character?.Appearance?.some((A) => {
                return A.Model?.Layers && Object.values(A.Model?.Layers).some((L) => { return Object.keys(LayerGroups.XrayFace).some((L2) => { return L2 == L.Layer; }); });
            })) {
                Xray.push("XrayFace");
            }
            if (Character?.Appearance?.some((A) => {
                return A.Model?.Layers && A.Model?.Categories && Object.values(A.Model.Categories).some((C) => { return C == "ChastityBelt"; });
            })) {
                Xray.push("XrayPanties");
            }
            if (Character?.Appearance?.some((A) => {
                return A.Model?.Layers && A.Model?.Categories && Object.values(A.Model.Categories).some((C) => { return C == "ChastityBra"; });
            })) {
                Xray.push("XrayBra");
            }
        }
        if (KDRefreshCharacter.get(Character)
            || Character == KinkyDungeonPlayer
            || Character == KDSpeakerNPC
            || Character == KDPreviewModel
            || !(KDCurrentModels.get(Character)?.Poses?.Body)
            || Math.random() < 0.05)
            UpdateModels(Character, Xray, customFaction);
        let ReUpdate = false;
        let defaultStyle = UIItemFromList(null, DefaultStyles);
        let hairstyle = KDNPCStyle.get(Character)?.hairstyle
            || (KDModelStyles[defaultStyle]?.Hairstyle ? UIItemFromList(null, KDModelStyles[defaultStyle]?.Hairstyle) : "")
            || "Default";
        let bodystyle = KDNPCStyle.get(Character)?.bodystyle
            || (KDModelStyles[defaultStyle]?.Hairstyle ? UIItemFromList(null, KDModelStyles[defaultStyle]?.Bodystyle) : "")
            || "Default";
        let facestyle = KDNPCStyle.get(Character)?.facestyle
            || (KDModelStyles[defaultStyle]?.Hairstyle ? UIItemFromList(null, KDModelStyles[defaultStyle]?.Facestyle) : "")
            || "Default";
        let cosplaystyle = KDNPCStyle.get(Character)?.cosplaystyle || "Default";
        if (!KDCurrentModels.get(Character)?.Poses?.Body && KDModelBody[bodystyle]) {
            for (let body of Object.values(KDModelBody[bodystyle])) {
                KDInventoryWear(Character, body.Item, undefined, undefined, undefined, body.Filters, body.Properties, body.factionFilters);
                ReUpdate = true;
            }
            if (!KDCurrentModels.get(Character)?.Poses?.Hair && KDModelHair[hairstyle]) {
                for (let hair of Object.values(KDModelHair[hairstyle])) {
                    KDInventoryWear(Character, hair.Item, undefined, undefined, undefined, hair.Filters, hair.Properties, hair.factionFilters);
                    ReUpdate = true;
                }
            }
            if (!KDCurrentModels.get(Character)?.Poses?.Eyes && KDModelFace[facestyle]) {
                for (let face of Object.values(KDModelFace[facestyle])) {
                    KDInventoryWear(Character, face.Item, undefined, undefined, undefined, face.Filters, face.Properties, face.factionFilters);
                    ReUpdate = true;
                }
            }
        }
        if (!KDCurrentModels.get(Character)?.Poses?.Fear && KDModelFace[facestyle]) {
            KDInventoryWear(Character, "Fear", undefined, undefined, undefined, undefined, undefined);
            ReUpdate = true;
        }
        if (!KDCurrentModels.get(Character)?.Poses?.Cosplay && KDModelCosplay[cosplaystyle]) {
            for (let cosplay of Object.values(KDModelCosplay[cosplaystyle])) {
                KDInventoryWear(Character, cosplay.Item, undefined, undefined, undefined, cosplay.Filters, cosplay.Properties, cosplay.factionFilters);
                ReUpdate = true;
            }
        }
        if (KDRefreshCharacter.get(Character) || Character == KinkyDungeonPlayer || Character == KDSpeakerNPC)
            if (ReUpdate)
                UpdateModels(Character, Xray, customFaction);
        if (Force) {
            ForceRefreshModels(Character);
        }
        KinkyDungeonCheckClothesLoss = false;
        KDRefreshCharacter.delete(Character);
    }
}
let KDRefreshCharacter = new Map();
function KDInitProtectedGroups(C) {
    if (!C)
        C = KinkyDungeonPlayer;
    if (C == KinkyDungeonPlayer) {
        KDProtectedCosplay = [];
        for (let a of C.Appearance) {
            if (a.Asset?.Group?.BodyCosplay || (a.Model?.SuperProtected && a.Model.Group)) {
                KDProtectedCosplay.push(a.Asset.Group?.Name || a.Model.Group);
            }
        }
    }
}
function KinkyDungeonWearForcedClothes(C, restraints, extraForceDress, customFaction, forceCustomFaction = false) {
    if (!C)
        C = KinkyDungeonPlayer;
    for (let dress of extraForceDress) {
        let canReplace = (dress.override !== null && dress.override === true) ? true : !InventoryGet(C, dress.Group);
        if (dress.Group && !canReplace) {
            return;
        }
        if (dress.Group && C == KinkyDungeonPlayer && KDProtectedCosplay.includes(dress.Group)) {
            return;
        }
        let filters = dress.Filters ? JSON.parse(JSON.stringify(dress.Filters)) : {};
        let Properties = dress.Properties ? JSON.parse(JSON.stringify(dress.Properties)) : {};
        let faction = dress.faction;
        if (dress.faction) {
            if (StandalonePatched) {
                if (dress.factionFilters && faction && GetPalette(C, faction)) {
                    for (let f of Object.entries(dress.factionFilters)) {
                        if (GetPalette(C, faction)[f[1].color])
                            filters[f[0]] = GetPalette(C, faction)[f[1].color];
                    }
                }
            }
        }
        KDInventoryWear(C, dress.Model, undefined, undefined, undefined, filters, Properties);
    }
    if (!restraints)
        restraints = C == KinkyDungeonPlayer ? KinkyDungeonAllRestraint() : [];
    for (let i = restraints.length - 1; i >= 0; i--) {
        let inv = restraints[i];
        if (StandalonePatched && KDRestraint(inv)?.alwaysDressModel) {
            KDRestraint(inv).alwaysDressModel.forEach(dress => {
                let canReplace = (dress.override !== null && dress.override === true) ? true : !InventoryGet(C, dress.Group);
                if (dress.Group && !canReplace) {
                    return;
                }
                if (dress.Group && C == KinkyDungeonPlayer && KDProtectedCosplay.includes(dress.Group)) {
                    return;
                }
                let filters = dress.Filters ? JSON.parse(JSON.stringify(dress.Filters)) : {};
                let Properties = dress.Properties ? JSON.parse(JSON.stringify(dress.Properties)) : {};
                let faction = (inv.forceFaction != undefined) ? inv.forceFaction : (((forceCustomFaction || !inv.faction) && customFaction) ? customFaction : (inv.faction ? inv.faction : ""));
                if (faction) {
                    if (dress.factionFilters && faction && GetPalette(C, faction)) {
                        for (let f of Object.entries(dress.factionFilters)) {
                            if (GetPalette(C, faction)[f[1].color])
                                filters[f[0]] = GetPalette(C, faction)[f[1].color];
                        }
                    }
                }
                KDInventoryWear(C, dress.Model, undefined, undefined, undefined, dress.inheritFilters ? KDRestraint(inv).Filters : (filters), Properties);
            });
        }
    }
}
function KDCharacterAppearanceSetColorForGroup(Player, Color, Group) {
    let item = InventoryGet(Player, Group);
    if (item) {
        item.Color = Color;
    }
}
function KinkyDungeonGetOutfit(Name) {
    if (KinkyDungeonOutfitCache && KinkyDungeonOutfitCache.get(Name)) {
        let outfit = {};
        Object.assign(outfit, KinkyDungeonOutfitCache.get(Name));
        return outfit;
    }
    return null;
}
function KDInventoryWear(Character, AssetName, AssetGroup, _par, color, filters, Properties, factionFilters) {
    const M = StandalonePatched ? ModelDefs[AssetName] : undefined;
    if (!M)
        return;
    let item = KDAddModel(Character, AssetGroup, M, color || "Default", filters, undefined, Properties, factionFilters);
    CharacterRefresh(Character, true);
    return item;
}
function KDCharacterNaked(Character) {
    if (!Character)
        Character = KinkyDungeonPlayer;
    KDCharacterAppearanceNaked(Character);
    CharacterRefresh(Character);
}
function KDCharacterAppearanceNaked(C) {
    for (let A = C.Appearance.length - 1; A >= 0; A--) {
        if (StandalonePatched) {
            if (!C.Appearance[A].Model.Restraint) {
                let f = !(C.Appearance[A]?.Model
                    && ((C == KinkyDungeonPlayer &&
                        KDProtectedCosplay.includes(C.Appearance[A].Model.Group))
                        || KDModelIsProtected(C.Appearance[A].Model)
                        || C.Appearance[A].Model.SuperProtected));
                if (!f) {
                    continue;
                }
                C.Appearance.splice(A, 1);
            }
        }
        else {
            if (C.Appearance[A].Asset.Group.AllowNone &&
                (C.Appearance[A].Asset.Group.Category === "Appearance")) {
                let f = !(C.Appearance[A]?.Asset.Group.BodyCosplay
                    && C == KinkyDungeonPlayer && (KDProtectedCosplay.includes(C.Appearance[A].Asset.Group.Name)));
                if (!f) {
                    continue;
                }
                C.Appearance.splice(A, 1);
            }
        }
    }
}
function KDApplyItem(C, inv, tags, customFaction = undefined, forceCustomFaction) {
    if (StandalonePatched) {
        let restraint = KDRestraint(inv);
        let AssetGroup = restraint.AssetGroup ? restraint.AssetGroup : restraint.Group;
        let faction = (inv.forceFaction != undefined) ? inv.forceFaction : (((forceCustomFaction || !inv.faction) && customFaction) ? customFaction : (inv.faction ? inv.faction : ""));
        let filters = (restraint.Filters || (ModelDefs[restraint.Model || restraint.Asset])?.Filters) ?
            JSON.parse(JSON.stringify(restraint.Filters || (ModelDefs[restraint.Model || restraint.Asset])?.Filters))
            : {};
        let Properties = (restraint.Properties || (ModelDefs[restraint.Model || restraint.Asset])?.Properties) ?
            JSON.parse(JSON.stringify(restraint.Properties || (ModelDefs[restraint.Model || restraint.Asset])?.Properties))
            : {};
        let factionFilters = (restraint.factionFilters || (ModelDefs[restraint.Model || restraint.Asset])?.factionFilters) ?
            JSON.parse(JSON.stringify(restraint.factionFilters || (ModelDefs[restraint.Model || restraint.Asset])?.factionFilters))
            : {};
        if (!forceCustomFaction)
            factionFilters = undefined;
        if (restraint.factionFilters && faction && GetPalette(C, faction)) {
            for (let f of Object.entries(restraint.factionFilters)) {
                if (GetPalette(C, faction)[f[1].color]) {
                    if (f[1].override) {
                        filters[f[0]] = GetPalette(C, faction, !f[1].desaturate, !f[1].desaturate)[f[1].color];
                    }
                    else {
                        let origFilters = filters[f[0]];
                        if (!filters[f[0]])
                            filters[f[0]] = {};
                        filters[f[0]].saturation = GetPalette(C, faction)[f[1].color].hue >= -1 ?
                            GetPalette(C, faction)[f[1].color].saturation : 0;
                        filters[f[0]].contrast = (origFilters)
                            ? origFilters.contrast : 1;
                        filters[f[0]].gamma = (origFilters)
                            ? origFilters.gamma : 1;
                        filters[f[0]].brightness = (origFilters)
                            ? origFilters.brightness : 1;
                        filters[f[0]].red = GetPalette(C, faction)[f[1].color].red;
                        filters[f[0]].blue = GetPalette(C, faction)[f[1].color].blue;
                        filters[f[0]].green = GetPalette(C, faction)[f[1].color].green;
                        filters[f[0]].hue = GetPalette(C, faction)[f[1].color].hue;
                        filters[f[0]].colorize = GetPalette(C, faction)[f[1].color].colorize;
                    }
                    if (f[1].desaturate) {
                        filters[f[0]].saturation = 0;
                    }
                }
            }
        }
        let data = {
            Filters: filters,
            Properties: Properties,
            factionFilters: factionFilters,
            faction: faction,
            Character: C,
            item: inv,
            Wornitems: KDGetCharacterID(C) && KDGameData.NPCRestraints[KDGetCharacterID(C)] ?
                Object.values(KDGameData.NPCRestraints[KDGetCharacterID(C)])
                    .filter((rest) => { return rest.events; })
                    .map((rest) => { return rest.id; })
                : [],
            NPCRestraintEvents: KDGetCharacterID(C) ?
                KDGameData.NPCRestraints[KDGetCharacterID(C)]
                : undefined,
        };
        KinkyDungeonSendEvent("apply", data);
        let placed = null;
        if (!restraint.armor || KDToggles.DrawArmor) {
            placed = KDAddModel(C, AssetGroup, ModelDefs[restraint.Model || restraint.Asset], "", data.Filters, inv, data.Properties, data.factionFilters);
        }
        if (placed) {
            let type = restraint.Type;
            if (restraint.changeRenderType && Object.keys(restraint.changeRenderType).some((k) => { return tags.has(k); })) {
                let key = Object.keys(restraint.changeRenderType).filter((k) => { return tags.has(k); })[0];
                if (key) {
                    type = restraint.changeRenderType[key];
                }
            }
            placed.Property = { Type: type, Modules: restraint.Modules, Difficulty: restraint.power, LockedBy: inv.lock || (KDGetCurse(inv) && KDCurses[KDGetCurse(inv)].lock) ? "MetalPadlock" : undefined };
        }
        return;
    }
}
function KinkyDungeonSendOutfitEvent(Event, data) {
    if (!KDMapHasEvent(KDEventMapOutfit, Event))
        return;
    let outfit = KDOutfit({ name: data.CurrentDress || KinkyDungeonCurrentDress });
    if (outfit && outfit.events) {
        for (let e of outfit.events) {
            if (e.trigger == Event) {
                KinkyDungeonHandleOutfitEvent(Event, e, outfit, data);
            }
        }
    }
}
function KDGetRemovePoses(C, PoseList) {
    let poses = [];
    if (C == KinkyDungeonPlayer) {
        if (KinkyDungeonPlayerTags.get("DontLinkFeet")) {
            poses.push("FeetLinked");
        }
        if (KinkyDungeonPlayerTags.get("DontBindLegs")) {
            poses.push("LegBind");
        }
    }
    else {
        if (NPCTags.get(C)) {
            let tags = NPCTags.get(C);
            if (tags.get("DontLinkFeet")) {
                poses.push("FeetLinked");
            }
            if (tags.get("DontBindLegs")) {
                poses.push("LegBind");
            }
        }
    }
    if (PoseList.DontLinkFeet)
        poses.push("FeetLinked");
    if (PoseList.DontBindLegs)
        poses.push("LegBind");
    return poses;
}
function KDGetExtraPoses(C) {
    let poses = [];
    if (C == KinkyDungeonPlayer) {
        if (KinkyDungeonIsHandsBound()) {
            poses.push("HandsBound");
        }
        if (KinkyDungeonPlayerTags.get("LinkFeet")) {
            poses.push("FeetLinked");
        }
        if (KDIsPlayerTethered(KDPlayer()) && !!KDPlayer().leash) {
            poses.push("Pulled");
        }
    }
    else {
        if (NPCTags.get(C)) {
            let tags = NPCTags.get(C);
            if (tags.get("LinkFeet")) {
                poses.push("FeetLinked");
            }
        }
        if (KDNPCChar_ID.get(C)) {
            let id = KDNPCChar_ID.get(C);
            let npc = KDLookupID(id);
            if (npc) {
                if (KDIsPlayerTethered(npc) && !!KDPlayer().leash) {
                    poses.push("Pulled");
                }
            }
        }
    }
    return poses;
}
function KDGetEntityFlags(C) {
    let flags = new Map();
    if (C == KinkyDungeonPlayer) {
        for (let flag of KinkyDungeonFlags.entries()) {
            flags.set(flag[0], flag[1]);
        }
    }
    else {
        let flgs = {};
        let id = KDGetCharacterID(C);
        if (id) {
            let entity = KinkyDungeonFindID(id);
            if (!entity && KDGameData.Collection["" + id]) {
                flgs = KDGameData.Collection["" + id].flags;
            }
            else if (entity)
                flgs = entity.flags || {};
        }
        if (flgs)
            for (let flag of Object.entries(flgs)) {
                flags.set(flag[0], flag[1]);
            }
    }
    return flags;
}
function KDUpdateTempPoses(Character) {
    KDRefreshPoseOptions(Character);
    for (let pose of Object.keys(KDCurrentModels.get(Character).TempPoses)) {
        if (KDCurrentModels.get(Character).Poses[pose])
            delete KDCurrentModels.get(Character).TempPoses[pose];
        else
            KDCurrentModels.get(Character).Poses[pose] = true;
    }
    let extraPose = KDGetExtraPoses(Character);
    if (extraPose) {
        for (let pose of extraPose) {
            KDCurrentModels.get(Character).Poses[pose] = true;
        }
    }
    let removePose = KDGetRemovePoses(Character, KDCurrentModels.get(Character).Poses);
    if (removePose) {
        for (let pose of removePose) {
            delete KDCurrentModels.get(Character).Poses[pose];
        }
    }
}
function KDGetPalettes(C, safe, includeDefault = true, defaultOverride) {
    if (!defaultOverride)
        defaultOverride = KDDefaultWardrobePalettes;
    if (C?.metadata?.customColors) {
        let newPalettes = {};
        for (let palette in KinkyDungeonFactionFilters) {
            newPalettes[palette] = KinkyDungeonFactionFilters[palette];
        }
        for (let palette in C.metadata.customColors) {
            newPalettes[palette] = C.metadata.customColors[palette];
        }
        if (includeDefault) {
            for (let palette in defaultOverride) {
                if (newPalettes[palette])
                    continue;
                newPalettes[palette] = defaultOverride[palette];
            }
        }
        return safe ? structuredClone(newPalettes) : newPalettes;
    }
    if (safe || includeDefault) {
        let newPalettes = {};
        for (let palette in KinkyDungeonFactionFilters) {
            newPalettes[palette] = KinkyDungeonFactionFilters[palette];
        }
        if (includeDefault) {
            for (let palette in defaultOverride) {
                if (newPalettes[palette])
                    continue;
                newPalettes[palette] = defaultOverride[palette];
            }
        }
        return safe ? structuredClone(newPalettes) : newPalettes;
    }
    return safe ? structuredClone(KinkyDungeonFactionFilters) : KinkyDungeonFactionFilters;
}
function GetPalette(C, palette, safeChar, safeMain) {
    if (C?.metadata?.customColors && C.metadata.customColors[palette]) {
        return (safeChar && C.metadata.customColors[palette]) ? JSON.parse(JSON.stringify(C.metadata.customColors[palette])) : C.metadata.customColors[palette];
    }
    return (safeMain && KinkyDungeonFactionFilters[palette]) ? JSON.parse(JSON.stringify(KinkyDungeonFactionFilters[palette])) : KinkyDungeonFactionFilters[palette];
}
function KDGetFactionFilters(faction) {
    if (KinkyDungeonFactionFilters[faction])
        return KinkyDungeonFactionFilters[faction];
    if (KDFactionProperties[faction]?.jailAlliedFaction && KinkyDungeonFactionFilters[KDFactionProperties[faction]?.jailAlliedFaction])
        return KinkyDungeonFactionFilters[KDFactionProperties[faction]?.jailAlliedFaction];
    return undefined;
}
function KinkyDungeonHeadpatModal() {
    const id = "kinky-dungeon-headpat-modal";
    if (document.querySelector(`#${id}`)) {
        let el = document.getElementById(id);
        el.parentNode.removeChild(el);
    }
    const backdrop = document.createElement("div");
    backdrop.id = id;
    let windowoffsets = KDGetWindowCanvasOffset();
    let pxassign = {
        position: "absolute",
        width: `${windowoffsets.canvaswidth * 0.06}px`,
        height: `${windowoffsets.canvasheight * 0.055}px`,
        top: "0px",
        left: "0px",
        transform: "none",
    };
    let hardpointlocs = GetHardpointLoc(KinkyDungeonPlayer, KDPlayerPos().x, KDPlayerPos().y, KDCharSize, "HeadpatHead", KDToggles.FlipPlayer);
    pxassign.top = `${(windowoffsets.y + (hardpointlocs.y * windowoffsets.heightscale) - ((windowoffsets.canvasheight * 0.05) / 2))}px`;
    pxassign.left = `${(windowoffsets.x + (hardpointlocs.x * windowoffsets.widthscale) - ((windowoffsets.canvaswidth * 0.08) / 2))}px`;
    pxassign.transform = `rotate(${hardpointlocs.angle}rad)`;
    Object.assign(backdrop.style, pxassign);
    backdrop.addEventListener("click", () => {
        console.log("Headpats!");
        if ((KinkyDungeonState == 'Game') && (KinkyDungeonDrawState == 'Game')) {
            KinkyDungeonSetFlag("clickheadpatted_recently", 5);
            if (!KDMapData.clickHeadpatted) {
                KDMapData.clickHeadpatted = true;
                KDChangeWill("", "", "", 0.5);
                KinkyDungeonSendTextMessage(4, TextGet("KDClickedHeadpat"), "#ffffff", 4);
            }
            else {
                KinkyDungeonSendTextMessage(4, TextGet("KDClickedHeadpatNoWill"), "#ffffff", 4);
            }
            KinkyDungeonAdvanceTime(1, true, true);
        }
    });
    document.body.appendChild(backdrop);
}
let KDDefaultRestraintPaletteThreshold = 5;
function KDGetRestraintsPalette(C) {
    let biggest = "";
    let biggestPower = KDDefaultRestraintPaletteThreshold;
    let factionWeights = {};
    for (let inv of KDAllRestraintDynamicList()) {
        let faction = inv.faction;
        if (inv.faction) {
            if (!factionWeights[faction])
                factionWeights[faction] = 1;
            let power = KinkyDungeonRestraintPower(inv);
            if (power >= 1) {
                factionWeights[faction] += power;
                if (factionWeights[faction] > biggestPower) {
                    biggestPower = factionWeights[faction];
                    biggest = faction;
                }
            }
        }
    }
    return biggest;
}
function KDGetPlayerPalette(C) {
    let palette = "";
    let outfit = KDOutfit({ name: KinkyDungeonCurrentDress });
    let restraintPalette = KDToggles.RestraintPalette ? KDGetRestraintsPalette(C) : "";
    if ((KDToggles.ForcePalette || outfit?.palette || restraintPalette || (C.metadata?.palette || C.Palette))
        && (KDToggles.ApplyPaletteTransform
            && (outfit?.palette || (C.metadata?.palette || C.Palette)
                || !KDDefaultPalette || GetPalette(C, KDDefaultPalette)))) {
        palette = (KDToggles.NoOutfitPalette ? undefined : outfit?.palette)
            || restraintPalette
            || (KDToggles.NoOutfitPalette ? undefined : (C.metadata?.palette || C.Palette)) || KDDefaultPalette;
    }
    return palette;
}
let DefaultStyles = [
    "BlueHair", "GreenHair", "WhiteHair", "Ice", "Water", "Earth", "Air", "Fire", "RedHair",
];
//# sourceMappingURL=KinkyDungeonDress.js.map