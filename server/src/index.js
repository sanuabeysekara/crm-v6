const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectToDatabase = require("../database");
const studentRoutes = require("./routes/studentRoutes");
const user_typeRoutes = require("./routes/user_typeRoutes");
const userRoutes = require("./routes/userRoutes");
const leadRoutes = require("./routes/leadRoutes");
const branchRoutes = require("./routes/branchRoutes");
const courseRoutes = require("./routes/courseRoutes");
const statusRoutes = require("./routes/statusRoutes");
const folowUpRoutes = require("./routes/folowUpRoutes");
const sourceRoutes = require("./routes/sourceRoutes");
const logFunctionExecution = require("./middleware/log");

const app = express();
app.use(cors());

const port = 8080;

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectToDatabase();

app.use(logFunctionExecution);

// Set up your routes here
app.get("/", (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello, world CEEE!");
});

// Use the student routes
app.use("/api", user_typeRoutes);
app.use("/api", studentRoutes);
app.use("/api", userRoutes);
app.use("/api", leadRoutes);
app.use("/api", branchRoutes);
app.use("/api", courseRoutes);
app.use("/api", statusRoutes);
app.use("/api", folowUpRoutes);
app.use("/api", sourceRoutes);

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "../server.key")),
  cert: fs.readFileSync(path.join(__dirname, "../server.cert")),
};

// Create an HTTP server and listen on the specified port
const server = https.createServer(httpsOptions, app);

server.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});
