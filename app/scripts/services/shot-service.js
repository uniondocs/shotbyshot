'use strict';

function ShotService($rootScope, $http, $filter, $stateParams, $q,
                     AnnotationsService) {
  var self = this;

  var current = parseInt($stateParams.shot, 10);
  var currentVolume = parseInt($stateParams.volume, 10);

  // TODO: This will move
  document.title = document.title + " - Vol " + romanize(current);

  /**
   * Current shot number.
   * @type {number}
   */
  this.current = !isNaN(current) ? current : 0;

  /**
   * Current volume number.
   * @type {number}
   */
  this.currentVolume = !isNaN(currentVolume) ? currentVolume : 0;

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
   * Max number of articles in a volume.
   */
  var max = 100;

  /**
   * Get the next shot, if there is one.
   * @return {number|null} The next shot, or null if there is none.
   */
  this.getNext = function() {
    var next = this.current + 1;
    return next <= max ? $filter('shot')(next) : null;
  };

  /**
   * Get the previous shot, if there is one.
   * @return {number|null} The previous shot, or null if there is none.
   */
  this.getPrevious = function() {
    var previous = this.current - 1;
    return previous >= 0 ? $filter('shot')(previous) : null;
  };

  /**
   * Cache of shot results. Stored in an array with shot integer keys.
   * @type {Array.<Object>}
   */
  this.cache = [];

  var urlBase = '/wp/?json=get_post&post_type=mm_annotation&slug=';

  /**
   * @param {number=} opt_id optional id of shot to fetch. Defaults to current.
   * @return {Promise} promise object that will be resolved with the shot
   *     data, either from cache or from server.
   */
  this.getShot = function(opt_id) {
    var deferred = $q.defer();
    var id = (typeof opt_id === 'number' && !isNaN(opt_id)) ? opt_id :
        this.current;

    id = $filter('shot')(this.currentVolume) + '-' + $filter('shot')(id);

    if (this.cache[id]) {
      deferred.resolve(this.cache[id]);
      return deferred.promise;
    }

    var url = urlBase + id;
    $http({
        method: 'GET',
        url: url
      }).success(function(data) {
        self.cache[id] = AnnotationsService.parse(data.post);
        deferred.resolve(self.cache[id]);
      }).error(function() {
        deferred.reject('Error fetching shot ' + id);
      });
    return deferred.promise;
  };

  var articleCountByVolume = {};

  // Get all volumes
  this.getVolumes = function() {
    var deferred = $q.defer();
    var self = this;

    $http({
      method: 'GET',
      url: '/wp/?json=get_category_index'
    }).success(function(data) {
      if (data.status === 'ok') {
        var volumes = [];

        data.categories.forEach(function(category) {
          // TODO(dbow): Remove this filter when only volume categories are
          // present in the API.
          if (category.slug.length === 2) {
            volumes.push(category);
            // Store post count by volume to update the max shot value.
            articleCountByVolume[parseInt(category.slug, 10)] = category.post_count;
          }
        });

        max = articleCountByVolume[currentVolume];

        deferred.resolve(volumes);
      } else {
        deferred.reject('Error fetching volumes');
      }
    }).error(function() {
      deferred.reject('Error fetching volumes');
    });

    return deferred.promise;
  }

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
        var volumeNumber = parseInt(toParams.volume, 10);
        if (!isNaN(volumeNumber)) {
          self.currentVolume = volumeNumber;
          max = articleCountByVolume[volumeNumber];
        }
        var shotNumber = parseInt(toParams.shot, 10);
        if (!isNaN(shotNumber) && shotNumber >= 0 && shotNumber <= max) {
          self.current = shotNumber;
        }
      });
}

angular
  .module('shotbyshot')
  .service('ShotService', ShotService);


// Helper to convert digit to roman numeral 
function romanize (num) {
    if (!+num)
        return NaN;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

