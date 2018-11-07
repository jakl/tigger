#!/usr/bin/env node

// VARS

const fs = require('fs');
const path = require('path');
const assert = require('assert');
let root = __dirname + '\\test data';
let timeOfLastFSEvent = 0; // 0 means the last event has been handled
let tiggerVault = []; // Tagged files, see `getTiggers()`

// FUNCTIONS

/**
 * Scan a directory recursively for files
 * @param {String} dir Directory to scan recursively for files
 * @param {Array} filelist Internally used recursive collector of files found so far
 * @return List of files, paths rooted at `dir`
 */
function walkDir(dir = root, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
        filelist = fs.statSync(path.join(dir, file)).isDirectory() ?
            walkDir(path.join(dir, file), filelist) :
            filelist.concat(path.relative(root, path.join(dir, file)));
    });

    return filelist;
}

/**
 * Convert a list of files to a list of Tigger objects
 * @param {Array} filelist 
 * @return {Array} [{ tags: List of directory names in filesystem order, name: file name without path }, ...]
 */
function getTiggers(filelist = walkDir()) {
    return filelist.map((file) => {
        const parsedFile = path.parse(file);
        const tags = parsedFile.dir.split(path.sep);
        const name = parsedFile.base;
        return {
            tags,
            name
        };
    })
}

/**
 * Looking at a list of all Tiggers, hash their tags irrespective of order.
 * Use this to look for files with the same tags but different paths.
 * This reveals redundant directories like /movies/anime vs /anime/movies
 * @param {Array} tiggers List of Tiggers
 * @return {Object} {'anime/movies': [Tigger1, Tigger2]}
 */
function hashBySortedTags(tiggers) {
    return hashByTags(tiggers, true);
}

function hashByTags(tiggers, sorted = false) {
    const tagHash = {};

    for (let tigger of tiggers) {
        // Need to copy array with concat because sort modifies data in-place
        const tagStr = sorted ?
            tigger.tags.concat().sort().join(path.sep) :
            tigger.tags.join(path.sep);

        if (tagHash[tagStr]) {
            tagHash[tagStr].push(tigger);
        } else {
            tagHash[tagStr] = [tigger];
        }
    }

    return tagHash;
}

/**
 * Given a list of tiggers, use `hashByTags` to find and return redundant directory structures
 * @param {Array} tiggers 
 * @return {Array} [[Tigger1, Tigger1dup], [Tigger2], ...]
 */
function findDups(tiggers) {
    const tagHash = hashBySortedTags(tiggers);
    const dupTiggers = [];

    for (let tagStr in tagHash) {
        if (tagHash[tagStr].length > 1) {
            dupTiggers.push(tagHash[tagStr]);
        }
    }

    return dupTiggers;
}

/**
 * Given a list of tiggers, print all redundant paths like anime/movies & movies/anime
 * @param {Array} tiggers 
 */
function printDups(tiggers) {
    const dups = findDups(tiggers);

    for (let dup of dups) {
        const paths = Object.keys(hashByTags(dup));

        console.log(`${paths.length} redundant paths:`)
        for (let path of paths) {
            console.log("  " + path);
        }
    }
}

/**
 * Add a single tag to a single tigger, doing relevant FS changes.
 * If an existing directory exists to match the new tag, use it.
 * Otherwise create a new directory inside the existing path of the tigger.
 * @param {Object} tigger 
 * @param {String} tag 
 */
function addTag(tigger, tag) {
    const tiggersBySortedTags = hashBySortedTags(tiggerVault);
    const newSortedTags = tigger.tags.concat(tag).sort().join(path.sep);
    let newDir;

    if (tiggersBySortedTags[newSortedTags]) {
        // If directories exist to represent the new tag, then use the existing path
        newDir = tiggersBySortedTags[newSortedTags][0].tags.join(path.sep);
    } else {
        // Else make the new directory for the new tag inside the previous path
        newDir = path.join(tigger.tags.join(path.sep), tag);
    }

    fs.mkdir(path.join(root, newDir), {
        recursive: true
    }, () => {});
    fs.rename(path.join(root, tigger.tags.join(path.sep), tigger.name), path.join(root, newDir, tigger.name), () => {});
    tigger.tags = newDir.split(path.sep);
}

/**
 * Remove a single tag from a single tigger.
 * Remove the tag's directory if it's now empty.
 * Move the tigger to a new matching directory if possible.
 * Otherwise create a new directory path to match the remaining tags.
 * @param {Object} tigger 
 * @param {String} tag 
 */
