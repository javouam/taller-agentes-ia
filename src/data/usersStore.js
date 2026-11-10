// Almacenamiento en memoria de usuarios (se pierde al reiniciar el proceso).
const users = [];

let nextId = 1;

const usersStore = {
  getAll() {
    return users;
  },

  findByEmail(email) {
    return users.find((user) => user.email === email);
  },

  create({ name, email }) {
    const user = { id: nextId++, name, email };
    users.push(user);
    return user;
  },
};

module.exports = usersStore;
