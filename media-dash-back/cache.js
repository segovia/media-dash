const os = require("os");
const fse = require("fs-extra");
const mediaDashDir = os.homedir() + "/.media-dash";

module.exports = class Cache {

    constructor(ct) {
        ct.cache = this;
    }

    async init() {
        await this.createCacheFolder();
    }

    async createCacheFolder() {
        try {
            await fse.mkdir(mediaDashDir);
            console.log("Cache INFO: Cache folder created: " + mediaDashDir);
        } catch (e) {
            if (e.code === "EEXIST") {
                console.log("Cache INFO: Cache folder already exists: " + mediaDashDir);
            } else {
                console.log(e);
            }
        }
    }

    async readCache(filename) {
        try {
            const result = await fse.readJson(`${mediaDashDir}/${filename}`, "utf8");
            return result;
        } catch (e) {
            return null;
        }
    }

    async readOrLoadCache(cacheKey, contentLoad) {
        let data = await this.readCache(cacheKey);
        if (data) return data;
        data = await contentLoad();
        await this.persistCache(cacheKey, data);
        return data;
    }

    async persistCache(filename, obj) {
        await fse.writeJson(`${mediaDashDir}/${filename}`, obj, { encoding: "utf-8" });
        console.log(`Cache INFO: Cache file '${filename}' written`);
    }
};