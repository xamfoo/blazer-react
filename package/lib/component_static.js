_.extend(Component, {
  _constructComponent: function (cpntClass) {
    var inst = this;
    var component = new cpntClass;

    component.instance = inst;
    inst._bComponent = component;

    // Reactive computation for default data
    if (component._defaultData)
      inst.autorun(_.partial(component._onDataChange, component));

    // Set initialState
    if (component.getInitialState)
      component._state.set(component.getInitialState());
  },

  _traverseMixins: function (specHandler, specs, seen) {
    var mixinsCount = specs && specs.mixins && specs.mixins.length;
    seen = seen || [specs];

    if (typeof mixinsCount === 'number') {
      for (var i=0; i<mixinsCount; i+=1) {
        // Skip invalid and used mixins
        if (
          typeof specs.mixins[i] !== 'object' ||
          _.find(seen, function (v) { return v === specs.mixins[i]; })
        ) continue;

        seen.push(specs.mixins[i]);
        this._traverseMixins(specHandler, specs.mixins[i], seen);
      }
    }

    specHandler(specs);
  },

  _registerTemplateHooks: function (tmpl, specs) {
    var self = this;
    self._traverseMixins(_.partial(function (tmpl, specs) {
      _.chain(specs)
      .pick('onCreated', 'onRendered', 'onDestroyed')
      .each(function (v, k) { tmpl[k](self._wrapContext(v)); });
    }, tmpl), specs);
  },

  _getContext: function () {
    var context, instance;
    function closestInstance (view) {
      return view &&
        (view._templateInstance || closestInstance(view.parentView));
    }
    if (this instanceof Blaze.View) context = this._bComponent;
    else if (this instanceof Component) context = this;
    else {
      instance = Template.instance() || closestInstance(Blaze.currentView);
      context = instance && instance._bComponent;
    }
    return context;
  },
  _wrapContext: function (func) {
    var self = this;
    return function () {
      return func.apply(self._getContext.call(this) || this, arguments);
    };
  },

  _processSpecs: function (ctor, tmpl, specs) {
    this._traverseMixins(_.partial(function (ctor, tmpl, specs) {
      var self = this;
      var proto = ctor.prototype;

      // Cache default data
      if (!proto._defaultData && specs.getDefaultData) {
        proto._defaultData = specs.getDefaultData();
        typeof proto._defaultData !== 'object' && delete proto._defaultData;
      }

      specs = _.omit(
        specs,
        'onCreated', 'onRendered', 'onDestroyed', 'mixins'
      );

      function replaceMethodRef (acc, handler, k) {
        if (typeof handler === 'string') handler = specs[handler];
        handler && (acc[k] = self._wrapContext(handler));
        return acc;
      }

      _.each(specs, function (v, k, specs) {
        switch (k) {
          case 'statics':
            _.extend(ctor, v);
            break;
          case 'helpers':
            v = _.reduce(v, replaceMethodRef, {});
            tmpl.helpers(v);
            break;
          case 'events':
            v = _.reduce(v, replaceMethodRef, {});
            tmpl.events(v);
        }
        if (typeof v === 'function') proto[k] = self._wrapContext(v);
        else proto[k] = v;
      });
    }, ctor, tmpl).bind(this), specs);
  },

  extend: function (tmpl, specs) {
    var self = this;

    var ctor = function () {
      this._state = new ReactiveVar({}, EJSON.equals);
      this._stateDep = new Tracker.Dependency;
    };

    ctor.prototype.constructor = ctor;
    ctor.prototype = new Component;
    self._processSpecs(ctor, tmpl, specs);

    return ctor;
  }
});
