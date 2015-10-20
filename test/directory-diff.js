var assert = require('assert')
var path = require('path')

var _ = require('lodash')

var directoryDiff = require('../lib/directory-diff.js')

var areListingsEquivalent = require('./lib/are-listings-equivalent.js')

describe('directory-diff.js', function() {
	it('should return paths to new and updated files', function(done){
		basePath = path.join(__dirname, 'resources','dir-diff','base')
		updatedPath = path.join(__dirname, 'resources','dir-diff','updated')
		directoryDiff(basePath,updatedPath).done(function(listing){
			expectedListing = [{
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
			//console.log(require('util').inspect(listing,{depth:100}))
			assert(areListingsEquivalent(expectedListing,listing))
			done()
		})
	})
})