import { Inject } from "typedi";
import { Repository } from "typeorm";
import { IDbContext } from "../dbContext/DbContext";
import { User } from "../entities/User.entity";

export interface IUserRepository {
  getAll(): Promise<User[]>;
}

export class UserRepository implements IUserRepository {
  private userOrmRepo: Repository<User>;

  constructor(@Inject("dbContext") private dbContext: IDbContext) {
    this.userOrmRepo = dbContext.getRepository(User);
  }

  getAll = async (): Promise<User[]> => {
    return this.userOrmRepo.find();
  };
}
