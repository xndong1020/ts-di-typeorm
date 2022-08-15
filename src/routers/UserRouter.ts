import express from "express";
import container from "../container.config";

import UserController from "../controllers/UserController";

const usersRouter = express.Router();

const userController: UserController = container.get("userController");

usersRouter.get("/", userController.getAll);

export default usersRouter;
