import { ObjectType, Repository } from "typeorm";
import { IDbContext } from "../dbContext/DbContext";

export interface IRepository<T> {
  getAll(): Promise<T[]>;
}

export default class BaseRepository<T> implements IRepository<T> {
  protected repository: Repository<T>;

  constructor(entityClass: ObjectType<T>, private dbContext: IDbContext) {
    this.repository = this.dbContext.getRepository(entityClass);
  }

  async getAll(): Promise<T[]> {
    const resource = (await this.repository.find()) as T[];
    return resource;
  }
}
