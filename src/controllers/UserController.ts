import { UserService } from "../services/UserService";

class UserController {
  constructor(private userService: UserService) {}

  getAll = async () => {
    return this.userService.getAll();
  };
}

export default UserController;
