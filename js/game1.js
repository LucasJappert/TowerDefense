import EscenaMain from "./EscenaMain.js";
import EscenaTextos from "./EscenaTextos.js";

var _Config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 704,
    height: 512,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade'
    },
    scene: [
        {create: create},
        EscenaMain,
        EscenaTextos
    ] 
};


var _Game = new Phaser.Game(_Config);

function create(){
    //Primero levantar la pantalla de Inicio

    //Larga el juego directamente
    this.scene.launch("EscenaMain");
}
                


                





