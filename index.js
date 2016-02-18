define(function (require) {
    'use strict';

    var $ = require('jquery');
    var config = {};
    var token = null;

    // Function ripped from Django docs.
    // See: https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
    function csrfSafeMethod (method) {
        // These HTTP methods do not require CSRF protection.
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    function csrfPrefilter (options) {
        // The header should only be set when the request is local.
        if (!csrfSafeMethod(options.type) && !options.crossDomain) {
            var oldBeforeSend = options.beforeSend;
            options.beforeSend = function (xhr) {
                // The csrf token is valid for the duration of the session,
                // so it's safe to use a static token.
                xhr.setRequestHeader(config.key, token);
                if (oldBeforeSend) {
                    oldBeforeSend.apply(this, arguments);
                }
            };
        }
    }

    return {
        enable: function (newToken, newConfig) {
            newConfig || (newConfig = {});

            if (!newToken) {
                console.warn('Csrf token is not set!');
            }

            if (!newConfig.key) {
                newConfig.key = 'X-CSRF-TOKEN';
            }

            config.key = newConfig.key;

            this.setToken(newToken);

            // Set a header on every request with the current csrf token in it.
            $.ajaxPrefilter(csrfPrefilter);
        },
        disable: function () {
            // Does nothing yet...
        },
        setToken: function (newToken) {
            token = newToken;
        }
    };
});
