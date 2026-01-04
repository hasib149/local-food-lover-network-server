const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = 3000;
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.wxainhe.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("LocalFood");
    const foodCollection = db.collection("FoodDetails");
    const reviewCollection = db.collection("review");
    const fevoriteCollecion = db.collection("fevorite");

    app.get("/high-rating-food", async (req, res) => {
      const result = await reviewCollection
        .find()
        .sort({
          starRating: -1,
        })
        .limit(7)
        .toArray();
      res.send(result);
    });

    app.post("/favorites", async (req, res) => {
      const favorite = req.body;
      const result = await fevoriteCollecion.insertOne(favorite);
      res.send(result);
    });

    app.get("/favorites", async (req, res) => {
      const email = req.query.email;
      const reviews = await fevoriteCollecion
        .find({
          userEmail: email,
        })
        .toArray();
      res.send(reviews);
    });

    app.get("/high-rating-food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.findOne(query);
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

    app.get("/search", async (req, res) => {
      try {
        const search = req.query.search?.trim();
        const location = req.query.location?.trim();
        const starRating = req.query.starRating ? req.query.starRating : null;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        let query = {};

        if (search) {
          query.$or = [
            { foodName: { $regex: search, $options: "i" } },
            { restaurant: { $regex: search, $options: "i" } },
          ];
        }

        if (location) {
          query.location = { $regex: location, $options: "i" };
        }

        if (starRating !== null) {
          query.starRating = starRating;
        }

        const totalItems = await reviewCollection.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        const results = await reviewCollection
          .find(query)
          .skip(skip)
          .limit(limit)
          .toArray();

        res.send({
          page,
          totalPages,
          totalItems,
          results,
        });
      } catch (error) {
        console.error("Search error:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });
    // await client.db("admin").command({ ping: 1 });
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
