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
    let file = Path.basename(fullPath);
    let relativePath = relative(fullPath);
    let tags = getTags(Path.dirname(relativePath));

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
      console.log(arguments);

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
        db.Files.remove({
          path: path
        });
        tags.map(removeTag);
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
