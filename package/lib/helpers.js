var bState;

if (typeof ReactiveObj === 'undefined') {
  bState = function () {
    var self = this;
    self._stateDep.depend();
    return _.reduce(self.state.keys, function (acc, v, k) {
      self;
      acc[k] = function () { return self.state.get(k); };
      return acc;
    }, {});
  };
}
else {
  bState = function () {
    var self = this;
    var computation = Tracker.currentComputation;
    var node = Tracker.nonreactive(function () {
      return self.state.get();
    });
    var keyWatcher = Tracker.autorun(function (c) { self.state.get(); });
    function get (k) {
      keyWatcher.stop();
      return self.state.get(k);
    }

    self._stateDep.depend();

    keyWatcher.onInvalidate(function () {
      if (!keyWatcher.stopped) computation.invalidate();
    });

    if (node !== null && typeof node === 'object') {
      var x = _.reduce(node, function (acc, v, k) {
        acc[k] = function () { return get(k); };
        return acc;
      }, {});
      return x;
    }
    else return undefined;
  }
}

_.each({
  bState: bState,
  bData: function () { return this.data(); },
  bThis: function () { return this; }
}, function (v, k) { Template.registerHelper(k, Component._wrapContext(v)); });
