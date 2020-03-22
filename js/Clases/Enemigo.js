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