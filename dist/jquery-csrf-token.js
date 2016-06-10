(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery')) :
  typeof define === 'function' && define.amd ? define('jquery-csrf-token', ['exports', 'jquery'], factory) :
  (factory((global.jqueryCSRFToken = global.jqueryCSRFToken || {}),global.$));
}(this, function (exports,$) { 'use strict';

  $ = 'default' in $ ? $['default'] : $;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  var config = {};
  var token = null;

  // Function ripped from Django docs.
  // See: https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
  function csrfSafeMethod(method) {
      // These HTTP methods do not require CSRF protection.
      return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method)
      );
  }

  function csrfPrefilter(options) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
      }

      // The header should only be set when the request is local.
      if (!csrfSafeMethod(options.type) && !options.crossDomain) {
          (function () {
              var oldBeforeSend = options.beforeSend;
              options.beforeSend = function (xhr) {
                  // The csrf token is valid for the duration of the session,
                  // so it's safe to use a static token.
                  xhr.setRequestHeader(config.key, token);
                  if (oldBeforeSend) {
                      oldBeforeSend.apply(undefined, args);
                  }
              };
          })();
      }
  }

  function setToken(newToken) {
      token = newToken;
  }

  /* Patch $.ajax to support expired CSRF tokens */
  function addRetrySupport(retryURL, getToken) {
      var originalAjax = $.ajax;

      /**
       * Copy properties from jqXhrToCopy to fakeJqXhr. This is makes fakeJqXhr
       * behave properly.
       */
      function fakeJqXhrInheritance(fakeJqXhr, jqXhrToCopy) {
          fakeJqXhr.readyState = jqXhrToCopy.readyState;
          fakeJqXhr.status = jqXhrToCopy.status;
          fakeJqXhr.statusText = jqXhrToCopy.statusText;
          fakeJqXhr.responseXML = jqXhrToCopy.responseXML;
          fakeJqXhr.responseText = jqXhrToCopy.responseText;
          fakeJqXhr.responseJSON = jqXhrToCopy.responseJSON;
          fakeJqXhr.getResponseHeader = jqXhrToCopy.getResponseHeader.bind(jqXhrToCopy);
          fakeJqXhr.getAllResponseHeaders = jqXhrToCopy.getAllResponseHeaders.bind(jqXhrToCopy);
          fakeJqXhr.setRequestHeader = jqXhrToCopy.setRequestHeader.bind(jqXhrToCopy);
          fakeJqXhr.overrideMimeType = jqXhrToCopy.overrideMimeType.bind(jqXhrToCopy);
          fakeJqXhr.statusCode = jqXhrToCopy.statusCode.bind(jqXhrToCopy);
          fakeJqXhr.abort = jqXhrToCopy.abort.bind(jqXhrToCopy);
      }

      /**
       * Patch $.ajax to support expired csrf tokens. If a request is made and the
       * token is expired, then a new  token is fetched from the server. The original
       * request will be run again with the new token.
       *
       * For the outside world only 1 request is send, but depending on the situation
       * at most 3 request can be executed.
       */
      $.ajax = function (url, options) {
          var pResult = $.Deferred(); // eslint-disable-line new-cap
          var fakeJqXhr = pResult.promise();

          if ((typeof url === 'undefined' ? 'undefined' : _typeof(url)) === 'object') {
              options = url;
              url = undefined;
          } else {
              options.url = url;
          }

          // The original ajax request might have success or error callbacks. We want
          // to trigger them manually based on if there is a csrf token mismatch.
          var success = options.success;
          var error = options.error;
          delete options.success;
          delete options.error;

          // Fire the first try!
          var xhrFirstTry = originalAjax(options);

          xhrFirstTry.error(function (jqXHR, textStatus, errorThrown) {
              if (jqXHR.status === 403) {
                  // We assume that a csrf token mismatch happend, so fetch a new
                  // token and retry with the correct token.
                  originalAjax(retryURL).done(function (data) {
                      setToken(getToken(data));
                      var xhrSecondTry = null;

                      options.success = function (dataSecondSuccess, textStatusSecondSuccess, jqXHRSecondSuccess) {
                          fakeJqXhrInheritance(fakeJqXhr, xhrSecondTry);
                          if (typeof success === 'function') success(dataSecondSuccess, textStatusSecondSuccess, jqXHRSecondSuccess);
                          pResult.resolve(dataSecondSuccess, textStatusSecondSuccess, jqXHRSecondSuccess);
                      };

                      options.error = function (jqXHRSecondError, textStatusSecondError, errorThrownSecondError) {
                          fakeJqXhrInheritance(fakeJqXhr, xhrSecondTry);
                          if (typeof error === 'function') error(jqXHRSecondError, textStatusSecondError, errorThrownSecondError);
                          pResult.reject(jqXHRSecondError, textStatusSecondError, errorThrownSecondError);
                      };

                      xhrSecondTry = originalAjax(options);
                      fakeJqXhrInheritance(fakeJqXhr, xhrSecondTry);
                  });
              } else {
                  // Some other error happend, so just pass it through.
                  fakeJqXhrInheritance(fakeJqXhr, xhrFirstTry);
                  if (typeof error === 'function') error(jqXHR, textStatus, errorThrown);
                  pResult.reject(jqXHR, textStatus, errorThrown);
              }
          });

          // Upon success, update our fakeJqXhr and trigger the success callback.
          xhrFirstTry.success(function (data, textStatus, jqXHR) {
              fakeJqXhrInheritance(fakeJqXhr, xhrFirstTry);
              if (typeof success === 'function') success(data, textStatus, jqXHR);

              pResult.resolve(data, textStatus, jqXHR);
          });

          fakeJqXhrInheritance(fakeJqXhr, xhrFirstTry);

          return fakeJqXhr;
      };
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

      if (newConfig.retry) {
          addRetrySupport(newConfig.retry.url, newConfig.retry.getToken);
      }

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