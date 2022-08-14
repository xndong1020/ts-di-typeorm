import {
  autoInjectable,
  inject,
  injectable,
  Lifecycle,
  scoped,
  singleton,
} from "tsyringe";
import { User } from "../entities/User.entity";
import { UserService } from "../services/UserService";

@autoInjectable()
class UserController {
  constructor(private userService?: UserService) {}

  getAll = async (): Promise<User[] | undefined> => {
    return this.userService?.getAll();
  };
}

export default UserController;
