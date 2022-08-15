import { Request, Response } from "express";
import { IBaseService } from "../services/BaseService";

export class BaseController<T = any> {
  service: IBaseService<T>;

  constructor(service: IBaseService<T>) {
    this.service = service;
  }

  getAll = async (req: Request, res: Response): Promise<void> => {};
}
