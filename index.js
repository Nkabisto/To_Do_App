import express from "express";
import bodyParser from "body-parser";
import { Client } from 'pg';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Configure the database connection
const db = new Client({
  user: 'postgres',
  password: 'code',
  host: 'localhost',
  database: 'permalist',
});

db.connect();

async function getItems(){
  try{
    const result = await db.query("SELECT * FROM items");
    return result.rows;
  }catch(err){
    console.log("Database error:",err);
    return [];
  }
}
/*
let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];
*/

app.get("/", async(req, res) => {
  try{
    const items = await getItems();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  }catch(err){
    console.error("Error rendering page:", err)
    res.status(500).send("internal Server Error");
  }
});

app.post("/add",async(req, res) => {
  const item = req.body.newItem;
  try{
    await db.query("INSERT INTO items(title) VALUES ($1)",[item]);
    res.redirect("/");
  }catch(err){
    console.error("Database error:", err);
  }
});

app.post("/edit", async(req, res) => {
  const updatedItemId  = req.body["updatedItemId"];
  const updatedItemTitle = req.body["updatedItemTitle"];
  try{
    const update =  await db.query("UPDATE items set title= $1 WHERE id = $2 RETURNING *",[updatedItemTitle,updatedItemId]);
    console.log(update.rows[0]);
    res.redirect("/");
  }catch(err){
    console.log("Failed to update item:", err);
  }
});

app.post("/delete", async(req, res) => {
  const deleteItemId = req.body["deleteItemId"];
  try{
    const deleted = await db.query("DELETE FROM items WHERE id = $1 Returning *",[deleteItemId]);
    console.log(deleted.rows[0]);
    res.redirect("/");
  }catch(err){
    console.log("Failed to delete item:",err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
