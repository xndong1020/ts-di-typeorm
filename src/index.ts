import "reflect-metadata";

import { dataSource, dbConnect } from "./data-source";
import { User } from "./entities/User.entity";

(async () => {
  await dbConnect();
  //   const users = await dataSource.manager.find(User, {
  //     relations: {
  //       transfers: true,
  //     },
  //     where: {
  //       firstName: "zack",
  //     },
  //   });
  const users = await dataSource.getRepository(User).find({
    where: {
      firstName: "zack",
    },
  });
  //   const users = await dataSource
  //     .getRepository(User)
  //     .createQueryBuilder("user")
  //     .leftJoinAndSelect("user.transfers", "transfers")
  //     .where("user.firstName=:name", { name: "zack" })
  //     .getOne();
  console.log("users", users);
})();
