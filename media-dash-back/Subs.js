const { promisify } = require("util");
const download = promisify(require("download-file"));
const fse = require("fs-extra");
const MEDIA_TYPE = require("./MediaType");

const subsStatusDataFile = "subs-status.json";

module.exports = class Subs {
    constructor(ct) {
        ct.subs = this;
        this.ct = ct;
    }

    async getStatus(imdbId) {
        return this.ct.data.readValueFromFile(subsStatusDataFile, imdbId);
    }

    async install(subId) {
        const sub = await this.ct.subsProvider.getSub(subId);
        const imdbId = sub.searchArgs.imdbid;
        const lang = sub.searchArgs.sublanguageid;

        const fileEntry = await this.ct.mediaListing.getEntry(imdbId);

        const tmpFilename = `${fileEntry.name}.${lang}.srt.tmp`;
        const mediaType = MEDIA_TYPE.MOVIE;
        await download(sub.result.url, { directory: `${this.ct.tmp.getDir()}`, filename: tmpFilename });
        await activate(this.ct.tmp.getFilePath(tmpFilename), this.ct.fileListing.getPath(mediaType, fileEntry.name), fileEntry.name, lang);
        await updateStatus(this, subId, imdbId, lang);
        await this.ct.mediaListing.refreshMedia(mediaType, fileEntry.name);

        return "ok";
    }
};

const activate = async (downloadedFile, targetFolder, mediaName, lang) => {
    await Promise.all([
        fse.unlink(`${targetFolder}/${mediaName}.srt`).catch(ignoreENOENT),
        fse.unlink(`${targetFolder}/${mediaName}.sub`).catch(ignoreENOENT),
        fse.unlink(`${targetFolder}/${mediaName}.${lang}.srt`).catch(ignoreENOENT),
        fse.unlink(`${targetFolder}/${mediaName}.${lang}.sub`).catch(ignoreENOENT)
    ]);

    await fse.rename(downloadedFile, `${targetFolder}/${mediaName}.${lang}.srt`);
};

const ignoreENOENT = error => {
    if (error.code !== "ENOENT") throw error;
};

const updateStatus = async (self, subId, imdbId, lang) => {
    let value = await self.ct.data.readValueFromFile(subsStatusDataFile, imdbId);
    if (!value) value = {};
    value[lang] = { active: subId, tested: (value[lang] ? value[lang].tested : []) };
    if (!value[lang].tested.includes(subId)) {
        value[lang].tested = value[lang].tested.concat(subId).sort();
    }
    await self.ct.data.setValueInFile(subsStatusDataFile, imdbId, value);
};

// const makeKey = (imdbId, lang, season, episode) => {
//     if (!season) {
//         // Movie
//         return `${imdbId}___${lang}`;
//     }
//     // TV Show
//     const pad = (n) => parseInt(n) > 9 ? "" : "0" + n;
//     return `${imdbId}___S${pad(season)}E${pad(episode)}___${lang}`
// };
