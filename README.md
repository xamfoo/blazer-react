# blazer-react

Add-on for Meteor Blaze using concepts from Facebook's React. If you wish to
use React instead check out https://github.com/reactjs/react-meteor.

This allows you to:

- Create stateful components in Meteor using concepts from React
- Declare methods that can be accessed anywhere inside the template
- Reuse code in different templates with mixins
- Use the same `this` for helpers, event handlers and lifecycle methods declared
  in the component
- Declare static methods on a component
- Perform checks on data context passed to a template (in development mode)

This package extends but does not change Blaze behavior so it plays well with
existing Meteor code. The API is minimal and similar to both React and Meteor
so it should be easy to use regardless of your background.

This package depends only on Meteor core packages:

- templating
- blaze
- tracker
- reactive-dict
- check
- underscore

Optional dependencies:

- xamfoo:reactive-obj

## Installation

    meteor add blazer:react

## Background

### React to Blaze Mapping

The following features are not implemented since they are similar to React.

React Terms/Concepts | Blaze Terms/Concepts
------------- | -------------
Components | Templates
Component instance | Template instance
Component#render() | Blaze.render()
Component#props | Template#data
DOM element event bindings | Event Maps

### Package Implementation

This is how the package implementation maps to React.

React Terms/Concepts | Blazer Terms/Concepts
------------- | -------------
React.createClass() | Blazer.component()
`this.state`, `this.props` | `this.state()`, `this.data()` in template events, helpers and lifecycle. `{{bState}}` and `{{bData}}` template helpers.
Component#getDefaultProps | Component#getDefaultData
Component#propTypes | Component#dataTypes using `check` and `Match` patterns
Component#statics | Static methods for Templates
Component#getInitialState, #mixins | 1-1 mapping
Component#componentWillMount | Component#onCreated
Component#componentDidMount | Component#onRendered
Component#componentWillUnmount | Component#onDestroyed is similar but has no DOM access

Other features:

- `{{bThis}}` allow access to anything in the component specification.
- `this.context()` shorthand access the data context

## API

### Global methods

**Blazer.component(templateName|Blaze.Template, [specs])**

Add component specifications for a Blaze template. See *Component
Specifications* for more information.

If `specs` is not specified, the `statics` object of the component is returned.

**Blazer.isDev**

By default this value is true if client URL hostname is `localhost`. Setting to
false disables checking for `dataTypes`.

### Component methods

Component methods are attached to all Blaze template instances.

**data()**

Same as Template.instance().data

> The data context of this instance's latest invocation.
> This property provides access to the data context at the top level of the
> template. It is updated each time the template is re-rendered. Access is
> read-only and non-reactive.

Example:

    Blazer.component('comment', {
      img: function () {
        return this.data().url;
      },
      //...
    });

**context()**

Same as Template.currentData()

> - Inside an `onCreated`, `onRendered`, or `onDestroyed` callback, returns
> the data context of the template.
> - Inside an event handler, returns the data context of the template on which
> this event handler was defined.
> - Inside a helper, returns the data context of the DOM node where the helper
> was used.

> Establishes a reactive dependency on the result.

Example:

    Blazer.component('chat', {
      selectRoom: function () {
        Meteor.call('selectRoom', this.context().id);
      },
      //...
    });

**state**

