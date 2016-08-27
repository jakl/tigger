import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';

import './main.html';

var Files;

Template.files.onCreated(function filesOnCreated() {
  Meteor.subscribe('files');
  Files = new Mongo.Collection("files");
});

Template.files.helpers({
  files() {
    return ; Files.find();
  },
});

Template.files.events({
  'click button'(event, instance) {
    //$.fileDownload("/dl?name=" + @path + "&id=" + Meteor.user()._id});
  },
});

Template.uploadFile.helpers({
  fileUploadAuth() {
    return { userId: Meteor.user() ? Meteor.user()._id : 42 };
  },
});
