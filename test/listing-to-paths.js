var assert = require('assert')
var path = require('path')

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
		path.join('1','b'),
		path.join('1','3','d'),
		path.join('1','3','e'),
		'c']
		assert(_.isEqual(expectedPaths,paths))
	})
})