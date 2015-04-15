Package.describe({
  name: 'xamfoo:blazer-react',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
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
  api.versionsFrom('1.1.0');
  api.use([
    'ejson',
    'blaze',
    'reactive-var',
    'tracker',
    'check',
    'underscore'
  ], 'client');

  api.addFiles([
    'lib/blazer.js',
    'lib/component.js',
    'lib/component_static.js',
    'lib/helpers.js',
  ], 'client');
}
