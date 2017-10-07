const fse = require("fs-extra");

module.exports = class Persistence {

    constructor(ct, name) {
        ct[name] = this;
        this.dir = `${ct.props.mediaDir}/.media-dash/${name}`;
        this.files = {};
    }

    async init() {
        await this.createDir();
    }

    async createDir() {
        try {
            await fse.mkdir(this.dir);
            console.log(`Persistence INFO: Persistence directory created: ${this.dir}`);
        } catch (e) {
            if (e.code !== "EEXIST") throw e;
        }
    }

    getDir() {
        return this.dir;
    }

    getFilePath(filename) {
        return `${this.dir}/${filename}`;
    }

    async readFile(filename) {
        let data = this.files[filename];
        if (data) return data;
        try {
            const result = await fse.readJson(this.getFilePath(filename), "utf8");
            return result;
        } catch (e) {
            return null;
        }
    }

    async readOrCreateFile(filename, initialLoad) {
        let data = await this.readFile(filename);
        if (data) return data;
        data = await initialLoad();
        await this.persistFile(filename, data);
        return data;
    }

    async persistFile(filename, obj) {
        this.files[filename] = obj;
        const filePath = this.getFilePath(filename);
        await fse.writeJson(filePath, obj, { encoding: "utf-8" });
        console.log(`Persistence INFO: File '${filePath}' written`);
    }

    async readValueFromFile(filename, key) {
        const cache = await this.readFile(filename);
        if (cache) return cache[key];
        return null;
    }

    async readOrCreateValueInFile(filename, key, initialValue) {
        const cache = await this.readOrCreateFile(filename, () => ({}));
        const cached = cache[key];
        if (cached) return cached;
        const newValue = await initialValue();
        cache[key] = newValue;
        this.persistFile(filename, cache);
        return newValue;
    }

    async setValueInFile(filename, key, value) {
        const cache = await this.readOrCreateFile(filename, () => ({}));
        cache[key] = value;
        this.persistFile(filename, cache);
    }
};