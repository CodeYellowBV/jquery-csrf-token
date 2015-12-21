# jquery-csrf-token

This package adds a csrf header to AJAX requests done via jQuery.

In the following situations no header is set:

- Cross Domain requests.
- Requests with type `GET`, `HEAD`, `OPTIONS`, or `TRACE`.

Laravel uses the `X-CSRF-TOKEN` header to check for a CSRF token. Django uses `X-CSRFToken`. This package defaults to `X-CSRF-TOKEN` for the header key, but you can change this using the config settings.

It's only dependency is on jQuery.

## Usage

```js
var useCsrfToken = require('jquery-csrf-token');

useCsrfToken('my-beautiful-csrf-token', config);
```


### Config

| name | default | description |
|-|-|-|
| key  | X-CSRF-TOKEN | The key under which the csrf token should be send. Use `X-CSRFTOKEN` for Django.
