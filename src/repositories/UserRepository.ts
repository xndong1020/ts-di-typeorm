import { Repository } from "typeorm";
import { DbContext } from "../dbContext/DbContext";
import { User } from "../entities/User.entity";

export class UserRepository {
  private userOrmRepo: Repository<User>;

  constructor(private dbContext: DbContext) {
    this.userOrmRepo = dbContext.getRepository(User);
  }

  getAll = async (): Promise<User[]> => {
    return this.userOrmRepo.find();
  };
}
