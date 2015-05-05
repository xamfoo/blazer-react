Package.describe({
  name: 'blazer:react',
  version: '0.1.1',
  // Brief, one-line summary of the package.
  summary: "Blaze add-on: Create stateful components with methods and mixins like in Facebook's React",
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/xamfoo/blazer-react',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
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
  api.versionsFrom('1.0.3.1');
  api.use([
    'ejson',
    'blaze',
    'reactive-dict',
    'tracker',
    'check',
    'underscore',
    'templating'
  ], 'client');

  api.addFiles([
    'lib/blazer.js',
    'lib/component.js',
    'lib/component_static.js',
    'lib/helpers.js',
  ], 'client');

  api.export('Blazer', 'client');
}
