const window = require('jsdom').jsdom().defaultView;
const $ = require('jquery')(window);
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
    $.ajaxTransport('+*', () => ({ send }));
}

test('add a token for each POST request', (t) => {
    mockSend(headers => {
        t.is(headers['X-CSRF-TOKEN'], 'TOKTOK');
    });

    $.post({
        url: 'test',
        crossDomain: false, // node.js requests are detected as cross-domain by jquery
    });
});

test('no token for a GET request', (t) => {
    mockSend(headers => {
        t.is(headers['X-CSRF-TOKEN'], undefined);
    });

    $.get({
        url: 'test',
        crossDomain: false, // node.js requests are detected as cross-domain by jquery
    });
});

test('retry with new token if request return a 403', (t) => {
    mockSend((headers, callback) => {
        // first request: invalid token
        if (headers['X-CSRF-TOKEN'] === 'TOKTOK') {
            callback(403, '', {});
        // second request: get a new token
        } else if (headers['X-CSRF-TOKEN'] === undefined) {
            callback(200, 'return dat token', { token: 'fresh_token' });
        // third request: try the same but with new token
        } else {
            t.is(headers['X-CSRF-TOKEN'], 'fresh_token');
            callback(200, 'good good good', { data: 'world on fire' });
        }
    });

    $.post({
        url: 'test',
        crossDomain: false, // node.js requests are detected as cross-domain by jquery
    });
});
