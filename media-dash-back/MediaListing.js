const path = require("path");
const { promisify } = require("util");
const glob = promisify(require("glob"));
const fse = require("fs-extra");
const without = require("seamless-immutable").without;
const MEDIA_TYPE = require("./MediaType");
const IGNORED_EXTENSIONS = "!(*.idx|*.jpg|*.smi|*.nfo)";

const cacheFile = "media-listing.json";

class MediaListing {
    constructor(ct) {
        ct.mediaListing = this;
        this.ct = ct;
        this.parentToChildrenMap = {};
    }
    async init() {
        const listing = await this.get();
        refreshParentToChildrenMap(this, listing);
    }
    async get() {
        return this.ct.cache.readOrCreateFile(
            cacheFile,
            async () => await scanForMediaFiles(this, this.ct.props.mediaDir));
    }
    async getFiltered() {
        const listing = await this.get();
        return Object.entries(listing).reduce((map, e) => {
            map[e[0]] = without(e[1], "filepath");
            return map;
        }, {});
    }

    getAbsoluteMediaPath(relativePath) {
        return `${this.ct.props.mediaDir}/${relativePath}`;
    }

    async refreshEntry(id) {
        // the only thing that makes sense to refresh is an entries subtitles
        const mediaDir = this.ct.props.mediaDir;
        const entry = await this.getEntry(id);
        const subFiles = await glob(`${mediaDir}/${path.dirname(entry.filepath)}/@(*.srt|*.sub)`, { nodir: true });
        const relativeSubFiles = subFiles.map(filepath => filepath.substring(mediaDir.length + 1));
        const listing = await this.get();
        listing[id].subLangs = [];
        await addSubtitleInfoToListing(this, relativeSubFiles, listing);
        this.ct.cache.persistFile(cacheFile, listing);
    }

    async getEntry(id) {
        return (await this.get())[id];
    }

    getChildrenIds(parentId) {
        return this.parentToChildrenMap[parentId];
    }
}

MediaListing.DEFAULT_SUB_LANG = "default";
module.exports = MediaListing;

const scanForMediaFiles = async (self, mediaDir) => {
    console.log("MediaListing INFO: Scanning media files");
    const start = new Date();
    const files = await glob(
        `${mediaDir}/@(${MEDIA_TYPE.TV}|${MEDIA_TYPE.MOVIE})/**/${IGNORED_EXTENSIONS}`,
        { nodir: true });
    const relativeFiles = files.map(filepath => filepath.substring(mediaDir.length + 1));
    const listing = relativeFiles.filter(filepath => !isSubtitleFile(filepath)).reduce(handleFileEntry, {});
    await addSubtitleInfoToListing(self, relativeFiles, listing);
    console.log(`MediaListing INFO: Files scanned, ${files.length} files found and processed in ${new Date() - start}ms`);
    return listing;
};

const isSubtitleFile = filename => filename.endsWith(".sub") || filename.endsWith(".srt");
const refreshParentToChildrenMap = (self, listing) => {
    self.parentToChildrenMap = Object.entries(listing).filter(e => e[1].parentId).reduce((map, e) => {
        if (!map[e[1].parentId]) map[e[1].parentId] = [];
        map[e[1].parentId].push(e[0]);
        return map;
    }, {});
};

const handleFileEntry = (listing, filepath) => {
    const firstSlashIdx = filepath.indexOf("/");
    const mediaType = filepath.slice(0, firstSlashIdx);
    mediaType === MEDIA_TYPE.MOVIE ?
        handleMovieEntry(listing, filepath, firstSlashIdx + 1) :
        handleTVShowEntry(listing, filepath, firstSlashIdx + 1);
    return listing;
};

const handleMovieEntry = (listing, filepath, startIdx) => {
    const slashIdx = filepath.indexOf("/", startIdx);
    const movieFolder = filepath.slice(startIdx, slashIdx);
    const id = extractMovieId(movieFolder);
    if (listing[id]) return listing[id];
    listing[id] = {
        type: MEDIA_TYPE.MOVIE,
        filepath: filepath,
        title: extractMovieTitle(movieFolder),
        subLangs: []
    };
};
const extractMovieId = movieFolder => extractMovieTitle(movieFolder).toLowerCase().replace(/ /g, "_") +
    "." + extractMovieYear(movieFolder);
const extractMovieTitle = movieFolder => movieFolder.slice(0, -7);
const extractMovieYear = movieFolder => movieFolder.slice(-5, -1);

