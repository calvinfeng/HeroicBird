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
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Game = __webpack_require__(2);
	var key = __webpack_require__(5);
	var Spacecraft = __webpack_require__(11);
	
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var SkyExplosion = __webpack_require__(6);
	var GroundExplosion = __webpack_require__(7);
	var Meteorite = __webpack_require__(4);
	var Background = __webpack_require__(8);
	
	function Game(canvasWidth, canvasHeight, ship) {
	  this.DIM_X = canvasWidth;
	  this.DIM_Y = canvasHeight;
	  this.meteorites = [];
	  this.explosions = [];
	  this.spacecraft = ship;
	  this.addMeteorites();
	  this.background = new Background(canvasWidth, canvasHeight);
	}
	
	Game.prototype.step = function() {
	  this.checkGroundCollisions();
	  this.checkSkyCollisions();
	  this.accelObjects();
	  this.moveObjects();
	  this.addMeteorites();
	  this.spacecraft.checkIsHittingWall();
	};
	
	Game.prototype.draw = function(ctx) {
	  var i;
	  ctx.clearRect(0, 0, this.DIM_X, this.DIM_Y);
	  this.background.drawGround(ctx);
	  this.background.drawMountain(ctx);
	
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
	
	  this.spacecraft.draw(ctx);
	};
	
	Game.prototype.addMeteorites = function() {
	  while (this.meteorites.length < 10) {
	    this.meteorites.push(new Meteorite(this.randomPos(), this.DIM_X, this.DIM_Y));
	  }
	};
	
	Game.prototype.addGroundExplosion = function(pos) {
	  this.explosions.push(new GroundExplosion(pos));
	};
	
	Game.prototype.addSkyExplosion = function(pos) {
	  this.explosions.push(new SkyExplosion(pos));
	};
	
	Game.prototype.moveObjects = function() {
	  this.meteorites.forEach(function(meteorite) {
	    if (meteorite.isActive()) {
	      meteorite.move();
	    }
	  });
	  this.spacecraft.move();
	};
	
	var _gravity = [0, 0.1];
	Game.prototype.accelObjects = function() {
	  this.meteorites.forEach(function(meteorite) {
	    if (meteorite.isActive()) {
	      meteorite.accelerate(_gravity);
	    }
	  });
	  this.spacecraft.accelerate(_gravity);
	};
	
	Game.prototype.randomPos = function() {
	  //randomPos is for meteorites;
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
	
	Game.prototype.allObjects = function() {
	  return [].concat(this.meteorites, this.spacecraft);
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
	
	
	module.exports = Game;


/***/ },
/* 3 */,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var MovingObject = __webpack_require__(9);
	var Util = __webpack_require__(10);
	
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
	    if (this.pos[1] >= this.DIM_Y - 50) {
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
/* 5 */
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
/* 6 */
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
	    // this.sx -= _fullWidth;
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
/* 7 */
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
/* 8 */
/***/ function(module, exports) {

	function Background(DIM_X, DIM_Y) {
	  this.DIM_X = DIM_X;
	  this.DIM_Y = DIM_Y;
	}
	
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
/* 9 */
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
	
	MovingObject.prototype.size = function() {
	  //waiting to be overriden
	  return 30;
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
/* 10 */
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var MovingObject = __webpack_require__(9);
	var Util = __webpack_require__(10);
	
	function Spacecraft(pos, DIM_X, DIM_Y) {
	  MovingObject.call(this, {
	    pos: pos,
	    DIM_X: DIM_X,
	    DIM_Y: DIM_Y
	  });
	  this.vel = [0,0];
	  this.radian = 0;
	
	  this.width = 99;
	  this.height = 154;
	  this.spriteImage = new Image(this.width, this.height);
	  this.spriteImage.src = "./rsc/image/spaceship-sprite.png";
	
	  this.sx = 0;
	  this.sy = 0;
	  this.isThrusterOn = false;
	}
	
	Util.inherits(Spacecraft, MovingObject);
	
	Spacecraft.prototype.draw = function(context) {
	  if (this.isThrusterOn) {
	    this.sy = this.height;
	  } else {
	    this.sy = 0;
	  }
	  var rotatedObj = this.rotateAndCache(this.spriteImage);
	  context.drawImage(rotatedObj, 0, 0, this.width, this.height,
	    this.pos[0] - (this.width/2), this.pos[1] - (this.height/2), this.width/2, this.height/2);
	};
	
	var _fullWidth = 396; // this is the full width of the sprite image
	Spacecraft.prototype.rotateAndCache = function(img) {
	  var offscreenCanvas = document.createElement('canvas');
	  var offscreenCtx = offscreenCanvas.getContext('2d');
	
	  offscreenCanvas.width = img.width;
	  offscreenCanvas.height = img.height;
	
	  offscreenCtx.translate(img.width/2, img.height/2);
	  offscreenCtx.rotate(this.radian);
	  offscreenCtx.drawImage(img, this.sx, this.sy, img.width, img.height,
	    (-img.width/2), (-img.height/2), img.width, img.height);
	
	  this.sx += this.width;
	  if (this.sx === _fullWidth) {
	    this.sx -= _fullWidth;
	  }
	  return offscreenCanvas;
	};
	
	Spacecraft.prototype.setThrusterOn = function() {
	  this.isThrusterOn = true;
	};
	
	Spacecraft.prototype.setThrusterOff = function() {
	  this.isThrusterOn = false;
	};
	
	Spacecraft.prototype.rotateClockwise = function() {
	  if (this.radian < Math.PI/2) {
	    this.radian += 10*Math.PI/180;
	  }
	};
	
	Spacecraft.prototype.rotateCounterClockwise = function() {
	  if (this.radian > -Math.PI/2) {
	    this.radian -= 10*Math.PI/180;
	  }
	};
	
	var _thrustForce = 0.50;
	Spacecraft.prototype.accelerate = function(accel) {
	  this.vel[0] += accel[0];
	  this.vel[1] += accel[1];
	  if (this.isThrusterOn) {
	    this.vel[0] += -1*_thrustForce*Math.cos(this.radian + Math.PI/2);
	    this.vel[1] += -1*_thrustForce*Math.sin(this.radian + Math.PI/2);
	  }
	  //this.radian = this.findRadian();
	};
	
	
	module.exports = Spacecraft;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map