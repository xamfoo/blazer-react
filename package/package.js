Package.describe({
  name: 'blazer:react',
  version: '0.1.1',
  summary: "Blaze add-on: Create stateful components with methods and mixins like in Facebook's React",
  git: 'https://github.com/xamfoo/blazer-react',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  configure(api);
});

Package.onTest(function(api) {
  configure(api);
  api.use('tinytest');
});

function configure (api) {
  api.versionsFrom('1.0.4.1');
  api.use([
    'blaze',
    'reactive-dict',
    'tracker',
    'check',
    'underscore',
    'templating'
  ], 'client');
  api.use('xamfoo:reactive-obj@0.4.0', 'client', {weak: true});

  api.addFiles([
    'lib/blazer.js',
    'lib/component.js',
    'lib/component_static.js',
    'lib/helpers.js',
  ], 'client');

  api.export('Blazer', 'client');
}
