const request = require("request-promise-native");
const MEDIA_TYPE = require("./MediaType");

const extMediaInfoFile = "ext-media-info.json";

const apiKey = "4156b1880c7c62c4a5391c5613c096a9";
const serviceUrl = "https://api.themoviedb.org/3";

module.exports = class MediaInfoProvider {
    constructor(ct) {
        ct.mediaInfoProvider = this;
        this.ct = ct;
    }
    async getInfo(id) {
        const info = await this.ct.cache.readValueInFile(extMediaInfoFile, id);
        if (info) return info;
        return doGetInfoRequest(this, id);
    }

    async getImdbId(id) {
        const info = await this.ct.mediaInfoProvider.getInfo(id);
        if (info.imdbId) return info.imdbId;
        const mediaEntry = await this.ct.mediaListing.getEntry(id);
        const imdbId = await loadImdbId(this, mediaEntry, info);
        if (imdbId) {
            info.imdbId = imdbId;
            await this.ct.cache.setValueInFile(extMediaInfoFile, id, info);
        }
        return imdbId;
    }
};

const doGetInfoRequest = async (self, id) => {
    const listingEntry = Object.assign(await self.ct.mediaListing.getEntry(id), { id: id });
    switch (listingEntry.type) {
        case MEDIA_TYPE.MOVIE:
            await loadMovieInfo(self, listingEntry);
            break;
        case MEDIA_TYPE.TV:
            await loadTVShowInfo(self, listingEntry);
            break;
        case MEDIA_TYPE.SEASON:
            await loadSeasonsInfo(self, listingEntry);
            break;
        case MEDIA_TYPE.EPISODE:
            await loadEpisodesInfo(self, listingEntry);
            break;
    }
    return self.ct.cache.readValueInFile(extMediaInfoFile, id);
};

const loadMovieInfo = async (self, listingEntry) => {
    const title = listingEntry.title;
    const year = listingEntry.year;
    const reqUrl = `${serviceUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}`;
    const response = JSON.parse(await request(reqUrl));

    const genreMap = await loadGenreMap(MEDIA_TYPE.MOVIE);

    const result = response.results[0];
    await self.ct.cache.setValueInFile(extMediaInfoFile, listingEntry.id, {
        tmdbId: result.id,
        title: result.title,
        posterPath: result.poster_path,
        backdropPath: result.backdrop_path,
        overview: result.overview,
        releaseDate: result.release_date,
        voteScore: result.vote_average,
        genres: result.genre_ids.map(id => genreMap[id])
    });
};

const loadTVShowInfo = async (self, listingEntry) => {
    const name = listingEntry.title;
    const reqUrl = `${serviceUrl}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(name)}`;
    const response = JSON.parse(await request(reqUrl));

    const genreMap = await loadGenreMap(MEDIA_TYPE.TV);

    const result = response.results[0];
    await self.ct.cache.setValueInFile(extMediaInfoFile, listingEntry.id, {
        tmdbId: result.id,
        title: result.name,
        posterPath: result.poster_path,
        backdropPath: result.backdrop_path,
        overview: result.overview,
        firstAirDate: result.first_air_date,
        voteScore: result.vote_average,
        genres: result.genre_ids.map(id => genreMap[id])
    });
};

const loadGenreMap = async type => {
    const reqUrl = `${serviceUrl}/genre/${MEDIA_TYPE.MOVIE === type ? "movie" : "tv"}/list?api_key=${apiKey}`;
    const response = JSON.parse(await request(reqUrl));
    return response.genres.reduce((map, entry) => {
        map[entry.id] = entry.name;
        return map;
    }, {});
};

const loadSeasonsInfo = async (self, listingEntry) => {
    const tvShowId = listingEntry.parentId;
    const tvShowInfo = await self.getInfo(tvShowId);
    const tvShowTmdbId = tvShowInfo.tmdbId;
    const response = JSON.parse(await request(`${serviceUrl}/tv/${tvShowTmdbId}?api_key=${apiKey}`));

    const seasonNumberToInfoMap = response.seasons.reduce((map, seasonInfo) => {
        map[seasonInfo.season_number] = seasonInfo;
        return map;
    }, {});
    const seasonsIdsInListing = self.ct.mediaListing.getChildrenIds(tvShowId);

    const cacheFile = await self.ct.cache.readFile(extMediaInfoFile);
    await Promise.all(seasonsIdsInListing.map(async seasonId => {
        const seasonEntry = await self.ct.mediaListing.getEntry(seasonId);
        const seasonInfo = seasonNumberToInfoMap[seasonEntry.number];
        cacheFile[seasonId] = {
            tmdbId: seasonInfo.id,
            airDate: seasonInfo.air_date,
            episodeCount: seasonInfo.episode_count,
            posterPath: seasonInfo.poster_path,
            backdropPath: tvShowInfo.backdropPath
        };
    }));
    await self.ct.cache.persistFile(extMediaInfoFile, cacheFile);
};

const loadEpisodesInfo = async (self, listingEntry) => {
    const seasonId = listingEntry.parentId;
    const seasonEntry = await self.ct.mediaListing.getEntry(seasonId);

    const tvShowId = seasonEntry.parentId;
    const tvShowInfo = await self.getInfo(tvShowId);
    const tvShowTmdbId = tvShowInfo.tmdbId;
    const response = JSON.parse(await request(`${serviceUrl}/tv/${tvShowTmdbId}/season/${seasonEntry.number}?api_key=${apiKey}`));

    const episodeNumberToInfoMap = response.episodes.reduce((map, episodeInfo) => {
        map[episodeInfo.episode_number] = episodeInfo;
        return map;
    }, {});
    const episodeIdsInListing = self.ct.mediaListing.getChildrenIds(seasonId);

    const cacheFile = await self.ct.cache.readFile(extMediaInfoFile);
    await Promise.all(episodeIdsInListing.map(async episodeid => {
        const episodeEntry = await self.ct.mediaListing.getEntry(episodeid);
        const episodeInfo = episodeNumberToInfoMap[episodeEntry.number];
        if (episodeInfo) {
            cacheFile[episodeid] = {
                tmdbId: episodeInfo.id,
                title: episodeInfo.name,
                overview: episodeInfo.overview,
                airDate: episodeInfo.air_date,
                stillPath: episodeInfo.still_path,
                backdropPath: tvShowInfo.backdropPath,
                voteScore: episodeInfo.vote_average,
            };
        }
    }));
    await self.ct.cache.persistFile(extMediaInfoFile, cacheFile);
};

const loadImdbId = async (self, mediaEntry, info) => {
    let imdbId;
    if (mediaEntry.type === MEDIA_TYPE.MOVIE) {
        imdbId = await getMovieImdbId(info.tmdbId);
    } else if (mediaEntry.type === MEDIA_TYPE.TV) {
        imdbId = await getTVShowImdbId(info.tmdbId);
    } else {
        console.log(`Cannot get imdb id for media of type ${info.type}. Media entry: ${mediaEntry}`);
    }
    return imdbId;
};

const getMovieImdbId = async (tmdbId) => {
    return JSON.parse(await request(`${serviceUrl}/movie/${tmdbId}?api_key=${apiKey}`)).imdb_id;
};

const getTVShowImdbId = async (tmdbId) => {
    return JSON.parse(await request(`${serviceUrl}/tv/${tmdbId}/external_ids?api_key=${apiKey}`)).imdb_id;
};