import { Service } from "typedi";
import { UserRepository } from "../repositories/UserRepository";

@Service()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  getAll = async () => {
    return this.userRepository.getAll();
  };
}
