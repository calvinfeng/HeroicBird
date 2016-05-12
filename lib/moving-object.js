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
