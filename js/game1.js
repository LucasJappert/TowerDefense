import EscenaMain from "./EscenaMain.js";
import EscenaGUI from "./EscenaGUI.js";

var _Pantalla = new Phaser.Math.Vector2(11, 13);
// var _THP = 13;

var _Config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT
    },
    parent: 'content',
    width: _Pantalla.x * 64,
    height: _Pantalla.y * 64 + 4 * 64,//13 mas 2 espacio en Top y 2 espacio en Bottom (para UI)
    backgroundColor: '#282219',
    physics: {
        default: 'arcade'
    },
    scene: [
        {create: create},
        EscenaMain,
        EscenaGUI
    ] 
};


var _Game = new Phaser.Game(_Config);

function create(){
    //Primero levantar la pantalla de Inicio

    //Larga el juego directamente
    this.scene.launch("EscenaMain");
    
    //window.addEventListener('resize', resize);
    //resize();
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
                


                





