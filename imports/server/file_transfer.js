import { Meteor } from 'meteor/meteor';
import Path from 'path';
import FS from 'fs';
import util from '/imports/server/util.js';

Meteor.methods({
  'file-upload': function(fileInfo, fileData) {
    if (util.userAllowed(this.userId)) {
      return FS.writeFile(util.sharedFilesPath + '/' + fileInfo.name, fileData);
    }
  }
});

Picker.route('/dl', function(params, req, res, next) {
  var name, path;
  if (util.userAllowed(params.id)) {
    name = params.name;
    path = Path.resolve(util.sharedFilesPath, './' + name);
    if (path.indexOf(util.sharedFilesPath) === 0) {
      return [
        200, {
          'Content-type': 'text/no-extension',
          'Content-Disposition': 'attachment; filename=' + Path.basename(name),
          'Set-Cookie': 'fileDownload=true; path=/'
        }, FS.readFileSync(path)
      ];
    }
  }
}, {
  where: 'server'
});
