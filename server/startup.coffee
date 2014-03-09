Meteor.startup ->
  Files.remove {}
  Tags.remove {}

  allTags = []
  walker = Meteor.require('walk').walk(sharedFilesPath)

  walker.on 'names', Meteor.bindEnvironment (fullPath, files)->
    localPath = fullToLocal fullPath
    tags = getTags localPath
    allTags = _.union allTags, tags
    files = files.filter (file)-> FS.statSync(fullPath + '/' + file).isFile()

    for file in files
      console.log localPath + '/' + file
      Files.insert name: file, tags: tags, path: localPath + '/' + file

  walker.on 'end', Meteor.bindEnvironment ->
    Tags.insert _id: tag for tag in allTags

  Meteor.require('watchr').watch
    path: sharedFilesPath
    listener: Meteor.bindEnvironment (changeType, fullPath)->
      localPath = fullToLocal fullPath
      console.log 'Change type is', changeType
      switch changeType
        when 'create'
          name = Path.basename localPath
          tags = getTags Path.dirname localPath
          Files.insert name: name, tags: tags, path: localPath
        when 'delete'
          Files.remove path: localPath

  getTags = (localPath) -> localPath.split('/').splice(2)
  fullToLocal = (fullPath) -> fullPath.replace sharedFilesPath, ''
