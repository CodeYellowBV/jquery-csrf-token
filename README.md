# jquery-csrf-token

[![Build Status: Linux](https://api.travis-ci.org/CodeYellowBV/jquery-csrf-token.svg)](https://travis-ci.org/CodeYellowBV/jquery-csrf-token)

This package adds a csrf header to AJAX requests done via jQuery.

In the following situations no header is set:

- Cross Domain requests.
- Requests with type `GET`, `HEAD`, `OPTIONS`, or `TRACE`.

Laravel uses the `X-CSRF-TOKEN` header to check for a CSRF token. Django uses `X-CSRFToken`. This package defaults to `X-CSRF-TOKEN` for the header key, but you can change this using the config settings.

It's only dependency is on jQuery.

Installation:

```
$ npm install jquery-csrf-token --save
```

## Usage

```js
var csrfToken = require('jquery-csrf-token');

csrfToken.enable('my-beautiful-csrf-token', config);

csrfToken.setToken('updated-csrf-token');
```

## Config

| Name | Default | Description |
| ---- | ------- | ----------- |
| key  | X-CSRF-TOKEN | The key under which the csrf token should be send. Use `X-CSRFTOKEN` for Django. |
| retry  | false | Allow to get a new token if the current one is expired |


## Retry

To be able to get a new token if the current one expired you need to pass a retry object for the config with two keys:

* `url`: URL to request the new token
* `parseResponse`: A function that takes the token request response as a parameter and return the new token
* `isCSRFFailure` (optional): A function that takes the failed request response as a parameter and return true if it's a CSRF failure. By default it just retry on every 403.

Example:

```
    csrfToken.enable(data.csrf_token, {
        key: 'X-CSRFTOKEN',
        retry: {
            url: 'api/bootstrap/',
            parseResponse: resp => resp.csrf_token,
            isCSRFFailure: resp => resp.statusCode === 403 && resp.responseJSON.message === 'CSRFFailure',
        },
    });
```

## Changelog

### 2.0.0
- add option to retry if token is invalid
- use rollup build system

### 1.0.0
- Changed api to support changing the csrf token.
