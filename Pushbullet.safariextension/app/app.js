angular.module('pushbullet', ['pushbullet.services', 'pushbullet.directives', 'pushbullet.filters'])
.controller('PushablesCtrl', function($scope, $http, Base64){

  // Mock safari's extension api, comment this out if you want to test the extension on your browser.
  safari = {extension:{settings:{apiKey:''}}, application:{activeBrowserWindow:{activeTab:{title:''}}}}; 

  // Load the API key if present
  $scope.apiKey = safari.extension.settings.apiKey;

  // Init data
  $scope.loggedIn = false;
  $scope.selection = null;
  $scope.loading = false;
  $scope.pushable = {};
  $scope.pushable.linkTitle = safari.application.activeBrowserWindow.activeTab.title;

  $scope.login = function() {
    $scope.loading = true;

    $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($scope.apiKey + ':');

    $http.get('https://api.pushbullet.com/v2/users/me').success(function(response){
      $scope.userName = response['google_userinfo']['name'];
      $scope.loggedIn = true;
      $scope.loading = false;
      $scope.refreshData();
    }).error(function(response){
      $scope.loading = false;
    });
  };

  $scope.refreshData = function() {
    $scope.devices = [];
    $http.get('https://api.pushbullet.com/v2/devices').success(function(response){
      angular.forEach(response.devices, function(elem){
        elem.visible = true;
        elem.display = elem.nickname || elem.manufacturer + ' ' + elem.model;
        $scope.devices.push(elem);
      });
    });
    $http.get('https://api.pushbullet.com/v2/contacts').success(function(response){
      angular.forEach(response.contacts, function(elem){
        elem.visible = true; 
        elem.type = 'contact';
        elem.display = elem.name;
        $scope.devices.push(elem);
      });
    });
  };

  if ($scope.apiKey) {
    $scope.login();
  }

  $scope.saveApiKey = function() {
    safari.extension.settings.apiKey = $scope.apiKey;
    $scope.login();
  };
  
  $scope.removeApiKey = function() {
    safari.extension.settings.apiKey = null;
    $scope.apiKey = null;
    $scope.userName = null;
    $scope.loggedIn = false;
    $scope.devices = null;
  };

  $scope.setIden = function(device) {
    $scope.selection = device;
    $scope.iden = device.iden;
  };

  $scope.removeSelection = function() {
    $scope.selection = null;
    $scope.iden = null;
  };
  
  $scope.sendText = function(){
    var params = {};
    if ($scope.iden.split('@').length > 1) {
      params['email'] = $scope.iden;
    } else { 
      params['device_iden'] = $scope.iden;
    }
    params['type'] = $scope.type;

    if ($scope.type === 'note') {
      params['title'] = $scope.pushable.noteTitle;
      params['body'] = $scope.pushable.noteBody;
    }

    if ($scope.type === 'link') {
      params['title'] = $scope.pushable.linkTitle;
      params['body'] = $scope.pushable.linkBody;
      params['url'] = safari.application.activeBrowserWindow.activeTab.url;
    }
    
    $scope.pushing = true;
    $http({method:'POST', url:'https://api.pushbullet.com/v2/pushes', data:params })
      .success(function(response) {
        $scope.pushing = false;
      })
      .error(function(resp) {
        $scope.pushing = false;
        alert('Something went wrong, try again later!');
      });
  };
});
