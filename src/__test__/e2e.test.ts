import { Express } from "express";
import { Server } from "http";
import { agent, SuperAgentTest } from "supertest";
import { dbConnect, dataSource } from "../data-source";

describe("api e2e test", () => {
  let app: Express;
  let server: Server;
  let request: SuperAgentTest;

  beforeAll(async () => {
    await dbConnect();
    if (!!dataSource.initialize) {
      app = (await import("../app")).default;
      server = app.listen(4000, () => {
        console.log(`Example app listening on port ${4000}`);
      });
    }
    request = agent(server);
  });

  afterAll(async () => {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name); // Get repository
      await repository.clear(); // Clear each entity table's content
    }
    await dataSource.destroy(); // close connection to database
    server.close();
  });

  it("/users getAll should return all records", async () => {
    // const { status, data } = await axios.get<User[]>(
    //   "http://localhost:4000/v1/users"
    // );
    const { status, body } = await request.get("/v1/users");
    expect(status).toEqual(200);
    expect(body.length).toEqual(1);
    expect(body).toMatchObject([
      {
        uid: "2",
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        deletedDate: null,
        transfers: [{ transferId: "2", userId: "2", dofType: "PDOF" }],
      },
    ]);
  });

  it("/users getAll should return all records1", async () => {
    // const { status, data } = await axios.get<User[]>(
    //   "http://localhost:4000/v1/users"
    // );
    const { status, body } = await request.get("/v1/users");
    expect(status).toEqual(200);
    expect(body.length).toEqual(1);
    expect(body).toMatchObject([
      {
        uid: "2",
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        deletedDate: null,
        transfers: [{ transferId: "2", userId: "2", dofType: "PDOF" }],
      },
    ]);
  });
});
