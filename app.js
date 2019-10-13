const express = require('express');

const app = express();

app.get('/', (req, res) => {
  return res.status(200).json({
    status: 'sucess',
    data: 'result'
  });
});

app.listen('3000', () => {
  console.log('Server is listening on port 3000');
});
