const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFilePath = path.join(__dirname, '../../users.json');

class UserService {
  async readUsers() {
    try {
      const data = await fs.readFile(usersFilePath, 'utf8');
      return JSON.parse(data).users;
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.writeFile(usersFilePath, JSON.stringify({ users: [] }));
        return [];
      }
      throw error;
    }
  }

  async writeUsers(users) {
    await fs.writeFile(usersFilePath, JSON.stringify({ users }, null, 2));
  }

  async createUser(username, email, password) {
    const users = await this.readUsers();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(newUser);
    await this.writeUsers(users);
    return newUser;
  }

  async validateUser(email, password) {
    const users = await this.readUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    return user;
  }
}

module.exports = new UserService();