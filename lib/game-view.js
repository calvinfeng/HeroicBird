var Game = require("./game.js");
var key = require("./keymaster.js");
var Spacecraft = require('./spacecraft.js');

function GameView(canvas) {
  this.ctx = canvas.getContext("2d");
  this.spacecraft = new Spacecraft([canvas.width*0.10, canvas.height],
    canvas.width, canvas.height);
  this.game = new Game(canvas.width, canvas.height, this.spacecraft);
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
    self.spacecraft.setThrusterOn();
  });

  $(document).keyup(function() {
    self.spacecraft.setThrusterOff();
  });

  key('left, a', function() {
    self.spacecraft.rotateCounterClockwise();
  });

  key('right, d', function() {
    self.spacecraft.rotateClockwise();
  });
};

module.exports = GameView;
