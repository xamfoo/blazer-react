var SetIntervalMixin = {
  onCreated: function() {
    this.intervals = [];
  },
  setInterval: function() {
    this.intervals.push(Meteor.setInterval.apply(this, arguments));
  },
  onDestroyed: function() {
    this.intervals.map(clearInterval);
  }
};

Blazer.component('body', {
  mixins: [SetIntervalMixin],

  getInitialState: function () { return this.timeNow(); },

  timeNow: function () { return { time: new Date }; },

  tick: function() { this.setState(this.timeNow()); },

  onRendered: function() { this.setInterval(this.tick.bind(this), 1000); },

  hours: _.range(0, 12),

  handData: function() {
    var time = this.state().time;
    return {
      hourDegrees: time.getHours() * 30,
      minuteDegrees: time.getMinutes() * 6,
      secondDegrees: time.getSeconds() * 6
    };
  },

  radial: function (angleDegrees,
                    startFraction,
                    endFraction) {
    var r = 100;
    var radians = (angleDegrees-90) / 180 * Math.PI;

    return {
      x1: r * startFraction * Math.cos(radians),
      y1: r * startFraction * Math.sin(radians),
      x2: r * endFraction * Math.cos(radians),
      y2: r * endFraction * Math.sin(radians)
    };
  },

  helpers: {
    degrees: function () { return 30 * this.context(); }
  }
});
