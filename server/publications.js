import { Meteor } from 'meteor/meteor';

Meteor.publish('files', function() {
  if (userAllowed(this.userId)) {
    return Files.find();
  }
});

Meteor.publish('tags', function() {
  if (userAllowed(this.userId)) {
    return Files.find();
  }
});
