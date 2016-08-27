import { Meteor } from 'meteor/meteor';
import { walk } from 'walk';
import { watch } from 'watchr';
import FS from 'fs';
import Path from 'path';


Meteor.subscribe("files");
Files = new Mongo.Collection("files");

Meteor.subscribe("tags");
Tags = new Mongo.Collection("tags");

Meteor.startup(function() {
  var addTag, getTags, relative, removeTag;
  Files.remove({});
  Tags.remove({});
  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/public/.#files/',
    checkCreateDirectories: true,
    validateRequest: function(req, res) {
      debugger;
    },
    validateFile: function(req, res) {
      debugger;
    }
  });

  walk(sharedFilesPath).on('names', Meteor.bindEnvironment(function(fullPath, files) {
    var i, len, relativePath, results, tag, tags;
    relativePath = relative(fullPath);
    tags = getTags(relativePath);
    files.filter(function(file) {
      return FS.statSync(fullPath + '/' + file).isFile();
    }).forEach(function(file) {
      return Files.insert({
        name: file,
        tags: tags,
        path: relativePath + '/' + file
      });
    });
    results = [];
    for (i = 0, len = tags.length; i < len; i++) {
      tag = tags[i];
      results.push(addTag(tag));
    }
    return results;
  }));
  watch({
    path: sharedFilesPath,
    listener: Meteor.bindEnvironment(function(changeType, fullPath) {
      var i, j, len, len1, name, relativePath, results, results1, tag, tags;
      relativePath = relative(fullPath);
      tags = getTags(Path.dirname(relativePath));
      switch (changeType) {
        case 'create':
          if (FS.statSync(fullPath).isFile()) {
            name = Path.basename(relativePath);
            Files.insert({
              name: name,
              tags: tags,
              path: relativePath
            });
            results = [];
            for (i = 0, len = tags.length; i < len; i++) {
              tag = tags[i];
              results.push(addTag(tag));
            }
            return results;
          }
          break;
        case 'delete':
          Files.remove({
            path: relativePath
          });
          results1 = [];
          for (j = 0, len1 = tags.length; j < len1; j++) {
            tag = tags[j];
            results1.push(removeTag(tag));
          }
          return results1;
      }
    })
  });
  getTags = function(path) {
    return path.split('/').filter(function(tag) {
      return tag !== '';
    });
  };
  relative = function(fullPath) {
    return Path.relative(sharedFilesPath, fullPath);
  };
  addTag = function(tag) {
    try {
      return Tags.insert({
        _id: tag
      });
    } catch (undefined) {}
  };
  removeTag = function(tag) {
    if (!Files.findOne({
      tags: tag
    })) {
      return Tags.remove({
        _id: tag
      });
    }
  };
});
