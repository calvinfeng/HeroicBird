var MovingObject = require('./moving-object.js');
var Util = require('./util.js');

function Pedestrian(pos, DIM_X, DIM_Y) {
  MovingObject.call(this, {
    pos: pos,
    DIM_X: DIM_X,
    DIM_Y: DIM_Y
  });
  this.vel = [5,0];
  this.radian = 0;

  this.width = 184;
  this.height = 325;
  this.spriteImage = new Image(this.width, this.height);
  this.spriteImage.src = "./rsc/image/pedestrian.png";

  this.alive = true;
  this.sx = 0;
  this.isFacingLeft = false;
}

Util.inherits(Pedestrian, MovingObject);

Pedestrian.prototype.draw = function(context) {
  var orientedPerson = this.orientateAndCache(this.spriteImage);
  context.drawImage(orientedPerson, 0, 0, this.width, this.height,
    this.pos[0] - (this.width/4), this.pos[1] - (this.height/4) - 50, this.width/4, this.height/4);
};

var _fullWidth = 1472;
Pedestrian.prototype.orientateAndCache = function(img) {
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

  this.sx += this.width;
  if (this.sx === _fullWidth) {
    this.sx -= _fullWidth;
  }
  return offscreenCanvas;
};

Pedestrian.prototype.isAlive = function() {
  return this.alive;
};

module.exports = Pedestrian;