import * as Tools from './Modulos/Tools.js';

//import Enemigo from "/js/Clases/Enemigo.js";
//import * as Enemigo from "/js/Clases/Prueba.js";

var _ClickDownEnObjeto = false;

//#region PROPIEDADES

var _Path;
var _Enemigos; var _Defensas; var _Proyectiles;
var _Vidas = 20;
var _Puntaje = 0;
var _Monedas = 0;
var _TamañoBotonTorres = new Phaser.Math.Vector2(112, 112);
var _MapaActual = null; var _TextosDaños = true;
//#endregion


export default class EscenaRonda extends Phaser.Scene{
    constructor(){
        super({key: "EscenaRonda"});
        this._FPS = 0;
        this._TiempoAux = 0;
    }

    preload() {   
        this.load.json('PathMapa1', './assets/Mapas/PathMapa1.json');
        this.load.spritesheet("Anims64x64", "./assets/Anims64x64.png", {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet("Explosion128", "./assets/Explosion.png", {frameWidth: 128, frameHeight: 128});
        this.load.atlas('spritesMain', './assets/spritesMain.png', './assets/spritesMain.json');
        this.load.audio("Disparo", "./assets/Audio/Disparo.wav");
        this.load.audio("DisparoFlecha", "./assets/Audio/DisparoFlecha.wav");
        this.load.audio("InicioBomba", "./assets/Audio/InicioBomba.mp3");
        this.load.audio("Coins", "./assets/Audio/Coins.mp3");
        this.load.audio("FinBomba", "./assets/Audio/FinBomba.mp3");
        this.load.audio("InicioHielo", "./assets/Audio/InicioHielo.mp3");
        this.load.audio("FinHielo", "./assets/Audio/FinHielo.mp3");
        this.load.audio("Electricidad", "./assets/Audio/Electricidad.mp3");
        this.load.audio("Muerte", "./assets/Audio/Muerte.wav");
        this.load.spritesheet("Atlas", "./assets/Atlas.png", {frameWidth: 256, frameHeight: 256});
        this.load.atlas('spritesGUI', './assets/SpritesGUI.png', './assets/SpritesGUI.json');

        Tools._IdMapas.forEach(_Id => {
            this.load.json("JsonMapa" + _Id, "./assets/Mapas/Mapa" + _Id + ".json");
            this.load.image("FondoMapa" + _Id, "./assets/Mapas/Mapa" + _Id + ".png");
        });

        Tools._IdEnemigos.forEach(_Id => {
            this.load.spritesheet("ImagenEnemy" + _Id, "assets/CaminataEnemy" + _Id + ".png", {frameWidth: 128, frameHeight: 106});
        });
        //this.load.animation('CaminataEnemigos', 'assets/CaminataEnemigos.json');
    }
    
    create(_Nivel) {
        this._Nivel = _Nivel;
        //this.physics.world.setFPS(1);
        // Tools._IdMapas.forEach(_Id => {
        //     _MapaActual = this.cache.json.get("JsonMapa" + _Id);
        //     var s = this.add.sprite(0, 0, "FondoMapa" + _Id);
        //     s.setOrigin(0);
        //     s.displayWidth = this.sys.canvas.width;
        //     s.displayHeight = this.sys.canvas.height;
        // });

        this.IniciarVariables();

        this.IniciarRonda();

        this.CrearAnimacionesVarias();

        this.CargarAnimacionesEnemigos();
               
        this._GraficaBase = this.add.graphics();

        this.DibujarCuadricula();
        this.ArmarPath();
        
        ArmarBotonesDefensas(this);

        _Enemigos = this.add.group({ classType: Enemigo, runChildUpdate: true });
        _Defensas = this.add.group({ classType: Defensa, runChildUpdate: true });
        _Proyectiles = this.add.group({ classType: _Proyectil, runChildUpdate: true });
        
        this.AudioDisparo = this.sound.add("Disparo", {volume: 0.01});
        this.AudioDisparoFlecha = this.sound.add("DisparoFlecha", {volume: 0.02});
        this.AudioMuerte = this.sound.add("Muerte", {volume: 0.2});
        this.AudioCoins = this.sound.add("Coins", {volume: 0.3});
        this.AudioInicioBomba = this.sound.add("InicioBomba", {volume: 0.04});
        this.AudioFinBomba = this.sound.add("FinBomba", {volume: 0.37});
        this.AudioInicioHielo = this.sound.add("InicioHielo", {volume: 0.5});
        this.AudioFinHielo = this.sound.add("FinHielo", {volume: 0.5});
        this.AudioElectricidad = this.sound.add("Electricidad", {volume: 0.04});

        this.scene.launch("EscenaGUI");
        this.scene.launch("EscenaResultadoRonda");

        this.registry.set("Monedas", _Monedas);
        
        //Hace que Enemigos y Proyectiles llamen a la funcion ProvocarDaño cuando colisionan.
        //this.physics.add.overlap(_Enemigos, _Proyectiles, ProvocarDaño);
        
        this.input.on('pointerdown', (pointer, _Objeto) => {
            if (_ClickDownEnObjeto == false){
                OcultarOpcionesDefensa(this);
            }
        });
        
        //  The pointer has to move 16 pixels before it's considered as a drag
        this.input.dragDistanceThreshold = 16;
        this.input.on('dragstart', function (pointer, _Objeto) {
            if (_Objeto.getData("TorreDefensa")){
                _Objeto.first.setTint(0x999999);
                _Objeto.next.destroy();//Remuevo el Costo (el texto)
                MostrarCuadrilla(this);
            }
        });
        this.input.on('drag', function (pointer, _Objeto, dragX, dragY) {
            _Objeto.x = pointer.x;
            _Objeto.y = pointer.y;
        });
        this.input.on('dragend', function (pointer, _Objeto) {
            if(_Objeto.getData("TorreDefensa")){
                if (ClickEnCuadricula(pointer)){
                    PlantarDefensa(this.scene, pointer, _Objeto._TipoTorre);
                    OcultarCuadrilla(this);
                }
            }
            _Objeto.destroy();
        });
        this.input.on('pointerup', function (pointer, _Objeto) {
            //PlantarDefensa(this, pointer);
            _ClickDownEnObjeto = false;
        });
        // this.registry.events.on("changedata", (parent, key, data) => {
        //     DatosActualizados(parent, key, data);
        // });
        this.registry.events.on("EnemigoDestruido", (_Enemigo) => {
            EnemigoDestruido(this, _Enemigo);
        });
        this.input.on('gameobjectdown', function (_Pointer, _Objeto) {
            _ClickDownEnObjeto = true;
            ClickEnObjeto(this, _Pointer, _Objeto);
        });

        //this.scale.startFullscreen();
        //this.scale.startFullscreen();
        //this.sound.mute = true;
    }
        
    update(time, delta) 
    {  
        
        this.AuxFPS(time);

        if (_Vidas > 0){
            ControladorOleadas(this, time);
        }
        else
        {
            //TODO - Game Over
            this.scene.get("EscenaResultadoRonda").MostrarResultado(_Vidas, this._Nivel);
        }    
    }
    DibujarCuadricula() {
        this._GraficaBase.lineStyle(1, 0x000000, 1);
        //Rayas verticales
        for(var i = 0; i <= Tools._Pantalla.x; i++) {
            this._GraficaBase.moveTo(i * 64, 64 * 2);
            this._GraficaBase.lineTo(i * 64, (Tools._Pantalla.y - 2) * 64);
        }
        //Rayas horizontales
        for(var j = 2; j <= Tools._Pantalla.y - 2; j++) {
            this._GraficaBase.moveTo(0, j * 64);
            this._GraficaBase.lineTo(11 * 64, j * 64);
        }
        this._GraficaBase.strokePath();
        this._GraficaBase.alpha = 0;
    }
    ArmarPath(){
        _Path = new Phaser.Curves.Path(this.cache.json.get('PathMapa1'));
        // _Path = this.add.path(-32, 64*3.5);
        // _Path.lineTo(64*8.5, 64*3.5);
        // _Path.ellipseTo(64, 64, 0, 180, false, -90);
        // _Path.lineTo(64*2.5, 64*5.5);
        // _Path.ellipseTo(64, 64, 0, 180, true, -90);
        // _Path.lineTo(64*8.5, 64*7.5);
        // _Path.ellipseTo(64, 64, 0, 180, false, -90);
        // _Path.lineTo(64*2.5, 64*9.5);
        // _Path.ellipseTo(64, 64, 0, -90, true, -90);
        // _Path.lineTo(64*1.5, 64*12.5);
        // _Path.ellipseTo(64, 64, 0, -180, true, 180);
        // _Path.ellipseTo(64, 64, 0, 90, false, 180);
        // _Path.lineTo(64*6.5, 64*11.5);
        // _Path.ellipseTo(64, 64, 0, 90, false, -90);
        // _Path.ellipseTo(64, 64, 0, -90, true, 180);
        // _Path.ellipseTo(64, 64, 0, 180, false, -90);
        // _Path.lineTo(64*2.5, 64*15.5);
        // _Path.ellipseTo(64, 64, 0, 180, true, -90);
        // _Path.lineTo(64*11.5, 64*17.5);
        //this._GraficaBase.lineStyle(2, 0xffffff, Tools._DepthAux);
        //_Path.draw(this._GraficaBase);
        //this._GraficaBase.alpha = 1;
    }
    IniciarVariables(){
        _Vidas = Tools._VidasMaximas;

        this.CrearContenedorInfoDefensas();
        
        this._TextosDaños = [];
        this._IdsTextosDañosLibres = [];
        for (let i = 0; i < 50; i++) {
            var _Texto = this.add.text(-100, -100, "222", {font: "28px Tahoma", fill: "#00DD00"});
            _Texto.setOrigin(0.5);
            _Texto.alpha = 0;    
            _Texto.depth = 2;
            _Texto.setData("ModX", Phaser.Math.Between(-20, 20));
            _Texto.setData("ModY", Phaser.Math.Between(1, 60));
            this._TextosDaños.push(_Texto);
            //_Texto.setData("Index", i);
            //this._IdsTextosDañosLibres.push(i);
        }

        this._AreaRango = Tools.t1.NuevoSpriteMain(this, "AreaRango", null, null, false);
        this._AreaRango.setActive(false).setVisible(false);
    }
    ObtenerTextoDañoLibre(){
        var _Retorno = null;
        if (this._TextosDaños.length > 0){
            _Retorno = this._TextosDaños[0];
            _Retorno.alpha = 1;
            this._TextosDaños.shift();
        }
        return _Retorno;
    }
    DesocuparTextoDaño(_Texto){
        this._TextosDaños.push(_Texto);
    }
    CrearContenedorInfoDefensas(){
        var _Fondo = this.add.sprite(0, 0, "spritesGUI", "FondoInfoDefensas");
        _Fondo.setOrigin(0.5);

        //Titulo
        var _ND = this.add.text(0, -112, "", {font: "26px Arial Black", fill: "#FFFFFF"});
        _ND.setOrigin(0.5);
        _ND.name = "TextoTitulo";
        
        //Información
        var _Aux = new Phaser.Math.Vector2(-170, -70);
        var _Txt1 = this.add.text(_Aux.x, _Aux.y, "- Damage: ", {font: "20px Arial Black", fill: "#BBBBBB"});
        var _Txt1a = this.add.text(_Aux.x + 120, _Aux.y, "", {font: "20px Arial Black", fill: "#BBBBBB"});
        _Txt1a.name = "Data1";
        _Aux.y += 25;
        var _Txt2 = this.add.text(_Aux.x, _Aux.y, "- Range: ", {font: "20px Arial Black", fill: "#BBBBBB"});
        var _Txt2a = this.add.text(_Aux.x + 100, _Aux.y, "", {font: "20px Arial Black", fill: "#BBBBBB"});
        _Txt2a.name = "Data2";
        _Aux.y += 25;
        var _Txt3 = this.add.text(_Aux.x, _Aux.y, "- Target: ", {font: "20px Arial Black", fill: "#BBBBBB"});
        var _Txt3a = this.add.text(_Aux.x + 100, _Aux.y, "", {font: "20px Arial Black", fill: "#BBBBBB"});
        _Txt3a.name = "Data3";
        _Aux.y += 25;
        var _Txt4 = this.add.text(_Aux.x, _Aux.y, "- A.S.: ", {font: "20px Arial Black", fill: "#BBBBBB"});
        var _Txt4a = this.add.text(_Aux.x + 75, _Aux.y, "ss", {font: "20px Arial Black", fill: "#BBBBBB"});
        _Txt4a.name = "Data4";

        //Boton Upgrade
        var _BotonUpgrade = this.add.sprite(-110, 100, "spritesGUI", "BotonUpgrade");
        _BotonUpgrade.setOrigin(0.5);
        _BotonUpgrade.setInteractive({ cursor: 'pointer' });
        _BotonUpgrade.name = "BotonUpgrade";
        _BotonUpgrade._Defensa = null;
        _BotonUpgrade.on('pointerup', () =>{ _BotonUpgrade._Defensa.Upgradear(this); });
        var _TextoUpgrade = this.add.text(-110 +5, 100, "100", {font: "18px Arial Black", fill: "#000000"});
        _TextoUpgrade.setOrigin(0.5);
        _TextoUpgrade.name = "TextoUpgrade";
        
        //Boton Sell
        var _BotonSell = this.add.sprite(110, 100, "spritesGUI", "BotonSell");
        _BotonSell.setOrigin(0.5);
        _BotonSell.setInteractive({ cursor: 'pointer' });
        _BotonSell.name = "BotonSell";
        _BotonSell._Defensa = null;
        _BotonSell.on('pointerup', () =>{ _BotonUpgrade._Defensa.Vender(this); });
        var _TextoSell = this.add.text(110 +5, 100, "50", {font: "18px Arial Black", fill: "#000000"});
        _TextoSell.setOrigin(0.5);
        _TextoSell.name = "TextoSell";

        var _Pos = new Phaser.Math.Vector2(this.sys.canvas.width / 2, this.sys.canvas.height / 2);
        var _El = [_Fondo, _Txt1, _Txt2, _Txt3, _Txt4, _Txt1a, _Txt2a, _Txt3a, _Txt4a, _BotonUpgrade, _TextoUpgrade, _BotonSell, _TextoSell, _ND];
        this._ContenedorInfoDefensas = this.add.container(_Pos.x, _Pos.y, _El);
        this._ContenedorInfoDefensas.setSize(384, 287);
        this._ContenedorInfoDefensas.setInteractive();
        // this._ContenedorInfoDefensas.setScale(1.3);
        this._ContenedorInfoDefensas.depth = 3;

        this._ContenedorInfoDefensas.setActive(false).setVisible(false);
    }
    MostrarActualizarContenedorInfoDefensa(_Defensa){
        var _BotonUpgrade = this._ContenedorInfoDefensas.getByName("BotonUpgrade")._Defensa;
        if (_Defensa._Info._Nivel < 3){
            this._ContenedorInfoDefensas.getByName("BotonUpgrade").setVisible(true).setActive(true);
            this._ContenedorInfoDefensas.getByName("TextoUpgrade").setVisible(true).setActive(true);
            this._ContenedorInfoDefensas.getByName("BotonUpgrade")._Defensa = _Defensa;
            this._ContenedorInfoDefensas.getByName("TextoUpgrade").text = _Defensa._Info._Costo * 2;
        }else{
            this._ContenedorInfoDefensas.getByName("BotonUpgrade").setVisible(false).setActive(false);
            this._ContenedorInfoDefensas.getByName("TextoUpgrade").setVisible(false).setActive(false);
            this._ContenedorInfoDefensas.getByName("BotonUpgrade")._Defensa = _Defensa;
            this._ContenedorInfoDefensas.getByName("TextoUpgrade").text = _Defensa._Info._Costo * 2;
        }

        if (_Defensa.y > this.sys.canvas.height / 2){
            this._ContenedorInfoDefensas.y = _Defensa.y - 64*2.5;
        }else{
            this._ContenedorInfoDefensas.y = _Defensa.y + 64*3;
        }

        // this._ContenedorInfoDefensas.getByName("BotonUpgrade")._Defensa = _Defensa;
        // this._ContenedorInfoDefensas.getByName("TextoUpgrade").text = _Defensa._Info._Costo * 2;
        this._ContenedorInfoDefensas.getByName("BotonSell")._Defensa = _Defensa;
        this._ContenedorInfoDefensas.getByName("TextoSell").text = Math.round(_Defensa._Info._Costo / 2);
        this._ContenedorInfoDefensas.getByName("Data1").text = _Defensa._Info._Daño.x + " - " + _Defensa._Info._Daño.y + " (" + Tools._TipoDaño.Prop[_Defensa._Info._TipoDaño]._Name + ")";
        this._ContenedorInfoDefensas.getByName("Data2").text = _Defensa._Info._RangoEnPix + " (" + (Math.round(_Defensa._Info._Rango * 10) / 10) + " tiles)";
        var _Rango = "Unique";
        if (_Defensa._Info._RadioImpacto > 0){_Rango = "AoE";}
        this._ContenedorInfoDefensas.getByName("Data3").text = _Rango;
        this._ContenedorInfoDefensas.getByName("Data4").text = Math.round(1000 / _Defensa._Info._AS* 10) / 10 + " (hits per second)";
        var _Titulo = _Defensa._Info._Title;
        if (_Defensa._Info._Nivel > 0){ _Titulo += " +" + _Defensa._Info._Nivel;}
        this._ContenedorInfoDefensas.getByName("TextoTitulo").text = _Titulo;
        this._ContenedorInfoDefensas.setActive(true).setVisible(true);
        this._ContenedorInfoDefensas.alpha = 0;
        

        var _Tween = this.tweens.add({
            targets: this._ContenedorInfoDefensas,
            alpha: 0.8,
            ease: 'Linear',
            duration: 200,
            onComplete:function(){
//                _Escena.DesocuparTextoDaño(_Texto);
            },
        });

        this._AreaRango.setScale((_Defensa._Info._RangoEnPix * 2) / 512);
        
    }
    OcultarContenedorInfoDefensa(){
        this._ContenedorInfoDefensas.setActive(false).setVisible(false);
    }
    CargarAnimacionesEnemigos(){
        Tools._IdEnemigos.forEach(_Id => {
            this.anims.create({
                key: "AnimCaminataEnemy" + _Id,
                frames: this.anims.generateFrameNumbers("ImagenEnemy" + _Id, { start: 0, end: 15 }),
                frameRate: 26,
                repeat: -1
            });
        });
    }
    CrearAnimacionesVarias(){
        this.anims.create({
            key: "ImpactoHielo",
            frames: this.anims.generateFrameNumbers("Anims64x64", { start: 35, end: 46 }),
            frameRate: 24,
            hideOnComplete: true
        });

        this.anims.create({
            key: "Sangrado",
            frames: this.anims.generateFrameNumbers("Anims64x64", { start: 64, end: 83 }),
            frameRate: 24,
            hideOnComplete: true
        });

        this.anims.create({
            key: "ProyectilHielo",
            frames: this.anims.generateFrameNumbers("Anims64x64", { start: 15, end: 22 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: "ProyectilFuego",
            frames: this.anims.generateFrameNumbers("Anims64x64", { start: 23, end: 30 }),
            frameRate: 16,
            repeat: -1
        });
        this.anims.create({
            key: "ProyectilMagico",
            frames: this.anims.generateFrameNumbers("Anims64x64", { start: 32, end: 35 }),
            frameRate: 16,
            repeat: -1
        });
        
        this.anims.create({
            key: "Explosion128",
            frames: this.anims.generateFrameNumbers("Explosion128", { start: 0, end: 39 }),
            frameRate: 64,
            hideOnComplete: true
        });
        //Muerte sonido bajar - Eliminar slot torre eliminada
        this._TweenRango = this.tweens.add({
            targets: this._AreaRango,
            angle: 360,
            ease: "Linear",
            duration: 10000,
            repeat: -1
        });
    }
    IniciarRonda(){
        _Monedas = 0;
        _MapaActual = this.cache.json.get("JsonMapa" + this._Nivel);
        this._SpriteFondoMapa = this.add.sprite(0, 0, "FondoMapa" + this._Nivel);
        this._SpriteFondoMapa.setOrigin(0);
        this._SpriteFondoMapa.displayWidth = this.sys.canvas.width;
        this._SpriteFondoMapa.displayHeight = this.sys.canvas.height;
        this._SpriteFondoMapa.depth = 0;
        _MapaActual._Arboles.forEach(_Arbol => {
            var _Pos = new Phaser.Math.Vector2((_Arbol.x - 0.5) * Tools._TT, _Arbol.y * Tools._TT - 10);
            var s = this.add.sprite(_Pos.x, _Pos.y, "spritesMain", _Arbol._Key);
            s.depth = DepthSegunPosicion(_Pos.x, _Pos.y);
            s.setScale(0.7);
            s.setOrigin(0.5, 1);
            OcuparCuadricula(_Arbol.x,_Arbol.y-2);
        });
        _OleadaVencida = true;
        _EstadoOleadas = ""; _ProximoACrear;
        _EnemigosCreados = 0; _BossesCreados = 0; _AuxMultiploBoss = 0;
        _OleadaActual = 1;
        // console.log(_MapaActual._TilesOcupados);
        // console.log(_MapaActual._TilesOcupados[2]);
        // console.log(_MapaActual._TilesOcupados.includes("22, 4"));
    }
    AuxFPS(time){
        if (Tools._MuestroFPS == false){return;}
        this._FPS += 1;
        if (this._TiempoAux < time){
            this.scene.get("EscenaGUI").CambiarTextoFPS("FPS: " + this._FPS);
            this._TiempoAux = time + 1000;
            this._FPS = 0;
        }
    }

    static asdasd(){
        console.log("static asdasd");
    }
}

//#region ENUMERADORES
//#endregion

//#region CLASES

    //#region Enemigo
var Enemigo = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:

    function Enemigo (scene, _IdEnemigo, _EsBoss)
    {
        //Propiedades comunes de todos
        Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'spritesMain', 'enemy');
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
        this._CircleHitArea = new Phaser.Geom.Circle(this.x, this.y, 32);
        this._AjusteRandomTop = Phaser.Math.Between(-10, 10);
        this._VidasRestadas = 1;

        this.setOrigin(0.5, 0.9);

        //Propiedades caracteristicas
        this._Info = new Tools.InfoEnemigo(_IdEnemigo);
        this._EsBoss = _EsBoss;

        this.CalcularVelocidadActual();
        this.anims.play("AnimCaminataEnemy" + _IdEnemigo);

        this._EscudoBosses = null;

        if (this._EsBoss){
            this._Info._VidaTotal *= 5;
            this._Info._VidaActual = this._Info._VidaTotal;
            this.setScale(-0.6, 0.6);
            this._EscudoBosses = this.scene.add.sprite(this.x, this.y, "spritesMain", "EscudoBosses");
            this._EscudoBosses.setOrigin(0, 0.45);
            this._EscudoBosses.setScale(0.25, 0.25);
            this._VidasRestadas = 2;
        }else{
            this.setScale(-0.5, 0.5);
        }

        this.startOnPath();
    },
    startOnPath: function ()
    {
        this.follower.t = 0;
        _Path.getPoint(this.follower.t, this.follower.vec);
        
        this.setPosition(this.follower.vec.x, this.follower.vec.y);            
    },
    receiveDamage: function(_Proyectil) {
        if (!this.scene){return;}
        var _Daño = Phaser.Math.Between(_Proyectil._Info._Daño.x, _Proyectil._Info._Daño.y);
        //Math.floor(Math.random() * 100);
        //Math.floor(Math.random() * (max - min + 1) ) + min
        
        TextoAnimado(this.scene, this.x, this.y - Tools._TT, _Daño);

        this._Info._VidaActual -= _Daño;
        if(this._Info._VidaActual <= 0) {
            Tools.t1.ReproducirAudio(this.scene.AudioMuerte, true);
            //new Sangrado(this.scene, this.x, this.y, 32);
            new NuevaAnimacion(this.scene, this.x, this.y-30, 
                new Phaser.Math.Vector2(64, 64), new Phaser.Math.Vector2(64, 64), 
                "Anims64x64", "Sangrado", 0);
            this.scene.registry.events.emit("EnemigoDestruido", this); 
            this._Info._VidaActual = 0;
        }else{
            this._Info._AnchoBarraVida = (this._Info._VidaActual/this._Info._VidaTotal) * Tools._TT;
            if(this._Info._BarraVidaVisible == false){
                this._Info._BarraVidaVisible = true;
                this._Info._BarraNegra = this.scene.add.sprite(this.x - (64+4)/2, this.y - 50, "spritesMain", "BarraBlanca");
                this._Info._BarraNegra.setTint(0x000000);
                this._Info._BarraNegra.setOrigin(0, 0);
                this._Info._BarraNegra.setScale((64+4)/128, 8);
    
                this._Info._BarraVida = this.scene.add.sprite(this.x - 64/2, this._Info._BarraNegra.y + 2, "spritesMain", "BarraVida");
                // if (this._EsBoss){ this._Info._BarraVida.setTint(0xFF7777); }
                this._Info._BarraVida.setOrigin(0, 0);
                this._Info._BarraVida.setScale(this._Info._AnchoBarraVida/128, 4);
            }
            this._Info._BarraVida.scaleX = this._Info._AnchoBarraVida/128;

            if (_Proyectil._Info._ValorRalentizacion > 0){
                var _Tiempo = this.scene.time.now + _Proyectil._Info._TiempoRalentizacion;
                this._Info._ModificadoresVelocidad.push(new ModificadorTemporal(-_Proyectil._Info._ValorRalentizacion, _Tiempo));
            }
        }

    },
    update: function (time, delta)
    {
        this.depth = (this.y * 1000 + this.x + this._Info._IdEnemigo * Tools._TT) / 1000000;
        if (this._Info._BarraNegra != null){
            this._Info._BarraNegra.depth = this.depth;
            this._Info._BarraVida.depth = this.depth;
        }
        this.CalcularVelocidadActual();
        this.follower.t += this._Info._VelocidadActual * delta;
        _Path.getPoint(this.follower.t, this.follower.vec);

        // this.scene.pause();
        if(this.x < this.follower.vec.x){
            if (this.scaleX < 0){
                this.scaleX *= -1;
            }
        }else{
            if(this.scaleX > 0){
                this.scaleX *= -1;
            }
        }

        this.ActualizarPosicion(this.follower.vec.x, this.follower.vec.y);
        this.DibujarBarraVida();
        this.DibujarAnimacionesVarias();

        //Evento cuando un Enemigo llega a Base
        if (this.follower.t >= 1 && this._Info._VidaActual > 0){
            EnemigoLlegaABase(this.scene, this._VidasRestadas);
        }
        //Elimino el Enemigo
        if (this.follower.t >= 1 || this._Info._VidaActual <= 0)
        {
            if(this._Info._BarraVidaVisible){
                this.DestroyAll();
            }
            _Enemigos.remove(this, true, true);
        }
    },
    DibujarBarraVida: function(){
        if(this._Info._BarraVidaVisible){
            this._Info._BarraNegra.setPosition(this.x - (64+4)/2, this.y - 70);
            this._Info._BarraVida.setPosition(this.x - 64/2, this._Info._BarraNegra.y + 2);
        }
    },
    CalcularVelocidadActual(){
        var _Aux = this._Info._VelocidadNormal;
        if (this._Info._ModificadoresVelocidad.length > 0){
            var _ArrayAux = [];
            for (let i = 0; i < this._Info._ModificadoresVelocidad.length; i++) {
                if (this._Info._ModificadoresVelocidad[i]._TiempoCaduca > this.scene.time.now){
                    _Aux += this._Info._ModificadoresVelocidad[i]._Valor;
                    //Mantengo el buff
                    _ArrayAux.push(this._Info._ModificadoresVelocidad[i]);
                }else{
                    //Al no hacer nada, se elimina el buff
                }
            }
            this._Info._ModificadoresVelocidad = _ArrayAux;
        }

        //Controlo velocidad minima y maxima, y recalculo...
        if (_Aux <= this._Info._VelocidadMinima){
            _Aux = this._Info._VelocidadMinima;
        }else if (_Aux > this._Info._VelocidadMaxima){
            _Aux = this._Info._VelocidadMaxima;
        }
        this._Info._VelocidadActual = (_Aux / 100) / 10000;
    },
    MonedasDropeadasAlMorir(){
        //var _Retorno = this._Info._Nivel * 3;
        var _Retorno = 1;
        if (this._EsBoss){ _Retorno *= 10; }
        return _Retorno;
    },
    DibujarAnimacionesVarias(){
        if (this._EscudoBosses){
            this._EscudoBosses.depth = (this.y * 1000 + this.x + this._Info._IdEnemigo * Tools._TT + 1) / 1000000;
            this._EscudoBosses.setPosition(this.x - 64/2, this.y - 64/2);
        }
    },
    DestroyAll(){
        if (this._Info._BarraNegra){
            this._Info._BarraNegra.destroy();
            this._Info._BarraVida.destroy();
        }
        if (this._EscudoBosses){
            this._EscudoBosses.destroy();
        }
    },
    ActualizarPosicion(x, y){
        this.setPosition(x, y + this._AjusteRandomTop);
        this._CircleHitArea.x = x;
        this._CircleHitArea.y = y;
    }

});
//#endregion

