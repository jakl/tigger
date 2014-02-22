Tags = new Meteor.Collection 'tags'
Files = new Meteor.Collection 'files'

if Meteor.isClient
  Template.files.files = -> Files.find()
  Template.tags.tags = -> Tags.find()

if Meteor.isServer
  Files.remove {}
  Tags.remove {}

  Meteor.startup ->
    path = Meteor.require 'path'
    fs = Meteor.require 'fs'
    sharedFilesPath = process.env.PWD + path.sep + 'files'
    allTags = []
    walker = Meteor.require('walk').walk(sharedFilesPath)
    walker.on 'names', Meteor.bindEnvironment (root, files)->
      tags = root.replace(sharedFilesPath, '').split(path.sep).splice(1)
      allTags = _.union(allTags, tags)
      files = files.filter (f)-> fs.statSync(path.join root, f).isFile()
      Files.insert name: file, tags: tags for file in files
    walker.on 'end', Meteor.bindEnvironment ->
      Tags.insert _id: tag for tag in allTags
