import '/imports/server/publications.js';
import '/imports/server/file_transfer.js';

import { Meteor } from 'meteor/meteor';
import walk from 'simple-walk';
// import { watch } from 'watchr';
import FS from 'fs';
import Path from 'path';
import config from '/imports/server/config.js'
import collections from '/imports/shared/collections.js'

Meteor.startup(function() {
  collections.Files.remove({});
  collections.Tags.remove({});

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


  walk.match(config.sharedFilesPath).map(fullPath => {
    let file = Path.basename(fullPath);
    let relativePath = relative(fullPath);
    let tags = getTags(Path.dirname(relativePath));
    tags.map(addTag);

    collections.Files.insert({
      name: file,
      tags: tags,
      path: relativePath
    });
  });


//   watch({
//     path: config.sharedFilesPath,
//     listener: Meteor.bindEnvironment(function(changeType, fullPath) {
//       var i, j, len, len1, name, relativePath, results, results1, tag, tags;
//       relativePath = relative(fullPath);
//       tags = getTags(Path.dirname(relativePath));
//       switch (changeType) {
//         case 'create':
//           if (FS.statSync(fullPath).isFile()) {
//             name = Path.basename(relativePath);
//             Files.insert({
//               name: name,
//               tags: tags,
//               path: relativePath
//             });
//             results = [];
//             for (i = 0, len = tags.length; i < len; i++) {
//               tag = tags[i];
//               results.push(addTag(tag));
//             }
//             return results;
//           }
//           break;
//         case 'delete':
//           Files.remove({
//             path: relativePath
//           });
//           results1 = [];
//           for (j = 0, len1 = tags.length; j < len1; j++) {
//             tag = tags[j];
//             results1.push(removeTag(tag));
//           }
//           return results1;
//       }
//     })
//   });


  function getTags(path) {
    return path.split('/').filter(function(tag) {
      return tag !== '';
    });
  };

  function relative(fullPath) {
    return Path.relative(config.sharedFilesPath, fullPath);
  };

  function addTag(tag) {
    try {
      return Tags.insert({
        _id: tag
      });
    } catch (undefined) {}
  };

  function removeTag(tag) {
    if (!Files.findOne({
      tags: tag
    })) {
      return Tags.remove({
        _id: tag
      });
    }
  };

});
