
$(function() {
  var GameView = require("./game-view.js");
  var canvas = document.getElementById("game-canvas");
  canvas.width = $(document).width();
  canvas.height = $(document).height();
  var gameview = new GameView(canvas);
  gameview.start();
  // var ctx = canvas.getContext("2d");
  // ctx.font = "30px Roboto";
  // ctx.fillText("Press Enter to start", canvas.width/2 - 120, canvas.height/2);
  // $(document).keypress("enter", function(){
  //   gameview.start();
  // });
});
