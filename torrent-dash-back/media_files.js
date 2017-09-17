const {promisify} = require("util");
const glob = promisify(require("glob"));


module.exports = class MediaFiles {
    
    constructor(mediaDir) {
        this.mediaDir = mediaDir;
        console.log("Media directory: " + this.mediaDir);
    }
    async getFileListing() {
        return glob(this.mediaDir + "/**/*", {nodir: true})
            .then(files => files.filter(s => !s.endsWith(".srt")).map(s => s.substring(this.mediaDir.length + 1)));
    }
};