var Game = require("./game.js");
var key = require("./keymaster.js");
var Bird = require('./bird.js');

function GameView(canvas) {
  this.ctx = canvas.getContext("2d");
  this.bird = new Bird([canvas.width/2, 0], canvas.width, canvas.height);
  this.game = new Game(canvas.width, canvas.height, this.bird);
}

GameView.prototype.start = function() {
  this.bindKeyHandlers();
  var self = this;
  setInterval(function() {
    self.game.step();
    self.game.draw(self.ctx);
    self.updateDeathToll(self.game.getDeathToll());
    self.updateLivesSaved(self.game.getNumOfLivesSaved());
  }, 50);
};

GameView.prototype.bindKeyHandlers = function() {
  var self = this;
  key('up, w', function() {
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
};

GameView.prototype.updateDeathToll = function(num) {
  $("#death-toll").text("Deathtoll: " + num);
};

GameView.prototype.updateLivesSaved = function(num) {
  $("#lives-saved").text("Lives saved: " + num);
};

module.exports = GameView;
