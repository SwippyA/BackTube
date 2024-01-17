import app from "./App.js";
import Connection_db from "./Database/index.js";
import dotenv from "dotenv";
dotenv.config({
  path: "./env",
});

Connection_db()
  .then(() => {
    app.listen(process.env.Port || 8000, () => {
      console.log(`the server is serve at Port ${process.env.Port}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
