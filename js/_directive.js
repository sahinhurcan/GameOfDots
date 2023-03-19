angular.module('game.directives', [])
    .directive('userName', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                function parser(value) {
                    if (value) {
                        var x = value.replace(/ /g, '_').replace(/[^a-zA-Z0-9sçÇöÖşŞıİğĞüÜ_]/g, '').substring(0, 20).toLowerCase();
                        ngModel.$setViewValue(x);
                        ngModel.$render();
                        return x;
                    }
                }

                ngModel.$parsers.push(parser);
            }
        }
    })
;