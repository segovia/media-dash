const compression = require("compression");
const express = require("express");
const Cache = require("./cache");
const MediaFiles = require("./media_files");
const app = express();
app.use(compression());
const port = 4000;

const cache = new Cache();
const mediaFiles = new MediaFiles(process.argv[2]);

cache.registerCall(mediaFiles.getFileListing.name, () => mediaFiles.getFileListing());
cache.init();


app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.get("/file-listing", async (req, res) => {
    res.send(await cache.call(mediaFiles.getFileListing));
});

app.listen(port, function () {
    console.log("App started on port " + port);
});