    //#region Defensa
var Defensa = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Defensa (_Escena, _TipoTorre)
    {
        this._PixCorrector = Tools._TT * 0.6;
        var _Nombre = Tools.EnumTipoTorre.Prop[_TipoTorre]._Name;
        Phaser.GameObjects.Image.call(this, _Escena, 0, 0, 'spritesMain', _Nombre);
        this.setInteractive({ cursor: 'pointer' });
        this.setScale(1/128 * 128);
        this.input.hitArea.setTo(32, 32 + this._PixCorrector, 64, 64);
        this.setData("Defensa", true);
        this._Info = new Tools.InfoTorre(_TipoTorre);
        this._UltimoDisparo = 0;
        this._PosEnCuadricula = new Phaser.Math.Vector2(0, 0);
        _Escena.add.existing(this);
    },
    place: function(x, y) {  
        this.x = x * Tools._TT - Tools._TT / 2;
        this.y = (y + 2) * Tools._TT - Tools._TT / 2 - this._PixCorrector;
        this._PosEnCuadricula = new Phaser.Math.Vector2(x, y);

        OcuparCuadricula(this._PosEnCuadricula.x, this._PosEnCuadricula.y);
    },
    IntentarDisparo: function(time) {
        var _Disparo = false;
        if(time > this._UltimoDisparo + this._Info._AS){
            var _Enemigo = ObtenerEnemigo(this.x, this.y + this._PixCorrector, this._Info._RangoEnPix);
            if(_Enemigo) {
                var angle = Phaser.Math.Angle.Between(this.x, this.y, _Enemigo.x, _Enemigo.y);
                NuevoProyectil(this.x, this.y, angle, _Enemigo, this);
                //this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;
                if (this._Info._TipoTorre == 1){
                    Tools.t1.ReproducirAudio(this.scene.AudioDisparoFlecha, true);
                }
                else if (this._Info._TipoTorre == 2){
                    Tools.t1.ReproducirAudio(this.scene.AudioElectricidad, true);
                }
                else if (this._Info._TipoTorre == 3){
                    Tools.t1.ReproducirAudio(this.scene.AudioInicioBomba, true);
                }
                else if (this._Info._TipoTorre == 4){
                    Tools.t1.ReproducirAudio(this.scene.AudioInicioHielo, true);
                }
                else{
                    Tools.t1.ReproducirAudio(this.scene.AudioDisparo, true);
                }
                _Disparo = true;
                this._UltimoDisparo = time;
            }
        }
        return _Disparo;
    },
    update: function (time, delta)
    {
        this.depth = (this.y * 1000 + this.x) / 1000000;
        this.IntentarDisparo(time);
    },
    Upgradear: function(_Escena){
        if (this._Info._Nivel < 3){
            if (_Monedas >= this._Info._Costo*2){
                this._Info._Nivel += 1;
                this._Info._Costo *= 2;
                this._Info.ActualizarRango(this._Info._Rango + 0.25);
                this._Info._Daño = new Phaser.Math.Vector2(this._Info._Daño.x*2, this._Info._Daño.y*2);
                this._Info._Daño.x = Math.round(this._Info._Daño.y * 0.8);
                _Escena.MostrarActualizarContenedorInfoDefensa(this);
                SumarMonedas(_Escena, -this._Info._Costo, false);
                var _NuevoTextura = Tools.EnumTipoTorre.Prop[this._Info._TipoTorre]._Name + (this._Info._Nivel-1);
                this.setTexture("spritesMain", _NuevoTextura);
            }
        }
    },
    Vender: function(_Escena){
        SumarMonedas(_Escena, Math.round(this._Info._Costo / 2), true);
        _Defensas.remove(this, true, true);
        OcultarOpcionesDefensa(_Escena);
        DesocuparCuadricula(this._PosEnCuadricula.x, this._PosEnCuadricula.y);
        //this.destroy();//
    }
});
//#endregion

    //#region Proyectil
