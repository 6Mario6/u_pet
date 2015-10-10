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
        alert("se guardo"+ $rootScope.userEmail);
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
;
function escapeEmailAddress(email) {
  if (!email) return false
    // Replace '.' (not allowed in a Firebase key) with ','
  email = email.toLowerCase();
  email = email.replace(/\./g, ',');
  return email.trim();
}
