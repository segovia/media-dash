const {promisify} = require("util");
const glob = promisify(require("glob"));

const mediaDir = "/media/gustavo/OS/Users/gustavo/workspace/torrent-dash/torrent-dash-back/test/Media";

module.exports = class MediaFiles {

    async getFileListing() {
        return glob(mediaDir + "/**/*", {nodir: true})
            .then(files => files.filter(s => !s.endsWith(".srt")).map(s => s.substring(mediaDir.length + 1)));
    }
};