'use strict';

/**
 * Takes in an integer and returns a 2 digit zero-padded shot string.
 * e.g. 1 => '01', 24 => '24'
 * @param {number} num to convert.
 * @return {string} 0-padded 2 digit string shot number.
 */
function ShotFilter(num) {
  return ('00' + num).slice(-2);
}

angular
  .module('shotbyshot')
  .filter('shot', function() {
    return ShotFilter;
  });


function MimeTypeFilter(file) {
  return _.last(file.split('.'));
}

angular
  .module('shotbyshot')
  .filter('mimetype', function() {
    return MimeTypeFilter;
  });
