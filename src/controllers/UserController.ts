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
