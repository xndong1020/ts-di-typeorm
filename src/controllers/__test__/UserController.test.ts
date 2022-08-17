import { fakeUsers } from "../../testUtils/mockDbContext";
import { mockUserService } from "../../testUtils/mockUserService";
import UserController from "../UserController";

const mockRequest = {
  body: {
    firstName: "J",
    lastName: "Doe",
    email: "jdoe@abc123.com",
    password: "Abcd1234",
    passwordConfirm: "Abcd1234",
    company: "ABC Inc.",
  },
} as unknown as Request;

export const mockResponse = {
  send: jest.fn().mockImplementation((data) => console.log(data)),
};

describe("UserRepository", () => {
  let userController: UserController;

  beforeEach(() => {
    userController = new UserController(mockUserService);
  });

  it("getAll() should return all users", async () => {
    const test = await userController.getAll(
      mockRequest as any,
      mockResponse as any
    );

    expect(mockResponse.send).toHaveBeenCalledWith(fakeUsers);
  });
});
