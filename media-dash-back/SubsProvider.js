const OS = require("opensubtitles-api");
const osSubsCacheFile = "os-subs.json";

const getSubs = async (self, args) => {
    if (!self.os) {
        console.log("Cannot connect to opensubtitles, credentials are not valid");
        return;
    }
    return self.ct.cache.readOrCreateValueInFile(
        osSubsCacheFile,
        Object.values(args).join("___"),
        async () => searchForSubs(self, Object.assign({}, args)));
};

const searchForSubs = async (self, params) => {
    try {
        const result = await self.os.search(params);
        const subs = uniqueSubs(Object.values(result)[0]);
        return subs.map(s => ({ id: s.id, url: s.url }));
    } catch (e) {
        console.log(`Error requesting subtitles: ${e}`);
        throw e;
    }
};

const uniqueSubs = (subs) => {
    const seenIds = new Set();
    return subs
        .filter(s => {
            if (seenIds.has(s.id)) return false;
            seenIds.add(s.id);
            return true;
        });
};

module.exports = class SubsProvider {

    constructor(ct) {
        ct.subsProvider = this;
        this.ct = ct;
    }

    async init() {
        const filename = "os-credentials";
        const credentialsAreValid = await this.updateCredentialsAndValidate();
        if (!credentialsAreValid) {
            await this.ct.data.persistFile(filename, { useragent: null, username: null, password: null });
            console.log("Opensubtitles credentials missing.");
            console.log(`Please fill out ${this.ct.data.getFilePath(filename)} and restart the server`);
        }
        const subs = this;
        this.os = new OS({
            useragent: subs.credentials.useragent,
            username: subs.credentials.username,
            password: subs.credentials.password,
            ssl: true
        });
    }

    async updateCredentialsAndValidate() {
        if (this.areCredentialsValid()) return true;
        this.credentials = await this.ct.data.readFile("os-credentials");
        return this.areCredentialsValid();
    }

    areCredentialsValid() {
        return this.credentials && this.credentials.useragent && this.credentials.username && this.credentials.password;
    }

    getMovieSubs(language, imdbId, filepath) {
        return getSubs(this, {
            imdbid: imdbId,
            sublanguageid: language,
            path: this.ct.mediaListing.getAbsoluteMediaPath(filepath),
            limit: 30
        });
    }

    getEpisodeSubs(language, imdbId, season, episode, filepath) {
        return getSubs(this, {
            imdbid: imdbId,
            season: season,
            episode: episode,
            sublanguageid: language,
            path: this.ct.mediaListing.getAbsoluteMediaPath(filepath),
            limit: 30
        });
    }

    async getSub(subId) {
        const osFile = await this.ct.cache.readFile(osSubsCacheFile);
        const cachedSearches = Object.values(osFile);
        for (let i = 0; i < cachedSearches.length; i++) {
            const result = cachedSearches[i].results.find(r => r.id === subId);
            if (result) {
                return { searchArgs: cachedSearches[i].searchArgs, result: result };
            }
        }
        return null;
    }
};