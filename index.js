const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
require('dotenv').config()
const { decode } = require('jsonwebtoken');
const app = express();
const cors = require('cors')
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors())


function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }

    const token = authHeader?.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbbiden' })
        }
        req.decoded = decoded;

    })
    next()
}

const uri = `mongodb+srv://${process.env.DB_userName}:${process.env.SECRET_KEY_mongoDB}@cluster0.ef9qe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri);
async function run() {

    try {
        await client.connect();
        console.log("db connected");
        const inventoryCollection = client.db('bikes').collection("items");
        app.get('/inventories', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        //lkn;vowroifwiojkmceriowweiiek
        //lwfnkowernckodnvioeronsdklnvjoer
        app.post('/login', (req, res) => {
            const email = req.body

            const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
            res.send(accessToken)
        })
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await inventoryCollection.findOne(query);
            res.send(product);
        })
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        })
        app.post("/inventories", async (req, res) => {
            const doc = req.body;
            const result = await inventoryCollection.insertOne(doc);
            res.send(result)
        })
        app.get('/my-items', verifyToken, async (req, res) => {
            const decodedEmail = req.decoded?.email

            const email = req.query.email;

            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = inventoryCollection.find(query);
                const result = await cursor.toArray();
                res.send(result)
            }
            else {
                res.status(403).send({ message: 'Forbbiden' })
            }




        })
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: data.quantity
                },

            };

            const result = await inventoryCollection.updateOne(filter, updateDoc, options);
            res.send(result)

        })
    }
    finally {

    }
}

run().catch(console.dir);
app.get('/', (req, res) => {
    res.send("running server")
})

app.listen(port, () => {
    console.log(` listening on port ${port}`)
})