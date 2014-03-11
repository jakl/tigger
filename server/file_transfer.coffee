Meteor.methods
  'file-upload': (fileInfo, fileData)->
    if userAllowed(this.userId)
      FS.writeFile sharedFilesPath + '/' + fileInfo.name, fileData

Meteor.Router.add '/dl', ->
  if userAllowed @request.query.id
    name = @request.query.name
    path = Path.resolve sharedFilesPath, './' + name
    if path.indexOf(sharedFilesPath) is 0
      [
        200
        'Content-type': 'text/no-extension'
        'Content-Disposition': 'attachment; filename=' + Path.basename name
        'Set-Cookie': 'fileDownload=true; path=/'
        FS.readFileSync path
      ]
