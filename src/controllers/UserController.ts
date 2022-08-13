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