var _Proyectil = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Bullet (scene, _InfoDefensa)
    {
        this._Info = _InfoDefensa;
        Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'spritesMain', this._Info._KeyProyectil);
        this.depth = 2;
        this.InicioX = 0;
        this.InicioY = 0;
        this.RecorridoTotal = 0;
        this.speed = this._Info._VelocidadDelProyectil;
        this._TipoDisparo = 1;
        this._EnemigoDestino = null;

        if (this._Info._TipoTorre == 2){
            this.anims.play("ProyectilMagico");
            this.setScale(3, 1.5);
        }
        else if (this._Info._TipoTorre == 3){
            this.anims.play("ProyectilFuego");
            //this.setScale(1, 1);
        }
        else if (this._Info._TipoTorre == 4){
            this.anims.play("ProyectilHielo");
            //this.setScale(1, 1);
        }
    },

    DisparoEnZona: function (x, y, angle, _Enemigo)// _Finx, _FinY)
    {
        this.setActive(true);
        this.setVisible(true);
        //  Bullets fire from the middle of the screen to the given x/y
        this.setPosition(x, y);
        this.InicioX = x;
        this.InicioY = y;
        this.FinX = _Enemigo.x;
        this.FinY = _Enemigo.y;
        this.RecorridoTotal = Phaser.Math.Distance.Between(x, y, this.FinX, this.FinY);
        this._EnemigoDestino = _Enemigo;
        
    //  we don't need to rotate the bullets as they are round
    //    this.setRotation(angle);
        this.setRotation(angle);

        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
    },
    DisparoAObjetivo: function (x, y, angle, _Enemigo){
        this._TipoDisparo = 2;
    },

    update: function (time, delta)
    {
        if(this._TipoDisparo == 2){
            //Recalculo angulo y recorridoFinal

        }

        this.x += this.dx * (this.speed * delta);
        this.y += this.dy * (this.speed * delta);

        var _RecoActual = Phaser.Math.Distance.Between(this.InicioX, this.InicioY, this.x, this.y);
        if (this.RecorridoTotal < _RecoActual)
        {
            this.RecorridoFinalizado();
            this.destroy();
        }
    },
    RecorridoFinalizado: function(){
        if (this._Info._TipoTorre == 3){
            new NuevaAnimacion(this.scene, this.x, this.y, 
                new Phaser.Math.Vector2(128, 128), new Phaser.Math.Vector2(96, 96), 
                "Explosion128", "Explosion128", ((this.y * 1000 + this.x + 1) / 1000000));
                Tools.t1.ReproducirAudio(this.scene.AudioFinBomba, true);
            //this.scene.AudioFinBomba.play()
        }
        else if (this._Info._TipoTorre == 4){
            new NuevaAnimacion(this.scene, this.x, this.y, 
                new Phaser.Math.Vector2(64, 64), new Phaser.Math.Vector2(128, 128), 
                "Atlas64x64", "ImpactoHielo", ((this.y * 1000 + this.x + 1) / 1000000));
            Tools.t1.ReproducirAudio(this.scene.AudioFinHielo, true);
        }

        if (this._Info._RadioImpacto > 0){
            var _Ens = _Enemigos.getChildren();
            var _CircleProy = new Phaser.Geom.Circle(this.x, this.y, 8 + this._Info._RadioImpacto);
            var _Aux = 1;
            for(var i = 0; i < _Ens.length; i++) {
                if (_Aux >= this._Info._MaximoTargets) { break; }
                if (Phaser.Geom.Intersects.CircleToCircle(_Ens[i]._CircleHitArea, _CircleProy)){
                    ProvocarDaño(_Ens[i], this);
                    _Aux+=1;
                }
            }
            //console.log(_Aux);
        }else if (this._EnemigoDestino){
            ProvocarDaño(this._EnemigoDestino, this);
        }
    }

});
//#endregion

