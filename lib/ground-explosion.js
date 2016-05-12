function GroundExplosion(pos) {
  this.width = 50;
  this.height = 128;
  this.spriteImage = new Image(50,128);
  this.spriteImage.src = "./rsc/image/ground-explosion-sprite.png";
  this.activeState = true;
  this.pos = pos;
  this.sx = 0;
}

var _fullWidth = 900;
GroundExplosion.prototype.draw = function(context) {
  if (this.sx === 0) {
    this.playSound();
  }

  context.drawImage(this.spriteImage, this.sx, 0, this.width, this.height,
    this.pos[0]-(this.width/2), this.pos[1]-(this.height/2), this.width, this.height);

  this.sx += 50;
  if (this.sx === _fullWidth) {
    this.activeState = false;
  }
};

GroundExplosion.prototype.playSound = function() {
  var sound = new Audio('./rsc/sound/ground-explosion.mp3');
  sound.play();
};

GroundExplosion.prototype.isActive = function() {
  return this.activeState;
};

module.exports = GroundExplosion;
