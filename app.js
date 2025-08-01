const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const products = [
  { id: 1, name: "Laptop", price: 1000 },
  { id: 2, name: "Mouse", price: 25 },
];

app.get("/products", (req, res) => {
  res.json(products);
});

app.post("/quote", (req, res) => {
  const quote = req.body;
  console.log("Cotización recibida:", quote);
  res.status(201).json({ message: "Cotización recibida", data: quote });
});

module.exports = app;
