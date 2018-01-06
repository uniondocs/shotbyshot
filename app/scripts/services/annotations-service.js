'use strict';

function AnnotationsService(Annotation) {
  /**
   * Parse an API response and return Annotation objects in an array.
   * @param {Object} post to parse.
   * @return {Array.<Annotation>} Array of Annotation objects.
   */
  this.parse = function (post) {
    return [new Annotation(post)];
  };

  // TODO(dbow): AnnotationsService will offer a filter method to return only
  //     annotations matching some criteria (author / tag, presumably).
}

angular
  .module('shotbyshot')
  .service('AnnotationsService', AnnotationsService);
