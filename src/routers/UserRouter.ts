import express from "express";

import UserController from "../controllers/UserController";
import { DbContext } from "../dbContext/DbContext";
import { UserRepository } from "../repositories/UserRepository";
import { UserService } from "../services/UserService";

const usersRouter = express.Router();

const userController = new UserController(
  new UserService(new UserRepository(new DbContext()))
);

usersRouter.get("/", async (req, res) => {
  const result = await userController.getAll();
  return res.json(result);
});

export default usersRouter;
