const MovingObject = require('./moving-object.js');

const _width = 184;
const _height = 325;
const _fullWidth = 1472;

const _spriteImage = new Image(_width, _height);
_spriteImage.src = "./rsc/image/pedestrian.png";
class Pedestrian extends MovingObject {
  constructor(pos, DIM_X, DIM_Y) {
    super({
      pos: pos,
      DIM_X: DIM_X,
      DIM_Y: DIM_Y
    });
    this.vel = [5,0];
    this.radian = 0;
    this.alive = true;
    this.safety = false;
    this.sx = 0;
    this.isFacingLeft = false;
  }

  draw(ctx) {
    let orientedPerson = this.orientateAndCache(_spriteImage);
    ctx.drawImage(orientedPerson, 0, 0, _width, _height,
      this.pos[0] - (_width/4), this.pos[1] - (_height/4), _width/4, _height/4);
  }

  orientateAndCache(img) {
    let offscreenCanvas = document.createElement('canvas');
    let offscreenCtx = offscreenCanvas.getContext('2d');

    offscreenCanvas.width = img.width;
    offscreenCanvas.height = img.height;

    if (this.isFacingLeft) {
      offscreenCtx.translate(img.width, 0);
      offscreenCtx.scale(-1, 1);
    }
    offscreenCtx.drawImage(img, this.sx, 0, img.width, img.height,
      0, 0, img.width, img.height);

    this.sx += _width;
    if (this.sx === _fullWidth) {
      this.sx -= _fullWidth;
    }
    return offscreenCanvas;
  }

  setDead() {
    this.alive = false;
  }

  setSafety() {
    this.safety = true;
  }

  isAlive() {
    return this.alive;
  }

  isSaved() {
    return this.safety;
  }

  isCollidedWith(otherObject) {
    if (this.isMoving() || otherObject.isMoving()) {
      let objectDist = this.dist(this.pos, otherObject.pos);
      return (objectDist < 65);
    } else {
      return false;
    }
  }

  updateSafetyStatus() {
    if (this.pos[0] > this.DIM_X && this.isAlive()) {
      this.setSafety();
    }
  }
}
module.exports = Pedestrian;
