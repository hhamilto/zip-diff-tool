var assert = require('assert')

var _ = require('lodash')

var listingToPaths = require('../lib/listing-to-paths.js')


describe('listing-to-paths.js', function() {
	it('should return paths of a listing', function(){
		var paths = listingToPaths([{
			name:'a'
		},{
			name:'1',
			children:[{
				name:'b',
			},{
				name:'2',
				children:[]
			},{
				name:'3',
				children: [{
					name: 'd'
				},{
					name: 'e'
				}]
			}]
		},{
			name:'c'
		}])
		var expectedPaths = [
		'a',
		'1/b',
		'1/3/d',
		'1/3/e',
		'c']
		assert(_.isEqual(expectedPaths,paths))
	})
})