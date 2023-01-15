import app from "./app.js";
import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose
  .connect(
    process.env.MONGODB_URL.replace("<password>", process.env.MONGODB_PASSWORD),
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to Database"));

const server = app.listen(process.env.PORT, () => {
  console.log("Server Hosted on localhost:", process.env.PORT);
});

// ----------------------- Error Handle and process -----------------------------------------
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception Server Shutting Down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("unhandledRejection", (err) => {
  console.log("UnHandle Rejection Server Shutting Down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
