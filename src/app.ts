import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("root working");
});

// catch all 404

app.use((req, res, next) => {
  res.status(404).send("route not found");
});

export default app;
