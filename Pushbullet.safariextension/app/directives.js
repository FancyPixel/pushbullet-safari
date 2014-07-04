angular.module('pushbullet.directives', [])
.directive('devicesList', function($timeout) {
  return {
    restrict: 'E', 
    templateUrl: 'app/devices-list.html',
    scope: {
      devices: '=',
      contacts: '=',
      selection: '=',
      select: '&',
      remove: '&'
    },
    controller: function($scope) {
      $scope.listVisible = false;

      $scope.selectFirst = function() {
        for (i = 0; i < $scope.devices.length; i++) {
          var elem = $scope.devices[i];
          if (elem.visible) {
            console.log(elem);
            $scope.select({device: elem});
            $scope.listVisible = false;
            break;
          }
        }
      };

      $scope.removeSelection = function() {
        $scope.search = '';
        $scope.filter();
        $scope.remove();
        angular.forEach(document.querySelectorAll('.search-field'), function(elem) { 
          $timeout(function() {
            elem.focus(); 
          });
        });
      };

      $scope.filter = function() {
        angular.forEach($scope.devices, function(elem) {
          elem.visible = (elem.display.toLowerCase().indexOf($scope.search.toLowerCase()) > -1);
        });
        angular.forEach($scope.contacts, function(elem) {
          elem.visible = (elem.name.toLowerCase().indexOf($scope.search.toLowerCase()) > -1);
        });
      };
    }
  };
})
.directive('tabGroup', function() {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      type: '=',
      pushable: '='
    },
    template: "<div ng-transclude=''></div><div ng-repeat='tab in tabs' ng-click='select(tab)' class='tab icon-{{tab.type}}' ng-class='{active: tab.selected}'></div>",
    controller: function($scope) {
      $scope.tabs = [];
      this.addTab = function (tab) {
        if ($scope.tabs.length == 0) {
          tab.selected = true;
          $scope.type = tab.type;
        }
        $scope.tabs.push(tab);
      }

      $scope.select = function (tab) {
        angular.forEach($scope.tabs, function (elem) {
          if (angular.equals(tab, elem)) {
            elem.selected = true; 
            $scope.type = elem.type;
          } else {
            elem.selected = false;
          }
        });
      }
    }
  };
})
.directive('tab', function() {
  return {
    restrict: 'E',
    scope: {
      title: '@',
      type: '@'
    },
    transclude: true,
    template: "<div ng-show='selected' ng-transclude=''></div>",
    require: "^tabGroup",
    link: function(scope, element, attrs, ctrl) {
      ctrl.addTab(scope);
    }
  };
})
.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.ngEnter, {'event': event});
        });
        event.preventDefault();
      }
    });
  };
});
