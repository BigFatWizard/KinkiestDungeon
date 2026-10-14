"use strict";
const KDMarketRateDecay = 0.98;
function KDCalcMarketDecayMultiplier(qty_previous, qty_this, rate = KDMarketRateDecay) {
    return (rate ** (qty_previous + qty_this) - rate ** qty_previous) / (rate - 1);
}
let KDInventoryAction = {
    "Equip": {
        doubleSize: true,
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[0]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[0]; },
        text: (_player, item) => {
            return TextGet("KDInventoryAction" + (KinkyDungeonPlayerWeapon != item.name ? "Equip" : "Unequip"));
        },
        icon: (_player, item) => {
            if (item.type == LooseRestraint) {
                let newItem = null;
                let currentItem = null;
                let linkable = null;
                newItem = KDRestraint(item);
                if (newItem) {
                    currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
                    if (KDDebugLink) {
                        linkable = KDCanAddRestraint(KDRestraint(newItem), true, "", false, currentItem, true, true);
                    }
                    else {
                        if (!currentItem)
                            return "InventoryAction/Equip";
                        linkable = KDCanAddRestraint(KDRestraint(newItem), false, "", false, currentItem, true, true);
                    }
                    if (linkable) {
                        return "InventoryAction/Equip";
                    }
                    else
                        return "InventoryAction/Unequip";
                }
            }
            return KinkyDungeonPlayerWeapon != item.name ? "InventoryAction/Equip" : "InventoryAction/Unequip";
        },
        valid: (_player, item) => {
            if ((item?.type == Restraint))
                return false;
            if (item.type == LooseRestraint) {
                let newItem = null;
                let currentItem = null;
                let linkable = null;
                newItem = KDRestraint(item);
                if (newItem) {
                    if (!KDDebugforceadds) {
                        if (newItem.requireSingleTagToEquip && !newItem.requireSingleTagToEquip.some((tag) => { return KinkyDungeonPlayerTags.get(tag); }))
                            return false;
                        if (newItem.requireAllTagsToEquip && newItem.requireAllTagsToEquip.some((tag) => { return !KinkyDungeonPlayerTags.get(tag); }))
                            return false;
                        currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
                        if (KDDebugLink) {
                            linkable = KDCanAddRestraint(KDRestraint(newItem), true, "", false, currentItem, true, true);
                        }
                        else {
                            if (!currentItem)
                                return true;
                            linkable = KDCanAddRestraint(KDRestraint(newItem), false, "", false, currentItem, true, true);
                        }
                        if (linkable) {
                            return true;
                        }
                        else
                            return false;
                    }
                }
                return true;
            }
            return item.type == Outfit || item.type == Weapon;
        },
        click: (player, item) => {
            if (item.type == LooseRestraint) {
                let equipped = false;
                let newItem = null;
                let currentItem = null;
                let linkable = null;
                newItem = KDRestraint(item);
                if (newItem) {
                    currentItem = KinkyDungeonGetRestraintItem(newItem.Group);
                    if (!currentItem)
                        equipped = false;
                    else {
                        if (!KDDebugforceadds) {
                            if (KDDebugLink) {
                                linkable = KDCanAddRestraint(KDRestraint(newItem), true, "", false, currentItem, true, true);
                            }
                            else {
                                linkable = KDCanAddRestraint(KDRestraint(newItem), false, "", false, currentItem, true, true);
                            }
                            if (!currentItem || linkable) {
                                equipped = false;
                            }
                            else
                                equipped = true;
                        }
                    }
                }
                if (!equipped && newItem) {
                    if (KDGameData.InventoryAction && !KDConfirmOverInventoryAction) {
                        KDConfirmOverInventoryAction = true;
                        return true;
                    }
                    else if (KDSendInput("equip", { name: item.name,
                        faction: item.faction,
                        container: KDInventoryActionContainer(player),
                        inventoryVariant: item.name != newItem.name ?
                            item.name : undefined,
                        group: newItem.Group, curse: item.curse, currentItem: currentItem ? currentItem.name : undefined, events: Object.assign([], item.events) }))
                        return true;
                }
            }
            else if (item.type == Weapon) {
                let weapon = item.name;
                let equipped = item.name == KinkyDungeonPlayerWeapon;
                if (equipped) {
                    KDSendInput("unequipweapon", { weapon: weapon,
                        container: KDInventoryActionContainer(player),
                    });
                }
                else {
                    KDSendInput("switchWeapon", { weapon: weapon,
                        container: KDInventoryActionContainer(player), });
                }
            }
            else if (item.type == Outfit) {
                let outfit = item.name;
                let toWear = KinkyDungeonGetOutfit(outfit);
                if (toWear) {
                    let dress = toWear.dress;
                    if (dress == "JailUniform" && KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)])
                        dress = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)].defeat_outfit;
                    KDSendInput("dress", { dress: dress, outfit: outfit,
                        container: KDInventoryActionContainer(player),
                    });
                }
            }
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "Drop": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[2]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[2]; },
        icon: (_player, _item) => {
            return "InventoryAction/Drop";
        },
        valid: (_player, item) => {
            if ((item?.type == Restraint))
                return false;
            if ((item?.type == Weapon && isUnarmed(KDWeapon(item))))
                return false;
            return true;
        },
        click: (_player, item) => {
            KDSendInput("drop", { item: item.name });
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "Hotbar": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[3]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[3]; },
        icon: (_player, _item) => {
            return "InventoryAction/Hotbar";
        },
        valid: (_player, _item) => {
            return true;
        },
        click: (_player, _item) => {
            KDConfigHotbar = !KDConfigHotbar;
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "Recolor": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[8]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[8]; },
        icon: (_player, item) => {
            return item.forceFaction ? "InventoryAction/RecolorSet" : "InventoryAction/Recolor";
        },
        valid: (_player, _item) => {
            return true;
        },
        click: (_player, _item) => {
            KDConfigRestraintColor = !KDConfigRestraintColor;
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "GenericBondage": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[0]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[0]; },
        icon: (_player, _item) => {
            return "InventoryAction/GenericBondage";
        },
        valid: (_player, _item) => {
            return true;
        },
        click: (_player, _item) => {
            KDCurrentAlternateInventory = "GenericRaw";
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "Remove": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[6]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[6]; },
        icon: (_player, _item) => {
            return "InventoryAction/Remove";
        },
        show: (_player, item) => {
            return !KDGetCurse(item) && !item.lock;
        },
        valid: (_player, item) => {
            let r = KDRestraint(item);
            let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
            return !sg.blocked;
        },
        click: (_player, item) => {
            let itemIndex = KDGetItemLinkIndex(item, false);
            let r = KDRestraint(item);
            let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
            if (itemIndex >= 0 && !sg.blocked) {
                KDSendInput("struggle", { group: sg.group, index: itemIndex, type: "Remove" });
            }
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "Unlock": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[4]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[4]; },
        icon: (_player, item) => {
            return "Locks/" + item.lock;
        },
        show: (_player, item) => {
            return !KDGetCurse(item) && !item.lock == false;
        },
        valid: (_player, item) => {
            let r = KDRestraint(item);
            let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
            return !sg.blocked;
        },
        click: (_player, item) => {
            let itemIndex = KDGetItemLinkIndex(item, false);
            let r = KDRestraint(item);
            let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
            if (itemIndex >= 0 && !sg.blocked) {
                KDSendInput("struggle", { group: sg.group, index: itemIndex, type: "Unlock" });
            }
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "Lock": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[7]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[7]; },
        icon: (_player, _item) => {
            return "InventoryAction/Lock";
        },
        show: (_player, item) => {
            return !KDGetCurse(item) && !item.lock && KinkyDungeonIsLockable(KDRestraint(item));
        },
        valid: (_player, item) => {
            let r = KDRestraint(item);
            let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
            return !sg.blocked;
        },
        click: (_player, item) => {
            let itemIndex = KDGetItemLinkIndex(item, false);
            let r = KDRestraint(item);
            let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
            if (itemIndex >= 0 && !sg.blocked) {
                KDSendInput("lock", { group: sg.group, index: itemIndex, type: "White" });
            }
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "Pick": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[5]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[5]; },
        icon: (_player, _item) => {
            return "InventoryAction/Pick";
        },
        show: (_player, item) => {
            return !KDGetCurse(item) && !item.lock == false;
        },
        valid: (_player, item) => {
            let r = KDRestraint(item);
            let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
            return KinkyDungeonItemCount("Pick") > 0 && !sg.blocked;
        },
        click: (_player, item) => {
            let itemIndex = KDGetItemLinkIndex(item, false);
            let r = KDRestraint(item);
            let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
            if (itemIndex >= 0 && !sg.blocked) {
                KDSendInput("struggle", { group: sg.group, index: itemIndex, type: "Unlock" });
            }
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "CurseStruggle": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[3]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[3]; },
        icon: (_player, _item) => {
            return "InventoryAction/CurseStruggle";
        },
        show: (_player, item) => {
            return !!KDGetCurse(item);
        },
        valid: (_player, _item) => {
            return true;
        },
        click: (_player, item) => {
            KinkyDungeonCurseStruggle(item, (KDGetCurse(item)));
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "CurseInfo": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[2]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[2]; },
        icon: (_player, _item) => {
            return "InventoryAction/CurseInfo";
        },
        show: (_player, item) => {
            return !!KDGetCurse(item);
        },
        valid: (_player, _item) => {
            return true;
        },
        click: (_player, item) => {
            KinkyDungeonCurseInfo(item, (KDGetCurse(item)));
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "CurseUnlock": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[4]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[4]; },
        icon: (_player, _item) => {
            return "InventoryAction/CurseUnlock";
        },
        show: (_player, item) => {
            return !!KDGetCurse(item);
        },
        valid: (_player, item) => {
            return !KinkyDungeonCurseAvailable(item, (KDGetCurse(item)));
        },
        invalidtooltip: (player, item) => {
            return KinkyDungeonCurseAvailable(item, (KDGetCurse(item)));
        },
        click: (_player, item) => {
            let itemIndex = KDGetItemLinkIndex(item, false);
            if (itemIndex >= 0 && !KinkyDungeonCurseAvailable(item, (KDGetCurse(item)))) {
                let r = KDRestraint(item);
                let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
                KDSendInput("curseUnlock", { group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], curse: (KDGetCurse(item)) });
            }
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "Struggle": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[2]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[2]; },
        icon: (_player, _item) => {
            return "InventoryAction/Struggle";
        },
        show: (_player, item) => {
            return !KDGetCurse(item) && !item.lock;
        },
        valid: (_player, _item) => {
            return true;
        },
        click: (_player, item) => {
            let itemIndex = KDGetItemLinkIndex(item, false);
            if (itemIndex >= 0) {
                let r = KDRestraint(item);
                let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
                KDSendInput(KDGetCurse(item) ? "struggleCurse" : "struggle", { group: sg.group, index: itemIndex, type: "Struggle", curse: KDGetCurse(item) });
            }
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "Cut": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[3]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[3]; },
        icon: (_player, _item) => {
            return (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name && !KinkyDungeonPlayerDamage.unarmed) ? "Items/" + KDGetItemImage(KinkyDungeonPlayerDamage, KDPlayer(), true) : "InventoryAction/Cut";
        },
        show: (_player, item) => {
            let r = KDRestraint(item);
            let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
            return !KDGetCurse(item) && !sg.noCut;
        },
        valid: (_player, item) => {
            let r = KDRestraint(item);
            let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
            return !sg.blocked;
        },
        click: (_player, item) => {
            let itemIndex = KDGetItemLinkIndex(item, false);
            let r = KDRestraint(item);
            let sg = KinkyDungeonStruggleGroups.find((group) => { return r.Group == group.group; });
            if (itemIndex >= 0 && !sg.blocked && !sg.noCut) {
                KDSendInput("struggle", { group: sg.group, index: itemIndex, type: "Cut" });
            }
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "Favorite": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[1]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[1]; },
        text: (_player, item) => {
            return TextGet("KDInventoryAction" + (!(KDGameData.ItemPriority[item.inventoryVariant || item.name] > 9) ? "Favorite" : "Unfavorite"));
        },
        icon: (_player, item) => {
            return !(KDGameData.ItemPriority[item.inventoryVariant || item.name] > 9) ? "InventoryAction/Favorite" : "InventoryAction/Unfavorite";
        },
        valid: (_player, _item) => {
            return true;
        },
        click: (player, item) => {
            if (!KDGameData.ItemPriority)
                KDGameData.ItemPriority = {};
            if (!(KDGameData.ItemPriority[item.inventoryVariant || item.name] > 9))
                KDGameData.ItemPriority[item.inventoryVariant || item.name] = 10;
            else
                KDGameData.ItemPriority[item.inventoryVariant || item.name] = 0;
            KDSortInventory(KinkyDungeonPlayerEntity);
            let filteredInventory = KinkyDungeonFilterInventory(KinkyDungeonCurrentFilter, undefined, undefined, undefined, undefined, KDInvFilter, KDInventoryActionContainer(player)?.items, undefined, true);
            let index = filteredInventory.findIndex((element) => { return element.item.name == item.name; });
            if (index >= 0) {
                KinkyDungeonCurrentPageInventory = index;
            }
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "Use": {
        doubleSize: true,
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeyEnter[0]); },
        hotkeyPress: () => { return KinkyDungeonKeyEnter[0]; },
        icon: (_player, _item) => {
            return "InventoryAction/Use";
        },
        valid: (_player, item) => {
            return item.quantity > 0;
        },
        click: (player, item) => {
            KDSendInput("consumable", { item: item.name, quantity: 1, container: KDInventoryActionContainer(player) });
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "QuickSlot1": {
        icon: (_player, _item) => {
            return KDGameData.PreviousWeapon[0] ? "Items/" + KDGetItemImageFromString(KinkyDungeonWeaponVariants[KDGameData.PreviousWeapon[0]]?.template || KDGameData.PreviousWeapon[0], KDPlayer(), false) : "InventoryAction/Quickslot";
        },
        valid: (player, _item) => {
            return !KDInventoryActionContainer(player);
        },
        label: (_player, _item) => {
            if (KDGameData.PreviousWeaponLock && KDGameData.PreviousWeaponLock[0]) {
                return TextGet("KDLocked");
            }
            return "";
        },
        click: (_player, item) => {
            KDGameData.PreviousWeapon[0] = item.name;
            if (!KDGameData.PreviousWeaponLock) {
                KDGameData.PreviousWeaponLock = [];
                for (let i = 0; i < KDMaxPreviousWeapon; i++) {
                    KDGameData.PreviousWeaponLock.push(false);
                }
            }
            KDGameData.PreviousWeaponLock[0] = !KDGameData.PreviousWeaponLock[0];
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "QuickSlot2": {
        icon: (_player, _item) => {
            return KDGameData.PreviousWeapon[1] ? "Items/" + KDGetItemImageFromString(KinkyDungeonWeaponVariants[KDGameData.PreviousWeapon[1]]?.template || KDGameData.PreviousWeapon[1], KDPlayer(), false) : "InventoryAction/Quickslot";
        },
        valid: (player, _item) => {
            return !KDInventoryActionContainer(player);
        },
        label: (_player, _item) => {
            if (KDGameData.PreviousWeaponLock && KDGameData.PreviousWeaponLock[1]) {
                return TextGet("KDLocked");
            }
            return "";
        },
        click: (_player, item) => {
            KDGameData.PreviousWeapon[1] = item.name;
            if (!KDGameData.PreviousWeaponLock) {
                KDGameData.PreviousWeaponLock = [];
                for (let i = 0; i < KDMaxPreviousWeapon; i++) {
                    KDGameData.PreviousWeaponLock.push(false);
                }
            }
            KDGameData.PreviousWeaponLock[1] = !KDGameData.PreviousWeaponLock[1];
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "QuickSlot3": {
        icon: (_player, _item) => {
            return KDGameData.PreviousWeapon[2] ? "Items/" + KDGetItemImageFromString(KinkyDungeonWeaponVariants[KDGameData.PreviousWeapon[2]]?.template || KDGameData.PreviousWeapon[2], KDPlayer(), false) : "InventoryAction/Quickslot";
        },
        valid: (player, _item) => {
            return !KDInventoryActionContainer(player);
        },
        label: (_player, _item) => {
            if (KDGameData.PreviousWeaponLock && KDGameData.PreviousWeaponLock[2]) {
                return TextGet("KDLocked");
            }
            return "";
        },
        click: (_player, item) => {
            KDGameData.PreviousWeapon[2] = item.name;
            if (!KDGameData.PreviousWeaponLock) {
                KDGameData.PreviousWeaponLock = [];
                for (let i = 0; i < KDMaxPreviousWeapon; i++) {
                    KDGameData.PreviousWeaponLock.push(false);
                }
            }
            KDGameData.PreviousWeaponLock[2] = !KDGameData.PreviousWeaponLock[2];
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "QuickSlot4": {
        icon: (_player, _item) => {
            return KDGameData.PreviousWeapon[3] ? "Items/" + KDGetItemImageFromString(KinkyDungeonWeaponVariants[KDGameData.PreviousWeapon[3]]?.template || KDGameData.PreviousWeapon[3], KDPlayer(), false) : "InventoryAction/Quickslot";
        },
        valid: (player, _item) => {
            return !KDInventoryActionContainer(player);
        },
        label: (_player, _item) => {
            if (KDGameData.PreviousWeaponLock && KDGameData.PreviousWeaponLock[3]) {
                return TextGet("KDLocked");
            }
            return "";
        },
        click: (_player, item) => {
            KDGameData.PreviousWeapon[3] = item.name;
            if (!KDGameData.PreviousWeaponLock) {
                KDGameData.PreviousWeaponLock = [];
                for (let i = 0; i < KDMaxPreviousWeapon; i++) {
                    KDGameData.PreviousWeaponLock.push(false);
                }
            }
            KDGameData.PreviousWeaponLock[3] = !KDGameData.PreviousWeaponLock[3];
        },
        cancel: (_player, _delta) => {
            return false;
        },
    },
    "RemoveCurseOrHex": {
        doubleSize: true,
        icon: (_player, _item) => {
            return "InventoryAction/Macaron";
        },
        valid: (_player, item) => {
            if (!(item?.type == Restraint))
                return false;
            return KDHasRemovableCurse(item, KDGameData.CurseLevel) || KDHasRemovableHex(item, KDGameData.CurseLevel);
        },
        click: (player, item) => {
            if (KDHasRemovableCurse(item, KDGameData.CurseLevel) || KDHasRemovableHex(item, KDGameData.CurseLevel)) {
                if (KDHasRemovableCurse(item, KDGameData.CurseLevel)) {
                    if (item.curse && KDCurses[item.curse]) {
                        let res = KDCurses[item.curse].remove(item, KDGetRestraintHost(item), true);
                        KinkyDungeonSendEvent("removeCurse", {
                            curse: item.curse,
                            unlock: true,
                            result: res,
                            item: item,
                        });
                    }
                    let inventoryAs = item.inventoryVariant || item.name || (KDRestraint(item).inventoryAs);
                    item.curse = undefined;
                    if (inventoryAs && KinkyDungeonRestraintVariants[inventoryAs]) {
                        KinkyDungeonRestraintVariants[inventoryAs].curse = undefined;
                    }
                }
                let removeHexes = {};
                for (let e of KDGetRemovableHex(item, KDGameData.CurseLevel)) {
                    removeHexes[e.original] = true;
                }
                let newEvents = [];
                for (let event of item.events) {
                    if (!event.original || !removeHexes[event.original])
                        newEvents.push(event);
                }
                item.events = newEvents;
                for (let event of newEvents) {
                    if (event.trigger == "curseCount" || event.removeOnUncurse) {
                        newEvents.splice(newEvents.indexOf(event), 1);
                    }
                }
                if (KDGetRestraintVariant(item)) {
                    KDGetRestraintVariant(item).events = JSON.parse(JSON.stringify(item.events));
                    if (KDGetRestraintVariant(item).suffix == "Cursed")
                        KDGetRestraintVariant(item).suffix = "Purified";
                    if (KDGetRestraintVariant(item).prefix == "Cursed")
                        KDGetRestraintVariant(item).prefix = "Purified";
                }
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Evil.ogg");
                KinkyDungeonSendEvent("cleanse", {
                    item: item,
                    container: KDInventoryActionContainer(player),
                });
                if (KDGameData.UsingConsumable) {
                    KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonInventoryItem" + KDGameData.UsingConsumable + "Use"), KDBaseRed, 1, true);
                    let con = KinkyDungeonInventoryGetConsumable(KDGameData.UsingConsumable, KDInventoryActionContainer(player));
                    if (con) {
                        if (con.quantity > 1)
                            con.quantity -= 1;
                        else {
                            KDGameData.InventoryAction = "";
                            KDGameData.UsingConsumable = "";
                            KDGameData.InventoryActionContainer = [];
                            KinkyDungeonInventoryRemoveSafe(con, KDInventoryActionContainer(player));
                        }
                    }
                    KinkyDungeonLastAction = "";
                    KinkyDungeonAdvanceTime(1, true, true);
                }
            }
        },
        cancel: (_player, delta) => {
            if (delta > 0) {
                if (KinkyDungeonLastTurnAction != "Wait"
                    || !(KinkyDungeonAllRestraintDynamic().some((r) => { return KDHasRemovableCurse(r.item, KDGameData.CurseLevel) || KDHasRemovableHex(r.item, KDGameData.CurseLevel); }))) {
                    KDGameData.UsingConsumable = "";
                    return true;
                }
            }
            return false;
        },
    },
    "RemoveMagicLock": {
        doubleSize: true,
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeyEnter[0]); },
        hotkeyPress: () => { return KinkyDungeonKeyEnter[0]; },
        icon: (_player, _item) => {
            return "InventoryAction/CommandWord";
        },
        valid: (_player, item) => {
            if (!(item?.type == Restraint))
                return false;
            return KDMagicLocks.includes(item.lock);
        },
        autoFilter: (item) => {
            return KDMagicLocks.includes(item.lock);
        },
        click: (_player, item) => {
            if (KDMagicLocks.includes(item.lock)) {
                KDChangeMana(item.lock, "lock", "unlock", -KDGameData.InventoryActionManaCost || 0);
                KinkyDungeonLock(item, "");
                KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonPurpleLockRemove"), "#e7cf1a", 2);
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
                KDGameData.InventoryAction = "";
                KDGameData.InventoryActionContainer = [];
                KinkyDungeonLastAction = "Cast";
                KDPauseBalance(5);
                KinkyDungeonAdvanceTime(1, true, true);
            }
        },
        cancel: (_player, delta) => {
            if (delta > 0) {
                if (!KinkyDungeonHasMana(KDGameData.InventoryActionManaCost) || !(KinkyDungeonPlayerGetRestraintsWithLocks(KDMagicLocks).length > 0)) {
                    return true;
                }
            }
            return false;
        },
    },
    "Offhand": {
        icon: (_player, _item) => {
            return "InventoryAction/Offhand";
        },
        doubleSize: true,
        valid: (player, item) => {
            if (!(item?.type == Weapon && KDCanOffhand(item)))
                return false;
            if (KDInventoryActionContainer(player))
                return false;
            return KinkyDungeonCanUseWeapon(false, undefined, KDWeapon(item));
        },
        show: (_player, item) => {
            return KDGameData.Offhand != item.name;
        },
        click: (_player, item) => {
            KDGameData.Offhand = item.name;
            KDGameData.OffhandOld = item.name;
            KinkyDungeonAdvanceTime(1, true, true);
            KDRefreshCharacter.set(KinkyDungeonPlayer, true);
            KinkyDungeonDressPlayer();
        },
        cancel: (_player, delta) => {
            if (delta > 0) {
                if (KinkyDungeonLastTurnAction != "Wait") {
                    return true;
                }
            }
            return false;
        },
    },
    "RemoveOffhand": {
        icon: (_player, _item) => {
            return "InventoryAction/RemoveOffhand";
        },
        doubleSize: true,
        valid: (player, item) => {
            if (KDInventoryActionContainer(player))
                return false;
            return KDGameData.Offhand == item.name;
        },
        click: (_player, item) => {
            KDGameData.Offhand = "";
            KDGameData.OffhandOld = "";
            KDRefreshCharacter.set(KinkyDungeonPlayer, true);
            KinkyDungeonDressPlayer();
        },
        cancel: (_player, delta) => {
            if (delta > 0) {
                if (KinkyDungeonLastTurnAction != "Wait") {
                    return true;
                }
            }
            return false;
        },
    },
    "Attach": {
        icon: (_player, _item) => {
            return "InventoryAction/Attach";
        },
        valid: (player, item) => {
            if (!(item?.type == Weapon && !KDWeapon(item)?.noHands && !KDWeapon(item)?.unarmed))
                return false;
            if (KDInventoryActionContainer(player))
                return false;
            return item.name != KDGameData.AttachedWep;
        },
        label: (_player, _item) => {
            if (KDGameData.AttachedWep && KinkyDungeonInventoryGet(KDGameData.AttachedWep))
                return KDGetItemNameString(KDGameData.AttachedWep);
            return "";
        },
        itemlabel: (_player, item) => {
            if (KDGameData.AttachedWep == item.name)
                return TextGet("KDAttached");
            return "";
        },
        click: (_player, item) => {
            KDGameData.AttachedWep = item.name;
            KinkyDungeonAdvanceTime(1, true, true);
            KDStunTurns(4, true);
            KinkyDungeonDrawState = "Game";
            KDResetAlternateInventoryRender();
            KDRefreshCharacter.set(KinkyDungeonPlayer, true);
            KinkyDungeonDressPlayer();
            KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Tape.ogg");
        },
        cancel: (_player, delta) => {
            if (delta > 0) {
                if (KinkyDungeonLastTurnAction != "Wait") {
                    return true;
                }
            }
            return false;
        },
    },
    "Sell": {
        alsoShow: ["SellBulk", "SellExcess"],
        icon: (_player, _item) => {
            return "InventoryAction/Sell";
        },
        label: (_player, item) => {
            if (KDWeapon(item)?.unarmed)
                return "";
            let mult = 1;
            let quantity = 1;
            let quantitystart = 0;
            if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
                quantitystart = KDGameData.ItemsSold[item.name];
            }
            mult = KDCalcMarketDecayMultiplier(quantitystart, quantity);
            let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
            return TextGet("KDGP").replace("AMNT", value + "");
        },
        itemlabel: (_player, item) => {
            if (KDWeapon(item)?.unarmed)
                return "";
            let mult = 1;
            let quantity = 1;
            let quantitystart = 0;
            if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
                quantitystart = KDGameData.ItemsSold[item.name];
            }
            mult = KDCalcMarketDecayMultiplier(quantitystart, quantity);
            let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
            return TextGet("KDGP").replace("AMNT", value + "");
        },
        itemlabelcolor: (_player, _item) => { return "#ffff44"; },
        text: (_player, item) => {
            let mult = 1;
            let quantity = 1;
            let quantitystart = 0;
            if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
                quantitystart = KDGameData.ItemsSold[item.name];
            }
            mult = KDCalcMarketDecayMultiplier(quantitystart, quantity);
            let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
            return TextGet("KDInventoryActionSell").replace("VLU", value + "");
        },
        valid: (_player, item) => {
            if (KDGameData.ItemPriority[item.name] > 9)
                return false;
            if (KDWeapon(item)?.unarmed)
                return false;
            return item?.type == Weapon || item?.type == LooseRestraint || item?.type == Consumable;
        },
        click: (player, item) => {
            let mult = 1;
            let quantity = 1;
            let quantitystart = 0;
            if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
                quantitystart = KDGameData.ItemsSold[item.name];
            }
            mult = KDCalcMarketDecayMultiplier(quantitystart, quantity);
            let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
            let itemInv = KinkyDungeonInventoryGetSafe(item.name, KDInventoryActionContainer(player));
            if (!itemInv)
                return;
            if (itemInv.type == Consumable)
                KinkyDungeonChangeConsumable(KDConsumable(itemInv), -1, KDInventoryActionContainer(player));
            else if (itemInv.quantity > 1)
                itemInv.quantity -= 1;
            else
                KinkyDungeonInventoryRemoveSafe(itemInv, KDInventoryActionContainer(player));
            KinkyDungeonAddGold(value);
            if (!KDGameData.ItemsSold)
                KDGameData.ItemsSold = {};
            KDGameData.ItemsSold[item.name] = (KDGameData.ItemsSold[item.name] || 0) + 1;
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
            KinkyDungeonSendTextMessage(10, TextGet("KDSell")
                .replace("ITM", KDGetItemName(item))
                .replace("VLU", "" + value), KDBaseWhite, 2);
        },
        cancel: (_player, delta) => {
            if (delta > 0) {
                if (KinkyDungeonLastTurnAction != "Wait") {
                    return true;
                }
            }
            return false;
        },
    },
    "SellBulk": {
        icon: (_player, _item) => {
            return "InventoryAction/SellBulk";
        },
        label: (_player, item) => {
            let mult = 1;
            let quantity = ((item.quantity) ? item.quantity : 1);
            let quantitystart = 0;
            if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
                quantitystart = KDGameData.ItemsSold[item.name];
            }
            mult = KDCalcMarketDecayMultiplier(quantitystart, quantity);
            let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
            return TextGet("KDGP").replace("AMNT", value + "");
        },
        text: (_player, item) => {
            let mult = 1;
            let quantity = ((item.quantity) ? item.quantity : 1);
            let quantitystart = 0;
            if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
                quantitystart = KDGameData.ItemsSold[item.name];
            }
            mult = KDCalcMarketDecayMultiplier(quantitystart, quantity);
            let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
            return TextGet("KDInventoryActionSellBulk").replace("VLU", value + "");
        },
        valid: (_player, item) => {
            if (KDGameData.ItemPriority[item.name] > 9)
                return false;
            return item?.type == LooseRestraint || item?.type == Consumable;
        },
        show: (_player, item) => {
            return item?.type == LooseRestraint || item?.type == Consumable;
        },
        click: (player, item) => {
            let mult = 1;
            let quantity = ((item.quantity) ? item.quantity : 1);
            let quantitystart = 0;
            if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
                quantitystart = KDGameData.ItemsSold[item.name];
            }
            mult = KDCalcMarketDecayMultiplier(quantitystart, quantity);
            let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
            let itemInv = KinkyDungeonInventoryGetSafe(item.name, KDInventoryActionContainer(player));
            if (!itemInv)
                return;
            if (itemInv.type == Consumable)
                KinkyDungeonChangeConsumable(KDConsumable(itemInv), -itemInv.quantity, KDInventoryActionContainer(player));
            else
                KinkyDungeonInventoryRemoveSafe(itemInv, KDInventoryActionContainer(player));
            if (!KDGameData.ItemsSold)
                KDGameData.ItemsSold = {};
            KDGameData.ItemsSold[item.name] = (KDGameData.ItemsSold[item.name] || 0) + quantity;
            KinkyDungeonAddGold(value);
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
            KinkyDungeonSendTextMessage(10, TextGet("KDSellBulk")
                .replace("ITM", KDGetItemName(item))
                .replace("VLU", "" + value)
                .replace("#", "" + (itemInv.quantity || 1)), KDBaseWhite, 2);
        },
        cancel: (_player, delta) => {
            if (delta > 0) {
                if (KinkyDungeonLastTurnAction != "Wait") {
                    return true;
                }
            }
            return false;
        },
    },
    "SellExcess": {
        icon: (_player, _item) => {
            return "InventoryAction/SellExcess";
        },
        label: (_player, item) => {
            let mult = 1;
            let quantity = ((item.quantity) ? item.quantity : 1) - 1;
            let quantitystart = 0;
            if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
                quantitystart = KDGameData.ItemsSold[item.name];
            }
            mult = KDCalcMarketDecayMultiplier(quantitystart, quantity);
            let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
            return TextGet("KDGP").replace("AMNT", value + "");
        },
        text: (_player, item) => {
            let mult = 1;
            let quantity = ((item.quantity) ? item.quantity : 1) - 1;
            let quantitystart = 0;
            if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
                quantitystart = KDGameData.ItemsSold[item.name];
            }
            mult = KDCalcMarketDecayMultiplier(quantitystart, quantity);
            let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
            return TextGet("KDInventoryActionSellExcess").replace("VLU", value + "");
        },
        valid: (_player, item) => {
            if (KDGameData.ItemPriority[item.name] > 9)
                return false;
            return item?.type == LooseRestraint || item?.type == Consumable;
        },
        show: (_player, item) => {
            if (!item.quantity || item.quantity == 1)
                return false;
            return item?.type == LooseRestraint || item?.type == Consumable;
        },
        click: (player, item) => {
            let mult = 1;
            let quantity = ((item.quantity) ? item.quantity : 1) - 1;
            let quantitystart = 0;
            if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
                quantitystart = KDGameData.ItemsSold[item.name];
            }
            mult = KDCalcMarketDecayMultiplier(quantitystart, quantity);
            let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost(item, true, true));
            let itemInv = KinkyDungeonInventoryGetSafe(item.name, KDInventoryActionContainer(player));
            if (!itemInv)
                return;
            if (itemInv.type == Consumable)
                KinkyDungeonChangeConsumable(KDConsumable(itemInv), -quantity, KDInventoryActionContainer(player));
            else
                KinkyDungeonInventoryGetSafe(item.name, KDInventoryActionContainer(player)).quantity = 1;
            if (!KDGameData.ItemsSold)
                KDGameData.ItemsSold = {};
            KDGameData.ItemsSold[item.name] = (KDGameData.ItemsSold[item.name] || 0) + quantity;
            KinkyDungeonAddGold(value);
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
            KinkyDungeonSendTextMessage(10, TextGet("KDSellExcess")
                .replace("ITM", KDGetItemName(item))
                .replace("VLU", "" + value)
                .replace("#", "" + (quantity || 1)), KDBaseWhite, 2);
        },
        cancel: (_player, delta) => {
            if (delta > 0) {
                if (KinkyDungeonLastTurnAction != "Wait") {
                    return true;
                }
            }
            return false;
        },
    },
    "Recycle": {
        doubleSize: true,
        alsoShow: ["RecycleBulk", "RecycleExcess"],
        icon: (_player, _item) => {
            return "InventoryAction/Recycle";
        },
        show: (_player, item) => {
            return item?.type == LooseRestraint;
        },
        label: (player, item) => {
            return KDRecycleString(item, 1, undefined);
        },
        itemlabel: (player, item) => {
            return KDRecycleString(item, 1, undefined);
        },
        itemlabelcolor: (_player, _item) => { return KDBaseWhite; },
        text: (_player, _item) => {
            let value = Math.round(100);
            return TextGet("KDInventoryActionRecycle").replace("VLU", value + "");
        },
        valid: (_player, item) => {
            if (KDGameData.ItemPriority[item.name] > 9)
                return false;
            if (KDWeapon(item)?.unarmed)
                return false;
            if (KDRestraint(item)?.noRecycle != undefined)
                return false;
            return item?.type == Weapon || item?.type == LooseRestraint || item?.type == Consumable;
        },
        click: (player, item) => {
            KDChangeRecyclerInput(KDRecycleItem(item, 1, KDInventoryActionContainer(player)));
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Recycle.ogg");
            KinkyDungeonSendTextMessage(10, KDRecycleResourceString(false, "RecyclerInput_"), KDBaseWhite, 2);
            KinkyDungeonSendTextMessage(10, TextGet("KDRecycle")
                .replace("ITM", KDGetItemName(item))
                .replace("VLU", "" + 100), KDBaseWhite, 2);
        },
        cancel: (_player, delta) => {
            if (delta > 0) {
                if (KinkyDungeonLastTurnAction != "Wait") {
                    return true;
                }
            }
            return false;
        },
    },
    "RecycleBulk": {
        icon: (_player, _item) => {
            return "InventoryAction/RecycleBulk";
        },
        label: (_player, item) => {
            return KDRecycleString(item, item.quantity || 1, undefined);
        },
        text: (_player, item) => {
            return TextGet("KDInventoryActionRecycleBulk");
        },
        valid: (_player, item) => {
            if (KDGameData.ItemPriority[item.name] > 9)
                return false;
            if (KDWeapon(item)?.unarmed)
                return false;
            if (KDRestraint(item)?.noRecycle != undefined)
                return false;
            return item?.type == LooseRestraint;
        },
        show: (_player, item) => {
            return item?.type == LooseRestraint;
        },
        click: (player, item) => {
            let itemInv = KinkyDungeonInventoryGetSafe(item.name, KDInventoryActionContainer(player));
            if (!itemInv) {
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/BeepEngage.ogg");
                return;
            }
            let quant = (itemInv.quantity || 1);
            KDChangeRecyclerInput(KDRecycleItem(item, itemInv.quantity || 1, KDInventoryActionContainer(player)));
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Recycle.ogg");
            KinkyDungeonSendTextMessage(10, KDRecycleResourceString(false, "RecyclerInput_"), KDBaseWhite, 2);
            KinkyDungeonSendTextMessage(10, TextGet("KDRecycleBulk")
                .replace("ITM", KDGetItemName(item))
                .replace("VLU", "" + 100)
                .replace("#", "" + quant), KDBaseWhite, 2);
        },
        cancel: (_player, delta) => {
            if (delta > 0) {
                if (KinkyDungeonLastTurnAction != "Wait") {
                    return true;
                }
            }
            return false;
        },
    },
    "RecycleExcess": {
        icon: (_player, _item) => {
            return "InventoryAction/RecycleExcess";
        },
        label: (_player, item) => {
            if (item.quantity > 1)
                return KDRecycleString(item, item.quantity - 1, undefined);
            return "";
        },
        text: (_player, _item) => {
            let value = Math.round(100);
            return TextGet("KDInventoryActionRecycleExcess").replace("VLU", value + "");
        },
        valid: (_player, item) => {
            if (KDGameData.ItemPriority[item.name] > 9)
                return false;
            if (KDWeapon(item)?.unarmed)
                return false;
            if (KDRestraint(item)?.noRecycle != undefined)
                return false;
            return (item?.type == LooseRestraint && item?.quantity > 1);
        },
        show: (_player, item) => {
            return item?.type == LooseRestraint;
        },
        click: (player, item) => {
            let itemInv = KinkyDungeonInventoryGetSafe(item.name, KDInventoryActionContainer(player));
            if (!itemInv || !(itemInv.quantity > 1)) {
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/BeepEngage.ogg");
                return;
            }
            let quant = (itemInv.quantity - 1);
            KDChangeRecyclerInput(KDRecycleItem(item, itemInv.quantity - 1, KDInventoryActionContainer(player)));
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Recycle.ogg");
            KinkyDungeonSendTextMessage(10, KDRecycleResourceString(false, "RecyclerInput_"), KDBaseWhite, 2);
            KinkyDungeonSendTextMessage(10, TextGet("KDRecycleExcess")
                .replace("ITM", KDGetItemName(item))
                .replace("VLU", "" + 100)
                .replace("#", "" + quant), KDBaseWhite, 2);
        },
        cancel: (_player, delta) => {
            if (delta > 0) {
                if (KinkyDungeonLastTurnAction != "Wait") {
                    return true;
                }
            }
            return false;
        },
    },
    "Disassemble": {
        hotkey: () => { return KDHotkeyToText(KinkyDungeonKeySpell[4]); },
        hotkeyPress: () => { return KinkyDungeonKeySpell[4]; },
        icon: (_player, _item) => {
            return "InventoryAction/Disassemble";
        },
        show: (_player, item) => {
            return item?.type == LooseRestraint && KDRestraint(item)?.disassembleAs != undefined;
        },
        itemlabelcolor: (_player, _item) => { return KDBaseWhite; },
        text: (_player, item) => {
            let one = (item.quantity || 1) == 1 ? "One" : "";
            return TextGet("KDInventoryActionDisassemble" + one);
        },
        valid: (_player, item) => {
            if (KDGameData.ItemPriority[item.name] > 9)
                return false;
            if (KDWeapon(item)?.unarmed)
                return false;
            return KDRestraint(item)?.disassembleAs != undefined;
        },
        click: (player, item) => {
            let itemInv = KinkyDungeonInventoryGetSafe(item.name, KDInventoryActionContainer(player));
            if (!itemInv || !(itemInv.quantity > 0)) {
                if (KDSoundEnabled())
                    AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/BeepEngage.ogg");
                return;
            }
            let quant = Math.max(1, ((itemInv.quantity || 1) - 1));
            let mult = KDRestraint(item)?.disassembleCount || 1;
            let product = KDRestraint(item)?.disassembleAs;
            KinkyDungeonInventoryAddLoose(product, undefined, undefined, quant, KDInventoryActionContainer(player));
            itemInv.quantity = (itemInv.quantity || 1) - quant;
            if (itemInv.quantity == 0)
                KinkyDungeonInventoryRemoveSafe(itemInv, KDInventoryActionContainer(player));
            if (KDSoundEnabled())
                AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Recycle.ogg");
            KinkyDungeonSendTextMessage(10, TextGet("KDRecycleExcess")
                .replace("ITM", KDGetItemName(item))
                .replace("PRD", TextGet("Restraint" + product))
                .replace("#", "" + quant)
                .replace("$", "" + quant * mult), KDBaseWhite, 2);
        },
        cancel: (_player, delta) => {
            if (delta > 0) {
                if (KinkyDungeonLastTurnAction != "Wait") {
                    return true;
                }
            }
            return false;
        },
    },
    "Bondage": {
        doubleSize: true,
        icon: (_player, _item) => {
            return "InventoryAction/Bondage";
        },
        valid: (player, item) => {
            if (!(item?.type == LooseRestraint))
                return false;
            if (KDRestraintSpecial(item) || KDRestraint(item).armor)
                return false;
            if (KDInventoryActionContainer(player))
                return false;
            let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
            for (let enemy of nearby) {
                if (enemy.id == KDGameData.BondageTarget && (KinkyDungeonIsDisabled(enemy) || (enemy.playWithPlayer && KDCanDom(enemy)))) {
                    return true;
                }
            }
            return false;
        },
        click: (player, item) => {
            let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
            for (let enemy of nearby) {
                if (enemy.id == KDGameData.BondageTarget && (KinkyDungeonIsDisabled(enemy) || (enemy.playWithPlayer && KDCanDom(enemy)))) {
                    let level = KDRestraint(item).power;
                    let type = KDRestraintBondageType(item);
                    let status = KDRestraintBondageStatus(item);
                    let mult = KDRestraintBondageMult(item, enemy);
                    KDTieUpEnemy(enemy, level * mult, type);
                    KinkyDungeonSendTextMessage(10, TextGet("KDTieUpEnemy")
                        .replace("RSTR", KDGetItemName(item))
                        .replace("ENNME", TextGet("Name" + enemy.Enemy.name))
                        .replace("AMNT", "" + Math.round(100 * enemy.boundLevel / enemy.Enemy.maxhp)), KDBaseWhite, 1);
                    if (status.belt) {
                        KinkyDungeonApplyBuffToEntity(enemy, KDChastity);
                    }
                    if (status.toy) {
                        KinkyDungeonApplyBuffToEntity(enemy, KDToy);
                    }
                    if (status.plug) {
                        KinkyDungeonApplyBuffToEntity(enemy, KDEntityBuffedStat(enemy, "Plug") > 0 ? KDDoublePlugged : KDPlugged);
                    }
                    if (status.blind) {
                        enemy.blind = Math.max(enemy.blind || 0, status.blind);
                    }
                    if (status.silence) {
                        enemy.silence = Math.max(enemy.silence || 0, status.silence);
                    }
                    if (status.bind) {
                        enemy.bind = Math.max(enemy.bind || 0, status.bind);
                    }
                    if (status.immobile) {
                        enemy.immobile = Math.max(enemy.immobile || 0, status.immobile);
                    }
                    if (status.slow) {
                        enemy.slow = Math.max(enemy.slow || 0, status.slow);
                    }
                    if (status.disarm) {
                        enemy.disarm = Math.max(enemy.disarm || 0, status.disarm);
                    }
                    if (status.reduceaccuracy) {
                        KinkyDungeonApplyBuffToEntity(enemy, KDRestraintReduceAccuracy, {
                            power: status.reduceaccuracy,
                        });
                    }
                    if (KDSoundEnabled())
                        AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/LockLight.ogg");
                    if (!enemy.items)
                        enemy.items = [];
                    enemy.items.push(item.inventoryVariant || item.name);
                    if (item.quantity > 1)
                        item.quantity -= 1;
                    else
                        KinkyDungeonInventoryRemoveSafe(item);
                    KinkyDungeonAdvanceTime(1, true, true);
                    break;
                }
            }
        },
        cancel: (player, delta) => {
            if (delta > 0) {
                let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
                for (let enemy of nearby) {
                    if (enemy.id == KDGameData.BondageTarget && (KinkyDungeonIsDisabled(enemy) || (enemy.playWithPlayer && KDCanDom(enemy)))) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        },
    },
    "Food": {
        icon: (_player, _item) => {
            return "InventoryAction/Cookie";
        },
        valid: (player, item) => {
            if (!(item?.type == Consumable) || item.quantity < 1 || !KDConsumable(item)?.wp_instant)
                return false;
            let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
            for (let enemy of nearby) {
                if (enemy.id == KDGameData.FoodTarget && enemy.hp < enemy.Enemy.maxhp) {
                    return true;
                }
            }
            return false;
        },
        click: (player, item) => {
            let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
            for (let enemy of nearby) {
                if (enemy.id == KDGameData.FoodTarget) {
                    enemy.hp = Math.min(enemy.Enemy.maxhp, enemy.hp + KDConsumable(item)?.wp_instant * 5);
                    let faction2 = KDGetFaction(enemy);
                    if (!KinkyDungeonHiddenFactions.has(faction2)) {
                        KinkyDungeonChangeFactionRep(faction2, 0.01 * KDConsumable(item)?.wp_instant);
                    }
                    if (KDConsumable(item)?.sideEffects) {
                        for (let effect of KDConsumable(item).sideEffects) {
                            KinkyDungeonConsumableEffectNPC(KDConsumable(item), enemy, effect, item);
                        }
                    }
                    KinkyDungeonSendTextMessage(10, TextGet("KDGiveFood")
                        .replace("RSTR", KDGetItemName(item))
                        .replace("ENNME", TextGet("Name" + enemy.Enemy.name))
                        .replace("AMNT1", "" + Math.round(10 * enemy.hp))
                        .replace("AMNT2", "" + Math.round(10 * enemy.Enemy.maxhp)), KDBaseWhite, 1);
                    if (KDSoundEnabled())
                        AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Cookie.ogg");
                    if (item.quantity > 1)
                        item.quantity -= 1;
                    else
                        KinkyDungeonInventoryRemoveSafe(item, KDInventoryActionContainer(player));
                    KinkyDungeonAdvanceTime(1, true, true);
                    break;
                }
            }
        },
        text: (player, item) => {
            let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
            for (let enemy of nearby) {
                if (enemy.id == KDGameData.FoodTarget) {
                    if (KDIsFood(item) && KDIsArtificial(enemy)) {
                        return TextGet("KDWontRestoreDollNPC");
                    }
                }
            }
            return TextGet("KDInventoryActionFood", KDGetGenericDialogueParams(player, KinkyDungeonFindID(KDGameData.FoodTarget)));
        },
        label: (player, item) => {
            let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
            for (let enemy of nearby) {
                if (enemy.id == KDGameData.FoodTarget) {
                    if (KDIsFood(item) && KDIsArtificial(enemy)) {
                        return TextGet("KDNoRestore");
                    }
                }
            }
            return "";
        },
        itemlabel: (player, item) => {
            let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
            for (let enemy of nearby) {
                if (enemy.id == KDGameData.FoodTarget) {
                    if (KDIsFood(item) && KDIsArtificial(enemy)) {
                        return TextGet("KDNoRestore");
                    }
                }
            }
            return "";
        },
        itemlabelcolor: (_player, _item) => { return "#ffff44"; },
        highlight: (player, item) => {
            let artificial = false;
            let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
            for (let enemy of nearby) {
                if (enemy.id == KDGameData.FoodTarget) {
                    if (KDIsFood(item) && KDIsArtificial(enemy)) {
                        artificial = true;
                        break;
                    }
                }
            }
            return (KDConsumable(item)?.wp_gradual != undefined
                || KDConsumable(item)?.wp_instant != undefined) ? (artificial ? KDBaseYellow : KDBaseGreal) : KDButtonColor;
        },
        cancel: (player, delta) => {
            if (delta > 0) {
                let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
                for (let enemy of nearby) {
                    if (enemy.id == KDGameData.FoodTarget) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        },
    },
};
function KDInventoryActionContainer(player) {
    if (player.player && !!KDGameData.InventoryAction) {
        if (KDGameData.InventoryActionContainer?.length > 0) {
            if (KDGameData.InventoryActionContainer[0] == KDGameData.InventoryAction) {
                return KDGetContainer(KDGameData.InventoryActionContainer[1]);
            }
        }
    }
    return null;
}
//# sourceMappingURL=KDInventoryActions.js.map