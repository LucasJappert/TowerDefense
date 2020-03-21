export default class MainGame extends Phaser.Scene{
    constructor(){
        super({key: "MainGame"});
    }

    preload() {   
        this.load.atlas('sprites', 'assets/spritesheet.png', 'assets/spritesheet.json');
        this.load.image('bullet', 'assets/bullet.png');
    }
    
    create() {
        var graphics = this.add.graphics();    
        this.DibujarCuadricula(graphics);
        _Path = this.add.path(96, -32);
        _Path.lineTo(96, 164);
        _Path.splineTo([250, 250, 280, 100, 310, 400, 340, 100]);
        _Path.lineTo(480, 164);
        _Path.lineTo(480, 544);
        // console.log(_Path);
        
        graphics.lineStyle(2, 0xffffff, 1);
        _Path.draw(graphics);
                
        _Enemigos = this.physics.add.group({ classType: Enemigo, runChildUpdate: true });
        _Defensas = this.add.group({ classType: Defensa, runChildUpdate: true });
        _Proyectiles = this.physics.add.group({ classType: _Proyectil, runChildUpdate: true });
        
        this.nextEnemy = 0;
        
        //Hace que Enemigos y Proyectiles llamen a la funcion ProvocarDaño cuando colisionan.
        this.physics.add.overlap(_Enemigos, _Proyectiles, ProvocarDaño);
        
        this.input.on('pointerdown', PlantarDefensa);

        this.scene.launch("EscenaTextos");

        this.registry.events.on("EnemigoLlegaABase", (_VidasRestadas) => {
            EnemigoLlegaABase(this.scene, _VidasRestadas);
        });
        this.registry.events.on("EnemigoDestruido", (_Enemigo) => {
            EnemigoDestruido(this.scene, _Enemigo);
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
            
                    this.nextEnemy = time + 500;
                    //console.log("Enemigo " + enemy._Id + " CREADO!");
                }   
            }
            else{
                //TODO - Game Over
                console.log("GAME OVER");
            }    
        }
    }

    DibujarCuadricula(graphics) {
        graphics.lineStyle(1, 0xcccccc, 0.8);
        for(var i = 0; i < 8; i++) {
            graphics.moveTo(0, i * 64);
            graphics.lineTo(640, i * 64);
        }
        for(var j = 0; j < 10; j++) {
            graphics.moveTo(j * 64, 0);
            graphics.lineTo(j * 64, 512);
        }
        graphics.strokePath();
    }


}

//#region PROPIEDADES

var _Path;
var _Mapa =    [[ 0,-1, 0, 0, 0, 0, 0, 0, 0, 0],
                [ 0,-1, 0, 0, 0, 0, 0, 0, 0, 0],
                [ 0,-1,-1,-1,-1,-1,-1,-1, 0, 0],
                [ 0, 0, 0, 0, 0, 0, 0,-1, 0, 0],
                [ 0, 0, 0, 0, 0, 0, 0,-1, 0, 0],
                [ 0, 0, 0, 0, 0, 0, 0,-1, 0, 0],
                [ 0, 0, 0, 0, 0, 0, 0,-1, 0, 0],
                [ 0, 0, 0, 0, 0, 0, 0,-1, 0, 0]];
var _Enemigos; var _Defensas; var _Proyectiles;
var _DañoProyectil = 10;
var _Ids = 1;
var _Vidas = 200;
var _Puntaje = 0;
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
        this._Puntaje = Phaser.Math.Between(2, 9);
        _Ids += 1;
        this._Velocidad = 1/10000;
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
            // _Enemigos.remove(this, true, true);
            //this.setActive(false);
            //this.setVisible(false);
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
            // console.log(this.scene.registry.events.emit);
            this.scene.registry.events.emit("EnemigoLlegaABase", 1);
            //EnemigoLlegaABase(this, 1);
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
function PlantarDefensa(pointer) {
    var i = Math.floor(pointer.y/64);
    var j = Math.floor(pointer.x/64);
    if(LugarPermitidoDefensa(i, j)) {
        var turret = _Defensas.get();
        if (turret)
        {
            turret.setActive(true);
            turret.setVisible(true);
            turret.place(i, j);
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
function EnemigoLlegaABase(Escenas, _VidasRestadas){
    _Vidas -= _VidasRestadas;
    Escenas.get("EscenaTextos").CambiarTextoVidas(_Vidas);
}
function EnemigoDestruido(Escenas, _Enemigo){
    _Puntaje += _Enemigo._Puntaje;
    Escenas.get("EscenaTextos").CambiarPuntaje(_Puntaje);
}
//#endregion