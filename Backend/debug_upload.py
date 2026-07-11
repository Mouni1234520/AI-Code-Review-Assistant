import uuid
import urllib.request

boundary = '----WebKitFormBoundary' + uuid.uuid4().hex
body = []
body.append('--' + boundary)
body.append('Content-Disposition: form-data; name="file"; filename="sample.py"')
body.append('Content-Type: text/plain')
body.append('')
body.append('print(1)\n')
body.append('--' + boundary + '--')
data = '\r\n'.join(body).encode('utf-8')
req = urllib.request.Request(
    'http://127.0.0.1:5000/upload',
    data=data,
    method='POST',
    headers={'Content-Type': 'multipart/form-data; boundary=' + boundary}
)
with urllib.request.urlopen(req) as resp:
    print(resp.status)
    print(resp.read().decode())
