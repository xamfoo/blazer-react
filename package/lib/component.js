Component = function () {};

_.extend(Component.prototype, {
  _verifyData: function (data) {
    this.dataTypes && check(data, Match.ObjectIncluding(this.dataTypes));
  },

  _onDataChange: function (component) {
    var view, dataVar, data;
    view = Blaze.getView('with');
    if (!view) return;

    dataVar = view.dataVar;
    if (!dataVar) return;

    data = dataVar.get();
    if (typeof data !== 'object') return;

    _.defaults(data, component._defaultData);
    Blazer.isDev && component._verifyData(data);
  },

  data: function () { return Template.instance().data || this._defaultData; },

  context: function () { return Template.currentData(); },

  view: function () { return Blaze.currentView; },

  _writeState: function (newState) {
    var self = this;
    var newKeys = _.keys(newState);
    var toRemove = _.difference(_.keys(self.state.keys), newKeys);
    for (var i=0; i<toRemove.length; i+=1) {
      self.state.set(toRemove[i], null);
      delete self.state.keys[toRemove[i]];
    }
    for (var i=0; i<newKeys.length; i+=1) {
      self.state.set(newKeys[i], newState[newKeys[i]]);
    }
  },

  setState: function (partialState, callback) {
    var self = this;

    partialState && Tracker.afterFlush(function () {
      var newState;
      if (typeof partialState === 'object') newState = partialState;
      else if (typeof partialState === 'function')
        newState = partialState(
          _.extend({}, self.state.keys), self.instance.data
        );

      if (!newState) return;

      self._writeState(newState);
      callback && Tracker.afterFlush(callback);
    });
  },

  replaceState: function (newState, callback) {
    var self = this;
    typeof newState === 'object' && Tracker.afterFlush(function () {
      self._writeState(newState);
      callback && Tracker.afterFlush(callback);
    });
  },

  forceUpdate: function () { this._stateDep.changed(); }
});

// Add convenience methods
_.each(
  [
    'findAll', '$', 'find', 'autorun', 'subscribe', 'subscriptionsReady'
  ],
  function (k) {
    Component.prototype[k] = function () {
      return this.instance[k].apply(this.instance, arguments);
    }
  }
);
