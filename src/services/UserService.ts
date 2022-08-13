import { Inject } from "typedi";
import { User } from "../entities/User.entity";
import { IUserRepository } from "../repositories/UserRepository";

export interface IUserService {
  getAll(): Promise<User[]>;
}

export class UserService implements IUserService {
  constructor(
    @Inject("userRepository") private userRepository: IUserRepository
  ) {}

  getAll = async (): Promise<User[]> => {
    return this.userRepository.getAll();
  };
}
