var Explosion = require('./explosion');
var Util = require('./util');

function GroundExplosion(pos) {
  // Classical prototypal inheritance, ES6 has better syntax
  Explosion.call(this, {
    pos: pos,
    width: 50,
    height: 128,
    fullWidth: 900,
    imageSrc: "./rsc/image/ground-explosion-sprite.png",
    audioSrc: "./rsc/sound/ground-explosion.mp3"
  });
}
Util.inherits(GroundExplosion, Explosion);

module.exports = GroundExplosion;
