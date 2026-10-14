"use strict";
let KD_GENWEIGHTCUTOFF = 100000;
function KDAddLabel(label) {
    if (!KDMapData.Labels)
        KDMapData.Labels = {};
    if (!KDMapData.Labels[label.type])
        KDMapData.Labels[label.type] = [];
    KDMapData.Labels[label.type].push(label);
}
function KDMapTilesPopulate(_w, _h, indices, data, requiredAccess, maxTagFlags, tagModifiers) {
    let tiles_temp = [];
    for (let t of Object.keys(indices)) {
        tiles_temp.push(t);
    }
    let tileOrder = [];
    let tilesFilled = {};
    let indexFilled = {};
    while (tiles_temp.length > 0) {
        let ind = Math.floor(KDRandom() * tiles_temp.length);
        if (indices[tiles_temp[ind]])
            tileOrder.push(tiles_temp[ind]);
        else {
            indexFilled[tiles_temp[ind]] = '';
            tilesFilled[tiles_temp[ind]] = {};
        }
        tiles_temp.splice(ind, 1);
    }
    let tagCounts = {};
    let fails = 0;
    let ii = 0;
    let globalTags = Object.assign({}, data.params.globalTags || {});
    if (KinkyDungeonStatsChoice.get("arousalMode"))
        globalTags.arousalMode = true;
    if (KinkyDungeonStatsChoice.get("hardMode"))
        globalTags.hardMode = true;
    if (data?.MapData) {
        let mapData = data.MapData;
        if (mapData.JailFaction) {
            for (let jf of mapData.JailFaction) {
                globalTags["jf_" + jf] = true;
            }
        }
        if (mapData.GuardFaction) {
            for (let gf of mapData.GuardFaction) {
                globalTags["gf_" + gf] = true;
            }
        }
        if (mapData.MapFaction) {
            globalTags["faction_" + mapData.MapFaction] = true;
        }
    }
    while (tileOrder.length > 0) {
        let tileOrderInd = Math.floor(KDRandom() * tileOrder.length);
        let tileSpot = tileOrder[tileOrderInd];
        let indX = parseInt(tileSpot.split(',')[0]);
        let indY = parseInt(tileSpot.split(',')[1]);
        if (indX == undefined || indY == undefined) {
            fails += 1;
            if (fails > 100)
                tileOrder = [];
            console.log("Nuclear meltdown. Pls report. Tilespot = " + tileSpot);
            continue;
        }
        if (ii == 0 || ((indices[tileSpot].includes('l') && indexFilled[(indX - 1) + ',' + (indY)])
            || (indices[tileSpot].includes('r') && indexFilled[(indX + 1) + ',' + (indY)])
            || (indices[tileSpot].includes('u') && indexFilled[(indX) + ',' + (indY - 1)])
            || (indices[tileSpot].includes('d') && indexFilled[(indX) + ',' + (indY + 1)]))) {
            let cornerX = (indX - 1) * KDTE_Scale + 1;
            let cornerY = (indY - 1) * KDTE_Scale + 1;
            if (indexFilled[tileSpot]) {
                tileOrder.splice(tileOrderInd, 1);
                continue;
            }
            let index = indices[tileSpot];
            if (!index) {
                fails += 1;
                if (fails > 100)
                    tileOrder = [];
                console.log("Nuclear meltdown. Pls report. Index = " + index + ", Tilespot = " + tileSpot);
                continue;
            }
            let tileName;
            let tile;
            let tags;
            let trycount = 0;
            while (trycount < 10) {
                try {
                    tileName = KD_GetMapTile(index, indX, indY, tilesFilled, indexFilled, tagCounts, requiredAccess, globalTags, indices, tagModifiers);
                    tile = KDMapTilesList[tileName];
                    tags = KD_PasteTile(tile, cornerX, cornerY, data);
                    if (tags) {
                        for (let t of tags) {
                            if (!tagCounts[t])
                                tagCounts[t] = 1;
                            else
                                tagCounts[t] += 1;
                        }
                        for (let xx = 1; xx <= tile.w; xx++)
                            for (let yy = 1; yy <= tile.h; yy++) {
                                tilesFilled[(indX + xx - 1) + "," + (indY + yy - 1)] = tile;
                                indexFilled[(indX + xx - 1) + "," + (indY + yy - 1)] = tile.index[xx + ',' + yy];
                                KDMapData.CategoryIndex[(indX + xx - 1) + "," + (indY + yy - 1)] = {
                                    category: tile.category,
                                    tags: tags,
                                };
                            }
                    }
                    tileOrder.splice(tileOrderInd, 1);
                    trycount += 100;
                }
                catch (err) {
                    let str = `Error trying to paste tile named ${tileName} at ${indX}, ${indY} - Attempt ${trycount}`;
                    if (trycount < 2) {
                        KinkyDungeonSendTextMessage(1, str, KDBaseTeal);
                    }
                    console.log(str);
                    console.log(err);
                }
                trycount++;
            }
            if ((trycount > 10) && (trycount < 100)) {
                console.log(`Could not create map tile at ${indX}, ${indY} - Please report!`);
            }
        }
        for (let t of Object.entries(maxTagFlags)) {
            if (tagCounts[t[0]] >= t[1])
                globalTags["max" + t[0]] = true;
        }
        ii += 1;
    }
    console.log(tagCounts);
    console.log(globalTags);
    console.log(tilesFilled);
    console.log(indexFilled);
    return tilesFilled;
}
function KDGetTileWeight(mapTile, tags, tagCounts, tagModifiers) {
    let weight = mapTile.weight;
    if (mapTile.forbidTags) {
        for (let tag of mapTile.forbidTags) {
            if (tags[tag])
                return 0;
        }
    }
    if (mapTile.requireTags) {
        for (let tag of mapTile.requireTags) {
            if (!tags[tag]) {
                return 0;
            }
        }
    }
    for (let i = 0; i < mapTile.indexTags.length; i++) {
        let not = mapTile.notTags && mapTile.notTags[i];
        if ((!not && tags[mapTile.indexTags[i]])
            || (not && !tags[mapTile.indexTags[i]])) {
            if (mapTile.maxTags[i] >= 0) {
                let count = tagCounts[mapTile.maxTags[i]];
                if (count && count >= mapTile.maxTags[i])
                    return 0;
            }
            if (mapTile.bonusTags[i])
                weight += mapTile.bonusTags[i];
            if (mapTile.multTags[i] != undefined)
                weight *= mapTile.multTags[i];
        }
    }
    if (weight > 0 && tagModifiers) {
        for (let tag of mapTile.tags) {
            if (tagModifiers[tag] != undefined)
                weight *= tagModifiers[tag];
            if (weight == 0)
                return 0;
        }
    }
    return weight;
}
function KD_GetMapTile(index, indX, indY, tilesFilled, indexFilled, tagCounts, requiredAccess, globalTags, indices, tagModifiers) {
    let tagList = {
        "1,1": KDAggregateTileTags(indX, indY, 1, 1, tilesFilled, globalTags),
    };
    let tile = null;
    let WeightTotal = 0;
    let Weights = [];
    let maxWeight = 0;
    for (let mapTile of Object.values(KDMapTilesList)) {
        if (mapTile.primInd == index ||
            (mapTile.flexEdge
                && mapTile.flexEdge['1,1']
                && (mapTile.primInd.includes(index)
                    || (mapTile.flexEdgeSuper && mapTile.flexEdgeSuper['1,1'])))) {
            if (!KDCheckMapTileFilling(mapTile, indX, indY, indices, requiredAccess, indexFilled))
                continue;
            if (!KDCheckMapTileAccess(mapTile, indX, indY, indexFilled, requiredAccess))
                continue;
            let tags = tagList[mapTile.w + ',' + mapTile.h];
            if (!tags) {
                tags = KDAggregateTileTags(indX, indY, mapTile.w, mapTile.h, tilesFilled, globalTags);
                tagList[mapTile.w + ',' + mapTile.h] = tags;
            }
            if (requiredAccess[indX + ',' + indY])
                tags.start = true;
            let weight = KDGetTileWeight(mapTile, tags, tagCounts, tagModifiers);
            if (weight > 0 && (maxWeight < KD_GENWEIGHTCUTOFF || weight >= KD_GENWEIGHTCUTOFF)) {
                maxWeight = weight;
                Weights.push({ tile: mapTile, weight: WeightTotal });
                WeightTotal += mapTile.weight;
            }
        }
    }
    if (maxWeight >= KD_GENWEIGHTCUTOFF) {
        for (let L = Weights.length - 1; L >= 0; L--) {
            if (Weights[L].weight < KD_GENWEIGHTCUTOFF) {
                Weights[L].weight = 0;
                break;
            }
        }
    }
    let selection = KDRandom() * WeightTotal;
    for (let L = Weights.length - 1; L >= 0; L--) {
        if (selection > Weights[L].weight) {
            tile = Weights[L].tile.name;
            break;
        }
    }
    if (!tile) {
        console.log("ERROR AT INDEX " + indX + "," + indY);
    }
    return tile;
}
function KDCheckMapTileFilling(mapTile, indX, indY, indices, requiredAccess, indexFilled) {
    let passCount = 0;
    for (let xx = 1; xx <= mapTile.w; xx++)
        for (let yy = 1; yy <= mapTile.h; yy++) {
            let fail = false;
            let ind = mapTile.index[xx + ',' + yy];
            if (indices[(xx + indX - 1) + ',' + (yy + indY - 1)] == undefined)
                return false;
            if (ind != indices[(xx + indX - 1) + ',' + (yy + indY - 1)] && KDLooseIndexRankingSuspend(indices[(xx + indX - 1) + ',' + (yy + indY - 1)], ind, mapTile.w, mapTile.h, xx, yy)) {
                if (mapTile.flexEdge && mapTile.flexEdge[xx + ',' + yy] && ((mapTile.flexEdgeSuper && mapTile.flexEdgeSuper[xx + ',' + yy]) || ((yy > 1
                    || !indices[(xx + indX - 1) + ',' + (yy + indY - 1)].includes('u')
                    || indexFilled[(xx + indX - 1) + ',' + (yy + indY - 1 - 1)] != undefined)
                    && (yy < mapTile.h
                        || !indices[(xx + indX - 1) + ',' + (yy + indY - 1)].includes('d')
                        || indexFilled[(xx + indX - 1) + ',' + (yy + indY - 1 + 1)] != undefined)
                    && (xx < mapTile.w
                        || !indices[(xx + indX - 1) + ',' + (yy + indY - 1)].includes('l')
                        || indexFilled[(xx + indX - 1 - 1) + ',' + (yy + indY - 1)] != undefined)
                    && (xx > 1
                        || !indices[(xx + indX - 1) + ',' + (yy + indY - 1)].includes('r')
                        || indexFilled[(xx + indX - 1 + 1) + ',' + (yy + indY - 1)] != undefined))))
                    fail = true;
                else
                    return false;
            }
            if (indexFilled[(xx + indX - 1) + ',' + (yy + indY - 1)])
                return false;
            if (mapTile.w != 1 || mapTile.h != 1 || (mapTile.inaccessible && mapTile.inaccessible.length > 0)) {
                if (requiredAccess[(xx + indX - 1) + ',' + (yy + indY - 1)])
                    return false;
            }
            if (!fail)
                passCount += 1;
        }
    return passCount > 0;
}
function KDLooseIndexRankingSuspend(indexCheck, indexTile, w, h, xx, yy) {
    if (w == 1 && h == 1)
        return true;
    if (xx > 1 && xx < w && yy > 1 && yy < h)
        return false;
    if (!indexCheck)
        return true;
    if (!indexTile)
        return true;
    if (indexCheck.includes('u') && yy == 1 && !indexTile.includes('u'))
        return true;
    if (indexCheck.includes('d') && yy == h && !indexTile.includes('d'))
        return true;
    if (indexCheck.includes('l') && xx == 1 && !indexTile.includes('l'))
        return true;
    if (indexCheck.includes('r') && xx == w && !indexTile.includes('r'))
        return true;
    return false;
}
function KDCheckMapTileAccess(mapTile, indX, indY, indexFilled, _requiredAccess) {
    if (mapTile.inaccessible) {
        for (let access of mapTile.inaccessible) {
            let XX1 = indX + access.indX1 - 1;
            let XX2 = indX + access.indX2 - 1;
            let YY1 = indY + access.indY1 - 1;
            let YY2 = indY + access.indY2 - 1;
            if ((access.dir1 == "l" && !indexFilled[(XX1 - 1) + ',' + (YY1)])
                || (access.dir1 == "r" && !indexFilled[(XX1 + 1) + ',' + (YY1)])
                || (access.dir1 == "u" && !indexFilled[(XX1) + ',' + (YY1 - 1)])
                || (access.dir1 == "d" && !indexFilled[(XX1) + ',' + (YY1 + 1)]))
                return false;
            if ((access.dir2 == "l" && !indexFilled[(XX2 - 1) + ',' + (YY2)])
                || (access.dir2 == "r" && !indexFilled[(XX2 + 1) + ',' + (YY2)])
                || (access.dir2 == "u" && !indexFilled[(XX2) + ',' + (YY2 - 1)])
                || (access.dir2 == "d" && !indexFilled[(XX2) + ',' + (YY2 + 1)]))
                return false;
        }
    }
    return true;
}
function KD_PasteTile(tile, x, y, data) {
    let tileWidth = KDTE_Scale * tile.w;
    let tileHeight = KDTE_Scale * tile.h;
    tile = JSON.parse(JSON.stringify(tile));
    let MazeSeeds = [];
    let MazeBlock = [];
    for (let xx = 0; xx < tileWidth; xx++)
        for (let yy = 0; yy < tileHeight; yy++) {
            let tileTile = tile.grid[xx + yy * (tileWidth + 1)];
            KinkyDungeonMapSetForce(x + xx, y + yy, tileTile);
            if (tileTile == 'B' && !data.notraps && KinkyDungeonStatsChoice.has("Nowhere")) {
                if (KDRandom() < 0.5)
                    KinkyDungeonTilesSet((x + xx) + "," + (y + yy), {
                        Type: "Trap",
                        Trap: "BedTrap",
                        Furniture: "Bed",
                    });
            }
        }
    if (tile.Keyring) {
        for (let k of tile.Keyring) {
            KDGameData.KeyringLocations.push({ x: x + k.x, y: y + k.y });
        }
    }
    if (tile.Labels) {
        for (let k of Object.values(tile.Labels)) {
            for (let l of k) {
                l.x += x;
                l.y += y;
                KDAddLabel(l);
            }
        }
    }
    if (tile.POI)
        for (let origPoi of tile.POI) {
            let poi = Object.assign({}, origPoi);
            KinkyDungeonPOI.push(poi);
            poi.x = x + poi.x;
            poi.y = y + poi.y;
            if (poi.chance && KDRandom() > poi.chance)
                poi.used = true;
        }
    for (let tileLoc of Object.entries(tile.Tiles)) {
        let xx = parseInt(tileLoc[0].split(',')[0]);
        let yy = parseInt(tileLoc[0].split(',')[1]);
        if (xx != undefined && yy != undefined) {
            if (tileLoc[1].MazeSeed) {
                MazeSeeds.push({ x: xx, y: yy, seed: tileLoc[1].MazeSeed });
            }
            else if (tileLoc[1].MazeBlock) {
                MazeBlock.push({ x: xx, y: yy });
            }
            let gennedTile = KDCreateTile(xx + x, yy + y, Object.assign({}, tileLoc[1]), data);
            if (gennedTile)
                KinkyDungeonTilesSet((xx + x) + "," + (yy + y), gennedTile);
            if (tileLoc[1] && tileLoc[1].OL) {
                if (!KinkyDungeonTilesGet((xx + x) + "," + (yy + y)))
                    KinkyDungeonTilesSet((xx + x) + "," + (yy + y), { OL: true });
                else
                    KinkyDungeonTilesGet((xx + x) + "," + (yy + y)).OL = true;
            }
        }
    }
    for (let tileLoc of Object.entries(tile.Skin)) {
        let xx = parseInt(tileLoc[0].split(',')[0]);
        let yy = parseInt(tileLoc[0].split(',')[1]);
        if (xx != undefined && yy != undefined) {
            KDMapData.TilesSkin[(xx + x) + "," + (yy + y)] = tileLoc[1];
        }
    }
    for (let tileLoc of Object.entries(tile.effectTiles)) {
        let xx = parseInt(tileLoc[0].split(',')[0]);
        let yy = parseInt(tileLoc[0].split(',')[1]);
        if (xx != undefined && yy != undefined) {
            for (let eTile of Object.entries(tileLoc[1])) {
                KDCreateEffectTileTile(xx + x, yy + y, eTile[1], data);
            }
        }
    }
    if (MazeSeeds.length > 0) {
        for (let seed of MazeSeeds) {
            let maze = KDGenMaze(seed.x, seed.y, tile, seed.seed, MazeBlock);
            for (let t of maze) {
                if (KinkyDungeonMapGet(t.x + x, t.y + y) == '1')
                    KinkyDungeonMapSet(t.x + x, t.y + y, '0');
            }
            let pillarToDoodad = seed.seed?.pillarToDoodad || false;
            if (pillarToDoodad) {
                for (let xx = 1; xx < tileWidth - 1; xx++)
                    for (let yy = 1; yy < tileHeight - 1; yy++) {
                        let neighbors = 0;
                        for (let xxx = -1; xxx <= 1; xxx++)
                            for (let yyy = -1; yyy <= 1; yyy++) {
                                if (!KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x + xx + xxx, y + yy + yyy))) {
                                    neighbors += 1;
                                }
                            }
                        if (neighbors == 1 && KinkyDungeonMapGet(x + xx, y + yy) == '1')
                            KinkyDungeonMapSet(x + xx, y + yy, 'X');
                    }
            }
        }
    }
    return tile.tags;
}
function KDGenMaze(startX, startY, tile, seed, _MazeBlock) {
    let tileWidth = Math.round(KDTE_Scale * tile.w);
    let tileHeight = Math.round(KDTE_Scale * tile.h);
    let scale = seed?.scale || 1;
    let branchchance = seed?.branchchance || 0;
    let endchance = seed?.endchance || 0;
    let hbias = seed?.hbias || 0;
    let vbias = seed?.vbias || 0;
    let wobble = seed?.wobble || 0;
    let isMazeBlock = (x, y) => {
        return tile.Tiles && tile.Tiles[x + ',' + y] && tile.Tiles[x + ',' + y].MazeBlock;
    };
    let ActivatedTiles = {};
    let isValid = (x, y, allowActivated) => {
        if (x >= 0 && y >= 0 && x + scale <= tileWidth && y + scale <= tileHeight) {
            if (isMazeBlock(x, y))
                return false;
            if (!allowActivated && ActivatedTiles[x + ',' + y])
                return false;
            return true;
        }
        return false;
    };
    let CarvedTiles = [];
    let ActiveTiles = [];
    let EndPoints = [];
    let BacktrackLinks = [];
    let RemoveTiles = [];
    let recordBacktrack = endchance > 0;
    let chooseNext = () => {
        if (ActiveTiles.length == 0)
            return null;
        if (seed) {
            if (seed.newest && KDRandom() < seed.newest)
                return ActiveTiles[ActiveTiles.length - 1];
            if (seed.oldest && KDRandom() < seed.oldest)
                return ActiveTiles[0];
        }
        return ActiveTiles[Math.floor(KDRandom() * ActiveTiles.length)];
    };
    let spread = (x, y, xe, ye) => {
        if (isValid(x, y, KDRandom() < branchchance) && !isMazeBlock(xe, ye)) {
            ActiveTiles.push({ x: x, y: y });
            ActivatedTiles[(x) + ',' + (y)] = true;
            let wob = KDRandom() < wobble;
            let wobx = Math.floor(scale * KDRandom());
            let woby = Math.floor(scale * KDRandom());
            for (let xx = 0; xx < scale; xx++)
                for (let yy = 0; yy < scale; yy++)
                    if (!wob || (xx != wobx && yy != woby))
                        CarvedTiles.push({ x: xx + xe, y: yy + ye });
            return true;
        }
        return false;
    };
    let operate = (x, y) => {
        for (let xx = 0; xx < scale; xx++)
            for (let yy = 0; yy < scale; yy++)
                CarvedTiles.push({ x: xx + x, y: yy + y });
        let succeed = false;
        let options = [
            { x: x + 2 * scale, y: y, xe: x + 1 * scale, ye: y },
            { x: x - 2 * scale, y: y, xe: x - 1 * scale, ye: y },
            { x: x, y: y + 2 * scale, xe: x, ye: y + 1 * scale },
            { x: x, y: y - 2 * scale, xe: x, ye: y - 1 * scale },
        ];
        while (options.length > 0) {
            let i = Math.floor(options.length * KDRandom());
            if (hbias && options[i].x == x && options.length > 2 && KDRandom() < hbias)
                continue;
            else if (vbias && options[i].y == y && options.length > 2 && KDRandom() < vbias)
                continue;
            if (spread(options[i].x, options[i].y, options[i].xe, options[i].ye)) {
                succeed = true;
                if (recordBacktrack) {
                    if (!BacktrackLinks[x + ',' + y]) {
                        BacktrackLinks[x + ',' + y] = {};
                    }
                    if (!BacktrackLinks[options[i].xe + ',' + options[i].ye]) {
                        BacktrackLinks[options[i].xe + ',' + options[i].ye] = {};
                    }
                    if (!BacktrackLinks[options[i].x + ',' + options[i].y]) {
                        BacktrackLinks[options[i].x + ',' + options[i].y] = {};
                    }
                    BacktrackLinks[x + ',' + y][options[i].xe + ',' + options[i].ye]
                        = { x: options[i].xe, y: options[i].ye };
                    BacktrackLinks[options[i].xe + ',' + options[i].ye][options[i].x + ',' + options[i].y]
                        = { x: options[i].x, y: options[i].y };
                    BacktrackLinks[options[i].xe + ',' + options[i].ye][x + ',' + y]
                        = { x: x, y: y };
                    BacktrackLinks[options[i].x + ',' + options[i].y][options[i].xe + ',' + options[i].ye]
                        = { x: options[i].xe, y: options[i].ye };
                }
                break;
            }
            options.splice(i, 1);
        }
        if (!succeed) {
            for (let t of ActiveTiles) {
                if (t.x == x && t.y == y) {
                    ActiveTiles.splice(ActiveTiles.indexOf(t), 1);
                    if (recordBacktrack && BacktrackLinks[t.x + ',' + t.y] && Object.values(BacktrackLinks[t.x + ',' + t.y]).length == 1)
                        EndPoints.push({ x: t.x, y: t.y });
                }
            }
        }
        return chooseNext();
    };
    ActiveTiles.push({ x: startX, y: startY });
    let activeTile = operate(startX, startY);
    while (activeTile) {
        activeTile = operate(activeTile.x, activeTile.y);
    }
    if (endchance > 0) {
        for (let endp of EndPoints) {
            let x = endp.x;
            let y = endp.y;
            if (KDRandom() < endchance && BacktrackLinks[x + ',' + y]) {
                let links = Object.values(BacktrackLinks[x + ',' + y])
                    .filter((link) => { return !RemoveTiles[link.x + ',' + link.y]; });
                while (links?.length <= 1) {
                    for (let xx = 0; xx < scale; xx++)
                        for (let yy = 0; yy < scale; yy++)
                            RemoveTiles[(x + xx) + ',' + (y + yy)] = true;
                    if (links?.length > 0) {
                        x = links[0].x;
                        y = links[0].y;
                        links = (links.length > 0 && BacktrackLinks[x + ',' + y]) ?
                            Object.values(BacktrackLinks[x + ',' + y])
                                .filter((link) => { return !RemoveTiles[link.x + ',' + link.y]; }) : null;
                    }
                    else {
                        links = null;
                    }
                }
            }
        }
        let newCarved = [];
        for (let t of CarvedTiles) {
            if (!RemoveTiles[t.x + ',' + t.y]) {
                newCarved.push(t);
            }
        }
        CarvedTiles = newCarved;
    }
    return CarvedTiles;
}
let KDEffectTileGen = {
    "TorchUnlit": (x, y, tile, tileGenerator, data) => {
        let torchlitchance = data.params.torchlitchance || 0.6;
        let mapMod = null;
        if (KDGameData.MapMod) {
            mapMod = KDMapMods[KDGameData.MapMod];
        }
        let altRoom = KDGameData.RoomType;
        let altType = altRoom ? KinkyDungeonAltFloor((mapMod && mapMod.altRoom) ? mapMod.altRoom : altRoom) : KinkyDungeonBossFloor(data.Floor);
        if (KDRandom() < torchlitchance)
            KDTorch(x, y - 1, altType, data.params);
        else
            KDTorchUnlit(x, y - 1, altType, data.params);
        return null;
    },
    "Torch": (x, y, tile, tileGenerator, data) => {
        let mapMod = null;
        if (KDGameData.MapMod) {
            mapMod = KDMapMods[KDGameData.MapMod];
        }
        let altRoom = KDGameData.RoomType;
        let altType = altRoom ? KinkyDungeonAltFloor((mapMod && mapMod.altRoom) ? mapMod.altRoom : altRoom) : KinkyDungeonBossFloor(data.Floor);
        KDTorch(x, y - 1, altType, data.params);
        return null;
    },
    "Wire": (x, y, tile, tileGenerator, data) => {
        KDCreateEffectTile(x, y, {
            name: "Wire",
            duration: 9999, infinite: true,
        }, 0);
        return null;
    },
};
let KDTileGen = {
    "Rubble": (x, y, tile, tileGenerator, data) => {
        let rubblechance = data.params.rubblechance || 0.5;
        if (KinkyDungeonStatsChoice.get("Pristine"))
            rubblechance *= 0.3;
        if (KDRandom() < rubblechance)
            KinkyDungeonMapSet(x, y, 'R');
        else if (KDRandom() < rubblechance * rubblechance - 0.01)
            KinkyDungeonMapSet(x, y, '/');
        else
            KinkyDungeonMapSet(x, y, 'r');
        return null;
    },
    "RubbleNoMend": (x, y, tile, tileGenerator, data) => {
        let rubblechance = data.params.rubblechance || 0.5;
        if (KinkyDungeonStatsChoice.get("Pristine"))
            rubblechance *= 0.3;
        if (KDRandom() < rubblechance)
            KinkyDungeonMapSet(x, y, 'R');
        else if (KDRandom() < rubblechance * rubblechance - 0.01)
            KinkyDungeonMapSet(x, y, '/');
        else
            KinkyDungeonMapSet(x, y, 'r');
        return null;
    },
    "Debris": (x, y, tile, tileGenerator, data) => {
        let rubblechance = data.params.rubblechance || 1;
        if (tileGenerator.Always || KDRandom() < rubblechance)
            KinkyDungeonMapSet(x, y, '/');
        else
            KinkyDungeonMapSet(x, y, 'r');
        return null;
    },
    "Barrel": (x, y, tile, tileGenerator, data) => {
        let barrelChance = data.params.barrelChance || 0.25;
        if (tileGenerator.Always || KDRandom() < barrelChance)
            KinkyDungeonMapSet(x, y, 'L');
        else
            KinkyDungeonMapSet(x, y, 'r');
        return null;
    },
    "Spawn": (x, y, tile, tileGenerator, data) => {
        data.spawnpoints.push({
            x: x,
            y: y,
            required: tileGenerator.required,
            ftags: tileGenerator.filterTags,
            tags: tileGenerator.tags,
            AI: tileGenerator.AI, faction: tileGenerator.faction,
            levelBoost: tileGenerator.levelBoost,
            forceIndex: tileGenerator.forceIndex,
        });
        KinkyDungeonMapSet(x, y, '0');
        return null;
    },
    "ForceSpawn": (x, y, tile, tileGenerator, data) => {
        if (!tileGenerator.Chance || KDRandom() < tileGenerator.Chance) {
            let enemy = KinkyDungeonGetEnemy(tileGenerator.tags, MiniGameKinkyDungeonLevel + (tileGenerator.levelBoost || 0), tileGenerator.forceIndex || KDCurrIndex(), '0', tileGenerator.required, tileGenerator.requireHostile, tileGenerator.bonusTags, tileGenerator.filterTags, tileGenerator.requireSingleTag);
            if (enemy) {
                let en = DialogueCreateEnemy(x, y, enemy.name);
                if (en && tileGenerator.faction) {
                    en.faction = tileGenerator.faction;
                }
                KDRunCreationScript(en, KDGetCurrentLocation());
            }
        }
        KinkyDungeonMapSet(x, y, '0');
        return null;
    },
    "Prisoner": (x, y, tile, tileGenerator, data) => {
        SetpieceSpawnPrisoner(x, y);
        KinkyDungeonMapSet(x, y, '0');
        return null;
    },
    "Chest": (x, y, tile, tileGenerator, data) => {
        if (tileGenerator.Loot) {
            if (tileGenerator.Priority || KDRandom() < (tileGenerator.Chance || 0.5)) {
                KinkyDungeonMapSet(x, y, 'C');
                KDGameData.ChestsGenerated.push(tileGenerator.Loot);
                return {
                    NoTrap: tileGenerator.NoTrap,
                    Type: tileGenerator.Lock ? "Lock" : undefined, Lock: tileGenerator.Lock == "Red" ? KDRandomizeRedLock() : tileGenerator.Lock,
                    Loot: tileGenerator.Lock == "Blue" ? "blue" : (tileGenerator.Loot ? tileGenerator.Loot : "chest"),
                    Faction: tileGenerator.Faction,
                    Roll: KDRandom(),
                    refill: tileGenerator.refill,
                    origloot: (tileGenerator.Loot ? tileGenerator.Loot : "storage"),
                    Special: tileGenerator.Lock == "Blue",
                    RedSpecial: tileGenerator.Lock?.includes("Red"),
                    lootTrap: KDGenChestTrap(false, x, y, (tileGenerator.Loot ? tileGenerator.Loot : "chest"), tileGenerator.Lock, tileGenerator.NoTrap),
                };
            }
            else {
                KinkyDungeonMapSet(x, y, 'c');
            }
        }
        else {
            data.chestlist.push(({ x: x, y: y, priority: tileGenerator.Priority, NoTrap: tileGenerator.NoTrap }));
            KinkyDungeonMapSet(x, y, '2');
        }
        return null;
    },
    "GuardedChest": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'C');
        let faction = KDPlaceChest(x - 1, y - 1, 3, data.chestlist, data.spawnpoints, true);
        return {
            NoTrap: tileGenerator.NoTrap,
            Type: tileGenerator.Lock ? "Lock" : undefined, Lock: tileGenerator.Lock,
            Loot: tileGenerator.Lock == "Blue" ? "blue" : (tileGenerator.Loot ? tileGenerator.Loot : "storage"),
            Faction: faction,
            refill: tileGenerator.refill,
            origloot: (tileGenerator.Loot ? tileGenerator.Loot : "storage"),
            Roll: KDRandom(),
            Special: tileGenerator.Lock == "Blue",
            RedSpecial: tileGenerator.Lock?.includes("Red"),
            lootTrap: KDGenChestTrap(false, x, y, (tileGenerator.Loot ? tileGenerator.Loot : "chest"), tileGenerator.Lock, tileGenerator.NoTrap),
        };
    },
    "ChestOrShrine": (x, y, tile, tileGenerator, data) => {
        let chestcount = data.params.chestcount || 1;
        let shrinecount = data.params.shrinecount || 1;
        if (KDRandom() < (chestcount) / Math.max(1, chestcount + shrinecount))
            data.chestlist.push(({ x: x, y: y, NoTrap: tileGenerator.NoTrap }));
        else
            data.shrinelist.push(({ x: x, y: y, NoTrap: tileGenerator.NoTrap }));
        KinkyDungeonMapSet(x, y, '2');
        return null;
    },
    "Door": (x, y, tile, tileGenerator, data) => {
        let doorchance = data.params.doorchance;
        let nodoorchance = data.params.nodoorchance || 0;
        if ("Ddg".includes(KinkyDungeonMapGet(x - 1, y))
            || "Ddg".includes(KinkyDungeonMapGet(x + 1, y))
            || "Ddg".includes(KinkyDungeonMapGet(x, y - 1))
            || "Ddg".includes(KinkyDungeonMapGet(x, y + 1)))
            nodoorchance = 1.0;
        else if (!(KDInteractableTiles.includes(KinkyDungeonMapGet(x + 1, y)) && KDInteractableTiles.includes(KinkyDungeonMapGet(x - 1, y)))
            && !(KDInteractableTiles.includes(KinkyDungeonMapGet(x, y + 1)) && KDInteractableTiles.includes(KinkyDungeonMapGet(x, y - 1)))) {
            nodoorchance = 1.0;
        }
        if (tileGenerator.Priority || KDRandom() > nodoorchance) {
            if (tileGenerator.AlwaysClose || KDRandom() < doorchance) {
                KinkyDungeonMapSet(x, y, 'D');
            }
            else {
                KinkyDungeonMapSet(x, y, 'd');
            }
            return { Type: "Door", Lock: tileGenerator.Lock == "Red" ? KDRandomizeRedLock() : tileGenerator.Lock, OL: tileGenerator.OL, RequiredDoor: tileGenerator.Priority, DoorSkin: tileGenerator.DoorSkin };
        }
        else {
            KinkyDungeonMapSet(x, y, '2');
            if (nodoorchance <= 0.99) {
                return { PotentialDoor: true, OL: tileGenerator.OL };
            }
        }
        return null;
    },
    "Shrine": (x, y, tile, tileGenerator, data) => {
        data.shrinelist.push(({ x: x, y: y, priority: tileGenerator.Priority }));
        KinkyDungeonMapSet(x, y, 'a');
        return null;
    },
    "DollDropoff": (x, y, tile, tileGenerator, data) => {
        if (KinkyDungeonStatsChoice.get("NoDoll")) {
            KinkyDungeonMapSet(x, y, '0');
            return null;
        }
        KinkyDungeonMapSet(x, y, '5');
        KDMapData.JailPoints.push({ x: x, y: y, type: "dropoff", direction: tileGenerator.direction || { x: 0, y: -1 }, radius: 1, restrainttags: ["dollstand"] });
        return { Sprite: "Floor", Overlay: tileGenerator.Overlay || "DollDropoff", Type: "DollDropoff" };
    },
    "Cage": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'L');
        let storage = KDDoJailPointForTile(x, y);
        if (!storage)
            KDMapData.JailPoints.push({ x: x, y: y, type: "furniture", radius: 1 });
        return { Type: "Furniture", Furniture: KDGetPervertibleFurniture("Cage", KinkyDungeonStatsChoice.get("MoreKinkyFurniture") ? 0.8 : 0.1) };
    },
    "AlwaysCage": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'L');
        let storage = KDDoJailPointForTile(x, y);
        if (!storage)
            KDMapData.JailPoints.push({ x: x, y: y, type: "furniture", radius: 1 });
        return { Type: "Furniture", Furniture: "Cage" };
    },
    "DisplayStand": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'L');
        let storage = KDDoJailPointForTile(x, y);
        if (!storage)
            KDMapData.JailPoints.push({ x: x, y: y, type: "furniture", radius: 1 });
        return { Type: "Furniture", Furniture: tileGenerator.Furniture };
    },
    "OneBarTrap": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'L');
        let storage = KDDoJailPointForTile(x, y);
        if (!storage)
            KDMapData.JailPoints.push({ x: x, y: y, type: "furniture", radius: 1 });
        return { Type: "Furniture", Furniture: KinkyDungeonStatsChoice.get("arousalMode") ? "OneBarTrap" : "DisplayStand" };
    },
    "OneBarVibeTrap": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'L');
        let storage = KDDoJailPointForTile(x, y);
        if (!storage)
            KDMapData.JailPoints.push({ x: x, y: y, type: "furniture", radius: 1 });
        return { Type: "Furniture", Furniture: KinkyDungeonStatsChoice.get("arousalMode") ? "OneBarVibeTrap" : "DisplayStand" };
    },
    "OneBarSpreaderTrap": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'L');
        let storage = KDDoJailPointForTile(x, y);
        if (!storage)
            KDMapData.JailPoints.push({ x: x, y: y, type: "furniture", radius: 1 });
        return { Type: "Furniture", Furniture: KinkyDungeonStatsChoice.get("arousalMode") ? "OneBarSpreaderTrap" : "DisplayStand" };
    },
    "OneBarSpreaderVibeTrap": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'L');
        let storage = KDDoJailPointForTile(x, y);
        if (!storage)
            KDMapData.JailPoints.push({ x: x, y: y, type: "furniture", radius: 1 });
        return { Type: "Furniture", Furniture: KinkyDungeonStatsChoice.get("arousalMode") ? "OneBarSpreaderVibeTrap" : "DisplayStand" };
    },
    "DollStand": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'L');
        let storage = KDDoJailPointForTile(x, y);
        if (!storage)
            KDMapData.JailPoints.push({ x: x, y: y, type: "furniture", radius: 1 });
        return { Type: "Furniture", Furniture: "DollStandReal" };
    },
    "DollStandSpreader": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'L');
        let storage = KDDoJailPointForTile(x, y);
        if (!storage)
            KDMapData.JailPoints.push({ x: x, y: y, type: "furniture", radius: 1 });
        return { Type: "Furniture", Furniture: "DollStandSpreaderReal" };
    },
    "JailBed": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'B');
        KDMapData.JailPoints.push({ x: x, y: y, type: "jail", radius: 1 });
        return { Jail: true, OL: true };
    },
    "JailPoint": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, '0');
        KDMapData.JailPoints.push({ x: x, y: y, type: "jail", radius: 1 });
        return { Jail: true, OL: true };
    },
    "Furniture": (x, y, tile, tileGenerator, data) => {
        let storage = KDDoJailPointForTile(x, y);
        if (!storage)
            KDMapData.JailPoints.push({ x: x, y: y, type: (tileGenerator.jail?.type) || "furniture", radius: (tileGenerator.jail?.radius) || 1 });
        return { Type: "Furniture", Furniture: tileGenerator.Furniture };
    },
    "Table": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'F');
        let type = "";
        if (tileGenerator.Food == "Plate") {
            let WeightTotal = 0;
            let Weights = [];
            for (let obj of Object.values(KDFood)) {
                if (!obj.FilterPerk || !KinkyDungeonStatsChoice.get(obj.FilterPerk)) {
                    Weights.push({ event: obj, weight: WeightTotal });
                    WeightTotal += obj.Weight;
                }
            }
            let selection = KDRandom() * WeightTotal;
            for (let L = Weights.length - 1; L >= 0; L--) {
                if (selection > Weights[L].weight) {
                    type = Weights[L].event.Food;
                    break;
                }
            }
        }
        return { Food: type, Type: "Food" };
    },
    "Trap": (x, y, tile, tileGenerator, data) => {
        let trapchance = data.params.trapchance || 0.1;
        if (tileGenerator.Always || KDRandom() < trapchance)
            data.traps.push(({ x: x, y: y }));
        KinkyDungeonMapSet(x, y, '2');
        return null;
    },
    "Charger": (x, y, tile, tileGenerator, data) => {
        if (tileGenerator.Priority) {
            return { Type: "Charger", NoRemove: KinkyDungeonMapGet(x, y) == '=', lightColor: KDChargerColor, Light: (KinkyDungeonMapGet(x, y) == '=' ? KDChargerLight : undefined) };
        }
        KinkyDungeonMapSet(x, y, '-');
        data.chargerlist.push(({ x: x, y: y }));
        return null;
    },
    "Conveyor": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'V');
        return { Type: "Conveyor", DX: tileGenerator.DX, DY: tileGenerator.DY, OL: true, wireType: tileGenerator.wireType, SwitchMode: tileGenerator.SwitchMode };
    },
    "SafetyConveyor": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'v');
        return { Type: "Conveyor", DX: tileGenerator.DX, DY: tileGenerator.DY, OL: true, wireType: tileGenerator.wireType, SwitchMode: tileGenerator.SwitchMode, Sfty: true };
    },
    "DollSupply": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'u');
        return { Type: "DollSupply", index: 0, cd: 0, rate: tileGenerator.rate || 10, count: tileGenerator.count, dollType: tileGenerator.dollType, SwitchMode: tileGenerator.SwitchMode, wireType: tileGenerator.wireType };
    },
    "DollTerminal": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 't');
        return { Type: "DollTerminal", OL: true };
    },
    "Skin": (x, y, tile, tileGenerator, data) => {
        return { Skin: tileGenerator.Skin, Skin2: tileGenerator.Skin };
    },
    "SkinCode": (x, y, tile, tileGenerator, data) => {
        return { SkinCode: tileGenerator.SkinCode, Skin2: tileGenerator.Skin2, Skin: tileGenerator.Skin };
    },
    "BondageMachine": (x, y, tile, tileGenerator, data) => {
        KinkyDungeonMapSet(x, y, 'N');
        return { Type: "BondageMachine", OL: true, Binding: tileGenerator.Binding };
    },
    "EffectTile": (x, y, tile, tileGenerator, data) => {
        let tt = {
            name: tileGenerator.Tile,
            duration: 9999,
            infinite: true,
        };
        KDCreateEffectTile(x, y, tt, 0);
        return null;
    },
    "AutoDoor": (x, y, tile, tileGenerator, data) => {
        return { wireType: tileGenerator.wireType };
    },
};
function KDCreateTile(x, y, tileGenerator, data) {
    let tile = {};
    if (tileGenerator.Type) {
        tile = KDTileGen[tileGenerator.Type](x, y, tile, tileGenerator, data);
    }
    else {
        tile = Object.assign({}, tileGenerator);
        tile.x = x;
        tile.y = y;
    }
    if (tile)
        return tile;
}
function KDCreateEffectTileTile(x, y, tileGenerator, data) {
    let tile = {};
    if (tileGenerator.name && KDEffectTileGen[tileGenerator.name]) {
        tile = KDEffectTileGen[tileGenerator.name](x, y, tile, tileGenerator, data);
    }
    else {
        tile = KDCreateEffectTile(x, y, {
            name: tileGenerator.name,
            duration: tileGenerator.duration,
        }, 0);
    }
    if (tile)
        return tile;
}
function KDAggregateTileTags(x, y, w, h, tilesFilled, globalTags) {
    let tags = Object.assign({}, globalTags);
    for (let indX = x - 1; indX <= x + w; indX++)
        for (let indY = y - 1; indY <= y + h; indY++) {
            let index = indX < x ? "L_" : (indX >= x + w ? "R_" : "");
            index = (indY < y ? "U" : (indY >= y + h ? "D" : "")) + index;
            if (index) {
                let neighbor = tilesFilled[indX + ',' + indY];
                if (neighbor?.tags) {
                    for (let t of neighbor.tags) {
                        tags[index + t] = true;
                        tags[t] = true;
                    }
                }
            }
        }
    return tags;
}
function KDGetCategoryIndex(x, y) {
    if (KDMapData.CategoryIndex) {
        return KDMapData.CategoryIndex[Math.ceil(x / KDTE_Scale) + ',' + Math.ceil(y / KDTE_Scale)];
    }
    return { category: "", tags: [] };
}
let KDPervertibleFurnitureWeights = {
    LatexDisplayStand: 0.1,
    DisplayStand: 0.3,
    OneBarTrap: 0.1,
    OneBarVibeTrap: 0.05,
    DollStandReal: 0.04,
    DollStandSpreaderReal: 0.02,
};
function KDGetPervertibleFurniture(base = "Cage", pervertChance = 0.1) {
    if (KDRandom() < pervertChance) {
        return KDGetByWeight(KDPervertibleFurnitureWeights);
    }
    return base;
}
function KDGetMapTileWithTags(tag) {
    let list = [];
    for (let mapTile of Object.values(KDMapTilesList)) {
        if (mapTile.tags?.includes(tag)) {
            list.push(mapTile);
        }
    }
    return list;
}
function KDDoJailPointForTile(x, y) {
    if (KDMapData.Labels["Storage"]) {
        for (let label of KDMapData.Labels["Storage"]) {
            if (label.x == x && label.y == y && label.type == "Storage") {
                KDMapData.JailPoints.push({ x: x, y: y, type: "storage", radius: 1 });
                return true;
            }
        }
    }
    if (KDMapData.Labels["Display"]) {
        for (let label of KDMapData.Labels["Display"]) {
            if (label.x == x && label.y == y && label.type == "Display") {
                KDMapData.JailPoints.push({ x: x, y: y, type: "display", radius: 1 });
                return true;
            }
        }
    }
}
//# sourceMappingURL=KinkyDungeonEditorGen.js.map