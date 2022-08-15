import { ObjectType, Repository } from "typeorm";
import { IDbContext } from "../dbContext/DbContext";

export interface IRepository<T> {
  getAll(): Promise<T[]>;
}

export default class BaseRepository<T> implements IRepository<T> {
  private ormRepo: Repository<T>;

  constructor(type: ObjectType<T>, private dbContext: IDbContext) {
    this.ormRepo = this.dbContext.getRepository(type);
  }
  async getAll(): Promise<T[]> {
    const resource = (await this.ormRepo.find()) as T[];
    return resource;
  }
}
