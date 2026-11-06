const express = require("express");
const cors = require("cors");
const dns = require("dns");
require("dotenv").config();

const connectDatabase = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();
const PORT = process.env.PORT || 5000;


dns.setServers(["8.8.8.8", "8.8.4.4"]);


app.use(
  cors({
    origin: "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running successfully");
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);


const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port`);
    });
  } catch (error) {
    console.log("Database connection failed:", error.message);
  }
};

startServer();