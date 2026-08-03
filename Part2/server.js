/** 
 * i'm used Ai For asset me to complete this task
 * thanks eng rana 
 */


const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const USERS_FILE = path.join(__dirname, 'users.json');

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]');
  }
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST' && req.url === '/user') {
    try {
      const newUser = await getRequestBody(req);
      const users = readUsers();

      const emailExists = users.some((user) => user.email === newUser.email);

      if (emailExists) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Email already exists.' }));
        return;
      }

      const validIds = users.map((user) => user.id).filter((id) => typeof id === 'number');
      const newId = validIds.length > 0 ? Math.max(...validIds) + 1 : 1;
      newUser.id = newId;

      users.push(newUser);
      writeUsers(users);

      res.statusCode = 201;
      res.end(JSON.stringify({ message: 'User added successfully.' }));
    } catch (err) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Invalid JSON input.' }));
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/user') {
    const users = readUsers();
    res.statusCode = 200;
    res.end(JSON.stringify(users));
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/user/')) {
    const userId = Number(req.url.split('/')[2]);
    const users = readUsers();

    const user = users.find((u) => u.id === userId);

    if (!user) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: 'User not found.' }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify(user));
    return;
  }

  if (req.method === 'PATCH' && req.url.startsWith('/user/')) {
    const userId = Number(req.url.split('/')[2]);

    try {
      const updates = await getRequestBody(req);
      const users = readUsers();

      const userIndex = users.findIndex((user) => user.id === userId);

      if (userIndex === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'User ID not found.' }));
        return;
      }

      const allowedFields = ['name', 'age', 'email'];
      allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
          users[userIndex][field] = updates[field];
        }
      });

      writeUsers(users);

      const updatedField = allowedFields.find((field) => updates[field] !== undefined);
      res.statusCode = 200;
      res.end(JSON.stringify({ message: `User ${updatedField} updated successfully.` }));
    } catch (err) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Invalid JSON input.' }));
    }
    return;
  }

  if (req.method === 'DELETE' && req.url.startsWith('/user/')) {
    const userId = Number(req.url.split('/')[2]);
    const users = readUsers();

    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: 'User ID not found.' }));
      return;
    }

    users.splice(userIndex, 1);
    writeUsers(users);

    res.statusCode = 200;
    res.end(JSON.stringify({ message: 'User deleted successfully.' }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ message: 'Route not found.' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});