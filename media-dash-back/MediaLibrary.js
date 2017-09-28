const { promisify } = require("util");
const glob = promisify(require("glob"));
const MEDIA_TYPE = require("./MediaType");



module.exports = class MediaLibrary {

    constructor(ct) {
        ct.mediaLibrary = this;
        this.ct = ct;
    }

    async getFileListing() {
        console.log("MediaLibrary - INFO: Scanning file listing");
        const start = new Date();
        const files = await glob(
            this.ct.props.mediaDir + `/@(${MEDIA_TYPE.TV}|${MEDIA_TYPE.MOVIE})/**/!(*.srt|*.sub|*.idx|*.jpg|*.smi|*.nfo)`,
            { nodir: true });
        console.log(`MediaLibrary - INFO: Files scanned, ${files.length} files found in ${new Date() - start}ms`);
        return this._toTree(files.map(s => s.substring(this.ct.props.mediaDir.length)));
    }

    _toTree(fileList) {
        const root = new Folder();
        fileList.forEach(file => this._toTreeRecursive(file, file.charAt(0) === "/" ? 1 : 0, root));
        return root.children;
    }

    _toTreeRecursive(filePath, curIndex, parent) {
        if (curIndex >= filePath.length) return;
        const idx = filePath.indexOf("/", curIndex);
        const token = filePath.substring(curIndex, idx === -1 ? filePath.length : idx);
        if (idx == -1) {
            parent.addFile(token);
            return;
        }
        const folder = parent.findOrCreateChild(token);
        this._toTreeRecursive(filePath, idx + 1, folder);
    }
};

class Folder {
    constructor() {
        this.type = "FOLDER";
        this.children = {};
    }
    addFile(name) {
        this.children[name] = {};
    }
    findOrCreateChild(name) {
        let child = this.children[name];
        if (!child) {
            child = new Folder();
            this.children[name] = child;
        }
        return child;
    }
}