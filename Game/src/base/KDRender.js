"use strict";
let KDRender = {
    JourneyMap: () => {
        if (KDGameData.JourneyMap) {
            let X = KDGameData.JourneyX;
            let Y = KDGameData.JourneyY;
            KDRenderJourneyMap(X, Math.floor(Y / KDLevelsPerCheckpoint) * KDLevelsPerCheckpoint, undefined, KDLevelsPerCheckpoint);
        }
    },
};
let KDCustomDrawState = {
    JourneyMap: (xOffset) => {
        if (KDGameData.JourneyMap) {
            let Y = KDGameData.JourneyY;
            KDRenderJourneyMap(0, Math.floor(Y / KDLevelsPerCheckpoint) * KDLevelsPerCheckpoint, undefined, KDLevelsPerCheckpoint, undefined, undefined, undefined, undefined, undefined, undefined, true, false);
            KDDrawLoreRepTabs(xOffset);
        }
    },
};
//# sourceMappingURL=KDRender.js.map