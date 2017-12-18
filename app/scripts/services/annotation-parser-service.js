'use strict';

/**
 * This service parses an array of annotations into an array of slide objects
 * based on the content field of the annotations.
 *
 * Usually there will be more slides than annotations since an annotation can
 * have multiple slides.
 *
 * For example, an annotation with the following "content":
 *
 *   [slide text]
 *     some text
 *   [slide background]
 *     <img src="url" />
 *   [slide text]
 *     more text
 *   [slide streetview="url"]
 *
 * will be parsed into 4 separate slide objects of type "text", "background",
 * "text", and "streetview".
 */
function AnnotationParserService($sce, $rootScope, Annotation) {

  /**
   * Convert annotations to slides based on the content field.
   *
   * @param {Array.<Object>} annotations to parse.
   * @return {Array.<Object>} array of slide objects.
   */
  this.parse = function(annotations) {

    var slideObjects = [];

    angular.forEach(annotations, function(annotation) {

      /**
       * NOTE: Not sure a series of regexes is the best way to parse the
       * content. Could possibly just replace the [ ] brackets with < >
       * HTML tags and parse the containing string as a DOM element and
       * then use the native DOM getAttribute methods.
       */

      var annotationContent = annotation.content;
      // Separate each [slide or [Slide tag.
      var slides = annotationContent.split(/\[slide\s*/ig);

      if (slides.length < 2) {
        // No [slide] tags present. Default to text for now.
        slideObjects.push({
          type: 'text',
          content: annotationContent,
          attributes: {
            text: undefined
          },
          annotation: annotation // Reference to original annotation.
        });
        return false;
      }

      // Ignore first result since it's always outside a slide tag.
      slides = slides.slice(1);

      angular.forEach(slides, function(slide, i) {
        // Separate into attributes and content.
        var parts = slide.split(']');
        if (parts.length < 2) {
          throw new Error('Slide tag "' + parts[0] + '" did not have closing ' +
              'bracket: ' + annotationContent);
          return;
        }
        var attributes = parts[0];
        var content = parts[1];

        // Extract the type of slide (the first tag).
        //   [slide background] => background
        //   [slide highlight caption="blah" title="blah"] => highlight
        var typeAttributeRegex = /(\w+)(?=$|\s|=)/i;
        var type = typeAttributeRegex.exec(attributes);
        if (type === null) {
          throw new Error('Could not determine type of slide tag: ' + slide);
          return;
        }
        type = type[1].toLowerCase();

        var ALLOWED_TYPES = {
          'text': 1,
          'background': 1,
          'photo': 1,
          'highlight': 1,
          'audio': 1,
          'video': 1,
          'streetview': 1
        };

        if (!ALLOWED_TYPES[type]) {
          throw new Error('Type not allowed: ' + type);
          return;
        }

        // Assemble a map of attributes and optional values.
        var attributeMap = {};

        // Replace smart double quotes and double prime.
        attributes = attributes.replace(/&#8220;|&#8221;|&#8243;/g, '"');
        // Replace smart single quotes and prime.
        attributes = attributes.replace(/&#8216;|&#8217;|&#8242;/g, '\'');
        // Replace en dash and em dash.
        attributes = attributes.replace(/&#8211;|&#8212;/g, '-');

        // Find all the key/value attributes e.g. caption="blah"
        var keyValAttributeRegex = /(\w+)=("[^"]*"|'[^']*'|\w+)/g;
        var match;
        var key;
        var value;
        var result = attributes;
        while ((match = keyValAttributeRegex.exec(attributes)) !== null) {
          key = match[1].toLowerCase();
          value = match[2];
          // Remove leading and trailing quotes if present.
          if (value.charAt(0) === '"' || value.charAt(0) === '\'') {
            value = value.slice(1, -1);
          }
          // Split video attribute into array of video URLs.
          if (key === 'video') {
            value = value.split(',');
          }

          attributeMap[key] = value;

          // Remove match from result (used for other attributes below).
          result = result.replace(match[0], '');
        }

        // Split result on whitespace and add the remaining attributes to
        // the map. These are all ones that don't have a value e.g.
        // [slide background] or [slide photo] or something.
        angular.forEach(result.split(/\s+/g), function(attribute) {
          if (attribute) {
            attributeMap[attribute] = undefined;
          }
        });

        // Filter out linebreaks from caption.
        if (attributeMap.caption) {
          attributeMap.caption = attributeMap.caption.replace(/\<br\s*\/*\>/gi,
              '');
        }

        // Filter out linebreaks (<br> and <br /> tags) in image content.
        if (type === 'photo' || type === 'background' || type === 'video') {
          content = content.replace(/\<br\s*\/*\>/gi, '');

          // Remove height and width from iframe - will be set via CSS.
          if (type === 'video') {
            content = content.replace(/width\=\"[0-9a-z]+\"/gi, '');
            content = content.replace(/height\=\"[0-9a-z]+\"/gi, '');
          }
        }

        // Assemble slide object for the slide directive.
        var slideObject = {
          type: type,
          content: $sce.trustAsHtml(content),
          attributes: attributeMap,
          annotation: annotation // Reference to original annotation.
        };

        var NON_AUTHOR_TYPES = {
          photo: 'photos',
          video: 'video',
          streetview: 'Then & Now'
        };

        if (NON_AUTHOR_TYPES[type]) {
          slideObject.nav = type === 'video' && attributeMap.title ?
              attributeMap.title : NON_AUTHOR_TYPES[type];
        }

        if (type === 'video') {
          // Add callbacks that broadcast video events on enter and exit,
          // passing in the slide object so listeners can identify the
          // specific slide that triggered the event.
          slideObject.onEnter = function() {
            $rootScope.$broadcast('videoEnter', slideObject);
          };
          slideObject.onExit = function() {
            $rootScope.$broadcast('videoExit', slideObject);
          };
        }

        slideObjects.push(slideObject);
      });
    });

    return slideObjects;
  };
}

angular
  .module('shotbyshot')
  .service('AnnotationParserService', AnnotationParserService);

