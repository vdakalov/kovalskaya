import http from 'http';

function request(index: number, userId: number, amount: number): void {
  const options: http.RequestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const data = JSON.stringify({ userId: 1, amount });
  const startedAt = performance.now();
  http
    .request('http://localhost:8080', options)
    .end(data)
    .on('response', response => {
      const chunks: Buffer[] = [];
      response
        .on('data', chunk => chunks.push(chunk))
        .on('end', () => {
          const json = Buffer.concat(chunks).toString();
          const data = json.length !== 0 ? JSON.parse(json) : undefined;
          console.log(new Date().toISOString(), {
            index,
            duration: performance.now() - startedAt,
            result: `${response.statusCode} ${response.statusMessage}`,
            data
          })
        });
    });
}


const count = 26;
const amount = 1;
const userId = 1;

for (let index = 0; index < count; index++) {
  request(index, userId, amount);
}
