import { RGBImage } from "./rgbimage";

export class RGBTexture extends RGBImage {
    private texture: WebGLTexture | null = null;

    constructor(file: File, gl: WebGL2RenderingContext) {
        super(file);
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    public finalize(gl: void): void;
    public finalize(gl: WebGL2RenderingContext): void;

    public finalize(gl: any) {
        super.finalize();

        if (typeof gl === 'object') {
            gl.deleteTexture(this.texture);
            this.texture = null;
        }
    }

    public async setNextTexture(gl: WebGL2RenderingContext, texlocation: WebGLUniformLocation) {
        const bmp: ImageBitmap | undefined = await this.getNextBitmap();
        if (bmp != undefined) {
            gl.uniform1i(texlocation, 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bmp);
        } else {
            throw new Error('No more image');
        }
    }
}
