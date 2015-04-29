define(function (require) {
    'use strict';

    var $ = require('jquery'),
        bootstrapper = require('bootstrapper');

    if (!bootstrapper.csrf_token) {
        console.warn('bootstrapper.csrf_token is not set!');
    }

    // Set a header on every request with the current csrf token in it.
    $.ajaxPrefilter(function (options) {
        // The header should only be set when the request is local.
        if (!options.beforeSend && !options.crossDomain) {
            options.beforeSend = function (xhr) {
                // The csrf token is valid for the duration of the session,
                // so it's safe to use a static token.
                xhr.setRequestHeader('X-CSRF-TOKEN', bootstrapper.csrf_token);
            };
        }
    });
});
