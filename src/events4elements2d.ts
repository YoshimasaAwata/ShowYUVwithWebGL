import { YUVFile } from "./yuvfile";
import { Element, Events4Elements } from "./events4elements";
import { RGBImage } from "./rgbimage";

export class Events4Elements2D extends Events4Elements {
    static readonly MAP_2D = new Map<Element, string>([
        ['canvas', 'canvasYUV'],
        ['filebtn', 'btnOpenFile'],
        ['playbtn', 'btnPlay'],
        ['filetxt', 'txtFileName'],
        ['dialog', 'fileOpenDialog']
    ]);

    private image: RGBImage | undefined;

    constructor() {
        super(Events4Elements2D.MAP_2D);
        const ctx: CanvasRenderingContext2D | undefined = this.getContext2D();
        if (ctx != undefined) {
            ctx.fillStyle = 'green';
            ctx.fillRect(0, 0, YUVFile.CIF_WIDTH, YUVFile.CIF_HEIGHT);
        }
    }

    public finalize() {
        if (this.image != undefined) {
            this.image.finalize();
            this.image = undefined;
        }
    }

    protected getContext2D(): CanvasRenderingContext2D | undefined {
        const canvas: HTMLCanvasElement | undefined = this.getCanvas();
        var ctx: CanvasRenderingContext2D | undefined;
        if (canvas != undefined) {
            ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        }
        return ctx;
    }

    protected setFileName(files: FileList | null | undefined) {
        if (this.image != undefined) {
            this.finalize();
        }
        const file: File | null = this.extractFileFromFileList(files);
        if (file != null) {
            this.image = new RGBImage(file);
        }
    }

    protected showNextImage() {
        if (this.image != undefined) {
            this.image.getNextBitmap().then((bmp: ImageBitmap | undefined) => {
                if (bmp != undefined) {
                    const ctx: CanvasRenderingContext2D | undefined = this.getContext2D();
                    if (ctx != undefined) {
                        ctx.drawImage(bmp, 0, 0);
                    }
                } else {
                    this.stopPlay();
                }
            });
        }
    }

    protected rewind() {
        if (this.image != undefined) {
            this.image.rewind();
        }
    }
}
