const Explosion = require('./explosion');
const imageSrc = "./rsc/image/ground-explosion-sprite.png";
const audioSrc = "./rsc/sound/ground-explosion.mp3";

class GroundExplosion extends Explosion {
  constructor(pos) {
    super({
      pos: pos,
      width: 50,
      height: 128,
      fullWidth: 900,
      imageSrc: imageSrc,
      audioSrc: audioSrc
    });
  }
}
module.exports = GroundExplosion;
