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