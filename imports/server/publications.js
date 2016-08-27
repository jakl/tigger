import { Meteor } from 'meteor/meteor';
import config from '/imports/server/config.js'

Meteor.publish('files', function() {
  if (config.userAllowed(this.userId)) {
    return Files.find();
  }
});

Meteor.publish('tags', function() {
  if (config.userAllowed(this.userId)) {
    return Tags.find();
  }
});
