Meteor.startup(function() {
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
}
