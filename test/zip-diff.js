var assert = require('assert')
var childProcess = require('child_process')
var path = require('path')
var util = require('util')
var os = require('os')
var fs = require('fs')

var tmp = require('tmp')

var areListingsEquivalent = require('./lib/are-listings-equivalent.js')
var sevenZip = require('../lib/7zip.js')

var pathToIndex = path.join(__dirname,'..','index.js')

describe('ZipDiff', function() {
	it('shouldn\'t produce a diff archive when given duplicate archives', function (done) {
		var zip1Path = path.join(__dirname,'resources','duplicate-archives-empty-diff','1.zip')
		var zip2Path = path.join(__dirname,'resources','duplicate-archives-empty-diff','1.zip')
		childProcess.exec('node '+pathToIndex+' '+zip1Path+' '+zip2Path).on('close', function(code){
			if(code)
				throw new Error('Zip diff tool exited with code: '+code)
			fs.stat('zip.zip', function(err, stats){
				assert(err.code == 'ENOENT')
				done()
			})
		})
	})

	it('should produce a diff with an extra file', function (done) {
		var zip1Path = path.join(__dirname,'resources','one-extra-file','1.zip')
		var zip2Path = path.join(__dirname,'resources','one-extra-file','2.zip')
		childProcess.exec('node '+pathToIndex+' '+zip1Path+' '+zip2Path).on('close', function(code){
			if(code)
				throw new Error('Zip diff tool exited with code: '+code)
			expectedListingOfDiff = [{
				name: 'b'
			}]
			sevenZip.list('diff.zip').done(function(files){
				areListingsEquivalent.test(files,expectedListingOfDiff)
				done()
			})
		})
	})

	it('should produce a diff with updated files', function (done) {
		var zip1Path = path.join(__dirname,'resources','updated-file-contents','1.zip')
		var zip2Path = path.join(__dirname,'resources','updated-file-contents','2.zip')
		childProcess.exec('node '+pathToIndex+' '+zip1Path+' '+zip2Path).on('close', function(code){
			if(code)
				throw new Error('Zip diff tool exited with code: '+code)
			expectedListingOfDiff = [{
				name: 'a'
			}]
			sevenZip.list('diff.zip').done(function(files){
				areListingsEquivalent.test(files,expectedListingOfDiff)
				done()
			})
		})
	})

	it('should produce a diff with extra files', function (done) {
		var zip1Path = path.join(__dirname,'resources','extra-files-appear-in-diff','1.zip')
		var zip2Path = path.join(__dirname,'resources','extra-files-appear-in-diff','2.zip')
		childProcess.exec('node '+pathToIndex+' '+zip1Path+' '+zip2Path).on('close', function(code){
			if(code)
				throw new Error('Zip diff tool exited with code: '+code)
			expectedListingOfDiff = [{
				name: '2',
				children: [{
					name:'foo',
				},{
					name:'bar'
				}]
			}]
			sevenZip.list('diff.zip').done(function(files){
				areListingsEquivalent.test(files,expectedListingOfDiff)
				done()
			})
		})
	})

	it('should produce a diff with complicated file structure', function (done) {
		var zip1Path = path.join(__dirname,'resources','given-example','base.zip')
		var zip2Path = path.join(__dirname,'resources','given-example','updated.zip')
		childProcess.exec('node '+pathToIndex+' '+zip1Path+' '+zip2Path).on('close', function(code){
			if(code)
				throw new Error('Zip diff tool exited with code: '+code)
			expectedListingOfDiff = [{
				name: 'a.txt'
			},{
				name: 'dir1',
				children:[{
					name:'c.txt'
				}]
			}]
			sevenZip.list('diff.zip').done(function(files){
				areListingsEquivalent.test(files,expectedListingOfDiff)
				done()
			})
		})
	})

	it('should handle names with spaces in them', function (done) {
		var zip1Path = path.join(__dirname,'resources','spaces-in-file-names','base.zip')
		var zip2Path = path.join(__dirname,'resources','spaces-in-file-names','updated.zip')
		childProcess.exec('node '+pathToIndex+' '+zip1Path+' '+zip2Path, function(err, stdout, stderr){
			if(err){
				console.error('##### stdout:')
				console.error(stdout)
				console.error('##### stderr:')
				console.error(stderr)
				throw new Error('Zip diff tool made an error: '+err)
			}
			expectedListingOfDiff = [{
				name:'sample directory',
				children:[{
					name: 'b'
				},{
					name: 'c'
				}]
			},{
				name:'sample file2'
			}]
			sevenZip.list('diff.zip').done(function(files){
				areListingsEquivalent.test(files,expectedListingOfDiff)
				done()
			})
		})
	})

	it('should handle dll files', function (done) {
		var zip1Path = path.join(__dirname,'resources','dlls','base.zip')
		var zip2Path = path.join(__dirname,'resources','dlls','updated.zip')
		childProcess.exec('node '+pathToIndex+' '+zip1Path+' '+zip2Path, function(err, stdout, stderr){
			if(err){
				console.error('##### stdout:')
				console.error(stdout)
				console.error('##### stderr:')
				console.error(stderr)
				throw new Error('Zip diff tool made an error: '+err)
			}
			expectedListingOfDiff = [{
				name: 'kd1394.dll'
			}]
			sevenZip.list('diff.zip').done(function(files){
				areListingsEquivalent.test(files,expectedListingOfDiff)
				done()
			})
		})
	})

	it('should handle archives made of its own lib directory', function (done) {
		var zip1Path = path.join(__dirname,'resources','lib-dir','base.zip')
		var zip2Path = path.join(__dirname,'resources','lib-dir','updated.zip')
		childProcess.exec('node '+pathToIndex+' '+zip1Path+' '+zip2Path, function(err, stdout, stderr){
			if(err){
				console.error('##### stdout:')
				console.error(stdout)
				console.error('##### stderr:')
				console.error(stderr)
				throw new Error('Zip diff tool made an error: '+err)
			}
			expectedListingOfDiff = [{
				name: '7zip2.js'
			}]
			sevenZip.list('diff.zip').done(function(files){
				areListingsEquivalent.test(files,expectedListingOfDiff)
				done()
			})
		})
	})

	it('should ignore globs when told to', function (done) {
		var zip1Path = path.join(__dirname,'resources','glob-test','base.zip')
		var zip2Path = path.join(__dirname,'resources','glob-test','updated.zip')
		var command = 'node '+pathToIndex+' '+zip1Path+' '+zip2Path+' -i completely-ignored -i gets-updated -i dot-foo-files-ignored/*.foo'
		childProcess.exec(command, function(err, stdout, stderr){
			if(err){
				console.error('##### stdout:')
				console.error(stdout)
				console.error('##### stderr:')
				console.error(stderr)
				throw new Error('Zip diff tool made an error: '+err)
			}
			expectedListingOfDiff = [{
				name: 'b'
			},{
				name: 'dot-foo-files-ignored',
				children: [{
					name:'gets-updated'
				}]
			}]
			sevenZip.list('diff.zip').done(function(files){
				areListingsEquivalent.test(files,expectedListingOfDiff)
				done()
			})
		})
	})

	it('should ignore deleted files in the updated zip', function (done) {
		var zip1Path = path.join(__dirname,'resources','files-deleted','base.zip')
		var zip2Path = path.join(__dirname,'resources','files-deleted','updated.zip')
		var command = 'node '+pathToIndex+' '+zip1Path+' '+zip2Path
		childProcess.exec(command, function(err, stdout, stderr){
			if(err){
				console.error('##### stdout:')
				console.error(stdout)
				console.error('##### stderr:')
				console.error(stderr)
				throw new Error('Zip diff tool made an error: '+err)
			}
			expectedListingOfDiff = [{
				name: 'd'
			},{
				name: 'e',
			}]
			sevenZip.list('diff.zip').done(function(files){
				areListingsEquivalent.test(files,expectedListingOfDiff)
				done()
			})
		})
	})

	it('should handle archives with many files', function (done) {
		this.timeout(1000000)
		var zip1Path = path.join(__dirname,'resources','lotsa-files','base.zip')
		var zip2Path = path.join(__dirname,'resources','lotsa-files','updated.zip')
		var command = 'node '+pathToIndex+' '+zip1Path+' '+zip2Path
		console.log()
		childProcess.exec(command, function(err, stdout, stderr){
			if(err){
				console.error('##### stdout:')
				console.error(stdout)
				console.error('##### stderr:')
				console.error(stderr)
				throw new Error('Zip diff tool made an error: '+err)
			}
			expectedListingOfDiff = [{
				name: 'findme'
			}]
			sevenZip.list('diff.zip').done(function(files){
				areListingsEquivalent.test(files,expectedListingOfDiff)
				done()
			})
		})
	})

	before(function(done) {
		try{
			fs.unlink('diff.zip',_.ary(done,0))
		}catch(e){
			console.log(e)
			done()
		}
	})

	afterEach(function(done) {
		try{
			fs.unlink('diff.zip',_.ary(done,0))
		}catch(e){
			done()
		}
	})
})
