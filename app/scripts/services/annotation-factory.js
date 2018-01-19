'use strict';

function Annotation() {
  function annotation(data) {
    if (!data) {
      return;
    }
        
	this.slug = data.categories[0].slug;
	    
    // Store the title & content
    this.title = data.title;
    this.content = data.content || '';
        
    // Get the Authors & Description
	if(data.custom_fields.authors) {
		this.author = {
	      name: data.custom_fields.authors[0],
	      description: data.custom_fields.description[0],
	      image: '/wp/wp-content/uploads/authors/' + data.author.nickname + '.jpg'
	    };
	} else {
		this.author = {
	      name: data.author && data.author.name,
	      description: data.author.description,
	      image: '/wp/wp-content/uploads/authors/' + data.author.nickname + '.jpg'
	    };
	}
	
    // Parse custom fields (street view, timecodes, and highlight).
    var customFields = data.custom_fields;

    function getCustomField(key) {
      var value = customFields && customFields[key] && customFields[key][0];
      return value || '';
    }

    var streetView = getCustomField('mm_annotation_streetview');
    var start = getCustomField('mm_annotation_start_timecode');
    var end = getCustomField('mm_annotation_end_timecode');
    var x = getCustomField('mm_annotation_x');
    var y = getCustomField('mm_annotation_y');

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
