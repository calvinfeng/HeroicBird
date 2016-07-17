const Explosion = require('./explosion');
const imageSrc = "./rsc/image/explosion-sprite.png";
const audioSrc = "./rsc/sound/sky-explosion.mp3";

class SkyExplosion extends Explosion {
  constructor(pos) {
    super({
      pos: pos,
      width: 134,
      height: 134,
      fullWidth: 1608,
      imageSrc: imageSrc,
      audioSrc: audioSrc
    });
  }
}

module.exports = SkyExplosion;
