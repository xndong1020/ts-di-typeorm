import UserController from "./controllers/UserController";
import { DbContext } from "./dbContext/DbContext";
import { UserRepository } from "./repositories/UserRepository";
import { UserService } from "./services/UserService";

// Setup scope of the container
// const container = Container.of();

// // Register resolves
// container.set("dbContext", new DbContext());
// container.set("userRepository", new UserRepository(container.get("dbContext")));
// container.set("userService", new UserService(container.get("userRepository")));
// container.set(
//   "userController",
//   new UserController(container.get("userService"))
// );

// export default container;
