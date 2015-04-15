_.each({
  bState: function () { return this.state(); },
  bData: function () { return this.data(); },
  bThis: function () { return this; }
}, function (v, k) { Template.registerHelper(k, Component._wrapContext(v)); });
