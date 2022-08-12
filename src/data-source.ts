import { DataSource } from "typeorm";

export let dataSource: DataSource;

export const dbConnect = async () => {
  if (!dataSource || !dataSource.initialize) {
    dataSource = new DataSource({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "root",
      password: "password",
      database: "gographql",
      entities: [__dirname + "/entities/**/*.entity.ts"],
      synchronize: false,
      logging: true,
    });
    await dataSource.initialize();
    console.log("dataSource initialized");
  }
};
