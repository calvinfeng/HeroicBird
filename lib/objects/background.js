const _imgHeight = 768;
const _imgWidth = 1366;
const spriteImage = new Image(_imgWidth, _imgHeight);

spriteImage.src = "./rsc/image/background-city.png";
class Background {
  constructor(DIM_X, DIM_Y) {
    this.DIM_X = DIM_X;
    this.DIM_Y = DIM_Y;
  }

  draw(ctx) {
    ctx.drawImage(
      spriteImage, 0, 0, _imgWidth, _imgHeight,
      0,
      this.DIM_Y - this.DIM_X*_imgHeight/_imgWidth,
      this.DIM_X,
      this.DIM_X*_imgHeight/_imgWidth
    );
  }
}

module.exports = Background;
