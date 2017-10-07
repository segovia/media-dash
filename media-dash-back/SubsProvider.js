const OS = require("opensubtitles-api");
const osSubsCacheFile = "os-subs.json";

const getSubs = async (self, args) => {
    if (!self.os) {
        console.log("Cannot connect to opensubtitles, credentials are not valid");
        return;
    }
    return (await self.ct.cache.readOrCreateValueInFile(
        osSubsCacheFile,
        Object.values(args).join("___"),
        async () => ({
            searchArgs: args,
            results: Object.values(await searchForSubs(self, Object.assign({}, args)))[0]
        }))).results;
};

const searchForSubs = (self, params) => {
    try {
        return self.os.search(params);
    } catch (e) {
        console.log(`Error requesting subtitles: ${e}`);
    }
    return Promise.resolve({});
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

    getMovieSubs(imdbId, language) {
        return getSubs(this, {
            imdbid: imdbId,
            sublanguageid: language,
            // path: "/home/gustavo/workspace/torrent-dash/back/test/Media/TV Shows/Game of Thrones/Season 06/Game of Thrones - S06E10 - The Winds of Winter.mp4",
            limit: 10
        });
    }

    getTVShowEpisodeSubs(imdbId, season, episode, language) {
        return getSubs(this, {
            imdbid: imdbId,
            season: season,
            episode: episode,
            sublanguageid: language,
            // path: "/home/gustavo/workspace/torrent-dash/back/test/Media/TV Shows/Game of Thrones/Season 06/Game of Thrones - S06E10 - The Winds of Winter.mp4",
            limit: 10
        });
    }

    async getSub(subId) {
        const osFile = await this.ct.cache.readFile(osSubsCacheFile);
        const cachedSearches = Object.values(osFile);
        for (let i = 0; i < cachedSearches.length; i++) {
            const result = cachedSearches[i].results.find(r => r.id === subId);
            if (result) {
                return {searchArgs: cachedSearches[i].searchArgs, result: result};
            }
        }
        return null;
    }
};