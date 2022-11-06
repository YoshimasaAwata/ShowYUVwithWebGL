import { Events4Elements2D } from "./events4elements2d";

var canvas2D: Events4Elements2D | undefined;

addEventListener('DOMContentLoaded', init);

function init() {
    window.addEventListener('close', finalize);

    canvas2D = new Events4Elements2D();
}

function finalize() {
    if (canvas2D != undefined) {
        canvas2D.finalize();
        canvas2D = undefined;
    }
}
