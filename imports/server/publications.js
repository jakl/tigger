import { Meteor } from 'meteor/meteor';
import util from '/imports/server/util.js'
import db from '/imports/shared/db.js'

Meteor.publish('files', function() {
  if (util.userAllowed(this.userId)) {
    return db.Files.find();
  }
});

Meteor.publish('tags', function() {
  if (util.userAllowed(this.userId)) {
    return db.Tags.find();
  }
});
