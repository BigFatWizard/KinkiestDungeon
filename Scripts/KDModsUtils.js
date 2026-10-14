"use strict";
let onlineModsLoaded = false;
let onlineModsDeleted = false;
const kdModList = "KinkyDungeonModList";
const getOnlineModNameList = () => {
    let modList = JSON.parse(localStorage.getItem(kdModList) || "[]");
    if (!Array.isArray(modList))
        modList = [];
    return modList;
};
const batchSaveMods = async (files) => {
    const modList = getOnlineModNameList();
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let fileName = file.name;
        if (typeof fileName === "string" && fileName.endsWith(".zip")) {
            fileName = fileName.replace(".zip", "");
        }
        const res = await KinkyDungeonModSave(file, fileName);
        if (res.success) {
            if (!modList.includes(fileName))
                modList.push(fileName);
        }
    }
    localStorage.setItem(kdModList, JSON.stringify(modList));
};
const autoLoadMods = async () => {
    const modList = getOnlineModNameList();
    const loadModList = [];
    for (const modName of modList) {
        const res = await KinkyDungeonModLoad(modName);
        if (res) {
            loadModList.push(res);
        }
    }
    if (loadModList.length)
        onlineModsLoaded = true;
    return loadModList;
};
const kdModStore = "KinkyDungeonModSave";
function KinkyDungeonModDbOpen() {
    let db;
    return new Promise((resolve) => {
        const request = indexedDB.open(kdModStore);
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(kdModStore)) {
                db.createObjectStore(kdModStore, { autoIncrement: true });
            }
        };
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        request.onerror = (event) => {
            resolve(db);
        };
    });
}
function KinkyDungeonModSave(file, fileName) {
    return new Promise((resolve) => {
        KinkyDungeonModDbOpen().then((db) => {
            const transaction = db.transaction(kdModStore, "readwrite");
            const store = transaction.objectStore(kdModStore);
            const data = { modFile: file };
            const request = store.put(data, fileName);
            request.onsuccess = () => {
                const msg = `mod: ${fileName} save success`;
                resolve({
                    success: true,
                    msg,
                    err: "",
                });
            };
            request.onerror = () => {
                const err = `Could not add ${fileName} to the mod store`;
                resolve({
                    success: true,
                    msg: "",
                    err,
                });
            };
            transaction.oncomplete = () => {
                db.close();
            };
        });
    });
}
function KinkyDungeonModLoad(modName) {
    return new Promise((resolve) => {
        if (!modName) {
            console.error("mod name is empty");
            return;
        }
        KinkyDungeonModDbOpen().then((db) => {
            const transaction = db.transaction(kdModStore, "readonly");
            const store = transaction.objectStore(kdModStore);
            const request = store.get(modName);
            request.onsuccess = () => {
                if (request.result) {
                    console.log(`Successfully loaded mod: ${modName}`);
                    let out = Object.assign({}, request.result).modFile;
                    resolve(out);
                }
                else {
                    console.log(`Successfully loaded, but no such mod ${modName}`);
                    resolve(null);
                }
            };
            request.onerror = () => {
                console.error(`Could not fetch mod: ${modName}`);
                resolve(null);
            };
        });
    });
}
function KinkyDungeonModDelete(modName) {
    return new Promise((resolve) => {
        KinkyDungeonModDbOpen().then((db) => {
            const transaction = db.transaction(kdModStore, "readwrite");
            const store = transaction.objectStore(kdModStore);
            const request = store.delete(modName);
            request.onsuccess = () => {
                let modList = getOnlineModNameList();
                if (modList.includes(modName)) {
                    modList = modList.filter((x) => x != modName);
                }
                localStorage.setItem(kdModList, JSON.stringify(modList));
                console.log(`Successfully del mod: ${modName}`);
                resolve(true);
            };
            request.onerror = () => {
                console.error(`error del mod: ${modName}`);
                resolve(false);
            };
        });
    });
}
//# sourceMappingURL=KDModsUtils.js.map