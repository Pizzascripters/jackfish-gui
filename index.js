const express = require('express');
const http = require('http');

const app = express();

app.use(express.static('public'));

app.listen(4200, () => {
  console.log(`Hosting server on port 4200`);
});
