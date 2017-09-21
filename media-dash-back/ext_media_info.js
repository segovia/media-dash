const MEDIA_TYPE = require("./media_type");
const request = require("request-promise-native");

const apiKey = "4156b1880c7c62c4a5391c5613c096a9";
const serviceUrl = "https://api.themoviedb.org/3";

module.exports = class ExtMediaInfo {

    constructor(ct) {
        ct.extMediaInfo = this;
    }

    async getMovieImdbId(filename) {
        try {
            const searchResult = await this._searchMovie(filename);
            var tmdbId = searchResult.results[0].id;
            const movieInfo = await this._getMovieInfo(tmdbId);
            return movieInfo.imdb_id;
        } catch (e) {
            console.log(`Error code received for ${filename}: ${e}`);
            return null;
        }
    }

    // _getInfo(fileName, type) {
    //     switch (type) {
    //         case MEDIA_TYPE.MOVIE:
    //             return this._getMovieInfo(fileName);
    //         case MEDIA_TYPE.TV:
    //             console.log("tv");
    //             break;
    //     }
    //     throw "Unknown media type: " + type;
    // }

    _separateMovieNameAndYear(fileName) {
        return { name: fileName.slice(0, fileName.length - 7), year: fileName.slice(-5, -1) };
    }

    async _searchMovie(fileName) {
        const searchMovieUrl = `${serviceUrl}/search/movie?api_key=${apiKey}`;
        const movie = this._separateMovieNameAndYear(fileName);
        const nameEncoded = encodeURIComponent(movie.name);
        const reqUrl = `${searchMovieUrl}&query=${nameEncoded}&year=${movie.year}`;
        return JSON.parse(await request(reqUrl));
    }

    async _getMovieInfo(tmdbId) {
        return JSON.parse(await request(`${serviceUrl}/movie/${tmdbId}?api_key=${apiKey}`));
    }
};