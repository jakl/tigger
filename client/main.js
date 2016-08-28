import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import db from '/imports/shared/db.js';

Template.files.onCreated(function filesOnCreated() {
  this.subscribe('files');
});

Template.tags.onCreated(function tagsOnCreated() {
  this.subscribe('tags');
});

Template.tags.helpers({
  tags() {
    return db.Tags.find();
  }
})

Template.files.helpers({
  files() {
    return db.Files.find();
  },
});

Template.files.events({
  'click button'(event, instance) {
    $.fileDownload(`/dl?name=${this.path}&id=${Meteor.user()._id}`);
  },
});

Template.uploadFile.helpers({
  fileUploadAuth() {
    return { userId: Meteor.user() ? Meteor.user()._id : 42 };
  },
});
