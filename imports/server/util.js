import Path from 'path';
import FS from 'fs';
import process from 'process';
import { Meteor } from 'meteor/meteor';

export const sharedFilesPath = Path.resolve(
  process.env.SHARED_PATH || [process.env.PWD, 'public', '.#files'].join('/')
);

export const whitelist = JSON.parse(Assets.getText('whitelist.json'));
export const userAllowed = id => whitelist.indexOf(Meteor.users.findOne(id).services.twitter.screenName) >= 0
