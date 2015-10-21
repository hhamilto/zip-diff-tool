_ = require('lodash')

areListingsEquivalent = function(listing1,listing2){
	if(!(listing1 instanceof Array && listing2 instanceof Array )) return false
	if(listing1.length != listing2.length) return false
	var customizer = function(value,other){
		if(value instanceof Array && other instanceof Array ){
			return areListingsEquivalent(value,other)
		}
	}
	var sortFileList = function(fileList){
		return _.sortBy(fileList, 'name')
	}
	return _.isMatch(sortFileList(listing1),sortFileList(listing2), customizer)
}

module.exports = areListingsEquivalent

module.exports.test = function(listing1,listing2){
	var result = areListingsEquivalent(listing1,listing2)
	if(!result){
		console.error("Listing1:")
		console.error(listing1)
		console.error("Listing2:")
		console.error(listing2)
		throw new Error('Listings were not equivalent')
	}
}