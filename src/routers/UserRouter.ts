import express from "express";
import Container from "typedi";

import { UserService } from "../services/UserService";

const usersRouter = express.Router();
const userController = Container.get(UserService);

usersRouter.get("/", async (req, res) => {
  const result = await userController.getAll();
  return res.json(result);
});

export default usersRouter;
