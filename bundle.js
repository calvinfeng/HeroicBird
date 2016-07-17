/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	$(function() {
	  const GameView = __webpack_require__(1);
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(2);
	const key = __webpack_require__(10);
	const Bird = __webpack_require__(11);
	
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	const SkyExplosion = __webpack_require__(3);
	const GroundExplosion = __webpack_require__(5);
	const Meteorite = __webpack_require__(6);
	const Pedestrian = __webpack_require__(8);
	const Background = __webpack_require__(9);
	
	const _gravity = [0, 0.1];
	class Game {
	  constructor(canvasWidth, canvasHeight, bird) {
	    this.DIM_X = canvasWidth;
	    this.DIM_Y = canvasHeight;
	    this.background = new Background(canvasWidth, canvasHeight);
	    this.initObjects(bird);
	    this.deadCount = 0;
	    this.saveCount = 0;
	  }
	
	  initObjects(bird) {
	    this.meteorites = [];
	    this.explosions = [];
	    this.pedestrians = [];
	    this.bird = bird;
	    this.addMeteorites();
	  }
	
	  step() {
	    this.checkGroundCollisions();
	    this.checkSkyCollisions();
	    this.checkCollisionOnPedestrians();
	    this.addMeteorites();
	    this.addPeople();
	    this.accelObjects();
	    this.moveObjects();
	    this.updateSafetyStatus();
	    this.bird.wrapIfHittingWall();
	  }
	
	  draw(ctx) {
	    ctx.clearRect(0, 0, this.DIM_X, this.DIM_Y);
	    // Create gradient & Add colors
	    let grd = ctx.createLinearGradient(226.000, 300.000, 74.000, 0.000);
	    grd.addColorStop(0.000, 'rgba(0, 169, 255, 1.000)');
	    grd.addColorStop(1.000, 'rgba(255, 255, 255, 1.000)');
	    ctx.fillStyle = grd;
	    ctx.fillRect(0, 0, this.DIM_X, this.DIM_Y);
	    //==================================================================
	    this.background.draw(ctx);
	    this.bird.draw(ctx);
	    this.drawExplosions(ctx);
	    this.drawMeteorites(ctx);
	    this.drawPedestrians(ctx);
	  }
	
	  drawMeteorites(ctx) {
	    let i = this.meteorites.length - 1;
	    while (i >= 0) {
	      if (this.meteorites[i].isActive()) {
	        this.meteorites[i].draw(ctx);
	      } else {
	        this.meteorites.splice(i, 1);
	      }
	      i -=1 ;
	    }
	  }
	
	  drawPedestrians(ctx) {
	    let i = this.pedestrians.length - 1;
	    while (i >= 0) {
	      if (this.pedestrians[i].isAlive() && this.pedestrians[i].isSaved()) {
	        this.saveCount += 1;
	        this.pedestrians.splice(i, 1);
	      } else if (this.pedestrians[i].isAlive()) {
	        this.pedestrians[i].draw(ctx);
	      } else {
	        this.deadCount += 1;
	        this.pedestrians.splice(i, 1);
	      }
	      i -= 1;
	    }
	  }
	
	  drawExplosions(ctx) {
	    let i = this.explosions.length - 1;
	    while (i >= 0) {
	      if (this.explosions[i].isActive()) {
	        this.explosions[i].draw(ctx);
	      } else {
	        this.explosions.splice(i, 1);
	      }
	      i -= 1;
	    }
	  }
	
	  allObjects() {
	    return [].concat(this.meteorites, this.bird);
	  }
	
	  getDeathToll() {
	    return this.deadCount;
	  }
	
	  isGameOver() {
	    return this.deadCount === 20;
	  }
	
	  getNumOfLivesSaved() {
	    return this.saveCount;
	  }
	
	  addGroundExplosion(pos) {
	    this.explosions.push(new GroundExplosion(pos));
	  }
	
	  addSkyExplosion(pos) {
	    this.explosions.push(new SkyExplosion(pos));
	  }
	
	  addMeteorites() {
	    while (this.meteorites.length < 5) {
	      this.meteorites.push(new Meteorite(this.randomPos(), this.DIM_X, this.DIM_Y));
	    }
	  }
	
	  addPeople() {
	    while (this.pedestrians.length < 5) {
	      this.pedestrians.push(new Pedestrian([Math.random()*(-this.DIM_X), this.DIM_Y - 50],
	      this.DIM_X, this.DIM_Y));
	    }
	  }
	
	  moveObjects() {
	    this.bird.move();
	    this.meteorites.forEach(function(meteorite) {
	      if (meteorite.isActive()) {
	        meteorite.move();
	      }
	    });
	    this.pedestrians.forEach(function(pedestrian) {
	      if (pedestrian.isAlive()) {
	        pedestrian.move();
	      }
	    });
	  }
	
	  accelObjects() {
	    this.meteorites.forEach(function(meteorite) {
	      if (meteorite.isActive()) {
	        meteorite.accelerate(_gravity);
	      }
	    });
	    this.bird.accelerate(_gravity);
	  }
	
	  randomPos() {
	    let randx = Math.floor(Math.random() * this.DIM_X + 1);
	    return [randx, 0];
	  }
	
	  checkGroundCollisions() {
	    for (let i = 0; i < this.meteorites.length; i++) {
	      if (this.meteorites[i].isCollidedWithGround() && this.meteorites[i].isActive()) {
	        this.meteorites[i].setInactive();
	        this.addGroundExplosion(this.meteorites[i].getPosition());
	      } else if (this.meteorites[i].isOutOfBound() && this.meteorites[i].isActive()) {
	        this.meteorites[i].setInactive();
	      }
	    }
	  }
	
	  checkSkyCollisions() {
	    for (let i = 0; i < this.allObjects().length - 1; i++) {
	      for (let j = i + 1; j < this.allObjects().length; j++) {
	        if (this.allObjects()[i].isCollidedWith(this.allObjects()[j])) {
	          this.addSkyExplosion(this.allObjects()[i].getPosition());
	          this.allObjects()[i].setInactive();
	          this.allObjects()[j].setInactive();
	        }
	      }
	    }
	  }
	
	  checkCollisionOnPedestrians() {
	    for (let i = 0; i < this.pedestrians.length; i++) {
	      for (let j = 0; j < this.meteorites.length; j++) {
	        if (this.pedestrians[i].isCollidedWith(this.meteorites[j])) {
	          this.addSkyExplosion(this.pedestrians[i].getPosition());
	          this.meteorites[j].setInactive();
	          this.pedestrians[i].setDead();
	        }
	      }
	    }
	  }
	
	  updateSafetyStatus() {
	    this.pedestrians.forEach(function(person) {
	      person.updateSafetyStatus();
	    });
	  }
	}
	module.exports = Game;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	const Explosion = __webpack_require__(4);
	const imageSrc = "./rsc/image/explosion-sprite.png";
	const audioSrc = "./rsc/sound/sky-explosion.mp3";
	
	class SkyExplosion extends Explosion {
	  constructor(pos) {
	    super({
	      pos: pos,
	      width: 134,
	      height: 134,
	      fullWidth: 1608,
	      imageSrc: imageSrc,
	      audioSrc: audioSrc
	    });
	  }
	}
	
	module.exports = SkyExplosion;


/***/ },
/* 4 */
/***/ function(module, exports) {

	class Explosion {
	  constructor(args) {
	    this.width = args.width;
	    this.height = args.height;
	    this.fullWidth = args.fullWidth;
	    this.spriteImage = new Image(this.width, this.height);
	    this.spriteImage.src = args.imageSrc;
	    this.audioSrc = args.audioSrc;
	    this.pos = args.pos;
	    this.activeState = true;
	    this.sx = 0;
	  }
	
	  draw(ctx) {
	    if (this.sx === 0) { this.playSound(); }
	    ctx.drawImage(this.spriteImage, this.sx, 0, this.width, this.height,
	      this.pos[0]-(this.width/2), this.pos[1]-(this.height/2), this.width, this.height);
	    this.sx += this.width;
	    if (this.sx === this.fullWidth) {
	      this.activeState = false;
	    }
	  }
	
	  playSound() {
	    let sound = new Audio(this.audioSrc);
	    sound.play();
	  }
	
	  isActive() {
	    return this.activeState;
	  }
	}
	module.exports = Explosion;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	const Explosion = __webpack_require__(4);
	const imageSrc = "./rsc/image/ground-explosion-sprite.png";
	const audioSrc = "./rsc/sound/ground-explosion.mp3";
	
	class GroundExplosion extends Explosion {
	  constructor(pos) {
	    super({
	      pos: pos,
	      width: 50,
	      height: 128,
	      fullWidth: 900,
	      imageSrc: imageSrc,
	      audioSrc: audioSrc
	    });
	  }
	}
	module.exports = GroundExplosion;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	const MovingObject = __webpack_require__(7);
	
	const _width = 512;
	const _height = 512;
	const _displaySize = 100;
	const _fullWidth = 3072;
	
	const _spriteImage = new Image(_width, _height);
	_spriteImage.src = "./rsc/image/meteorite-sprite.png";
	class Meteorite extends MovingObject {
	  constructor(pos, DIM_X, DIM_Y) {
	    super({
	      pos: pos,
	      DIM_X: DIM_X,
	      DIM_Y: DIM_Y
	    });
	    this.vel = this.randomVel();
	    this.radian = this.findRadian();
	    this.sx = 0;
	  }
	
	  draw(ctx) {
	    let rotatedObj = this.rotateAndCache(_spriteImage);
	    ctx.drawImage(rotatedObj, 0, 0, _width, _height,
	      this.pos[0] - (_displaySize/2), this.pos[1] - (_displaySize/2), _displaySize, _displaySize);
	  }
	
	  rotateAndCache(img) {
	    let offscreenCanvas = document.createElement('canvas');
	    let offscreenCtx = offscreenCanvas.getContext('2d');
	
	    offscreenCanvas.width = img.width;
	    offscreenCanvas.height = img.height;
	
	    offscreenCtx.translate(img.width/2, img.height/2);
	    offscreenCtx.rotate(this.radian);
	    offscreenCtx.drawImage(img, this.sx, 0, img.width, img.height,
	      (-img.width/2), (-img.height/2), img.width, img.height);
	    // offscreenCtx.translate(-img.width/2, -img.height/2);
	    this.sx += _width;
	    if (this.sx === _fullWidth) {
	      this.sx -= _fullWidth;
	    }
	    return offscreenCanvas;
	  }
	
	  randomVel() {
	    if (this.pos[0] < this.DIM_X/2) {
	      return [Math.random()*5 + 1, Math.random()*5 + 1];
	    } else {
	      return [-(Math.random()*5 + 1), Math.random()*5 + 1];
	    }
	  }
	
	  isCollidedWithGround() {
	    if (this.pos[0] > 0 && this.pos[0] < this.DIM_X) {
	      if (this.pos[1] >= this.DIM_Y - 100) {
	        return true;
	      } else {
	        return false;
	      }
	    } else {
	      return false;
	    }
	  }
	}
	module.exports = Meteorite;


/***/ },
/* 7 */
/***/ function(module, exports) {

	class MovingObject {
	  constructor(args) {
	    this.pos = args.pos;
	    this.DIM_X = args.DIM_X;
	    this.DIM_Y = args.DIM_Y;
	    this.activeState = true;
	  }
	
	  dist(pos1, pos2) {
	    let dx = pos1[0] - pos2[0];
	    let dy = pos1[1] - pos2[1];
	    let dist = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
	    return dist;
	  }
	
	  //All moving objects move
	  move() {
	    this.pos[0] += this.vel[0];
	    this.pos[1] += this.vel[1];
	  }
	
	  accelerate(accel) {
	    this.vel[0] += accel[0];
	    this.vel[1] += accel[1];
	    this.radian = this.findRadian();
	  }
	
	  isMoving() {
	    return (this.vel[0] > 0) || (this.vel[1] > 0);
	  }
	
	  setInactive() {
	    this.activeState = false;
	  }
	
	  isActive() {
	    return this.activeState;
	  }
	
	  getPosition() {
	    return this.pos.slice();
	  }
	
	  findRadian() {
	    if (this.vel[0] > 0 && this.vel[1] > 0) {
	      //Quadrant 1
	      return Math.atan(this.vel[1]/this.vel[0]);
	    } else if (this.vel[0] < 0 && this.vel[1] > 0) {
	      //Quadrant 2
	      return (Math.atan(this.vel[1]/this.vel[0])+ Math.PI);
	    } else if (this.vel[0] < 0 && this.vel[1] < 0) {
	      //Quadrant 3
	      return (Math.atan(this.vel[1]/this.vel[0]) + Math.PI);
	    } else {
	      //Quadrant 4
	      return (Math.atan(this.vel[1]/this.vel[0]));
	    }
	  }
	
	  isOutOfBound() {
	    return (this.pos[0] < 0 || this.pos[0] > this.DIM_X) ||
	      (this.pos[1] < 0 || this.pos[1] > this.DIM_Y);
	  }
	
	  checkIsHittingWall() {
	    if (this.pos[0] < 0 || this.pos[0] > this.DIM_X) {
	      this.vel[0] *= -1;
	    }
	    if (this.pos[1] < 0 || this.pos[1] > this.DIM_Y) {
	      this.vel[1] *= -1;
	    }
	  }
	
	  isCollidedWith(otherObject) {
	    if (this.isMoving() || otherObject.isMoving()) {
	      let objectDist = this.dist(this.pos, otherObject.pos);
	      let radSum = this.size() + otherObject.size();
	      return (objectDist < radSum);
	    } else {
	      return false;
	    }
	  }
	}
	
	MovingObject.prototype.size = function() {
	  //waiting to be overriden
	  return 30;
	};
	module.exports = MovingObject;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	const MovingObject = __webpack_require__(7);
	
	const _width = 184;
	const _height = 325;
	const _fullWidth = 1472;
	
	const _spriteImage = new Image(_width, _height);
	_spriteImage.src = "./rsc/image/pedestrian.png";
	class Pedestrian extends MovingObject {
	  constructor(pos, DIM_X, DIM_Y) {
	    super({
	      pos: pos,
	      DIM_X: DIM_X,
	      DIM_Y: DIM_Y
	    });
	    this.vel = [5,0];
	    this.radian = 0;
	    this.alive = true;
	    this.safety = false;
	    this.sx = 0;
	    this.isFacingLeft = false;
	  }
	
	  draw(ctx) {
	    let orientedPerson = this.orientateAndCache(_spriteImage);
	    ctx.drawImage(orientedPerson, 0, 0, _width, _height,
	      this.pos[0] - (_width/4), this.pos[1] - (_height/4), _width/4, _height/4);
	  }
	
	  orientateAndCache(img) {
	    let offscreenCanvas = document.createElement('canvas');
	    let offscreenCtx = offscreenCanvas.getContext('2d');
	
	    offscreenCanvas.width = img.width;
	    offscreenCanvas.height = img.height;
	
	    if (this.isFacingLeft) {
	      offscreenCtx.translate(img.width, 0);
	      offscreenCtx.scale(-1, 1);
	    }
	    offscreenCtx.drawImage(img, this.sx, 0, img.width, img.height,
	      0, 0, img.width, img.height);
	
	    this.sx += _width;
	    if (this.sx === _fullWidth) {
	      this.sx -= _fullWidth;
	    }
	    return offscreenCanvas;
	  }
	
	  setDead() {
	    this.alive = false;
	  }
	
	  setSafety() {
	    this.safety = true;
	  }
	
	  isAlive() {
	    return this.alive;
	  }
	
	  isSaved() {
	    return this.safety;
	  }
	
	  isCollidedWith(otherObject) {
	    if (this.isMoving() || otherObject.isMoving()) {
	      let objectDist = this.dist(this.pos, otherObject.pos);
	      return (objectDist < 65);
	    } else {
	      return false;
	    }
	  }
	
	  updateSafetyStatus() {
	    if (this.pos[0] > this.DIM_X && this.isAlive()) {
	      this.setSafety();
	    }
	  }
	}
	module.exports = Pedestrian;


/***/ },
/* 9 */
/***/ function(module, exports) {

	const _imgHeight = 768;
	const _imgWidth = 1366;
	const spriteImage = new Image(_imgWidth, _imgHeight);
	
	spriteImage.src = "./rsc/image/background-city.png";
	class Background {
	  constructor(DIM_X, DIM_Y) {
	    this.DIM_X = DIM_X;
	    this.DIM_Y = DIM_Y;
	  }
	
	  draw(ctx) {
	    ctx.drawImage(
	      spriteImage, 0, 0, _imgWidth, _imgHeight,
	      0,
	      this.DIM_Y - this.DIM_X*_imgHeight/_imgWidth,
	      this.DIM_X,
	      this.DIM_X*_imgHeight/_imgWidth
	    );
	  }
	}
	
	module.exports = Background;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	//     keymaster.js
	//     (c) 2011-2013 Thomas Fuchs
	//     keymaster.js may be freely distributed under the MIT license.
	
	;(function(global){
	  var k,
	    _handlers = {},
	    _mods = { 16: false, 18: false, 17: false, 91: false },
	    _scope = 'all',
	    // modifier keys
	    _MODIFIERS = {
	      '⇧': 16, shift: 16,
	      '⌥': 18, alt: 18, option: 18,
	      '⌃': 17, ctrl: 17, control: 17,
	      '⌘': 91, command: 91
	    },
	    // special keys
	    _MAP = {
	      backspace: 8, tab: 9, clear: 12,
	      enter: 13, 'return': 13,
	      esc: 27, escape: 27, space: 32,
	      left: 37, up: 38,
	      right: 39, down: 40,
	      del: 46, 'delete': 46,
	      home: 36, end: 35,
	      pageup: 33, pagedown: 34,
	      ',': 188, '.': 190, '/': 191,
	      '`': 192, '-': 189, '=': 187,
	      ';': 186, '\'': 222,
	      '[': 219, ']': 221, '\\': 220
	    },
	    code = function(x){
	      return _MAP[x] || x.toUpperCase().charCodeAt(0);
	    },
	    _downKeys = [];
	
	  for(k=1;k<20;k++) _MAP['f'+k] = 111+k;
	
	  // IE doesn't support Array#indexOf, so have a simple replacement
	  function index(array, item){
	    var i = array.length;
	    while(i--) if(array[i]===item) return i;
	    return -1;
	  }
	
	  // for comparing mods before unassignment
	  function compareArray(a1, a2) {
	    if (a1.length != a2.length) return false;
	    for (var i = 0; i < a1.length; i++) {
	        if (a1[i] !== a2[i]) return false;
	    }
	    return true;
	  }
	
	  var modifierMap = {
	      16:'shiftKey',
	      18:'altKey',
	      17:'ctrlKey',
	      91:'metaKey'
	  };
	  function updateModifierKey(event) {
	      for(k in _mods) _mods[k] = event[modifierMap[k]];
	  };
	
	  // handle keydown event
	  function dispatch(event) {
	    var key, handler, k, i, modifiersMatch, scope;
	    key = event.keyCode;
	
	    if (index(_downKeys, key) == -1) {
	        _downKeys.push(key);
	    }
	
	    // if a modifier key, set the key.<modifierkeyname> property to true and return
	    if(key == 93 || key == 224) key = 91; // right command on webkit, command on Gecko
	    if(key in _mods) {
	      _mods[key] = true;
	      // 'assignKey' from inside this closure is exported to window.key
	      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = true;
	      return;
	    }
	    updateModifierKey(event);
	
	    // see if we need to ignore the keypress (filter() can can be overridden)
	    // by default ignore key presses if a select, textarea, or input is focused
	    if(!assignKey.filter.call(this, event)) return;
	
	    // abort if no potentially matching shortcuts found
	    if (!(key in _handlers)) return;
	
	    scope = getScope();
	
	    // for each potential shortcut
	    for (i = 0; i < _handlers[key].length; i++) {
	      handler = _handlers[key][i];
	
	      // see if it's in the current scope
	      if(handler.scope == scope || handler.scope == 'all'){
	        // check if modifiers match if any
	        modifiersMatch = handler.mods.length > 0;
	        for(k in _mods)
	          if((!_mods[k] && index(handler.mods, +k) > -1) ||
	            (_mods[k] && index(handler.mods, +k) == -1)) modifiersMatch = false;
	        // call the handler and stop the event if neccessary
	        if((handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) || modifiersMatch){
	          if(handler.method(event, handler)===false){
	            if(event.preventDefault) event.preventDefault();
	              else event.returnValue = false;
	            if(event.stopPropagation) event.stopPropagation();
	            if(event.cancelBubble) event.cancelBubble = true;
	          }
	        }
	      }
	    }
	  };
	
	  // unset modifier keys on keyup
	  function clearModifier(event){
	    var key = event.keyCode, k,
	        i = index(_downKeys, key);
	
	    // remove key from _downKeys
	    if (i >= 0) {
	        _downKeys.splice(i, 1);
	    }
	
	    if(key == 93 || key == 224) key = 91;
	    if(key in _mods) {
	      _mods[key] = false;
	      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = false;
	    }
	  };
	
	  function resetModifiers() {
	    for(k in _mods) _mods[k] = false;
	    for(k in _MODIFIERS) assignKey[k] = false;
	  };
	
	  // parse and assign shortcut
	  function assignKey(key, scope, method){
	    var keys, mods;
	    keys = getKeys(key);
	    if (method === undefined) {
	      method = scope;
	      scope = 'all';
	    }
	
	    // for each shortcut
	    for (var i = 0; i < keys.length; i++) {
	      // set modifier keys if any
	      mods = [];
	      key = keys[i].split('+');
	      if (key.length > 1){
	        mods = getMods(key);
	        key = [key[key.length-1]];
	      }
	      // convert to keycode and...
	      key = key[0]
	      key = code(key);
	      // ...store handler
	      if (!(key in _handlers)) _handlers[key] = [];
	      _handlers[key].push({ shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods });
	    }
	  };
	
	  // unbind all handlers for given key in current scope
	  function unbindKey(key, scope) {
	    var multipleKeys, keys,
	      mods = [],
	      i, j, obj;
	
	    multipleKeys = getKeys(key);
	
	    for (j = 0; j < multipleKeys.length; j++) {
	      keys = multipleKeys[j].split('+');
	
	      if (keys.length > 1) {
	        mods = getMods(keys);
	      }
	
	      key = keys[keys.length - 1];
	      key = code(key);
	
	      if (scope === undefined) {
	        scope = getScope();
	      }
	      if (!_handlers[key]) {
	        return;
	      }
	      for (i = 0; i < _handlers[key].length; i++) {
	        obj = _handlers[key][i];
	        // only clear handlers if correct scope and mods match
	        if (obj.scope === scope && compareArray(obj.mods, mods)) {
	          _handlers[key][i] = {};
	        }
	      }
	    }
	  };
	
	  // Returns true if the key with code 'keyCode' is currently down
	  // Converts strings into key codes.
	  function isPressed(keyCode) {
	      if (typeof(keyCode)=='string') {
	        keyCode = code(keyCode);
	      }
	      return index(_downKeys, keyCode) != -1;
	  }
	
	  function getPressedKeyCodes() {
	      return _downKeys.slice(0);
	  }
	
	  function filter(event){
	    var tagName = (event.target || event.srcElement).tagName;
	    // ignore keypressed in any elements that support keyboard data input
	    return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
	  }
	
	  // initialize key.<modifier> to false
	  for(k in _MODIFIERS) assignKey[k] = false;
	
	  // set current scope (default 'all')
	  function setScope(scope){ _scope = scope || 'all' };
	  function getScope(){ return _scope || 'all' };
	
	  // delete all handlers for a given scope
	  function deleteScope(scope){
	    var key, handlers, i;
	
	    for (key in _handlers) {
	      handlers = _handlers[key];
	      for (i = 0; i < handlers.length; ) {
	        if (handlers[i].scope === scope) handlers.splice(i, 1);
	        else i++;
	      }
	    }
	  };
	
	  // abstract key logic for assign and unassign
	  function getKeys(key) {
	    var keys;
	    key = key.replace(/\s/g, '');
	    keys = key.split(',');
	    if ((keys[keys.length - 1]) == '') {
	      keys[keys.length - 2] += ',';
	    }
	    return keys;
	  }
	
	  // abstract mods logic for assign and unassign
	  function getMods(key) {
	    var mods = key.slice(0, key.length - 1);
	    for (var mi = 0; mi < mods.length; mi++)
	    mods[mi] = _MODIFIERS[mods[mi]];
	    return mods;
	  }
	
	  // cross-browser events
	  function addEvent(object, event, method) {
	    if (object.addEventListener)
	      object.addEventListener(event, method, false);
	    else if(object.attachEvent)
	      object.attachEvent('on'+event, function(){ method(window.event) });
	  };
	
	  // set the handlers globally on document
	  addEvent(document, 'keydown', function(event) { dispatch(event) }); // Passing _scope to a callback to ensure it remains the same by execution. Fixes #48
	  addEvent(document, 'keyup', clearModifier);
	
	  // reset modifiers to false whenever the window is (re)focused.
	  addEvent(window, 'focus', resetModifiers);
	
	  // store previously defined key
	  var previousKey = global.key;
	
	  // restore previously defined key and return reference to our key object
	  function noConflict() {
	    var k = global.key;
	    global.key = previousKey;
	    return k;
	  }
	
	  // set window.key and window.key.set/get/deleteScope, and the default filter
	  global.key = assignKey;
	  global.key.setScope = setScope;
	  global.key.getScope = getScope;
	  global.key.deleteScope = deleteScope;
	  global.key.filter = filter;
	  global.key.isPressed = isPressed;
	  global.key.getPressedKeyCodes = getPressedKeyCodes;
	  global.key.noConflict = noConflict;
	  global.key.unbind = unbindKey;
	
	  if(true) module.exports = assignKey;
	
	})(this);


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	const MovingObject = __webpack_require__(7);
	
	const _width = 98.5;
	const _height = 66;
	const _fullWidth = 788;
	const _spriteImage = new Image(_width, _height);
	
	_spriteImage.src = "./rsc/image/flappy-bird-sprite.png";
	class Bird extends MovingObject {
	  constructor(pos, DIM_X, DIM_Y) {
	    super({
	      pos: pos,
	      DIM_X: DIM_X,
	      DIM_Y: DIM_Y
	    });
	    this.vel = [0,0];
	    this.radian = 0;
	    this.sx = 0;
	    this.isFlapping = false;
	    this.isFacingLeft = false;
	  }
	
	  draw(ctx) {
	    let orientedBird = this.orientateAndCache(_spriteImage);
	    ctx.drawImage(orientedBird, 0, 0, _width, _height,
	      this.pos[0] - (_width/2), this.pos[1] - (_height/2) - 10, _width/2, _height/2);
	  }
	
	  orientateAndCache(img) {
	    let offscreenCanvas = document.createElement('canvas');
	    let offscreenCtx = offscreenCanvas.getContext('2d');
	
	    offscreenCanvas.width = img.width;
	    offscreenCanvas.height = img.height;
	
	    if (this.isFacingLeft) {
	      offscreenCtx.translate(img.width, 0);
	      offscreenCtx.scale(-1, 1);
	    }
	    offscreenCtx.drawImage(img, this.sx, 0, img.width, img.height,
	      0, 0, img.width, img.height);
	
	    if (this.isFlapping) {
	      this.sx += _width;
	      if (this.sx === _fullWidth) {
	        this.sx -= _fullWidth;
	      }
	    }
	    return offscreenCanvas;
	  }
	
	  getVerticalVelocity() {
	    return this.vel[1];
	  }
	
	  startFlapping() {
	    this.isFlapping = true;
	  }
	
	  stopFlapping() {
	    this.isFlapping = false;
	  }
	
	  wrapIfHittingWall() {
	    if (this.pos[0] - (_width/2) < 0 ) {
	      this.pos[0] = this.DIM_X;
	    } else if (this.pos[0] > this.DIM_X) {
	      this.pos[0] = _width/2;
	    }
	
	    if (this.pos[1] - (_height/2) <= 0) {
	      this.vel[1] = 0;
	      this.pos[1] = (_height/2);
	    } else if (this.pos[1] + (_height/2) >= this.DIM_Y) {
	      this.vel[0] = 0;
	      this.vel[1] = 0;
	      this.pos[1] = this.DIM_Y - (_height/2);
	    }
	  }
	
	  accelerate(accel) {
	    this.vel[0] += accel[0];
	    this.vel[1] += accel[1];
	    if (this.isFlapping) {
	      this.vel[1] -= 0.40;
	    }
	  }
	
	  setFaceLeft() {
	    this.isFacingLeft = true;
	  }
	
	  setFaceRight() {
	    this.isFacingLeft = false;
	  }
	
	  moveLeft() {
	    this.setFaceLeft();
	    if (this.vel[0] > 0) {
	      this.vel[0] = 0;
	    }
	    this.vel[0] = -12;
	  }
	
	  moveRight() {
	    this.setFaceRight();
	    if (this.vel[0] < 0) {
	      this.vel[0] = 0;
	    }
	    this.vel[0] = 12;
	  }
	}
	module.exports = Bird;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map