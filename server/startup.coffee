Meteor.startup ->
  Files.remove {}
  Tags.remove {}

  allTags = []
  walker = Meteor.require('walk').walk(sharedFilesPath)

  walker.on 'names', Meteor.bindEnvironment (fullPath, files)->
    localPath = fullPath.replace sharedFilesPath, ''
    tags = getTags localPath
    allTags = _.union allTags, tags
    files = files.filter (file)-> FS.statSync(fullPath + '/' + file).isFile()

    for file in files
      console.log localPath
      Files.insert name: file, tags: tags, path: localPath + '/' + file

  walker.on 'end', Meteor.bindEnvironment ->
    Tags.insert _id: tag for tag in allTags

  Meteor.require('watchr').watch
    path: sharedFilesPath
    listener: (changeType, filePath)->
      console.log 'Changed with ', changeType, ' : ', filePath

  getTags = (localPath) -> localPath.split('/').splice 1
