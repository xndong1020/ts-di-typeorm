import { Inject } from "typedi";
import { User } from "../entities/User.entity";
import { IRepository } from "../repositories/BaseRepository";
import BaseService from "./BaseService";

export class UserService extends BaseService<User> {
  constructor(@Inject("userRepository") userRepository: IRepository<User>) {
    super(userRepository);
  }
}
