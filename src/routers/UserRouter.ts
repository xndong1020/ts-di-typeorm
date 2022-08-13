import express from "express";
import Container from "typedi";
import UserController from "../controllers/UserController";

const usersRouter = express.Router();
const userController = Container.get(UserController);

usersRouter.get("/", async (req, res) => {
  const result = await userController.getAll();
  return res.json(result);
});

export default usersRouter;
