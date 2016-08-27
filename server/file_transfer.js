import { Meteor } from 'meteor/meteor';
import Path from 'path';
import FS from 'fs';

Meteor.methods({
  'file-upload': function(fileInfo, fileData) {
    if (userAllowed(this.userId)) {
      return FS.writeFile(sharedFilesPath + '/' + fileInfo.name, fileData);
    }
  }
});

Picker.route('/dl', function(params, req, res, next) {
  var name, path;
  if (userAllowed(params.id)) {
    name = params.name;
    path = Path.resolve(sharedFilesPath, './' + name);
    if (path.indexOf(sharedFilesPath) === 0) {
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
