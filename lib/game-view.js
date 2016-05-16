var Game = require("./game.js");
var key = require("./keymaster.js");
var Bird = require('./bird.js');

function GameView(canvas) {
  this.ctx = canvas.getContext("2d");
  this.bird = new Bird([canvas.width/2, 0], canvas.width, canvas.height);
  this.game = new Game(canvas.width, canvas.height, this.bird);
  this.isPause = true;
  this.bindKeyHandlers();
}

GameView.prototype.initInstructions = function() {

};

GameView.prototype.start = function() {
  var self, liveCount, deadCount, speed;

  self = this;
  this.isPause = false;
  this.gameInterval = setInterval(function() {
    self.game.step();
    self.game.draw(self.ctx);
    deadCount = self.game.getDeathToll();
    liveCount = self.game.getNumOfLivesSaved();
    speed = self.bird.getVerticalVelocity();
    self.updateStatus(deadCount, liveCount);
    self.updateSpeed(speed);
    self.checkIfPause();
  }, 50);
};

GameView.prototype.checkIfPause = function() {
  if (this.isPause) {
    clearInterval(this.gameInterval);
  }
};

GameView.prototype.pause = function(event) {
  event.preventDefault();
  this.isPause = true;
};

GameView.prototype.bindKeyHandlers = function() {
  var self = this;
  key('space', function() {
    self.bird.startFlapping();
  });

  $(document).keyup(function() {
    self.bird.stopFlapping();
  });

  key('left, a', function() {
    self.bird.moveLeft();
  });

  key('right, d', function() {
    self.bird.moveRight();
  });

  $("#pause").on("click", this.pause.bind(this));
  $("#restart").on("click", this.start.bind(this));
};

GameView.prototype.updateStatus = function(deadCount, liveCount) {
  $("#death-toll").text("Death toll: " + deadCount);
  $("#lives-saved").text("Lives saved: " + liveCount);
};

GameView.prototype.updateSpeed = function(speed) {
  var text = "Veritcal Speed: ";
  speed *= -1;
  $("#vertical-velocity").text(text + Math.round(speed));
};

module.exports = GameView;
