import { Element } from "./events4elements";
import { Events4ElementsGL } from "./events4elementsgl";
import { RGBTexture } from "./rgbtexture";

export class Events4ElementsGLRGB extends Events4ElementsGL {
    static readonly MAP_GLRGB = new Map<Element, string>([
        ['canvas', 'canvasGLRGB'],
        ['filebtn', 'btnOpenFileGLRGB'],
        ['playbtn', 'btnPlayGLRGB'],
        ['filetxt', 'txtFileNameGLRGB'],
        ['dialog', 'fileOpenDialogGLRGB']
    ]);

    static readonly VERTEX_SOURCE = `
        attribute vec3 position;
        attribute vec2 vertexUV;
        varying mediump vec2 uv;
        void main(void)
        {
            gl_Position.xyz = position;
            gl_Position.w = 1.0;
            uv = vertexUV;
        }`;

    static readonly FRAGMENT_SOURCE = `
        varying mediump vec2 uv;
        uniform sampler2D textureSampler;
        void main(void)
        {
            gl_FragColor = texture2D(textureSampler, uv);
        }`;

    private vertexPosition: number = 0;
    private vertexUV: number = 0;
    private texture: WebGLUniformLocation | null = null;
    private texImage: RGBTexture | undefined;

    constructor() {
        super(Events4ElementsGLRGB.MAP_GLRGB);
    }

    public finalize() {
        super.finalize();
        const gl: WebGL2RenderingContext | undefined = this.getContextGL();
        if ((gl != undefined) && (this.texImage != undefined)) {
            this.texImage.finalize(gl);
            this.texImage = undefined;
        }
    }

    protected setFileName(files: FileList | null | undefined) {
        if (this.texImage != undefined) {
            this.finalize();
        }
        const file: File | null = this.extractFileFromFileList(files);
        if (file != null) {
            const gl: WebGL2RenderingContext | undefined = this.getContextGL();
            if (gl != undefined) {
                this.initShaderProgram(gl, Events4ElementsGLRGB.VERTEX_SOURCE, Events4ElementsGLRGB.FRAGMENT_SOURCE);
                if (this.shaderProgram != null) {
                    this.vertexPosition = gl.getAttribLocation(this.shaderProgram, 'position');
                    this.vertexUV = gl.getAttribLocation(this.shaderProgram, 'vertexUV');
                    this.texture = gl.getUniformLocation(this.shaderProgram, 'textureSampler');
                };
                this.createBuffers(gl);
                this.texImage = new RGBTexture(file, gl);
            }
        }
    }

    protected showNextImage() {
        const gl: WebGL2RenderingContext | undefined = this.getContextGL();
        if ((gl != undefined) && (this.texImage != undefined) && (this.texture != null)) {
            gl.useProgram(this.shaderProgram);
            this.texImage.setNextTexture(gl, this.texture).then(() => {
                gl.clear(gl.COLOR_BUFFER_BIT);

                gl.enableVertexAttribArray(this.vertexPosition);
                gl.enableVertexAttribArray(this.vertexUV);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
                gl.vertexAttribPointer(
                    this.vertexPosition,
                    3, // サイズ
                    gl.FLOAT, // タイプ
                    false, // 正規化？
                    0, // ストライド
                    0 //vertexBuffer // 配列バッファ
                );

                gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
                gl.vertexAttribPointer(
                    this.vertexUV,
                    2, // サイズ
                    gl.FLOAT, // タイプ
                    false, // 正規化？
                    0, // ストライド
                    0 //textureBuffer // 配列バッファ
                );

                gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

                gl.disableVertexAttribArray(this.vertexUV);
                gl.disableVertexAttribArray(this.vertexPosition);
            }).catch(() => {
                this.stopPlay();
            });
        }
    }

    protected rewind() {
        if (this.texImage != undefined) {
            this.texImage.rewind();
        }
    }
}
