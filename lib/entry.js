
$(function() {
  var GameView = require("./game-view.js");
  var canvas = document.getElementById("game-canvas");
  canvas.width = $(document).width();
  canvas.height = $(document).height();
  var gameview = new GameView(canvas);
  gameview.start();
});
