
$(function() {
  var GameView = require("./game-view.js");
  var canvas = document.getElementById("game-canvas");
  canvas.width = 1280;
  canvas.height = 720;
  var gameview = new GameView(canvas);

  var ctx = canvas.getContext("2d");
  var landingPage = new Image(1000, 500);
  landingPage.src = "./rsc/image/heroic-bird-landing-page.jpg";
  landingPage.onload = function() {
    ctx.drawImage(landingPage, 0, 0, canvas.width, canvas.height);
  };
  $("#music").trigger("play");
  $('#music').prop("volume", 0);
  $("#music").animate({volume: 1}, 5000);
});
