var MovingObject = require('./moving-object.js');
var Util = require('./util.js');

function Meteorite(pos, DIM_X, DIM_Y) {
  MovingObject.call(this, {
    pos: pos,
    DIM_X: DIM_X,
    DIM_Y: DIM_Y
  });
  this.vel = this.randomVel();
  this.radian = this.findRadian();

  this.width = 512;
  this.height = 512;
  this.spriteImage = new Image(this.width, this.height);
  this.spriteImage.src = "./rsc/image/meteorite-sprite.png";

  this.sx = 0;
}

Util.inherits(Meteorite, MovingObject);

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
    if (this.pos[1] >= this.DIM_Y - 100) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

module.exports = Meteorite;
