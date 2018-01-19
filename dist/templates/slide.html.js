angular.module('shotbyshot').run(['$templateCache', function($templateCache) {
    $templateCache.put('templates/slide.html',
        "<div class=\"slide slide-outer-{{slide.type}}\">\n\n  <!-- INTRO -->\n  <div ng-if=\"slide.type === 'introduction'\" class=\"slide-intro slide-inner\">\n\t  <div class=\"slide-center\">\n\t\t<div class=\"intro-splash\">\n\t\t  <img ng-src=\"../images/WR_full_logo.svg\" />\n\t\t  <h4>{{ slide.volume.title }}</h4>\n\t\t</div>\n\t    <div class=\"intro-title\">\n\t      <h3>{{ slide.title }}</h3>\n\t      <h4>{{ slide.authors }}</h4>\n\t    </div>\n\t  </div>\n    <div class=\"slide-scroll-indicator\"></div>\n  </div>\n\n  <!-- OUTRO -->\n  <div ng-if=\"slide.type === 'outro'\" class=\"slide-outro slide-inner\">\n    <div class=\"slide-center\">\n      <!--<h3>End</h3>\n      <div class=\"slide-shot-number\">{{ slide.shot }}</div>-->\n      <div class=\"slide-outro-actions\">\n\t    <a class=\"slide-outro-action\" href=\"https://worldrecordsjournal.org/volumes/\" target=\"_blank\">Volume Index</a>\n        <a class=\"slide-outro-action\" ng-show=\"slide.next\" ui-sref=\"volume.shot({shot: slide.next})\">Next Article</a>\n      </div>\n    </div>\n  </div>\n\n  <!-- AUTHOR -->\n  <div ng-if=\"slide.type === 'author'\" class=\"slide-author slide-inner\">\n    <img ng-src=\"{{ slide.annotation.author.image }}\" />\n  </div>\n\n  <!-- TEXT -->\n  <div ng-if=\"slide.type === 'text'\" class=\"slide-text slide-inner\">\n    <div class=\"slide-text-container\" ng-bind-html=\"slide.content\"></div>\n  </div>\n\n  <!-- COLUMN -->\n  <div ng-if=\"slide.type === 'column' && slide.attributes.title === 'Footnotes'\" class=\"slide-column slide-inner slide-footnotes\">\n    <div class=\"slide-column-container\" ng-bind-html=\"slide.content\"></div>\n    <div class=\"column-bg\"></div>\n  </div>\n  <div ng-if=\"slide.type === 'column' && slide.attributes.title != 'Footnotes'\" class=\"slide-column slide-inner\">\n    <div class=\"slide-column-container\" ng-bind-html=\"slide.content\"></div>\n    <div class=\"column-bg\"></div>\n  </div>\n\n  <!-- BACKGROUND -->\n  <div ng-if=\"slide.type === 'background'\" class=\"slide-background slide-inner\">\n    <img ng-if=\"slide.attributes.background\" ng-src=\"{{ slide.attributes.background }}\" class=\"background-cover-directive\" />\n    <div ng-if=\"!slide.attributes.background\" ng-bind-html=\"slide.content\" class=\"background-cover-directive\"></div>\n    <div class=\"meta-text\" ng-if=\"slide.attributes.caption\">\n      <div class=\"meta-caption\">{{ slide.attributes.caption }}</div>\n    </div>\n  </div>\n\n  <!-- PHOTO -->\n  <div ng-if=\"slide.type === 'photo'\" class=\"slide-photo slide-inner\">\n    <img ng-if=\"slide.attributes.photo\" ng-src=\"{{ slide.attributes.photo }}\" class=\"fit-to-window-directive\" />\n    <div ng-if=\"!slide.attributes.photo\" ng-bind-html=\"slide.content\" class=\"fit-to-window-directive\"></div>\n    <div class=\"meta-text\" ng-if=\"slide.attributes.caption\">\n      <div class=\"meta-caption\">{{ slide.attributes.caption }}</div>\n    </div>\n  </div>\n\n  <!-- HIGHLIGHT -->\n  <div ng-if=\"slide.type === 'highlight'\" class=\"slide-highlight slide-inner\">\n    <div class=\"slide-highlight-spotlight\"></div>\n    <div class=\"meta-text\" ng-if=\"slide.attributes.title || slide.attributes.caption\">\n      <div ng-if=\"slide.attributes.title\">{{ slide.attributes.title }}</div>\n      <div ng-if=\"slide.attributes.caption\">{{ slide.attributes.caption }}</div>\n    </div>\n  </div>\n\n  <!-- STREETVIEW -->\n  <div ng-if=\"slide.type === 'streetview'\" class=\"slide-streetview slide-inner\">\n      <street-view url=\"{{slide.annotation.streetView}}\" title=\"{{slide.attributes.title}}\" caption=\"{{slide.attributes.caption}}\" start-frame=\"{{slide.annotation.timecodes.start}}\"></street-view>\n  </div>\n\n  <!-- VIDEO -->\n  <div video-container ng-if=\"slide.type === 'video'\" class=\"slide-video slide-inner\">\n    <video class=\"fit-to-window-directive\" ng-if=\"slide.attributes.video\" controls>\n    <source ng-repeat=\"video in slide.attributes.video\" ng-src=\"{{ video }}\" type=\"video/{{ video | mimetype }}\">\n      Your browser does not support the <code>video</code> element.\n    </video>\n    <div class=\"slide-video-content\" ng-if=\"!slide.attributes.video\" ng-bind-html=\"slide.content\">\n    </div>\n    <div class=\"meta-text\" ng-if=\"slide.attributes.caption\">\n      <div class=\"meta-caption\">{{ slide.attributes.caption }}</div>\n    </div>\n  </div>\n\n  <!-- BACKGROUND VIDEO -->\n  <div video-container ng-if=\"slide.type === 'bg-video'\" class=\"slide-bg-video slide-inner\">\n    <video class=\"video-cover-directive\" ng-if=\"slide.attributes.video\" autoplay loop muted>\n    <source ng-repeat=\"video in slide.attributes.video\" ng-src=\"{{ video }}\" type=\"video/{{ video | mimetype }}\">\n      Your browser does not support the <code>video</code> element.\n    </video>\n    <div class=\"slide-scroll-indicator\" ng-if=\"$first\"></div>\n  </div>\n\n  <!-- MAIN TITLE -->\n  <div ng-if=\"slide.type === 'main-title'\" class=\"slide-main-title slide-inner\">\n    <div class=\"slide-main-title-content\">\n      <div class=\"slide-main-title-title\" ng-bind=\"slide.attributes.title\"></div>\n      <div class=\"slide-main-title-description\" ng-bind=\"slide.attributes.description\"></div>\n      <div class=\"slide-main-title-subtitle\" ng-bind=\"slide.attributes.subtitle\"></div>\n      <a class=\"slide-main-title-play\" ng-if=\"slide.attributes.href\" href=\"{{ slide.attributes.href }}\"></a>\n    </div>\n  </div>\n\n  <!-- TODO(dbow): Add audio support -->\n\n</div>\n\n");
}]);