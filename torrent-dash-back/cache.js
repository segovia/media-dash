const os = require("os");
const fse = require("fs-extra");
const torrentDashDir = os.homedir() + "/.torrent-dash";
const cacheFile = torrentDashDir + "/cache.json";

module.exports = class Cache {

    constructor() {
        this.map = {};
        this.cacheCallMap = {};
    }

    registerCall(key, call) {
        console.log("Cache INFO: Registered: " + key);
        this.cacheCallMap[key] = call;
    }

    call(call) {
        if (this.map.hasOwnProperty(call.name)) {
            return this.map[call.name];
        }
        return call();
    }

    async loadCacheFromFile() {
        try {
            this.map = await fse.readJson(cacheFile, "utf8");
            console.log("Cache INFO: Read cache");
        } catch (e) {
            this.refreshCache();
        }
    }

    async refreshCache() {
        console.log("Cache INFO: Refreshing cache");
        const newMap = {};

        await Promise.all(
            Object.keys(this.cacheCallMap).map(async key => {
                newMap[key] = await this.cacheCallMap[key].call();
            }));
        this.map = newMap;
        console.log("Cache INFO: Refresh done");
        await fse.writeJson(cacheFile, newMap, { encoding: "utf-8" });
        console.log("Cache INFO: Cache file written");
    }

    async init() {
        await this.createFolderIfNeeded();
        await this.loadCacheFromFile();
    }

    async createFolderIfNeeded() {
        try {
            await fse.mkdir(torrentDashDir);
            console.log("Cache INFO: Cache folder created: " + torrentDashDir);
        }
        catch (e) {
            if (e.code === "EEXIST") {
                console.log("Cache INFO: Cache folder already exists: " + torrentDashDir);
            }
            else {
                console.log(e);
            }
        }
    }
};