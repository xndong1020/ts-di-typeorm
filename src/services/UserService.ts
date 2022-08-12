import { UserRepository } from "../repositories/UserRepository";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  getAll = async () => {
    return this.userRepository.getAll();
  };
}
