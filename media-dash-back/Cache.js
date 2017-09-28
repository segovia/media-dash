const os = require("os");
const fse = require("fs-extra");
const cacheDir = os.homedir() + "/.media-dash";

module.exports = class Cache {

    constructor(ct) {
        ct.cache = this;
    }

    async init() {
        await this.createCacheFolder();
    }

    async createCacheFolder() {
        try {
            await fse.mkdir(cacheDir);
            console.log("Cache INFO: Cache folder created: " + cacheDir);
        } catch (e) {
            if (e.code === "EEXIST") {
                console.log("Cache INFO: Cache folder already exists: " + cacheDir);
            } else {
                console.log(e);
            }
        }
    }

    getCacheFolderPath(filename) {
        return `${cacheDir}/${filename}`;
    }


    async readCache(filename) {
        try {
            const result = await fse.readJson(this.getCacheFolderPath(filename), "utf8");
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
        await fse.writeJson(this.getCacheFolderPath(filename), obj, { encoding: "utf-8" });
        console.log(`Cache INFO: Cache file '${filename}' written`);
    }
};