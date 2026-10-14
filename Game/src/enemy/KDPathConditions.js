"use strict";
let KDPathConditions = {
    barrel: {
        query: (attemptingNPC, thisNPC) => {
            return true;
        },
        doPassthrough: (attemptingNPC, thisNPC, mapdata) => {
            return 1;
        },
    },
    barricade: {
        query: (attemptingNPC, thisNPC) => {
            return true;
        },
        doPassthrough: (attemptingNPC, thisNPC, mapdata) => {
            if (KDRemoveEntity(thisNPC, false, false, true)
                && !KDEnemyIsTemporary(thisNPC)) {
                KDAddRepopQueue({
                    x: thisNPC.x,
                    y: thisNPC.y,
                    time: 1,
                    entity: thisNPC,
                }, mapdata);
            }
            return -1;
        },
    },
    witchwall: {
        query: (attemptingNPC, thisNPC) => {
            return (KDEnemyRank(attemptingNPC) >= 3
                || attemptingNPC.Enemy?.tags.witch)
                || KinkyDungeonJailGuard()?.id == attemptingNPC.id
                || KinkyDungeonLeashingEnemy()?.id == attemptingNPC.id;
        },
        doPassthrough: (attemptingNPC, thisNPC, mapdata) => {
            return 1;
        },
    },
    puppetstrings: {
        query: (attemptingNPC, thisNPC) => {
            return (KDEnemyRank(attemptingNPC) >= 3
                || attemptingNPC.Enemy?.tags.dressmaker)
                || KinkyDungeonJailGuard()?.id == attemptingNPC.id
                || KinkyDungeonLeashingEnemy()?.id == attemptingNPC.id;
        },
        doPassthrough: (attemptingNPC, thisNPC, mapdata) => {
            return 1;
        },
    },
    stonedoor: {
        query: (attemptingNPC, thisNPC) => {
            return KDEnemyRank(attemptingNPC) >= 3
                || KinkyDungeonJailGuard()?.id == attemptingNPC.id
                || KinkyDungeonLeashingEnemy()?.id == attemptingNPC.id;
        },
        doPassthrough: (attemptingNPC, thisNPC, mapdata) => {
            if (KDRemoveEntity(thisNPC, false, false, true)
                && !KDEnemyIsTemporary(thisNPC)) {
                KDAddRepopQueue({
                    x: thisNPC.x,
                    y: thisNPC.y,
                    time: 5,
                    entity: thisNPC,
                }, mapdata);
            }
            return 0;
        },
    },
    blastdoor: {
        query: (attemptingNPC, thisNPC) => {
            return (KDEnemyRank(attemptingNPC) >= 3
                || attemptingNPC.Enemy?.tags.robot
                || attemptingNPC.Enemy?.tags.trainer
                || attemptingNPC.Enemy?.tags.cyborg
                || attemptingNPC.Enemy?.tags.dollsmith)
                || KinkyDungeonJailGuard()?.id == attemptingNPC.id
                || KinkyDungeonLeashingEnemy()?.id == attemptingNPC.id;
        },
        doPassthrough: (attemptingNPC, thisNPC, mapdata) => {
            if (KDRemoveEntity(thisNPC, false, false, true)
                && !KDEnemyIsTemporary(thisNPC)) {
                KDAddRepopQueue({
                    x: thisNPC.x,
                    y: thisNPC.y,
                    time: 5,
                    entity: thisNPC,
                }, mapdata);
            }
            return 0;
        },
    },
};
//# sourceMappingURL=KDPathConditions.js.map