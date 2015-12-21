define(function (require) {
    'use strict';

    var $ = require('jquery');

    // Function ripped from Django docs.
    // See: https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
    function csrfSafeMethod (method) {
        // These HTTP methods do not require CSRF protection.
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    return function jqueryCsrfToken(token, config) {
        config || (config = {});

        if (!token) {
            console.warn('Csrf token is not set!');
        }

        if (!config.key) {
            config.key = 'X-CSRF-TOKEN';
        }

        // Set a header on every request with the current csrf token in it.
        $.ajaxPrefilter(function (options) {
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
        });
    };
});
