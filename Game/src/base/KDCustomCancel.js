"use strict";
function KDNonContextActions(mobile, textArea) {
    if (!textArea && KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && MouseIn(0, 0, 500, PIXIHeight)
        && !KinkyDungeonShowInventory) {
        KinkyDungeonShowInventory = !KinkyDungeonShowInventory;
        return true;
    }
    return false;
}
let KDCustomCancels = [
    {
        condition: () => {
            return KDInventoryStatus.HideQuickInv || KDInventoryStatus.DropQuickInv || KDInventoryStatus.SortQuickInv || KinkyDungeonShowInventory;
        },
        cancel: () => {
            if (KinkyDungeonShowInventory) {
                if (KDInventoryStatus.HideQuickInv || KDInventoryStatus.DropQuickInv || KDInventoryStatus.SortQuickInv) {
                    KDInventoryStatus.HideQuickInv = false;
                    KDInventoryStatus.DropQuickInv = false;
                    KDInventoryStatus.SortQuickInv = false;
                }
                else
                    KinkyDungeonShowInventory = false;
                KinkyDungeonGameKey.keyPressed[9] = false;
                KinkyDungeonKeybindingCurrentKey = '';
                return true;
            }
            if (KDInventoryStatus.HideQuickInv || KDInventoryStatus.DropQuickInv || KDInventoryStatus.SortQuickInv) {
                KDInventoryStatus.HideQuickInv = false;
                KDInventoryStatus.DropQuickInv = false;
                KDInventoryStatus.SortQuickInv = false;
            }
            KinkyDungeonGameKey.keyPressed[9] = false;
            KinkyDungeonKeybindingCurrentKey = '';
            return false;
        },
    },
    {
        condition: () => {
            return KDGameData.InventoryAction == "Recycle" && KinkyDungeonDrawState == "Inventory";
        },
        cancel: () => {
            KinkyDungeonDrawState = "Facilities";
            KinkyDungeonGameKey.keyPressed[9] = false;
            KinkyDungeonKeybindingCurrentKey = '';
            return true;
        },
    },
    {
        condition: () => {
            return KinkyDungeonDrawState == "Container";
        },
        cancel: () => {
            KinkyDungeonDrawState = KDUI_ContainerBackScreen || "Game";
            KinkyDungeonGameKey.keyPressed[9] = false;
            KinkyDungeonKeybindingCurrentKey = '';
            return true;
        },
    },
    {
        condition: () => {
            return KinkyDungeonTargetingSpell && KinkyDungeonDrawState == "Game";
        },
        cancel: () => {
            KinkyDungeonGameKey.keyPressed[9] = false;
            KinkyDungeonTargetingSpell = null;
            KinkyDungeonTargetingSpellItem = null;
            KinkyDungeonTargetingSpellWeapon = null;
            return true;
        },
    }
];
//# sourceMappingURL=KDCustomCancel.js.map