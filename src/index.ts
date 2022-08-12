import "reflect-metadata";
import dotenv from "dotenv";

import { dataSource, dbConnect } from "./data-source";
import app from "./app";
import { User } from "./entities/User.entity";

dotenv.config();

// (async () => {
//   await dbConnect();
// })();

const PORT = process.env.PORT || 8081;
dbConnect()
  .then(() => {
    app.listen(PORT), () => console.log(`Server is listening on ${PORT}`);
  })
  .catch(console.error);
