"use strict";
const StandalonePatched = true;
const ArcadeDeviousChallenge = false;
const ChatRoomCharacter = [];
const ChatRoomChatLog = [];
const DialogGamingPreviousRoom = "";
const MiniGameReturnFunction = "ArcadeKinkyDungeonEnd";
function ReputationGet(RepType) { return 0; }
function DialogSetReputation(a, b) { }
let ChatRoomCharacterUpdate = (C) => { };
function ChatRoomPublishCustomAction(msg, LeaveDialog, Dictionary) { }
const TypedItemDataLookup = {};
const ModularItemDataLookup = {};
function TypedItemSetOption(C, item, options, option, push = false) { }
function TypedItemSetOptionByName(a, b, c, d) { }
function ExtendedItemSetType(C, Options, Option) { }
function ExtendedItemExit() { }
let MiniGameVictory = true;
function InventoryRemove(C, AssetGroup, Refresh = false) { }
function InventoryGetLock(Lock) { }
function InventoryWear(C, AssetName, AssetGroup, ItemColor, Difficulty, MemberNumber, Craft, Refresh = true) { }
function InventoryLock(C, Item, Lock, MemberNumber, Update = true) { }
function InventoryUnlock(C, Item) { }
let KDPatched = true;
let ServerURL = "http://localhost:4288";
function ServerSend(Message, Data) { }
function ServerPlayerIsInChatRoom() { return false; }
function CharacterAppearanceLoadCharacter(C) { }
function CharacterChangeMoney(C, amount) { }
function DrawImage(Image, X, Y, Invert = false) { return true; }
let CharacterAppearanceBuildCanvas = (C) => { };
let CharacterRefresh = (C, push = false) => { };
//# sourceMappingURL=Patch.js.map