//#endregion

//#region BOTONES
function ArmarBotonesDefensas(_Escena){
    var _Dimen = new Phaser.Math.Vector2(_Escena.sys.canvas.width, 109);
    var _Pos = new Phaser.Math.Vector2(0, _Escena.sys.canvas.height - _Dimen.y);
    _Escena._BottomGUI = SpriteGUI(_Escena, "FondoBottom", _Pos, _Dimen, false);
    _Escena._BottomGUI.setOrigin(0);

    var _Top = (Tools._Pantalla.y-1)*64;
    NuevoBotonConTexto(_Escena, Tools.EnumTipoTorre.TorreDeArqueros, 16 + _TamañoBotonTorres.x*0.5 + (_TamañoBotonTorres.x) * 0, _Top, _TamañoBotonTorres);
    NuevoBotonConTexto(_Escena, Tools.EnumTipoTorre.TorreDeCristal, 16 + _TamañoBotonTorres.x*0.5 + (_TamañoBotonTorres.x) * 1, _Top, _TamañoBotonTorres);
    NuevoBotonConTexto(_Escena, Tools.EnumTipoTorre.TorreMagica, 16 + _TamañoBotonTorres.x*0.5 + (_TamañoBotonTorres.x) * 2, _Top, _TamañoBotonTorres);
    NuevoBotonConTexto(_Escena, Tools.EnumTipoTorre.TorreBombardera, 16 + _TamañoBotonTorres.x*0.5 + (_TamañoBotonTorres.x) * 3, _Top, _TamañoBotonTorres);
}
//#endregion

