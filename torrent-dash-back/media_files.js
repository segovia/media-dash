const {promisify} = require("util");
const glob = promisify(require("glob"));


module.exports = class MediaFiles {
    
    constructor(mediaDir) {
        this.mediaDir = mediaDir;
        console.log("Media directory: " + this.mediaDir);
    }
    async getFileListing() {
        console.log("MediaFiles - INFO: Scanning file listing");
        const files = await glob(this.mediaDir + "/**/*", {nodir: true});
        console.log("MediaFiles - INFO: Files scanned");
        // filter out unneeded files
        return files.filter(s => !s.endsWith(".srt")).map(s => s.substring(this.mediaDir.length + 1));
    }
};