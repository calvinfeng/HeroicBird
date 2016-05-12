var MovingObject = require('./moving-object.js');
var Util = require('./util.js');

function Bird(pos, DIM_X, DIM_Y) {
  MovingObject.call(this, {
    pos: pos,
    DIM_X: DIM_X,
    DIM_Y: DIM_Y
  });
  this.vel = [0,0];
  this.radian = 0;

  this.width = 98.5;
  this.height = 66;
  this.spriteImage = new Image(this.width, this.height);
  this.spriteImage.src = "./rsc/image/flappy-bird-sprite.png";

  this.sx = 0;
  this.isFlapping = false;
  this.isFacingLeft = false;
}

Util.inherits(Bird, MovingObject);

var _fullWidth = 788;
Bird.prototype.draw = function(context) {
  var orientedBird = this.orientateAndCache(this.spriteImage);
  context.drawImage(orientedBird, 0, 0, this.width, this.height,
    this.pos[0] - (this.width/2), this.pos[1] - (this.height/2) - 10, this.width/2, this.height/2);
};

Bird.prototype.orientateAndCache = function(img) {
  var offscreenCanvas = document.createElement('canvas');
  var offscreenCtx = offscreenCanvas.getContext('2d');

  offscreenCanvas.width = img.width;
  offscreenCanvas.height = img.height;

  if (this.isFacingLeft) {
    offscreenCtx.translate(img.width, 0);
    offscreenCtx.scale(-1, 1);
  }
  offscreenCtx.drawImage(img, this.sx, 0, img.width, img.height,
    0, 0, img.width, img.height);

  if (this.isFlapping) {
    this.sx += this.width;
    if (this.sx === _fullWidth) {
      this.sx -= _fullWidth;
    }
  }
  return offscreenCanvas;
};


Bird.prototype.startFlapping = function() {
  this.isFlapping = true;
};

Bird.prototype.stopFlapping = function() {
  this.isFlapping = false;
};

Bird.prototype.wrapIfHittingWall = function() {
  if (this.pos[0] - (this.width/2) < 0 ) {
    this.pos[0] = this.pos[0] + this.DIM_X;
  } else if (this.pos[0] + (this.width/2) > this.DIM_X) {
    this.pos[0] = this.pos[0] % this.DIM_X;
  }

  if (this.pos[1] - (this.height/2) <= 0) {
    this.vel[1] = 0;
    this.pos[1] = (this.height/2);
  } else if (this.pos[1] + (this.height/2) >= this.DIM_Y) {
    this.vel[0] = 0;
    this.vel[1] = 0;
    this.pos[1] = this.DIM_Y - (this.height/2);
  }
};

Bird.prototype.accelerate = function(accel) {
  this.vel[0] += accel[0];
  this.vel[1] += accel[1];
  if (this.isFlapping) {
    this.vel[1] -= 0.25;
  }
};

Bird.prototype.setFaceLeft = function() {
  this.isFacingLeft = true;
};

Bird.prototype.setFaceRight = function() {
  this.isFacingLeft = false;
};

Bird.prototype.moveLeft = function() {
  this.setFaceLeft();
  if (this.vel[0] > 0) {
    this.vel[0] = 0;
  }
  this.vel[0] = -5;
};

Bird.prototype.moveRight = function() {
  this.setFaceRight();
  if (this.vel[0] < 0) {
    this.vel[0] = 0;
  }
  this.vel[0] = 5;
};

module.exports = Bird;
