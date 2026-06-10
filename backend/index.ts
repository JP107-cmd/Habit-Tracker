// index.js
import express from "express";
import { router } from "./routes/router";
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const port = "3000";

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use(express.json());
app.use(cookieParser());

app.use("/api/habits", router)

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);

});