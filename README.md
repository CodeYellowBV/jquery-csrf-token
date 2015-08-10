# jquery-csrf-token

This package adds a `X-CSRF-TOKEN` and `X-CSRFToken` header to AJAX requests done via jQuery. No config options are added to keep this package as simple as possible to use.

In the following situations no header is set:

- Cross Domain requests.
- Requests with type `GET`, `HEAD`, `OPTIONS`, or `TRACE`.

Laravel uses the `X-CSRF-TOKEN` header to check for a CSRF token. Django uses `X-CSRFToken`.

It's only dependency is on jQuery.

## Usage

```js
var useCsrfToken = require('jquery-csrf-token');

useCsrfToken('my-beautiful-csrf-token');
```
