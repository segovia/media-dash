const fse = require("fs-extra");

module.exports = class Cache {

    constructor(ct) {
        ct.cache = this;
        this.ct = ct;
        this.caches = {};
    }

    async init() {
        this.cacheDir = this.ct.props.mediaDir + "/.media-dash";
        await this.createCacheFolder();
    }

    async createCacheFolder() {
        try {
            await fse.mkdir(this.cacheDir);
            console.log("Cache INFO: Cache folder created: " + this.cacheDir);
        } catch (e) {
            if (e.code === "EEXIST") {
                console.log("Cache INFO: Cache folder already exists: " + this.cacheDir);
            } else {
                console.log(e);
            }
        }
    }

    getCacheFolderPath(filename) {
        return `${this.cacheDir}/${filename}`;
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
        let data = this.caches[cacheKey];
        if (data) return data;
        data = await this.readCache(cacheKey);
        if (data) return data;
        data = await contentLoad();
        await this.persistCache(cacheKey, data);
        return data;
    }

    async persistCache(filename, obj) {
        await fse.writeJson(this.getCacheFolderPath(filename), obj, { encoding: "utf-8" });
        console.log(`Cache INFO: Cache file '${filename}' written`);
    }

    async readOrLoadCacheValue (filename, key, loadNewValue) {
        const cache = await this.readOrLoadCache(filename, () => ({}));
        const cached = cache[key];
        if (cached) return cached;
        const newValue = await loadNewValue();
        cache[key] = newValue;
        this.persistCache(filename, cache);
        return newValue;
    }
};