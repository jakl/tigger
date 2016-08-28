import { Meteor } from 'meteor/meteor';
import FS from 'fs';
import Path from 'path';
import util from '/imports/server/util.js'
import db from '/imports/shared/db.js'

Meteor.startup(function() {
  FS.watch(util.sharedFilesPath, { recursive: true },
    Meteor.bindEnvironment(function(_, path) {
      const file = Path.basename(path);
      const tags = util.getTags(Path.dirname(path));

      try {
        if (FS.statSync(util.sharedFilesPath + '/' + path).isFile()) {
          if (!db.Files.find({path: path})) {
            db.Files.insert({
              name: file,
              tags: tags,
              path: path
            });
            tags.map(util.addTags);
          }
        }
      } catch (undefined) {
        if (db.Files.remove({path: path})) {
          // If we removed a file, remove any associated now-empty tags.
          tags.map(util.removeTag);
        } else { // no file was removed, must be a directory
          const match_deleted_dir = new RegExp(`^${path}`);
          db.Files.remove({path: {$regex: match_deleted_dir}});
        }
      }
    })
  );
});
