const compression = require("compression");
const express = require("express");
const Cache = require("./Cache");
const FileListing = require("./FileListing");
const ExtMediaInfo = require("./ExtMediaInfo");
const MediaListing = require("./MediaListing");
const Subs = require("./Subs");
const SubsProvider = require("./SubsProvider");
const MEDIA_TYPE = require("./MediaType");
const port = 4000;

const ct = {};
ct.props = { mediaDir: process.argv[2] };
console.log("Media directory: " + ct.props.mediaDir);
const services = [
    new Cache(ct),
    new FileListing(ct),
    new ExtMediaInfo(ct),
    new MediaListing(ct),
    new SubsProvider(ct),
    new Subs(ct)
];
services.reduce((p, s) => p.then(() => s.init && s.init()), Promise.resolve());

const app = express();

app.use(compression());

const wrapAsync = fn => (...args) => fn(...args).catch(args[2]);

app.get("/test", (req, res) => {
    res.send(ct.mediaListing.getEntry("tt2975590"));
});

app.get("/media-listing", (req, res) => {
    res.send(ct.mediaListing.get());
});

app.get("/movie/:imdbId/subs/:language", wrapAsync(async (req, res) => {
    res.send(await ct.subsProvider.getMovieSubs(req.params.imdbId, req.params.language));
}));

app.get("/movie/:imdbId", wrapAsync(async (req, res) => {
    const imdbId = req.params.imdbId;
    const movieInfo = await ct.extMediaInfo.getInfo(imdbId, MEDIA_TYPE.MOVIE);
    movieInfo.subLangs = ct.mediaListing.getEntry(imdbId).subLangs;
    res.send(movieInfo);
}));

app.get("/tv/:imdbId/:season/:episode/subs/:language", wrapAsync(async (req, res) => {
    res.send(await ct.subsProvider.getTVShowEpisodeSubs(req.params.imdbId,
        req.params.season,
        req.params.episode,
        req.params.language));
}));

app.get("/tv/:imdbId", wrapAsync(async (req, res) => {
    res.send(await ct.extMediaInfo.getInfo(req.params.imdbId, MEDIA_TYPE.TV));
}));

app.get("/", wrapAsync(async (req, res) => {
    res.send("Hello world!");
}));

app.listen(port, () => {
    console.log("App started on port " + port);
});