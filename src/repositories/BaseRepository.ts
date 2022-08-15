import { ObjectType, Repository } from "typeorm";
import { IDbContext } from "../dbContext/DbContext";

export interface IRepository<T> {
  getAll(): Promise<T[]>;
}

export default class BaseRepository<T> implements IRepository<T> {
  private ormRepo: Repository<T>;

  constructor(entityClass: ObjectType<T>, private dbContext: IDbContext) {
    this.ormRepo = this.dbContext.getRepository(entityClass);
  }
  async getAll(): Promise<T[]> {
    const resource = (await this.ormRepo.find()) as T[];
    return resource;
  }
}
