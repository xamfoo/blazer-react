_.each({
  bState: function () {
    var self = this;
    self._stateDep.depend();
    return _.reduce(self.state.keys, function (acc, v, k) {
      self;
      acc[k] = function () { return self.state.get(k); };
      return acc;
    }, {});
  },
  bData: function () { return this.data(); },
  bThis: function () { return this; }
}, function (v, k) { Template.registerHelper(k, Component._wrapContext(v)); });