function removeTag(tigger, tag) {
    const indexOfTag = tigger.tags.indexOf(tag);
    if (indexOfTag == -1) return;
    const tiggersBySortedTags = hashBySortedTags(tiggerVault);
    const oldPath = tigger.tags.concat().join(path.sep);
    tigger.tags.splice(indexOfTag, 1);
    const newSortedTags = tigger.tags.concat().sort().join(path.sep);
    let newDir;

    if (tiggersBySortedTags[newSortedTags]) {
        // If directories exist to represent the new tag, then use the existing path
        newDir = tiggersBySortedTags[newSortedTags][0].tags.join(path.sep);
    } else {
        // Else make the new directory from the old path minus just that tag
        newDir = tigger.tags.join(path.sep);
    }

    fs.mkdir(path.join(root, newDir), {
        recursive: true
    }, () => {});
    fs.rename(path.join(root, oldPath, tigger.name), path.join(root, newDir, tigger.name), () => {
        if (!fs.readdirSync(path.join(root, oldPath)).length) {
            fs.rmdir(path.join(root, oldPath), () => {});
        }
    });
}

function initAndWatch() {
    // Initialize tiggers
    tiggerVault = getTiggers();

    // Record the time of the latest filesystem event
    fs.watch(root, {
        recursive: true
    }, (eventType, filename) => {
        timeOfLastFSEvent = Date.now();
    });

    // If there was a filesystem event but none for the last 3 seconds, then refresh tiggers
    setInterval(() => {
        if (timeOfLastFSEvent && Date.now() - timeOfLastFSEvent > 3000) {
            timeOfLastFSEvent = 0;
            tiggerVault = getTiggers();
            console.log('fs reload')
        }
    }, 3000);

    // Actively monitor tiggers and output metrics to console
    // setInterval(() => {
    //     console.log(`Currently tracking ${tiggerVault.length} tiggers.`)
    // }, 10000);
}

// TESTS

function testGetTiggers() {
    fs.mkdirSync(root + '/a')
    fs.mkdirSync(root + '/b')
    fs.mkdirSync(root + '/c')
    fs.mkdirSync(root + '/a/b')
    fs.mkdirSync(root + '/a/c')
    fs.closeSync(fs.openSync(root + '/a/a.test', 'w'))
    fs.closeSync(fs.openSync(root + '/b/b.test', 'w'))
    fs.closeSync(fs.openSync(root + '/c/c.test', 'w'))
    fs.closeSync(fs.openSync(root + '/a/b/ab.test', 'w'))
    fs.closeSync(fs.openSync(root + '/a/c/ac1.test', 'w'))
    fs.closeSync(fs.openSync(root + '/a/c/ac2.test', 'w'))

    tiggerVault = getTiggers()

    assert.ok(tiggerVault.length == 6)
    assert.deepEqual(tiggerVault, [
        {tags: ['a'], name: 'a.test'},
        {tags: ['a', 'b'], name: 'ab.test'},
        {tags: ['a', 'c'], name: 'ac1.test'},
        {tags: ['a', 'c'], name: 'ac2.test'},
        {tags: ['b'], name: 'b.test'},
        {tags: ['c'], name: 'c.test'},
    ])
}

function clearRoot(path = root) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index){
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                clearRoot(curPath);
            } else { // delete file
            fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

// EXECUTION

if (!module.parent) { // This is run directly from the command line, not required by another code file
    // initAndWatch();
    // printDups(tiggerVault); // Warn the user of possible conflicts, to manually resolve

    // TESTS
    clearRoot();
    fs.mkdirSync(root);
    testGetTiggers();

    // let tiggerToAddTag = tiggerVault[Math.floor(Math.random() * tiggerVault.length)];
    // let newTag = `cookies${Math.floor(Math.random() * 1000)}`;
    // console.log(`Adding new tag ${newTag} to existing tigger ${path.join(tiggerToAddTag.tags.join(path.sep), tiggerToAddTag.name)}`)
    // addTag(tiggerToAddTag, newTag);
    // console.log(`Tigger with new tag is ${path.join(tiggerToAddTag.tags.join(path.sep), tiggerToAddTag.name)}`)

    // tiggerToAddTag = tiggerVault[Math.floor(Math.random() * tiggerVault.length)];
    // newTag = `cookies${Math.floor(Math.random() * 1000)}`;
    // console.log(`Adding new tag ${newTag} to existing tigger ${path.join(tiggerToAddTag.tags.join(path.sep), tiggerToAddTag.name)}`)
    // addTag(tiggerToAddTag, newTag);
    // console.log(`Tigger with new tag is ${path.join(tiggerToAddTag.tags.join(path.sep), tiggerToAddTag.name)}`)
    // console.log(`Removing ${newTag}`)
    // removeTag(tiggerToAddTag, newTag)
    // console.log(`Tigger with removed tag is ${path.join(tiggerToAddTag.tags.join(path.sep), tiggerToAddTag.name)}`)
}