import { Element } from "./events4elements";
import { Events4ElementsGL } from "./events4elementsgl";
import { YUVColorSpace, YUVTexture } from "./yuvtexture";

export class Events4ElementsGLYUV extends Events4ElementsGL {
    static readonly MAP_GLYUV = new Map<Element, string>([
        ['canvas', 'canvasGLYUV'],
        ['filebtn', 'btnOpenFileGLYUV'],
        ['playbtn', 'btnPlayGLYUV'],
        ['filetxt', 'txtFileNameGLYUV'],
        ['dialog', 'fileOpenDialogGLYUV']
    ]);

    static readonly VERTEX_SOURCE = `#version 300 es
        in vec3 position;
        in vec2 vertexUV;
        out vec2 uv;
        void main(void)
        {
            gl_Position.xyz = position;
            gl_Position.w = 1.0;
            uv = vertexUV;
        }`;

    static readonly FRAGMENT_SOURCE = `#version 300 es
        precision highp float;
        const mat4 TORGB = mat4(
            1.164f,  1.164f, 1.164f, 0.0f,
            0.0f,   -0.392f, 2.017f, 0.0f,
            1.596f, -0.813f, 0.0f,   0.0f,
            0.0f,    0.0f,   0.0f,   1.0f);
        const vec4 DIFF = vec4(16.0f / 255.0f, 128.0f / 255.0f, 128.0f / 255.0f, 0.0f);
        in vec2 uv;
        out vec4 color;
        uniform sampler2D textureSamplerY;
        uniform sampler2D textureSamplerU;
        uniform sampler2D textureSamplerV;
        void main(void)
        {
            vec4 fy = texture(textureSamplerY, uv);
            vec4 fu = texture(textureSamplerU, uv);
            vec4 fv = texture(textureSamplerV, uv);
            vec4 yuv = vec4(fy.r, fu.r, fv.r, 1.0f);
            yuv -= DIFF;
            vec4 rgb = TORGB * yuv;
            color = clamp(rgb, 0.0f, 1.0f);
        }`;

    private vertexPosition: number = 0;
    private vertexUV: number = 0;
    private textureMap = new Map<YUVColorSpace, WebGLUniformLocation>;
    private texImage: YUVTexture | undefined;

    constructor() {
        super(Events4ElementsGLYUV.MAP_GLYUV);
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
                this.initShaderProgram(gl, Events4ElementsGLYUV.VERTEX_SOURCE, Events4ElementsGLYUV.FRAGMENT_SOURCE);
                if (this.shaderProgram != null) {
                    this.vertexPosition = gl.getAttribLocation(this.shaderProgram, 'position');
                    this.vertexUV = gl.getAttribLocation(this.shaderProgram, 'vertexUV');
                    const textureYLocation: WebGLUniformLocation | null = gl.getUniformLocation(this.shaderProgram, 'textureSamplerY');
                    if (textureYLocation != null) {
                        this.textureMap.set(`y`, textureYLocation);
                    }
                    const textureULocation: WebGLUniformLocation | null = gl.getUniformLocation(this.shaderProgram, 'textureSamplerU');
                    if (textureULocation != null) {
                        this.textureMap.set(`u`, textureULocation);
                    }
                    const textureVLocation: WebGLUniformLocation | null = gl.getUniformLocation(this.shaderProgram, 'textureSamplerV');
                    if (textureVLocation != null) {
                        this.textureMap.set(`v`, textureVLocation);
                    }
                };
                this.createBuffers(gl);
                this.texImage = new YUVTexture(file, gl);
            }
        }
    }

    protected showNextImage() {
        const gl: WebGL2RenderingContext | undefined = this.getContextGL();
        if ((gl != undefined) && (this.texImage != undefined)) {
            gl.useProgram(this.shaderProgram);
            this.texImage.setNextYUVTextures(gl, this.textureMap).then(() => {
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
