import { EntitySchema, ObjectType, Repository } from "typeorm";
import { dataSource } from "../data-source";

export interface IDbContext {
  getRepository<Entity>(
    entityClass: ObjectType<Entity> | EntitySchema<Entity> | string
  ): Repository<Entity>;
}

export class DbContext implements IDbContext {
  constructor() {}

  getRepository<Entity>(
    entityClass: ObjectType<Entity> | EntitySchema<Entity> | string
  ): Repository<Entity> {
    return dataSource.getRepository(entityClass);
  }
}
