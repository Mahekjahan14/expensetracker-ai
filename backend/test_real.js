const fs = require('fs');
const http = require('http');

http.get('http://www.w3.org/People/mimasa/test/imgformat/img/w3c_home.jpg', (res) => {
  let data = [];
  res.on('data', chunk => data.push(chunk));
  res.on('end', () => {
    const fileData = Buffer.concat(data);
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const postData = '--' + boundary + '\r\n'
               + 'Content-Disposition: form-data; name="image"; filename="receipt.jpg"\r\n'
               + 'Content-Type: image/jpeg\r\n\r\n';
    const endData = '\r\n--' + boundary + '--\r\n';

    const payload = Buffer.concat([
      Buffer.from(postData, 'utf8'),
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

    const req = http.request(options, (res2) => {
      let body = '';
      res2.on('data', chunk => body += chunk);
      res2.on('end', () => console.log('Response:', res2.statusCode, body));
    });

    req.on('error', (e) => console.error('Error:', e));
    req.write(payload);
    req.end();
  });
});
