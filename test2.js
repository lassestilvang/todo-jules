fetch('http://localhost:3000/api/tasks', {
  method: 'GET',
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch((error) => console.error('Error:', error));
