const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
dotenv.config()

const uri = process.env.MONGODB_URI;

const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json())


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


// middle ware JWT
const JWKS = createRemoteJWKSet(
    new URL('http://localhost:3000/api/auth/jwks')
);

const verifyToken = async (req, res, next) => {
    const authHeader = req?.headers?.authorization;
    if (!authHeader) {
        res.status(401).send({ message: 'You are not authorized' });
    }
    const token = authHeader.split(" ")[1]
    if (!token) {
        res.status(401).send({ message: 'You are not authorized' })
    }

    try {
        const { payload } = await jwtVerify(token, JWKS)
        console.log('payload:', payload);
        next()
    }
    catch (error) {
        res.status(403).send({ message: "Forbidden" })
    }
}

const run = async () => {
    try {
        // Connect the client to the server	
        await client.connect();

        // Destinations API
        const db = client.db('VoyentraDB');
        const destinationCollection = db.collection('destinations');
        const bookingsCollection = db.collection('bookings');

        app.get('/destinations', async (req, res) => {
            const result = await destinationCollection.find().toArray();
            res.send(result);
        });

        app.get('/destinations/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const result = await destinationCollection.findOne(query);
            res.send(result);
        });

        app.post('/destination',  verifyToken, async(req, res) => {
            const destinationDoc = req.body;

            const result = await destinationCollection.insertOne(destinationDoc);
            res.send(result);

        });

        app.patch('/destination/:id',  verifyToken, async(req, res) => {
            const id = req.params.id;
            const modifiedDestination = req.body;

            const filter = {
                _id: new ObjectId(id),
            };

            const updateDocument = {
                $set: modifiedDestination,
            }

            const result = await destinationCollection.updateOne(filter, updateDocument);
            res.send(result);

        })

        app.delete('/destination/:id', verifyToken, async(req, res) => {
            const id = req.params.id;
            const result = await destinationCollection.deleteOne({ _id: new ObjectId(id) })
            console.log('after delete:', result);
            res.send(result);
        })

        // Bookings API
        app.get('/booking/:userId', verifyToken, async (req, res) => {
            const userId = req.params.userId;
            const result = await bookingsCollection.find({ userId }).toArray();
            res.send(result);
        })

        app.post('/booking', verifyToken, async (req, res) => {
            const bookingData = req.body;
            const result = await bookingsCollection.insertOne(bookingData);
            res.send(result);
        })

        app.delete('/booking/:bookingId', verifyToken, async (req, res) => {
            const bookingId = req.params.bookingId;
            const filter = {
                _id: new ObjectId(bookingId)
            }
            const result = await bookingsCollection.deleteOne(filter);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('Hello from Voyentra Server');
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})

