import "reflect-metadata";
import { Express } from "express";
import dotenv from "dotenv";

import { dataSource, dbConnect } from "./data-source";

dotenv.config();

let app: Express;

const PORT = process.env.PORT || 8081;

(async () => {
  try {
    await dbConnect();
    if (!!dataSource.initialize) {
      app = (await import("./app")).default;
      app.listen(PORT, () => {
        console.log(`Example app listening on port ${PORT}`);
      });
    }
  } catch (err) {
    console.error(err);
  }
})();
