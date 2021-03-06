'use strict';

function ShotCtrl($scope, $sce, $filter, $timeout, $state, $stateParams, ShotService,
                  AnnotationParserService, ShotVideoService, ScrollService,
                  AnalyticsService, AutoScrollerService, MetaService) {
  var self = this;

  this.id = ShotService.current;
  this.next = ShotService.getNext();
  this.previous = ShotService.getPrevious();
  this.videoUrl = ShotService.getVideoUrl();
  this.shots = [];
  this.volumes = [];
  this.currentVolume = null;
  this.thumbsForTag = {};  
  
  AnalyticsService.pageview(window.location.href, 
  	document.title);

  $scope.menuIsOn = false;
  $scope.showMenuTab = 'shots';

  angular.element(document.body).removeClass('noscroll');
   
  
  // Duration to wait before auto-play and moving to the next shot at end.
  var AUTO_ACTION_DURATION = 30 * 1000;
  this.played = false;

  this.play = function() {
    self.played = true;
    self.backgroundOpacity = 0;
    self.playing = true;
    ShotVideoService.play(function() {
      self.stop();
      AutoScrollerService.autoScroll();
    });
  };

  this.stop = function() {
    self.playing = false;
    ShotVideoService.resumeLoop();
    self.backgroundOpacity = 1;
    $scope.$apply();
  };

  var outroShouldMoveOn = true;

  if (this.id) {	
    ShotService.getShot(this.id).then(function(annotations) {
      if (window.location.search.indexOf('installation') >= 0) {
        // If in installation mode and video has not been played after some time,
        // auto-play.
        $timeout(function() {
          if (!self.played) {
            self.play();
          }
        }, AUTO_ACTION_DURATION);
      }
                  
      var intro = [{
        type: 'introduction',
        shot: self.id,
        title: annotations[0].title,
        authors: annotations[0].author.name,
        nav: 'introduction',
        attributes: {
	        loop:annotations[0].timecodes
	    },
        onEnter: function() {
          $scope.inView = true;
          if (!self.ready) {
            $timeout(function() {
              self.ready = true;
              fadeIntroSplash();
            }, 3000);
          }
          $scope.$apply();
        },
        onExit: function() {
          $scope.inView = false;
          self.stop();
        }
      }];
      var outro = [{
        shot: self.id,
        type: 'outro',
        next: self.next,
        onEnter: function() {
          if (window.location.search.indexOf('installation') >= 0) {
            // If in installation mode and outro slide is still in focus after
            // some duration, move to next shot.
            $timeout(function() {
              if (outroShouldMoveOn) {
                ScrollService.scrollToSlide(self.slides[0]);
                $state.go('shot', {'shot': self.next || 1});
              }
            }, AUTO_ACTION_DURATION);
          }
        },
        onExit: function() {
          outroShouldMoveOn = false;
        }
      }];
      var slides = intro.concat(AnnotationParserService.parse(annotations), outro);
      self.annotations = annotations;
      self.slides = slides;
      
      MetaService.generateMeta(annotations[0]);
      
      _.each(slides, function (slide) {
        slide.isNav = $scope.isNavSlide(slide);
        slide.isHeader = $scope.isHeaderSlide(slide);
        $timeout(function() {
			slide.volume = self.currentVolume;
    	}, 300);
      });
    });
  }
  	  
  function fadeIntroSplash() {
    var splash = document.querySelector('.intro-splash');
    splash.style.opacity = 0;
     
    $timeout(function() {
    	splash.nextElementSibling.style.opacity = 1;
	}, 1000);
  }

  // TODO: probably can lazy load this, but i'm not
  // angular enought to know how.
  ShotService.getThumbnails(0).then(function(thumbs) {
    $scope.thumbs = self.thumbs = thumbs;

    // Scroll the shot menu to approximately the location of this shot.
    var thisShotIndex = _.findIndex(thumbs, function(thumb) {
      return parseInt(thumb.slug, 10) === self.id;
    });
    var thumbnailRowHeight = 275; // constant px height from CSS...
    var scrollTarget = thumbnailRowHeight * Math.floor(thisShotIndex / 2);
    $timeout(function() { // Scroll 300ms later to allow for rendering.
      document.querySelector('.nav-menu-shots').scrollTop = scrollTarget;
    }, 300);
  });
  
  ShotService.getVolumes().then(function(volumes) {
    $scope.volumes = volumes;
        
    _.each(volumes, function(volume) {
		if(volume.slug === $stateParams.volume) {
			$scope.currentVolume = self.currentVolume = volume;
			
			getShotsForVolume(self.currentVolume.id);
		}  
    });
  });
  function getShotsForVolume(volume_id) {  
      ShotService.getVolumeShots(volume_id).then(function(shots) {
        $scope.shots = shots;
      });
  }

  ShotService.getTags(0).then(function(tags) {
    self.tags = _.map(_.sortBy(tags, function (tag) {
      return -tag.post_count;
    }).slice(0, 30), function(sortedTag) {
      sortedTag.title = sortedTag.title.replace(/\s/g, '&nbsp;');
      return sortedTag;
    });
  });

  $scope.isHeaderSlide = function(slide) {
    var NAV_TYPES = [
      'introduction',
      'text',
      'column',
      'outro',
      'author',
      'photo',
      'video',
      'streetview',
      'bg-video'
    ];
    return _.contains(NAV_TYPES, slide.type);
  };

  $scope.isNavSlide = function(slide) {
    var NAV_TYPES = [
      'introduction',
      'text',
      'column',
      'author',
      'photo',
      'video',
      'streetview',
      'main-title'
    ];
    return _.contains(NAV_TYPES, slide.type);
  };

  $scope.scrollToSlide = function (slide) {
    // TODO: ask Danny if this is kosher
    ScrollService.scrollToSlide(slide);
  };

  $scope.thumbnailForShot = function (shot) {
    return 'https://worldrecordsjournal.org/wp-content/uploads/Shots_400px/' + shot.slug + '.png';
  };
  
  $scope.annotationsForShot = function (shot) {
	ShotService.getShot( Number(shot.slug) ).then(function(annotated) {	  
		
	});
  }
    
  $scope.toggleMenu = function () {
    if ($scope.menuIsOn) { // Close
      ShotVideoService.resumeLoop();
      angular.element(document.body).removeClass('noscroll');
    } else { // Open
      ShotVideoService.pause();
      AnalyticsService.buttonClick("Navigation Opened");
      angular.element(document.body).addClass('noscroll');
    }
    $scope.menuIsOn = !$scope.menuIsOn;
  };

  $scope.toggleGlobalMenu = function () {
    if ($scope.globalIsOn) { // Close
      ShotVideoService.resumeLoop();
      angular.element(document.body).removeClass('noscroll');
    } else { // Open
      ShotVideoService.pause();
      AnalyticsService.buttonClick("Global Menu Opened");
      angular.element(document.body).addClass('noscroll');
    }
    $scope.globalIsOn = !$scope.globalIsOn;
  };

  $scope.filterShots = function (tag) {
    if (!tag) {
      $scope.thumbs = self.thumbs;
    } else if (self.thumbsForTag[tag.id]) {
      $scope.thumbs = self.thumbsForTag[tag.id];
    } else {
      ShotService.getAnnotationsForTag(tag, 0).then(function(annotations) {
        var shots = {};
        var thumbs = [];
        _.each(annotations, function (annotation) {
          if (annotation.categories.length) {
            shots[annotation.categories[0].id] = annotation.categories[0];
          }
        });
        $scope.thumbs = self.thumbsForTag[tag.id] = _.toArray(shots);
      });
    }
  };
  
  $scope.getArticleNumber = function(num) {
	  return ShotFilter(num);
  }
  
  $scope.closeMenuIfCurrent = function(shot) {
	  if(shot.index === $stateParams.shot) {
		  $scope.menuIsOn = false;
		  angular.element(document.body).removeClass('noscroll');
	  }
  }
  
  $scope.analyticsButtonClick = function(button) {
	  AnalyticsService.buttonClick(button);
  }
    
  // Share Link copy to clipboard
  function shareLink() {
	  var clipboard = new Clipboard('.share-link', {
	    text: function(trigger) {
	        return window.location.href + '?index=1';
	    }
	  });
	  
	  var tooltip = document.createElement("div");
	  tooltip.className = "tooltip";
	  
	  clipboard.on('success', function(e) {
		var button = e.trigger;
		tooltip.innerHTML = "Share Link copied to Clipboard";
		
		button.appendChild(tooltip);
		
		setTimeout(function(){ tooltip.remove(); }, 3000);	
	    e.clearSelection();
	  });
	  clipboard.on('error', function(e) {
		var button = e.trigger;
		tooltip.innerHTML = "Share Link could not be Copied";
		
		button.appendChild(tooltip);
		
		setTimeout(function(){ tooltip.remove(); }, 3000);	
	    e.clearSelection();
	  });  
  }
  shareLink();
  
  // Auto-expand Volume Index with URL param ?index=1
  expandVolumeIndex();
  function expandVolumeIndex() {
  	if(getParameterByName('index') === "1") {
  		$scope.menuIsOn = true;
  		angular.element(document.body).addClass('noscroll');
  	}
  }
  // HELPER: Get params from URL
  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
}

angular
  .module('shotbyshot')
  .controller('ShotCtrl', ShotCtrl);
