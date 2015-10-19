var assert = require('assert')
var path = require('path')
var fs = require('fs')

var _ = require('lodash')


var areListingsEquivalent = require('./lib/are-listings-equivalent.js')
var listDirectory = require('../lib/list-directory.js')


describe('list-directory.js', function(done) {
	it('should list the contents of a directory', function(done){
		listDirectory(path.join(__dirname,'resources','sample-files')).done(function(listing){
			var expectedListing = [{
				name:'a'
			},{
				name:'1',
				children:[{
					name:'b',
				}]
			}]
			assert(areListingsEquivalent(listing,expectedListing))
			done()
		})
	})
})