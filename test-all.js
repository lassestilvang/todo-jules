const http = require('http');

async function testPost() {
  for(let i=0; i<105; i++) {
    const res = await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ name: 'test', type: 'inbox' }),
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`Request ${i}: ${res.status}`);
  }
}
testPost();
