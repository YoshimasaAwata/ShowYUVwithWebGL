import { Events4Elements2D } from "./events4elements2d";
import { Events4ElementsGLRGB } from "./events4elementsglrgb";

var canvas2D: Events4Elements2D | undefined;
var canvasGLRGB: Events4ElementsGLRGB | undefined;

addEventListener('DOMContentLoaded', init);

function init() {
    window.addEventListener('close', finalize);

    canvas2D = new Events4Elements2D();
    canvasGLRGB = new Events4ElementsGLRGB();
}

function finalize() {
    if (canvas2D != undefined) {
        canvas2D.finalize();
        canvas2D = undefined;
    }
    if (canvasGLRGB != undefined) {
        canvasGLRGB.finalize();
        canvasGLRGB = undefined;
    }
}
