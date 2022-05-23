const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const cameraCollection = await client.db('products').collection('camera');
    const reviewCollection = await client.db('products').collection('review');
    const purchaseCollection = await client.db('products').collection('purchase');

    app.get('/camera', async (req, res) => {
      const result = await cameraCollection.find().toArray();
      res.send(result);
    })
    app.get('/camera/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cameraCollection.findOne(query);
      res.send(result);
    })
    app.get('/review', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })
    app.post('/purchaseinfo', async (req, res) => {
      const order = req.body;
      const result = await purchaseCollection.insertOne(order);
      res.send(result);
    })
  } finally {

  }

}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('The server is running....');
})
app.listen(port, () => {
  console.log('Server is okay');
})