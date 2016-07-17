const Game = require("./game.js");
const key = require("./keymaster.js");
const Bird = require('../objects/bird.js');

//Bird is required, because key handlers are binded to bird's actions
class GameView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.bird = new Bird([canvas.width/2, 0], canvas.width, canvas.height);
    this.game = new Game(canvas.width, canvas.height, this.bird);
    this.isPause = true;
    this.bestScore = 0;
    this.bindKeyHandlers();
  }

  start() {
    this.isPause = false;
    this.gameInterval = setInterval(() => {
      this.game.step();
      this.game.draw(this.ctx);
      this.updateStatus();
      this.updateSpeed();
      this.updateBestScore();
      this.checkIfPause();
      this.restartIfGameOver();
    }, 50);
  }

  restartIfGameOver() {
    if (this.game.isGameOver()) {
      this.game = new Game(this.canvas.width, this.canvas.height, this.bird);
    }
  }

  checkIfPause() {
    if (this.isPause) {
      clearInterval(this.gameInterval);
    }
  }

  resume(event) {
    event.preventDefault();
    $("#pause").off("click");
    $("#pause").text("pause");
    $("#pause").on("click", this.pause.bind(this));
    this.start();
    $("#music").trigger("play");
  }

  pause(event) {
    event.preventDefault();
    this.isPause = true;
    $("#pause").off("click");
    $("#pause").text("resume");
    $("#pause").on("click", this.resume.bind(this));
    $("#music").trigger("pause");
  }

  bindKeyHandlers() {
    key('enter', () => {
      this.start();
      key.unbind('enter');
    });

    key('space', () => {
      this.bird.startFlapping();
    });

    key('left, a', () => {
      this.bird.moveLeft();
    });

    key('right, d', () => {
      this.bird.moveRight();
    });

    $(document).keyup(() => {
      this.bird.stopFlapping();
    });

    $("#pause").on("click", this.pause.bind(this));
  }

  updateStatus() {
    let deadCount = this.game.getDeathToll();
    let liveCount = this.game.getNumOfLivesSaved();
    $("#death-toll").text("Death toll: " + deadCount);
    $("#lives-saved").text("Lives saved: " + liveCount);
  }

  updateSpeed() {
    let speed = this.bird.getVerticalVelocity();
    let text = "Vertical speed: ";
    speed *= -1;
    $("#vertical-velocity").text(text + Math.round(speed));
  }

  updateBestScore() {
    if (this.bestScore < this.game.getNumOfLivesSaved()) {
      this.bestScore = this.game.getNumOfLivesSaved();
    }
    $("#best-score").text("Best score: " + this.bestScore);
  }
}

module.exports = GameView;
