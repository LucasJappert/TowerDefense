//import Enemigo from "/js/Clases/Enemigo.js";
//import * as Enemigo from "/js/Clases/Prueba.js";

export default class MainGame extends Phaser.Scene{
    constructor(){
        super({key: "EscenaMain"});
    }

    preload() {   
        this.load.atlas('sprites', 'assets/spritesheet.png', 'assets/spritesheet.json');
        this.load.audio("Disparo", "/assets/Audio/Disparo.wav");
        this.load.audio("Explosion", "/assets/Audio/Explosion.mp3");
        this.load.spritesheet("Atlas", "/assets/Atlas.png", {frameWidth: 256, frameHeight: 256});
    }
    
    create() {
        this.IniciarVariables();
        //this.scale.startFullscreen();
        this._Explosion = this.add.sprite(0, 0, "Atlas");
        this.anims.create({
            key: "Explosion",
            frames: this.anims.generateFrameNumbers("Atlas", {
                frames:[8, 9, 10, 11, 12]
            }),
            // duration: 2000,
            frameRate: 20,
            hideOnComplete: true
        });
        this._Explosion.setActive(false).setVisible(false);

        this._GraficaBase = this.add.graphics();

        this.DibujarCuadricula();
        this.ArmarPath();
        
        ArmarBotonesDefensas(this);

        _Enemigos = this.physics.add.group({ classType: Enemigo, runChildUpdate: true });
        _Defensas = this.add.group({ classType: Defensa, runChildUpdate: true });
        _Proyectiles = this.physics.add.group({ classType: _Proyectil, runChildUpdate: true });
        
        this.AudioDisparo = this.sound.add("Disparo", {volume: 0.02});
        this.AudioExplosion = this.sound.add("Explosion", {volume: 0.07});

        this.scene.launch("EscenaTextos");

        this.registry.set("Monedas", _Monedas);
        
        //Hace que Enemigos y Proyectiles llamen a la funcion ProvocarDaño cuando colisionan.
        this.physics.add.overlap(_Enemigos, _Proyectiles, ProvocarDaño);
        
        this.input.on('pointerdown', (pointer) => {
            //PlantarDefensa(this, pointer);
        });
        
        //  The pointer has to move 16 pixels before it's considered as a drag
        this.input.dragDistanceThreshold = 16;
        this.input.on('dragstart', function (pointer, _Objeto) {
            _Objeto.setTint(0x00ff00);
        });
        this.input.on('drag', function (pointer, _Objeto, dragX, dragY) {
            _Objeto.x = pointer.x;
            _Objeto.y = pointer.y;
        });
        this.input.on('dragend', function (pointer, _Objeto) {
            if(_Objeto.getData("TorreDefensa")){
                if (ClickEnCuadricula(pointer)){
                    PlantarDefensa(this.scene, pointer, _Objeto._TipoTorre);
                }
            }
            _Objeto.destroy();
        });
        this.input.on('pointerup', function (pointer, _Objeto) {
            //PlantarDefensa(this, pointer);
        });
        this.registry.events.on("changedata", (parent, key, data) => {
            DatosActualizados(parent, key, data);
        });
        this.registry.events.on("EnemigoLlegaABase", (_VidasRestadas) => {
            EnemigoLlegaABase(this, _VidasRestadas);
        });
        this.registry.events.on("EnemigoDestruido", (_Enemigo) => {
            EnemigoDestruido(this, _Enemigo);
        });
        this.input.on('gameobjectdown', function (_Pointer, _Objeto) {
            ClickEnObjeto(this, _Pointer, _Objeto);
        });

    }
        
