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
	  var GameView = __webpack_require__(1);
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Game = __webpack_require__(2);
	var key = __webpack_require__(10);
	var Bird = __webpack_require__(11);
	
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
	  var text = "Veritcal speed: ";
	  speed *= -1;
	  $("#vertical-velocity").text(text + Math.round(speed));
	};
	
	module.exports = GameView;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var SkyExplosion = __webpack_require__(3);
	var GroundExplosion = __webpack_require__(4);
	var Meteorite = __webpack_require__(5);
	var Pedestrian = __webpack_require__(8);
	var Background = __webpack_require__(9);
	
	function Game(canvasWidth, canvasHeight, bird) {
	  this.DIM_X = canvasWidth;
	  this.DIM_Y = canvasHeight;
	  this.meteorites = [];
	  this.explosions = [];
	  this.pedestrians = [];
	  this.bird = bird;
	  this.addMeteorites();
	  this.deadCount = 0;
	  this.saveCount = 0;
	  this.background = new Background(canvasWidth, canvasHeight);
	}
	
	Game.prototype.step = function() {
	  this.checkGroundCollisions();
	  this.checkSkyCollisions();
	  this.checkCollisionOnPedestrians();
	  this.addMeteorites();
	  this.addPeople();
	  this.accelObjects();
	  this.moveObjects();
	  this.updateSafetyStatus();
	  this.bird.wrapIfHittingWall();
	};
	
	Game.prototype.draw = function(ctx) {
	  var i, grd;
	  ctx.clearRect(0, 0, this.DIM_X, this.DIM_Y);
	
	  // grd = ctx.createLinearGradient(150.000, 0.000, 150.000, 300.000);
	  // grd.addColorStop(0.000, 'rgba(0, 88, 242, 1.000)');
	  // grd.addColorStop(1.000, 'rgba(0, 179, 224, 1.000)');
	  // ctx.fillStyle = grd;
	  // ctx.fillRect(0, 0, this.DIM_X, this.DIM_Y);
	  var skyImage = new Image(this.DIM_X, this.DIM_Y);
	  skyImage.src = "./rsc/image/blue-sky.png";
	  ctx.drawImage(skyImage, 0, 0);
	
	  this.background.draw(ctx);
	  this.bird.draw(ctx);
	
	  i = this.meteorites.length - 1;
	  while (i >= 0) {
	    if (this.meteorites[i].isActive()) {
	      this.meteorites[i].draw(ctx);
	    } else {
	      this.meteorites.splice(i, 1);
	    }
	    i -=1 ;
	  }
	
	  i = this.explosions.length - 1;
	  while (i >= 0) {
	    if (this.explosions[i].isActive()) {
	      this.explosions[i].draw(ctx);
	    } else {
	      this.explosions.splice(i, 1);
	    }
	    i -= 1;
	  }
	
	  i = this.pedestrians.length - 1;
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
	};
	
	Game.prototype.allObjects = function() {
	  return [].concat(this.meteorites, this.bird);
	};
	
	Game.prototype.getDeathToll = function() {
	  return this.deadCount;
	};
	
	Game.prototype.isGameOver = function() {
	  return this.deadCount === 20;
	};
	
	Game.prototype.getNumOfLivesSaved = function() {
	  return this.saveCount;
	};
	
	Game.prototype.addGroundExplosion = function(pos) {
	  this.explosions.push(new GroundExplosion(pos));
	};
	
	Game.prototype.addSkyExplosion = function(pos) {
	  this.explosions.push(new SkyExplosion(pos));
	};
	
	Game.prototype.addMeteorites = function() {
	  while (this.meteorites.length < 5) {
	    this.meteorites.push(new Meteorite(this.randomPos(), this.DIM_X, this.DIM_Y));
	  }
	};
	
	Game.prototype.addPeople = function() {
	  while (this.pedestrians.length < 5) {
	    this.pedestrians.push(new Pedestrian([Math.random()*(-this.DIM_X), this.DIM_Y - 50],
	      this.DIM_X, this.DIM_Y));
	  }
	};
	
	Game.prototype.moveObjects = function() {
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
	};
	
	var _gravity = [0, 0.1];
	Game.prototype.accelObjects = function() {
	  this.meteorites.forEach(function(meteorite) {
	    if (meteorite.isActive()) {
	      meteorite.accelerate(_gravity);
	    }
	  });
	  this.bird.accelerate(_gravity);
	};
	
	Game.prototype.randomPos = function() {
	  var randx = Math.floor(Math.random() * this.DIM_X + 1);
	  return [randx, 0];
	};
	
	Game.prototype.checkGroundCollisions = function() {
	  for (var i = 0; i < this.meteorites.length; i++) {
	    if (this.meteorites[i].isCollidedWithGround() && this.meteorites[i].isActive()) {
	      this.meteorites[i].setInactive();
	      this.addGroundExplosion(this.meteorites[i].getPosition());
	    } else if (this.meteorites[i].isOutOfBound() && this.meteorites[i].isActive()) {
	      this.meteorites[i].setInactive();
	    }
	  }
	};
	
	Game.prototype.checkSkyCollisions = function() {
	  for (var i = 0; i < this.allObjects().length - 1; i++) {
	    for (var j = i + 1; j < this.allObjects().length; j++) {
	      if (this.allObjects()[i].isCollidedWith(this.allObjects()[j])) {
	        this.addSkyExplosion(this.allObjects()[i].getPosition());
	        this.allObjects()[i].setInactive();
	        this.allObjects()[j].setInactive();
	      }
	    }
	  }
	};
	
	Game.prototype.checkCollisionOnPedestrians = function() {
	  for (var i = 0; i < this.pedestrians.length; i++) {
	    for (var j = 0; j < this.meteorites.length; j++) {
	      if (this.pedestrians[i].isCollidedWith(this.meteorites[j])) {
	        this.addSkyExplosion(this.pedestrians[i].getPosition());
	        this.meteorites[j].setInactive();
	        this.pedestrians[i].setDead();
	      }
	    }
	  }
	};
	
	Game.prototype.checkGameOver = function() {
	
	};
	
	Game.prototype.updateSafetyStatus = function() {
	  this.pedestrians.forEach(function(person) {
	    person.updateSafetyStatus();
	  });
	};
	
	module.exports = Game;


