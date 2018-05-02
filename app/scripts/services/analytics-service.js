'use strict';

/**
 * Service for tracking and analytics.
 * Right now, just a wrapper around GA.
 */
function AnalyticsService($window, $stateParams) {
  var self = this;

  /**
   * Sends a pageview with the given params if the ga object is available.
   *
   * @param {string} page to set for the pageview.
   * @param {string} title to set for the pageview.
   */
	this.pageview = function($page, $title) {
		if (!$window['gtag']) {
		  return;
		}
		gtag('config', 'UA-28389804-9', {
			'page_title' : $title,
			'page_location' : $page,
			'page_path': $stateParams.volume + "/" + $stateParams.shot
		});
	};
	  
	this.buttonClick = function($button) {
		if (!$window['gtag']) {
		  return;
		}
		gtag('event', $button, {
			'event_category': 'Click Event',
			'event_label': $button
		}); 	
	}
	
	// ScrollDepth is controlled in helpers/scrolltracker.js
	this.scrollDepth = function($percent, $route) {
		if (!$window['gtag']) {
		  return;
		}
	}
}

angular
  .module('shotbyshot')
  .service('AnalyticsService', AnalyticsService);


