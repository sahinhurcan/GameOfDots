angular.module('game.directives', ['game.utils'])
    .directive('userName', function (SecurityUtils) {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                function parser(value) {
                    if (value) {
                        var sanitized = SecurityUtils.sanitizeUsername(value);
                        ngModel.$setViewValue(sanitized);
                        ngModel.$render();
                        // Explicitly handle empty string case
                        return sanitized;
                    } else {
                        // Explicitly return empty string for falsy input
                        return '';
                    }
                }

                ngModel.$parsers.push(parser);
            }
        }
    })
;