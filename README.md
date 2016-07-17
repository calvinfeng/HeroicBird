# Heroic Bird
## Object-oriented JavaScript
[Heroic Bird live][bird]
[bird]: http://calvinfeng.github.io

### Class breakdown
* GameView
* Game
* Background
* Explosion
  * SkyExplosion
  * GroundExplosion
* MovingObject
  * Bird
  * Pedestrian
  * Meteorite

## GameView & Game
`GameView` is responsible for starting and pausing the game. It starts running the game by setting an interval on `game.step()` and `game.draw()` while keep track of the status of the game such as score and bird's vertical speed.

`Game` contains all the core logic for running the game. When the game is initialized, a bird object is also initialized. However, I initialized the bird in the GameView class because GameView needs access to the internal state of the bird for displaying its velocity. The game will create meteorites and pedestrians. In every iteration, the game does the following

``` javascript
Game.prototype.step = function() {
  this.checkCollisions();
  this.addMeteorites();
  this.addPeople();
  this.accelObjects();
  this.moveObjects();
  this.updateSafetyStatus();
  this.bird.wrapIfHittingWall();
};
```
First it checks collision between all the movable objects (pedestrian, bird, meteorites.) Then it repopulates the meteorites if some of them have been exploded. Objects are also accelerated and moved in every turn of iteration. The acceleration is largely due to in-game gravity.

After updating all the internal state of the objects, the game will draw them by calling `draw()`

## Meteorites, Pedestrians, & Bird
These classes inherit from `MovingObject`. They all possess basic movement functions such as `move()`, `accel()`, `getPosition()`, `getRadian()` and etc...

``` javascript
inherits: function(ChildClass, ParentClass) {
  function Surrogate(){}
  Surrogate.prototype = ParentClass.prototype;
  ChildClass.prototype = new Surrogate();
  ChildClass.prototype.constructor = ChildClass;
}
```

The radian is there to decide the rotation of an object. The velocity vector of meteorites is not constant because it is under the influence of gravity in vertical direction. Radian is a function of the velocity vector.

These objects are animatable; drawing them is more than merely drawing a static image on the canvas. The animation involved using a sprite sheet. What's being drawn on the canvas in every frame is a cropped section of the whole sprite sheet.
``` javascript
offscreenCanvas.width = img.width;
offscreenCanvas.height = img.height;

offscreenCtx.translate(img.width/2, img.height/2);
offscreenCtx.rotate(this.radian);
offscreenCtx.drawImage(img, this.sx, 0, img.width, img.height,
  (-img.width/2), (-img.height/2), img.width, img.height);
this.sx += this.width;
if (this.sx === _fullWidth) {
  this.sx -= _fullWidth;
}
return offscreenCanvas;
```
The trick is in changing the cropped section in every frame, to create the visual sensation of animation. `this.sx` is modified every time the object is drawn.

An off-screen canvas was used for performing rotation on moving-objects. HTML 5 canvas has unpleasant rotational mechanics. One cannot rotate an individual element on a canvas; the whole canvas must rotated altogether. The solution to this problem was that make an extra canvas, rotate it and then draw it on the on-screen canvas.

## Explosions
Similarly, to create the animation of explosion, sprite sheets were also used. However, explosion does not move and it does not change its angular orientation. The implementation is easier than that of moving-objects.

## Recent UPDATES
Everything has been translated to ES6, using `class` and `extends` for inheritance
