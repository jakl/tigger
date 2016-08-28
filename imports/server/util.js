import Path from 'path';
import FS from 'fs';
import process from 'process';
import db from '/imports/shared/db'
import { Meteor } from 'meteor/meteor';

export const sharedFilesPath = Path.resolve(
  process.env.SHARED_PATH || [process.env.PWD, 'public', '.#files'].join('/')
);

export const whitelist = JSON.parse(Assets.getText('whitelist.json'));
export const userAllowed = id => whitelist.indexOf(Meteor.users.findOne(id).services.twitter.screenName) >= 0

export function getTags(path) {
  return path.split('/').filter(function(tag) {
    return tag !== '' && tag !== '.';
  });
};

export function addTag(tag) {
  if (db.Tags.findOne({_id: tag})) {
    db.Tags.update({_id: tag}, {$inc: { count: 1 }});
  } else {
    db.Tags.insert({
      _id: tag,
      count: 1
    });
  }
};

export function removeTag(tag) {
  if (db.Files.findOne({tags: tag})) {
    db.Tags.update({_id: tag}, {$inc: { count: -1 }});
  } else {
    db.Tags.remove({_id: tag});
  }
};

export function relative(fullPath) {
  return Path.relative(sharedFilesPath, fullPath);
};
