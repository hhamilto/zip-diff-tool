var assert = require('assert')
var path = require('path')

var _ = require('lodash')

var directoryDiff = require('../lib/directory-diff.js')

var areListingsEquivalent = require('./lib/are-listings-equivalent.js')

describe('directory-diff.js', function() {
	it('should return paths to new and updated files', function(done){
		var basePath = path.join(__dirname, 'resources','dir-diff','base')
		var updatedPath = path.join(__dirname, 'resources','dir-diff','updated')
		directoryDiff(basePath,updatedPath).done(function(listing){
			var expectedListing = [{
				name:'b'
			},{
				name:'1',
				children:[{
					name:'d'
				}]
			},{
				name:'2',
				children:[{
					name:'e'
				}]
			}]
			assert(areListingsEquivalent(expectedListing,listing))
			done()
		})
	})

	it('shouldn\'t produce diff archives with empty folders', function (done) {
		this.timeout(30*1000)
		var directory = 'empty-dir'
		var basePath = path.join(__dirname,'resources',directory,'base')
		var updatedPath = path.join(__dirname,'resources',directory,'updated')
		directoryDiff(basePath,updatedPath).done(function(listing){
			var expectedListing = [{
				name: 'e'
			},{
				name: 'f'
			}]
			areListingsEquivalent.test(expectedListing,listing)
			done()
		})
	})

})