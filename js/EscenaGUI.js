import * as Tools from './Modulos/Tools.js';

export default class EscenaGUI extends Phaser.Scene{
    constructor(){
        super({key: "EscenaGUI"});
    }

    preload(){
        this.load.atlas('spritesGUI', './assets/SpritesGUI.png', './assets/SpritesGUI.json');
        //Tools.Ej1.Prueba1();
    }
    create(){
        var graphics = this.add.graphics();
        //graphics.lineStyle(2, 0xffffff, 1);
        //graphics.fillStyle(0x111111, 2);

        //graphics.fillRect(100,100,200,200);
        CrearFondoGUI(this);

        this.input.on('gameobjectdown', function (_Pointer, _Objeto) {
            ClickEnObjeto(this, _Pointer, _Objeto);
        });

        this._TextoPuntaje = this.add.text(70, 84, "", {font: "24px Tahoma", fill: "#FFFFFF"});
        this.CambiarPuntaje(0);
        
        this._PixelNegro = this.add.sprite(0, 0, "spritesGUI", "PixelNegro");
        this._PixelNegro.setOrigin(0).setVisible(false);
        this._PixelNegro.depth = 1;
        this._PixelNegro.alpha = 0.7;
        this._PixelNegro.displayWidth = this.sys.canvas.width;
        this._PixelNegro.displayHeight = this.sys.canvas.height;
        
        this._TextoMonedas = this.add.text(80, 20, "", {font: "30px Tahoma", fill: "#FFFFFF"});
        this._TextoMonedas.setOrigin(0);
        this.CambiarMonedas(0);
        this._TextoVidas = this.add.text(80, 60, "", {font: "30px Tahoma", fill: "#FFFFFF"});
        this._TextoMonedas.setOrigin(0);
        this.CambiarTextoVidas(20);
        this._TextoWaves = this.add.text(this.sys.canvas.width/2, Tools._TT-5, "Waves: 1/10", {font: "30px Tahoma", fill: "#FFFFFF"});
        this._TextoWaves.setOrigin(0.5);
        //this.CambiarTextoWaves("12122121");

        var _Dimen = new Phaser.Math.Vector2(74, 74);
        var _Pos = new Phaser.Math.Vector2(this.sys.canvas.width - _Dimen.x - 10, 10);
        this._BotonMenu = NuevoSprite(this, "BotonMenu", _Pos, _Dimen, true);
        this._BotonMenu.setOrigin(0);
        this._BotonMenu.setData("BotonMenu", true);
        var _Dimen = new Phaser.Math.Vector2(50, 50);
        var _Pos = new Phaser.Math.Vector2(this.sys.canvas.width - _Dimen.x - 10 - 12, 94);
        this._BotonSonido = NuevoSprite(this, "BotonSonido", _Pos, _Dimen, true);
        this._BotonSonido.setOrigin(0);
        this._BotonSonido.setData("IdBoton", "BotonSonido");
        this._ImagenMonedas = NuevoSprite(this, "Monedas", new Phaser.Math.Vector2(20, 10), new Phaser.Math.Vector2(50, 50), false);
        this._ImagenMonedas.setOrigin(0);
        this._ImagenCorazon = NuevoSprite(this, "Corazon", new Phaser.Math.Vector2(20, 55), new Phaser.Math.Vector2(50, 50), false);
        this._ImagenCorazon.setOrigin(0);
        CrearVentanaMenu(this);

        if (Tools._MuestroFPS){
            this._TextoFPS = this.add.text(10, 64*2-10, "FPS: 10", {font: "20px Tahoma", fill: "#FFFFFF"});
            this._TextoFPS.setOrigin(0);
            this.CambiarTextoFPS("FPS: 20");
        }

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
    CambiarTextoWaves(_Texto){
        this._TextoWaves.setText(_Texto);
        //this._Texto.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }
    CambiarTextoFPS(_Texto){
        this._TextoFPS.setText(_Texto);
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
function NuevoBoton(_Escena, _KeyTextura, _Posicion, _Dimensiones, _IdBoton, _Texto){
    var _S = _Escena.add.sprite(_Posicion.x, _Posicion.y, "spritesGUI", _KeyTextura);
    _S.setScale(_Dimensiones.x/_S.width, _Dimensiones.y/_S.height);
    _S.setInteractive({ cursor: 'pointer' });
    _S.setData("IdBoton", _IdBoton);
    _S._Texto = _Escena.add.text(_Posicion.x, _Posicion.y, _Texto, { font: '34px Arial' });
    _S._Texto.text = "asdasdasdssd";
    //_S._Texto.setOrigin(0.5);
    return _S;
}
function ClickEnObjeto(_Escena, _Pointer, _Objeto){
    if(_Objeto.getData("BotonMenu")){
        //Muestro Ventana Menu
        if(_Escena.scene._Contenedor._visible){
            OcultarVentanaMenu(_Escena.scene);
        }else{
            MostrarVentanaMenu(_Escena.scene);
        }
    }


    if(_Objeto.getData("IdBoton")){
        switch(_Objeto.getData("IdBoton")){
            case "Resume":
                OcultarVentanaMenu(_Escena.scene);
                break;
            case "Restart":
                _Escena.scene.scene.start("EscenaRonda");
                break;
            case "Exit":
                break;
            case "BotonSonido":
                MutearDesmutear(_Escena.scene, _Objeto);
                break;
        }
    }
}
function CrearFondoGUI(_Escena){
    var _Pos = new Phaser.Math.Vector2(0, 0);
    var _Dimen = new Phaser.Math.Vector2(14, _Escena.sys.canvas.height);
    _Escena._LeftBarGUI = NuevoSprite(_Escena, "VerticalBarGUI", _Pos, _Dimen, false);
    _Escena._LeftBarGUI.setOrigin(0);
    _Pos = new Phaser.Math.Vector2(_Escena.sys.canvas.width, 0);
    _Escena._RightBarGUI = NuevoSprite(_Escena, "VerticalBarGUI", _Pos, _Dimen, false);
    _Escena._RightBarGUI.setOrigin(0);
    _Escena._RightBarGUI.scaleX *= -1
    
    _Pos = new Phaser.Math.Vector2(_Escena.sys.canvas.width/2, 64);
    _Dimen = new Phaser.Math.Vector2(_Escena.sys.canvas.width, 128);
    _Escena._TopGUI = NuevoSprite(_Escena, "TopGUI", _Pos, _Dimen, false);
    
    // _Dimen = new Phaser.Math.Vector2(_Escena.sys.canvas.width, 109);
    // _Pos = new Phaser.Math.Vector2(0, _Escena.sys.canvas.height - _Dimen.y);
    // _Escena._BottomGUI = NuevoSprite(_Escena, "BottomGUI", _Pos, _Dimen, false);
    // _Escena._BottomGUI.setOrigin(0);
}
function CrearVentanaMenu(_Escena){
    var _Centro = new Phaser.Math.Vector2(_Escena.sys.canvas.width*0.5, _Escena.sys.canvas.height*0.5);
    _Escena._Contenedor = _Escena.add.container(_Centro.x, _Centro.y);
    _Escena._Contenedor.setSize(228, 314);

    var _Pos = new Phaser.Math.Vector2(0, 0);

    _Escena._VentanaMenu = NuevoSprite(_Escena, "VentanaMenu", _Pos, new Phaser.Math.Vector2(228, 314), false);
    _Escena._VentanaMenu.setScale(1);
    _Escena._Contenedor.add(_Escena._VentanaMenu);
    _Escena._Contenedor.depth = 1.1;
    _Escena._Contenedor.scale = 0;

    var _Texto = _Escena.add.text(0, -202, "MENU", { font: '34px Arial' });
    _Texto.setOrigin(0.5, 0);
    _Texto.setTint(0x000000);
    _Escena._Contenedor.add(_Texto);

    _Pos = new Phaser.Math.Vector2(0, -70);
    _Escena._BotonResume = NuevoBotonVentanaMenu(_Escena, _Pos, "Resume", "Resume");
    _Escena._BotonResume.setTint(0x999999);
    
    _Pos = new Phaser.Math.Vector2(0, 30);
    _Escena._BotonRestart = NuevoBotonVentanaMenu(_Escena, _Pos, "Restart", "Restart");
    _Escena._BotonRestart.setTint(0x999999);
    
    _Pos = new Phaser.Math.Vector2(0, 130);
    _Escena._BotonRestart = NuevoBotonVentanaMenu(_Escena, _Pos, "Exit", "Exit");
    _Escena._BotonRestart.setTint(0x999999);
    
    //_Escena._Contenedor.add([_Escena._BotonResume, _Escena._BotonRestart, _Escena._BotonExit, _Escena._VentanaMenu]);
    // _Escena._Contenedor.add(_Escena._BotonRestart);
    // _Escena._Contenedor.add(_Escena._BotonExit);
    
    //OcultarVentanaMenu(_Escena);
    _Escena._Contenedor.setVisible(false).setActive(false);
}
function OcultarVentanaMenu(_Escena){
    
    //_Escena._Contenedor.alpha = 0;
    var _Tween = _Escena.tweens.add({
        targets: _Escena._Contenedor,
        // alpha: 1,
        scale: 0,
        ease: 'Linear',
        duration: 200,
        onComplete:function(){
            _Escena._Contenedor.setVisible(false).setActive(false);
            _Escena.scene.resume("EscenaRonda");
            _Escena._PixelNegro.setVisible(false);
        },
    });
}
function MostrarVentanaMenu(_Escena){
    _Escena._Contenedor.setVisible(true).setActive(true);
    _Escena._PixelNegro.setVisible(true);
    var _Tween = _Escena.tweens.add({
        targets: _Escena._Contenedor,
        // alpha: 1,
        scale: 1,
        ease: 'Linear',
        duration: 200,
        onComplete:function(){
//                _Escena.DesocuparTextoDaño(_Texto);
        },
    });
    _Escena.scene.pause("EscenaRonda");
}
function MutearDesmutear(_Escena, _Objeto){
    var _EscenaRonda = _Escena.scene.get("EscenaRonda");
    if(_EscenaRonda.sound.mute){
        _EscenaRonda.sound.mute = false;
        _Objeto.clearTint();
    }else{
        _EscenaRonda.sound.mute = true;
        _Objeto.setTint(0x555555);
    }

    // if (_Escena.scale.isFullscreen)
    // {
    //     _Escena.scale.stopFullscreen();
    //     _Objeto.clearTint();
    // }
    // else
    // {
    //     _Escena.scale.startFullscreen();
    //     _Objeto.setTint(0x555555);
    // }
}


function NuevoBotonVentanaMenu(_Escena, _Posicion, _IdBoton, _Texto){
    var _D = new Phaser.Math.Vector2(250, 94);
    var _S = _Escena.add.sprite(_Posicion.x, _Posicion.y, "spritesGUI", "BotonVentanaMenu");
    _S.setScale(_D.x/_S.width, _D.y/_S.height);
    _S.setInteractive({ cursor: 'pointer' });
    _S.setData("IdBoton", _IdBoton);
    _Escena._Contenedor.add(_S);
    var _T = _Escena.add.text(_Posicion.x - 44, _Posicion.y - 20, _Texto, { font: '34px Arial' });
    _T.setOrigin(0);
    _T.setTint(0x000000);
    _Escena._Contenedor.add(_T);
    //_Texto.setTint(0x000000, 0x999999, 0xFF0000, 0x000000);
    var _NombreIcono = "BotonNext";
    if (_Texto == "Restart"){
        _NombreIcono = "BotonRestart";
    }else if (_Texto == "Exit"){
        _NombreIcono = "BotonMenu1";
    }
    var _S1 = _Escena.add.sprite(0 - _D.x/2 + 44, _S.y, "spritesGUI", _NombreIcono);
    _S1.setScale(54/_S1.width, 54/_S1.height);
    _Escena._Contenedor.add(_S1);
    return _S;
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