const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        app.get('/destinations/:id', async (req, res, next) => {
            const token = req.headers.authorization;
            console.log('secret:', token);

            
            next()

        }, async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const result = await destinationCollection.findOne(query);
            res.send(result);
        });

        app.post('/destination', async (req, res) => {
            const destinationDoc = req.body;

            const result = await destinationCollection.insertOne(destinationDoc);
            res.send(result);

        });

        app.patch('/destination/:id', async (req, res) => {
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

        app.delete('/destination/:id', async (req, res) => {
            const id = req.params.id;
            const result = await destinationCollection.deleteOne({ _id: new ObjectId(id) })
            console.log('after delete:', result);
            res.send(result);
        })

        // Bookings API
        app.get('/booking/:userId', async (req, res) => {
            const userId = req.params.userId;
            const result = await bookingsCollection.find({ userId }).toArray();
            res.send(result);
        })

        app.post('/booking', async (req, res) => {
            const bookingData = req.body;
            const result = await bookingsCollection.insertOne(bookingData);
            res.send(result);
        })

        app.delete('/booking/:bookingId', async (req, res) => {
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

