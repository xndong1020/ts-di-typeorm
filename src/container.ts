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
container.register<UserController>("userController", {
  useFactory: (_) =>
    new UserController(new UserService(new UserRepository(new DbContext()))),
});

export default container;
