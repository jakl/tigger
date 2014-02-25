Tags = new Meteor.Collection 'tags'
Files = new Meteor.Collection 'files'

if Meteor.isClient
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

  Files.remove {}
  Tags.remove {}

  Meteor.startup ->
    allTags = []
    walker = Meteor.require('walk').walk(sharedFilesPath)

    walker.on 'names', Meteor.bindEnvironment (root, files)->
      localRoot = root.replace sharedFilesPath, ''
      tags = localRoot.split(path.sep).splice(1)
      allTags = _.union(allTags, tags)
      files = files.filter (f)-> fs.statSync(path.join root, f).isFile()

      for file in files
        filePath = 'files' + localRoot + path.sep + path.normalize(file)
        Files.insert name: file, tags: tags, path: filePath

    walker.on 'end', Meteor.bindEnvironment ->
      Tags.insert _id: tag for tag in allTags

  Meteor.methods
    'file-upload': (fileInfo, fileData)->
      fs.writeFile sharedFilesPath + path.sep + fileInfo.name, fileData
