import { EntitySchema, ObjectType, Repository } from "typeorm";
import { dataSource } from "../data-source";

export class DbContext {
  getRepository<Entity>(
    entityClass: ObjectType<Entity> | EntitySchema<Entity> | string
  ): Repository<Entity> {
    return dataSource.getRepository(entityClass);
  }
}
