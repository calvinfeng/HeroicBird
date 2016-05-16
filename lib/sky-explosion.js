function SkyExplosion(pos) {
  this.width = 134;
  this.height = 134;
  this.spriteImage = new Image(134,134);
  this.spriteImage.src = "./rsc/image/explosion-sprite.png";
  this.activeState = true;
  this.pos = pos;
  this.sx = 0;
}

var _fullWidth = 1608;
SkyExplosion.prototype.draw = function(context) {
  if (this.sx === 0) {
    this.playSound();
  }

  context.drawImage(this.spriteImage, this.sx, 0, this.width, this.height,
    this.pos[0]-(this.width/2), this.pos[1]-(this.height/2), this.width, this.height);

  this.sx += 134;
  if (this.sx === _fullWidth) {
    this.activeState = false;
  }
};

SkyExplosion.prototype.playSound = function() {
  var sound = new Audio('./rsc/sound/sky-explosion.mp3');
  sound.play();
};

SkyExplosion.prototype.isActive = function() {
  return this.activeState;
};

module.exports = SkyExplosion;
