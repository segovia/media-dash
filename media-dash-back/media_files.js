const { promisify } = require("util");
const glob = promisify(require("glob"));


module.exports = class MediaFiles {

    constructor(ct) {
        ct.mediaFiles = this;
        this.ct = ct;
    }

    async getFileListing() {
        console.log("MediaFiles - INFO: Scanning file listing");
        const files = await glob(
            this.ct.props.mediaDir + "/@(TV Shows|Movies)/**/!(*.srt|*.sub|*.idx|*.jpg|*.smi|*.nfo)",
            { nodir: true });
        console.log("MediaFiles - INFO: Files scanned, " + files.length + " files found");
        return this._toTree(files.map(s => s.substring(this.ct.props.mediaDir.length)));
    }

    _toTree(fileList) {
        const root = new Folder("Media");
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