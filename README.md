### Setup TypeORM

#### install

```
yarn add reflect-metadata typeorm pg

yarn add -D typescript @types/node nodemon ts-node
```

#### setup datasource

##### What is DataSource

Your interaction with the database is only possible once you setup a DataSource. TypeORM's DataSource holds your database connection settings and establishes initial database connection or connection pool depend on RDBMS you use.

In order to establish initial connection / connection pool you must call initialize method of your DataSource instance.

Generally, you call initialize method of the DataSource instance on application bootstrap, and destroy it after you completely finished working with the database. In practice, if you are building a backend for your site and your backend server always stays running - you never destroy a DataSource.

##### Creating a new DataSource

data-source.ts

```ts
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
  }
};
```

##### Create entity classes

entities/User.entity.ts

```ts
import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn("text")
  uid: string;

  @Column({ name: "first_name", type: String, nullable: true })
  firstName?: string;

  @Column({ name: "last_name", type: String, nullable: true })
  lastName?: string;

  @Column({ type: String })
  email: string;
}
```

##### Now you can use the database everywhere

./index.ts

```ts
import "reflect-metadata";

import { dataSource, dbConnect } from "./data-source";
import { User } from "./entities/User.entity";

(async () => {
  await dbConnect();
  const users = await dataSource.manager.find(User);
  //   const users = await dataSource.getRepository(User).find({});
  console.log("users", users);
})();
```

Note:
Differences between entity manager and repository typeorm:
14

An Entity Manager handles all entities, Using EntityManager you can manage (insert, update, delete, load, etc.) any entity. EntityManager is just like a collection of all entity repositories in a single place.

While Repository handles a single entity.Repository is just like EntityManager but its operations are limited to a concrete entity. You can access the repository via EntityManager.

This means that when using an Entity Manager you have to specify the Entity you are working with for each method call.

#### Add relationship

Now create a new entity class

entities/Transfer.entity.ts

```ts
import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Transfer {
  @PrimaryColumn({ name: "transfer_id", type: String })
  transferId: number;

  @Column({ name: "user_id", type: String })
  userId: string;

  @Column({ name: "dof_type", type: String })
  transferType: string;
}
```

Setup the one-to-many relationship between `User` and `Transfer` class. One user can create multiple transfers.

entities/User.entity.ts, which has multiple transfers

```ts
import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { Transfer } from "./Transfer.entity";

@Entity()
export class User {
  @PrimaryColumn("text")
  uid: string;

  @Column({ name: "first_name", type: String, nullable: true })
  firstName?: string;

  @Column({ name: "last_name", type: String, nullable: true })
  lastName?: string;

  @Column({ type: String })
  email: string;

  @Column("timestamp with time zone", { name: "deleted_date" })
  deletedDate: Date;

  @OneToMany(() => Transfer, (transfer) => transfer.user)
  transfers: Transfer[];
}
```

and entities/Transfer.entity.ts, each transfer has 1 user

```ts
import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { User } from "./User.entity";

@Entity({ name: "transfers" })
export class Transfer {
  @PrimaryColumn({ name: "transfer_id", type: String })
  transferId: number;

  @Column({ name: "user_id", type: String })
  userId: string;

  @Column({ name: "dof_type", type: String })
  dofType: string;

  @ManyToOne(() => User, (user) => user.transfers)
  user: User;
}
```

Now the relationship has been setup, but the sql generated was wrong, mainly because by default, TypeORM will use the primary column from the OneToMany side, which is `User.uid`(which is correct), to join the ManyToOne side, by guesting the foreignKey column will be `Transfer.UserUid`, which does not exist.

So we need to specify the JoinColumn to override the default conversion.

`@JoinColumn({ name: "user_id" })` to specify that the 'Transfer' class will use 'user_id' column to join 'User' class 'uid' column

```ts
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User.entity";

@Entity({ name: "transfers" })
export class Transfer {
  @PrimaryColumn({ name: "transfer_id", type: String })
  transferId: number;

  @Column({ name: "user_id", type: String })
  userId: string;

  @Column({ name: "dof_type", type: String })
  dofType: string;

  @ManyToOne(() => User, (user) => user.transfers)
  @JoinColumn({ name: "user_id" })
  user: User;
}
```

