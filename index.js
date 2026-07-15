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

        const db = client.db('VoyentraDB');
        const destinationCollection = db.collection('destinations');

        app.get('/destinations', async (req, res) => {
            const result = await destinationCollection.find().toArray();
            res.send(result);
        })

        app.get('/destinations/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const result = await destinationCollection.findOne(query);
            res.send(result);
        })

        app.post('/destination', async (req, res) => {
            const destinationDoc = req.body;
            console.log(destinationDoc);
            const result = await destinationCollection.insertOne(destinationDoc);

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