Returns the `state` object of the template instance, which is a `ReactiveDict`
by default. If `ReactiveObj` exists it will be used instead of `ReactiveDict`.
Methods available in both `ReactiveDict` and `ReactiveObj` are: `get()`,
`equals()`, `set()`, `setDefault()`
- [Documentation for `ReactiveDict` in `Session`](http://docs.meteor.com/#/full/session)
- [Documentation for `ReactiveObj`](https://github.com/xamfoo/reactive-obj)


Example:

    Blazer.component('chat', {
      messages: function () {
        return Messages.find({room: this.state.get('roomId')});
      },
      //...
    });

**setState(function|object nextState[, function callback])**

Adapted from React:
> Merges nextState with the current state. This is the primary method you use to
> trigger UI updates from event handlers and server request callbacks.

> The first argument can be an object (containing zero or more keys to update)
> or a function (of state and props) that returns an object containing keys to
> update.

> It's also possible to pass a function with the signature function(state, data).
> This can be useful in some cases when you want to enqueue an atomic update that
> consults the previous value of state+data before setting any values.

Example:

    Blazer.component('board', {
      selectUser: function () {
        this.setState({ roomId: this.context().id });
      },

      addScore: function () {
        this.setState(
          function (previousState, currentData) {
            return {score: previousState.score + 1};
          },
          function () { alert('Score updated!'); }
        );
      },
      //...
    });

**replaceState(object nextState[, function callback])**

    Blazer.component('form', {
      resetForm: function () {
        this.replaceState({});
      },
      //...
    });

**forceUpdate([function callback])**

Triggers recomputation for all template helpers reading from `state`

Example:

    Blazer.component('chat', {
      _onChange: function () {
        this.forceUpdate();
      },
      //...
    });

**instance**

Same as Template.instance()

**view()**

Same as Blaze.currentView

**findAll, $, find, firstNode, lastNode, autorun, subscribe, subscriptionsReady**

Convenience reference to instance methods.

### Spacebars helpers

**{{bState}}**

Helper to read from `state()`

Example:

    <template name="chat">
      {{#each bState.messages}}
        <span>{{name}}</span>
        ...
      {{/each}}
    </template>

**{{bData}}**

Helper to read from `data()`. Useful when a key of parent data has been shadowed
by a data context.

Example:

    <template name="tree">
      {{#each tree}}
        <span>Total child nodes {{total}}</span>
        <span>Node {{index}} of {{bData.total}}</span>
        ...
      {{/each}}
    </template>

**{{bThis}}**

Access anything specified inside a Blazer component. In some cases this may be
an alternative to declaring template helpers.

Example:

    <template name="list">
      {{#each bThis.getList id="fruits"}}
        <button {{bThis.isActive}}>Select</button>
        ...
      {{/each}}
    </template>

### Component Specifications

**getInitialState()**

Invoked once when template is created. The return value will be used as
the initial value of this.state.

Example:

    Blazer.component('TodoTextInput', {
      getInitialState: function () {
        return {
          value: this.data().value || ''
        };
      }
      //...
    });

**getDefaultData()**

Invoked once and cached when the component is specified. Values in the
mapping will be set on `this.data` if the key is not specified by the
parent template instance (i.e. using an `in` check).

This method is invoked before any instances are created and thus cannot rely
on `this.data`. In addition, be aware that any complex objects returned by
getDefaultData() will be shared across instances, not copied.

Example:

    Blazer.component('character', {
      getDefaultData: function () {
        return {
          id: Meteor.userId()
        };
      }
      //...
    });

**events {}**

Maps events to method names or functions.

Example:

    Blazer.component('character', {
      onCancel: function () {
        //...
      },

      events: {
        'click .js-cancel': 'onCancel',

        'click .js-submit': function () {
          this.submit();
        }
      }
      //...
    });

**helpers {}**

Maps template helpers to method names or functions.

Example:

    Blazer.component('outfit', {
      findNeckTie: function () {
        return NeckTies.findOne({color: this.data().preferredColor});
      },

      helpers: {
        neckTie: 'findNeckTie',

        shoes: function () {
          return {size: 10, color: 'black'};
        }
      },
      //...
    });

**dataTypes {key: pattern}**

> key

> > Key in the data being matched

> pattern

> > A Meteor match pattern

The dataTypes object allows you to validate data being passed to your template.

Example:

    Blazer.component({
      dataTypes: {
        optionalBool: Match.Optional(Boolean),

        requiredNumber: Number,
        requiredString: String,

        requiredMessage: Message,

        requiredArray: [String],

        multiType: Match.OneOf(Boolean, String),

        positiveNumber: Match.Where(function (x) {
          return x > 0;
        })
      },
      //...
    });

**mixins [ {} ]**

From React:
> Components are the best way to reuse code in React, but sometimes very
> different components may share some common functionality. These are sometimes
> called cross-cutting concerns. React provides mixins to solve this problem.

> One common use case is a component wanting to update itself on a time
> interval. It's easy to use setInterval(), but it's important to cancel your
> interval when you don't need it anymore to save memory. React provides
> lifecycle methods that let you know when a component is about to be created
> or destroyed. Let's create a simple mixin that uses these methods to provide
> an easy setInterval() function that will automatically get cleaned up when
> your component is destroyed.

> A nice feature of mixins is that if a component is using multiple mixins and
> several mixins define the same lifecycle method (i.e. several mixins want to
> do some cleanup when the component is destroyed), all of the lifecycle methods
> are guaranteed to be called. Methods defined on mixins run in the order mixins
> were listed, followed by a method call on the component.

A mixin may also include other mixins and mixins may include each other. It is
possible to override an existing method in a mixin by declaring one in the
component with the same name.

Example:

    var SetIntervalMixin = {
      onCreated: function() {
        this.intervals = [];
      },
      setInterval: function() {
        this.intervals.push(Meteor.setInterval.apply(null, arguments));
      },
      onDestroyed: function() {
        this.intervals.map(Meteor.clearInterval);
      }
    };

    Blazer.component({
      mixins: [SetIntervalMixin], // Use the mixin
      getInitialState: function() {
        return {seconds: 0};
      },
      onRendered: function() {
        this.setInterval(this.tick, 1000); // Call a method on the mixin
      },
      tick: function() {
        this.setState({seconds: this.state().seconds + 1});
      }
    });

HTML

    <template name="TickTock">
      <p>
        Blazer has been running for {{bState.seconds}} seconds.
      </p>
    </template>

**statics {}**

From React:

> The `statics` object allows you to define static methods that can be called on
> the component class.

> Methods defined within this block are static, meaning that you can run them
> before any component instances are created, and the methods do not have access
> to the props or state of your components. If you want to check the value of
> props in a static method, have the caller pass in the props as an argument to
> the static method.

Example:

    Blazer.component('foobar', {
      statics: {
        customMethod: function(foo) {
          return foo === 'bar';
        }
      },
      //...
    });

    Blazer.component('foobar').customMethod('bar');  // true

#### Lifecycle Methods

Same as using Template lifecycle methods.

**onCreated()**

**onRendered()**

**onDestroyed()**

Example:

    Blazer.component('myComponent', {
      onCreated: function () {
        //...
      },
      onRendered: function () {
        //...
      },
      onDestroyed: function () {
        //...
      },
    });

## Contributing

- Feel free to raise issues and feature requests in the repo
- Fork and send in your pull requests

## Future Work

- Add unit tests
- Consider adding lifecycle methods componentWillUpdate, componentDidUpdate,
  shouldComponentUpdate, componentWillReceiveProps
