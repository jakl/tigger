Meteor.subscribe 'files'

Template.upload.events =
  'change .fileUpload input': (e)->
    file = e.currentTarget.files[0]
    reader = new FileReader()
    reader.onload = (fileLoadEvent)->
      Meteor.call 'file-upload', file, reader.result
    reader.readAsBinaryString file

Template.files.files = -> Files.find()
Template.files.events =
  'click .btn': -> $.fileDownload "/dl?name=#{@path}&id=#{Meteor.user()._id}"
