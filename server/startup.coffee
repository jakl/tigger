Meteor.startup ->
  Files.remove {}
  Tags.remove {}

  UploadServer.init
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/public/.#files/',
    checkCreateDirectories: true
    validateRequest: (req, res)-> debugger
    validateFile: (req, res)-> debugger


  Meteor.npmRequire('walk').walk(sharedFilesPath)
    .on 'names', Meteor.bindEnvironment (fullPath, files)->
      relativePath = relative fullPath
      tags = getTags relativePath
      files
        .filter (file)-> FS.statSync(fullPath + '/' + file).isFile()
        .forEach (file)->
          Files.insert name: file, tags: tags, path: relativePath + '/' + file
      addTag tag for tag in tags

  Meteor.npmRequire('watchr').watch
    path: sharedFilesPath
    listener: Meteor.bindEnvironment (changeType, fullPath)->
      relativePath = relative fullPath
      tags = getTags Path.dirname relativePath
      switch changeType
        when 'create'
          if FS.statSync(fullPath).isFile()
            name = Path.basename relativePath
            Files.insert name: name, tags: tags, path: relativePath
            addTag tag for tag in tags
        when 'delete'
          Files.remove path: relativePath
          removeTag tag for tag in tags

  getTags = (path) -> path.split('/').filter (tag)-> tag isnt ''
  relative = (fullPath) -> Path.relative sharedFilesPath, fullPath
  addTag = (tag) -> try Tags.insert _id: tag
  removeTag = (tag)-> Tags.remove _id: tag unless Files.findOne(tags: tag)
