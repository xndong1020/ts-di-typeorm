import { scoped, Lifecycle } from "tsyringe";
import { User } from "../entities/User.entity";
import { UserRepository } from "../repositories/UserRepository";

@scoped(Lifecycle.ResolutionScoped)
export class UserService {
  constructor(private userRepository: UserRepository) {}

  getAll = async (): Promise<User[]> => {
    return this.userRepository.getAll();
  };
}
