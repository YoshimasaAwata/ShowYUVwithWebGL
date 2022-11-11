import { YUVFile } from "./yuvfile";

export type YUVColorSpace = 'y' | 'u' | 'v';

export class YUVTexture extends YUVFile {
    private textureY: WebGLTexture | null = null;
    private textureU: WebGLTexture | null = null;
    private textureV: WebGLTexture | null = null;

    constructor(file: File, gl: WebGL2RenderingContext) {
        super(file);
        this.textureY = this.createTexture(gl);
        this.textureU = this.createTexture(gl);
        this.textureV = this.createTexture(gl);
    }

    public finalize(gl: WebGL2RenderingContext) {
        gl.deleteTexture(this.textureY);
        this.textureY = null;
        gl.deleteTexture(this.textureU);
        this.textureY = null;
        gl.deleteTexture(this.textureV);
        this.textureY = null;
    }

    protected createTexture(gl: WebGL2RenderingContext): WebGLTexture | null {
        const texture: WebGLTexture | null = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        return texture;
    }

    public async setNextYUVTextures(gl: WebGL2RenderingContext, texlocation: Map<YUVColorSpace, WebGLUniformLocation>) {
        await this.readYUV();
        if (this.available) {
            const texlocationY: WebGLUniformLocation | undefined = texlocation.get('y');
            if ((texlocationY != undefined) && (this.y != undefined)) {
                gl.uniform1i(texlocationY, 0);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.textureY);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, YUVFile.CIF_WIDTH, YUVFile.CIF_HEIGHT, 0, gl.RED, gl.UNSIGNED_BYTE, this.y);
            }
            const texlocationU: WebGLUniformLocation | undefined = texlocation.get('u');
            if ((texlocationU != undefined) && (this.u != undefined)) {
                gl.uniform1i(texlocationU, 1);
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, this.textureU);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, (YUVFile.CIF_WIDTH / 2), (YUVFile.CIF_HEIGHT / 2), 0, gl.RED, gl.UNSIGNED_BYTE, this.u);
            }
            const texlocationV: WebGLUniformLocation | undefined = texlocation.get('v');
            if ((texlocationV != undefined) && (this.v != undefined)) {
                gl.uniform1i(texlocationV, 2);
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, this.textureV);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, (YUVFile.CIF_WIDTH / 2), (YUVFile.CIF_HEIGHT / 2), 0, gl.RED, gl.UNSIGNED_BYTE, this.v);
            }
        } else {
            throw new Error('Failed to set textures');
        }
    }
}
