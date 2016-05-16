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
