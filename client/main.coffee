Meteor.subscribe 'files'

Router.route '/'

Template.files.helpers
  files: -> Files.find()

Template.files.events =
  'click .btn': -> $.fileDownload "/dl?name=#{@path}&id=#{Meteor.user()._id}"

Template.uploadFile.helpers
  fileUploadAuth: ->
    userId: if Meteor.user() then Meteor.user()._id else 42
