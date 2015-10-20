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
	/*it('should produce and empty diff archive when given duplicate archives', function (done) {
		var zip1Path = path.join(__dirname,'resources','duplicate-archives-empty-diff','1.zip')
		var zip2Path = path.join(__dirname,'resources','duplicate-archives-empty-diff','1.zip')
		childProcess.exec('node '+pathToIndex+' '+zip1Path+' '+zip2Path).on('close', function(code){
			if(code)
				throw new Error('Zip diff tool exited with code: '+code)
			expectedListingOfDiff = []
			sevenZip.list(path.join(__dirname,'diff.zip')).done(function(files){
				assert(areListingsEquivalent(files,expectedListingOfDiff))
				done()
			})
		})
	})*/

	it('should produce a diff with an extra file', function (done) {
		var zip1Path = path.join(__dirname,'resources','one-extra-file','1.zip')
		var zip2Path = path.join(__dirname,'resources','one-extra-file','2.zip')
		childProcess.exec('node '+pathToIndex+' '+zip1Path+' '+zip2Path).on('close', function(code){
			if(code)
				throw new Error('Zip diff tool exited with code: '+code)
			expectedListingOfDiff = []
			sevenZip.list('diff.zip').done(function(files){
				assert(areListingsEquivalent(files,expectedListingOfDiff))
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
				assert(areListingsEquivalent(files,expectedListingOfDiff))
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
				assert(areListingsEquivalent(files,expectedListingOfDiff))
				done()
			})
		})
	})

	it('should produce a diff with complicated file structure', function (done) {
		var zip1Path = path.join(__dirname,'resources','given-example','1.zip')
		var zip2Path = path.join(__dirname,'resources','given-example','2.zip')
		childProcess.exec('node '+pathToIndex+' '+zip1Path+' '+zip2Path).on('close', function(code){
			if(code)
				throw new Error('Zip diff tool exited with code: '+code)
			expectedListingOfDiff = []
			sevenZip.list('diff.zip').done(function(files){
				assert(areListingsEquivalent(files,expectedListingOfDiff))
				done()
			})
		})
	})

	afterEach(function(done) {
		fs.unlink('diff.zip',done);
	})
})
