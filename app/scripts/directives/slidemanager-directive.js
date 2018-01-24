'use strict';

/**
 *
 */
function SlideManager($timeout, ScrollService) {
  return {
    restrict: 'E',
    template: [
          '<slide ng-class="{\'slides-loading\': loading}" ng-repeat="slide in slides" data="slide">' +
          '</slide>'
        ].join(''),
    scope: {
      slides: '=?',
    },
    link: function ($scope, $element) {
      ScrollService.init({el: $element});

      $scope.$watch('slides', function(newValue, oldValue) {
        $scope.loading = true;
        $scope.$evalAsync(function() {
          ScrollService.setSlides($scope.slides);
          // End loading 100ms after setting slides to avoid flicker of slide content.
          $timeout(function() {
            $scope.loading = false;
            $scope.scope = $scope.$parent;
          }, 100);
        });
      });
    }
  };
}

angular
  .module('shotbyshot')
  .directive('slideManager', SlideManager);

