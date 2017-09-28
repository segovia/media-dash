const OS = require("opensubtitles-api");

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
    }

    async updateCredentialsAndValidate() {
        if (this.areCredentialsValid()) return true;
        this.credentials = await this.ct.cache.readCache("os-credentials");
        return this.areCredentialsValid();
    }

    areCredentialsValid() {
        return this.credentials && this.credentials.useragent && this.credentials.username && this.credentials.password;
    }

    doSomething() {
        if (!this.areCredentialsValid()) {
            console.log("Cannot connect to opensubtitles, credentials are not valid");
            return;
        }
        const subs = this;
        const os = new OS({
            useragent: subs.credentials.useragent,
            username: subs.credentials.username,
            password: subs.credentials.password,
            ssl: true
        });

        // const fileName = "Game of Thrones - S06E10 - The Winds of Winter"
        os.search({
            sublanguageid: "cze",       // Can be an array.join, "all", or be omitted. 
            // filename: fileName,        // The video file name. Better if extension 
            // path: "/home/gustavo/workspace/torrent-dash/back/test/Media/TV Shows/Game of Thrones/Season 06/Game of Thrones - S06E10 - The Winds of Winter.mp4",
            // path: "/home/gustavo/workspace/torrent-dash/back/test/Media/Movies/Transformers - The Last Knight (2017)/Transformers - The Last Knight (2017).mkv",
            // imdbid: "4283094",
            // imdbid: "1129442",
            // imdbid: "3371366",
            //imdbid: "6038968",
            // imdbid: "2707408",
            imdbid: "0944947",
            limit: 10,
            // season: 3,
            // episode: 6
            season: 6,
            episode: 10
        }).then(subtitles => {
            console.log(subtitles);
            console.log([...new Set(subtitles.cs.map((s) => s.url))]);
        }).catch(e => console.log(e));

        // const OpenSubtitles = new OS("Gustavo Segovia v1");

        // OpenSubtitles.api.LogIn("gustavo.segovia@gmail.com", "6e2ad5635510d51c5beeb11a6dd168d9", "en", "Gustavo Segovia v1")
        // .then();
    }

}