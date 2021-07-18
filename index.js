require('dotenv').config()
const server = require('./api/server.js');

const PORT = process.env.PORT || 3300;

server.listen(PORT, () => {
  if(PORT === 3300){
    console.log((`SET UP ENV Listening on port ${PORT}...`))
  } else {
    console.log(`Listening on port ${PORT}`)
  }
})