import { Request, Response } from "express";
import { Inject } from "typedi";
import { User } from "../entities/User.entity";
import { IBaseService } from "../services/BaseService";
import { BaseController } from "./BaseController";

class UserController extends BaseController {
  constructor(@Inject("userService") private userService: IBaseService<User>) {
    super(userService);
  }

  getAll = async (req: Request, res: Response) => {
    const resource = await this.service.getAll();
    console.log("fffffffffffffffffff", res);
    res.send(resource);
  };
}

export default UserController;
