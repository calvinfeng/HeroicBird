var SkyExplosion = require('./sky-explosion.js');
var GroundExplosion = require('./ground-explosion.js');
var Meteorite = require('./meteorite.js');
var Background = require('./background.js');

function Game(canvasWidth, canvasHeight) {
  this.DIM_X = canvasWidth;
  this.DIM_Y = canvasHeight;
  this.meteorites = [];
  this.explosions = [];
  this.addMeteorites();
  this.background = new Background(canvasWidth, canvasHeight);
}

Game.prototype.step = function() {
  this.checkGroundCollisions();
  this.checkSkyCollisions();
  this.accelObjects();
  this.moveObjects();
  this.addMeteorites();
};

Game.prototype.draw = function(ctx) {
  var i;
  ctx.clearRect(0, 0, this.DIM_X, this.DIM_Y);
  this.background.drawGround(ctx);
  this.background.drawMountain(ctx);

  i = this.meteorites.length - 1;
  while (i >= 0) {
    if (this.meteorites[i].isActive()) {
      this.meteorites[i].draw(ctx);
    } else {
      this.meteorites.splice(i, 1);
    }
    i -=1 ;
  }

  i = this.explosions.length - 1;
  while (i >= 0) {
    if (this.explosions[i].isActive()) {
      this.explosions[i].draw(ctx);
    } else {
      this.explosions.splice(i, 1);
    }
    i -= 1;
  }
};

Game.prototype.addMeteorites = function() {
  while (this.meteorites.length < 7) {
    this.meteorites.push(new Meteorite(this.randomPos(), this.DIM_X, this.DIM_Y));
  }
};

Game.prototype.addGroundExplosion = function(pos) {
  this.explosions.push(new GroundExplosion(pos));
};

Game.prototype.addSkyExplosion = function(pos) {
  this.explosions.push(new SkyExplosion(pos));
};

Game.prototype.moveObjects = function() {
  this.meteorites.forEach(function(meteorite) {
    if (meteorite.isActive()) {
      meteorite.move();
    }
  });
};

var _gravity = [0, 0.05];
Game.prototype.accelObjects = function() {
  this.meteorites.forEach(function(meteorite) {
    if (meteorite.isActive()) {
      meteorite.accelerate(_gravity);
    }
  });
};

Game.prototype.randomPos = function() {
  //randomPos is for meteorites;
  var randx = Math.floor(Math.random() * this.DIM_X + 1);
  return [randx, 0];
};

Game.prototype.checkGroundCollisions = function() {
  for (var i = 0; i < this.meteorites.length; i++) {
    if (this.meteorites[i].isCollidedWithGround() && this.meteorites[i].isActive()) {
      this.meteorites[i].setInactive();
      this.addGroundExplosion(this.meteorites[i].getPosition());
    } else if (this.meteorites[i].isOutOfBound() && this.meteorites[i].isActive()) {
      this.meteorites[i].setInactive();
    }
  }
};

Game.prototype.checkSkyCollisions = function() {
  for (var i = 0; i < this.meteorites.length - 1; i++) {
    for (var j = i + 1; j < this.meteorites.length; j++) {
      if (this.meteorites[i].isCollidedWith(this.meteorites[j])) {
        this.addSkyExplosion(this.meteorites[i].getPosition());
        this.meteorites[i].setInactive();
        this.meteorites[j].setInactive();
      }
    }
  }
};


module.exports = Game;
