export class YUVFile {
    static readonly CIF_WIDTH = 352;
    static readonly CIF_HEIGHT = 288;
    static readonly Y_SIZE = YUVFile.CIF_WIDTH * YUVFile.CIF_HEIGHT;
    static readonly UV_SIZE = (YUVFile.CIF_WIDTH / 2) * (YUVFile.CIF_HEIGHT / 2);

    private file: File | undefined;
    private _y: Uint8Array | undefined;
    private _u: Uint8Array | undefined;
    private _v: Uint8Array | undefined;
    private start: number = 0;
    private _available: boolean = false;

    public get y(): Uint8Array | undefined {
        return this._y;
    }

    public get u(): Uint8Array | undefined {
        return this._u;
    }

    public get v(): Uint8Array | undefined {
        return this._v;
    }

    public get available(): boolean {
        return this._available;
    }

    constructor(file: File) {
        this.file = file;
    }

    protected async readFile(size: number): Promise<Uint8Array | undefined> {
        var array: Uint8Array | undefined;
        if (this.file != undefined) {
            var end: number = this.start + size;
            const arraybuffer: Promise<ArrayBuffer> = this.file.slice(this.start, end, this.file.type).arrayBuffer();
            array = new Uint8Array(await arraybuffer);
            if (array.byteLength != size) {
                array = undefined;
            }
            this.start = end;
        }
        return array;
    }

    protected async readYUV() {
        this._y = await this.readFile(YUVFile.Y_SIZE);
        this._u = await this.readFile(YUVFile.UV_SIZE);
        this._v = await this.readFile(YUVFile.UV_SIZE);
        this._available = (this._v != undefined);
    }
}
