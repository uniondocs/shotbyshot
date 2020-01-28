'use strict';

function Annotation() {  
  function annotation(data) {
    
    if (!data) {
      return;
    }
        
    /*if(data.categories) {
    	this.slug = data.categories[0].slug;
    }*/
    this.slug = data.slug;
    
    // Store the title & content 
    this.title = data.title.rendered;
    this.content = data.content.rendered || '';
    
    var indexes = data.slug.split("-");
    if(indexes.length > 1) {
        this.volume = indexes[0];
        this.index = indexes[1];
    }
                                    
    // Get the Authors & Description
	if(data.custom_fields.authors) {
		this.author = {
	      name: data.custom_fields.authors,
	      description: data.custom_fields.description,
	      image: '/wp/wp-content/uploads/authors/' + data.author.nickname + '.jpg'
	    };
	} else {
		this.author = {
	      name: data.author && data.author.name,
	      description: data.author.description,
	      image: '/wp/wp-content/uploads/authors/' + data.author.nickname + '.jpg'
	    };
	}
		
	if(data.custom_fields.pdf_download) {
		this.pdf = data.custom_fields.pdf_download;
	}
		
    // Parse custom fields (street view, timecodes, and highlight).
    function getCustomField(key) {
      var value = data.custom_fields && data.custom_fields[key] && data.custom_fields[key][0];
      return value || '';
    }
    
    var streetView = data.custom_fields['mm_annotation_streetview'];
    var start = data.custom_fields['mm_annotation_start_timecode'];
    var end = data.custom_fields['mm_annotation_end_timecode'];
    var x = data.custom_fields['mm_annotation_x'];
    var y = data.custom_fields['mm_annotation_y'];

    if (streetView) {
      this.streetView = streetView;
    }

    if (start || end) {
      this.timecodes = {
        start: start && parseFloat(start) || 0,
        end: end && parseFloat(end) || 0
      };
    }

    if (x || y) {
      this.highlight = {
        x: x && parseFloat(x) || 0,
        y: y && parseFloat(y) || 0
      };
    }

    // Parse tags.
    var tags = {};
    if (data.tags && data.tags.length) {
      // Make a map of tags for fast lookup.
      angular.forEach(data.tags, function(tag) {
        tags[tag.title] = 1;
      });
    }
    this.tags = tags;

    // TODO(dbow): Maybe handle attachments?
  }

  return annotation;
}

angular
  .module('shotbyshot')
  .factory('Annotation', Annotation);
