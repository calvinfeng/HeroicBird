class Explosion {
  constructor(args) {
    this.width = args.width;
    this.height = args.height;
    this.fullWidth = args.fullWidth;
    this.spriteImage = new Image(this.width, this.height);
    this.spriteImage.src = args.imageSrc;
    this.audioSrc = args.audioSrc;
    this.pos = args.pos;
    this.activeState = true;
    this.sx = 0;
  }

  draw(ctx) {
    if (this.sx === 0) { this.playSound(); }
    ctx.drawImage(this.spriteImage, this.sx, 0, this.width, this.height,
      this.pos[0]-(this.width/2), this.pos[1]-(this.height/2), this.width, this.height);
    this.sx += this.width;
    if (this.sx === this.fullWidth) {
      this.activeState = false;
    }
  }

  playSound() {
    let sound = new Audio(this.audioSrc);
    sound.play();
  }

  isActive() {
    return this.activeState;
  }
}
module.exports = Explosion;
