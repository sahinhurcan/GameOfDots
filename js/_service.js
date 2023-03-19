angular.module('game.services', [])
    .factory('firebase', function ($q) {
        var database = firebase.database();
        var factory = {};

        factory.checkNetwrork = function () {
            var q = $q.defer();
            database.ref(".info/connected").on("value", function (snapshot) {
                q.resolve(snapshot.val())
            });
            return q.promise
        };

        factory.checkName = function (data) {
            var q = $q.defer();
            database.ref('users/us-' + data.name).child('device').once('value').then(function (snapshot) {
                var resp = snapshot.val();
                if (resp === null) {
                    q.resolve(true)
                } else {
                    if (resp === data.device) {
                        q.resolve(true)
                    } else {
                        q.resolve(false)
                    }
                }
            });
            return q.promise
        };

        factory.checkScore = function (data) {
            var q = $q.defer();
            database.ref('users/us-' + data.name).child('score').once('value').then(function (snapshot) {
                var resp = snapshot.val();
                if (resp < data.score) {
                    q.resolve(true)
                } else {
                    q.resolve(resp)
                }
            });
            return q.promise
        };

        factory.setScore = function (data) {
            database.ref('users/us-' + data.name).set(data);
        };

        factory.getScore = function () {
            var data = [];
            database.ref("users").orderByChild("score").on("child_added", function (snapshot) {
                data.push(snapshot.val());
            });
            return data;
        };

        return factory;
    })
    .factory('AdMob', function ($window) {
        var _admob;
        var _admobid;
        var _opt;
        var _interstitialReady;
        var _bannerReady;

        return {
            init: function () {
                console.log("AdMob init");
                _admob = $window.AdMob;
                if (_admob) {

                    // Register AdMob events
                    // new events, with variable to differentiate: adNetwork, adType, adEvent
                    document.addEventListener('onAdFailLoad', function (data) {
                        console.log('error: ' + data.error +
                            ', reason: ' + data.reason +
                            ', adNetwork:' + data.adNetwork +
                            ', adType:' + data.adType +
                            ', adEvent:' + data.adEvent); // adType: 'banner' or 'interstitial'
                    });
                    document.addEventListener('onAdLoaded', function (data) {
                        console.log('onAdLoaded: ' + JSON.stringify(data));
                    });

                    document.addEventListener('onAdPresent', function (data) {
                        console.log('onAdPresent: ' + JSON.stringify(data));
                    });
                    document.addEventListener('onAdLeaveApp', function (data) {
                        console.log('onAdLeaveApp: ' + JSON.stringify(data));
                    });
                    document.addEventListener('onAdDismiss', function (data) {
                        _interstitialReady = false;
                        console.log('onAdDismiss: ' + JSON.stringify(data));
                    });

                    _opt = {
                        // bannerId: admobid.banner,
                        // interstitialId: admobid.interstitial,
                        // adSize: 'SMART_BANNER',
                        // width: integer, // valid when set adSize 'CUSTOM'
                        // height: integer, // valid when set adSize 'CUSTOM'
                        position: _admob.AD_POSITION.BOTTOM_CENTER,
                        // offsetTopBar: false, // avoid overlapped by status bar, for iOS7+
                        bgColor: 'black', // color name, or '#RRGGBB'
                        // x: integer,     // valid when set position to 0 / POS_XY
                        // y: integer,     // valid when set position to 0 / POS_XY
                        isTesting: false, // set to true, to receiving test ad for testing purpose
                        autoShow: false // auto show interstitial ad when loaded, set to false if prepare/show
                    };

                    _admobid = {};

                    if (ionic.Platform.isAndroid()) {
                        _admobid = { // for Android
                            banner: 'ca-app-pub-7493021307871673/5221344744',
                            interstitial: 'ca-app-pub-7493021307871673/9791145145'
                        };
                    }

                    if (ionic.Platform.isIOS()) {
                        _admobid = { // for iOS
                            banner: 'ca-app-pub-7493021307871673/5221344744',
                            interstitial: 'ca-app-pub-7493021307871673/9791145145'
                        };
                    }

                    _admob.setOptions(_opt);


                    this.prepareInterstitial(false);
                    this.prepareBanner(false);

                } else {
                    console.log("No AdMob?");
                }
            },
            prepareBanner: function (bShow) {
                if (!_admob) return false;

                _admob.createBanner({
                    adId: _admobid.banner,
                    position: _admob.AD_POSITION.BOTTOM_CENTER,
                    autoShow: bShow,
                    //adSize:'SMART_BANNER',
                    success: function () {
                        _bannerReady = true;
                        console.log('banner ready');
                    },
                    error: function () {
                        console.log('failed to create banner');
                    }
                });
                return true;
            },
            showBanner: function (position) {
                if (!_bannerReady) {
                    console.log('banner not ready');
                    return this.prepareBanner(true);
                }

                if (position == undefined) position = _admob.AD_POSITION.BOTTOM_CENTER;
                _admob.showBanner(position);

                return true;
            },
            prepareInterstitial: function (bShow) {
                if (!_admob) return false;
                _admob.prepareInterstitial({
                    adId: _admobid.interstitial,
                    autoShow: bShow,
                    success: function () {
                        _interstitialReady = true;
                        console.log('interstitial prepared');
                    },
                    error: function () {
                        console.log('failed to prepare interstitial');
                    }
                });

                return true;
            },
            showInterstitial: function () {
                if (!_interstitialReady) {
                    console.log('interstitial not ready');
                    return this.prepareInterstitial(true);
                }

                _admob.showInterstitial();

                return true;
            },
            removeAds: function () {
                if (!_admob) return;
                _admob.removeBanner();
                _bannerReady = false;
            }
        }
    })
;

