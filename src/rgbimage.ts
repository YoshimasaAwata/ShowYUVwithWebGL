import { YUVFile } from "./yuvfile";

export class RGBImage extends YUVFile {
    private bitmap: ImageBitmap | undefined;

    constructor(file: File) {
        super(file);
    }

    public finalize() {
        this.close();
    }

    protected close() {
        if (this.bitmap != undefined) {
            this.bitmap.close();
            this.bitmap = undefined;
        }
    }

    protected transYUV2RGB(): Uint8ClampedArray {
        const rgba = new Uint8ClampedArray(YUVFile.CIF_WIDTH * YUVFile.CIF_HEIGHT * 4);
        if ((this.y != undefined) && (this.u != undefined) && (this.v != undefined)) {
            let i: number = 0;
            for (let h: number = 0; h < YUVFile.CIF_HEIGHT; h++) {
                const y_pos: number = h * YUVFile.CIF_WIDTH;
                const uv_pos: number = Math.floor(h / 2) * (YUVFile.CIF_WIDTH / 2);

                for (let w: number = 0; w < YUVFile.CIF_WIDTH; w++) {
                    const yi: number = this.y[y_pos + w];
                    const ui: number = this.u[uv_pos + Math.floor(w / 2)];
                    const vi: number = this.v[uv_pos + Math.floor(w / 2)];

                    if ((yi != undefined) && (ui != undefined) && (vi != undefined)) {
                        const y16: number = yi - 16;
                        const u128: number = ui - 128;
                        const v128: number = vi - 128;

                        rgba[i++] = (1.164 * y16) + (0.0 * u128) + (1.596 * v128);
                        rgba[i++] = (1.164 * y16) + (-0.392 * u128) + (-0.813 * v128);
                        rgba[i++] = (1.164 * y16) + (2.017 * u128) + (0.0 * v128);
                        rgba[i++] = 255;
                    }
                }
            }
        }
        return rgba;
    }

    public async getNextBitmap(): Promise<ImageBitmap | undefined> {
        this.close();

        await this.readYUV();
        if (this.available) {
            const rgba: Uint8ClampedArray = this.transYUV2RGB();
            const image = new ImageData(rgba, YUVFile.CIF_WIDTH);
            this.bitmap = await window.createImageBitmap(image);
        } else {
            this.bitmap = undefined;
        }

        return this.bitmap;
    }

}