Note: Even though the official documentation says that `You can omit @JoinColumn in a @ManyToOne / @OneToMany relation.`. But from our example, we can see that the @JoinColumn can be used to specify the join column on the @ManyToOne side of the relationship.

#### Find Options

One the relationship has been setup, there are multiple ways of including the relationship:

1. Entity Manager

```ts
const users = await dataSource.manager.find(User, {
  relations: {
    transfers: true,
  },
  where: {
    firstName: "zack",
  },
});
```

2. Repository

```ts
const users = await dataSource.getRepository(User).find({
  relations: {
    transfers: true,
  },
  where: {
    firstName: "zack",
  },
});
```

3. Query Builder

```ts
const users = await dataSource
  .getRepository(User)
  .createQueryBuilder("user")
  .leftJoinAndSelect("user.transfers", "transfers")
  .where("user.firstName=:name", { name: "zack" })
  .getMany();
```

4. eager loading - Eager relations are loaded automatically each time you load entities from the database.

```ts
@Entity()
export class User {
    ...
    @OneToMany(() => Transfer, (transfer) => transfer.user, { eager: true })
    transfers: Transfer[];
}
```

### Add layers

Now the structure of the project is like below:

```
├── app.ts
├── controllers
│   └── UserController.ts
├── data-source.ts
├── dbContext
│   └── DbContext.ts
├── entities
│   ├── Transfer.entity.ts
│   └── User.entity.ts
├── index.ts
├── repositories
│   └── UserRepository.ts
├── routers
│   └── UserRouter.ts
├── services
│   └── UserService.ts
└── utils
    └── sleep.ts
```

The Repository class has a dependency on the DbContext class

Repositories/UserRepository class

```ts
import { Repository } from "typeorm";
import { DbContext } from "../dbContext/DbContext";
import { User } from "../entities/User.entity";

export class UserRepository {
  private userOrmRepo: Repository<User>;

  constructor(private dbContext: DbContext) {
    this.userOrmRepo = dbContext.getRepository(User);
  }

  getAll = async (): Promise<User[]> => {
    return this.userOrmRepo.find();
  };
}
```

DbContext.ts

```ts
import { EntitySchema, ObjectType, Repository } from "typeorm";
import { dataSource } from "../data-source";

export class DbContext {
  getRepository<Entity>(
    entityClass: ObjectType<Entity> | EntitySchema<Entity> | string
  ): Repository<Entity> {
    return dataSource.getRepository(entityClass);
  }
}
```

Since we import the `dataSource` from a separate class. we need to make sure that the dataSource has been initialized before DbContext start using it.

In order to do that, we need to import the `app.ts` which initializes the express server instance, **after the dataSource has been initialized**

```ts
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
```

app.ts

```ts
import express from "express";
import cors from "cors";

import usersRouter from "./routers/UserRouter";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("root working");
});

app.use("/v1/users", usersRouter);

// catch all 404
app.use((req, res, next) => {
  res.status(404).send("route not found");
});

export default app;
```

### DI in typescript

#### Option 1: typedi

```
yarn add typedi
```

##### Option 1a: Class-based injections

This is the most straightforward way to do dependency injections. Every class uses the class-level `@Service` decorator.

`UserController.ts` has a dependency on `UserService.ts`

```ts
import { Service } from "typedi";
import { UserService } from "../services/UserService";

@Service()
class UserController {
  constructor(private userService: UserService) {}

  getAll = async () => {
    return this.userService.getAll();
  };
}

export default UserController;
```

`UserService.ts` has a dependency on `UserRepository.ts`

```ts
import { Service } from "typedi";
import { Repository } from "typeorm";
import { DbContext } from "../dbContext/DbContext";
import { User } from "../entities/User.entity";

@Service()
export class UserRepository {
  private userOrmRepo: Repository<User>;

  constructor(private dbContext: DbContext) {
    this.userOrmRepo = dbContext.getRepository(User);
  }

  getAll = async (): Promise<User[]> => {
    return this.userOrmRepo.find();
  };
}
```

`UserRepository.ts` has a dependency on `DbContext.ts`

```ts
import { Service } from "typedi";
import { EntitySchema, ObjectType, Repository } from "typeorm";
import { dataSource } from "../data-source";

@Service()
export class DbContext {
  getRepository<Entity>(
    entityClass: ObjectType<Entity> | EntitySchema<Entity> | string
  ): Repository<Entity> {
    return dataSource.getRepository(entityClass);
  }
}
```

