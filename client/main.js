import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.files.onCreated(function filesOnCreated() {
  //  do I need ot sub to files here?
});

Template.files.helpers({
  files() {
    return ;//@Files.find();
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
