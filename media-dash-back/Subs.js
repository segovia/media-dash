const OS = require("opensubtitles-api");

const getSubs = async (self, searchArgs) => {
    if (!self.os) {
        console.log("Cannot connect to opensubtitles, credentials are not valid");
        return;
    }
    return await self.ct.cache.readOrLoadCacheValue(
        "os-subs.json",
        Object.values(searchArgs).join("___"),
        async () => Object.values(await searchForSubs(self, searchArgs))[0]);
};


const searchForSubs = (self, params) => {
    try {
        return self.os.search(params);
    } catch (e) {
        console.log(`Error requesting subtitles: ${e}`);
    }
    return Promise.resolve({});
};

module.exports = class Subs {

    constructor(ct) {
        ct.subs = this;
        this.ct = ct;
    }

    async init() {
        const filename = "os-credentials";
        const credentialsAreValid = await this.updateCredentialsAndValidate();
        if (!credentialsAreValid) {
            await this.ct.cache.persistCache(filename, { useragent: null, username: null, password: null });
            console.log("Opensubtitles credentials missing.");
            console.log(`Please fill out ${this.ct.cache.getCacheFolderPath(filename)} and restart the server`);
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
        this.credentials = await this.ct.cache.readCache("os-credentials");
        return this.areCredentialsValid();
    }

    areCredentialsValid() {
        return this.credentials && this.credentials.useragent && this.credentials.username && this.credentials.password;
    }

    getMovieSubsByImdb(imdbId, language) {
        return getSubs(this, {
            imdbid: imdbId,
            sublanguageid: language,
            // path: "/home/gustavo/workspace/torrent-dash/back/test/Media/TV Shows/Game of Thrones/Season 06/Game of Thrones - S06E10 - The Winds of Winter.mp4",
            limit: 10
        });
    }

    getTVShowEpisodeSubsByImdb(tvShowImdbId, season, episode, language) {
        return getSubs(this, {
            imdbid: tvShowImdbId,
            season: season,
            episode: episode,
            sublanguageid: language,
            // path: "/home/gustavo/workspace/torrent-dash/back/test/Media/TV Shows/Game of Thrones/Season 06/Game of Thrones - S06E10 - The Winds of Winter.mp4",
            limit: 10
        });
    }
};