    update(time, delta) {  
    
        // if (time > this.nextEnemy)
        // {
            if (_Vidas > 0){
                ControladorOleadas(this);
                // var enemy = _Enemigos.get();
                // if (enemy)
                // {
                //     enemy.setActive(true);
                //     enemy.setVisible(true);
                //     enemy.startOnPath();
            
                //     this.nextEnemy = time + Phaser.Math.Between(100, 9000);
                //     //console.log("Enemigo " + enemy._Id + " CREADO!");
                // }   
            }
            else
            {
                //TODO - Game Over
                this.scene.pause();
                console.log("GAME OVER");
            }    
        // }
    }
    DibujarCuadricula() {
        this._GraficaBase.lineStyle(1, 0xcccccc, 0.8);
        for(var i = 0; i <= 11; i++) {
            this._GraficaBase.moveTo(i * 64, 64);
            this._GraficaBase.lineTo(i * 64, 13 * 64 + 64);
        }
        for(var j = 1; j <= 14; j++) {
            this._GraficaBase.moveTo(0, j * 64);
            this._GraficaBase.lineTo(11 * 64, j * 64);
        }
        this._GraficaBase.strokePath();
    }
    ArmarPath(){
        _Path = this.add.path(-32, 64*2.5);
        _Path.lineTo(64*8.5, 64*2.5);
        _Path.ellipseTo(64, 64, 0, 180, false, -90);
        _Path.lineTo(64*2.5, 64*4.5);
        _Path.ellipseTo(64, 64, 0, 180, true, -90);
        _Path.lineTo(64*8.5, 64*6.5);
        _Path.ellipseTo(64, 64, 0, 180, false, -90);
        _Path.lineTo(64*2.5, 64*8.5);
        _Path.ellipseTo(64, 64, 0, -90, true, -90);
        _Path.lineTo(64*1.5, 64*11.5);
        _Path.ellipseTo(64, 64, 0, -180, true, 180);
        _Path.ellipseTo(64, 64, 0, 90, false, 180);
        _Path.lineTo(64*6.5, 64*10.5);
        _Path.ellipseTo(64, 64, 0, 90, false, -90);
        _Path.ellipseTo(64, 64, 0, -90, true, 180);
        _Path.lineTo(64*11.5, 64*12.5);
        this._GraficaBase.lineStyle(2, 0xffffff, 1);
        _Path.draw(this._GraficaBase);
    }
    IniciarVariables(){
        this._DefensaArrastrada = null;
    }

    static asdasd(){
        console.log("static asdasd");
    }
}

//#region PROPIEDADES

