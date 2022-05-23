const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const res = require('express/lib/response');
app.use(express.json());
app.use(cors());
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3gm7w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('database is connected');

async function run() {
  await client.connect();
  try {
    console.log('database is connected');
  } finally {

  }

}
run().catch(console.dir())

app.get('/', (req, res) => {
  res.send('The server is running....');
})
app.listen(port, () => {
  console.log('Server is okay');
})