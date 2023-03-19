angular.module('starter', ['ionic', 'game.services', 'game.controllers', 'game.directives'])
    .run(function ($ionicPlatform, $rootScope, AdMob) {
        $rootScope.network = false;
        $ionicPlatform.ready(function () {
            //  CORDOVA KEYBOARD
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });

        //  FIREBASE CONFIG & NETWORK CONTROLLER
        var config = {
            apiKey: "AIzaSyBYs4jHczjQ2H78Seih_AqX_5F1fioVEWA",
            authDomain: "dots-game-7621e.firebaseapp.com",
            databaseURL: "https://dots-game-7621e.firebaseio.com",
            projectId: "dots-game-7621e",
            storageBucket: "dots-game-7621e.appspot.com",
            messagingSenderId: "515143376174"
        };
        firebase.initializeApp(config);
        firebase.database().ref(".info/connected").on("value", function (snapshot) {
            var resp = snapshot.val();
            if (resp === true) {
                $rootScope.network = true;
                AdMob.init();
            } else {
                $rootScope.network = false;
            }
        });
    });