const MovingObject = require('./moving-object.js');

const _width = 512;
const _height = 512;
const _displaySize = 100;
const _fullWidth = 3072;

const _spriteImage = new Image(_width, _height);
_spriteImage.src = "./rsc/image/meteorite-sprite.png";
class Meteorite extends MovingObject {
  constructor(pos, DIM_X, DIM_Y) {
    super({
      pos: pos,
      DIM_X: DIM_X,
      DIM_Y: DIM_Y
    });
    this.vel = this.randomVel();
    this.radian = this.findRadian();
    this.sx = 0;
  }

  draw(ctx) {
    let rotatedObj = this.rotateAndCache(_spriteImage);
    ctx.drawImage(rotatedObj, 0, 0, _width, _height,
      this.pos[0] - (_displaySize/2), this.pos[1] - (_displaySize/2), _displaySize, _displaySize);
  }

  rotateAndCache(img) {
    let offscreenCanvas = document.createElement('canvas');
    let offscreenCtx = offscreenCanvas.getContext('2d');

    offscreenCanvas.width = img.width;
    offscreenCanvas.height = img.height;

    offscreenCtx.translate(img.width/2, img.height/2);
    offscreenCtx.rotate(this.radian);
    offscreenCtx.drawImage(img, this.sx, 0, img.width, img.height,
      (-img.width/2), (-img.height/2), img.width, img.height);
    // offscreenCtx.translate(-img.width/2, -img.height/2);
    this.sx += _width;
    if (this.sx === _fullWidth) {
      this.sx -= _fullWidth;
    }
    return offscreenCanvas;
  }

  randomVel() {
    if (this.pos[0] < this.DIM_X/2) {
      return [Math.random()*5 + 1, Math.random()*5 + 1];
    } else {
      return [-(Math.random()*5 + 1), Math.random()*5 + 1];
    }
  }

  isCollidedWithGround() {
    if (this.pos[0] > 0 && this.pos[0] < this.DIM_X) {
      if (this.pos[1] >= this.DIM_Y - 100) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
module.exports = Meteorite;
