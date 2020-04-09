import * as Tools from './Modulos/Tools.js';

export default class EscenaResultadoRonda extends Phaser.Scene{
    constructor(){
        super({key: "EscenaResultadoRonda"});
    }
    preload(){
        this.load.atlas('AtlasResultadoRonda', './assets/AtlasResultadoRonda.png', './assets/AtlasResultadoRonda.json');
        this.load.atlas('SpritesGUI', './assets/SpritesGUI.png', './assets/SpritesGUI.json');
    }
    create(){
        this._Centro = new Phaser.Math.Vector2(this.sys.canvas.width/2, this.sys.canvas.height/2);
        this._PosBanner = new Phaser.Math.Vector2(this._Centro.x, this._Centro.y - 96);
        
        this._PixelNegro = this.add.sprite(0, 0, "AtlasResultadoRonda", "PixelNegro");
        this._PixelNegro.setOrigin(0).setVisible(false);
        this._PixelNegro.alpha = 0.7;
        this._PixelNegro.displayWidth = this.sys.canvas.width;
        this._PixelNegro.displayHeight = this.sys.canvas.height;
        
        this._Brillo = this.add.sprite(this._PosBanner.x, this._PosBanner.y, "AtlasResultadoRonda", "Brillo");
        this._Brillo.setVisible(false).setScale(4).setAlpha(1);
        this._Brillo1 = this.add.sprite(this._PosBanner.x, this._PosBanner.y, "AtlasResultadoRonda", "Brillo");
        this._Brillo1.setVisible(false).setScale(4).setAngle(180).setAlpha(0);
        
        this._SpriteWin = this.add.sprite(this._PosBanner.x, this._PosBanner.y, "AtlasResultadoRonda", "Win");
        this._SpriteWin.setOrigin(0.5).setVisible(false).setScale(1.2);
        this._SpriteLose = this.add.sprite(this._PosBanner.x, this._PosBanner.y, "AtlasResultadoRonda", "Lose");
        this._SpriteLose.setOrigin(0.5).setVisible(false).setScale(1.2);
        
        
    }
    MostrarResultado(_Vidas, _Nivel){
        //_Vidas = 9;
        this.scene.pause("EscenaRonda");
        this.scene.pause("EscenaGUI");
        var _Target = null;
        this._PixelNegro.setVisible(true);
        this._Brillo.setVisible(true);
        this._Brillo1.setVisible(true);
        var _EstrellasLlenas = 0;
        var _KeyEstrellas = ["EstrellaVacia", "EstrellaVacia", "EstrellaVacia"];
        if (_Vidas >= Tools._VidasMaximas){
            _EstrellasLlenas = 3;
            _KeyEstrellas = ["EstrellaLlena", "EstrellaLlena", "EstrellaLlena"];
        }else if (_Vidas >= Tools._VidasMaximas / 2){
            _EstrellasLlenas = 2;
            _KeyEstrellas = ["EstrellaLlena", "EstrellaLlena", "EstrellaVacia"];
        }else if (_Vidas > 0){
            _EstrellasLlenas = 1;
            _KeyEstrellas = ["EstrellaLlena", "EstrellaVacia", "EstrellaVacia"];
        }else{
            _EstrellasLlenas = 0;
        }
        if (_EstrellasLlenas > 0){
            this._SpriteWin.setVisible(true);
            _Target = this._SpriteWin;
        }else{
            this._SpriteLose.setVisible(true);
            _Target = this._SpriteLose;
        }
//         var _Tween = this.tweens.add({
//             targets: _Target,
//             y: _Target.y - 8,
//             ease: 'Sine.easeInOut',
//             duration: 1500,
//             repeat: -1,
//             yoyo: true,
//             onComplete:function(){
// //                _Escena.DesocuparTextoDaño(_Texto);
//             },
//         });
        var _Estrella1 = this.add.sprite(this._PosBanner.x - 90, this._PosBanner.y - 164, "AtlasResultadoRonda", _KeyEstrellas[0]);
        var _Estrella2 = this.add.sprite(this._PosBanner.x, this._PosBanner.y - 184, "AtlasResultadoRonda", _KeyEstrellas[1]);
        var _Estrella3 = this.add.sprite(this._PosBanner.x + 90, this._PosBanner.y - 164, "AtlasResultadoRonda", _KeyEstrellas[2]);
        _Estrella1.setAngle(-15).setScale(0.6);
        _Estrella2.setScale(0.8);
        _Estrella3.setAngle(15).setScale(0.6);

        var _Tween1 = this.tweens.add({
            targets: this._Brillo1,
            props: {
                alpha: { value: 1, duration: 1000, ease: 'Quad.easeInOut', repeat: -1, yoyo: true },
                // angle: { value: 180, duration: 15000, ease: 'Linear', repeat: -1 }
            }
        });
        var _Tween2 = this.tweens.add({
            targets: this._Brillo,
            props: {
                alpha: { value: 0, duration: 1000, ease: 'Quad.easeInOut', repeat: -1, yoyo: true }
            }
        });

        if (_EstrellasLlenas > 0){
            this._BotonMenu = this.add.sprite(this._PosBanner.x - 128, this._PosBanner.y + 184, "SpritesGUI", "BotonMenu1");
            this._BotonRestart = this.add.sprite(this._PosBanner.x, this._BotonMenu.y, "SpritesGUI", "BotonRestart");
            this._BotonNext = this.add.sprite(this._PosBanner.x + 128, this._BotonMenu.y, "SpritesGUI", "BotonNext");
        
            this._BotonNext.setScale(0.7).setInteractive({ cursor: 'pointer' });
        }else{
            this._BotonMenu = this.add.sprite(this._PosBanner.x - 64, this._PosBanner.y + 184, "SpritesGUI", "BotonMenu1");
            this._BotonRestart = this.add.sprite(this._PosBanner.x + 64, this._BotonMenu.y, "SpritesGUI", "BotonRestart");
            
        }
        this._BotonMenu.setScale(0.7).setInteractive({ cursor: 'pointer' });
        this._BotonRestart.setScale(0.7).setInteractive({ cursor: 'pointer' });
        this._BotonRestart.on('pointerup', () =>{ 
            this.scene.start("EscenaRonda", _Nivel); 
        });

    }
}



