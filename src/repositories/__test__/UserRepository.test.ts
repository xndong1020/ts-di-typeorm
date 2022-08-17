import { fakeUsers, MockDbContext } from "../../testUtils/mockDbContext";
import { UserRepository } from "../UserRepository";

describe("UserRepository", () => {
  let userRepo: UserRepository;

  beforeEach(() => {
    userRepo = new UserRepository(MockDbContext);
  });

  it("getAll() should return all users", async () => {
    const result = await userRepo.getAll();
    expect(result.length).toEqual(fakeUsers.length);
    expect(result).toMatchObject(fakeUsers);
  });
});
