'use strict';

function ShotService($rootScope, $http, $filter, $stateParams, $q,
                     AnnotationsService) {
  var self = this;

  var current = parseInt($stateParams.shot, 10);

  /**
   * Current shot number.
   * @type {number}
   */
  this.current = !isNaN(current) ? current : 0;

  /**
   * Get Video URL of current shot.
   * @return {string}
   */
  this.getVideoUrl = function() {
    var url = 'https://s3.amazonaws.com/world-records-journal/' +
        $filter('shot')(this.current) + '.mp4';
    return url;
  };

  /**
   * Max number of shots that exist.
   */
  var max = 300;

  /**
   * Get the next shot, if there is one.
   * @return {number|null} The next shot, or null if there is none.
   */
  this.getNext = function() {
    var next = this.current + 1;
    return next <= max ? next : null;
  };

  /**
   * Get the previous shot, if there is one.
   * @return {number|null} The previous shot, or null if there is none.
   */
  this.getPrevious = function() {
    var previous = this.current - 1;
    return previous >= 0 ? previous : null;
  };

  /**
   * Cache of shot results. Stored in an array with shot integer keys.
   * @type {Array.<Object>}
   */
  this.cache = [];

  var urlBase = '/wp/?json=get_category_posts&post_type=mm_annotation&slug=';

  /**
   * @param {number=} opt_id optional id of shot to fetch. Defaults to current.
   * @return {Promise} promise object that will be resolved with the shot
   *     data, either from cache or from server.
   */
  this.getShot = function(opt_id) {
    var deferred = $q.defer();
    var id = (typeof opt_id === 'number' && !isNaN(opt_id)) ? opt_id :
        this.current;
    if (this.cache[id]) {
      deferred.resolve(this.cache[id]);
      return deferred.promise;
    }
    var url = urlBase + $filter('shot')(id);
    $http({
        method: 'GET',
        url: url
      }).success(function(data) {
        self.cache[id] = AnnotationsService.parse(data.posts);
        deferred.resolve(self.cache[id]);
      }).error(function() {
        deferred.reject('Error fetching shot ' + id);
      });
    return deferred.promise;
  };

  var thumbnailUrl = '/wp/?json=get_category_index';
  this.getThumbnails = function(page) {
    var deferred = $q.defer();

    page = page || 0;

    $http({
      method: 'GET',
      url: thumbnailUrl + '&page=' + page
    }).success(function(data) {
      if (data.status === 'ok') {
        deferred.resolve(data.categories);
        // Set max to last thumbnail's slug.
        max = parseInt(_.last(data.categories).slug, 10);
      } else {
        deferred.reject('Error fetching shots');
      }
    }).error(function() {
      deferred.reject('Error fetching shots');
    });

    return deferred.promise;
  };

  var postsForTagUrl = '/wp/?json=get_tag_posts';
  this.getAnnotationsForTag = function(tag, page) {
    var deferred = $q.defer();

    page = page || 0;

    $http({
      method: 'GET',
      url: postsForTagUrl + '&id=' + tag.id + '&page=' + page
    }).success(function(data) {
      if (data.status === 'ok') {
        deferred.resolve(data.posts);
      } else {
        deferred.reject('Error fetching shots');
      }
    }).error(function() {
      deferred.reject('Error fetching shots');
    });

    return deferred.promise;
  };

  var tagUrl = '/wp/?json=get_tag_index';
  this.getTags = function(page) {
    var deferred = $q.defer();

    page = page || 0;

    $http({
      method: 'GET',
      url: tagUrl + '&page=' + page
    }).success(function(data) {
      if (data.status === 'ok') {
        deferred.resolve(data.tags);
      } else {
        deferred.reject('Error fetching shots');
      }
    }).error(function() {
      deferred.reject('Error fetching shots');
    });

    return deferred.promise;
  };

  // Update the current shot number on any state change.
  $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams) {
        var shotNumber = parseInt(toParams.shot, 10);
        if (!isNaN(shotNumber) && shotNumber >= 0 && shotNumber <= max) {
          self.current = shotNumber;
        }
      });
}

angular
  .module('shotbyshot')
  .service('ShotService', ShotService);