//#region FUNCIONES

//  #region VARIAS

function MostrarCuadrilla(_Escena){
    _Escena.scene._GraficaBase.alpha = 0.3;
}
function OcultarCuadrilla(_Escena){
    _Escena.scene._GraficaBase.alpha = 0;
}
function OcuparCuadricula(x, y){
    var _Key = x + ", " + y;
    _MapaActual._TilesOcupados.push(_Key);
}
function DesocuparCuadricula(x, y){
    var _Key = x + ", " + y;
    _MapaActual._TilesOcupados = _MapaActual._TilesOcupados.filter(function(item) {
        return item !== _Key;
    });
}
function DepthSegunPosicion(x, y){
    return (y * 1000 + x) / 1000000;
}
function TextoAnimado(_Escena, _x, _y, _t){
    //Corregir porque causa freeze al haber muchos
    //return;

    if(_TextosDaños == false){return;}
    var _Texto = null;
    try {
        _Texto = _Escena.ObtenerTextoDañoLibre();
    } catch (error) {
        console.log(error);
        console.log(_Escena);
        adadad
    }
    if (_Texto != null){
        _Texto.text = _t;
        _Texto.x = _x + _Texto.getData("ModX");
        _Texto.y = _y;// - _Texto.getData("ModY");
        var _Tween = _Escena.tweens.add({
            targets: _Texto,
            y: _Texto.y - Tools._TT/3,
            alpha: 0,
            ease: 'Sine.easeInOut',
            duration: Phaser.Math.Between(100, 1000),
            onComplete:function(){
                _Escena.DesocuparTextoDaño(_Texto);
            },
        });
    }
    // _Texto.setOrigin(0.5);
    // _Texto.alpha = 1;
    //_Tween.play();
}
function SpriteGUI(_Escena, _KeyTextura, _Posicion, _Dimensiones, _Interactive){
    var _S = _Escena.add.sprite(_Posicion.x, _Posicion.y, "spritesGUI", _KeyTextura);
    _S.setScale(_Dimensiones.x/_S.width, _Dimensiones.y/_S.height);
    if (_Interactive){
        _S.setInteractive({ cursor: 'pointer' });
    }
    return _S;
}
function ObtenerEnemigo(x, y, distance) {
    var _Ens = _Enemigos.getChildren();
    for(var i = 0; i < _Ens.length; i++) {    
        if(_Ens[i].active && Phaser.Math.Distance.Between(x, y, _Ens[i].x, _Ens[i].y) <= distance){
            return _Ens[i];
        }
    }
    return false;
} 
function ProvocarDaño(enemy, _Proyectil) {  
    //if (enemy.active && _Proyectil.active) {
        enemy.receiveDamage(_Proyectil);
    //}
}
function PlantarDefensa(_Escena, _PuntoClickeado, _Tipo) {
    _PuntoClickeado.y -= Tools._TT * 2;
    var y = Math.floor(_PuntoClickeado.y / Tools._TT) + 1;
    var x = Math.floor(_PuntoClickeado.x / Tools._TT) + 1;
    if(LugarPermitidoDefensa(x, y)) {
        var _InfoDefensa = new Tools.InfoTorre(_Tipo);
        if(_Monedas >= _InfoDefensa._Costo){
            var _NuevaDefensa = new Defensa(_Escena, _Tipo);
            //var _NuevaDefensa = _Defensas.get();
            if (_NuevaDefensa)
            {
                _NuevaDefensa.place(x, y);
                _Defensas.add(_NuevaDefensa);
                SumarMonedas(_Escena, -_NuevaDefensa._Info._Costo, false);
            }   
        }
    }
}
function ClickEnCuadricula(_PuntoClickeado){
    if (_PuntoClickeado.y > Tools._TT * 2 && _PuntoClickeado.y < Tools._TT * (Tools._Pantalla.y - 2)){
        return true;
    }
    return false;
}
function ClickEnObjeto(_Parent, _Pointer, _Objeto){
    if(_Objeto.getData("Defensa")){
        MostrarOpcionesDefensa(_Parent.scene, _Objeto);
    }else{
        //Caso Upgradear Torre
        if (!_Objeto._Defensa){
            OcultarOpcionesDefensa(_Parent.scene, _Objeto);
        }
    }
    if(_Objeto.getData("TorreDefensa")){
        NuevoBotonConTexto(_Parent.scene, _Objeto._TipoTorre, _Objeto.x, _Objeto.y, _TamañoBotonTorres);
        _Objeto.getAt(0).setTexture("spritesMain", Tools.EnumTipoTorre.Prop[_Objeto._TipoTorre]._Name);
    }

}
function LugarPermitidoDefensa(x, y) {
    var _Retorno = true;

    if (!(x >= 1 && x <= Tools._Pantalla.x) || !(y >= 1 && y <= Tools._Pantalla.y)){ return false; }
    
    if (_MapaActual._TilesOcupados.includes(x + ", " + y)) { return false; }
    
    return _Retorno;
}
function NuevoProyectil(x, y, angle, _Enemigo, _Defensa) {
    var _Proyectil = _Proyectiles.get(_Defensa._Info);
    if (_Proyectil)
    {
        _Proyectil.DisparoEnZona(x, y, angle, _Enemigo);
    }
}
function EnemigoLlegaABase(_Parent, _VidasRestadas){
    _Vidas -= _VidasRestadas;
    _Parent.scene.get("EscenaGUI").CambiarTextoVidas(_Vidas);
}
function EnemigoDestruido(_Parent, _Enemigo){
    _Puntaje += _Enemigo._Puntaje;
    _Parent.scene.get("EscenaGUI").CambiarPuntaje(_Puntaje);
    SumarMonedas(_Parent, _Enemigo.MonedasDropeadasAlMorir(), false);
}
function DatosActualizados(_Escena, _Key, _Data){
    if (_Key == "Monedas"){
        _Escena.scene.get("EscenaGUI").CambiarMonedas(_Data);
    }
}
function SumarMonedas(_Parent, _Valor, _Sonido){
    _Monedas += _Valor;
    if (_Monedas < 0) {_Monedas = 0;}
    //_Parent.registry.set("Monedas", _Monedas);
    DatosActualizados(_Parent, "Monedas", _Monedas);
    if (_Valor > 0 && _Sonido){
        Tools.t1.ReproducirAudio(_Parent.AudioCoins, true);
    }
}
function MostrarOpcionesDefensa(_Escena, _Defensa){
    var _Area = _Escena._AreaRango;
    _Area.setPosition(_Defensa.x, _Defensa.y + _Defensa._PixCorrector);
    _Area.setActive(true).setVisible(true);
    _Area.setScale((_Defensa._Info._RangoEnPix * 2) / 512);
    if (_Defensa._Info._TipoTorre == 1){
        _Area.setTint(0x003300);
    }
    else if (_Defensa._Info._TipoTorre == 3){
        _Area.setTint(0x330000);
    }
    else if (_Defensa._Info._TipoTorre == 4){
        _Area.setTint(0x003333);
    }
    else{
        _Area.setTint(0x330033);
    }
    var _PosFondo = new Phaser.Math.Vector2(_Escena.sys.canvas.width / 2, 140);
    if (_Defensa.y < _Escena.sys.canvas.height / 2){
        _PosFondo.y = _Escena.sys.canvas.height - 300;
    }
    _Escena.MostrarActualizarContenedorInfoDefensa(_Defensa);
    //_Area.play("AreaRango");
}
function OcultarOpcionesDefensa(_Escena){
    var _Area = _Escena.scene.scene._AreaRango;
    _Area.setActive(false).setVisible(false);
    _Escena.OcultarContenedorInfoDefensa();
}
function GenerarExplosion(_Escena, x, y, _Radio){
    new Explosion(_Escena, x, y, _Radio);
}
function NuevoBotonConTexto(_Escena, _TipoTorre, x, y, _Dim){
    var _Boton = _Escena.add.sprite(0, 0, "spritesMain", Tools.EnumTipoTorre.Prop[_TipoTorre]._NameBoton);
    _Boton.setScale(_Dim.x/128, _Dim.y/128)

    var _Costo = new Tools.InfoTorre(_TipoTorre)._Costo;
    var _Texto = _Escena.add.text(6, 38, _Costo, {font: "20px Tahoma", fill: "#FFFF00"});
    _Texto.setOrigin(0.5);


    var _Container = _Escena.add.container(x, y, [_Boton, _Texto]);//
    _Container.setSize(_Dim.x, _Dim.y);
    _Container._TipoTorre = _TipoTorre; 
    _Container.setData("TorreDefensa", true);
    //_Container.add(_Boton);
    //_Container.add(_Texto);
    // _Container.on('pointerover', function () {
    //     _Boton.setTint(0x44ff44);
    // });

    //_Container.setScale(2);

    //console.log(_Container);

    var _HitArea = new Phaser.Geom.Circle(_Boton.width/2, _Boton.height/2, _Boton.width/2);

    //sprite.setInteractive(shape, Phaser.Geom.Circle.Contains);
    _Container.setInteractive(_HitArea, Phaser.Geom.Circle.Contains);//{ cursor: 'pointer' });
    //_Container.setInteractive({ cursor: 'pointer' });
    // _Container.on('pointerover', function () {
    //     _Boton.setTint(0x44ff44);
    // });
    // _Container.on('pointerout', function () {
    //     _Boton.clearTint();
    // });
    _Escena.input.setDraggable(_Container);
    return _Container;
}
function NuevoBotonConTexto1(_KeyTextura, _Pos, _Dim, _Texto){
    var _Boton = _Escena.add.sprite(0, 0, _KeyTextura, Tools.EnumTipoTorre.Prop[_TipoTorre]._NameBoton);
    _Boton.setScale(_Dim.x/128, _Dim.y/128)

    var _Costo = new Tools.InfoTorre(_TipoTorre)._Costo;
    var _Texto = _Escena.add.text(6, 38, _Costo, {font: "20px Tahoma", fill: "#FFFF00"});
    _Texto.setOrigin(0.5);
}
//#endregion

