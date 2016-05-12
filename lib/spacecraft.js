var MovingObject = require('./moving-object.js');
var Util = require('./util.js');

function Spacecraft(pos, DIM_X, DIM_Y) {
  MovingObject.call(this, {
    pos: pos,
    DIM_X: DIM_X,
    DIM_Y: DIM_Y
  });
  this.vel = [0,0];
  this.radian = 0;

  this.width = 99;
  this.height = 154;
  this.spriteImage = new Image(this.width, this.height);
  this.spriteImage.src = "./rsc/image/spaceship-sprite.png";

  this.sx = 0;
  this.sy = 0;
  this.isThrusterOn = false;
}

Util.inherits(Spacecraft, MovingObject);

Spacecraft.prototype.draw = function(context) {
  if (this.isThrusterOn) {
    this.sy = this.height;
  } else {
    this.sy = 0;
  }
  var rotatedObj = this.rotateAndCache(this.spriteImage);
  context.drawImage(rotatedObj, 0, 0, this.width, this.height,
    this.pos[0] - (this.width/2), this.pos[1] - (this.height/2), this.width/2, this.height/2);
};

var _fullWidth = 396; // this is the full width of the sprite image
Spacecraft.prototype.rotateAndCache = function(img) {
  var offscreenCanvas = document.createElement('canvas');
  var offscreenCtx = offscreenCanvas.getContext('2d');

  offscreenCanvas.width = img.width;
  offscreenCanvas.height = img.height;

  offscreenCtx.translate(img.width/2, img.height/2);
  offscreenCtx.rotate(this.radian);
  offscreenCtx.drawImage(img, this.sx, this.sy, img.width, img.height,
    (-img.width/2), (-img.height/2), img.width, img.height);

  this.sx += this.width;
  if (this.sx === _fullWidth) {
    this.sx -= _fullWidth;
  }
  return offscreenCanvas;
};

Spacecraft.prototype.setThrusterOn = function() {
  this.isThrusterOn = true;
};

Spacecraft.prototype.setThrusterOff = function() {
  this.isThrusterOn = false;
};

Spacecraft.prototype.rotateClockwise = function() {
  if (this.radian < Math.PI/2) {
    this.radian += 10*Math.PI/180;
  }
};

Spacecraft.prototype.rotateCounterClockwise = function() {
  if (this.radian > -Math.PI/2) {
    this.radian -= 10*Math.PI/180;
  }
};

var _thrustForce = 0.50;
Spacecraft.prototype.accelerate = function(accel) {
  this.vel[0] += accel[0];
  this.vel[1] += accel[1];
  if (this.isThrusterOn) {
    this.vel[0] += -1*_thrustForce*Math.cos(this.radian + Math.PI/2);
    this.vel[1] += -1*_thrustForce*Math.sin(this.radian + Math.PI/2);
  }
  //this.radian = this.findRadian();
};


module.exports = Spacecraft;
