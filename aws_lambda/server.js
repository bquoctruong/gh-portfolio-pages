// // 'use strict';
// const fs = require('fs');
// const path = require('path');
// const express = require('express');
// const app = express();

// // Lambda handler function
// export const handler = async (event) => {

//   app.use(express.static(path.join(__dirname, 'assets')));

//   app.get('/', async(req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
//   });

//   app.listen(8080, () => {
//     console.log("Server successfully running on port 8080");
//   });
//   // let response;
//   // const filePath = path.join(__dirname, 'index.html');
  
//   // try {
//   //   const fileContent = fs.readFileSync(filePath, 'utf8');
//   //   response = {
//   //     statusCode: 200,
//   //     headers: {
//   //       'Content-Type': 'text/html',
//   //     },
//   //     body: fileContent,
//   //   };
//   // } catch (err) {
//   //   response = {
//   //     statusCode: 500,
//   //     body: 'Internal Server Error',
//   //   };
//   // }

//   // return response;
// };

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
  
app.get('/', function(req, res) {  
  res.sendFile('/var/task/index.html');
});  
  
app.listen(port, () => {  
  console.log(`Example app listening on port ${port}`);
})