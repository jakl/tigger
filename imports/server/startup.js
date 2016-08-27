import { Meteor } from 'meteor/meteor';
import walk from 'simple-walk';
//import { watch } from 'watchr';
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


//   watch({
//     path: util.sharedFilesPath,
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
    return Path.relative(util.sharedFilesPath, fullPath);
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
