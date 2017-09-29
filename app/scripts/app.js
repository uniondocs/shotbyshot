'use strict';

angular
  .module('shotbyshot',
          ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ui.router'])
  .config(function ($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
    $stateProvider
      .state('shot', {
        url: '/:shot',
        templateUrl: 'partials/shot.html',
        controller: 'ShotCtrl',
        controllerAs: 'shot'
      });

    $urlRouterProvider.otherwise('/0001');

     $sceDelegateProvider.resourceUrlWhitelist([
       // Allow same origin resource loads.
       'self',
       // Allow wordpress uploads.
       'https://worldrecordsjournal.org/wp/wp-content/uploads/**',

       'player.vimeo.com/video/**',
       'http://cf.lossur.es/**',
       'http://d16hdktz6rtx08.cloudfront.net/**'
     ]);
  });

