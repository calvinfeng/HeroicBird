var SkyExplosion = require('./sky-explosion.js');
var GroundExplosion = require('./ground-explosion.js');
var Meteorite = require('./meteorite.js');
var Pedestrian = require('./pedestrian.js');
var Background = require('./background.js');

function Game(canvasWidth, canvasHeight, bird) {
  this.DIM_X = canvasWidth;
  this.DIM_Y = canvasHeight;
  this.meteorites = [];
  this.explosions = [];
  this.pedestrians = [];
  this.bird = bird;
  this.addMeteorites();
  this.deadCount = 0;
  this.saveCount = 0;
  this.background = new Background(canvasWidth, canvasHeight);
}

Game.prototype.step = function() {
  this.checkGroundCollisions();
  this.checkSkyCollisions();
  this.checkCollisionOnPedestrians();
  this.addMeteorites();
  this.addPeople();
  this.accelObjects();
  this.moveObjects();
  this.updateSafetyStatus();
  this.bird.wrapIfHittingWall();
};

Game.prototype.draw = function(ctx) {
  var i, grd;
  ctx.clearRect(0, 0, this.DIM_X, this.DIM_Y);

  grd = ctx.createLinearGradient(150.000, 0.000, 150.000, 300.000);
  grd.addColorStop(0.000, 'rgba(0, 88, 242, 1.000)');
  grd.addColorStop(1.000, 'rgba(0, 179, 224, 1.000)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, this.DIM_X, this.DIM_Y);

  this.background.drawGrassyGround(ctx);

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

  i = this.pedestrians.length - 1;
  while (i >= 0) {
    if (this.pedestrians[i].isAlive() && this.pedestrians[i].isSaved()) {
      this.saveCount += 1;
      this.pedestrians.splice(i, 1);
    } else if (this.pedestrians[i].isAlive()) {
      this.pedestrians[i].draw(ctx);
    } else {
      this.deadCount += 1;
      this.pedestrians.splice(i, 1);
    }
    i -= 1;
  }

  this.bird.draw(ctx);
};

Game.prototype.getDeathToll = function() {
  return this.deadCount;
};

Game.prototype.getNumOfLivesSaved = function() {
  return this.saveCount;
};

Game.prototype.addMeteorites = function() {
  while (this.meteorites.length < 5) {
    this.meteorites.push(new Meteorite(this.randomPos(), this.DIM_X, this.DIM_Y));
  }
};

Game.prototype.addPeople = function() {
  while (this.pedestrians.length < 5) {
    this.pedestrians.push(new Pedestrian([Math.random()*(-this.DIM_X), this.DIM_Y - 50],
      this.DIM_X, this.DIM_Y));
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

  this.pedestrians.forEach(function(pedestrian) {
    if (pedestrian.isAlive()) {
      pedestrian.move();
    }
  });

  this.bird.move();
};

var _gravity = [0, 0.1];
Game.prototype.accelObjects = function() {
  this.meteorites.forEach(function(meteorite) {
    if (meteorite.isActive()) {
      meteorite.accelerate(_gravity);
    }
  });
  this.bird.accelerate(_gravity);
};

Game.prototype.randomPos = function() {
  //randomPos is for meteorites;
  var randx = Math.floor(Math.random() * this.DIM_X + 1);
  return [randx, 0];
};

Game.prototype.allObjects = function() {
  return [].concat(this.meteorites, this.bird);
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

Game.prototype.checkCollisionOnPedestrians = function() {

  for (var i = 0; i < this.pedestrians.length; i++) {
    for (var j = 0; j < this.meteorites.length; j++) {
      if (this.pedestrians[i].isCollidedWith(this.meteorites[j])) {
        console.log("it's checking");
        this.addSkyExplosion(this.pedestrians[i].getPosition());
        this.meteorites[j].setInactive();
        this.pedestrians[i].setDead();
      }
    }
  }
};

Game.prototype.updateSafetyStatus = function() {
  this.pedestrians.forEach(function(person) {
    person.updateSafetyStatus();
  });
};


module.exports = Game;