Now when `UserRouter.ts` wants to instantiate an instance of UserController, all it needs to do is to use typedi `Container.get(UserService)` to resolve the entire dependency chain.

```ts
import express from "express";
import Container from "typedi";

import UserController from "../controllers/UserController";

const usersRouter = express.Router();
const userController = container.get(UserController);

usersRouter.get("/", async (req, res) => {
  const result = await userController.getAll();
  return res.json(result);
});

export default usersRouter;
```

##### Option 1b: Token-based injections

Token-based injections bind `interfaces` to their implementations using a token as an intermediary. The only change in comparison to class-based injections is declaring the appropriate token for each construction parameter using the @Inject decorator:

Instead of `@Service()` decorator on each class, we need to manually resolve the token-based injection

container.ts

```ts
import Container from "typedi";
import UserController from "./controllers/UserController";
import { DbContext } from "./dbContext/DbContext";
import { UserRepository } from "./repositories/UserRepository";
import { UserService } from "./services/UserService";

// Setup scope of the container
const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER); // uuid-like
const container = Container.of(String(requestId));

// Register resolves
container.set("dbContext", new DbContext());
container.set("userRepository", new UserRepository(container.get("dbContext")));
container.set("userService", new UserService(container.get("userRepository")));
container.set(
  "userController",
  new UserController(container.get("userService"))
);

export default container;
```

`DbContext.ts` does not need to have the `@Service()` decorator anymore

```ts
import { EntitySchema, ObjectType, Repository } from "typeorm";
import { dataSource } from "../data-source";

export interface IDbContext {
  getRepository<Entity>(
    entityClass: ObjectType<Entity> | EntitySchema<Entity> | string
  ): Repository<Entity>;
}

export class DbContext implements IDbContext {
  getRepository<Entity>(
    entityClass: ObjectType<Entity> | EntitySchema<Entity> | string
  ): Repository<Entity> {
    return dataSource.getRepository(entityClass);
  }
}
```

`UserRepository.ts` now depends on interface `IDbContext`. And the token-based injection `Inject("dbContext") private dbContext: IDbContext` will be resolved based on the settings we created in the `container.ts` registry.

```ts
import { Inject } from "typedi";
import { Repository } from "typeorm";
import { IDbContext } from "../dbContext/DbContext";
import { User } from "../entities/User.entity";

export interface IUserRepository {
  getAll(): Promise<User[]>;
}

export class UserRepository implements IUserRepository {
  private userOrmRepo: Repository<User>;

  constructor(@Inject("dbContext") private dbContext: IDbContext) {
    this.userOrmRepo = dbContext.getRepository(User);
  }

  getAll = async (): Promise<User[]> => {
    return this.userOrmRepo.find();
  };
}
```

Similarly for `UserService.ts`

```ts
import { Inject } from "typedi";
import { User } from "../entities/User.entity";
import { IUserRepository } from "../repositories/UserRepository";

export interface IUserService {
  getAll(): Promise<User[]>;
}

export class UserService implements IUserService {
  constructor(
    @Inject("userRepository") private userRepository: IUserRepository
  ) {}

  getAll = async (): Promise<User[]> => {
    return this.userRepository.getAll();
  };
}
```

`UserController.ts`

```ts
import { Inject } from "typedi";
import { User } from "../entities/User.entity";
import { IUserService } from "../services/UserService";

export class BaseController {}

class UserController extends BaseController {
  constructor(@Inject("userService") private userService: IUserService) {
    super();
  }

  getAll = async (): Promise<User[]> => {
    return this.userService.getAll();
  };
}

export default UserController;
```

`UserRouter.ts`

```ts
import express from "express";

import container from "../container";
import UserController from "../controllers/UserController";

const usersRouter = express.Router();
const userController: UserController = container.get("userController");

usersRouter.get("/", async (req, res) => {
  const result = await userController.getAll();
  return res.json(result);
});

export default usersRouter;
```

#### DI using `tsyringe`

##### Option 2a: Class-based injections

It is very similar to `typedi`. But `tsyringe` has different util methods for helping us to manage the lifecycle of the dependency injection.

`DbContext.ts`

