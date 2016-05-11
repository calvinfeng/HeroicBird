var MovingObject = require('./moving-object.js');

function Meteorite(pos, DIM_X, DIM_Y) {
  this.width = 512;
  this.height = 512;
  this.spriteImage = new Image(512,512);
  this.spriteImage.src = "./rsc/image/meteorite-sprite.png";

  this.activeState = true;
  this.DIM_Y = DIM_Y;
  this.DIM_X = DIM_X;
  this.pos = pos;
  this.vel = this.randomVel();
  this.radian = this.findRad();

  this.sx = 0;
}

Meteorite.prototype.isActive = function() {
  return this.activeState;
};

Meteorite.prototype.setInactive = function() {
  this.activeState = false;
};

Meteorite.prototype.getPosition = function() {
  return this.pos.slice();
};

Meteorite.prototype.findRad = function() {
  if (this.vel[0] > 0 && this.vel[1] > 0) {
    //Quadrant 1
    return Math.atan(this.vel[1]/this.vel[0]);
  } else if (this.vel[0] < 0 && this.vel[1] > 0) {
    //Quadrant 2
    return (Math.atan(this.vel[1]/this.vel[0])+ Math.PI);
  } else if (this.vel[0] < 0 && this.vel[1] < 0) {
    //Quadrant 3
    return (Math.atan(this.vel[1]/this.vel[0]) + Math.PI);
  } else {
    //Quadrant 4
    return (Math.atan(this.vel[1]/this.vel[0]));
  }
};

Meteorite.prototype.move = function() {
  this.pos[0] += this.vel[0];
  this.pos[1] += this.vel[1];
};

Meteorite.prototype.accelerate = function(accel) {
  this.vel[0] += accel[0];
  this.vel[1] += accel[1];
  this.radian = this.findRad();
};

var _displaySize = 100;
Meteorite.prototype.draw = function(context) {
  var rotatedObj = this.rotateAndCache(this.spriteImage);
  context.drawImage(rotatedObj, 0, 0, this.width, this.height,
    this.pos[0] - (_displaySize/2), this.pos[1] - (_displaySize/2), _displaySize, _displaySize);
};

var _fullWidth = 3072; // this is the full width of the sprite image
Meteorite.prototype.rotateAndCache = function(img) {
  var offscreenCanvas = document.createElement('canvas');
  var offscreenCtx = offscreenCanvas.getContext('2d');

  offscreenCanvas.width = img.width;
  offscreenCanvas.height = img.height;

  offscreenCtx.translate(img.width/2, img.height/2);
  offscreenCtx.rotate(this.radian);
  offscreenCtx.drawImage(img, this.sx, 0, img.width, img.height,
    (-img.width/2), (-img.height/2), img.width, img.height);
  // offscreenCtx.translate(-img.width/2, -img.height/2);
  this.sx += this.width;
  if (this.sx === _fullWidth) {
    this.sx -= _fullWidth;
  }
  return offscreenCanvas;
};

Meteorite.prototype.randomVel = function() {
  if (this.pos[0] < this.DIM_X/2) {
    return [Math.random()*5 + 1, Math.random()*5 + 1];
  } else {
    return [-(Math.random()*5 + 1), Math.random()*5 + 1];
  }
};

Meteorite.prototype.isCollidedWithGround = function() {
  if (this.pos[0] > 0 && this.pos[0] < this.DIM_X) {
    if (this.pos[1] >= this.DIM_Y - 50) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

Meteorite.prototype.isOutOfBound = function() {
  return (this.pos[0] < 0 || this.pos[0] > this.DIM_X) ||
    (this.pos[1] < 0 || this.pos[1] > this.DIM_Y);
};

Meteorite.prototype.isCollidedWith = function(otherObject) {
  var objectDist = MovingObject.dist(this.pos, otherObject.pos);
  console.log("Object Distance: ", objectDist);
  return (objectDist < 30);
};

module.exports = Meteorite;