const handleTVShowEntry = (listing, filepath, startIdx) => {
    const slashIdx = filepath.indexOf("/", startIdx);
    const tvShowFolder = filepath.slice(startIdx, slashIdx);
    const tvShowId = extractTVShowId(tvShowFolder);
    ensureTVShowEntryDetailsIsCreated(listing, filepath, tvShowFolder, tvShowId);
    handleSeasonEntry(listing, filepath, slashIdx + 1, tvShowId);
    return listing;
};
const ensureTVShowEntryDetailsIsCreated = (listing, filepath, tvShowFolder, tvShowId) => {
    if (listing[tvShowId]) return;
    listing[tvShowId] = {
        type: MEDIA_TYPE.TV,
        filepath: filepath,
        title: tvShowFolder
    };
};
const extractTVShowId = tvShowFolder => tvShowFolder.toLowerCase().replace(/ /g, "_");

const handleSeasonEntry = (listing, filepath, startIdx, tvShowId) => {
    const slashIdx = filepath.indexOf("/", startIdx);
    const seasonFolder = filepath.slice(startIdx, slashIdx);
    if (!seasonFolder.startsWith("Season ")) return;
    const seasonId = extractSeasonId(seasonFolder, tvShowId);
    ensureSeasonEntryDetailsIsCreated(listing, filepath, seasonFolder, seasonId, tvShowId);
    handleEpisodeEntry(listing, filepath, slashIdx + 1, seasonId);
    return listing;
};
const ensureSeasonEntryDetailsIsCreated = (listing, filepath, seasonFolder, seasonId, tvShowId) => {
    if (listing[seasonId]) return;
    listing[seasonId] = {
        type: MEDIA_TYPE.SEASON,
        filepath: filepath,
        title: seasonFolder,
        parentId: tvShowId,
        number: parseInt(extractSeasonNumber(seasonFolder))
    };
};
const extractSeasonId = (seasonFolder, tvShowId) => `${tvShowId}.s${extractSeasonNumber(seasonFolder)}`;
const extractSeasonNumber = seasonFolder => seasonFolder.slice(-2);

const handleEpisodeEntry = (listing, filepath, startIdx, seasonId) => {
    const episodeFile = filepath.slice(startIdx);
    const id = extractEpisodeId(listing, episodeFile, seasonId);
    if (listing[id]) return listing[id];
    listing[id] = {
        type: MEDIA_TYPE.EPISODE,
        filepath: filepath,
        title: extractEpisodeTitle(episodeFile, listing[seasonId]),
        number: parseInt(extractEpisodeNumber(episodeFile, listing[seasonId])),
        parentId: seasonId,
        subLangs: []
    };
};
const extractEpisodeId = (listing, episodeFile, seasonId) => `${seasonId}.e${extractEpisodeNumber(episodeFile, listing[seasonId])}`;
const extractEpisodeNumber = (episodeFile, season) => {
    const idxOfEpisodeNumber = episodeFile.indexOf(` - S${padSeasonNumber(season)}E`) + 7;
    return episodeFile.substr(idxOfEpisodeNumber, 2);
};
const extractEpisodeTitle = (episodeFile, season) => {
    const index = episodeFile.indexOf(` - S${padSeasonNumber(season)}E`) + 7;
    const secondIndex = episodeFile.indexOf(" - ", index) + 3;
    return removeExtension(episodeFile.slice(secondIndex));
};
const removeExtension = filename => filename.slice(-8, -7) === "." ? filename.slice(0, -8) : filename.slice(0, -4);
const padSeasonNumber = season => `0${season.number}`.slice(-2);

const addSubtitleInfoToListing = async (self, filepaths, listing) => {
    const filepathToDetailsMap = Object.values(listing)
        .reduce((map, details) => {
            map[removeExtension(details.filepath)] = details;
            return map;
        }, {});
    const subs = filepaths.filter(isSubtitleFile);
    await Promise.all(subs.map(async sub => {
        const details = filepathToDetailsMap[removeExtension(sub)];
        if (!details) return;
        const subLang = extractSubtitleLang(sub);
        const birthtime = (await fse.stat(self.getAbsoluteMediaPath(sub))).birthtime;
        if (!details.subLangs.includes(subLang)) details.subLangs.push({ lang: subLang, addedOn: birthtime });
    }));
    Object.values(listing).forEach(v => {
        if (v.subLangs) v.subLangs.sort((a, b) => orderIndex(a.lang) - orderIndex(b.lang));
    });
};

const orderIndex = lang => {
    switch (lang) {
        case "eng": return 0;
        case "cze": return 1;
        case "ger": return 2;
    }
    return toNumber(lang);
};

const toNumber = (lang) => {
    let val = 0;
    let power = 1;
    let uCaseLang = lang.toUpperCase();
    let codeForA = "A".codePointAt(0);
    for (let i = 0; i < uCaseLang.length; i++ , power *= 26) {
        val += power * (uCaseLang.charCodeAt(uCaseLang.length - i - 1) - codeForA);
    }
    return val;
};

const extractSubtitleLang = filename => filename.slice(-8, -7) === "." ? filename.slice(-7, -4) : MediaListing.DEFAULT_SUB_LANG;