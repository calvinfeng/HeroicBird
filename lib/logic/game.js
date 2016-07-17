const SkyExplosion = require('../objects/sky-explosion.js');
const GroundExplosion = require('../objects/ground-explosion.js');
const Meteorite = require('../objects/meteorite.js');
const Pedestrian = require('../objects/pedestrian.js');
const Background = require('../objects/background.js');

const _gravity = [0, 0.1];
class Game {
  constructor(canvasWidth, canvasHeight, bird) {
    this.DIM_X = canvasWidth;
    this.DIM_Y = canvasHeight;
    this.background = new Background(canvasWidth, canvasHeight);
    this.initObjects(bird);
    this.deadCount = 0;
    this.saveCount = 0;
  }

  initObjects(bird) {
    this.meteorites = [];
    this.explosions = [];
    this.pedestrians = [];
    this.bird = bird;
    this.addMeteorites();
  }

  step() {
    this.checkGroundCollisions();
    this.checkSkyCollisions();
    this.checkCollisionOnPedestrians();
    this.addMeteorites();
    this.addPeople();
    this.accelObjects();
    this.moveObjects();
    this.updateSafetyStatus();
    this.bird.wrapIfHittingWall();
  }

  draw(ctx) {
    ctx.clearRect(0, 0, this.DIM_X, this.DIM_Y);
    // Create gradient & Add colors
    let grd = ctx.createLinearGradient(226.000, 300.000, 74.000, 0.000);
    grd.addColorStop(0.000, 'rgba(0, 169, 255, 1.000)');
    grd.addColorStop(1.000, 'rgba(255, 255, 255, 1.000)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, this.DIM_X, this.DIM_Y);
    //==================================================================
    this.background.draw(ctx);
    this.bird.draw(ctx);
    this.drawExplosions(ctx);
    this.drawMeteorites(ctx);
    this.drawPedestrians(ctx);
  }

  drawMeteorites(ctx) {
    let i = this.meteorites.length - 1;
    while (i >= 0) {
      if (this.meteorites[i].isActive()) {
        this.meteorites[i].draw(ctx);
      } else {
        this.meteorites.splice(i, 1);
      }
      i -=1 ;
    }
  }

  drawPedestrians(ctx) {
    let i = this.pedestrians.length - 1;
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
  }

  drawExplosions(ctx) {
    let i = this.explosions.length - 1;
    while (i >= 0) {
      if (this.explosions[i].isActive()) {
        this.explosions[i].draw(ctx);
      } else {
        this.explosions.splice(i, 1);
      }
      i -= 1;
    }
  }

  allObjects() {
    return [].concat(this.meteorites, this.bird);
  }

  getDeathToll() {
    return this.deadCount;
  }

  isGameOver() {
    return this.deadCount === 20;
  }

  getNumOfLivesSaved() {
    return this.saveCount;
  }

  addGroundExplosion(pos) {
    this.explosions.push(new GroundExplosion(pos));
  }

  addSkyExplosion(pos) {
    this.explosions.push(new SkyExplosion(pos));
  }

  addMeteorites() {
    while (this.meteorites.length < 5) {
      this.meteorites.push(new Meteorite(this.randomPos(), this.DIM_X, this.DIM_Y));
    }
  }

  addPeople() {
    while (this.pedestrians.length < 5) {
      this.pedestrians.push(new Pedestrian([Math.random()*(-this.DIM_X), this.DIM_Y - 50],
      this.DIM_X, this.DIM_Y));
    }
  }

  moveObjects() {
    this.bird.move();
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
  }

  accelObjects() {
    this.meteorites.forEach(function(meteorite) {
      if (meteorite.isActive()) {
        meteorite.accelerate(_gravity);
      }
    });
    this.bird.accelerate(_gravity);
  }

  randomPos() {
    let randx = Math.floor(Math.random() * this.DIM_X + 1);
    return [randx, 0];
  }

  checkGroundCollisions() {
    for (let i = 0; i < this.meteorites.length; i++) {
      if (this.meteorites[i].isCollidedWithGround() && this.meteorites[i].isActive()) {
        this.meteorites[i].setInactive();
        this.addGroundExplosion(this.meteorites[i].getPosition());
      } else if (this.meteorites[i].isOutOfBound() && this.meteorites[i].isActive()) {
        this.meteorites[i].setInactive();
      }
    }
  }

  checkSkyCollisions() {
    for (let i = 0; i < this.allObjects().length - 1; i++) {
      for (let j = i + 1; j < this.allObjects().length; j++) {
        if (this.allObjects()[i].isCollidedWith(this.allObjects()[j])) {
          this.addSkyExplosion(this.allObjects()[i].getPosition());
          this.allObjects()[i].setInactive();
          this.allObjects()[j].setInactive();
        }
      }
    }
  }

  checkCollisionOnPedestrians() {
    for (let i = 0; i < this.pedestrians.length; i++) {
      for (let j = 0; j < this.meteorites.length; j++) {
        if (this.pedestrians[i].isCollidedWith(this.meteorites[j])) {
          this.addSkyExplosion(this.pedestrians[i].getPosition());
          this.meteorites[j].setInactive();
          this.pedestrians[i].setDead();
        }
      }
    }
  }

  updateSafetyStatus() {
    this.pedestrians.forEach(function(person) {
      person.updateSafetyStatus();
    });
  }
}
module.exports = Game;
