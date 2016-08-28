import { Meteor } from 'meteor/meteor';
import walk from 'simple-walk';
import FS from 'fs';
import Path from 'path';
import util from '/imports/server/util.js'
import db from '/imports/shared/db.js'

Meteor.startup(function() {
  db.Files.remove({});
  db.Tags.remove({});

  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/public/.#files/',
    checkCreateDirectories: true,
    validateRequest: function(req, res) {
      console.log('UploadServer#validateRequest req res')
      console.log(req);
      console.log(res);
    },
    validateFile: function(req, res) {
      console.log('UploadServer#validateFiles req res')
      console.log(req);
      console.log(res);
    }
  });


  walk.match(util.sharedFilesPath).map(fullPath => {
    const file = Path.basename(fullPath);
    const relativePath = relative(fullPath);
    const tags = getTags(Path.dirname(relativePath));

    tags.map(addTag);

    db.Files.insert({
      name: file,
      tags: tags,
      path: relativePath
    });
  });


  FS.watch(util.sharedFilesPath, { recursive: true },
    Meteor.bindEnvironment(function(_, path) {
      const file = Path.basename(path);
      const tags = getTags(Path.dirname(path));

      try {
        if (FS.statSync(util.sharedFilesPath + '/' + path).isFile()) {
          db.Files.insert({
            name: file,
            tags: tags,
            path: path
          });
          tags.map(addTag);
        }
      } catch (undefined) {
        if (db.Files.remove({path: path})) {
          // If we removed a file, remove any associated now-empty tags.
          tags.map(tag => {
            if (!db.Files.find({tags: tag}).length) {
              db.Tags.remove({_id: tag});
            }
          });
        } else { // no file was removed, must be a directory
          const match_deleted_dir = new RegExp(`^${path}`);
          if (!db.Files.remove({path: {$regex: match_deleted_dir}})) {
            // We saw a file get deleted that didn't exist in mongo,
            // so we assumed it was a directory since we don't track those
            // However we didn't find any stale mongo files inside that directory,
            // which could just mean that the whole dir content was previously deleted
            console.error('An empty directory was deleted! If it seems ok, remove this error logging.');
          }
        }
      }
    })
  );


  function getTags(path) {
    return path.split('/').filter(function(tag) {
      return tag !== '' && tag !== '.';
    });
  };

  function relative(fullPath) {
    return Path.relative(util.sharedFilesPath, fullPath);
  };

  function addTag(tag) {
    try {
      return db.Tags.insert({
        _id: tag
      });
    } catch (undefined) {}
  };

  function removeTag(tag) {
    if (!db.Files.findOne({
      tags: tag
    })) {
      return db.Tags.remove({
        _id: tag
      });
    }
  };

});
