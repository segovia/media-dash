const MEDIA_TYPE = require("./media_type");
const request = require("request-promise-native");

const apiKey = "4156b1880c7c62c4a5391c5613c096a9";
const serviceUrl = "https://api.themoviedb.org/3";

module.exports = class ExtMediaInfo {

    constructor(ct) {
        ct.extMediaInfo = this;
    }


    async getImdbId(title, mediaType) {
        if (mediaType === MEDIA_TYPE.MOVIE) return await this.getMovieImdbId(title);
        return await this.getTVShowImdbId(title);
    }

    async getMovieImdbId(name) {
        try {
            const searchResult = await this._searchMovie(name);
            var tmdbId = searchResult.results[0].id;
            const movieInfo = await this._getMovieInfo(tmdbId);
            return movieInfo.imdb_id;
        } catch (e) {
            console.log(`Error code received for ${name}: ${e}`);
            return null;
        }
    }
    
    async _searchMovie(name) {
        const searchMovieUrl = `${serviceUrl}/search/movie?api_key=${apiKey}`;
        const movie = this._separateMovieNameAndYear(name);
        const reqUrl = `${searchMovieUrl}&query=${encodeURIComponent(movie.name)}&year=${movie.year}`;
        return JSON.parse(await request(reqUrl));
    }
    
    async _getMovieInfo(tmdbId) {
        return JSON.parse(await request(`${serviceUrl}/movie/${tmdbId}?api_key=${apiKey}`));
    }
    
    _separateMovieNameAndYear(name) {
        return { name: name.slice(0, name.length - 7), year: name.slice(-5, -1) };
    }

    async getTVShowImdbId(name) {
        try {
            const searchResult = await this._searchTVShow(name);
            var tmdbId = searchResult.results[0].id;
            const info = await this._getTVShowInfo(tmdbId);
            return info.imdb_id;
        } catch (e) {
            console.log(`Error code received for ${name}: ${e}`);
            return null;
        }
    }

    async _searchTVShow(name) {
        const reqUrl = `${serviceUrl}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(name)}`;
        return JSON.parse(await request(reqUrl));
    }

    async _getTVShowInfo(tmdbId) {
        return JSON.parse(await request(`${serviceUrl}/tv/${tmdbId}/external_ids?api_key=${apiKey}`));
    }
};