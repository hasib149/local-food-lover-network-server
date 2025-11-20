const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = 3000;
const cors = require("cors");

app.use(express.json());
app.use(cors());

const uri =
  "mongodb+srv://localFoodLover:FcZ7franttWdwOqU@cluster0.wxainhe.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("LocalFood");
    const foodCollection = db.collection("FoodDetails");
    const reviewCollection = db.collection("review");

    app.get("/high-rating-food", async (req, res) => {
      const result = await foodCollection
        .find()
        .sort({ rating: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/high-rating-food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    app.get("/review", async (req, res) => {
      const result = await reviewCollection
        .find()
        .sort({ reviewDate: -1 })
        .toArray();
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const newreview = req.body;
      const result = await reviewCollection.insertOne(newreview);
      res.send(result);
    });

    app.get("/reviewUser", async (req, res) => {
      const email = req.query.email;
      const reviews = await reviewCollection
        .find({
          userEmail: email,
        })
        .toArray();
      res.send(reviews);
    });

    app.delete("/reviewUser/:id", async (req, res) => {
      const id = req.params.id;
      const result = await reviewCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    app.put("/reviewUser/:id", async (req, res) => {
      const id = req.params.id;
      const updatedReview = req.body;

      const result = await reviewCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedReview }
      );

      res.send(result);
    });

    app.get("/reviewUser/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });
    

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World! i am");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
