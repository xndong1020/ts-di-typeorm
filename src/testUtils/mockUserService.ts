import { fakeUsers } from "./mockDbContext";

export const mockUserService = {
  getAll: jest.fn().mockReturnValue(fakeUsers),
};
