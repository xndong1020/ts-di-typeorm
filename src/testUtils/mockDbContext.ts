import { faker } from "@faker-js/faker";

const fakerUidOne = faker.random.alphaNumeric(10);
const fakerUidTwo = faker.random.alphaNumeric(10);

export const fakeUsers = [
  {
    uid: fakerUidOne,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    deletedDate: null,
    transfers: [{ transferId: "1", userId: fakerUidOne, dofType: "MDOF" }],
  },
  {
    uid: fakerUidTwo,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    deletedDate: null,
    transfers: [{ transferId: "2", userId: fakerUidTwo, dofType: "PDOF" }],
  },
];

export const MockDbContext = {
  getRepository: jest.fn().mockReturnValue({
    find: () => fakeUsers,
  }),
};
