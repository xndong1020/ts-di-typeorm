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
