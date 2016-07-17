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
