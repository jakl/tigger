Meteor.startup ->
  Files.remove {}
  Tags.remove {}

  allTags = []
  walker = Meteor.require('walk').walk(sharedFilesPath)

  walker.on 'names', Meteor.bindEnvironment (root, files)->
    localRoot = root.replace sharedFilesPath, ''
    tags = localRoot.split('/').splice(1)
    allTags = _.union(allTags, tags)
    files = files.filter (f)-> FS.statSync(Path.join root, f).isFile()

    for file in files
      filePath = localRoot + '/' + Path.normalize(file)
      Files.insert name: file, tags: tags, path: filePath

  walker.on 'end', Meteor.bindEnvironment ->
    Tags.insert _id: tag for tag in allTags
