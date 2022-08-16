import { Inject } from "typedi";
import { IDbContext } from "../dbContext/DbContext";
import { User } from "../entities/User.entity";
import BaseRepository from "./BaseRepository";

export class UserRepository extends BaseRepository<User> {
  constructor(@Inject("dbContext") dbContext: IDbContext) {
    super(User, dbContext);
  }

  // override getAll from BaseRepository
  async getAll(): Promise<User[]> {
    const resource = await this.repository.find({
      relations: { transfers: true },
    });
    return resource;
  }
}