/***/ },
/* 3 */
/***/ function(module, exports) {

	function SkyExplosion(pos) {
	  this.width = 134;
	  this.height = 134;
	  this.spriteImage = new Image(134,134);
	  this.spriteImage.src = "./rsc/image/explosion-sprite.png";
	  this.activeState = true;
	  this.pos = pos;
	  this.sx = 0;
	}
	
	var _fullWidth = 1608;
	SkyExplosion.prototype.draw = function(context) {
	  if (this.sx === 0) {
	    this.playSound();
	  }
	
	  context.drawImage(this.spriteImage, this.sx, 0, this.width, this.height,
	    this.pos[0]-(this.width/2), this.pos[1]-(this.height/2), this.width, this.height);
	
	  this.sx += 134;
	  if (this.sx === _fullWidth) {
	    this.activeState = false;
	  }
	};
	
	SkyExplosion.prototype.playSound = function() {
	  var sound = new Audio('./rsc/sound/sky-explosion.mp3');
	  sound.play();
	};
	
	SkyExplosion.prototype.isActive = function() {
	  return this.activeState;
	};
	
	module.exports = SkyExplosion;


/***/ },
/* 4 */
/***/ function(module, exports) {

	function GroundExplosion(pos) {
	  this.width = 50;
	  this.height = 128;
	  this.spriteImage = new Image(50,128);
	  this.spriteImage.src = "./rsc/image/ground-explosion-sprite.png";
	  this.activeState = true;
	  this.pos = pos;
	  this.sx = 0;
	}
	
	var _fullWidth = 900;
	GroundExplosion.prototype.draw = function(context) {
	  if (this.sx === 0) {
	    this.playSound();
	  }
	
	  context.drawImage(this.spriteImage, this.sx, 0, this.width, this.height,
	    this.pos[0]-(this.width/2), this.pos[1]-(this.height/2), this.width, this.height);
	
	  this.sx += 50;
	  if (this.sx === _fullWidth) {
	    this.activeState = false;
	  }
	};
	
	GroundExplosion.prototype.playSound = function() {
	  var sound = new Audio('./rsc/sound/ground-explosion.mp3');
	  sound.play();
	};
	
	GroundExplosion.prototype.isActive = function() {
	  return this.activeState;
	};
	
	module.exports = GroundExplosion;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var MovingObject = __webpack_require__(6);
	var Util = __webpack_require__(7);
	
	function Meteorite(pos, DIM_X, DIM_Y) {
	  MovingObject.call(this, {
	    pos: pos,
	    DIM_X: DIM_X,
	    DIM_Y: DIM_Y
	  });
	  this.vel = this.randomVel();
	  this.radian = this.findRadian();
	
	  this.width = 512;
	  this.height = 512;
	  this.spriteImage = new Image(this.width, this.height);
	  this.spriteImage.src = "./rsc/image/meteorite-sprite.png";
	
	  this.sx = 0;
	}
	
	Util.inherits(Meteorite, MovingObject);
	
	var _displaySize = 100;
	Meteorite.prototype.draw = function(context) {
	  var rotatedObj = this.rotateAndCache(this.spriteImage);
	  context.drawImage(rotatedObj, 0, 0, this.width, this.height,
	    this.pos[0] - (_displaySize/2), this.pos[1] - (_displaySize/2), _displaySize, _displaySize);
	};
	
	var _fullWidth = 3072; // this is the full width of the sprite image
	Meteorite.prototype.rotateAndCache = function(img) {
	  var offscreenCanvas = document.createElement('canvas');
	  var offscreenCtx = offscreenCanvas.getContext('2d');
	
	  offscreenCanvas.width = img.width;
	  offscreenCanvas.height = img.height;
	
	  offscreenCtx.translate(img.width/2, img.height/2);
	  offscreenCtx.rotate(this.radian);
	  offscreenCtx.drawImage(img, this.sx, 0, img.width, img.height,
	    (-img.width/2), (-img.height/2), img.width, img.height);
	  // offscreenCtx.translate(-img.width/2, -img.height/2);
	  this.sx += this.width;
	  if (this.sx === _fullWidth) {
	    this.sx -= _fullWidth;
	  }
	  return offscreenCanvas;
	};
	
	Meteorite.prototype.randomVel = function() {
	  if (this.pos[0] < this.DIM_X/2) {
	    return [Math.random()*5 + 1, Math.random()*5 + 1];
	  } else {
	    return [-(Math.random()*5 + 1), Math.random()*5 + 1];
	  }
	};
	
	Meteorite.prototype.isCollidedWithGround = function() {
	  if (this.pos[0] > 0 && this.pos[0] < this.DIM_X) {
	    if (this.pos[1] >= this.DIM_Y - 100) {
	      return true;
	    } else {
	      return false;
	    }
	  } else {
	    return false;
	  }
	};
	
	module.exports = Meteorite;


/***/ },
/* 6 */
/***/ function(module, exports) {

	function MovingObject(args) {
	  this.pos = args.pos;
	  this.DIM_X = args.DIM_X;
	  this.DIM_Y = args.DIM_Y;
	  this.activeState = true;
	}
	
	MovingObject.dist = function(pos1, pos2) {
	  var dx = pos1[0] - pos2[0];
	  var dy = pos1[1] - pos2[1];
	  var dist = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
	  return dist;
	};
	
	//All moving objects move
	MovingObject.prototype.move = function() {
	  this.pos[0] += this.vel[0];
	  this.pos[1] += this.vel[1];
	};
	
	MovingObject.prototype.accelerate = function(accel) {
	  this.vel[0] += accel[0];
	  this.vel[1] += accel[1];
	  this.radian = this.findRadian();
	};
	
	MovingObject.prototype.isMoving = function() {
	  return (this.vel[0] > 0) || (this.vel[1] > 0);
	};
	
	MovingObject.prototype.setInactive = function() {
	  this.activeState = false;
	};
	
	MovingObject.prototype.isActive = function() {
	  return this.activeState;
	};
	
	MovingObject.prototype.getPosition = function() {
	  return this.pos.slice();
	};
	
	MovingObject.prototype.findRadian = function() {
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
	};
	
	MovingObject.prototype.isOutOfBound = function() {
	  return (this.pos[0] < 0 || this.pos[0] > this.DIM_X) ||
	    (this.pos[1] < 0 || this.pos[1] > this.DIM_Y);
	};
	
	MovingObject.prototype.checkIsHittingWall = function() {
	  if (this.pos[0] < 0 || this.pos[0] > this.DIM_X) {
	    this.vel[0] *= -1;
	  }
	  if (this.pos[1] < 0 || this.pos[1] > this.DIM_Y) {
	    this.vel[1] *= -1;
	  }
	};
	
	MovingObject.prototype.size = function() {
	  //waiting to be overriden
	  return 30;
	};
	
	MovingObject.prototype.isCollidedWith = function(otherObject) {
	  if (this.isMoving() || otherObject.isMoving()) {
	    var objectDist = MovingObject.dist(this.pos, otherObject.pos);
	    var radSum = this.size() + otherObject.size();
	    return (objectDist < radSum);
	  } else {
	    return false;
	  }
	};
	
	module.exports = MovingObject;


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = {
	  inherits: function(ChildClass, ParentClass) {
	    function Surrogate(){}
	    Surrogate.prototype = ParentClass.prototype;
	    ChildClass.prototype = new Surrogate();
	    ChildClass.prototype.constructor = ChildClass;
	  },
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var MovingObject = __webpack_require__(6);
	var Util = __webpack_require__(7);
	
	function Pedestrian(pos, DIM_X, DIM_Y) {
	  MovingObject.call(this, {
	    pos: pos,
	    DIM_X: DIM_X,
	    DIM_Y: DIM_Y
	  });
	  this.vel = [5,0];
	  this.radian = 0;
	
	  this.width = 184;
	  this.height = 325;
	  this.spriteImage = new Image(this.width, this.height);
	  this.spriteImage.src = "./rsc/image/pedestrian.png";
	
	  this.alive = true;
	  this.safety = false;
	  this.sx = 0;
	  this.isFacingLeft = false;
	}
	
	Util.inherits(Pedestrian, MovingObject);
	
	Pedestrian.prototype.draw = function(context) {
	  var orientedPerson = this.orientateAndCache(this.spriteImage);
	  context.drawImage(orientedPerson, 0, 0, this.width, this.height,
	    this.pos[0] - (this.width/4), this.pos[1] - (this.height/4), this.width/4, this.height/4);
	};
	
	var _fullWidth = 1472;
	Pedestrian.prototype.orientateAndCache = function(img) {
	  var offscreenCanvas = document.createElement('canvas');
	  var offscreenCtx = offscreenCanvas.getContext('2d');
	
	  offscreenCanvas.width = img.width;
	  offscreenCanvas.height = img.height;
	
	  if (this.isFacingLeft) {
	    offscreenCtx.translate(img.width, 0);
	    offscreenCtx.scale(-1, 1);
	  }
	  offscreenCtx.drawImage(img, this.sx, 0, img.width, img.height,
	    0, 0, img.width, img.height);
	
	  this.sx += this.width;
	  if (this.sx === _fullWidth) {
	    this.sx -= _fullWidth;
	  }
	  return offscreenCanvas;
	};
	
	Pedestrian.prototype.setDead = function() {
	  this.alive = false;
	};
	
	Pedestrian.prototype.setSafety = function() {
	  this.safety = true;
	};
	
	Pedestrian.prototype.isAlive = function() {
	  return this.alive;
	};
	
	Pedestrian.prototype.isSaved = function() {
	  return this.safety;
	};
	
	Pedestrian.prototype.isCollidedWith = function(otherObject) {
	  if (this.isMoving() || otherObject.isMoving()) {
	    var objectDist = MovingObject.dist(this.pos, otherObject.pos);
	    return (objectDist < 65);
	  } else {
	    return false;
	  }
	};
	
	Pedestrian.prototype.updateSafetyStatus = function() {
	  if (this.pos[0] > this.DIM_X && this.isAlive()) {
	    this.setSafety();
	  }
	};
	
	module.exports = Pedestrian;


/***/ },
/* 9 */
/***/ function(module, exports) {

	function Background(DIM_X, DIM_Y) {
	  this.DIM_X = DIM_X;
	  this.DIM_Y = DIM_Y;
	}
	
	var _imgHeight = 768;
	var _imgWidth = 1366;
	Background.prototype.draw = function(context) {
	  var spriteImage = new Image(_imgWidth, _imgHeight);
	  spriteImage.src = "./rsc/image/background-city.png";
	  context.drawImage(spriteImage, 0, 0, _imgWidth, _imgHeight,
	    0, this.DIM_Y - this.DIM_X*_imgHeight/_imgWidth,
	    this.DIM_X, this.DIM_X*_imgHeight/_imgWidth);
	};
	
	//Alternative background but it's now deprecated
	var _groundImgHeight = 74;
	var _groundImgWidth = 1364;
	Background.prototype.drawGround = function(context) {
	  var spriteImage = new Image(_groundImgWidth, _groundImgHeight);
	  spriteImage.src = "./rsc/image/ground.png";
	  context.drawImage(spriteImage, 0, 0, _groundImgWidth, _groundImgHeight,
	    0, this.DIM_Y - _groundImgHeight*0.90, this.DIM_X, this.DIM_X*_groundImgHeight/_groundImgWidth);
	};
	
	var _mountImgHeight = 121;
	var _mountImgWidth = 1130;
	Background.prototype.drawMountain = function(context) {
	  var spriteImage = new Image(_mountImgWidth, _mountImgHeight);
	  spriteImage.src = "./rsc/image/mountains.png";
	  context.drawImage(spriteImage, 0, 0, _mountImgWidth, _mountImgHeight,
	    0, this.DIM_Y - _groundImgHeight - (0.80*_mountImgHeight),
	     this.DIM_X, this.DIM_X*_mountImgHeight/_mountImgWidth);
	};
	
	
	
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

	var MovingObject = __webpack_require__(6);
	var Util = __webpack_require__(7);
	
	function Bird(pos, DIM_X, DIM_Y) {
	  MovingObject.call(this, {
	    pos: pos,
	    DIM_X: DIM_X,
	    DIM_Y: DIM_Y
	  });
	  this.vel = [0,0];
	  this.radian = 0;
	
	  this.width = 98.5;
	  this.height = 66;
	  this.spriteImage = new Image(this.width, this.height);
	  this.spriteImage.src = "./rsc/image/flappy-bird-sprite.png";
	
	  this.sx = 0;
	  this.isFlapping = false;
	  this.isFacingLeft = false;
	}
	
	Util.inherits(Bird, MovingObject);
	
	var _fullWidth = 788;
	Bird.prototype.draw = function(context) {
	  var orientedBird = this.orientateAndCache(this.spriteImage);
	  context.drawImage(orientedBird, 0, 0, this.width, this.height,
	    this.pos[0] - (this.width/2), this.pos[1] - (this.height/2) - 10, this.width/2, this.height/2);
	};
	
	Bird.prototype.orientateAndCache = function(img) {
	  var offscreenCanvas = document.createElement('canvas');
	  var offscreenCtx = offscreenCanvas.getContext('2d');
	
	  offscreenCanvas.width = img.width;
	  offscreenCanvas.height = img.height;
	
	  if (this.isFacingLeft) {
	    offscreenCtx.translate(img.width, 0);
	    offscreenCtx.scale(-1, 1);
	  }
	  offscreenCtx.drawImage(img, this.sx, 0, img.width, img.height,
	    0, 0, img.width, img.height);
	
	  if (this.isFlapping) {
	    this.sx += this.width;
	    if (this.sx === _fullWidth) {
	      this.sx -= _fullWidth;
	    }
	  }
	  return offscreenCanvas;
	};
	
	Bird.prototype.getVerticalVelocity = function() {
	  return this.vel[1];
	};
	
	Bird.prototype.startFlapping = function() {
	  this.isFlapping = true;
	};
	
	Bird.prototype.stopFlapping = function() {
	  this.isFlapping = false;
	};
	
	Bird.prototype.wrapIfHittingWall = function() {
	  if (this.pos[0] - (this.width/2) < 0 ) {
	    this.pos[0] = this.pos[0] + this.DIM_X;
	  } else if (this.pos[0] + (this.width/2) > this.DIM_X) {
	    this.pos[0] = this.pos[0] % this.DIM_X;
	  }
	
	  if (this.pos[1] - (this.height/2) <= 0) {
	    this.vel[1] = 0;
	    this.pos[1] = (this.height/2);
	  } else if (this.pos[1] + (this.height/2) >= this.DIM_Y) {
	    this.vel[0] = 0;
	    this.vel[1] = 0;
	    this.pos[1] = this.DIM_Y - (this.height/2);
	  }
	};
	
	Bird.prototype.accelerate = function(accel) {
	  this.vel[0] += accel[0];
	  this.vel[1] += accel[1];
	  if (this.isFlapping) {
	    this.vel[1] -= 0.40;
	  }
	};
	
	Bird.prototype.setFaceLeft = function() {
	  this.isFacingLeft = true;
	};
	
	Bird.prototype.setFaceRight = function() {
	  this.isFacingLeft = false;
	};
	
	Bird.prototype.moveLeft = function() {
	  this.setFaceLeft();
	  if (this.vel[0] > 0) {
	    this.vel[0] = 0;
	  }
	  this.vel[0] = -12;
	};
	
	Bird.prototype.moveRight = function() {
	  this.setFaceRight();
	  if (this.vel[0] < 0) {
	    this.vel[0] = 0;
	  }
	  this.vel[0] = 12;
	};
	
	module.exports = Bird;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map