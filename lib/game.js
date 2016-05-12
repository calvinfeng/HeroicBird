var SkyExplosion = require('./sky-explosion.js');
var GroundExplosion = require('./ground-explosion.js');
var Meteorite = require('./meteorite.js');
var Background = require('./background.js');

function Game(canvasWidth, canvasHeight, ship) {
  this.DIM_X = canvasWidth;
  this.DIM_Y = canvasHeight;
  this.meteorites = [];
  this.explosions = [];
  this.spacecraft = ship;
  this.addMeteorites();
  this.background = new Background(canvasWidth, canvasHeight);
}

Game.prototype.step = function() {
  this.checkGroundCollisions();
  this.checkSkyCollisions();
  this.accelObjects();
  this.moveObjects();
  this.addMeteorites();
  this.spacecraft.checkIsHittingWall();
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

  this.spacecraft.draw(ctx);
};

Game.prototype.addMeteorites = function() {
  while (this.meteorites.length < 10) {
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
  this.spacecraft.move();
};

var _gravity = [0, 0.1];
Game.prototype.accelObjects = function() {
  this.meteorites.forEach(function(meteorite) {
    if (meteorite.isActive()) {
      meteorite.accelerate(_gravity);
    }
  });
  this.spacecraft.accelerate(_gravity);
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

Game.prototype.allObjects = function() {
  return [].concat(this.meteorites, this.spacecraft);
};

Game.prototype.checkSkyCollisions = function() {
  for (var i = 0; i < this.allObjects().length - 1; i++) {
    for (var j = i + 1; j < this.allObjects().length; j++) {
      if (this.allObjects()[i].isCollidedWith(this.allObjects()[j])) {
        this.addSkyExplosion(this.allObjects()[i].getPosition());
        this.allObjects()[i].setInactive();
        this.allObjects()[j].setInactive();
      }
    }
  }
};


module.exports = Game;
