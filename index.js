const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ahb3gps.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db("furniro").collection("products");

    app.get("/products", async (req, res) => {
      const limit = parseInt(req.query.limit);
      const result = await productCollection.find().limit(limit).toArray();
      res.send(result);
    });

    // load products based on category
    app.get("/products/:category", async (req, res) => {
      const category = req.params.category;
      let result;
      if (category == "default") {
        result = await productCollection.find().toArray();
      } else {
        const query = { product_type: category };
        result = await productCollection.find(query).toArray();
      }
      res.send(result);
    });

    // find similar products by category excluding current selected product
    app.get("/related", async (req, res) => {
      const { name, category } = req.query;
      const query = {
        product_name: { $ne: name }, //"ne" means "not equal"  this will exclude this product
        product_type: category,
      };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
