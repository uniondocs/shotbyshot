'use strict';

/**
 * Service for injecting metatags for social and SEO
 */
function MetaService(AnnotationsService) {
  var self = this;
  
  this.generateMeta = function(annotations) {
	  if(!annotations)
	  	return;
	  
	  	var meta=document.getElementsByTagName("meta");
		for (var i=0; i<meta.length; i++) {
		    if (meta[i].name.toLowerCase()=="description") {
		        meta[i].content = annotations.title;
		    }
		}
  }
}

angular
  .module('shotbyshot')
  .service('MetaService', MetaService);

