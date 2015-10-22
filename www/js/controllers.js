angular.module('upetapp.controllers', [])

.controller('ListPetCtrl', ['$scope','$http','$state',function($scope,$http,$state){
  $http.get('js/data.json').success(function(data){
    $scope.pets=data.pets;
    
    $scope.whichpets=$state.params.aId;
    $scope.data={showReorder:false};
    $scope.moveItem= function(item, fromIndex, toIndex){
      $scope.pets.splice(fromIndex,1);
      $scope.pets.splice(toIndex,0,item);
    };
  });
}])

.controller('LoginCtrl', [
  '$scope', '$rootScope', '$ionicModal','$firebaseAuth', '$window',
  function ($scope, $rootScope,$ionicModal, $firebaseAuth, $window)  {
    $rootScope.checkSession();
    $scope.user = {
      email: "",
      password: "",
      displayName:""
    };
    $ionicModal.fromTemplateUrl('templates/signup.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });
    $scope.validateUser = function() {
      $rootScope.show('Por favor espere..');
      var email = this.user.email;
      var password = this.user.password;
      if (!email || !password) {
        $rootScope.notify("Por favor ingrese datos validos");
        return false;
      }
      $rootScope.auth.$login('password', {
        email: email,
        password: password
      }).then(function(user) {
        $rootScope.hide();
        $rootScope.userEmail = user.email;
        $window.location.href = ('#/app/mascota');
      }, function(error) {
        $rootScope.hide();
        if (error.code == 'INVALID_EMAIL') {
          $rootScope.notify('Email incorrecto');
        } else if (error.code == 'INVALID_PASSWORD') {
          $rootScope.notify('Password incorrecto');
        } else if (error.code == 'INVALID_USER') {
          $rootScope.notify('Usuario Incorrecto');
        } else {
          $rootScope.notify('Oops something went wrong. Please try again later');
        }
      });
    }

    $scope.createUser = function() {
      var email = this.user.email;
      var password = this.user.password;
      var displayName =this.user.displayName;
      if (!email || !password|| !displayName) {
        $rootScope.notify("Por favor ingrese datos validos");
        return false;
      }
      $rootScope.show('Por favor espere.. Registrando');

      $rootScope.auth.$createUser(email, password, function(error, user) {
        if (!error) {
          $rootScope.hide();
          $scope.modal.hide();
          $rootScope.userEmail = user.email;
          $rootScope.displayname = user.displayName;
          $window.location.href = ('#/app/mascota');
        } else {
          $rootScope.hide();
          if (error.code == 'INVALID_EMAIL') {
            $rootScope.notify('Invalid Email Address');
          } else if (error.code == 'EMAIL_TAKEN') {
            $rootScope.notify('Email ya existe');
          } else {
            $rootScope.notify('Oops something went wrong. Please try again later');
          }
        }
      });
    }

  }
  ])
.controller('myListCtrl', function($rootScope, $scope, $window, $ionicModal, $firebase) {
  $rootScope.show("Por favor espere... Procesando");
  $scope.pets = [];
  var petListRef = new Firebase($rootScope.baseUrl + escapeEmailAddress($rootScope.userEmail));
  petListRef.on('value', function(snapshot) {
    var data = snapshot.val();
    $scope.pets = [];

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
          data[key].key = key;
          $scope.pets.push(data[key]);
      }
    }

    if ($scope.pets.length == 0) {
      $scope.noData = true;
    } else {
      $scope.noData = false;
    }
    $rootScope.hide();
  });

  $ionicModal.fromTemplateUrl('templates/newPet.html', function(modal) {
    $scope.newTemplate = modal;
  });

  $scope.newPet = function() {
    $scope.newTemplate.show();
  };

  $scope.deleteItem = function(key) {
    $rootScope.show("Please wait... Deleting from List");
    var itemRef = new Firebase($rootScope.baseUrl + escapeEmailAddress($rootScope.userEmail));
    bucketListRef.child(key).remove(function(error) {
      if (error) {
        $rootScope.hide();
        $rootScope.notify('Oops! something went wrong. Try again later');
      } else {
        $rootScope.hide();
        $rootScope.notify('Successfully deleted');
      }
    });
  };
})
.controller('newCtrl', function($rootScope, $scope, $window, $firebase) {
  $scope.data = {
    pet: "",
    id:"",
    owner:"",
    species:"",
    breed:"",
    gender:"",
    birthdate:""

  };

  $scope.close = function() {
    $scope.modal.hide();
  };

  $scope.createNew = function() {
    var pet = this.data.pet;
    var id = this.data.id;
    var owner = this.data.owner;
    var species = this.data.species;
    var breed = this.data.breed;
    var gender = this.data.gender;
    var birthdate = this.data.birthdate;
    if (!pet || !id|| !owner || !species|| !breed|| !gender|| !birthdate) {
      $rootScope.notify("Por favor ingrese datos validos");
      return false;
    }

    $scope.modal.hide();
    $rootScope.show();

    $rootScope.show("Por favor espere... Registrando mascota");

    var form = {
      pet: pet,
      id:id,
      owner:owner,
      species:species,
      breed:breed,
      gender:gender,
      birthdate:birthdate
    };

    var petListRef = new Firebase($rootScope.baseUrl + escapeEmailAddress($rootScope.userEmail));
    $firebase(petListRef).$add(form);
    $rootScope.hide();

  };
})
.controller('MapController', function($scope, uiGmapGoogleMapApi) {
     
    $scope.myLocation = {
    lng : '',
    lat: ''
  }
  
  $scope.drawMap = function(position) {

    //$scope.$apply is needed to trigger the digest cycle when the geolocation arrives and to update all the watchers
    $scope.$apply(function() {
      $scope.myLocation.lng = position.coords.longitude;
      $scope.myLocation.lat = position.coords.latitude;

      $scope.map = {
        center: {
          latitude: $scope.myLocation.lat,
          longitude: $scope.myLocation.lng
        },
        zoom: 14,
        pan: 1
      };

      $scope.marker = {
        id: 0,
        coords: {
          latitude: $scope.myLocation.lat,
          longitude: $scope.myLocation.lng
        }
      }; 
      
      $scope.marker.options = {
        draggable: false,
        labelContent: "lat: " + $scope.marker.coords.latitude + '<br/> ' + 'lon: ' + $scope.marker.coords.longitude,
        labelAnchor: "80 120",
        labelClass: "marker-labels"
      };  
    });
  }

  navigator.geolocation.getCurrentPosition($scope.drawMap);                
})
.controller('DashCtrl', function ($scope, $ionicPopup) {

        $scope.slots = [
            {epochTime: 12600, step: 15, format: 12},
            {epochTime: 54900, step: 1, format: 24}
        ];

        $scope.showTimePickerModal = function (obj) {

            $scope.time = { hours: 0, minutes: 0, meridian: "" };

            var objDate = new Date(obj.epochTime * 1000);       // Epoch time in milliseconds.

            $scope.increaseHours = function () {
                if (obj.format == 12) {
                    if ($scope.time.hours != 12) {
                        $scope.time.hours += 1;
                    } else {
                        $scope.time.hours = 1;
                    }
                }
                if (obj.format == 24) {
                    if ($scope.time.hours != 23) {
                        $scope.time.hours += 1;
                    } else {
                        $scope.time.hours = 0;
                    }
                }
            };

            $scope.decreaseHours = function () {
                if (obj.format == 12) {
                    if ($scope.time.hours > 1) {
                        $scope.time.hours -= 1;
                    } else {
                        $scope.time.hours = 12;
                    }
                }
                if (obj.format == 24) {
                    if ($scope.time.hours > 0) {
                        $scope.time.hours -= 1;
                    } else {
                        $scope.time.hours = 23;
                    }
                }
            };

            $scope.increaseMinutes = function () {
                if ($scope.time.minutes != (60 - obj.step)) {
                    $scope.time.minutes += obj.step;
                } else {
                    $scope.time.minutes = 0;
                }
            };

            $scope.decreaseMinutes = function () {
                if ($scope.time.minutes != 0) {
                    $scope.time.minutes -= obj.step;
                } else {
                    $scope.time.minutes = 60 - obj.step;
                }
            };

            if (obj.format == 12) {

                $scope.time.meridian = (objDate.getUTCHours() >= 12) ? "PM" : "AM";
                $scope.time.hours = (objDate.getUTCHours() > 12) ? ((objDate.getUTCHours() - 12)) : (objDate.getUTCHours());
                $scope.time.minutes = (objDate.getUTCMinutes());

                if ($scope.time.hours == 0 && $scope.time.meridian == "AM") {
                    $scope.time.hours = 12;
                }

                $scope.changeMeridian = function () {
                    $scope.time.meridian = ($scope.time.meridian === "AM") ? "PM" : "AM";
                };

                $ionicPopup.show({
                    templateUrl: 'my-time-picker-12-hour.tpl.html',
                    title: '<strong>12-Hour Format</strong>',
                    subTitle: '',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                            text: 'Set',
                            type: 'button-positive',
                            onTap: function (e) {

                                $scope.loadingContent = true;

                                var totalSec = 0;

                                if ($scope.time.hours != 12) {
                                    totalSec = ($scope.time.hours * 60 * 60) + ($scope.time.minutes * 60);
                                } else {
                                    totalSec = $scope.time.minutes * 60;
                                }

                                if ($scope.time.meridian === "AM") {
                                    totalSec += 0;
                                } else if ($scope.time.meridian === "PM") {
                                    totalSec += 43200;
                                }
                                obj.epochTime = totalSec;

                            }
                        }
                    ]
                })

            }

            if (obj.format == 24) {

                $scope.time.hours = (objDate.getUTCHours());
                $scope.time.minutes = (objDate.getUTCMinutes());

                $ionicPopup.show({
                    templateUrl: 'my-time-picker-24-hour.tpl.html',
                    title: '<strong>24-Hour Format</strong>',
                    subTitle: '',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                            text: 'Set',
                            type: 'button-positive',
                            onTap: function (e) {

                                $scope.loadingContent = true;

                                var totalSec = 0;

                                if ($scope.time.hours != 24) {
                                    totalSec = ($scope.time.hours * 60 * 60) + ($scope.time.minutes * 60);
                                } else {
                                    totalSec = $scope.time.minutes * 60;
                                }
                                obj.epochTime = totalSec;
                            }
                        }
                    ]
                })

            }

        };

    })
;
function escapeEmailAddress(email) {
  if (!email) return false
    // Replace '.' (not allowed in a Firebase key) with ','
  email = email.toLowerCase();
  email = email.replace(/\./g, ',');
  return email.trim();
}
