import { DataSource, EntitySchema, ObjectType, Repository } from "typeorm";
import { dataSource } from "../data-source";

export class DbContext {
  getRepository<Entity>(
    entityClass: ObjectType<Entity> | EntitySchema<Entity> | string
  ): Repository<Entity> {
    // console.log("aaa", dataSource);
    return dataSource.getRepository(entityClass);
  }
}
