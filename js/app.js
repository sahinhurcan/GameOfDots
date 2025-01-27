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
    });
