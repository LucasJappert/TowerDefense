export default class EscenaGUI extends Phaser.Scene{
    constructor(){
        super({key: "EscenaGUI"});
    }

    preload(){
        this.load.atlas('spritesGUI', 'assets/SpritesGUI.png', 'assets/SpritesGUI.json');
    }
    create(){
        var graphics = this.add.graphics();
        //graphics.lineStyle(2, 0xffffff, 1);
        //graphics.fillStyle(0x111111, 2);

        //graphics.fillRect(100,100,200,200);

        this.input.on('gameobjectdown', function (_Pointer, _Objeto) {
            ClickEnObjeto(this, _Pointer, _Objeto);
        });

        this._TextoPuntaje = this.add.text(70, 84, "", {font: "24px Tahoma", fill: "#FFFFFF"});
        this.CambiarPuntaje(0);
        
        this._TextoMonedas = this.add.text(70, 10, "", {font: "36px Tahoma", fill: "#FFFFFF"});
        this.CambiarMonedas(40);
        this._TextoVidas = this.add.text(70, 64, "", {font: "36px Tahoma", fill: "#FFFFFF"});
        this.CambiarTextoVidas(20);

        this._BotonMenu = NuevoSprite(this, "BotonMenu", new Phaser.Math.Vector2(11 * 64 - 74*0.5, 74*0.5), new Phaser.Math.Vector2(74, 74), true);
        this._BotonMenu.setData("BotonMenu", true);
        this._BotonSonido = NuevoSprite(this, "BotonSonido", new Phaser.Math.Vector2(11 * 64 - 64*0.5 - 5, 64*0.5 + 5 + 74), new Phaser.Math.Vector2(54, 54), true);
        this._ImagenMonedas = NuevoSprite(this, "Monedas", new Phaser.Math.Vector2(64*0.5, 64*0.5), new Phaser.Math.Vector2(64, 64), false);
        this._ImagenCorazon = NuevoSprite(this, "Corazon", new Phaser.Math.Vector2(64*0.5, 64*0.5 + 55), new Phaser.Math.Vector2(55, 55), false);
        CrearVentanaMenu(this);

        //this._BotonMenu = BotonInterface(this, "VentanaMenu", new Phaser.Math.Vector2(11 * 64 - 74*0.5, 74*0.5), new Phaser.Math.Vector2(74, 74));
    }
    update(time, delta){
        
    }

    CambiarTextoVidas(_Valor){
        this._TextoVidas.setText(_Valor);
    }
    CambiarPuntaje(_Valor){
        //this._TextoPuntaje.setText("Puntaje: " + _Valor);
        //this._Texto.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }
    CambiarMonedas(_Valor){
        this._TextoMonedas.setText(_Valor);
        //this._Texto.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }
}

var _TextoVidas;

function NuevoSprite(_Escena, _KeyTextura, _Posicion, _Dimensiones, _Interactive){
    var _S = _Escena.add.sprite(_Posicion.x, _Posicion.y, "spritesGUI", _KeyTextura);
    _S.setScale(_Dimensiones.x/_S.width, _Dimensiones.y/_S.height);
    if (_Interactive){
        _S.setInteractive({ cursor: 'pointer' });
    }
    return _S;
}
function ClickEnObjeto(_Escena, _Pointer, _Objeto){
    if(_Objeto.getData("BotonMenu")){
        //Muestro Ventana Menu
        MostrarVentanaMenu(_Escena.scene);
        _Escena.scene.scene.pause("EscenaMain");
    }
    else if(_Objeto.getData("TorreDefensa")){
    }
}
function CrearVentanaMenu(_Escena){
    var _Centro = new Phaser.Math.Vector2(_Escena.sys.canvas.width*0.5, _Escena.sys.canvas.height*0.5);
    _Escena._Contenedor = _Escena.add.container(_Centro.x, _Centro.y);

    var _Pos = new Phaser.Math.Vector2(0, 0);

    _Escena._VentanaMenu = NuevoSprite(_Escena, "VentanaMenu", _Pos, new Phaser.Math.Vector2(228, 314), false);
    _Escena._VentanaMenu.setScale(1);

    _Pos = new Phaser.Math.Vector2(0, -70);
    _Escena._BotonResume = NuevoSprite(_Escena, "BotonVentanaMenu", _Pos, new Phaser.Math.Vector2(384, 94), true);
    _Pos = new Phaser.Math.Vector2(0, 30);
    _Escena._BotonRestart = NuevoSprite(_Escena, "BotonVentanaMenu", _Pos, new Phaser.Math.Vector2(384, 94), true);
    _Pos = new Phaser.Math.Vector2(0, 130);
    _Escena._BotonExit = NuevoSprite(_Escena, "BotonVentanaMenu", _Pos, new Phaser.Math.Vector2(384, 94), true);
    
    _Escena._Contenedor.add(_Escena._VentanaMenu);
    _Escena._Contenedor.add(_Escena._BotonResume);
    _Escena._Contenedor.add(_Escena._BotonRestart);
    _Escena._Contenedor.add(_Escena._BotonExit);
    
    
    
    OcultarVentanaMenu(_Escena);
}
function OcultarVentanaMenu(_Escena){
    _Escena._Contenedor.setVisible(false);
    _Escena._Contenedor.setActive(false);
}
function MostrarVentanaMenu(_Escena){
    _Escena._Contenedor.setVisible(true);
    _Escena._Contenedor.setActive(true);
}
// function ImagenComun64(_Escena, _KeyTextura, _Posicion, _Dimensiones){
//     var _Image = _Escena.add.sprite(_Posicion.x, _Posicion.y, "spritesGUI", _KeyTextura);
//     _Image.setScale(_Dimensiones.x/_Image.width, _Dimensiones.y/_Image.height);
//     return _Image;
// }
// function ImagenComun64(_Escena, _KeyTextura, _Posicion, _Dimensiones){
//     var _Image = _Escena.add.sprite(_Posicion.x, _Posicion.y, "spritesGUI", _KeyTextura);
//     _Image.setScale(_Dimensiones.x/64, _Dimensiones.y/64)
//     return _Image;
// }