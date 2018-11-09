#!/usr/bin/env node

// VARS

const fs = require('fs')
const path = require('path')
const root = exports.root = __dirname + '\\test data'
const tiggerVault = exports.tiggerVault = [] // Tagged files, see `setTiggers()`
let timeOfLastFSEvent = 0 // 0 means the last event has been handled

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
            filelist.concat(path.relative(root, path.join(dir, file)))
    })

    return filelist
} 
exports.walkDir = walkDir

/**
 * Convert a list of files to a list of Tigger objects
 * @param {Array} filelist 
 * @return {Array} [{ tags: List of directory names in filesystem order, name: file name without path }, ...]
 */
function setTiggers(filelist = walkDir()) {
    tiggerVault.length = 0
    filelist.map((file) => {
        const parsedFile = path.parse(file)
        const tags = parsedFile.dir.split(path.sep)
        const name = parsedFile.base
        tiggerVault.push({tags, name})
    })
}
exports.setTiggers = setTiggers

/**
 * Looking at a list of all Tiggers, hash their tags irrespective of order.
 * Use this to look for files with the same tags but different paths.
 * This reveals redundant directories like /movies/anime vs /anime/movies
 * @param {Array} tiggers List of Tiggers
 * @return {Object} {'anime/movies': [Tigger1, Tigger2]}
 */
function hashBySortedTags(tiggers = tiggerVault) {
    return hashByTags(tiggers, true)
}
exports.hashBySortedTags = hashBySortedTags

function hashByTags(tiggers = tiggerVault, sorted = false) {
    const tagHash = {}

    for (let tigger of tiggers) {
        // Need to copy array with concat because sort modifies data in-place
        const tagStr = sorted ?
            tigger.tags.concat().sort().join(path.sep) :
            tigger.tags.join(path.sep)

        if (tagHash[tagStr]) {
            tagHash[tagStr].push(tigger)
        } else {
            tagHash[tagStr] = [tigger]
        }
    }

    return tagHash
}
exports.hashByTags = hashByTags

/**
 * Given a list of tiggers, use `hashByTags` to find and return redundant directory structures
 * @param {Array} tiggers 
 * @return {Array} [[Tigger1, Tigger1dup], [Tigger2], ...]
 */
function findDups(tiggers = tiggerVault) {
    const tagHash = hashBySortedTags(tiggers)
    const dupTiggers = []

    for (let tagStr in tagHash) {
        if (tagHash[tagStr].length > 1) {
            dupTiggers.push(tagHash[tagStr])
        }
    }

    return dupTiggers
}
exports.findDups = findDups

/**
 * Given a list of tiggers, print all redundant paths like anime/movies & movies/anime
 * This is a shitty useless function cause it'll consider the same directory a dup of itself if it contains more than 1 file
 * @param {Array} tiggers 
 */
function printDups(tiggers = tiggerVault) {
    const dups = findDups(tiggerVault)

    for (let dup of dups) {
        const paths = Object.keys(hashByTags(dup))

        console.log(`${paths.length} redundant paths:`)
        for (let path of paths) {
            console.log("  " + path)
        }
    }
}
exports.printDups = printDups

/**
 * Add a single tag to a single tigger, doing relevant FS changes.
 * If an existing directory exists to match the new tag, use it.
 * Otherwise create a new directory inside the existing path of the tigger.
 * @param {Object} tigger 
 * @param {String} tag 
 */
function addTag(tigger, tag) {
    const tiggersBySortedTags = hashBySortedTags(tiggerVault)
    const newSortedTags = tigger.tags.concat(tag).sort().join(path.sep)
    let newDir

    if (tiggersBySortedTags[newSortedTags]) {
        // If directories exist to represent the new tag, then use the existing path
        newDir = tiggersBySortedTags[newSortedTags][0].tags.join(path.sep)
    } else {
        // Else make the new directory for the new tag inside the previous path
        newDir = path.join(tigger.tags.join(path.sep), tag)
    }

    if (!fs.existsSync(path.join(root, newDir))) fs.mkdirSync(path.join(root, newDir), {recursive: true})
    fs.renameSync(path.join(root, tigger.tags.join(path.sep), tigger.name), path.join(root, newDir, tigger.name))
    tigger.tags = newDir.split(path.sep)
}
exports.addTag = addTag

