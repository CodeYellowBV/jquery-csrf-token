const window = require('jsdom').jsdom().defaultView;
const $ = require('jquery')(window);
const C = require('./dist/jquery-csrf-token');
const describe = require('describe');

C.mockJQuery($);

C.enable('TOKTOK', {
    retry: {
        url: 'api/csrf_token',
        parseResponse: (data) => data,
    },
});

function mockSend(send) {
    $.ajaxTransport('+*', () => ({ send }));
}

describe('jquery-csrf-token', {
    'add a token for each POST request'() {
        mockSend(headers => {
            this.expect(headers['X-CSRF-TOKEN'], 'TOKTOK');
        });

        $.post({
            url: 'test',
            crossDomain: false, // node.js requests are detected as cross-domain by jquery
        });
    },
    'no token for a GET request'() {
        mockSend(headers => {
            this.expect(headers['X-CSRF-TOKEN'], null);
        });

        $.get({
            url: 'test',
            crossDomain: false, // node.js requests are detected as cross-domain by jquery
        });
    },
    'retry with new token if request return a 403'() {
        mockSend((headers, callback) => {
            // first request: invalid token
            if (headers['X-CSRF-TOKEN'] === 'TOKTOK') {
                callback(403, '', {});
            // second request: get a new token
            } else if (headers['X-CSRF-TOKEN'] === undefined) {
                callback(200, 'return dat token', { token: 'fresh_token' });
            // third request: try the same but with new token
            } else {
                this.expect(headers['X-CSRF-TOKEN'], 'fresh_token');
                callback(200, 'good good good', { data: 'world on fire' });
            }
        });

        $.post({
            url: 'test',
            crossDomain: false, // node.js requests are detected as cross-domain by jquery
        });
    },
});

describe.logResults();
