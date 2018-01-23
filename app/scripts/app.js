'use strict';

angular
  .module('shotbyshot',
          ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ui.router'])
  .config(function ($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
    $stateProvider
      .state('volume', {
        template: '<ui-view/>',
        url: '/volume/:volume',
        abstract: true,
        controller: function($scope, $stateParams) {
          $scope.volume = $stateParams.volume;
        }
      })
      .state('volume.shot', {
        url: '/:shot',
        templateUrl: 'partials/shot.html',
        controller: 'ShotCtrl',
        controllerAs: 'shot'
      });

    $urlRouterProvider.otherwise('/volume/01/01');

     $sceDelegateProvider.resourceUrlWhitelist([
       // Allow same origin resource loads.
       'self',
       // Allow wordpress uploads.
       'https://worldrecordsjournal.org/wp/wp-content/uploads/**',
       'https://s3.amazonaws.com/world-records-journal/**',
       'https://s3.amazonaws.com/world-records-journal/',

       'player.vimeo.com/video/**',
       'http://cf.lossur.es/**',
       'http://d16hdktz6rtx08.cloudfront.net/**'
     ]);
  });

