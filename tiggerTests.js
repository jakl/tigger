#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const tiggerUtils = require('./tiggerUtils.js')
const root = tiggerUtils.root;
const tiggerVault = tiggerUtils.tiggerVault;

// TESTS

function clearRoot(dir = root) {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach((file) => {
            var curPath = dir + path.sep + file
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                clearRoot(curPath)
            } else { // delete file
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(dir)
    }
}

function setupTestDir() {
    clearRoot()
    fs.mkdirSync(root)

    fs.mkdirSync(path.join(root, 'a'))
    fs.mkdirSync(path.join(root, 'b'))
    fs.mkdirSync(path.join(root, 'c'))
    fs.mkdirSync(path.join(root, 'a', 'b'))
    fs.mkdirSync(path.join(root, 'b', 'a'))
    fs.mkdirSync(path.join(root, 'a', 'c'))
    fs.closeSync(fs.openSync(path.join(root, 'a', 'a.test'), 'w'))
    fs.closeSync(fs.openSync(path.join(root, 'b', 'b.test'), 'w'))
    fs.closeSync(fs.openSync(path.join(root, 'c', 'c.test'), 'w'))
    fs.closeSync(fs.openSync(path.join(root, 'a', 'b', 'ab.test'), 'w'))
    fs.closeSync(fs.openSync(path.join(root, 'b', 'a', 'ba.test'), 'w'))
    fs.closeSync(fs.openSync(path.join(root, 'a', 'c', 'ac1.test'), 'w'))
    fs.closeSync(fs.openSync(path.join(root, 'a', 'c', 'ac2.test'), 'w'))
}

function testSetTiggers() {
    setupTestDir()
    tiggerUtils.setTiggers()

    assert.ok(tiggerVault.length == 7)
    assert.deepEqual(tiggerVault, [
        {tags: ['a'], name: 'a.test'},
        {tags: ['a', 'b'], name: 'ab.test'},
        {tags: ['a', 'c'], name: 'ac1.test'},
        {tags: ['a', 'c'], name: 'ac2.test'},
        {tags: ['b', 'a'], name: 'ba.test'},
        {tags: ['b'], name: 'b.test'},
        {tags: ['c'], name: 'c.test'},
    ])

    console.log('testSetTiggers success!')
}

function testAddTag() {
    setupTestDir()
    tiggerUtils.setTiggers()
    assert.ok(tiggerVault.length == 7)

    tiggerUtils.addTag(tiggerVault[0], 'b')
    tiggerUtils.addTag(tiggerVault[1], 'c')
    tiggerUtils.addTag(tiggerVault[6], 'a')

    // Check tiggers
    assert.deepEqual(tiggerVault[0], {tags: ['a', 'b'], name: 'a.test'})
    assert.deepEqual(tiggerVault[1], {tags: ['a', 'b', 'c'], name: 'ab.test'})
    assert.deepEqual(tiggerVault[6], {tags: ['a', 'c'], name: 'c.test'})

    // Check filesystem
    assert.ok(fs.existsSync(path.join(root, 'a', 'b', 'a.test')))
    assert.ok(fs.existsSync(path.join(root, 'a', 'b', 'c', 'ab.test')))
    assert.ok(fs.existsSync(path.join(root, 'a', 'c', 'c.test')))
    
    console.log('testAddTag success!')
}

function testRemoveTag() {
    setupTestDir()
    tiggerUtils.setTiggers()
    assert.ok(tiggerVault.length == 7)

    tiggerUtils.removeTag(tiggerVault[0], 'a')
    tiggerUtils.removeTag(tiggerVault[2], 'c')
    tiggerUtils.removeTag(tiggerVault[4], 'a')

    // Check tiggers
    assert.deepEqual(tiggerVault[0], {tags: [], name: 'a.test'})
    assert.deepEqual(tiggerVault[2], {tags: ['a'], name: 'ac1.test'})
    assert.deepEqual(tiggerVault[4], {tags: ['b'], name: 'ba.test'},)

    // Check filesystem
    assert.ok(fs.existsSync(path.join(root, 'a.test')))
    assert.ok(fs.existsSync(path.join(root, 'a', 'ac1.test')))
    assert.ok(fs.existsSync(path.join(root, 'b', 'ba.test')))
    assert.ok(!fs.existsSync(path.join(root, 'b', 'a'))) // no more files tagged under this dir, delete empty dir

    console.log('testRemoveTag success!')
}

function testFindDups() {
    // TODO: Fix this function tiggerUtils.findDups()
}

function testRenameTigger() {
    setupTestDir()
    tiggerUtils.setTiggers()
    assert.ok(tiggerVault.length == 7)

    tiggerUtils.renameTigger(tiggerVault[0], 'a1.test')

    // Check tiggers
    assert.deepEqual(tiggerVault[0], {tags: ['a'], name: 'a1.test'})

    // Check filesystem
    assert.ok(fs.existsSync(path.join(root, 'a', 'a1.test')))

    console.log('testRenameTigger success!')
}

function testDeleteTigger() {
    setupTestDir()
    tiggerUtils.setTiggers()
    assert.ok(tiggerVault.length == 7)

    const filename = path.join(root, tiggerVault[0].tags.join(path.sep), tiggerVault[0].name)
    tiggerUtils.deleteTigger(tiggerVault[0])

    // Check tiggers
    assert.deepEqual(tiggerVault[0], {tags: ['a', 'b'], name: 'ab.test'})

    // Check filesystem
    assert.ok(!fs.existsSync(filename))

    console.log('testDeleteTigger success!')
}

if (!module.parent) { // This is run directly from the command line, not required by another code file
    testSetTiggers()
    testAddTag()
    testRemoveTag()
    testRenameTigger()
    testDeleteTigger()
}