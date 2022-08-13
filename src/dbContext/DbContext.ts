import { Lifecycle, scoped } from "tsyringe";
import { EntitySchema, ObjectType, Repository } from "typeorm";
import { dataSource } from "../data-source";

@scoped(Lifecycle.ResolutionScoped)
export class DbContext {
  constructor() {}

  getRepository<Entity>(
    entityClass: ObjectType<Entity> | EntitySchema<Entity> | string
  ): Repository<Entity> {
    return dataSource.getRepository(entityClass);
  }
}
