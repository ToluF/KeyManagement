// polyfills.js
if (typeof btoa === 'undefined') {
    global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
  
if (typeof ReadableStream === 'undefined') {
    global.ReadableStream = require('stream/web').ReadableStream;
}

if (typeof Blob === 'undefined') {
    global.Blob = require('buffer').Blob;
}

const { fetch, Headers, Request, Response } = require('undici');
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
