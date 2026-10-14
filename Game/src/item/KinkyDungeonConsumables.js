"use strict";
function KDConsumable(item) {
    return KinkyDungeonConsumables[item.name];
}
function KinkyDungeonFindConsumable(Name) {
    for (let con of Object.values(KinkyDungeonConsumables)) {
        if (con.name == Name)
            return con;
    }
    return undefined;
}
function KinkyDungeonFindBasic(Name) {
    for (let con of Object.values(KinkyDungneonBasic)) {
        if (con.name == Name)
            return con;
    }
    return undefined;
}
function KinkyDungeonFindConsumableOrBasic(Name) {
    for (let con of Object.values(KinkyDungeonConsumables)) {
        if (con.name == Name)
            return con;
    }
    for (let con of Object.values(KinkyDungneonBasic)) {
        if (con.name == Name)
            return con;
    }
    return undefined;
}
function KinkyDungeonGetInventoryItem(Name, Filter = Consumable) {
    let Filtered = KinkyDungeonFilterInventory(Filter);
    for (let item of Filtered) {
        if (item.name == Name)
            return item;
    }
    return null;
}
function KinkyDungeonConsumableCount(Name) {
    if (KinkyDungeonInventoryGet(Name)) {
        if (KinkyDungeonInventoryGet(Name).quantity == undefined)
            return 1;
        else
            return KinkyDungeonInventoryGet(Name).quantity;
    }
    let item = KinkyDungeonGetInventoryItem(Name, Consumable);
    if (item && item.item && item.item.quantity) {
        return item.item.quantity;
    }
    return 0;
}
function KinkyDungeonItemCount(Name) {
    if (KinkyDungeonInventoryGet(Name)) {
        if (KinkyDungeonInventoryGet(Name).quantity == undefined)
            return 1;
        else
            return KinkyDungeonInventoryGet(Name).quantity;
    }
    let item = KinkyDungeonGetInventoryItem(Name);
    if (item && item.item && item.item.quantity) {
        return item.item.quantity;
    }
    return 0;
}
function KinkyDungeonGetShopItem(_Level, Rarity, _Shop, ShopItems, uniqueTags = {}) {
    let Table = [];
    let params = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)];
    if (params.ShopExclusives) {
        for (let exc of params.ShopExclusives) {
            Table.push(exc);
        }
    }
    if (KinkyDungeonStatsChoice.get('arousalMode')) {
        if (params.ShopExclusivesArousal) {
            for (let exc of params.ShopExclusivesArousal) {
                Table.push(exc);
            }
        }
    }
    let Shopable = Object.entries(KinkyDungeonConsumables).filter(([_k, v]) => (v.shop));
    for (let S = 0; S < Shopable.length; S++) {
        let s = Shopable[S][1];
        s.shoptype = Consumable;
        if ((KinkyDungeonStatsChoice.get('arousalMode') || !KinkyDungeonConsumables[s.name].arousalMode))
            Table.push(s);
    }
    Shopable = Object.entries(KinkyDungneonBasic).filter(([_k, v]) => (v.shop));
    for (let S = 0; S < Shopable.length; S++) {
        let s = Shopable[S][1];
        s.shoptype = "basic";
        if ((!s.ignoreInventory || !KinkyDungeonInventoryGet(s.ignoreInventory)) && (KinkyDungeonStatsChoice.get('arousalMode') || !s.arousalMode))
            Table.push(s);
    }
    Shopable = Object.entries(KinkyDungneonShopRestraints).filter(([_k, v]) => (v.shop));
    for (let S = 0; S < Shopable.length; S++) {
        let s = Shopable[S][1];
        s.shoptype = LooseRestraint;
        if (!KinkyDungeonInventoryGet(s.name) && (KinkyDungeonStatsChoice.get('arousalMode') || !s.arousalMode))
            Table.push(s);
    }
    Shopable = Object.entries(KinkyDungeonWeapons).filter(([_k, v]) => (v.shop));
    for (let S = 0; S < Shopable.length; S++) {
        let s = Shopable[S][1];
        s.shoptype = Weapon;
        if (!KinkyDungeonInventoryGet(s.name) && (KinkyDungeonStatsChoice.get('arousalMode') || !KinkyDungeonWeapons[s.name].arousalMode))
            Table.push(s);
    }
    for (let R = Rarity; R >= 0; R--) {
        let available = Table.filter((item) => (item.rarity == R && !ShopItems.some((item2) => { return item2.name == item.name; })));
        available = available.filter((item) => {
            return !item.uniqueTags || !item.uniqueTags.some((t) => { return uniqueTags[t]; });
        });
        if (available.length > 0)
            return available[Math.floor(KDRandom() * available.length)];
    }
    return null;
}
function KDChangeConsumable(src, type, trig, consumable, Quantity, container) {
    let item = container ? container.items[consumable.name] : KinkyDungeonInventoryGetConsumable(consumable.name);
    let data = {
        src: src,
        type: type,
        trig: trig,
        item: item,
        consumable: consumable,
        Quantity: Quantity,
        container: container,
        cancel: false,
    };
    KinkyDungeonSendEvent("changeconsumable", data);
    if (data.cancel)
        return false;
    consumable = data.consumable;
    Quantity = data.Quantity;
    container = data.container;
    src = data.src;
    type = data.type;
    trig = data.trig;
    item = data.item;
    let before = KinkyDungeonItemCount(consumable.name);
    if (item) {
        item.quantity = (item.quantity || 1) + Quantity;
        if (item.quantity <= 0) {
            if (container)
                delete container.items[consumable.name];
            else
                KinkyDungeonInventoryRemove(item);
        }
        if (KDToggles.InvLimit && !container) {
            let after = KinkyDungeonItemCount(consumable.name);
            if (after > before) {
                let max = KDMaxInventoryStorage(KinkyDungeonInventoryGet(consumable.name), KDPlayer());
                if (after > max) {
                    KinkyDungeonInventoryGet(consumable.name).quantity = max;
                    KDAddConsumable(consumable.name, after - max, KDGetContainer("PlayerChest", undefined, undefined, true, KDPlayerChestFilters));
                    KinkyDungeonSendTextMessage(8, TextGet("KDMovedToStorage")
                        .replace("${Item}", KDGetItemNameString(consumable.name))
                        .replace("${Count}", "" + (after - max)), KDBaseWhite, 1);
                }
            }
        }
        return true;
    }
    if (Quantity >= 0) {
        if (container) {
            container.items[consumable.name] = { name: consumable.name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity };
        }
        else {
            KinkyDungeonInventoryAdd({ name: consumable.name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity });
        }
        if (KDToggles.InvLimit && !container) {
            let after = KinkyDungeonItemCount(consumable.name);
            if (after > before) {
                let max = KDMaxInventoryStorage(KinkyDungeonInventoryGet(consumable.name), KDPlayer());
                if (after > max) {
                    KinkyDungeonInventoryGet(consumable.name).quantity = max;
                    KDAddConsumable(consumable.name, after - max, KDGetContainer("PlayerChest", undefined, undefined, true, KDPlayerChestFilters));
                    KinkyDungeonSendTextMessage(8, TextGet("KDMovedToStorage")
                        .replace("${Item}", KDGetItemNameString(consumable.name))
                        .replace("${Count}", "" + (after - max)), KDBaseWhite, 1);
                }
            }
        }
        return true;
    }
    return false;
}
function KinkyDungeonChangeConsumable(consumable, Quantity, container) {
    let item = container ? container.items[consumable.name] : KinkyDungeonInventoryGetConsumable(consumable.name);
    let data = {
        src: "",
        type: "",
        trig: "",
        item: item,
        consumable: consumable,
        Quantity: Quantity,
        container: container,
        cancel: false,
    };
    KinkyDungeonSendEvent("changeconsumable", data);
    if (data.cancel)
        return false;
    consumable = data.consumable;
    Quantity = data.Quantity;
    container = data.container;
    item = data.item;
    let before = KinkyDungeonItemCount(consumable.name);
    if (item) {
        item.quantity = (item.quantity || 1) + Quantity;
        if (item.quantity <= 0) {
            if (container)
                delete container.items[consumable.name];
            else
                KinkyDungeonInventoryRemove(item);
        }
        if (KDToggles.InvLimit && !container) {
            let after = KinkyDungeonItemCount(consumable.name);
            if (after > before) {
                let max = KDMaxInventoryStorage(KinkyDungeonInventoryGet(consumable.name), KDPlayer());
                if (after > max) {
                    KinkyDungeonInventoryGet(consumable.name).quantity = max;
                    KDAddConsumable(consumable.name, after - max, KDGetContainer("PlayerChest", undefined, undefined, true, KDPlayerChestFilters));
                    KinkyDungeonSendTextMessage(8, TextGet("KDMovedToStorage")
                        .replace("${Item}", KDGetItemNameString(consumable.name))
                        .replace("${Count}", "" + (after - max)), KDBaseWhite, 1);
                }
            }
        }
        return true;
    }
    if (Quantity >= 0) {
        if (container) {
            container.items[consumable.name] = { name: consumable.name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity };
        }
        else {
            KinkyDungeonInventoryAdd({ name: consumable.name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity });
        }
        if (KDToggles.InvLimit && !container) {
            let after = KinkyDungeonItemCount(consumable.name);
            if (after > before) {
                let max = KDMaxInventoryStorage(KinkyDungeonInventoryGet(consumable.name), KDPlayer());
                if (after > max) {
                    KinkyDungeonInventoryGet(consumable.name).quantity = max;
                    KDAddConsumable(consumable.name, after - max, KDGetContainer("PlayerChest", undefined, undefined, true, KDPlayerChestFilters));
                    KinkyDungeonSendTextMessage(8, TextGet("KDMovedToStorage")
                        .replace("${Item}", KDGetItemNameString(consumable.name))
                        .replace("${Count}", "" + (after - max)), KDBaseWhite, 1);
                }
            }
        }
    }
    return false;
}
function KDAddConsumable(name, Quantity, container) {
    let item = container ? container.items[name] : KinkyDungeonInventoryGetConsumable(name);
    if (item) {
        item.quantity = (item.quantity || 1) + Quantity;
        if (item.quantity <= 0) {
            if (container)
                delete container.items[name];
            else
                KinkyDungeonInventoryRemove(item);
        }
        return true;
    }
    let before = KinkyDungeonItemCount(name);
    if (Quantity > 0) {
        if (container) {
            container.items[name] = { name: name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity };
        }
        else {
            KinkyDungeonInventoryAdd({ name: name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity });
        }
    }
    if (KDToggles.InvLimit && !container) {
        let after = KinkyDungeonItemCount(name);
        if (after > before) {
            let max = KDMaxInventoryStorage(KinkyDungeonInventoryGet(name), KDPlayer());
            if (after > max) {
                KinkyDungeonInventoryGet(name).quantity = max;
                KDAddConsumable(name, after - max, KDGetContainer("PlayerChest", undefined, undefined, true, KDPlayerChestFilters));
                KinkyDungeonSendTextMessage(8, TextGet("KDMovedToStorage")
                    .replace("${Item}", KDGetItemNameString(name))
                    .replace("${Count}", "" + (after - max)), KDBaseWhite, 1);
            }
        }
    }
    return false;
}
function KinkyDungeonConsumableEffect(Consumable, type, inv) {
    if (!type)
        type = Consumable.type;
    if (KDConsumableEffects[type]) {
        KDConsumableEffects[type](Consumable, KDPlayer(), inv);
    }
    else if (type == "spell") {
        KinkyDungeonCastSpell(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonFindSpell(Consumable.spell, true), undefined, undefined, undefined);
        KDStunTurns(1, true);
    }
    else if (type == "targetspell") {
        KDCloseQuickInv();
        if (KinkyDungeonDrawState == "Inventory")
            KinkyDungeonDrawState = "Game";
        KinkyDungeonTargetingSpell = KinkyDungeonFindSpell(Consumable.spell, true);
        KinkyDungeonTargetingSpellItem = Consumable;
        KinkyDungeonTargetingSpellWeapon = null;
    }
    else if (type == "charge") {
        KDChangeCharge(Consumable.name, type, "consumable", Consumable.amount);
        if (!KinkyDungeonStatsChoice.get("LostTechnology"))
            KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSourceSpent, 1);
    }
    else if (type == "buff") {
        KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, { id: Consumable.name, type: Consumable.buff, power: Consumable.power, duration: Consumable.duration, aura: Consumable.aura });
    }
    else if (type == "recharge") {
    }
    else if (type == "shrineRemove") {
        KinkyDungeonRemoveRestraintsWithShrine(Consumable.shrine);
        KDStunTurns(1, true);
    }
    else if (type == "goldKey") {
        for (let r of KinkyDungeonPlayerGetRestraintsWithLocks(["Gold"])) {
            KinkyDungeonLock(r, "Blue");
        }
    }
}
function KinkyDungeonConsumableEffectNPC(Consumable, entity, type, inv) {
    if (!type)
        type = Consumable.type;
    if (KDConsumableEffects[type]) {
        KDConsumableEffects[type](Consumable, entity, inv);
    }
}
function KinkyDungeonPotionCollar() {
    for (let r of KinkyDungeonAllRestraintDynamic()) {
        if (KDRestraint(r.item).potionCollar)
            return true;
    }
    return false;
}
function KinkyDungeonCanDrink(byEnemy, strict) {
    for (let inv of KinkyDungeonAllRestraint()) {
        if (KDRestraint(inv).allowPotions)
            return true;
    }
    if (KDGroupBlocked("ItemMouth", byEnemy))
        return false;
    return KinkyDungeonCanTalk(!strict);
}
function KinkyDungeonAttemptConsumable(Name, Quantity, target = null, tx = 0, ty = 0) {
    if (KDGameData.SleepTurns > 0 || KDGameData.SlowMoveTurns > 0)
        return false;
    let item = KinkyDungeonGetInventoryItem(Name, Consumable);
    if (!item)
        return false;
    let itemEffect = KDConsumable(item.item).itemEffect;
    if (itemEffect) {
        let effect = KDItemEffects[itemEffect];
        if (effect.canAttempt(item.item, Quantity, KDPlayer(), target, tx, ty)) {
            let res = effect.onAttempt(item.item, Quantity, KDPlayer(), target, tx, ty);
            if (res.success) {
                if (res.delayed && res.time > 0) {
                    let maxtime = KDConsumable(item.item).delay || 2;
                    for (let i = 1; i <= maxtime; i++)
                        KDAddDelayedAction({
                            commit: i == maxtime ? "ConsumableEffect" : undefined,
                            update: i < maxtime ? "ConsumableEffect" : undefined,
                            data: {
                                Name: Name,
                                Quantity: Quantity,
                                id: target?.id,
                                tX: tx,
                                tY: ty,
                                noAggro: false,
                                itemEffect: itemEffect,
                            },
                            time: i,
                            tick: i - 1,
                            maxtime: maxtime,
                            tags: effect.delayedTags || ["Action", "Remove", "Restrain"],
                        });
                    KDDelayedActionStart();
                }
                else {
                    let res2 = effect.onUse(item.item, Quantity, KDPlayer(), target, tx, ty);
                    if (res2.miscast) {
                        effect.onMiscast(res2, item.item, Quantity, KDPlayer(), target, tx, ty);
                    }
                    else if (!res2.success) {
                        effect.onFailure(res2, item.item, Quantity, KDPlayer(), target, tx, ty);
                    }
                    return true;
                }
                return false;
            }
            return false;
        }
        else
            return false;
    }
    if (KDConsumable(item.item).prereq && KDConsumablePrereq[KDConsumable(item.item).prereq]) {
        if (KDConsumablePrereq[KDConsumable(item.item).prereq](item.item, Quantity)) {
            KinkyDungeonUseConsumable(Name, Quantity);
            return true;
        }
        else
            return false;
    }
    if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "unusuable") {
        KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonUnusable"), KDBaseRed, 1);
        return false;
    }
    if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "goldKey") {
        if (KinkyDungeonPlayerGetRestraintsWithLocks(["Gold"]).length == 0) {
            KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonMistressKeyFail"), KDBaseRed, 1);
            return false;
        }
    }
    if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "charge" && KDGameData.AncientEnergyLevel >= 1) {
        KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonFullpower"), KDBaseRed, 1);
        return false;
    }
    if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "recharge") {
        KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonInventoryItemAncientPowerSourceSpentUseFail"), KDBaseRed, 1);
        return false;
    }
    if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "shrineRemove" && KinkyDungeonGetRestraintsWithShrine(KDConsumable(item.item).shrine).length < 1) {
        KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonNoItemToRemove"), "pink", 1);
        return false;
    }
    let needMouth = item.item && KDConsumable(item.item) && ((KDConsumable(item.item).potion && !KDConsumable(item.item).gagFloor) || KDConsumable(item.item).needMouth);
    let needArms = !(item.item && KDConsumable(item.item) && KDConsumable(item.item).noHands);
    let strictness = KinkyDungeonStrictness(false, "ItemHands");
    let maxStrictness = (item.item && KDConsumable(item.item) && KDConsumable(item.item).maxStrictness) ? KDConsumable(item.item).maxStrictness : 1000;
    if (needMouth && ((!KDConsumable(item.item).potion && ((KDConsumable(item.item).gagMax &&
        KinkyDungeonGagTotal() > KDConsumable(item.item).gagMax) || (!KDConsumable(item.item).gagMax && !KinkyDungeonCanTalk(true))))
        || (KDConsumable(item.item).potion && !KinkyDungeonCanDrink()))) {
        let allowPotions = KinkyDungeonPotionCollar();
        if (KDConsumable(item.item).potion && allowPotions) {
        }
        else {
            KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonPotionGagged"), KDBaseRed, 1);
            KDResetAlternateInventoryRender();
            if (KinkyDungeonTextMessageTime > 0)
                KinkyDungeonDrawState = "Game";
            KDRefreshCharacter.set(KinkyDungeonPlayer, true);
            KinkyDungeonDressPlayer();
            return false;
        }
    }
    if (!(KinkyDungeonHasHelp())
        && needArms
        && !KinkyDungeonStatsChoice.get("Psychic")
        && !(item.item && KDConsumable(item.item).potion
            && !KinkyDungeonIsArmsBound()
            && (!KinkyDungeonStatsChoice.has("WeakGrip")
                || !KinkyDungeonIsHandsBound(false, false)))
        && (KinkyDungeonIsHandsBound(false, true)
            || (KinkyDungeonStatsChoice.has("WeakGrip")
                && item.item
                && KDConsumable(item.item).potion))
        && !KinkyDungeonCanUseFeet()) {
        let allowPotions = KinkyDungeonPotionCollar();
        let nohands = KinkyDungeonIsHandsBound(false, true);
        let failmsg = "KinkyDungeonCantUsePotions";
        if (!nohands && !KinkyDungeonCanDrink(false, true)) {
            failmsg = "KinkyDungeonCantUsePotionsKneelNoMouth";
            nohands = true;
        }
        if (KDConsumable(item.item).potion && allowPotions) {
        }
        else if (!nohands && KinkyDungeonCanKneel() && KDGameData.KneelTurns < 1) {
            if (!KDGameData.KneelTurns)
                KDGameData.KneelTurns = 2;
            else
                KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns, 2);
            KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonCantUsePotionsKneel"), "#e7cf1a", 1);
            KDResetAlternateInventoryRender();
            if (KinkyDungeonTextMessageTime > 0)
                KinkyDungeonDrawState = "Game";
            KDRefreshCharacter.set(KinkyDungeonPlayer, true);
            KinkyDungeonDressPlayer();
            KinkyDungeonAdvanceTime(1, true, true);
            return false;
        }
        else if (nohands || KDGameData.KneelTurns < 1) {
            KinkyDungeonSendActionMessage(7, TextGet(failmsg), KDBaseRed, 1);
            KDResetAlternateInventoryRender();
            if (KinkyDungeonTextMessageTime > 0)
                KinkyDungeonDrawState = "Game";
            KDRefreshCharacter.set(KinkyDungeonPlayer, true);
            KinkyDungeonDressPlayer();
            KDRefreshCharacter.set(KinkyDungeonPlayer, true);
            KinkyDungeonDressPlayer();
            return false;
        }
    }
    if (strictness >= maxStrictness) {
        KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonCantUsePotionsStrict"), KDBaseRed, 1);
        KDResetAlternateInventoryRender();
        if (KinkyDungeonTextMessageTime > 0)
            KinkyDungeonDrawState = "Game";
        KDRefreshCharacter.set(KinkyDungeonPlayer, true);
        KinkyDungeonDressPlayer();
        return false;
    }
    if (KDConsumable(item.item).postreq && KDConsumablePrereq[KDConsumable(item.item).postreq]) {
        if (KDConsumablePrereq[KDConsumable(item.item).postreq](item.item, Quantity)) {
            KDDelayedActionPrune(["Action", "Consume"]);
            if (KDConsumable(item.item).delay || (KDConsumable(item.item).potion && KinkyDungeonStatsChoice.has("SavourTheTaste"))) {
                let maxtime = KDConsumable(item.item).delay || 2;
                for (let i = 1; i <= maxtime; i++)
                    KDAddDelayedAction({
                        commit: i == maxtime ? "Consumable" : undefined,
                        update: i < maxtime ? "Consumable" : undefined,
                        data: {
                            Name: Name,
                            Quantity: Quantity,
                        },
                        time: i,
                        tick: i - 1,
                        maxtime: maxtime,
                        tags: ["Action", "Remove", "Restrain"],
                    });
                KDDelayedActionStart();
            }
            else
                KinkyDungeonUseConsumable(Name, Quantity);
            return true;
        }
        else
            return false;
    }
    KDDelayedActionPrune(["Action", "Consume"]);
    if (KDConsumable(item.item).delay || (KDConsumable(item.item).potion && KinkyDungeonStatsChoice.has("SavourTheTaste"))) {
        let maxtime = KDConsumable(item.item).delay || 2;
        for (let i = 1; i <= maxtime; i++)
            KDAddDelayedAction({
                commit: i == maxtime ? "Consumable" : undefined,
                update: i < maxtime ? "Consumable" : undefined,
                data: {
                    Name: Name,
                    Quantity: Quantity,
                },
                time: i,
                tick: i - 1,
                maxtime: maxtime,
                tags: ["Action", "Remove", "Restrain"],
            });
        KDDelayedActionStart();
    }
    else
        KinkyDungeonUseConsumable(Name, Quantity);
    return true;
}
function KinkyDungeonUseConsumable(Name, Quantity) {
    let item = KinkyDungeonGetInventoryItem(Name, Consumable);
    if (!item || item.item.quantity < Quantity)
        return false;
    for (let I = 0; I < Quantity; I++) {
        KinkyDungeonConsumableEffect(KDConsumable(item.item), "", item.item);
        if (KDConsumable(item.item).sideEffects) {
            for (let effect of KDConsumable(item.item).sideEffects) {
                KinkyDungeonConsumableEffect(KDConsumable(item.item), effect, item.item);
            }
        }
    }
    if (!KDConsumable(item.item).noConsumeOnUse)
        KinkyDungeonChangeConsumable(KDConsumable(item.item), -(KDConsumable(item.item).useQuantity ? KDConsumable(item.item).useQuantity : 1) * Quantity);
    if (KinkyDungeonConsumableVariants[item.item.inventoryVariant || item.item.name]) {
        if (!KDGameData.IdentifiedObj)
            KDGameData.IdentifiedObj = {};
        KDGameData.IdentifiedObj[item.item.inventoryVariant || item.item.name] = 2;
    }
    KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonInventoryItem" + Name + "Use"), KDBaseMint, 1);
    if (KDConsumable(item.item).sfx) {
        if (KDSoundEnabled())
            AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + KDConsumable(item.item).sfx + ".ogg");
    }
    return true;
}
function KDGetCheapestLatexSolvent(tag = "latexsolvent") {
    let cheapest = "";
    let cheapestcost = -1000;
    for (let c of KinkyDungeonAllConsumable()) {
        if (KDConsumable(c) && KDConsumable(c)[tag]
            && (cheapestcost == -1000 || KDConsumable(c)[tag] < cheapestcost)) {
            cheapest = c.inventoryVariant || c.name;
            cheapestcost = KDConsumable(c)[tag];
        }
    }
    return cheapest;
}
let KDItemEffects = {};
function KDGetGagMult(Consumable, entity, msg) {
    if (entity == KDPlayer()) {
        let gagFloor = Consumable.gagFloor ? Consumable.gagFloor : 0;
        let gagMult = (Consumable.potion && gagFloor != 1.0) ? Math.max(0, gagFloor + (1 - gagFloor) * (1 - Math.max(0, Math.min(1.0, KinkyDungeonGagTotal(true))))) : 1.0;
        if (msg && gagMult < 0.999) {
            KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonConsumableLessEffective"), KDBaseRed, 2);
        }
        return { gagFloor, gagMult };
    }
    return { gagFloor: undefined, gagMult: 0 };
}
function KDTargetConsumable(inv, Quantity, itemEffect) {
    let Consumable = KDConsumable(inv);
    if (!Consumable)
        return;
    let range = KDGetPotionRange(inv, itemEffect);
    KDCloseQuickInv();
    if (KinkyDungeonDrawState == "Inventory") {
        KinkyDungeonDrawState = "Game";
        KDResetAlternateInventoryRender();
    }
    KinkyDungeonTargetingSpell =
        { name: "useConsumable", components: [], level: 1, type: "special", special: "useConsumable", noMiscast: true, manacost: 0,
            quantity: Quantity, itemEffect: itemEffect,
            noconsume: true,
            onhit: "", time: 25, power: 0, range: range != undefined ? range : Consumable.range, size: 1, damage: "" };
    ;
    KinkyDungeonTargetingSpellItem = Consumable;
    KinkyDungeonTargetingSpellWeapon = null;
    return {
        success: true,
        componentfailure: "",
        miscast: false,
        affected: [],
        consumed: 0,
        time: 0,
    };
}
function KDStandardConsumableHandsCheck(item, Quantity) {
    let needArms = !(item && KDConsumable(item) && KDConsumable(item).noHands);
    let strictness = KinkyDungeonStrictness(false, "ItemHands");
    let maxStrictness = (item && KDConsumable(item) && KDConsumable(item).maxStrictness) ? KDConsumable(item).maxStrictness : 1000;
    if (!(KinkyDungeonHasHelp())
        && needArms
        && !KinkyDungeonStatsChoice.get("Psychic")
        && !(item && KDConsumable(item).potion
            && !KinkyDungeonIsArmsBound()
            && (!KinkyDungeonStatsChoice.has("WeakGrip")
                || !KinkyDungeonIsHandsBound(false, false)))
        && (KinkyDungeonIsHandsBound(false, true)
            || (KinkyDungeonStatsChoice.has("WeakGrip")
                && item
                && KDConsumable(item).potion))
        && !KinkyDungeonCanUseFeet()) {
        let allowPotions = KinkyDungeonPotionCollar();
        let nohands = KinkyDungeonIsHandsBound(false, true);
        let failmsg = "KinkyDungeonCantUsePotions";
        if (!nohands && !KinkyDungeonCanDrink(false, true)) {
            failmsg = "KinkyDungeonCantUsePotionsKneelNoMouth";
            nohands = true;
        }
        if (KDConsumable(item).potion && allowPotions) {
        }
        else if (!nohands && KinkyDungeonCanKneel() && KDGameData.KneelTurns < 1) {
            if (!KDGameData.KneelTurns)
                KDGameData.KneelTurns = 2;
            else
                KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns, 2);
            KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonCantUsePotionsKneel"), "#e7cf1a", 1);
            KDResetAlternateInventoryRender();
            if (KinkyDungeonTextMessageTime > 0)
                KinkyDungeonDrawState = "Game";
            KDRefreshCharacter.set(KinkyDungeonPlayer, true);
            KinkyDungeonDressPlayer();
            KinkyDungeonAdvanceTime(1, true, true);
            return false;
        }
        else if (nohands || KDGameData.KneelTurns < 1) {
            KinkyDungeonSendActionMessage(7, TextGet(failmsg), KDBaseRed, 1);
            KDResetAlternateInventoryRender();
            if (KinkyDungeonTextMessageTime > 0)
                KinkyDungeonDrawState = "Game";
            KDRefreshCharacter.set(KinkyDungeonPlayer, true);
            KinkyDungeonDressPlayer();
            KDRefreshCharacter.set(KinkyDungeonPlayer, true);
            KinkyDungeonDressPlayer();
            return false;
        }
    }
    if (strictness >= maxStrictness) {
        KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonCantUsePotionsStrict"), KDBaseRed, 1);
        KDResetAlternateInventoryRender();
        if (KinkyDungeonTextMessageTime > 0)
            KinkyDungeonDrawState = "Game";
        KDRefreshCharacter.set(KinkyDungeonPlayer, true);
        KinkyDungeonDressPlayer();
        return false;
    }
    if (KDConsumable(item).postreq && KDConsumablePrereq[KDConsumable(item).postreq]) {
        if (KDConsumablePrereq[KDConsumable(item).postreq](item, Quantity)) {
            KDDelayedActionPrune(["Action", "Consume"]);
            return true;
        }
        else
            return false;
    }
    return true;
}
function KDGetItemBaseMax(item) {
    switch (item?.type) {
        case Restraint:
        case LooseRestraint:
            return KDRestraint(item)?.armor ? 5 : 100;
        case Consumable:
            return KDConsumable(item)?.maxInventory ? KDConsumable(item).maxInventory : 10;
        case Weapon:
        case Outfit:
            return 1;
        default: return 1000000;
    }
}
function KDMaxInventoryStorage(item, entity) {
    if (entity.player) {
        let data = {
            item: item,
            max: KDGetItemBaseMax(item),
            bonus: 0,
            mult: 1,
            entity: entity,
        };
        KinkyDungeonSendEvent("calcInvMax", data);
        data.max = Math.max(0, data.max + data.bonus) * data.mult;
        return data.max;
    }
    return 1000000;
}
function KDIsFood(item) {
    return !!KDConsumable(item)?.food;
}
//# sourceMappingURL=KinkyDungeonConsumables.js.map