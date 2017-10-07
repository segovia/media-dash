const compression = require("compression");
const express = require("express");
const Persistence = require("./Persistence");
const FileListing = require("./FileListing");
const ExtMediaInfo = require("./MediaInfoProvider");
const MediaInfo = require("./MediaInfo");
const MediaListing = require("./MediaListing");
const Subs = require("./Subs");
const SubsProvider = require("./SubsProvider");
const MEDIA_TYPE = require("./MediaType");
const port = 4000;

const ct = {};
ct.props = { mediaDir: process.argv[2] };
console.log(`Media directory:  ${ct.props.mediaDir}`);
const services = [
    new Persistence(ct, "cache"),
    new Persistence(ct, "data"),
    new Persistence(ct, "tmp"),
    new FileListing(ct),
    new ExtMediaInfo(ct),
    new MediaInfo(ct),
    new MediaListing(ct),
    new SubsProvider(ct),
    new Subs(ct)
];

services.reduce((p, s) => p.then(() => s.init && s.init()).catch(console.log), Promise.resolve());

const app = express();

app.use(compression());

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch((e) => {
    res.status(500).send(e.stack);
});

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
    res.send(await ct.mediaInfo.getInfo(req.params.imdbId, MEDIA_TYPE.MOVIE));
}));

app.get("/tv/:imdbId/:season/:episode/subs/:language", wrapAsync(async (req, res) => {
    res.send(await ct.subsProvider.getTVShowEpisodeSubs(req.params.imdbId,
        req.params.season,
        req.params.episode,
        req.params.language));
}));

app.get("/tv/:imdbId", wrapAsync(async (req, res) => {
    res.send(await ct.mediaInfo.getInfo(req.params.imdbId, MEDIA_TYPE.TV));
}));

app.get("/subs/install/:subId", wrapAsync(async (req, res) => {
    res.send(await ct.subs.install(req.params.subId));
}));

app.get("/", wrapAsync(async (req, res) => {
    res.send("Hello world!");
}));

app.listen(port, () => {
    console.log("App started on port " + port);
});