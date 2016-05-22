var Explosion = require('./explosion');
var Util = require('./util');

function SkyExplosion(pos) {
  // Classical prototypal inheritance, ES6 has better syntax
  Explosion.call(this, {
    pos: pos,
    width: 134,
    height: 134,
    fullWidth: 1608,
    imageSrc: "./rsc/image/explosion-sprite.png",
    audioSrc: "./rsc/sound/sky-explosion.mp3"
  });
}
Util.inherits(SkyExplosion, Explosion);

module.exports = SkyExplosion;
