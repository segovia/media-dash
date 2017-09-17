const express = require("express");
const MediaFiles = require("./media_files");
const app = express();
const port = 4000;

const mediaFiles = new MediaFiles(process.argv[2]);

app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.get("/file-list", async (req, res) => {
    res.send(await mediaFiles.getFileListing());
});

app.listen(port, function () {
    console.log("App started on port " + port);
});