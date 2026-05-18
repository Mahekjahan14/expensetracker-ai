const fs = require('fs');
const http = require('http');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const data = '--' + boundary + '\r\n'
           + 'Content-Disposition: form-data; name="image"; filename="dummy.png"\r\n'
           + 'Content-Type: image/png\r\n\r\n';

const endData = '\r\n--' + boundary + '--\r\n';

const fileData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

const payload = Buffer.concat([
  Buffer.from(data, 'utf8'),
  fileData,
  Buffer.from(endData, 'utf8')
]);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/expenses/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': payload.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', (e) => console.error('Error:', e));
req.write(payload);
req.end();