var _Path;
var _Mapa =    [[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, 0],
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0,-1, 0],
                [ 0,-1,-1,-1,-1,-1,-1,-1,-1,-1, 0],
                [ 0,-1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [ 0,-1,-1,-1,-1,-1,-1,-1,-1,-1, 0],
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0,-1, 0],
                [ 0,-1,-1,-1,-1,-1,-1,-1,-1,-1, 0],
                [ 0,-1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [ 0,-1, 0,-1,-1,-1,-1,-1, 0, 0, 0],
                [ 0,-1, 0,-1, 0, 0, 0,-1, 0, 0, 0],
                [ 0,-1,-1,-1, 0, 0, 0,-1,-1,-1,-1],
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
var _Enemigos; var _Defensas; var _Proyectiles;
var _DañoProyectil = 10;
var _Ids = 1;
var _Vidas = 50;
var _Puntaje = 0;
var _Monedas = 1000;
//#endregion

//#region ENUMERADORES
var EnumTipoTorre = {
    TorreDeArqueros: 1,
    TorreMagica: 2,
    TorreBombardera: 3,
    TorreEnvenenada: 4,
    Prop:{
        1: {_Name: "TorreDeArqueros", _Valor: 1},
        2: {_Name: "TorreMagica", _Valor: 2},
        3: {_Name: "TorreBombardera", _Valor: 3},
        4: {_Name: "TorreEnvenenada", _Valor: 4}
    }
  };
  var _TipoDaño = {
    Fisico: 1,
    Magico: 2,
    Puro: 3
  };
//#endregion

//#region CLASES

    //#region Enemigo
var Enemigo = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Enemigo (scene, _Vida)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'sprites', 'enemy');
        this.setTint(0xff0000);
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
        this._Id = _Ids;
        this._Puntaje = 1;//Phaser.Math.Between(2, 9);
        _Ids += 1;
        this._Velocidad = 1/20000;
        this._VidaTotal = _Vida;
        this._VidaActual = _Vida;
        this.setActive(true);
        this.setVisible(true);
        this.startOnPath();
    },
    startOnPath: function ()
    {
        this.follower.t = 0;
        _Path.getPoint(this.follower.t, this.follower.vec);
        
        this.setPosition(this.follower.vec.x, this.follower.vec.y);            
    },
    receiveDamage: function(damage) {
        this._VidaActual -= damage;
        if(this._VidaActual <= 0) {
            //this.scene.AudioExplosion.play();
            this.scene.registry.events.emit("EnemigoDestruido", this);      
        }
    },
    update: function (time, delta)
    {
        this.follower.t += this._Velocidad * delta;
        _Path.getPoint(this.follower.t, this.follower.vec);
        //this.setTint(Math.random() * 0xffffff);
        this.setPosition(this.follower.vec.x, this.follower.vec.y);

        //Evento cuando un Enemigo llega a Base
        if (this.follower.t >= 1 && this._VidaActual > 0){
            this.scene.registry.events.emit("EnemigoLlegaABase", 1);
        }
        //Elimino el Enemigo
        if (this.follower.t >= 1 || this._VidaActual <= 0)
        {
            _Enemigos.remove(this, true, true);
        }
        else
        {
            var _Porc = Math.abs(this._VidaActual / this._VidaTotal);
            if(_Porc < 0.3){
                this.setTint(0xff9999);
            }else if(_Porc < 0.6){
                this.setTint(0xff5555);
            }else{
                this.setTint(0xff2222);
            }
        }
    }

});
//#endregion

    //#region Defensa
var Defensa = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Defensa (_Escena, _TipoTorre)
    {
        var _Nombre = EnumTipoTorre.Prop[_TipoTorre]._Name;
        Phaser.GameObjects.Image.call(this, _Escena, 0, 0, 'sprites', _Nombre);
        this.setInteractive({ cursor: 'pointer' });
        this.setScale(1/128 * 64);
        this.setData("Defensa", true);
        this._Info = new InfoTorre(_TipoTorre);
        this._TiempoProximoDisparo = 0;
        _Escena.add.existing(this);
    },
    place: function(i, j) {  
        this.y = (i + 1) * 64 + 64/2;
        this.x = j * 64 + 64/2;
        _Mapa[i][j] = 1;          
    },
    fire: function() {
        var _Enemigo = ObtenerEnemigo(this.x, this.y, this._Info._RangoEnPix);
        if(_Enemigo) {
            var angle = Phaser.Math.Angle.Between(this.x, this.y, _Enemigo.x, _Enemigo.y);
            NuevoProyectil(this.x, this.y, angle, _Enemigo, this);
            //this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;
            //this.scene.AudioDisparo.play();
            //this.scene.sound.add("Disparo", {volume: 0.015}).play();
        }
    },
    update: function (time, delta)
    {
        if(time > this._TiempoProximoDisparo) {
            this.fire();
            this._TiempoProximoDisparo = time + this._Info._AS;
        }
    }

});

function ObtenerEnemigo(x, y, distance) {
    var enemyUnits = _Enemigos.getChildren();
    for(var i = 0; i < enemyUnits.length; i++) {       
        if(enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) < distance){
            return enemyUnits[i];
        }
    }
    return false;
} 
//#endregion

    //#region Proyectil