/**
 * Remove a single tag from a single tigger.
 * Remove the tag's directory if it's now empty.
 * Move the tigger to a new matching directory if possible.
 * Otherwise create a new directory path to match the remaining tags.
 * @param {Object} tigger 
 * @param {String} tag 
 */
function removeTag(tigger, tag) {
    const indexOfTag = tigger.tags.indexOf(tag)
    if (indexOfTag == -1) return
    const tiggersBySortedTags = hashBySortedTags(tiggerVault)
    const oldPath = tigger.tags.concat().join(path.sep)
    tigger.tags.splice(indexOfTag, 1)
    const newSortedTags = tigger.tags.concat().sort().join(path.sep)
    let newDir

    if (tiggersBySortedTags[newSortedTags]) {
        // If directories exist to represent the new tag, then use the existing path
        newDir = tiggersBySortedTags[newSortedTags][0].tags.join(path.sep)
    } else {
        // Else make the new directory from the old path minus just that tag
        newDir = tigger.tags.join(path.sep)
    }

    if (!fs.existsSync(path.join(root, newDir))) fs.mkdirSync(path.join(root, newDir), {recursive: true})
    fs.renameSync(path.join(root, oldPath, tigger.name), path.join(root, newDir, tigger.name))

    // If it's the last file, remove the empty dir
    if (!fs.readdirSync(path.join(root, oldPath)).length) {
        fs.rmdirSync(path.join(root, oldPath), () => {})
    }
}
exports.removeTag = removeTag

/**
 * Change the name of a tigger to the provided name and update the filesystem
 * @param {*} tigger 
 * @param {String} name 
 */
function renameTigger(tigger, name) {
    const dir = path.join(root, tigger.tags.join(path.sep))
    fs.renameSync(path.join(dir, tigger.name), path.join(dir, name))
    tigger.name = name
}
exports.renameTigger = renameTigger

/**
 * Delete a tigger from the tiggerVault and rm the coresponding file from the filesystem
 * @param {*} tigger 
 */
function deleteTigger(tigger) {
    fs.unlinkSync(path.join(root, tigger.tags.join(path.sep), tigger.name))
    tiggerVault.splice(tiggerVault.indexOf(tigger), 1)
}
exports.deleteTigger = deleteTigger

/**
 * Initialize tiggerVault and update after any fs changes are observed
 */
function initAndWatch() {
    // Initialize tiggers
    setTiggers()

    // Record the time of the latest filesystem event
    fs.watch(root, {
        recursive: true
    }, (eventType, filename) => {
        timeOfLastFSEvent = Date.now()
    })

    // If there was a filesystem event but none for the last 3 seconds, then refresh tiggers
    setInterval(() => {
        if (timeOfLastFSEvent && Date.now() - timeOfLastFSEvent > 3000) {
            timeOfLastFSEvent = 0
            setTiggers()
            console.log('fs reload')
        }
    }, 3000)
}
exports.initAndWatch = initAndWatch

/**
 * Report some tiggerVault statistics to the console periodically
 */
function monitorToConsole() {
    setInterval(() => {
        console.log(`Currently tracking ${tiggerVault.length} tiggers.`)
    }, 10000)
}
exports.monitorToConsole = monitorToConsole

// EXECUTION

if (!module.parent) { // This is run directly from the command line, not required by another code file
    initAndWatch()
    monitorToConsole()
    //printDups() // Warn the user of possible conflicts, to manually resolve TODO: Fix this shit
}