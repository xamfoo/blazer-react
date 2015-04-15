// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Mongo.Collection("players");

if (Meteor.isClient) {
  Blazer.component('leaderboard', {
    getDefaultData: function () {
      return {
        pointSize: 5,
        players: Players.find({}, { sort: { score: -1, name: 1 } })
      };
    },

    dataTypes: {
      pointSize: Number
    },

    selectedName: function () {
      var player = Players.findOne(Session.get("selectedPlayer"));
      return player && player.name;
    },

    incScore: function () {
      Players.update(
        Session.get("selectedPlayer"),
        {$inc: {score: this.data().pointSize}}
      );
    },

    events: {
      'click .inc': 'incScore'
    }
  });

  Blazer.component('player', {
    helpers: {
      selected: function () {
        return Session.equals("selectedPlayer", this.context()._id) ?
          "selected" : '';
      }
    },

    selectPlayer: function () {
      Session.set("selectedPlayer", this.context()._id);
    },

    events: {
      'click': 'selectPlayer'
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace", "Grace Hopper", "Marie Curie",
                   "Carl Friedrich Gauss", "Nikola Tesla", "Claude Shannon"];
      _.each(names, function (name) {
        Players.insert({
          name: name,
          score: Math.floor(Random.fraction() * 10) * 5
        });
      });
    }
  });
}
