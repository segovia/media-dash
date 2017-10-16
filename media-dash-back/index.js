const compression = require("compression");
const express = require("express");
const Persistence = require("./Persistence");
const ExtMediaInfo = require("./MediaInfoProvider");
const MediaInfo = require("./MediaInfo");
const MediaListing = require("./MediaListing");
const Subs = require("./Subs");
const SubsProvider = require("./SubsProvider");
const port = 4000;

const ct = {};
ct.props = { mediaDir: process.argv[2] };
if (ct.props.mediaDir.endsWith("/")) ct.props.mediaDir = ct.props.mediaDir.slice(0, -1);

console.log(`Media directory:  ${ct.props.mediaDir}`);
const services = [
    new Persistence(ct, "cache"),
    new Persistence(ct, "data"),
    new Persistence(ct, "tmp"),
    new MediaListing(ct),
    new ExtMediaInfo(ct),
    new MediaInfo(ct),
    new SubsProvider(ct),
    new Subs(ct)
];

services.reduce((p, s) => p.then(() => s.init && s.init()).catch(console.log), Promise.resolve());

const app = express();

app.use(compression());

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch((e) => {
    res.status(500).send(e.stack);
});

app.get("/listing", wrapAsync(async (req, res) => {
    res.send((await ct.mediaListing.getFiltered()));
}));

app.get("/info/:id", wrapAsync(async (req, res) => {
    res.send(await ct.mediaInfo.getInfoFiltered(req.params.id));
}));

app.get("/subs/:mediaId/try-another/:lang", wrapAsync(async (req, res) => {
    res.send(await ct.subs.tryAnother(req.params.mediaId, req.params.lang));
}));

app.get("/subs/:mediaId/reset-tested/:lang", wrapAsync(async (req, res) => {
    res.send(await ct.subs.resetTested(req.params.mediaId, req.params.lang));
}));

app.get("/clear-cache", wrapAsync(async (req, res) => {
    await ct.cache.clearFiles();
    ct.data.clearMemory();
    await ct.mediaListing.get();
    res.send("ok");
}));

app.get("/", wrapAsync(async (req, res) => {
    res.send("Hello world!");
}));

app.listen(port, () => {
    console.log("App started on port " + port);
});