var _Proyectil = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,

    initialize:

    function Bullet (scene, _Velocidad, _TipoProyectil)
    {
        //var _Aux = "Proyectil" + Phaser.Math.Between(1, 3);
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'sprites', _TipoProyectil);
        //Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
        //this.setTint(Math.random() * 0xffffff);
        this.InicioX = 0;
        this.InicioY = 0;
        this.RecorridoTotal = 0;
        this.speed = _Velocidad;
        //this.setScale(1);
    },

    fire: function (x, y, angle, EnemyX, EnemyY)
    {
        this.setActive(true);
        this.setVisible(true);
        //  Bullets fire from the middle of the screen to the given x/y
        this.setPosition(x, y);
        this.InicioX = x;
        this.InicioY = y;
        this.FinX = EnemyX;
        this.FinY = EnemyY;
        this.RecorridoTotal = Phaser.Math.Distance.Between(x, y, EnemyX, EnemyY);
        
    //  we don't need to rotate the bullets as they are round
    //    this.setRotation(angle);
        this.setRotation(angle);

        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
    },

    update: function (time, delta)
    {
        this.x += this.dx * (this.speed * delta);
        this.y += this.dy * (this.speed * delta);

        var _RecoActual = Phaser.Math.Distance.Between(this.InicioX, this.InicioY, this.x, this.y);
        if (this.RecorridoTotal < _RecoActual)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});
//#endregion

//#endregion

//#region BOTONES
function ArmarBotonesDefensas(_Escena){
    _Escena._BotonTorreDeArqueros = NuevoBoton(_Escena, EnumTipoTorre.TorreDeArqueros, 1*64, 15*64);
    _Escena._BotonTorreDeArqueros = NuevoBoton(_Escena, EnumTipoTorre.TorreMagica, 3*64, 15*64);
    _Escena._BotonTorreDeArqueros = NuevoBoton(_Escena, EnumTipoTorre.TorreBombardera, 5*64, 15*64);
    _Escena._BotonTorreDeArqueros = NuevoBoton(_Escena, EnumTipoTorre.TorreEnvenenada, 7*64, 15*64);
}
//#endregion

//#region FUNCIONES

    //#region VARIAS
