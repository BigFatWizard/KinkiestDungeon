"use strict";
function KDUpdateBuffsOnLoad() {
    if (VersionMajor <= 5 && VersionMinor <= 4 && VersionPatch <= 43) {
        for (let buff of Object.values(KinkyDungeonPlayerBuffs)) {
            let data = {};
            if (buff["x"]) {
                data = buff["x"];
                delete buff["x"];
            }
            if (buff["y"]) {
                data = buff["y"];
                delete buff["y"];
            }
            if (buff["vx"]) {
                data = buff["vx"];
                delete buff["vx"];
            }
            if (buff["vy"]) {
                data = buff["vy"];
                delete buff["vy"];
            }
            if (buff["delay"]) {
                data = buff["delay"];
                delete buff["delay"];
            }
            if (Object.keys(data)) {
                buff.data = {
                    ...buff.data,
                    ...data,
                };
            }
            if (buff["aurasprite"]) {
                buff.auraSprite = buff["aurasprite"];
                delete buff["aurasprite"];
            }
            if (buff["disabletypes"]) {
                buff.auraSprite = buff["disabletypes"];
                delete buff["disableTypes"];
            }
        }
    }
}
function KinkyDungeonSendBuffEvent(event, data) {
    if (!KDMapHasEvent(KDEventMapBuff, event))
        return;
    for (let buff of Object.values(KinkyDungeonPlayerBuffs)) {
        if (buff && buff.events) {
            for (let e of buff.events) {
                if (e.trigger == event) {
                    KinkyDungeonHandleBuffEvent(event, e, buff, KinkyDungeonPlayerEntity, data);
                }
            }
        }
    }
    for (let ent of KDMapData.Entities) {
        if (ent.buffs) {
            for (let buff of Object.values(ent.buffs)) {
                if (buff && buff.events) {
                    for (let e of buff.events) {
                        if (e.trigger == event) {
                            KinkyDungeonHandleBuffEvent(event, e, buff, ent, data);
                        }
                    }
                }
            }
        }
    }
}
function KinkyDungeonTickBuffs(entity, delta, endFloor) {
    let list = null;
    if (entity == KinkyDungeonPlayerEntity)
        list = KinkyDungeonPlayerBuffs;
    else if (entity.buffs)
        list = entity.buffs;
    for (const [key, value] of Object.entries(list)) {
        const buff = value;
        if (buff) {
            let end = false;
            if (buff.endFloor && endFloor) {
                end = true;
            }
            else if (buff.endSleep && KDGameData.SleepTurns > 1) {
                end = true;
            }
            else if (!buff.duration || buff.duration < 0 || (buff.resetDurationTime && buff.duration <= 1)) {
                if (buff.resetDurationTime) {
                    let amt = buff.resetDurationPower || 1;
                    let newPower = buff.power - amt;
                    if ((amt > 0 && newPower <= 0) || (amt < 0 && newPower >= 0)) {
                        end = true;
                    }
                    else {
                        buff.duration = buff.resetDurationTime;
                        buff.power = newPower;
                    }
                }
                else
                    end = true;
            }
            if (!end) {
                if (buff.type == "restore_mp")
                    KDChangeMana(buff.id, "buff", "tick", buff.power);
                else if (buff.type == "restore_wp")
                    KDChangeWill(buff.id, "buff", "tick", buff.power);
                else if (buff.type == "restore_sp")
                    KDChangeStamina(buff.id, "buff", "tick", buff.power);
                else if (buff.type == "restore_ap")
                    KDChangeDistraction(buff.id, "buff", "tick", buff.power, true);
                else if (buff.type == "restore_dp")
                    KDChangeDesire(buff.id, "buff", "tick", buff.power, true);
                else if (buff.type == "SpellCastConstant" && buff.spell && entity) {
                    KinkyDungeonCastSpell(entity.x, entity.y, KinkyDungeonFindSpell(buff.spell, true), undefined, undefined, undefined);
                }
                else if (buff.type == "Flag") {
                    KinkyDungeonSetFlag(buff.id, 1 + delta);
                }
                else if (KDCustomBuff[buff.type]) {
                    KDCustomBuff[buff.type](entity, buff);
                }
                if (buff.flag) {
                    KinkyDungeonSetFlag(buff.flag, 1 + delta);
                }
                if (!(buff.infinite))
                    buff.duration -= delta;
            }
            else {
                KinkyDungeonExpireBuff(entity, key);
            }
        }
    }
}
function KinkyDungeonTickBuffTag(entity, tag, amout = 1) {
    let list = null;
    if (entity == KinkyDungeonPlayerEntity)
        list = KinkyDungeonPlayerBuffs;
    else if (entity.buffs)
        list = entity.buffs;
    if (list)
        for (const [key, value] of Object.entries(list)) {
            const buff = value;
            if (buff) {
                if (buff.maxCount && buff.tags?.includes(tag)) {
                    if (!buff.currentCount)
                        buff.currentCount = 0;
                    buff.currentCount += amout;
                    if (buff.currentCount >= buff.maxCount)
                        KinkyDungeonExpireBuff(entity, key);
                    KDUpdateBuffStatMemo(list, buff.type);
                }
            }
        }
}
function KDEntityHasBuffTags(entity, tag) {
    let list = entity.player ? KinkyDungeonPlayerBuffs : entity.buffs;
    if (list) {
        for (const buff of Object.values(list)) {
            if (buff) {
                if (buff.tags && buff.tags.includes(tag))
                    return true;
            }
        }
    }
    return false;
}
function KDGetBuffsWithTag(entity, tag) {
    let ret = {};
    let list = entity.player ? KinkyDungeonPlayerBuffs : entity.buffs;
    if (list) {
        for (const [key, buff] of Object.entries(list)) {
            if (buff) {
                if (buff.tags && buff.tags.includes(tag))
                    ret[key] = buff;
            }
        }
    }
    return ret;
}
function KinkyDungeonRemoveBuffsWithTag(entity, tags) {
    let list = null;
    if (entity && entity.player) {
        list = KinkyDungeonPlayerBuffs;
    }
    else if (entity?.buffs)
        list = entity.buffs;
    if (list)
        for (const [key, value] of Object.entries(list)) {
            const buff = value;
            if (buff) {
                for (let t of tags)
                    if (buff.tags && buff.tags.includes(t)) {
                        KinkyDungeonExpireBuff(entity, key);
                    }
            }
        }
}
function KinkyDungeonUpdateBuffs(delta, endFloor) {
    if (delta > 0) {
        KDBuffedStatTypeMemo = new Map();
        KDBuffedStatTypeMemoUpdate = new Map();
    }
    KinkyDungeonSendEvent("tickBuffs", { delta: delta });
    KinkyDungeonTickBuffs(KinkyDungeonPlayerEntity, delta, endFloor);
    for (let enemy of KDMapData.Entities) {
        if (!enemy.buffs)
            enemy.buffs = {};
        KinkyDungeonTickBuffs(enemy, delta, endFloor);
    }
    for (let b of KDMapData.Bullets) {
        if (b.bullet.spell && b.bullet.spell.buffs) {
            for (let buff of b.bullet.spell.buffs) {
                if (buff.player && buff.range >= Math.sqrt((KinkyDungeonPlayerEntity.x - b.x) * (KinkyDungeonPlayerEntity.x - b.x) + (KinkyDungeonPlayerEntity.y - b.y) * (KinkyDungeonPlayerEntity.y - b.y))) {
                    KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, buff);
                }
                if (buff.enemies) {
                    let nearby = KDNearbyEnemies(b.x, b.y, buff.range);
                    for (let enemy of nearby) {
                        if ((KDHostile(enemy) || !buff.noAlly)
                            && (KDAllied(enemy) || !buff.onlyAlly)
                            && (!b.bullet.spell.filterTags || b.bullet.spell.filterTags.some((tag) => { return enemy.Enemy.tags[tag]; }))) {
                            KinkyDungeonApplyBuffToEntity(enemy, buff);
                        }
                    }
                }
            }
        }
    }
    KDUpdatePlayerShield();
}
function KDUpdatePlayerShield(PlayerBuffs) {
    if (!PlayerBuffs)
        PlayerBuffs = KinkyDungeonPlayerBuffs;
    let buffs = Object.values(PlayerBuffs);
    KDGameData.Shield = 0;
    for (const bb of buffs) {
        const b = bb;
        if (b.type == "Shield" && b.power > 0)
            KDGameData.Shield += b.power;
    }
}
function KDDamagePlayerShield(Amount, Player) {
    if (!Player)
        Player = KinkyDungeonPlayerEntity;
    let PlayerBuffs = KinkyDungeonPlayerBuffs;
    let buffs = Object.values(PlayerBuffs).filter((b) => { return b.type == "Shield"; }).sort((a, b) => { return (a.power || 0) - (b.power || 0); });
    KDGameData.ShieldDamage = (KDGameData.ShieldDamage || 0) + Amount;
    for (let b of buffs) {
        if (b.type == "Shield" && b.power > 0) {
            b.power -= Amount;
            if (b.power < 0) {
                Amount = -b.power;
                b.power = 0;
            }
        }
    }
    KDUpdatePlayerShield(PlayerBuffs);
}
function KDBuffEnabled(list, buff, onlyPositiveDuration) {
    return (!onlyPositiveDuration || buff.duration > 0)
        && (!buff.disableTypes || !buff.disableTypes.some((tag) => {
            return list[tag] != undefined;
        }));
}
let KDBuffedStatTypeMemo = new Map();
let KDBuffedStatTypeMemoUpdate = new Map();
function KDUpdateBuffedStatTypeMemo(list) {
    let obj = KDBuffedStatTypeMemo.get(list) || {};
    let updateList = KDBuffedStatTypeMemoUpdate.get(list);
    if (!KDBuffedStatTypeMemo.get(list) || !updateList) {
        obj = {};
        KDBuffedStatTypeMemo.set(list, obj);
        for (let buff of Object.values(list)) {
            if (buff) {
                if (!obj[buff.type])
                    obj[buff.type] = [];
                obj[buff.type].push(buff);
            }
        }
    }
    else {
        for (let stat of updateList) {
            obj[stat] = [];
            for (let buff of Object.values(list)) {
                if (buff && buff.type == stat) {
                    obj[stat].push(buff);
                }
            }
        }
    }
    KDBuffedStatTypeMemoUpdate.delete(list);
}
function KinkyDungeonGetBuffedStat(list, Stat, onlyPositiveDuration) {
    let stat = 0;
    if (list) {
        if (KDBuffedStatTypeMemoUpdate.get(list)?.length > 0
            || !KDBuffedStatTypeMemo.get(list)) {
            KDUpdateBuffedStatTypeMemo(list);
        }
        if (KDBuffedStatTypeMemo.get(list)) {
            if (KDBuffedStatTypeMemo.get(list) && KDBuffedStatTypeMemo.get(list)[Stat])
                for (let buff of KDBuffedStatTypeMemo.get(list)[Stat]) {
                    if (buff && buff.type == Stat
                        && KDBuffEnabled(list, buff, onlyPositiveDuration)) {
                        stat += buff.power;
                    }
                }
        }
        else {
            for (let buff of Object.values(list)) {
                if (buff && buff.type == Stat
                    && KDBuffEnabled(list, buff, onlyPositiveDuration)) {
                    stat += buff.power;
                }
            }
        }
    }
    return stat;
}
function KinkyDungeonGetMaxBuffedStat(list, Stat, onlyPositiveDuration) {
    let stat = 0;
    if (list)
        for (let buff of Object.values(list)) {
            if (buff && buff.type == Stat && KDBuffEnabled(list, buff, onlyPositiveDuration)) {
                stat = Math.max(stat, buff.power);
            }
        }
    return stat;
}
function KinkyDungeonExpireBuff(entity, key) {
    let list = null;
    if (entity == KinkyDungeonPlayerEntity)
        list = KinkyDungeonPlayerBuffs;
    else if (entity.buffs)
        list = entity.buffs;
    if (list && list[key]) {
        let data = {
            entity: entity,
            buff: list[key],
        };
        let tt = list[key].type;
        KinkyDungeonSendEvent("expireBuff", data);
        KDUpdateBuffStatMemo(list, tt);
        delete list[key];
    }
}
function KDUpdateBuffStatMemo(list, stat) {
    if (!KDBuffedStatTypeMemoUpdate.get(list)) {
        KDBuffedStatTypeMemoUpdate.set(list, []);
    }
    if (!KDBuffedStatTypeMemoUpdate.get(list).includes(stat)) {
        KDBuffedStatTypeMemoUpdate.get(list).push(stat);
    }
}
function KinkyDungeonApplyBuffToEntity(entity, origbuff, changes) {
    if (entity && entity.player) {
        return KDApplyBuff(KinkyDungeonPlayerBuffs, origbuff, changes, entity);
    }
    else if (entity) {
        if (!entity.buffs)
            entity.buffs = {};
        return KDApplyBuff(entity.buffs, origbuff, changes, entity);
    }
    return null;
}
function KDApplyBuff(list, origbuff, changes, entity) {
    if (!origbuff)
        return null;
    let buff = {
        ...origbuff,
        events: [...origbuff.events || []],
        tags: [...origbuff.tags || []],
        buffTextReplace: { ...origbuff.buffTextReplace || {} },
        disableTypes: [...origbuff.disableTypes || []],
    };
    if (changes)
        Object.assign(buff, changes);
    let id = buff.id ? buff.id : buff["name"];
    if (list[id] && buff.cancelOnReapply) {
        KinkyDungeonExpireBuff(entity, id);
        return null;
    }
    else {
        if (!list[id] && buff.sfxApply)
            KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + buff.sfxApply + ".ogg");
        if (!list[id]
            || (list[id].power >= 0 && buff.power >= list[id].power)
            || (list[id].power < 0
                && ((buff.power > 0 && buff.power >= list[id].power)
                    || buff.power <= list[id].power)))
            list[id] = buff;
        if ((list[id].power && buff.power == list[id].power && buff.duration >= list[id].duration))
            list[id].duration = buff.duration;
        KDUpdateBuffStatMemo(list, buff.type);
        if (buff.tags)
            for (let tag of buff.tags) {
                if (tag == "darkness" && list == KinkyDungeonPlayerBuffs) {
                    KinkyDungeonBlindLevelBase = Math.max(KinkyDungeonBlindLevelBase, 1);
                }
                else if (tag == "heavydarkness" && list == KinkyDungeonPlayerBuffs) {
                    KinkyDungeonBlindLevelBase = Math.max(KinkyDungeonBlindLevelBase, 2);
                }
            }
        return buff;
    }
}
function KinkyDungeonGetbuff(list, buffId) {
    if (list && list[buffId])
        return list[buffId];
    else
        return null;
}
function KinkyDungeonHasBuff(list, buffId, excludeNoDuration) {
    if (list && list[buffId] && (!excludeNoDuration || list[buffId].duration > 0))
        return true;
    else
        return false;
}
function KDEntityHasBuff(entity, buffId, excludeNoDuration = false) {
    if (entity.player) {
        return KinkyDungeonHasBuff(KinkyDungeonPlayerBuffs, buffId, excludeNoDuration);
    }
    else
        return KinkyDungeonHasBuff(entity.buffs, buffId, excludeNoDuration);
}
function KDEntityBuffedStat(entity, stat, onlyPositiveDuration) {
    if (!entity)
        return 0;
    if (entity.player) {
        return KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, stat, onlyPositiveDuration);
    }
    else
        return KinkyDungeonGetBuffedStat(entity.buffs, stat, onlyPositiveDuration);
}
function KDEntityMaxBuffedStat(entity, stat, onlyPositiveDuration) {
    if (entity.player) {
        return KinkyDungeonGetMaxBuffedStat(KinkyDungeonPlayerBuffs, stat, onlyPositiveDuration);
    }
    else
        return KinkyDungeonGetMaxBuffedStat(entity.buffs, stat, onlyPositiveDuration);
}
function KDEntityGetBuff(entity, buffId) {
    if (entity.player) {
        return KinkyDungeonGetbuff(KinkyDungeonPlayerBuffs, buffId);
    }
    else
        return KinkyDungeonGetbuff(entity.buffs, buffId);
}
//# sourceMappingURL=KinkyDungeonBuffs.js.map