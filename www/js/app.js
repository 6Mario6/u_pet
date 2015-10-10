// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('upetapp', ['ionic','firebase', 'upetapp.controllers'])

.run(function($ionicPlatform,$rootScope, $firebaseAuth, $firebase, $window, $ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
        $rootScope.userEmail = null;
        $rootScope.displayname = null;
        $rootScope.baseUrl = "https://udeamascotas.firebaseio.com/";
        var authRef = new Firebase($rootScope.baseUrl);
        $rootScope.auth = $firebaseAuth(authRef);

        $rootScope.show = function(text) {
            text = text || 'Cargando...';
            $rootScope.loading = $ionicLoading.show({
            template: text
            });
        };

        $rootScope.hide = function() {
            $ionicLoading.hide();
        };

        $rootScope.notify = function(text) {
            $rootScope.show(text);
            $window.setTimeout(function() {
                $rootScope.hide();
            }, 1999);
        };

        $rootScope.logout = function() {
            $rootScope.auth.$logout();
            $rootScope.checkSession();
            $rootScope.show('Sesión cerrada con éxito!');
            $window.setTimeout(function() {
                $rootScope.hide();
            }, 1999);

        };

        $rootScope.checkSession = function() {
            var auth = new FirebaseSimpleLogin(authRef, function(error, user) {
                if (error) {
                    // no action yet.. redirect to default route
                    $rootScope.userEmail = null;
                    $window.location.href = '#/login';
                } else if (user) {
                    // user authenticated with Firebase
                    $rootScope.userEmail = user.email;
                    $window.location.href = ('#/app/mascota');
                } else {
                    // user is logged out
                    $rootScope.userEmail = null;
                    $window.location.href = '#/login';
                }
            });
        }


  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', {
        url: "/login",
        templateUrl: "templates/login.html",
        controller: 'LoginCtrl'
    })
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html'
  
  })

  .state('app.mascota', {
    url: '/mascota',
    views: {
      'menuContent': {
        templateUrl: 'templates/mascota.html',
        controller:'myListCtrl'
      }
    }
  })
.state('app.detalle',{
    url: '/mascota/:aId',
    views: {
      'menuContent':{
        templateUrl:'templates/detalle.html',
        controller:'ListPetCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
