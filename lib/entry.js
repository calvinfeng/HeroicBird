$(function() {
  const GameView = require("./logic/game-view.js");
  const canvas = document.getElementById("game-canvas");
  canvas.width = 1500; canvas.height = 750;
  const gameview = new GameView(canvas);
  const landingPage = new Image(1000, 500);
  const ctx = canvas.getContext("2d");
  landingPage.src = "./rsc/image/heroic-bird-landing-page.jpg";
  landingPage.onload = function() {
    ctx.drawImage(landingPage, 0, 0, canvas.width, canvas.height);
  };
  $("#music").trigger("play");
  $('#music').prop("volume", 0);
  $("#music").animate({volume: 1}, 5000);
});
