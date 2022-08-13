import express from "express";

import container from "../container";
import UserController from "../controllers/UserController";

const usersRouter = express.Router();
const userController: UserController = container.get("userController");

usersRouter.get("/", async (req, res) => {
  const result = await userController.getAll();
  return res.json(result);
});

export default usersRouter;