```ts
import { Lifecycle, scoped } from "tsyringe";
import { EntitySchema, ObjectType, Repository } from "typeorm";
import { dataSource } from "../data-source";

@scoped(Lifecycle.ResolutionScoped)
export class DbContext {
  constructor() {}

  getRepository<Entity>(
    entityClass: ObjectType<Entity> | EntitySchema<Entity> | string
  ): Repository<Entity> {
    return dataSource.getRepository(entityClass);
  }
}
```

`UserRepository.ts`

```ts
import { Lifecycle, scoped } from "tsyringe";
import { Repository } from "typeorm";
import { DbContext } from "../dbContext/DbContext";
import { User } from "../entities/User.entity";

@scoped(Lifecycle.ResolutionScoped)
export class UserRepository {
  private userOrmRepo: Repository<User>;

  constructor(private dbContext: DbContext) {
    this.userOrmRepo = dbContext.getRepository(User);
  }

  getAll = async (): Promise<User[]> => {
    return this.userOrmRepo.find();
  };
}
```

`UserService.ts`

```ts
import { scoped, Lifecycle } from "tsyringe";
import { User } from "../entities/User.entity";
import { UserRepository } from "../repositories/UserRepository";

@scoped(Lifecycle.ResolutionScoped)
export class UserService {
  constructor(private userRepository: UserRepository) {}

  getAll = async (): Promise<User[]> => {
    return this.userRepository.getAll();
  };
}
```

`UserController.ts`

```ts
import { scoped, Lifecycle } from "tsyringe";
import { User } from "../entities/User.entity";
import { UserService } from "../services/UserService";

@scoped(Lifecycle.ResolutionScoped)
class UserController {
  constructor(private userService: UserService) {}

  getAll = async (): Promise<User[]> => {
    return this.userService.getAll();
  };
}

export default UserController;
```

And `UserRouter.ts`

```ts
import express from "express";

import { container } from "tsyringe";

import UserController from "../controllers/UserController";

const usersRouter = express.Router();
const userController = container.resolve(UserController);

usersRouter.get("/", async (req, res) => {
  const result = await userController.getAll();
  return res.json(result);
});

export default usersRouter;
```

##### Option 2b: Token-based injections

Unfortunately `tsyringe` token-based injection did not work well with this project. Main reason was because it doesn't work with the `UserController` with the token-based injection of the `UserService`.

The only way I can get it working is to use below code, which is not what I am expecting from an DI framework.

```ts
container.register<IUserController>("userController", {
  useFactory: (_) =>
    new UserController(new UserService(new UserRepository(new DbContext()))),
});
```

```ts
import { container, Lifecycle } from "tsyringe";

import UserController from "./controllers/UserController";
import { DbContext, IDbContext } from "./dbContext/DbContext";
import { IUserRepository, UserRepository } from "./repositories/UserRepository";
import { IUserService, UserService } from "./services/UserService";

// Register resolves
container.register<IDbContext>("dbContext", DbContext, {
  lifecycle: Lifecycle.ResolutionScoped,
});
container.register<IUserRepository>("userRepository", UserRepository, {
  lifecycle: Lifecycle.ResolutionScoped,
});
container.register<IUserService>("userService", UserService, {
  lifecycle: Lifecycle.ResolutionScoped,
});
container.register<IUserController>("userController", {
  useFactory: (_) =>
    new UserController(new UserService(new UserRepository(new DbContext()))),
});

export default container;
```

#### Refactor to Generic Repository/Service

`repositories/BaseRepository.ts`

```ts
import { ObjectType, Repository } from "typeorm";
import { IDbContext } from "../dbContext/DbContext";

export interface IRepository<T> {
  getAll(): Promise<T[]>;
}

export default class BaseRepository<T> implements IRepository<T> {
  private ormRepo: Repository<T>;

  constructor(entityClass: ObjectType<T>, private dbContext: IDbContext) {
    this.ormRepo = this.dbContext.getRepository(entityClass);
  }
  async getAll(): Promise<T[]> {
    const resource = (await this.ormRepo.find()) as T[];
    return resource;
  }
}
```

`repositories/UserService.ts`

```ts
import { Inject } from "typedi";
import { IDbContext } from "../dbContext/DbContext";
import { User } from "../entities/User.entity";
import BaseRepository from "./BaseRepository";

export class UserRepository extends BaseRepository<User> {
  constructor(@Inject("dbContext") dbContext: IDbContext) {
    super(User, dbContext);
  }
}
```

`services/BaseService.ts`

