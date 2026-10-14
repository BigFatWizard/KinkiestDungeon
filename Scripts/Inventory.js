"use strict";
function InventoryGet(C, AssetGroup) {
    for (let A = 0; A < C.Appearance.length; A++) {
        if ((C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group.Name == AssetGroup))
            return C.Appearance[A];
        if ((C.Appearance[A].Model != null) && (C.Appearance[A].Model.Group == AssetGroup))
            return C.Appearance[A];
    }
    return null;
}
//# sourceMappingURL=Inventory.js.map