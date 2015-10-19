_ = require('lodash')
module.exports =function(listing1,listing2){
	var sortFileList = function(fileList){
		return _.sortBy(fileList, 'name')
	}
	var customizer = function(value,other){
		if(value instanceof Array && other instanceof Array ){
			return !_.some(_.zip(sortFileList(value),sortFileList(other)), function(pair){
				return ! _.isMatch(pair[0],pair[1], customizer)
			})
		}
	}
	return _.isMatch(sortFileList(listing1),sortFileList(listing2), customizer)
}