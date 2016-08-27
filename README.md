What is Tigger?
=============

Tigger is a file manager that runs as a webserver with optionally many users. It's good for sharing a media drive with friends. It's also good for organizing files because it flattens the normal hierarchical directory structure into tags; given `/books/russia/lenin.pdf` the tags named books & russia are applied to the file lenin.pdf. It even keeps the directories & tags in sync if either changes.  Try it out!


Purpose
=======

Stash your private files in an encrypted, strictly authenticated web app that you yourself host. This avoids using 3rd party services that could be shut down or snooped by the NSA.

Allow select friends to use your webapp to help you organize your shared collection of private files. Your friends can also upload their own files to the collection.

Organization is done by tagging. A file called hyde_park.png might be tagged with London or Photo for easier searching and filtering.


Overview
========

Tigger has a magic directory that it shares. Either the environment variable SHARED_PATH or ./public/.#files

This directory should probably be your largest harddrive or RAID array to maximize the number of files you can store.

This directory could also be your [Bittorrent Sync](http://www.bittorrent.com/sync) directory, so you can more efficiently backup your files, p2p, encrypted & authenticated, with your select friends. Your friends can then run their own Tigger instances to distribute the load on the web UI, but have the same files continuously synced among all Tigger instances. All without the NSA interfering.


Develop
=======

Install Node from [nodejs.org](http://nodejs.org). In ubuntu you can instead run `apt-add-repository ppa:chris-lea/node.js ; apt-get update ; apt-get install nodejs`

Install meteor with `curl install.meteor.com | sh`

From within the project directory run:

`meteor npm install` to grab dependencies

`meteor` to start the webserver and mongo db

[Open localhost:3000 in a browser](http://localhost:3000)

[Setup your new twitter app.](https://dev.twitter.com/apps)


Host
====

Inside ./private/ssl_proxy/, run `npm install`

Also run `sudo ./main.js` - sudo is because it connects to a restricted access port, 443

Kill the development `meteor` and instead, run `ROOT_URL=https://YOUR_IP_OR_HOST_NAME meteor`

Open port 443 in your firewall/router and navigate to your ip or hostname as an https url.