//  #region OLEADAS
var _OleadaVencida = true;
var _EstadoOleadas = ""; var _ProximoACrear;
var _EnemigosCreados = 0; var _BossesCreados = 0; var _AuxMultiploBoss = 0;
var _OleadaActual = 1;

function ControladorOleadas(_Escena, _Time){
    var _OA = _MapaActual._OleadasEnemigos[_OleadaActual-1];
    if (_OleadaVencida){
        _Escena.scene.get("EscenaGUI").CambiarTextoWaves("Waves: " + _OleadaActual + "/" + _MapaActual._OleadasEnemigos.length);
        _EstadoOleadas = "CreandoEnemigos";
        _OleadaVencida = false;
        _ProximoACrear = _Time + 2000;
        if (_OleadaActual == 1){ SumarMonedas(_Escena, _MapaActual._MonedasIniciales, false); }
        if (_OA._Bosses > 0){
            _AuxMultiploBoss = Math.trunc(_OA._CantidadEnemigos / _OA._Bosses);
        }
    }else{
        if (_EstadoOleadas == "CreandoEnemigos"){
            if (_EnemigosCreados < _OA._CantidadEnemigos){
                if(_ProximoACrear < _Time){
                    var _EsBoss = false;
                    if(_OA._Bosses > 0 && _BossesCreados < _OA._Bosses){
                        if (_BossesCreados * _AuxMultiploBoss <= _EnemigosCreados){
                            _BossesCreados += 1;
                            _EsBoss = true;
                        }
                    }
                    var _AuxIndexs = _OA._IdEnemigos.length;
                    _Enemigos.get(_OA._IdEnemigos[Phaser.Math.Between(0, _AuxIndexs-1)], _EsBoss);
                    _EnemigosCreados += 1;
                    _ProximoACrear = _Time + Phaser.Math.Between(100, 1500);
                }
            }else{
                _EstadoOleadas = "OleadaCreada";
                _EnemigosCreados = 0;
                _BossesCreados = 0;
                _AuxMultiploBoss = 0;
            }
        }
        else if (_Enemigos.children.size <= 0){
            _OleadaVencida = true;
            if(_OleadaActual >= _MapaActual._OleadasEnemigos.length){
                _Escena.scene.get("EscenaResultadoRonda").MostrarResultado(_Vidas, _Escena._Nivel);
            }else{
                var _OroRegaladoAlFinalizarOleada = _OA._CantidadEnemigos * _MapaActual._Nivel;
                SumarMonedas(_Escena, _OroRegaladoAlFinalizarOleada, true);
                _OleadaActual += 1;
            }
        }
    }
}


