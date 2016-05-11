module.exports = {
  inherits: function(ChildClass, ParentClass) {
    function Surrogate(){}
    Surrogate.prototype = ParentClass.prototype;
    ChildClass.prototype = new Surrogate();
    ChildClass.prototype.constructor = ChildClass;
  },
};
