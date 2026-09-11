fetch('http://localhost:3000/api/lists', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Long List Name That Will Truncate In The',
    color: '#000000',
    emoji: '📝',
  }),
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch((error) => console.error('Error:', error));
