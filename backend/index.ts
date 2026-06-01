// index.js
import express from "express";
import { router } from "./routes/router";
import cookieParser from 'cookie-parser';

const app = express();
const port = "3000";


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