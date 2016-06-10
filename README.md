# jquery-csrf-token

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


## Changelog

### 2.0.0
- add option to retry if token is invalid
- use rollup build system

### 1.0.0
- Changed api to support changing the csrf token.
