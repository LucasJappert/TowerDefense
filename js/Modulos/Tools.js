//Solo se pueden exportar variables Only Reads

//#region CLASES
export class Ej1 {
    Prueba1() {
        console.log("Prueba1");
    }
    static Prueba1(){
        console.log("Prueba1 static");
    }
}
export class t1{

  static NuevoSpriteMain(_Escena, _KeyTextura, _Posicion, _Dimensiones, _Interactive){
      if (_Posicion == null){
          _Posicion = new Phaser.Math.Vector2(0, 0);
      }
      var _S = _Escena.add.sprite(_Posicion.x, _Posicion.y, "spritesMain", _KeyTextura);
      if (_Dimensiones != null){
          _S.setScale(_Dimensiones.x/_S.width, _Dimensiones.y/_S.height);
      }
      if (_Interactive){
          _S.setInteractive({ cursor: 'pointer' });
      }
      _S.depth = 0.01;
      return _S;
  }
  
  static ReproducirAudio(_Audio, _ChequearUnicaReproduccion){
    if(_ChequearUnicaReproduccion && _Audio.isPlaying){
        return;
    }
    _Audio.play();
  }
}

export class InfoTorre{
  constructor(_TipoTorre){
      this._CostoUpgrade = 0;
      this._Costo = 5;
      this._ValorRalentizacion = 0;
      this._TiempoRalentizacion = 0;
      this._Nivel = 1;
      this._TipoTorre = _TipoTorre;
      this._TipoDaño = 1;
      this._Daño = new Phaser.Math.Vector2(0, 0);
      this._MaximoTargets = 1;
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
      this._RadioImpacto = 0;
      this._VelocidadDelProyectil = Phaser.Math.GetSpeed(500, 1);
      this._KeyProyectil = "ProyectilFlecha";
      this._Title = EnumTipoTorre.Prop[_TipoTorre]._Title;
      switch(_TipoTorre){
          case 1: this.SetearInfo1(); break;
          case 2: this.SetearInfo2(); break;
          case 3: this.SetearInfo3(); break;
          case 4: this.SetearInfo4(); break;
      }
      this._Daño.x = Math.round(this._Daño.y * 0.8);

      /**En Pixeles */
      this._RangoEnPix = this._Rango * 64;
  }
  SetearInfo1(){//Arquera
      this._Costo = 8;
      this._TipoDaño = 1;
      this._Daño.y = 9;
      this._Rango = 2.5;
      this._AS = 900;
      this._ChancesCritico = 0;
      this._ValorCritico = 0;
      this._Ralentizacion = 0;
      this._RadioImpacto = 0;
      this._VelocidadDelProyectil = Phaser.Math.GetSpeed(800, 1);
  }
  SetearInfo2(){//Magica
      this._Costo = 15;
      this._TipoDaño = 2;
      this._Daño.y = 13;
      this._Rango = 2.3;
      this._AS = 1100;
      this._ChancesCritico = 0;
      this._ValorCritico = 0;
      this._Ralentizacion = 0;
      this._RadioImpacto = 0;
      this._VelocidadDelProyectil = Phaser.Math.GetSpeed(1000, 1);
  }
  SetearInfo3(){//Bombardera
      this._Costo = 24;
      this._TipoDaño = 1;
      this._Daño.y = 4;
      this._Rango = 2.2;
      this._AS = 1500;
      this._ChancesCritico = 0;
      this._ValorCritico = 0;
      this._Ralentizacion = 0;
      this._RadioImpacto = 128 / 2;
      this._MaximoTargets = 10;
      this._VelocidadDelProyectil = Phaser.Math.GetSpeed(400, 1);
  }
  SetearInfo4(){//Cristal
      this._Costo = 12;
      this._TipoDaño = 3;
      this._Daño.y = 2;
      this._Rango = 1.7;
      this._AS = 1300;
      this._ChancesCritico = 0;
      this._ValorCritico = 0;
      this._Ralentizacion = 0;
      this._RadioImpacto = 0;
      this._VelocidadDelProyectil = Phaser.Math.GetSpeed(800, 1);
      this._ValorRalentizacion = 10;
      this._TiempoRalentizacion = 2000;
  }
  CostoUpgrade(){
      return _Costo * 2;
  }
  RecuperarOro(){
      return _Costo / 2;
  }
  ActualizarRango(_RangoEnCuadriculas){
      this._Rango = _RangoEnCuadriculas;
      this._RangoEnPix = Math.round(this._Rango * _TT);
  }
}
export class InfoEnemigo{
  constructor(_IdEnemigo){
    this._Id = _IdValido;
    _IdValido += 1;
    this._IdEnemigo = _IdEnemigo;
    this._Nivel = 1;
    this._Puntaje = 1;
    this._ModificadoresVelocidad = [];
    this._VelocidadNormal = 30;
    this._VelocidadActual = this._VelocidadNormal;
    this._VelocidadMinima = 5; this._VelocidadMaxima = 300;
    this._VidaTotal = 100; this._VidaActual = 100;
    this._BarraVidaVisible = false;
    this._BarraNegra = null; this._BarraVida = null;
    this._DefensaFisica = 0; 
    this._DefensaMagica = 0;
    this._Descripcion = "";

    switch(_IdEnemigo){
        case 1: this.SetearInfo1(); break;
        case 2: this.SetearInfo2(); break;
        case 3: this.SetearInfo3(); break;
        case 4: this.SetearInfo4(); break;
        case 5: this.SetearInfo5(); break;
        case 6: this.SetearInfo6(); break;
        case 7: this.SetearInfo7(); break;
        case 8: this.SetearInfo8(); break;
        case 9: this.SetearInfo9(); break;
        case 10: this.SetearInfo10(); break;
        default: this.SetearInfo1(); break;
    }
    this._AnchoBarraVida = (this._VidaActual/this._VidaTotal) * _TT;
  }

