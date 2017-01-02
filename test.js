const window = require('jsdom').jsdom().defaultView;
const $ = require('jquery')(window);

const originalAjax = $.ajax;

// Ovewrite so we can check that customFunction is still available later on.
$.ajax = function (...args) {
    const xhr = originalAjax.apply($, args);

    xhr.customFunction = function () {
        // Nop.
    };

    return xhr;
};

const C = require('./dist/jquery-csrf-token');
C.mockJQuery($);

const test = require('ava');

C.enable('TOKTOK', {
    retry: {
        url: 'api/csrf_token',
        parseResponse: (data) => data,
    },
});

function mockSend(send) {
    $.ajaxTransport('+*', (options) => ({ send: send.bind(null, options) }));
}

test('add a token for each POST request', (t) => {
    mockSend((options, headers) => {
        t.is(headers['X-CSRF-TOKEN'], 'TOKTOK');
    });

    $.post({
        url: 'test',
        crossDomain: false, // node.js requests are detected as cross-domain by jquery
    });
});

test('no token for a GET request', (t) => {
    mockSend((options, headers) => {
        t.is(headers['X-CSRF-TOKEN'], undefined);
    });

    $.get({
        url: 'test',
        crossDomain: false, // node.js requests are detected as cross-domain by jquery
    });
});

// See isse #5.
test('adding custom function to $.ajax', (t) => {
    const xhr = $.post({
        url: 'test',
        crossDomain: false, // node.js requests are detected as cross-domain by jquery
    });

    t.true(typeof xhr.customFunction === 'function');
});


test('retry with new token if request return a 403', (t) => {
    mockSend((options, headers, callback) => {
        // first request: invalid token
        if (headers['X-CSRF-TOKEN'] === 'TOKTOK') {
            t.is(options.url, 'test');
            t.is(options.type, 'POST');
            callback(403, '', {});
        // second request: get a new token
        } else if (headers['X-CSRF-TOKEN'] === undefined) {
            t.is(options.url, 'api/csrf_token');
            t.is(options.type, 'GET');
            callback(200, 'return dat token', { token: 'fresh_token' });
        // third request: try the same but with new token
        } else {
            t.is(options.url, 'test');
            t.is(options.type, 'POST');
            t.is(headers['X-CSRF-TOKEN'], 'fresh_token');
            callback(200, 'good good good', { data: 'world on fire' });
        }
    });

    $.post({
        url: 'test',
        crossDomain: false, // node.js requests are detected as cross-domain by jquery
    });
});
