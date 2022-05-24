const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const res = require('express/lib/response');
const jwt = require('jsonwebtoken');
app.use(express.json());
app.use(cors());
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3gm7w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log('database is connected');

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized' })
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' })
    }
    req.decoded = decoded;
    next();
  })
}

async function run() {
  try {
    await client.connect();
    console.log('database is connected');
    const cameraCollection = await client.db('products').collection('camera');
    const reviewCollection = await client.db('products').collection('review');
    const purchaseCollection = await client.db('products').collection('purchase');
    const usersCollection = await client.db('products').collection('users');

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
    app.get('/purchaseinfo', verifyJWT, async (req, res) => {
      const userEmail = req.query.userEmail;
      // const authorization = req.headers.authorization;
      const decodedEmail = req.decoded.email;
      if (decodedEmail === userEmail) {
        console.log('auth', authorization);
        const query = { userEmail: userEmail }
        const result = await purchaseCollection.find(query).toArray();
        return res.send(result);
      } else {
        return res.status(403).send({ message: 'Forbidden Access' })
      }
    })
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedUser = {
        $set: user
      }
      const result = await usersCollection.updateOne(filter, updatedUser, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ result, token });
    })
    app.put('/updatedUser/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const decodedEmail = req.decoded.email;
      if (email === decodedEmail) {
        const doc = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updatedDoc = {
          $set: doc
        }
        const result = await usersCollection.updateOne(filter, updatedDoc, options);
        return res.send(result);
      } else {
        return res.status(403).send({ message: 'Forbidden Access' });
      }
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