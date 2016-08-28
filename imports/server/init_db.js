import walk from 'simple-walk';
import db from '/imports/shared/db'
import path from 'path'
import util from '/imports/server/util'

Meteor.startup(function() {
  db.Files.remove({});
  db.Tags.remove({});

  walk.match(util.sharedFilesPath).map(fullPath => {
    const file = path.basename(fullPath);
    const relativePath = util.relative(fullPath);
    const tags = util.getTags(path.dirname(relativePath));

    tags.map(util.addTag);

    db.Files.insert({
      name: file,
      tags: tags,
      path: relativePath
    });
  });
});