function ProvocarDaño(enemy, _Proyectil) {  
    // only if both enemy and bullet are alive
    if (enemy.active && _Proyectil.active) {
        // we remove the bullet right away
        _Proyectil.destroy();
        //_Proyectil.setActive(false);
        // _Proyectil.setVisible(false);    
        
        // decrease the enemy hp with BULLET_DAMAGE
        enemy.receiveDamage(_DañoProyectil);
    }
}
function PlantarDefensa(_Escena, _PuntoClickeado, _Tipo) {
        _PuntoClickeado.y -= 64;
        if(_Monedas >= 100){
            var i = Math.floor(_PuntoClickeado.y/64);
            var j = Math.floor(_PuntoClickeado.x/64);
            if(LugarPermitidoDefensa(i, j)) {
                var _NuevaDefensa = new Defensa(_Escena, _Tipo);
                //var _NuevaDefensa = _Defensas.get();
                if (_NuevaDefensa)
                {
                    _NuevaDefensa.place(i, j);
                    _Defensas.add(_NuevaDefensa);
                    SumarMonedas(_Escena, -100);
                }   
            }
        }
}
function ClickEnCuadricula(_PuntoClickeado){
    if (_PuntoClickeado.y > 64 && _PuntoClickeado.y < 64 * 13 + 64 * 2){
        return true;
    }
    return false;
}
function LugarPermitidoDefensa(i, j) {
    if (i < _Mapa.length){
        if (j < _Mapa[0].length){
            return _Mapa[i][j] === 0;
        }
    }
}
function NuevoProyectil(x, y, angle, _Enemigo, _Defensa) {
    var _Proyectil = _Proyectiles.get(_Defensa._Info._VelocidadDelProyectil, _Defensa._Info._KeyProyectil);
    if (_Proyectil)
    {
        _Proyectil.fire(x, y, angle, _Enemigo.x, _Enemigo.y);
    }
}
function EnemigoLlegaABase(_Parent, _VidasRestadas){
    _Vidas -= _VidasRestadas;
    _Parent.scene.get("EscenaTextos").CambiarTextoVidas(_Vidas);
}
function EnemigoDestruido(_Parent, _Enemigo){
    _Puntaje += _Enemigo._Puntaje;
    _Parent.scene.get("EscenaTextos").CambiarPuntaje(_Puntaje);
    SumarMonedas(_Parent, 10);
    GenerarExplosion(_Parent, _Enemigo.x, _Enemigo.y, 64);
    //GenerarExplosion(_Parent, _Enemigo.x, _Enemigo.y, 32);
}
function DatosActualizados(parent, _Key, _Data){
    if (_Key == "Monedas"){
        parent.scene.getScene("EscenaTextos").CambiarMonedas(_Data);
    }
}
function SumarMonedas(_Parent, _Valor){
    _Monedas += _Valor;
    if (_Monedas < 0) {_Monedas = 0;}
    _Parent.registry.set("Monedas", _Monedas);
    _Parent.scene.get("EscenaTextos").CambiarMonedas(_Monedas);
    
}
function ClickEnObjeto(_Parent, _Pointer, _Objeto){
    if(_Objeto.getData("Defensa")){
        MostrarAreaRango(_Parent.scene, _Objeto.x, _Objeto.y, _Objeto._Info._RangoEnPix);
    }
    else if(_Objeto.getData("TorreDefensa")){
        _Objeto.setScale(0.5);
        _Parent.scene._BotonTorreDeArqueros = NuevoBoton(_Parent.scene, _Objeto._TipoTorre, _Objeto.x, _Objeto.y);
        _Parent.scene._DefensaArrastrada = _Objeto;
    }
}
function MostrarAreaRango(_Escena, x, y, _Radio){
    _Escena._AreaRango = _Escena.add.sprite(x, y, "Atlas");
    _Escena.anims.create({
        key: "AreaRango",
        frames: _Escena.anims.generateFrameNumbers("Atlas", {
            frames:[0]
        }),
        repeat: 10,
        // duration: 2000,
        frameRate: 20,
        hideOnComplete: true
    });
    _Escena._AreaRango.setPosition(x, y);
    _Escena._AreaRango.setScale((_Radio * 2) / 256);
    _Escena._AreaRango.anims.play("AreaRango");
}
function GenerarExplosion(_Escena, x, y, _Radio){
    new Explosion(_Escena, x, y, _Radio);
}
function NuevoBoton(_Escena, _TipoTorre, x, y){
    var _Boton = _Escena.add.sprite(x, y, "sprites", EnumTipoTorre.Prop[_TipoTorre]._Name);
    _Boton.setInteractive({ cursor: 'pointer' });
    _Boton.setScale(0.8);
    _Boton._TipoTorre = _TipoTorre; 
    _Boton.setData("TorreDefensa", true);

    _Escena.input.setDraggable(_Boton);
    return _Boton;
}
//#endregion

//  #region OLEADAS
var _OleadaActual = 1;
var _OleadaVencida = true;
var _EstadoOleadas = "";
function ControladorOleadas(_Escena){
    if (_OleadaVencida){
        _EstadoOleadas = "CreandoEnemigos";
        console.log("Esperando enemigos...");
        _EnemigosPorCrear += 1;
        setTimeout(function(){IniciarOleada(_Escena)}, 2000);
        _OleadaVencida = false;
    }else{
        //if (_EnemigosPorCrear <= 0){
            if (_Enemigos.children.size <= 0 && _EstadoOleadas != "CreandoEnemigos"){
                _OleadaVencida = true;
                _VidaEnemigos += 30;
                console.log("Vida Enemigos: " + _VidaEnemigos);
            }
        //}
    }
}

