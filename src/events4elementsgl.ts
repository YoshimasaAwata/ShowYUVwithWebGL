import { Element, Events4Elements } from "./events4elements";

export abstract class Events4ElementsGL extends Events4Elements {
    static readonly TEXTURE_DATA = [
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
    ];

    static readonly VERTEX_DATA = [
        - 1.0, -1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
    ];

    private vertexShader: WebGLShader | null = null;
    private fragmentShader: WebGLShader | null = null;
    private _shaderProgram: WebGLProgram | null = null;
    private _vertexBuffer: WebGLBuffer | null = null;
    private _textureBuffer: WebGLBuffer | null = null;

    public get shaderProgram(): WebGLProgram | null {
        return this._shaderProgram;
    }

    public get vertexBuffer(): WebGLBuffer | null {
        return this._vertexBuffer;
    }

    public get textureBuffer(): WebGLBuffer | null {
        return this._textureBuffer;
    }

    constructor(ids: Map<Element, string>) {
        super(ids);
        const gl: WebGL2RenderingContext | undefined = this.getContextGL();
        if (gl != undefined) {
            gl.clearColor(0.0, 0.0, 1.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
    }

    public finalize() {
        const gl: WebGL2RenderingContext | undefined = this.getContextGL();
        if (gl != undefined) {
            this.deleteAllShaders(gl);
        }
    }

    protected getContextGL(): WebGL2RenderingContext | undefined {
        const canvas: HTMLCanvasElement | undefined = this.getCanvas();
        var gl: WebGL2RenderingContext | undefined;
        if (canvas != undefined) {
            gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
        }
        return gl;
    }

    protected deleteAllShaders(gl: WebGL2RenderingContext) {
        gl.deleteShader(this.vertexShader);
        this.vertexShader = null;
        gl.deleteShader(this.fragmentShader);
        this.fragmentShader = null;
        gl.deleteProgram(this._shaderProgram);
        this._shaderProgram = null;
    }

    protected initShaderProgram(gl: WebGL2RenderingContext, vertexShaderPrg: string, fragmentShaderPrg: string) {
        this.vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vertexShaderPrg);
        this.fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderPrg);
        if ((this.vertexShader != null) && this.fragmentShader != null) {
            this._shaderProgram = gl.createProgram();
            if (this._shaderProgram != null) {
                gl.attachShader(this._shaderProgram, this.vertexShader);
                gl.attachShader(this._shaderProgram, this.fragmentShader);
                gl.linkProgram(this._shaderProgram);

                if (!gl.getProgramParameter(this._shaderProgram, gl.LINK_STATUS)) {
                    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this._shaderProgram));
                    this.deleteAllShaders(gl);
                }
            } else {
                this.deleteAllShaders(gl);
            }
        } else {
            this.deleteAllShaders(gl);
        }
    }

    protected loadShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
        var shader: WebGLShader | null = gl.createShader(type);
        if (shader != null) {
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
                shader = null;
            }
        }

        return shader;
    }

    protected createBuffers(gl: WebGL2RenderingContext) {
        this._vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        const vd = new Float32Array(Events4ElementsGL.VERTEX_DATA);
        gl.bufferData(gl.ARRAY_BUFFER, vd, gl.STATIC_DRAW);

        this._textureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._textureBuffer);
        const td = new Float32Array(Events4ElementsGL.TEXTURE_DATA);
        gl.bufferData(gl.ARRAY_BUFFER, td, gl.STATIC_DRAW);
    }
}
