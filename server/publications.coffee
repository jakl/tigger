Meteor.publish 'files', -> Files.find() if userAllowed(this.userId)
