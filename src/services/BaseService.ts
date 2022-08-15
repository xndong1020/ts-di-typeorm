import { IRepository } from "../repositories/BaseRepository";

export interface IBaseService<T> {
  getAll(): Promise<T[]>;
}

export default class BaseService<T> implements IBaseService<T> {
  constructor(private repository: IRepository<T>) {}

  getAll = async (filters = {}): Promise<T[]> => {
    const resource = (await this.repository.getAll()) as T[];
    return resource;
  };
}
