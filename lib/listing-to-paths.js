var path = require('path')

var _ = require('lodash')

listingToPaths = function(listing){
	return _.flatten(_.map(listing, function(fileObj){
		if(fileObj.children)
			return _.map(listingToPaths(fileObj.children), _.partial(_.ary(path.join,2),fileObj.name))
		else 
			return fileObj.name
	}))
}

module.exports = listingToPaths