"use strict";
function KinkyDungeonAggressive(enemy, player) {
    if (!player || player.player) {
        if (enemy && enemy.hostile > 0)
            return true;
        if (!KDGameData.PrisonerState || KDGameData.PrisonerState == "chase")
            return KDHostile(enemy);
        if (enemy && KDFactionRelation(KDGetFaction(enemy), "Jail") < -0.4)
            return KDHostile(enemy);
        if (enemy && KDFactionRelation(KDGetFaction(enemy), "Jail") < -0.1
            && KDGameData.PrisonerState != 'jail'
            && (KDGameData.PrisonerState != 'parole' || !KinkyDungeonPlayerInCell(true, true)))
            return KDHostile(enemy);
        return false;
    }
    return KDHostile(enemy, player) && (!!enemy.hostile || !!player.hostile || (KDGetFaction(enemy) != "Player"
        && KDGetFaction(player) != "Player") || ((KinkyDungeonAggressive(player) && !player.playWithPlayer)));
}
function KDAllied(enemy) {
    return !(enemy.rage > 0) && !(enemy.hostile > 0) && KDFactionAllied("Player", enemy, undefined, KDOpinionRepMod(enemy, KDPlayer()));
}
function KDHostile(enemy, enemy2) {
    if (enemy == enemy2)
        return false;
    return (enemy.rage > 0) ||
        (!(!enemy2 && enemy.ceasefire > 0)
            && !(enemy2 && enemy2.ceasefire > 0)
            && (((!enemy2
                && (enemy.hostile > 0
                    || KDFactionHostile("Player", enemy, KDOpinionRepMod(enemy, enemy2 || KDPlayer()))))
                || (enemy2 && ((KDGetFaction(enemy2) == "Player" && enemy.hostile > 0)))
                || (enemy2 && KDFactionHostile(KDGetFaction(enemy), enemy2, KDOpinionRepMod(enemy, enemy2))))));
}
function KDOpinionRepMod(enemy, player) {
    if (!player?.player)
        return 0;
    let op = KDGetModifiedOpinionID(enemy.id, true, true, true, 0);
    if (op) {
        return 0.1 * Math.max(-3, Math.min(20, op / KDOpinionThreshold));
    }
    return 0;
}
function KDIsServant(value) {
    return value && value.status == "Servant";
}
function KDGetFaction(enemy) {
    if (!enemy)
        return undefined;
    if (typeof enemy === "string")
        return enemy;
    if (enemy.player)
        return "Player";
    if (enemy.rage > 0)
        return "Rage";
    if (enemy.faction)
        return enemy.faction;
    if (KDGameData.Collection && KDIsServant(KDGameData.Collection[enemy.id + ""]))
        return "Player";
    let E = enemy.Enemy;
    if ((E && E.allied)
        || enemy.allied
        || KDIsInParty(enemy))
        return "Player";
    if (E && E.faction)
        return E.faction;
    return "Enemy";
}
function KDGetFactionOriginal(enemy) {
    if (enemy.player)
        return "Player";
    if (enemy.faction)
        return enemy.faction;
    if (KDGameData.Collection && KDIsServant(KDGameData.Collection[enemy.id + ""]))
        return "Player";
    let E = enemy.Enemy;
    if (E && E.faction)
        return E.faction;
    return "Enemy";
}
function KDFactionHostile(a, b, mod = 0, modfree = 0) {
    if (a == "Player" && b && !(typeof b === "string") && b.hostile > 0)
        return true;
    if (!(typeof b === "string") && b.rage > 0)
        return true;
    if (a == "Player" && !(typeof b === "string") && b.allied > 0)
        return false;
    if (!(typeof b === "string"))
        b = KDGetFaction(b);
    if (a == "Rage" || b == "Rage")
        return true;
    if (a == "Player" && b == "Enemy")
        return true;
    if (b == "Player" && a == "Enemy")
        return true;
    if (KDFactionRelation(a, b) + Math.max(0, mod) + modfree <= -0.5)
        return true;
    if (a == b)
        return false;
    return false;
}
function KDFactionAllied(a, b, threshold = 0.7, _mod = 0) {
    if (a == "Player" && b && !(typeof b === "string") && b.hostile > 0)
        return false;
    if (!(typeof b === "string") && b.rage > 0)
        return false;
    if (a == "Player" && !(typeof b === "string") && b.allied > 0)
        return true;
    if (!(typeof b === "string"))
        b = KDGetFaction(b);
    if (a == "Rage" || b == "Rage")
        return false;
    if (a == "Player" && b == "Player")
        return true;
    if (b == "Enemy" && a == "Enemy")
        return true;
    if (KDFactionRelation(a, !(typeof b === "string") ? KDGetFaction(b) : b) >= threshold)
        return true;
    if (a == b)
        return true;
    return false;
}
function KDFactionFavorable(a, b) {
    return KDFactionAllied(a, b, 0.099)
        && !(a == "Player" && typeof b !== "string" && KDHostile(b))
        && !(a == "Player" && KDGameData.HostileFactions.includes(KDGetFaction(b)))
        && !(b == "Player" && KDGameData.HostileFactions.includes(a));
}
function KDGetFactionProps(list, Floor, Checkpoint, tags, bonustags, X = 0, Y = 0) {
    let mp = {};
    for (let faction of list) {
        if (KDFactionProperties[faction]) {
            mp[faction] = KDFactionProperties[faction].weight(Floor, Checkpoint, tags, bonustags, X, Y);
        }
    }
    return mp;
}
function KDGetHonor(a, b) {
    if (KDFactionProperties[a]) {
        if (KDFactionProperties[a].honor_specific[b]) {
            return KDFactionProperties[a].honor_specific[b];
        }
        return KDFactionProperties[a].honor;
    }
    return -1;
}
//# sourceMappingURL=KinkyDungeonFactions.js.map