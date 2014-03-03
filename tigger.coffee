Tags = new Meteor.Collection 'tags'
Files = new Meteor.Collection 'files'

if Meteor.isClient
  Meteor.subscribe 'files'
  Template.files.files = -> Files.find()

  Template.upload.events =
    'change .fileUpload input': (e)->
      file = e.currentTarget.files[0]
      reader = new FileReader()
      reader.onload = (fileLoadEvent)->
        Meteor.call 'file-upload', file, reader.result
      reader.readAsBinaryString file

if Meteor.isServer
  path = Meteor.require 'path'
  fs = Meteor.require 'fs'
  sharedFilesPath = [process.env.PWD, 'public', 'files'].join path.sep

  userAllowed = (id)->
    Meteor.users.findOne(id)?.services.twitter.screenName in whitelist

  Files.remove {}
  Tags.remove {}

  Meteor.publish 'files', -> Files.find() if userAllowed(this.userId)

  Meteor.startup ->
    allTags = []
    walker = Meteor.require('walk').walk(sharedFilesPath)

    walker.on 'names', Meteor.bindEnvironment (root, files)->
      localRoot = root.replace sharedFilesPath, ''
      tags = localRoot.split(path.sep).splice(1)
      allTags = _.union(allTags, tags)
      files = files.filter (f)-> fs.statSync(path.join root, f).isFile()

      for file in files
        filePath = '/files' + localRoot + path.sep + path.normalize(file)
        Files.insert name: file, tags: tags, path: filePath

    walker.on 'end', Meteor.bindEnvironment ->
      Tags.insert _id: tag for tag in allTags

  Meteor.methods
    'file-upload': (fileInfo, fileData)->
      if userAllowed(this.userId)
        fs.writeFile sharedFilesPath + path.sep + fileInfo.name, fileData

  whitelist = [
    'jakl'
    'jagerhex'
  ]
