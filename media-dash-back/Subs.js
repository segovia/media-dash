const path = require("path");
const { promisify } = require("util");
const download = promisify(require("download-file"));
const fse = require("fs-extra");
const MEDIA_TYPE = require("./MediaType");
const MediaListing = require("./MediaListing");

const subsStatusDataFile = "subs-status.json";

module.exports = class Subs {
    constructor(ct) {
        ct.subs = this;
        this.ct = ct;
    }

    async getStatus(mediaId) {
        return this.ct.data.readValueInFile(subsStatusDataFile, mediaId);
    }

    async tryAnother(mediaId, lang) {
        const mediaEntry = await this.ct.mediaListing.getEntry(mediaId);
        if (mediaEntry.type !== MEDIA_TYPE.MOVIE && mediaEntry.type !== MEDIA_TYPE.EPISODE) {
            console.log(`Subs ERROR: It is not possible to 'try another' sub for media of type ${mediaEntry.type}`);
            return;
        }
        const imdbId = await this.ct.mediaInfo.getImdbId(mediaId);
        const subs = await (mediaEntry.type === MEDIA_TYPE.MOVIE ?
            this.ct.subsProvider.getMovieSubs(lang, imdbId, mediaEntry.filepath) :
            getEpisodeSubs(this, lang, imdbId, mediaEntry));

        const tested = await getAlreadyUsedSubs(this, mediaId, lang);
        let sub = subs.find(s => !tested.has(s.id));
        if (!sub) {
            console.log("Subs ERROR: All subs were tested, just going to use the first sub.");
            sub = subs[0];
        }
        await this.install(mediaId, mediaEntry.filepath, lang, sub, subs.length);
    }

    async resetTested(mediaId, lang) {
        if (lang !== MediaListing.DEFAULT_SUB_LANG) {
            const status = await this.getStatus(mediaId);
            if (status && status[lang]) {
                delete status[lang];
                await this.ct.data.setValueInFile(subsStatusDataFile, mediaId, status);
            }
        }
        await this.tryAnother(mediaId, "eng");
    }

    async install(mediaId, filepath, lang, sub, availableSubsCount) {
        const normalizedLang = lang === MediaListing.DEFAULT_SUB_LANG ? "eng" : lang;
        const fileDir = this.ct.mediaListing.getAbsoluteMediaPath(path.dirname(filepath));
        const baseFilename = basenameWithoutExtension(filepath);
        const tmpFilename = `${baseFilename}.${normalizedLang}.srt.tmp`;
        await download(sub.url, { directory: `${this.ct.tmp.getDir()}`, filename: tmpFilename });
        await activate(this.ct.tmp.getFilePath(tmpFilename), fileDir, baseFilename, normalizedLang);
        await updateStatus(this, sub.id, mediaId, normalizedLang, availableSubsCount);
        await this.ct.mediaListing.refreshEntry(mediaId);
    }
};

const basenameWithoutExtension = filepath => {
    const basename = path.basename(filepath);
    return basename.slice(0, -path.extname(basename).length);
};
const getAlreadyUsedSubs = async (self, mediaId, lang) => {
    const status = await self.getStatus(mediaId);
    return new Set(status && status[lang] ? status[lang].tested : []);
};
const getEpisodeSubs = async (self, lang, imdbId, mediaEntry) => {
    const seasonInfo = self.ct.mediaInfo.getInfo(mediaEntry.parent);
    const episodeInfo = self.ct.mediaInfo.getInfo(mediaEntry.id);
    return self.ct.subsProvider.getEpisodeSubs(lang, imdbId, seasonInfo.number, episodeInfo.number, mediaEntry.filepath);
};
const activate = async (downloadedFile, targetFolder, baseFilename, lang) => {
    await Promise.all([
        fse.unlink(`${targetFolder}/${baseFilename}.srt`).catch(ignoreFileNotFound),
        fse.unlink(`${targetFolder}/${baseFilename}.sub`).catch(ignoreFileNotFound),
        fse.unlink(`${targetFolder}/${baseFilename}.${lang}.srt`).catch(ignoreFileNotFound),
        fse.unlink(`${targetFolder}/${baseFilename}.${lang}.sub`).catch(ignoreFileNotFound)
    ]);
    const target = `${targetFolder}/${baseFilename}.${lang}.srt`;
    await fse.rename(downloadedFile, target);
    console.log(`Subs INFO: Subtitle '${target} written'`);
};

const ignoreFileNotFound = error => {
    if (error.code !== "ENOENT") throw error;
};

const updateStatus = async (self, subId, mediaId, lang, availableSubsCount) => {
    let value = await self.ct.data.readValueInFile(subsStatusDataFile, mediaId);
    if (!value) value = {};
    value[lang] = { active: subId, available: availableSubsCount, tested: (value[lang] ? value[lang].tested : []) };
    if (!value[lang].tested.includes(subId)) {
        value[lang].tested = value[lang].tested.concat(subId).sort();
    }
    await self.ct.data.setValueInFile(subsStatusDataFile, mediaId, value);
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
