angular.module('game.directives', [])
    .directive('userName', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                function parser(value) {
                    if (value) {
                        // Sanitize input: remove spaces, allow only alphanumeric and Turkish characters
                        // Limit to 20 characters to prevent buffer overflow or display issues
                        var x = value.replace(/ /g, '_')
                            .replace(/[^a-zA-Z0-9sçÇöÖşŞıİğĞüÜ_]/g, '')
                            .substring(0, 20)
                            .toLowerCase();
                        
                        // Additional security: prevent empty or whitespace-only usernames
                        if (x.replace(/_/g, '').length === 0) {
                            x = '';
                        }
                        
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