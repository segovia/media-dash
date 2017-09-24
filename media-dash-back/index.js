const compression = require("compression");
const express = require("express");
const Cache = require("./cache");
const MediaFiles = require("./media_files");
const ExtMediaInfo = require("./ext_media_info");
const Media = require("./media");
const MEDIA_TYPE = require("./media_type");
const app = express();
app.use(compression());
const port = 4000;

const ct = {};
ct.props = { mediaDir: process.argv[2] };
console.log("Media directory: " + ct.props.mediaDir);
const services = [
    new Cache(ct),
    new MediaFiles(ct),
    new ExtMediaInfo(ct),
    new Media(ct)
];
services.reduce((p, s) => p.then(() => s.init && s.init()), Promise.resolve());

app.get("/media-listing", (req, res) => {
    res.send(ct.media.getMediaListing());
});

app.get("/movie/:imdbId", async (req, res) => {
    res.send(await ct.extMediaInfo.getInfo(req.params.imdbId, MEDIA_TYPE.MOVIE));
});

app.get("/tv/:imdbId", async (req, res) => {
    res.send(await ct.extMediaInfo.getInfo(req.params.imdbId, MEDIA_TYPE.TV));
});

app.get("/", async (req, res) => {
    var mediaListing = ct.media.getMediaListing();
    let content = "";
    mediaListing.children.forEach((folder) => {
        content += "<h3>" + folder.name + "</h3>";
        content += folder.children.map((subFolder) => subFolder.name).join("<br/>");
    });
    const html = `<html><body style="background-color:black;color:white">${content}</body></html>`;
    res.send(html);
});

app.listen(port, function () {
    console.log("App started on port " + port);
});
