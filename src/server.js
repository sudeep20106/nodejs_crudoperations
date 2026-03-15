const express = require('express');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());

const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);


const url = process.env.MONGO_URI;

const client = new MongoClient(url);

let db;


async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    db = client.db("nipige_dev");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}


app.get("/", (req, res) => {
  res.send("Server running and MongoDB connected");
});


app.post("/admin", async (req, res) => {
  const data = req.body;

  const result = await db.collection("admins").insertOne(data);

  res.send(result);
});


app.get("/admins/:id", async (req, res) => {
  console.log("Received request for /admin route");

  if (!db) {
    return res.send("Database not connected yet");
  }

  const id = req.params.id;

  const admin = await db.collection("admins").findOne({
    _id: new ObjectId(id)
  });

  res.send(admin);
});


app.patch("/admins/:id", async (req, res) => {
  const id = req.params.id;
  console.log("Received update request for admin with ID:", id);
  console.log("Update data:", req.body);
const result = await db.collection("admins").updateOne(
  { _id: new ObjectId(id) }, 
  { $set: req.body },          
  { upsert: true }             
);

  console.log("Update result:", result);
  res.send(result);
});

app.delete("/admins/:id", async (req, res) => {
  const id = req.params.id;

  const result = await db.collection("admins").deleteOne({
    _id: new ObjectId(id)
  });

  res.send(result);
});




app.listen(8080, async () => {
  await connectDB();
  console.log("Server running on port 8080");
});