  SetearInfo1(){
    this._Nivel = Math.trunc((this._IdEnemigo + 1) / 2); 
    this._Puntaje = this._Nivel;
    this._VelocidadNormal = 10;
    this._VidaTotal = 20; this._VidaActual = this._VidaTotal;
  }
  SetearInfo2(){
    this._Nivel = Math.trunc((this._IdEnemigo + 1) / 2); 
    this._Puntaje = this._Nivel;
    this._VelocidadNormal = 12;
    this._VidaTotal = 40; this._VidaActual = this._VidaTotal;
  }
  SetearInfo3(){
    this._Nivel = Math.trunc((this._IdEnemigo + 1) / 2); 
    this._Puntaje = this._Nivel;
    this._VelocidadNormal = 15;
    this._VidaTotal = 80; this._VidaActual = this._VidaTotal;
  }
  SetearInfo4(){
    this._Nivel = Math.trunc((this._IdEnemigo + 1) / 2); 
    this._Puntaje = this._Nivel;
    this._VelocidadNormal = 17;
    this._VidaTotal = 230; this._VidaActual = this._VidaTotal;
  }
  SetearInfo5(){
    this._Nivel = Math.trunc((this._IdEnemigo + 1) / 2); 
    this._Puntaje = this._Nivel;
    this._VelocidadNormal = 22;
    this._VidaTotal = 290; this._VidaActual = this._VidaTotal;
  }
  SetearInfo6(){
    this._Nivel = Math.trunc((this._IdEnemigo + 1) / 2); 
    this._Puntaje = this._Nivel;
    this._VelocidadNormal = 30;
    this._VidaTotal = 240; this._VidaActual = this._VidaTotal;
  }
  SetearInfo7(){
    this._Nivel = Math.trunc((this._IdEnemigo + 1) / 2); 
    this._Puntaje = this._Nivel;
    this._VelocidadNormal = 24;
    this._VidaTotal = 370; this._VidaActual = this._VidaTotal;
  }
  SetearInfo8(){
    this._Nivel = Math.trunc((this._IdEnemigo + 1) / 2); 
    this._Puntaje = this._Nivel;
    this._VelocidadNormal = 24;
    this._VidaTotal = 420; this._VidaActual = this._VidaTotal;
  }
  SetearInfo9(){
    this._Nivel = Math.trunc((this._IdEnemigo + 1) / 2); 
    this._Puntaje = this._Nivel;
    this._VelocidadNormal = 26;
    this._VidaTotal = 600; this._VidaActual = this._VidaTotal;
  }
  SetearInfo10(){
    this._Nivel = Math.trunc((this._IdEnemigo + 1) / 2); 
    this._Puntaje = this._Nivel;
    this._VelocidadNormal = 30;
    this._VidaTotal = 610; this._VidaActual = this._VidaTotal;
  }
}

//#endregion


//#region ENUMERADORES
export var EnumTipoTorre = {
  TorreDeArqueros: 1,
  TorreMagica: 2,
  TorreBombardera: 3,
  TorreDeCristal: 4,
  Prop:{
      1: {_Name: "TorreDeArqueros", _NameBoton: "BotonTorreDeArqueros", _Valor: 1, _Title: "Archer Tower"},
      2: {_Name: "TorreMagica", _NameBoton: "BotonTorreMagica", _Valor: 2, _Title: "Magic Tower"},
      3: {_Name: "TorreBombardera", _NameBoton: "BotonTorreBombardera", _Valor: 3, _Title: "Bomber Tower"},
      4: {_Name: "TorreDeCristal", _NameBoton: "BotonTorreDeCristal", _Valor: 4, _Title: "Crystal Tower"}
  }
};
export var _TipoDaño = {
  Physical: 1,
  Magic: 2,
  Pure: 3,
  Prop:{
      1: {_Name: "Physical"},
      2: {_Name: "Magic"},
      3: {_Name: "Pure"}
  }
};
//#endregion

//#region VARIABLES
var _IdValido = 1;
export var _Pantalla = new Phaser.Math.Vector2(11, 21); //704, 1344
///** Tamaño Tiles */
export var _TT = 64;
export var _IdEnemigos = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export var _IdMapas = [1];
export var _MuestroFPS = false; //0.9; //Para cuadricula y Path
export var _VidasMaximas = 20; //0.9; //Para cuadricula y Path
//#endregion









  //export {Tools};

