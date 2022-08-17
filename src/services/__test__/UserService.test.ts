import { fakeUsers } from "../../testUtils/mockDbContext";
import { mockUserRepository } from "../../testUtils/mockUserRepository";
import { UserService } from "../UserService";

describe("UserRepository", () => {
  let userSvc: UserService;

  beforeEach(() => {
    userSvc = new UserService(mockUserRepository);
  });

  it("getAll() should return all users", async () => {
    const result = await userSvc.getAll();
    expect(result.length).toEqual(fakeUsers.length);
    expect(result).toMatchObject(fakeUsers);
  });
});
