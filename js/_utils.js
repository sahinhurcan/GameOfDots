// Utility functions for the Game of Dots application

angular.module('game.utils', [])
    .factory('SecurityUtils', function () {
        return {
            /**
             * Sanitizes username input to prevent injection attacks
             * @param {string} username - The username to sanitize
             * @returns {string} Sanitized username or empty string if invalid
             */
            sanitizeUsername: function (username) {
                if (!username || typeof username !== 'string') {
                    return '';
                }
                
                // Remove spaces, allow only alphanumeric and Turkish characters
                // Limit to 20 characters to prevent buffer overflow or display issues
                var sanitized = username.replace(/ /g, '_')
                    .replace(/[^a-zA-Z0-9sçÇöÖşŞıİğĞüÜ_]/g, '')
                    .substring(0, 20)
                    .toLowerCase();
                
                // Prevent empty or whitespace-only usernames
                if (sanitized.replace(/_/g, '').length === 0) {
                    return '';
                }
                
                return sanitized;
            },
            
            /**
             * Validates username format
             * @param {string} username - The username to validate
             * @returns {boolean} True if valid, false otherwise
             */
            isValidUsername: function (username) {
                var sanitized = this.sanitizeUsername(username);
                return sanitized.length > 0;
            }
        };
    });
