var Game = require("./game.js");
var key = require("./keymaster.js");

function GameView(canvas) {
  this.ctx = canvas.getContext("2d");
  this.game = new Game(canvas.width, canvas.height);
}

GameView.prototype.start = function() {
  this.bindKeyHandlers();
  var self = this;
  setInterval(function() {
    self.game.step();
    self.game.draw(self.ctx);
  }, 50);
};

GameView.prototype.bindKeyHandlers = function() {
  var self = this;
  key('up, w', function() {
    console.log("Firing thrusters!");
  });

  key('left, a', function() {
    console.log("Rotate counter-clockwise");
  });

  key('right, d', function() {
    console.log("Rotate clockwise");
  });
};

module.exports = GameView;
