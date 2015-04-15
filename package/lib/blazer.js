var newBlazer = function () {
  this._cpntClasses = {};
};

_.extend(newBlazer.prototype, {
  isDev: ('localhost' === (window && window.location &&
          window.location.hostname)),

  component: function (tmpl, specs) {
    var self = this;
    var name, cpntClass;

    if (!(tmpl instanceof Blaze.Template)) tmpl = Template[tmpl];
    name = tmpl.viewName;

    cpntClass = self._cpntClasses[name];
    if (typeof specs !== 'object') return cpntClass;
    if (cpntClass) throw new Error(name + ' already defined as component');

    cpntClass = self._cpntClasses[name] = Component.extend(tmpl, specs);

    // Register lifecycle methods
    tmpl.onCreated(_.partial(Component._constructComponent, cpntClass));
    Component._registerTemplateHooks(tmpl, specs);
  }
});

Blazer = newBlazer();
