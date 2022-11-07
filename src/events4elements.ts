export type Element = 'canvas' | 'filebtn' | 'playbtn' | 'filetxt' | 'dialog';

export abstract class Events4Elements {
    private canvasID: string | undefined;
    private fileBtnID: string | undefined;
    private playBtnID: string | undefined;
    private fileTxtID: string | undefined;
    private dialogID: string | undefined;

    private timerID: number | undefined;

    constructor(ids: Map<Element, string>) {
        this.canvasID = ids.get('canvas');
        this.fileBtnID = ids.get('filebtn');
        this.playBtnID = ids.get('playbtn');
        this.fileTxtID = ids.get('filetxt');
        this.dialogID = ids.get('dialog');

        /* Add event listener for buttons */
        if (this.fileBtnID != undefined) {
            const btnOpenFile = document.getElementById(this.fileBtnID) as HTMLButtonElement;
            btnOpenFile.addEventListener('click', this.openFileDialog.bind(this));
        }
        if (this.playBtnID != undefined) {
            const btnPlay = document.getElementById(this.playBtnID) as HTMLButtonElement;
            btnPlay.addEventListener('click', this.play.bind(this));
        }

        /* Add event listener for file dialog */
        if (this.dialogID != undefined) {
            const fileOpenDialog = document.getElementById(this.dialogID) as HTMLInputElement;
            fileOpenDialog.addEventListener('change', this.setFileInfo.bind(this));
        }
    }

    protected openFileDialog() {
        if (this.dialogID != undefined) {
            const fileOpenDialog = document.getElementById(this.dialogID) as HTMLInputElement;
            fileOpenDialog.value = '';
            fileOpenDialog.click();
        }
    }

    protected setFileInfo() {
        if (this.dialogID != undefined) {
            const fileOpenDialog = document.getElementById(this.dialogID) as HTMLInputElement;
            if (fileOpenDialog.value != '') {
                const files: FileList | null = fileOpenDialog.files;
                this.setFileName(files);
                this.showNextImage();
            }
        }
    }

    protected play() {
        if (this.timerID == undefined) {
            this.enableFileButton(false);
            this.switchPlayStopButton();
            this.timerID = window.setInterval(this.showNextImage.bind(this), 66);
        } else {
            window.clearInterval(this.timerID);
            this.timerID = undefined;
            this.enableFileButton(true);
            this.switchPlayStopButton();
        }
    }

    protected stopPlay() {
        if (this.timerID != undefined) {
            window.clearInterval(this.timerID);
            this.timerID = undefined;
        }
        this.switchPlayStopButton();
        this.enableFileButton(true);
        this.rewind();
    }

    protected showFileName(filename: string) {
        if (this.fileTxtID != undefined) {
            const fileNameArea = document.getElementById(this.fileTxtID) as HTMLInputElement;
            fileNameArea.value = filename;
        }
    }

    protected enableFileButton(enable: boolean) {
        if (this.fileBtnID != undefined) {
            const btnOpenFile = document.getElementById(this.fileBtnID) as HTMLButtonElement;
            btnOpenFile.disabled = (!enable);
        }
    }

    protected enablePlayButton(enable: boolean) {
        if (this.playBtnID != undefined) {
            const btnPlay = document.getElementById(this.playBtnID) as HTMLButtonElement;
            btnPlay.disabled = (!enable);
        }
    }

    protected switchPlayStopButton() {
        if (this.playBtnID != undefined) {
            const btnPlay = document.getElementById(this.playBtnID) as HTMLButtonElement;
            btnPlay.textContent = (btnPlay.textContent == 'Play') ? 'Stop' : 'Play';
        }
    }

    protected getCanvas(): HTMLCanvasElement | undefined {
        let canvas: HTMLCanvasElement | undefined;
        if (this.canvasID != undefined) {
            canvas = document.getElementById(this.canvasID) as HTMLCanvasElement;
        }
        return canvas;
    }

    protected extractFileFromFileList(files: FileList | null | undefined): File | null {
        let file: File | null = null;
        if ((files != undefined) && (files != null) && (files.length > 0)) {
            file = files.item(0);
            if (file != null) {
                const filename: string | undefined = file.name;
                if ((filename != undefined) && (this.fileTxtID != undefined)) {
                    const fileNameArea = document.getElementById(this.fileTxtID) as HTMLInputElement;
                    fileNameArea.value = filename;
                }
                this.enablePlayButton(true);
            }
        }
        return file;
    }

    protected abstract setFileName(files: FileList | null | undefined): void;

    protected abstract showNextImage(): void;

    protected abstract rewind(): void;
}
