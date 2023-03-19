angular.module('game.controllers', [])
    .controller('game', function ($scope, $rootScope, $ionicPlatform, $timeout, $ionicModal, $ionicPopup, AdMob, firebase) {
        var dot = $scope,
            fn = {};

        //  GAME OPTIONS
        dot.opt = {
            debug: false,
            gameStart: false,
            pause: false,
            gameColor: window.localStorage.getItem('color') || 'white',
            points: 25,
            status: 0,
            rotate: 0,
            speed: 1700,
            positions: ['top', 'right', 'bottom', 'left'],
            colors: ['black', 'gray'],
            gameColors: ['white', 'anim01', 'anim02', 'black', 'blue', 'pink']
        };
        dot.dotes = {
            speed: dot.opt.speed
        };
        dot.sound = {
            dots: document.getElementById('dots'),
            touch: document.getElementById('touch'),
            end: document.getElementById('end'),
            tap: document.getElementById('tap')
        };
        dot.user = {
            score: 0,
            level: 1,
            higScore: window.localStorage.getItem('higScore') || 0,
            higScoreOffline: window.localStorage.getItem('higScoreOffline') || 0,
            username: window.localStorage.getItem('username') || null
        };
        dot.users = [];

        //  MODAL
        dot.scoreModal = {
            open: function () {
                if (!dot.addScoreModal) {
                    $ionicModal.fromTemplateUrl('templates/modals/scoreList.html', {
                        scope: dot
                    }).then(function (modal) {
                        fn.getScore();
                        dot.addScoreModal = modal;
                        dot.addScoreModal.show();
                        dot.opt.pause = true;
                        dot.sound.tap.play();
                    });
                } else {
                    fn.getScore();
                    dot.addScoreModal.show();
                    dot.opt.pause = true;
                    dot.sound.tap.play();
                }
                fn.showBanner();
            },
            close: function () {
                dot.addScoreModal.hide();
            }
        };
        dot.$on('$destroy', function () {
            dot.addScoreModal && dot.addScoreModal.remove();
        });
        dot.$on('modal.hidden', function () {
            dot.start(false);
        });

        //  BACK BUTTON
        $ionicPlatform.registerBackButtonAction(function (e) {
            if (dot.opt.pause) {
                dot.start(false);
            } else {
                dot.opt.pause = true;
                $ionicPopup.confirm({
                    template: 'Game of Dots\'dan çıkmak istediğine emin misin?',
                    okText: 'Evet',
                    cancelText: 'Hayır'
                }).then(function (res) {
                    if (res) {
                        ionic.Platform.exitApp();
                    } else {
                        dot.start(false);
                    }
                });
            }
            e.preventDefault();
            return false;
        }, 100);

        // LEVEL UP EFFECT
        dot.$watch('user.level', function (newValue, oldValue) {
            if (newValue > oldValue) {
                dot.opt.levelScale = 'scale-effect';
                $timeout(function () {
                    dot.opt.levelScale = ''
                }, 1000)
            }
        });

        //  SCOPE FUNC
        dot.color = function () {
            var i = dot.opt.gameColors.indexOf(dot.opt.gameColor);
            if (i == dot.opt.gameColors.length - 1) {
                i = 0;
            } else {
                i = i + 1;
            }
            dot.opt.gameColor = dot.opt.gameColors[i];
            dot.opt.points = (dot.opt.gameColor == 'anim02' ? 50 : 25);
            window.localStorage.setItem('color', dot.opt.gameColor)
        };

        dot.pause = function () {
            dot.sound.tap.play();
            dot.opt.pause = true;
            $ionicPopup.alert({
                title: 'Nasıl Oynanır?',
                template: 'Ekrana dokunup siyah ve beyaz noktaları sağa veya sola çevirerek kenarlardan gelen diğer noktlar ile eşleştir.',
                okText: 'Anladım'
            }).then(function (res) {
                dot.start(false);
            })
        };

        dot.right = function () {
            dot.opt.rotate = dot.opt.rotate + 90;
            if (dot.opt.status == 3) {
                dot.opt.status = 0;
            } else {
                dot.opt.status = dot.opt.status + 1;
            }
        };

        dot.left = function () {
            dot.opt.rotate = dot.opt.rotate - 90;
            if (dot.opt.status == 0) {
                dot.opt.status = 3;
            } else {
                dot.opt.status = dot.opt.status - 1;
            }
        };

        // JS FUNC

        fn.showBanner = function () {
            var done = AdMob.showBanner();
            if (!done) {
                console.log("AdMob banner is not ready!")
            }
        };

        fn.removeBanner = function () {
            AdMob.removeAds();
        };

        fn.showInterstitial = function () {
            var done = AdMob.showInterstitial();
            if (!done) {
                console.log("AdMob interstitial is not ready!")
            }
        };

        fn.date = function (hour) {
            var d = new Date();
            var dec = function (data) {
                if (('' + data).length < 2) {
                    return '0' + data;
                } else {
                    return data
                }
            };

            return dec(d.getFullYear()) + '/' + dec(d.getMonth() + 1) + '/' + dec(d.getDate()) + (hour === true ? ' ' + dec(d.getHours()) + ':' + dec(d.getMinutes()) + ':' + dec(d.getSeconds()) : '');
        };

        fn.random = function (i) {
            return Math.round(Math.random() * i);
        };

        fn.getScore = function () {
            if ($rootScope.network) {
                dot.users = firebase.getScore();
            } else {
                dot.sound.tap.play();
                dot.opt.pause = true;
                $ionicPopup.alert({
                    title: 'Hata Oluştu!',
                    template: 'Skor tablosuna bağlanamıyorsunuz. Daha sonra tekrar deneyin.',
                    okText: 'Tamam'
                }).then(function (res) {
                    dot.scoreModal.close();
                })
            }
        };

        fn.setScore = function (username, higScoreOffline) {
            if ($rootScope.network) {
                // HigScore ==> Server
                fn.showInterstitial();
                var params = {
                    name: username || dot.user.username,
                    score: parseInt(higScoreOffline || dot.user.score),
                    date: fn.date(true),
                    device: (navigator.language + '/' + navigator.userAgent).replace(/ /g, '/')
                };
                firebase.checkScore(params).then(function (resp) {
                    if (resp === true) {
                        // Game > Server
                        firebase.setScore(params)
                    } else {
                        // Game < Server
                        dot.user.higScore = resp;
                        window.localStorage.setItem('higScore', dot.user.higScore);
                    }

                    if (higScoreOffline) {
                        // HigScore Update Remove
                        window.localStorage.removeItem('higScoreOffline');
                    } else {
                        fn.endGame();
                    }
                });
            } else {
                if (!higScoreOffline) {
                    // HigScore ==> Storage
                    dot.sound.tap.play();
                    dot.opt.pause = true;
                    window.localStorage.setItem('higScoreOffline', dot.user.score);
                    $ionicPopup.alert({
                        title: 'Hata Oluştu!',
                        template: 'İnternet bağlantısı yok!. Skorunuz şuan sunucuya kaydedilmeyecek.',
                        okText: 'Tamam'
                    }).then(function (res) {
                        fn.endGame();
                    })
                }
            }
        };

        fn.setUsername = function () {
            if ($rootScope.network) {
                $ionicPopup.show({
                    template: '<input user-name ng-model="user.username" type="text"/>',
                    title: 'Yeni Rekor',
                    subTitle: 'Kullanıcı adı gir ve skoru kaydet, diğer oyuncular arasına katıl!',
                    scope: dot,
                    buttons: [
                        {text: 'İptal'},
                        {
                            text: 'Kaydet',
                            type: 'button-positive',
                            onTap: function (e) {
                                if (!dot.user.username) {
                                    e.preventDefault();
                                } else {
                                    return dot.user.username;
                                }
                            }
                        }
                    ]
                }).then(function (res) {
                    if (res) {
                        var params = {
                            name: res,
                            device: (navigator.language + '/' + navigator.userAgent).replace(/ /g, '/')
                        };
                        firebase.checkName(params).then(function (resp) {
                            if (resp) {
                                window.localStorage.setItem('username', res);
                                fn.setScore(res);
                            } else {
                                dot.user.username = null;
                                alert("Bu kullanıcı adı daha önce kullanılmış, farklı kullanıcı adı dene.");
                                fn.setUsername();
                            }
                        })
                    } else {
                        fn.endGame();
                    }
                });
            } else {
                fn.endGame();
            }
        };

        fn.endGame = function () {
            dot.opt.pause = true;
            $ionicPopup.alert({
                title: 'Oyun Bitti',
                template: 'Yeni Skor : <b>' + dot.user.score + '</b> <br>En Yüksek Skor <b>' + (dot.user.higScore > dot.user.score ? dot.user.higScore : dot.user.score) + '</b>',
                okText: 'Yeniden Oyna'
            }).then(function (res) {
                dot.start(true, (dot.user.level < 4 ? 0 : 2000));
            });
        };

        fn.levelUpdate = function (score) {
            var scoreLevel = score / (dot.opt.points == 50 ? 400 : 200);
            if (scoreLevel && (scoreLevel + '').length === 1) {
                dot.user.level = Math.floor(scoreLevel) + 1;
                if (dot.user.level === 4) {
                    dot.opt.speed = 1700;
                } else if (dot.user.level > 4) {
                    dot.opt.speed = dot.opt.speed - 100;
                } else {
                    dot.opt.speed = dot.opt.speed - 200;
                }
            }
        };

        fn.action = function (time) {
            //  LEVEL UPDATE
            fn.levelUpdate(dot.user.score);

            //  RANDOM COLOR POSITION
            var position = dot.opt.positions[fn.random(3)];
            var color = dot.opt.colors[fn.random(1)];

            //  DOTES POSITION & SPEED
            dot.dotes.classA = color + ' ' + position;
            dot.dotes.speedA = time;
            $timeout(function () {
                dot.dotes.classA = dot.dotes.classA + ' center';
            }, 100);
            $timeout(function () {
                if (dot.opt.pause !== true) {
                    if (
                        dot.opt.debug
                        || (position + color == 'topblack' && dot.opt.status == 0)
                        || (position + color == 'topgray' && dot.opt.status == 2)
                        || (position + color == 'rightblack' && dot.opt.status == 1)
                        || (position + color == 'rightgray' && dot.opt.status == 3)
                        || (position + color == 'bottomblack' && dot.opt.status == 2)
                        || (position + color == 'bottomgray' && dot.opt.status == 0)
                        || (position + color == 'leftblack' && dot.opt.status == 3)
                        || (position + color == 'leftgray' && dot.opt.status == 1)
                    ) {
                        navigator.vibrate(50);
                        dot.sound.dots.play();
                        dot.user.score = dot.user.score + dot.opt.points;
                        fn.action(dot.opt.speed);
                        if (dot.user.score > dot.user.higScore) {
                            window.localStorage.setItem('higScore', dot.user.score)
                        }
                    } else {
                        navigator.vibrate([200, 200, 200]);
                        dot.sound.end.play();
                        if (dot.user.score > dot.user.higScore) {
                            if (dot.user.username === null) {
                                fn.setUsername();
                            } else {
                                fn.setScore()
                            }
                        } else {
                            fn.endGame();
                        }
                    }
                }
            }, time + 100);

            // LEVEL 4
            if (dot.user.level >= 4) {
                $timeout(function () {
                    var position = dot.opt.positions[fn.random(3)];
                    var color = dot.opt.colors[fn.random(1)];
                    //  DOTES POSITION & SPEED
                    dot.dotes.classB = color + ' ' + position;
                    dot.dotes.speedB = time;
                    $timeout(function () {
                        dot.dotes.classB = dot.dotes.classB + ' center';
                    }, 100);
                    $timeout(function () {
                        if (dot.opt.pause !== true) {
                            if (
                                dot.opt.debug
                                || (position + color == 'topblack' && dot.opt.status == 0)
                                || (position + color == 'topgray' && dot.opt.status == 2)
                                || (position + color == 'rightblack' && dot.opt.status == 1)
                                || (position + color == 'rightgray' && dot.opt.status == 3)
                                || (position + color == 'bottomblack' && dot.opt.status == 2)
                                || (position + color == 'bottomgray' && dot.opt.status == 0)
                                || (position + color == 'leftblack' && dot.opt.status == 3)
                                || (position + color == 'leftgray' && dot.opt.status == 1)
                            ) {
                                navigator.vibrate(50);
                                dot.sound.dots.play();
                                dot.user.score = dot.user.score + dot.opt.points;
                                if (dot.user.higScore < dot.user.score) {
                                    window.localStorage.setItem('higScore', dot.user.score)
                                }
                                fn.levelUpdate(dot.user.score);
                            } else {
                                navigator.vibrate([200, 200, 200]);
                                dot.sound.end.play();
                                if (dot.user.higScore < dot.user.score) {
                                    if (dot.user.username == null) {
                                        fn.setUsername();
                                    } else {
                                        fn.setScore()
                                    }
                                } else {
                                    fn.endGame();
                                }
                            }
                        }
                    }, time + 100);
                }, dot.opt.speed / 2)

            }

        };

        //GAME START
        dot.start = function (reset, time) {
            if (reset === true) {
                dot.opt.status = 0;
                dot.opt.rotate = 0;
                dot.opt.speed = 1700;
                dot.opt.points = (dot.opt.gameColor == 'anim02' ? 50 : 25);
                dot.user.score = 0;
                dot.user.level = 1;
                dot.user.higScore = window.localStorage.getItem('higScore');
                dot.user.higScoreOffline = window.localStorage.getItem('higScoreOffline');
                if (dot.user.higScoreOffline) fn.setScore(null, dot.user.higScoreOffline);
            }
            dot.dotes.classA = '';
            dot.dotes.classB = '';

            // ADMOB REMOVE
            fn.removeBanner();
            $timeout(function () {
                dot.opt.pause = false;
                fn.action(dot.opt.speed);
            }, time || 0);
        };

        $timeout(function () {
            dot.gameStart = true;
            dot.start(true);
        }, 1000);
    })
;