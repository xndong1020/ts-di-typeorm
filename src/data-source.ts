import path from "path";
import { DataSource } from "typeorm";
import { Transfer } from "./entities/Transfer.entity";
import { User } from "./entities/User.entity";

export let dataSource: DataSource;

export const dbConnect = async () => {
  if (!dataSource || !dataSource.initialize) {
    try {
      if (process.env.JEST_WORKER_ID !== undefined) {
        dataSource = new DataSource({
          type: "sqlite",
          database: `${path.resolve(__dirname, ".")}/data/dev.sqlite`,
          entities: [__dirname + "/entities/**/*.entity.ts"],
          migrations: [__dirname + "/data/migrations/**/*.ts"],
          synchronize: true,
          logging: ["query", "error"],
        });
        // if jest is running the code
      } else {
        dataSource = new DataSource({
          type: "postgres",
          host: "localhost",
          port: 5432,
          username: "root",
          password: "password",
          database: "gographql",
          entities: [__dirname + "/entities/**/*.entity.ts"],
          synchronize: false,
          logging: ["query", "error"],
        });
      }

      await dataSource.initialize();
      console.log("dataSource initialized");

      if (process.env.JEST_WORKER_ID !== undefined) {
        await dataSource.getRepository(User).save({
          uid: "2",
          firstName: "John",
          lastName: "Doe",
          email: "test@example.com",
        });

        await dataSource.getRepository(Transfer).save({
          transferId: 2,
          userId: "2",
          dofType: "PDOF",
        });

        const users = await dataSource.getRepository(User).find({
          relations: {
            transfers: true,
          },
        });
        console.log("from seed", JSON.stringify(users));
      }
    } catch (error) {
      console.error(error);
      console.log("dataSource error");
    }
  }
};
