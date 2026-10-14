"use strict";
;
let KDPathCache = new Map();
let KDPathCacheIgnoreLocks = new Map();
let KDSmartMovable = new Map();
let KDMovable = new Map();
function KDUpdateDoorNavMap() {
    KDPathCache = new Map();
    KDUpdateChokes = true;
    KDMovable = new Map();
    KDSmartMovable = new Map();
}
function KDIsMovable(x, y) {
    if (KDMovable.has(x + ',' + y)) {
        return KDMovable.get(x + ',' + y);
    }
    else {
        let m = KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x, y));
        KDMovable.set(x + ',' + y, m);
        return m;
    }
}
function KDIsSmartMovable(x, y) {
    if (KDSmartMovable.has(x + ',' + y)) {
        return KDSmartMovable.get(x + ',' + y);
    }
    else {
        let m = KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(x, y));
        KDSmartMovable.set(x + ',' + y, m);
        return m;
    }
}
let KDPathfindingCacheHits = 0;
let KDPathfindingCacheFails = 0;
let KDPFTrim = 40;
function KinkyDungeonFindPath(startx, starty, endx, endy, blockEnemy, blockPlayer, ignoreLocks, Tiles, RequireLight, noDoors, needDoorMemory, Enemy, trimLongDistance, heuristicOverride, taxicab, ignoreTrafficLaws, allowPassable, ignoreAllWeighting, Leashtarget) {
    let tileShort = Tiles;
    if (Tiles == KinkyDungeonMovableTilesSmartEnemy)
        tileShort = "TSE";
    else if (Tiles == KinkyDungeonMovableTilesEnemy)
        tileShort = "TE";
    else if (Tiles == KinkyDungeonGroundTiles)
        tileShort = "TG";
    let index = `${startx},${starty},${endx},${endy},${tileShort}`;
    if (!blockEnemy && !blockPlayer && !RequireLight && !noDoors && !needDoorMemory) {
        if (ignoreLocks) {
            if (KDPathCacheIgnoreLocks.has(index)) {
                KDPathfindingCacheHits++;
                if (KDPathCacheIgnoreLocks.get(index)[0] && KDistChebyshev(KDPathCacheIgnoreLocks.get(index)[0].x - startx, KDPathCacheIgnoreLocks.get(index)[0].y - starty) < 1.5)
                    return KDPathCacheIgnoreLocks.get(index).slice(0);
                else
                    KDPathCacheIgnoreLocks.delete(index);
            }
        }
        else {
            if (KDPathCache.has(index)) {
                KDPathfindingCacheHits++;
                if (KDPathCache.get(index)[0] && KDistChebyshev(KDPathCache.get(index)[0].x - startx, KDPathCache.get(index)[0].y - starty) < 1.5)
                    return KDPathCache.get(index).slice(0);
                else
                    KDPathCache.delete(index);
            }
        }
    }
    if (KDistChebyshev(startx - endx, starty - endy) < 1.5) {
        return [{ x: endx, y: endy }];
    }
    function heuristic(xx, yy, endxx, endyy) {
        return 0.1 * KDistEuclideanApprox((xx - endxx) * (xx - endxx), (yy - endyy) * (yy - endyy));
    }
    let heur = heuristicOverride || heuristic;
    let TilesTemp = Tiles;
    if (noDoors)
        TilesTemp = Tiles.replace("D", "");
    let start = { x: startx, y: starty, g: 0, f: 0, s: "" };
    let open = new Map();
    open.set(startx + "," + starty, start);
    let closed = new Map();
    let costBonus = 0;
    let MapTile = null;
    let moveCost = 1;
    let succ = new Map();
    let xx = 0;
    let yy = 0;
    let loc = "";
    while (open.size > 0) {
        if (trimLongDistance && (closed.size > KDPFTrim || open.size > 3 * KDPFTrim)) {
            console.log("Quit pathfinding");
            return undefined;
        }
        let lowest_old = undefined;
        let lowest = undefined;
        let lc = 1000000000;
        let dx = 0;
        let dy = 0;
        open.forEach(o => {
            if (o.f < lc) {
                lc = o.f;
                lowest_old = lowest;
                lowest = o;
            }
        });
        if (lowest) {
            let lowLoc = lowest.x + "," + lowest.y;
            moveCost = 1;
            succ = new Map();
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if ((x != 0 || y != 0) && (!taxicab || y == 0 || x == 0)) {
                        xx = lowest.x + x;
                        yy = lowest.y + y;
                        loc = (xx) + "," + (yy);
                        let tile = (xx == endx && yy == endy) ? "" : KinkyDungeonMapGet(xx, yy);
                        MapTile = KinkyDungeonTilesGet(loc);
                        let locIndex = `${lowLoc},${endx},${endy},${tileShort}`;
                        if (xx == endx && yy == endy) {
                            closed.set(lowLoc, lowest);
                            let newPath = KinkyDungeonGetPath(closed, lowest.x, lowest.y, endx, endy);
                            if (!blockEnemy && !blockPlayer && !RequireLight && !noDoors && !needDoorMemory) {
                                if (ignoreLocks) {
                                    if (!KDPathCacheIgnoreLocks.has(index))
                                        KDSetPathfindCache(KDPathCacheIgnoreLocks, newPath, endx, endy, tileShort, index);
                                }
                                else {
                                    if (!KDPathCache.has(index))
                                        KDSetPathfindCache(KDPathCache, newPath, endx, endy, tileShort, index);
                                }
                            }
                            KDPathfindingCacheFails++;
                            if (newPath.length > 0 && TilesTemp.includes(KinkyDungeonMapGet(newPath[0].x, newPath[0].y)))
                                return newPath;
                            else
                                return undefined;
                        }
                        else if (!blockEnemy && !blockPlayer && !RequireLight && !noDoors && !needDoorMemory
                            && ((ignoreLocks && KDPathCacheIgnoreLocks.has(locIndex)) || (!ignoreLocks && KDPathCache.has(locIndex)))) {
                            let newPath = [];
                            if (ignoreLocks) {
                                closed.set(lowLoc, lowest);
                                newPath = KinkyDungeonGetPath(closed, lowest.x, lowest.y);
                                let endPath = KDPathCacheIgnoreLocks.get(locIndex).slice(0);
                                KDPathfindingCacheHits++;
                                newPath.push(...endPath);
                            }
                            else {
                                closed.set(lowLoc, lowest);
                                newPath = KinkyDungeonGetPath(closed, lowest.x, lowest.y);
                                let endPath = KDPathCache.get(locIndex).slice(0);
                                KDPathfindingCacheHits++;
                                newPath.push(...endPath);
                            }
                            if (newPath.length > 0) {
                                if (newPath[0] && KDistChebyshev(newPath[0].x - startx, newPath[0].y - starty) < 1.5) {
                                    if (ignoreLocks) {
                                        if (!KDPathCacheIgnoreLocks.has(index))
                                            KDSetPathfindCache(KDPathCacheIgnoreLocks, newPath, endx, endy, tileShort, index);
                                    }
                                    else {
                                        if (!KDPathCache.has(index))
                                            KDSetPathfindCache(KDPathCache, newPath, endx, endy, tileShort, index);
                                    }
                                    return newPath;
                                }
                                else if (ignoreLocks) {
                                    KDPathCacheIgnoreLocks.delete(locIndex);
                                }
                                else {
                                    KDPathCache.delete(locIndex);
                                }
                            }
                            else
                                return undefined;
                        }
                        else if (TilesTemp.includes(tile) && (!RequireLight || KinkyDungeonVisionGet(xx, yy) > 0)
                            && (ignoreLocks || !MapTile || !MapTile.Lock || (Enemy && KDLocks[MapTile.Lock].canNPCPass(xx, yy, MapTile, Enemy)))
                            && (!KinkyDungeonEnemyAt(xx, yy)?.Enemy?.immobile)
                            && (!blockEnemy || (Leashtarget > 0 && Leashtarget == KinkyDungeonEnemyAt(xx, yy)?.leash?.entity) || KinkyDungeonNoEnemyExceptSub(xx, yy, false, Enemy)
                                || (allowPassable && KDCanPassEnemy(KDPlayer(), KinkyDungeonEnemyAt(xx, yy))))
                            && (!blockPlayer || KinkyDungeonPlayerEntity.x != xx || KinkyDungeonPlayerEntity.y != yy)
                            && (!needDoorMemory || tile != "d" || KDOpenDoorTiles.includes(KDMapData.TilesMemory[xx + "," + yy]))) {
                            costBonus = 0;
                            if (!ignoreTrafficLaws) {
                                if (KDEffectTileTagsLoc(loc)?.danger)
                                    costBonus += 30;
                                else if (tile == "V" && !(MapTile?.Sfty))
                                    costBonus = 14;
                                else if (tile == "N")
                                    costBonus = 30;
                                else if (tile == "D")
                                    costBonus = 3;
                                else if (tile == "d")
                                    costBonus = -2;
                                else if (tile == "g")
                                    costBonus = 9;
                                else if (tile == "L")
                                    costBonus = 9;
                                else if (tile == "T")
                                    costBonus = 4;
                                costBonus = (MapTile && MapTile.Lock) ? costBonus + 2 : costBonus;
                                costBonus = (MapTile && MapTile.OL) ? costBonus + 12 : costBonus;
                                costBonus = (KDMapData.Traffic?.length > 0 && KDMapData.Traffic[yy])
                                    ? costBonus + (KDMapData.Traffic[yy][xx] || 0) : costBonus;
                                costBonus = Math.max(0, costBonus);
                            }
                            else if (!ignoreAllWeighting) {
                                if (tile == "V" && !(MapTile?.Sfty))
                                    costBonus = 3;
                                else if (tile == "N")
                                    costBonus = 8;
                                else if (tile == "L")
                                    costBonus = 2;
                            }
                            if (!!x && !!y) {
                                if (lowest_old) {
                                    dx = lowest.x - lowest_old.x;
                                    dy = lowest.y - lowest_old.y;
                                    if (dx != x || dy != y) {
                                        costBonus += 0.45;
                                    }
                                    else
                                        costBonus += 0.22;
                                }
                            }
                            succ.set(xx + "," + yy, { x: xx, y: yy,
                                g: moveCost + costBonus + lowest.g,
                                f: moveCost + costBonus + lowest.g + heur(xx, yy, endx, endy),
                                s: lowLoc });
                        }
                    }
                }
            }
            succ.forEach(s => {
                let q = s.x + "," + s.y;
                let openSucc = open.get(q);
                if (!openSucc || openSucc.f > s.f) {
                    let closedSucc = closed.get(q);
                    if (!closedSucc || closedSucc.f > s.f) {
                        open.set(q, s);
                    }
                }
            });
            open.delete(lowLoc);
            closed.set(lowLoc, lowest);
        }
        else {
            open.clear();
            console.log("Pathfinding error! Please report this!");
        }
    }
    return undefined;
}
function KinkyDungeonGetPath(closed, xx, yy, endx, endy) {
    let list = [];
    if (endx && endy)
        list.push({ x: endx, y: endy });
    let current = closed.get(xx + "," + yy);
    while (current) {
        if (current.s) {
            list.push({ x: current.x, y: current.y });
            current = closed.get(current.s);
        }
        else
            current = undefined;
    }
    return list.reverse();
}
function KDSetPathfindCache(PathMap, newPath, endx, endy, Tiles, Finalindex) {
    for (let i = 0; i < newPath.length - 1; i++) {
        let path = newPath.slice(i);
        let index = `${path[0].x},${path[0].y},${endx},${endy},${Tiles}`;
        PathMap.set(index, path.slice(1));
    }
    if (Finalindex)
        PathMap.set(Finalindex, newPath.slice(0));
}
//# sourceMappingURL=KinkyDungeonPathfinding.js.map