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
