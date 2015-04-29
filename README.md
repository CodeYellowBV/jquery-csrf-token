# jquery-csrf-token

This package adds a `X-CSRF-TOKEN` header to AJAX requests done via jQuery. No config options are added to keep this package as simple as possible to use.

In the following situations no header is set:

- Cross Domain requests.
- Requests with type `GET`, `HEAD`, `OPTIONS`, or `TRACE`.

Laravel uses this header to check for a CSRF token. Django uses `X-CSRFToken`, so this should be changed to `X-CSRF-TOKEN`.

It has a dependency on jQuery and `bootstrapper`;

Meaning this should work:

```js
var bootstrapper = require('bootstrapper');
console.log(bootstrapper.csrf_token); // Should return current csrf token.
```

## Usage

```js
require('jquery-csrf-token');
```
