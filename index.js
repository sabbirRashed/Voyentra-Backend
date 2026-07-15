const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config()

const uri = process.env.MONGODB_URI;

const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());


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

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } 
    finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('Hello from Voyentra Server');
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})

