import EscenaRoEscenaMapaGlobalnda from "./EscenaMapaGlobal.js";
import EscenaRonda from "./EscenaRonda.js";
import EscenaGUI from "./EscenaGUI.js";
import EscenaResultadoRonda from "./EscenaResultadoRonda.js";
import * as Tools from './Modulos/Tools.js';


// var _THP = 13;

var _Config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        //autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'content',
    width: Tools._Pantalla.x * 64,
    // height: _Pantalla.y * 64 + 4 * 64,//13 mas 2 espacio en Top y 2 espacio en Bottom (para UI)
    height: Tools._Pantalla.y * 64,//2 espacio en Top y 2 espacio en Bottom (para UI)
    // backgroundColor: '#282219',
    backgroundColor: '#282219',
    physics: {
        default: 'arcade'
    },
    scene: [
        {create: create},
        EscenaRonda,
        EscenaGUI,
        EscenaResultadoRonda
    ] 
};


var _Game = new Phaser.Game(_Config);

function create(){
    resize();
    //Primero levantar la pantalla de Inicio
    //Larga el juego directamente
    this.scene.start("EscenaRonda", 1);
    //_Game.scale.startFullScreen(false);
    //window.addEventListener('resize', resize);
}

function resize() {
    var canvas = _Game.canvas, width = window.innerWidth, height = window.innerHeight;
    var wratio = width / height, ratio = canvas.width / canvas.height;

    if (wratio < ratio) {
        canvas.style.width = width + "px";
        canvas.style.height = (width / ratio) + "px";
    } else {
        canvas.style.width = (height * ratio) + "px";
        canvas.style.height = height + "px";
    }
}
                


                





