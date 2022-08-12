export class UserRepository {
  getAll = async () => {
    return new Promise((resolve, reject) => {
      return resolve({
        name: "test",
      });
    });
  };
}
