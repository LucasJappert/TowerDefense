export default class EscenaTextos extends Phaser.Scene{
    constructor(){
        super({key: "EscenaTextos"});
    }

    preload(){
        // console.log("preload EscenaTextos");
    }
    create(){
        //console.log("create EscenaTextos");
        var graphics = this.add.graphics();
        //graphics.lineStyle(2, 0xffffff, 1);
        graphics.fillStyle(0x111111, 2);

        //graphics.fillRect(100,100,200,200);
        this._TextoVidas = this.add.text(10, 10, "", {font: "24px Courier", fill: "#00FF00"});
        this.CambiarTextoVidas(200);

        this._TextoPuntaje = this.add.text(10, 30, "", {font: "24px Courier", fill: "#00FF00"});
        this.CambiarPuntaje(0);
        
        this._TextoMonedas = this.add.text(10, 50, "", {font: "24px Courier", fill: "#00FF00"});
        this.CambiarMonedas(1000);
        
    }
    update(time, delta){
        
    }

    CambiarTextoVidas(_Valor){
        this._TextoVidas.setText("Vidas: " + _Valor);
    }
    CambiarPuntaje(_Valor){
        this._TextoPuntaje.setText("Puntaje: " + _Valor);
        //this._Texto.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }
    CambiarMonedas(_Valor){
        this._TextoMonedas.setText("Monedas: " + _Valor);
        //this._Texto.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }
}

var _TextoVidas;