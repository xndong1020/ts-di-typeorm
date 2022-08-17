import { fakeUsers } from "../../testUtils/mockDbContext";
import { mockUserService } from "../../testUtils/mockUserService";
import UserController from "../UserController";

const mockRequest = {
  ...jest.requireActual("express"),
  body: { 1: 2 },
  params: { 3: 4 },
};

export const mockResponse = {
  ...jest.requireActual("express").response,
  send: jest.fn().mockImplementation((data) => console.log(data)),
};

describe("UserRepository", () => {
  let userController: UserController;

  beforeEach(() => {
    userController = new UserController(mockUserService);
  });

  it("getAll() should return all users", async () => {
    const test = await userController.getAll(mockRequest, mockResponse);

    expect(mockResponse.send).toHaveBeenCalledWith(fakeUsers);
  });
});
