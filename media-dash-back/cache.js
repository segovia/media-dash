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

    async loadCache(filename) {
        try {
            const result = await fse.readJson(`${mediaDashDir}/${filename}`, "utf8");
            console.log(`Cache INFO: Read cache for ${filename}`);
            return result;
        } catch (e) {
            return null;
        }
    }

    async persistCache(filename, obj) {
        await fse.writeJson(`${mediaDashDir}/${filename}`, obj, { encoding: "utf-8" });
        console.log("Cache INFO: Cache file written");
    }
};