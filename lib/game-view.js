var Game = require("./game.js");
var key = require("./keymaster.js");
var Bird = require('./bird.js');

function GameView(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");
  this.bird = new Bird([canvas.width/2, 0], canvas.width, canvas.height);
  this.game = new Game(canvas.width, canvas.height, this.bird);
  this.isPause = true;
  this.bestScore = 0;
  this.bindKeyHandlers();
}

GameView.prototype.start = function() {
  var self = this;
  this.isPause = false;
  this.gameInterval = setInterval(function() {
    self.game.step();
    self.game.draw(self.ctx);
    self.updateStatus();
    self.updateSpeed();
    self.updateBestScore();
    self.checkIfPause();
    self.restartIfGameOver();
  }, 50);
};

GameView.prototype.restartIfGameOver = function() {
  if (this.game.isGameOver()) {
    this.game = new Game(this.canvas.width, this.canvas.height, this.bird);
  }
};

GameView.prototype.checkIfPause = function() {
  if (this.isPause) {
    clearInterval(this.gameInterval);
  }
};

GameView.prototype.resume = function(event) {
  event.preventDefault();
  $("#pause").off("click");
  $("#pause").text("pause");
  $("#pause").on("click", this.pause.bind(this));
  this.start();
};

GameView.prototype.pause = function(event) {
  event.preventDefault();
  this.isPause = true;
  $("#pause").off("click");
  $("#pause").text("resume");
  $("#pause").on("click", this.resume.bind(this));
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
};

GameView.prototype.updateStatus = function() {
  var deadCount = this.game.getDeathToll();
  var liveCount = this.game.getNumOfLivesSaved();
  $("#death-toll").text("Death toll: " + deadCount);
  $("#lives-saved").text("Lives saved: " + liveCount);
};

GameView.prototype.updateBestScore = function() {
  if (this.bestScore < this.game.getNumOfLivesSaved()) {
    this.bestScore = this.game.getNumOfLivesSaved();
  }
  $("#best-score").text("Best score: " + this.bestScore);
};

GameView.prototype.updateSpeed = function() {
  var speed = this.bird.getVerticalVelocity();
  var text = "Vertical speed: ";
  speed *= -1;
  $("#vertical-velocity").text(text + Math.round(speed));
};

module.exports = GameView;