```ts
import { IRepository } from "../repositories/BaseRepository";

export interface IBaseService<T> {
  getAll(): Promise<T[]>;
}

export default class BaseService<T> implements IBaseService<T> {
  constructor(private repository: IRepository<T>) {}

  getAll = async (filters = {}): Promise<T[]> => {
    const resource = (await this.repository.getAll()) as T[];
    return resource;
  };
}
```

`services/UserService.ts`

```ts
import { Inject } from "typedi";
import { User } from "../entities/User.entity";
import { IRepository } from "../repositories/BaseRepository";
import BaseService from "./BaseService";

export class UserService extends BaseService<User> {
  constructor(@Inject("userRepository") userRepository: IRepository<User>) {
    super(userRepository);
  }
}
```

`controllers/BaseController.ts`

```ts
import { Request, Response } from "express";
import { IBaseService } from "../services/BaseService";

export class BaseController<T = any> {
  service: IBaseService<T>;

  constructor(service: IBaseService<T>) {
    this.service = service;
  }

  getAll = async (req: Request, res: Response): Promise<void> => {};
}
```

`controllers/UserController.ts`

```ts
import { Request, Response } from "express";
import { Inject } from "typedi";
import { User } from "../entities/User.entity";
import { IBaseService } from "../services/BaseService";
import { BaseController } from "./BaseController";

class UserController extends BaseController {
  constructor(@Inject("userService") private userService: IBaseService<User>) {
    super(userService);
  }

  getAll = async (req: Request, res: Response) => {
    const resource = await this.service.getAll();
    res.send(resource);
  };
}

export default UserController;
```

`routers/UserRouter.ts`

```ts
import express from "express";
import container from "../container.config";

import UserController from "../controllers/UserController";

const usersRouter = express.Router();

const userController: UserController = container.get("userController");

usersRouter.get("/", userController.getAll);

export default usersRouter;
```

`container.config.ts`

```ts
import Container from "typedi";
import UserController from "./controllers/UserController";
import { DbContext } from "./dbContext/DbContext";
import { User } from "./entities/User.entity";
import BaseRepository from "./repositories/BaseRepository";
import { UserService } from "./services/UserService";

// Setup scope of the container
const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER); // uuid-like
const container = Container.of(String(requestId));

// Register resolves
container.set("dbContext", new DbContext());
container.set(
  "userRepository",
  new BaseRepository(User, container.get("dbContext"))
);
container.set("userService", new UserService(container.get("userRepository")));
container.set(
  "userController",
  new UserController(container.get("userService"))
);

export default container;
```

### Jest setup

#### Install

```
yarn add -D jest @types/jest ts-jest

yarn ts-jest config:init
```

The auto-generated jest.config.js

```js
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
};
```

#### Setup jest

put "jest" in `tsconfig.json` `types` section

```json
"types": [
      "reflect-metadata",
      "jest"
    ] /* Specify type package names to be included without being referenced in a source file. */,
```

#### create sqlite database for local e2e tests

```
yarn add -D sqlite3
```

modify `data-source.ts`

```ts
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
```

Note:

1. if calling `dbConnect` from jest, then jest will set `process.env.JEST_WORKER_ID` to a random number, starting from 1. Hence, we can use `process.env.JEST_WORKER_ID` to detect if it is running from jest tests.
2. sqlite doesn't support `timestamp with time zone` data type. hence we changed the column `deletedDate` of `User` entity class to `@DeleteDateColumn`

```ts
  @DeleteDateColumn({ name: "deleted_date" })
  deletedDate: Date;
```

#### Create our e2e test

```ts
import { Express } from "express";
import { Server } from "http";
import { agent, SuperAgentTest } from "supertest";
import { dbConnect, dataSource } from "../data-source";

describe("api e2e test", () => {
  let app: Express;
  let server: Server;
  let request: SuperAgentTest;

  beforeEach(async () => {
    await dbConnect();
    if (!!dataSource.initialize) {
      app = (await import("../app")).default;
      server = app.listen(4000, () => {
        console.log(`Example app listening on port ${4000}`);
      });
    }
    request = agent(server);
  });

  afterEach(async () => {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name); // Get repository
      await repository.clear(); // Clear each entity table's content
    }

    dataSource.destroy();
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
      },
    ]);
  });
});
```

Note: you can use `axios` or `supertest` as your http client for testing.
