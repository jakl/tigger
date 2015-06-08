@Path = Meteor.npmRequire 'path'
@FS = Meteor.npmRequire 'fs'

@sharedFilesPath = @Path.resolve(
  process.env.SHARED_PATH or
  [process.env.PWD, 'public', '.#files'].join '/'
)

@whitelist = JSON.parse Assets.getText 'whitelist.json'
@userAllowed = (id)->
  Meteor.users.findOne(id)?.services.twitter.screenName in whitelist
