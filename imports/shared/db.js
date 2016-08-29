import { Meteor } from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';

export const Tags = new Meteor.Collection('tags');
export const Files = new FilesCollection({
  collectionName: 'Files',
  allowClientCode: true, // false to disallow remove files from Client
  storagePath: process.env.SHARED_PATH || [process.env.PWD, 'public', '.#files'].join('/'),
  // onBeforeUpload: function (file) {
  //   Example allow upload files under 10MB, and only in png/jpg/jpeg formats
  //   if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.extension)) {
  //     return true;
  //   } else {
  //     return 'Please upload image, with size equal or less than 10MB';
  //   }
  // }
});
