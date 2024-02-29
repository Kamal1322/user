require("dotenv").config();

const http = require("http");
const express = require("express");
const db = require("./mongodb/dbConnection");
const userRouter = require("./Router/userRouter");
const PORT = process.env.PORT

const app = express();
app.use(express.json());
app.use('/api/user', userRouter);

const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`server is running on port:${PORT}`);
});