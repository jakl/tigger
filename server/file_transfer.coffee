Meteor.methods
  'file-upload': (fileInfo, fileData)->
    if userAllowed(this.userId)
      FS.writeFile sharedFilesPath + '/' + fileInfo.name, fileData

Meteor.Router.add '/dl', ->
  if userAllowed @request.query.id
    name = @request.query.name
    [
      200
      'Content-type': 'text/no-extension'
      'Content-Disposition': 'attachment; filename=' + Path.basename name
      'Set-Cookie': 'fileDownload=true; path=/'
      FS.readFileSync sharedFilesPath + name
    ]
