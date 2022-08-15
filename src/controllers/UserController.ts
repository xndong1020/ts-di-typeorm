import { Request, Response } from "express";
import { Inject } from "typedi";
import { User } from "../entities/User.entity";
import { IBaseService } from "../services/BaseService";

export class BaseController<T = any> {
  service: IBaseService<T>;

  constructor(service: IBaseService<T>) {
    this.service = service;
  }

  getAll = async (req: Request, res: Response): Promise<void> => {};
}

class UserController extends BaseController<User> {
  constructor(@Inject("userService") private userService: IBaseService<User>) {
    super(userService);
  }

  getAll = async (req: Request, res: Response) => {
    const resource = await this.service.getAll();
    res.send(resource);
  };
}

export default UserController;
