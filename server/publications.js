import { Meteor } from 'meteor/meteor';

whitelist = JSON.parse(Assets.getText('whitelist.json'));
userAllowed = id => Meteor.users.findOne(id).services.twitter.screenName in this.whitelist;

Tags = new Meteor.Collection('tags');
Files = new Meteor.Collection('files');

Meteor.publish('files', function() {
  if (userAllowed(this.userId)) {
    return Files.find();
  }
});

Meteor.publish('tags', function() {
  if (userAllowed(this.userId)) {
    return Tags.find();
  }
});
