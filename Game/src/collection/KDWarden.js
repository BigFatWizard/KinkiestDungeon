"use strict";
function KDDrawWarden(x, y, width) {
    let dd = 285;
    if (y + dd < 940) {
        let yy = y;
        yy += KDDrawServantPrisonerList("Warden", x + 50, yy + 70, width, 80);
        let ii = 0;
        DrawTextFitKD(TextGet("KDWardenTightened")
            .replace("AMNT", "" + KDGameData.FacilitiesData.Warden_TightenedCount), x + 50, yy + 80 + 30 * ii++, width - 100, KDBaseWhite, KDTextGray0, 18, "left");
        if (!KDGetContainer("WardenChest") || Object.values(KDGetContainer("WardenChest").items).length == 0)
            DrawTextFitKD(TextGet("KDWardenNoRestraints"), x + 50, yy + 80 + 30 * ii++, width - 100, KDBaseWhite, KDTextGray0, 18, "left");
        DrawButtonKDEx("chestbutton", () => {
            KDUI_ContainerBackScreen = KinkyDungeonDrawState;
            KinkyDungeonDrawState = "Container",
                KinkyDungeonCurrentFilter = "All";
            KDUI_CurrentContainer = "WardenChest";
        }, true, x + 900, yy + 60, 80, 80, "", KDBaseWhite, KinkyDungeonRootDirectory + "UI/Safe.png", undefined, undefined, undefined, undefined, undefined, undefined, {
            centered: true,
        });
    }
    return dd;
}
function KDUpdateWarden(delta) {
    if (!delta)
        return;
    let facility = "Warden";
    let wardenPower = 0;
    let WardenItems = KDGetContainer("WardenChest")?.items || {};
    KDGameData.FacilitiesData.Warden_TightenedCount = 0;
    if (KDGameData.FacilitiesData["Servants_" + facility])
        for (let servant of KDGameData.FacilitiesData["Servants_" + facility]) {
            let value = KDGameData.Collection[servant + ""];
            if (value) {
                wardenPower += 1 + KDEnemyTypeRank(KinkyDungeonGetEnemyByName(value.type));
            }
        }
    if (wardenPower) {
        for (let value of Object.values(KDGameData.Collection)) {
            if (!value.status && !KDNPCUnavailable(value.id, value.status)) {
                let entity = KDGetGlobalEntity(value.id);
                if (entity?.items) {
                    let restraints = entity.items.filter((str) => {
                        return KDRest(str);
                    });
                    for (let item of restraints) {
                        if (WardenItems[item])
                            WardenItems[item].quantity = (WardenItems[item].quantity || 1) + 1;
                        else {
                            if (KinkyDungeonRestraintVariants[item]) {
                                WardenItems[item] = KDGetInventoryVariant(KinkyDungeonRestraintVariants[item], undefined, KinkyDungeonRestraintVariants[item].curse, "", item);
                            }
                            else {
                                WardenItems[item] = {
                                    name: item,
                                    id: KinkyDungeonGetItemID(),
                                    type: LooseRestraint,
                                    quantity: 1,
                                    showInQuickInv: KinkyDungeonRestraintVariants[item] != undefined,
                                };
                            }
                        }
                        entity.items.splice(entity.items.indexOf(item), 1);
                    }
                }
            }
        }
        let entries = [];
        for (let value of Object.values(KDGameData.Collection)) {
            if (!value.status && KDValidateEscapeGrace(value) && !KDNPCUnavailable(value.id, value.status)) {
                entries.push(value);
            }
        }
        if (entries.length > 0) {
            for (let value of entries) {
                let currentBondage = KDGetExpectedBondageAmountTotal(value.id, undefined, false);
                let enemy = KinkyDungeonGetEnemyByName(value.type);
                let neededBondage = enemy.maxhp * KDNPCStruggleThreshMultType(enemy);
                if (currentBondage < neededBondage) {
                    let availableRestraints = Object.values(WardenItems);
                    let iterations = 0;
                    let maxIterations = availableRestraints.length;
                    while (availableRestraints.length > 0
                        && iterations++ < maxIterations
                        && currentBondage < neededBondage) {
                        let testItem = availableRestraints.splice(Math.floor(KDRandom() * availableRestraints.length), 1)[0];
                        let rest = KDRestraint(testItem);
                        if (!rest)
                            continue;
                        if (KDGenericRestraintRawOriginalCache[rest.name]) {
                            let q = testItem.quantity || 1;
                            for (let rr of KDGenericRestraintRawOriginalCache[rest.name]) {
                                if (!KDRestraint(rr))
                                    continue;
                                if (rr.count > q)
                                    continue;
                                let slot = KDGetNPCBindingSlotForItem(KDRestraint(rr), value.id, false);
                                if (slot) {
                                    if (KDInputSetNPCRestraint({
                                        slot: slot.sgroup.id,
                                        id: undefined,
                                        faction: testItem.faction,
                                        restraint: rr.name,
                                        restraintid: KinkyDungeonGetItemID(),
                                        lock: "",
                                        variant: undefined,
                                        events: undefined,
                                        powerbonus: undefined,
                                        inventoryVariant: undefined,
                                        npc: value.id,
                                        player: -1,
                                        noInventory: true,
                                        name: undefined,
                                    }, WardenItems))
                                        q -= rr.count;
                                    testItem.quantity = q;
                                    if (q <= 0) {
                                        delete WardenItems[testItem.name];
                                        break;
                                    }
                                    KDGameData.FacilitiesData.Warden_TightenedCount += 1;
                                    currentBondage = KDGetExpectedBondageAmountTotal(value.id, undefined, false);
                                }
                            }
                        }
                        else {
                            let slot = KDGetNPCBindingSlotForItem(rest, value.id, false);
                            if (slot) {
                                if (KDInputSetNPCRestraint({
                                    slot: slot.sgroup.id,
                                    id: undefined,
                                    faction: testItem.faction,
                                    restraint: testItem.name,
                                    restraintid: testItem.id,
                                    lock: "",
                                    variant: undefined,
                                    events: testItem.events,
                                    powerbonus: undefined,
                                    inventoryVariant: testItem.inventoryVariant,
                                    npc: value.id,
                                    player: -1,
                                    name: undefined,
                                }, WardenItems))
                                    KDGameData.FacilitiesData.Warden_TightenedCount += 1;
                                currentBondage = KDGetExpectedBondageAmountTotal(value.id, undefined, false);
                            }
                        }
                        if (testItem?.quantity <= 0) {
                            availableRestraints = Object.values(WardenItems);
                        }
                    }
                }
                KDNPCRefreshBondage(value.id, -1, false, false, KDGetContainer("WardenChest", undefined, undefined, true, KDWardenChestFilters).items);
                KDValidateEscapeGrace(value);
            }
        }
    }
}
let KDWardenChestFilters = [Restraint, Outfit, Consumable, Weapon];
let KDPlayerChestFilters = [Restraint];
//# sourceMappingURL=KDWarden.js.map