define(function (require) {
    'use strict';

    var $ = require('jquery'),
        bootstrapper = require('bootstrapper');

    if (!bootstrapper.csrf_token) {
        console.warn('bootstrapper.csrf_token is not set!');
    }

    // Function ripped from Django docs.
    // See: https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
    function csrfSafeMethod (method) {
        // These HTTP methods do not require CSRF protection.
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    // Set a header on every request with the current csrf token in it.
    $.ajaxPrefilter(function (options) {
        // The header should only be set when the request is local.
        if (!csrfSafeMethod(options.type) && !options.crossDomain) {
            options.beforeSend = function (xhr) {
                // The csrf token is valid for the duration of the session,
                // so it's safe to use a static token.
                xhr.setRequestHeader('X-CSRF-TOKEN', bootstrapper.csrf_token); // Laravel
                xhr.setRequestHeader('X-CSRFToken', bootstrapper.csrf_token); // Django
            };
        }
    });
});