// async function demo() {
//     console.log('Taking a break...');
//     await sleep(2000);
//     console.log('Two seconds later, showing sleep in a loop...');
  
//     // Sleep in loop
//     for (let i = 0; i < 5; i++) {
//       if (i === 3)
//         await sleep(2000);
//       console.log(i);
//     }
//   }
  
//   demo();
//#endregion

//#endregion




//#region CLASES AUXILIARES
// class Sangrado extends Phaser.GameObjects.Sprite{
//     constructor(_Escena, x, y, _Radio){
//         super(_Escena, x, y, "Atlas64x64");
//         this.depth = ((y * 1000 + x) / 1000000) + 1;
//         this.setPosition(x, y);
//         this.setScale((_Radio * 2) / 64);
//         _Escena.add.existing(this);
//         this.play("Sangrado");
//     }
// }

class NuevaAnimacion extends Phaser.GameObjects.Sprite{
    constructor(_Escena, x, y, _DimOriginal, _Dim, _Atlas, _Key, _Depth){
        super(_Escena, x, y, _Atlas);
        this.depth = _Depth;// ((y * 1000 + x) / 1000000) + 1;
        this.setPosition(x, y);
        this.setScale(_Dim.x / 64);
        _Escena.add.existing(this);
        this.play(_Key);
    }
}


class ModificadorTemporal{
    constructor(_Valor, _TiempoCaduca){
        this._Valor = _Valor;
        this._TiempoCaduca = _TiempoCaduca;
    }
}
// class Boton extends Phaser.GameObjects.Image{
//     constructor(_Escena, _Tipo, x, y){
//         super(_Escena);
//         var _Boton = _Escena.add.sprite(x, y, "spritesMain", "TorreDeArqueros")
//         .setInteractive({ cursor: 'pointer' });
//         return _Boton;
//     }
// }
//#endregion