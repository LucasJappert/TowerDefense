export default class MainGame extends Phaser.Scene{
    constructor(){
        super({key: "EscenaMain"});
    }

    preload() {   
        this.load.atlas('sprites', 'assets/spritesheet.png', 'assets/spritesheet.json');
        this.load.image('bullet', 'assets/bullet.png');
    }
    
    create() {
        var graphics = this.add.graphics();    
        this.DibujarCuadricula(graphics);
        _Path = this.add.path(96, -32);
        _Path.lineTo(96, 352);
        _Path.ellipseTo(64, 64, 180, 360, true, 0);
        _Path.lineTo(3.5 * 64, 2.5 * 64);
        _Path.ellipseTo(64, 64, 180, 360, false, 0);
        _Path.lineTo(5.5 * 64, 5.5 * 64);
        _Path.ellipseTo(64, 64, 180, 360, true, 0);
        _Path.lineTo(7.5 * 64, 2.5 * 64);
        _Path.ellipseTo(64, 64, 180, 360, false, 0);
        _Path.lineTo(9.5 * 64, 8.5 * 64);
        
        graphics.lineStyle(2, 0xffffff, 1);
        _Path.draw(graphics);
                
        _Enemigos = this.physics.add.group({ classType: Enemigo, runChildUpdate: true });
        _Defensas = this.add.group({ classType: Defensa, runChildUpdate: true });
        _Proyectiles = this.physics.add.group({ classType: _Proyectil, runChildUpdate: true });
        
        this.nextEnemy = 0;

        this.scene.launch("EscenaTextos");

        this.registry.set("Monedas", _Monedas);
        
        //Hace que Enemigos y Proyectiles llamen a la funcion ProvocarDaño cuando colisionan.
        this.physics.add.overlap(_Enemigos, _Proyectiles, ProvocarDaño);
        
        this.input.on('pointerdown', (pointer) => {
            PlantarDefensa(this, pointer);
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

    }
        
    update(time, delta) {  
    
        if (time > this.nextEnemy)
        {
            if (_Vidas > 0){
                var enemy = _Enemigos.get();
                if (enemy)
                {
                    enemy.setActive(true);
                    enemy.setVisible(true);
                    enemy.startOnPath();
            
                    this.nextEnemy = time + 1000;
                    //console.log("Enemigo " + enemy._Id + " CREADO!");
                }   
            }
            else{
                //TODO - Game Over
                sdsdsd
                console.log("GAME OVER");
            }    
        }
    }
    DibujarCuadricula(graphics) {
        graphics.lineStyle(1, 0xcccccc, 0.8);
        for(var i = 0; i < 8; i++) {
            graphics.moveTo(0, i * 64);
            graphics.lineTo(704, i * 64);
        }
        for(var j = 0; j < 11; j++) {
            graphics.moveTo(j * 64, 0);
            graphics.lineTo(j * 64, 512);
        }
        graphics.strokePath();
    }

    static asdasd(){
        console.log("static asdasd");
    }
}

//#region PROPIEDADES

var _Path;
var _Mapa =    [[ 0,-1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [ 0,-1, 0,-1,-1,-1, 0,-1,-1,-1, 0],
                [ 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0],
                [ 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0],
                [ 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0],
                [ 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0],
                [ 0,-1,-1,-1, 0,-1,-1,-1, 0,-1, 0],
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0,-1, 0]];
var _Enemigos; var _Defensas; var _Proyectiles;
var _DañoProyectil = 10;
var _Ids = 1;
var _Vidas = 200;
var _Puntaje = 0;
var _Monedas = 1000;
//#endregion


//#region Enemigo
var Enemigo = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Enemigo (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'sprites', 'enemy');

        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
        this.hp = 0;
        this._Id = _Ids;
        this._Puntaje = 1;//Phaser.Math.Between(2, 9);
        _Ids += 1;
        this._Velocidad = 1/20000;
    },

    startOnPath: function ()
    {
        this.follower.t = 0;
        this.hp = 100;
        _Path.getPoint(this.follower.t, this.follower.vec);
        
        this.setPosition(this.follower.vec.x, this.follower.vec.y);            
    },
    receiveDamage: function(damage) {
        this.hp -= damage;           
        
        // if hp drops below 0 we deactivate this enemy
        if(this.hp <= 0) {
            this.scene.registry.events.emit("EnemigoDestruido", this);      
        }
    },
    update: function (time, delta)
    {
        this.follower.t += this._Velocidad * delta;
        _Path.getPoint(this.follower.t, this.follower.vec);
        
        this.setPosition(this.follower.vec.x, this.follower.vec.y);

        //Evento cuando un Enemigo llega a Base
        if (this.follower.t >= 1 && this.hp > 0){
            this.scene.registry.events.emit("EnemigoLlegaABase", 1);
        }
        //Elimino el Enemigo
        if (this.follower.t >= 1 || this.hp <= 0)
        {
            _Enemigos.remove(this, true, true);
        }
    }

});
//#endregion

//#region Defensa
var Defensa = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Defensa (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'sprites', 'turret');
        this.nextTic = 0;
    },
    place: function(i, j) {            
        this.y = i * 64 + 64/2;
        this.x = j * 64 + 64/2;
        _Mapa[i][j] = 1;            
    },
    fire: function() {
        var enemy = ObtenerEnemigo(this.x, this.y, 200);
        if(enemy) {
            var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
            NuevoProyectil(this.x, this.y, angle);
            this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;
        }
    },
    update: function (time, delta)
    {
        if(time > this.nextTic) {
            this.fire();
            this.nextTic = time + 1000;
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

    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');

        this.incX = 0;
        this.incY = 0;
        this.lifespan = 0;

        this.speed = Phaser.Math.GetSpeed(600, 1);
    },

    fire: function (x, y, angle)
    {
        this.setActive(true);
        this.setVisible(true);
        //  Bullets fire from the middle of the screen to the given x/y
        this.setPosition(x, y);
        
    //  we don't need to rotate the bullets as they are round
    //    this.setRotation(angle);

        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);

        this.lifespan = 1000;
    },

    update: function (time, delta)
    {
        this.lifespan -= delta;

        this.x += this.dx * (this.speed * delta);
        this.y += this.dy * (this.speed * delta);

        if (this.lifespan <= 0)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});
//#endregion


//#region FUNCIONES

function ProvocarDaño(enemy, _Proyectil) {  
    // only if both enemy and bullet are alive
    if (enemy.active && _Proyectil.active) {
        // we remove the bullet right away
        _Proyectil.setActive(false);
        _Proyectil.setVisible(false);    
        
        // decrease the enemy hp with BULLET_DAMAGE
        enemy.receiveDamage(_DañoProyectil);
    }
}
function PlantarDefensa(_Parent, _PuntoClickeado) {
    if(_Monedas >= 100){
        var i = Math.floor(_PuntoClickeado.y/64);
        var j = Math.floor(_PuntoClickeado.x/64);
        if(LugarPermitidoDefensa(i, j)) {
            var turret = _Defensas.get();
            if (turret)
            {
                turret.setActive(true);
                turret.setVisible(true);
                turret.place(i, j);
                SumarMonedas(_Parent, -100);
            }   
        }
    }
}
function LugarPermitidoDefensa(i, j) {
    return _Mapa[i][j] === 0;
}
function NuevoProyectil(x, y, angle) {
    var _Proyectil = _Proyectiles.get();
    if (_Proyectil)
    {
        _Proyectil.fire(x, y, angle);
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
//#endregion