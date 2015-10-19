var assert = require('assert')
var path = require('path')

var _ = require('lodash')
var tmp = require('tmp')

var listDirectory = require('../lib/list-directory.js')

var createFolderStructure = require('../lib/create-folder-structure-from-listing.js')

var areListingsEquivalent = require('./lib/are-listings-equivalent.js')




describe('create-folder-structure-from-listing.js', function() {
	it('should create all the folders described in the listing', function(done){
		tmp.dir({
			unsafeCleanup: true
		},function(err, tmpDirPath, cleanupCallback) {
			var listing = [{
				name:'b'
			},{
				name:'1',
				children:[{
					name:'d'
				},{
					name:'3',
					children:[{
						name:'c'
					}]
				}]
			},{
				name:'2',
				children:[{
					name:'e'
				}]
			}]
			createFolderStructure(tmpDirPath, listing).done(function(){
				listDirectory(tmpDirPath).done(function(createdListing){
					var expectedListing = [{
						name: '1',
						children:[{
							name:'3'
						}]
					},{
						name:'2',
						children:[]
					}]
					assert(areListingsEquivalent(createdListing, expectedListing))
					cleanupCallback()
					done()
				})
			})
		})
	})
})