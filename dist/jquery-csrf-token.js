(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery')) :
    typeof define === 'function' && define.amd ? define('jquery-csrf-token', ['exports', 'jquery'], factory) :
    (factory((global.jqueryCSRFToken = global.jqueryCSRFToken || {}),global.$));
}(this, function (exports,$) { 'use strict';

    $ = 'default' in $ ? $['default'] : $;

    const config = {};
    let token = null;

    // Function ripped from Django docs.
    // See: https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
    function csrfSafeMethod(method) {
        // These HTTP methods do not require CSRF protection.
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method)
        );
    }

    function csrfPrefilter(options, ...args) {
        // The header should only be set when the request is local.
        if (!csrfSafeMethod(options.type) && !options.crossDomain) {
            const oldBeforeSend = options.beforeSend;
            options.beforeSend = function (xhr) {
                // The csrf token is valid for the duration of the session,
                // so it's safe to use a static token.
                xhr.setRequestHeader(config.key, token);
                if (oldBeforeSend) {
                    oldBeforeSend(...args);
                }
            };
        }
    }

    function setToken(newToken) {
        token = newToken;
    }

    function enable(newToken, newConfig) {
        newConfig || (newConfig = {});

        if (!newToken) {
            console.warn('CSRF token is not set!');
        }

        if (!newConfig.key) {
            newConfig.key = 'X-CSRF-TOKEN';
        }

        config.key = newConfig.key;

        setToken(newToken);

        // Set a header on every request with the current csrf token in it.
        $.ajaxPrefilter(csrfPrefilter);
    }

    function disable() {
        // TODO: Does nothing yet...
    }

    exports.setToken = setToken;
    exports.enable = enable;
    exports.disable = disable;

    Object.defineProperty(exports, '__esModule', { value: true });

}));