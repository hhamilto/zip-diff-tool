var assert = require('assert')
var childProcess = require('child_process')
var path = require('path')
var util = require('util')
var os = require('os')
var fs = require('fs')

var tmp = require('tmp')

var areListingsEquivalent = require('./lib/are-listings-equivalent.js')

var pathToIndex = path.join(__dirname,'..','index.js')

describe('test/lib/are-listings-equivalent.js', function() {

	it('should return true when listings are equivalent', function () {
		listing1 = []
		listing2 = []
		assert(areListingsEquivalent(listing1,listing2))
		listing1 = [{
			name:'a'
		},{
			name:'b'
		}]
		listing2 = [{
			name:'b'
		},{
			name:'a'
		}]
		assert(areListingsEquivalent(listing1,listing2))
		listing1 = [{
			name:'a',
			children:[{
				name:'c'
			},{
				name:'d',
				children:[{
					name:'e'
				}]
			}]
		},{
			name:'b'
		}]
		listing2 = [{
			name:'b'
		},{
			name:'a',
			children:[{
				name:'d',
				children:[{
					name:'e'
				}]
			},{
				name:'c'
			}]
		}]
		assert(areListingsEquivalent(listing1,listing2))
	})
	it('should return false when listings are not equivalent', function () {
		listing1 = []
		listing2 = undefined
		assert(!areListingsEquivalent(listing1,listing2))
		listing1 = 'we are all equal'
		listing2 = 'we are all equal'
		assert(!areListingsEquivalent(listing1,listing2))
		listing1 = [{
			name:'a'
		},{
			name:'c'
		}]
		listing2 = [{
			name:'b'
		},{
			name:'a'
		}]
		assert(!areListingsEquivalent(listing1,listing2))
		listing1 = [{
			name:'a',
			children:[{
				name:'c'
			},{
				name:'d',
				children:[{
					name:'d'
				}]
			}]
		},{
			name:'b'
		}]
		listing2 = [{
			name:'b'
		},{
			name:'a',
			children:[{
				name:'d',
				children:[{
					name:'e'
				}]
			},{
				name:'c'
			}]
		}]
		assert(!areListingsEquivalent(listing1,listing2))
		listing1 = [ { name: 'a.txt' }, { name: 'dir1', children: [ [Object] ] } ]
		listing2 = []
		assert(!areListingsEquivalent(listing1,listing2))
		

	})
})
