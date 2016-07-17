const MovingObject = require('./moving-object.js');

const _width = 98.5;
const _height = 66;
const _fullWidth = 788;
const _spriteImage = new Image(_width, _height);

_spriteImage.src = "./rsc/image/flappy-bird-sprite.png";
class Bird extends MovingObject {
  constructor(pos, DIM_X, DIM_Y) {
    super({
      pos: pos,
      DIM_X: DIM_X,
      DIM_Y: DIM_Y
    });
    this.vel = [0,0];
    this.radian = 0;
    this.sx = 0;
    this.isFlapping = false;
    this.isFacingLeft = false;
  }

  draw(ctx) {
    let orientedBird = this.orientateAndCache(_spriteImage);
    ctx.drawImage(orientedBird, 0, 0, _width, _height,
      this.pos[0] - (_width/2), this.pos[1] - (_height/2) - 10, _width/2, _height/2);
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

    if (this.isFlapping) {
      this.sx += _width;
      if (this.sx === _fullWidth) {
        this.sx -= _fullWidth;
      }
    }
    return offscreenCanvas;
  }

  getVerticalVelocity() {
    return this.vel[1];
  }

  startFlapping() {
    this.isFlapping = true;
  }

  stopFlapping() {
    this.isFlapping = false;
  }

  wrapIfHittingWall() {
    if (this.pos[0] - (_width/2) < 0 ) {
      this.pos[0] = this.DIM_X;
    } else if (this.pos[0] > this.DIM_X) {
      this.pos[0] = _width/2;
    }

    if (this.pos[1] - (_height/2) <= 0) {
      this.vel[1] = 0;
      this.pos[1] = (_height/2);
    } else if (this.pos[1] + (_height/2) >= this.DIM_Y) {
      this.vel[0] = 0;
      this.vel[1] = 0;
      this.pos[1] = this.DIM_Y - (_height/2);
    }
  }

  accelerate(accel) {
    this.vel[0] += accel[0];
    this.vel[1] += accel[1];
    if (this.isFlapping) {
      this.vel[1] -= 0.40;
    }
  }

  setFaceLeft() {
    this.isFacingLeft = true;
  }

  setFaceRight() {
    this.isFacingLeft = false;
  }

  moveLeft() {
    this.setFaceLeft();
    if (this.vel[0] > 0) {
      this.vel[0] = 0;
    }
    this.vel[0] = -12;
  }

  moveRight() {
    this.setFaceRight();
    if (this.vel[0] < 0) {
      this.vel[0] = 0;
    }
    this.vel[0] = 12;
  }
}
module.exports = Bird;
