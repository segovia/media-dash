const { promisify } = require("util");
const glob = promisify(require("glob"));


module.exports = class MediaFiles {

    constructor(mediaDir) {
        this.mediaDir = mediaDir;
        console.log("Media directory: " + this.mediaDir);
    }
    async getFileListing() {
        console.log("MediaFiles - INFO: Scanning file listing");
        const files = await glob(this.mediaDir + "/**/*", { nodir: true });
        console.log("MediaFiles - INFO: Files scanned");
        const filteredFiles = files.filter(s => !s.endsWith(".srt")).map(s => s.substring(this.mediaDir.length + 1));
        return this._toTree(filteredFiles);
    }

    _toTree(fileList) {
        const root = new Folder("");
        fileList.forEach(file => this._toTreeRecursive(file, file.charAt(0) === "/" ? 1 : 0, root));
        return root;
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

class File {
    constructor(name) {
        this.name = name;
        this.type = "FILE";
    }
}

class Folder {
    constructor(name) {
        this.name = name;
        this.type = "FOLDER";
        this.children = [];
    }
    addFile(name) {
        this.children.push(new File(name));
    }
    findOrCreateChild(name) {
        let child = this.children.find(f => f.name === name && f.type === this.type);
        if (!child) {
            child = new Folder(name);
            this.children.push(child);
        }
        return child;
    }
}