import Path from 'path';
import FS from 'fs';
import process from 'process';
import db from '/imports/shared/db'
import { Meteor } from 'meteor/meteor';
import permute from 'heaps-permute';

export const sharedFilesPath = Path.resolve(
  process.env.SHARED_PATH || [process.env.PWD, 'public', '.#files'].join('/')
);
export function relative(fullPath) {
  return Path.relative(sharedFilesPath, fullPath);
};

export const whitelist = JSON.parse(Assets.getText('whitelist.json'));
export const userAllowed = id => whitelist.indexOf(Meteor.users.findOne(id).services.twitter.screenName) >= 0

// Parse a single file path, relative to sharedFilesPath, and return a list of tag names
export function getTags(path) {
  return path.split('/').filter(function(tag) {
    return tag !== '' && tag !== '.';
  });
};
// Adds a tag to the db that exists as a directory in the filesystem
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
// Removes a tag from the db that was found as a directory, but the directory was just deleted
export function removeTag(tag) {
  if (db.Files.findOne({tags: tag})) {
    db.Tags.update({_id: tag}, {$inc: { count: -1 }});
  } else {
    db.Tags.remove({_id: tag});
  }
};

// Create a new tag in the db as well as syncing the directory structure, for a single file
export function createTag(tag, path) {
  addTag(tag); // add to db

  // For every permutation of possible paths that match this tag set,
  // sort them by how much of the path already exists, to find the most tangible newPath.
  // TODO: This could be made more efficient by looking at the directory one tag at a time, instead of an entire permutation.
  const tags = getTags(path).concat(tag);
  let dirCount = 0;
  newPath = permute(tags).map(tagShuffle => {
    try {
      for (i=0; i<tagShuffle.length; i++) {
        FS.statSync(tagShuffle.slice(0,i)); // If dir doesn't exist, throw error
        dirCount++;
      }
    } catch (undefined) {
    } finally {
      tagShuffle.shift(dirCount); // Add a sortable flag to the front of each permutation
      dirCount = 0;
      return tagShuffle;
    }
  }).sort((a, b) => a[0] - b[0])[0];

  if (newPath[0] !== newPath.length - 1) { // path doesn't yet exists
    // mkdir newPath
  }

  // move path to newPath/filename
  // update db Files to path = newPath/filename and tags += newTag
}