var _EnemigosPorCrear = 2;
var _EnemigosCreados = 0; var _VidaEnemigos = 30;
function IniciarOleada(_Escena){
    if (_EnemigosCreados < _EnemigosPorCrear){
        _Enemigos.get(_VidaEnemigos);
        _EnemigosCreados += 1;
        setTimeout(function(){IniciarOleada(_Escena)}, Phaser.Math.Between(400, 2500));
    }else{
        _EstadoOleadas = "OleadaCreada";
        _EnemigosCreados = 0;
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
class Explosion extends Phaser.GameObjects.Sprite{
    constructor(_Escena, x, y, _Radio){
        super(_Escena, x, y);
        _Escena._Explosion.setPosition(x, y);
        _Escena._Explosion.setScale((_Radio * 2) / 256);
        _Escena.add.existing(this);
        this.play("Explosion");
    }
}
class InfoTorre{
    constructor(_TipoTorre){
        this._TipoTorre = _TipoTorre;
        this._TipoDaño = _TipoDaño.Fisico;
        this._Daño = new Phaser.Math.Vector2(0, 0);
        /**En casillas */
        this._Rango = 1;
        /**En milisegundos */
        this._AS = 1000;
        /**De 0 a 100 */
        this._ChancesCritico = 0;
        /**Mayor a 1 */
        this._ValorCritico = 0;
        /**De 0 a 100 */
        this._Ralentizacion = 0;
        this._AreaImpacto = 1;
        this._VelocidadDelProyectil = Phaser.Math.GetSpeed(500, 1);
        this._KeyProyectil = "ProyectilFlecha";
        switch(_TipoTorre){
            case 1: this.SetearInfo1(); break;
            case 2: this.SetearInfo2(); break;
            case 3: this.SetearInfo3(); break;
            case 4: this.SetearInfo4(); break;
        }

        /**En Pixeles */
        this._RangoEnPix = this._Rango * 64;
    }
    SetearInfo1(){
        this._TipoDaño = _TipoDaño.Fisico;
        this._Daño = new Phaser.Math.Vector2(7, 9);
        this._Rango = 4;
        this._AS = 500;
        this._ChancesCritico = 0;
        this._ValorCritico = 0;
        this._Ralentizacion = 0;
        this._AreaImpacto = 0;
        this._VelocidadDelProyectil = Phaser.Math.GetSpeed(900, 1);
    }
    SetearInfo2(){
        this._TipoDaño = _TipoDaño.Fisico;
        this._Daño = new Phaser.Math.Vector2(11, 14);
        this._Rango = 3;
        this._AS = 1000;
        this._ChancesCritico = 0;
        this._ValorCritico = 0;
        this._Ralentizacion = 0;
        this._AreaImpacto = 0;
        this._VelocidadDelProyectil = Phaser.Math.GetSpeed(500, 1);
    }
    SetearInfo3(){
        this._TipoDaño = _TipoDaño.Fisico;
        this._Daño = new Phaser.Math.Vector2(7, 9);
        this._Rango = 2.5;
        this._AS = 1000;
        this._ChancesCritico = 0;
        this._ValorCritico = 0;
        this._Ralentizacion = 0;
        this._AreaImpacto = 0;
        this._VelocidadDelProyectil = Phaser.Math.GetSpeed(500, 1);
    }
    SetearInfo4(){
        this._TipoDaño = _TipoDaño.Fisico;
        this._Daño = new Phaser.Math.Vector2(7, 9);
        this._Rango = 2.5;
        this._AS = 1000;
        this._ChancesCritico = 0;
        this._ValorCritico = 0;
        this._Ralentizacion = 0;
        this._AreaImpacto = 0;
        this._VelocidadDelProyectil = Phaser.Math.GetSpeed(500, 1);
    }
}
// class Boton extends Phaser.GameObjects.Image{
//     constructor(_Escena, _Tipo, x, y){
//         super(_Escena);
//         var _Boton = _Escena.add.sprite(x, y, "sprites", "TorreDeArqueros")
//         .setInteractive({ cursor: 'pointer' });
//         return _Boton;
//     }
// }
//#endregion