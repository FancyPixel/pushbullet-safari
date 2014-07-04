angular.module('pushbullet.filters', [])
.filter('filtered', function(){
  return function(input) {
    var filtered = [];
    angular.forEach(input, function(elem) {
      if (elem.visible) {
        filtered.push(elem);
      }
    });
    return filtered;
  };
})
