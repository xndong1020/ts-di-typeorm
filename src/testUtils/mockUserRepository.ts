import { fakeUsers } from "./mockDbContext";

export const mockUserRepository = {
  getAll: jest.fn().mockReturnValue(fakeUsers),
};
