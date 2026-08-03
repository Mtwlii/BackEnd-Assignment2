const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const USERS_FILE = path.join(__dirname, 'users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // File doesn't exist yet -> create it with an empty array
    if (err.code === 'ENOENT') {
      await fs.writeFile(USERS_FILE, '[]');
      return [];
    }
    throw err;
  }
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
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

  // CREATE — POST /user
  if (req.method === 'POST' && req.url === '/user') {
    try {
      const newUser = await getRequestBody(req);
      const users = await readUsers();

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
      await writeUsers(users);

      res.statusCode = 201;
      res.end(JSON.stringify({ message: 'User added successfully.' }));
    } catch (err) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Invalid JSON input.' }));
    }
    return;
  }

  // READ ALL — GET /user
  if (req.method === 'GET' && req.url === '/user') {
    const users = await readUsers();
    res.statusCode = 200;
    res.end(JSON.stringify(users));
    return;
  }

  // READ ONE — GET /user/:id
  if (req.method === 'GET' && req.url.startsWith('/user/')) {
    const userId = Number(req.url.split('/')[2]);
    const users = await readUsers();

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

  // UPDATE — PATCH /user/:id
  if (req.method === 'PATCH' && req.url.startsWith('/user/')) {
    const userId = Number(req.url.split('/')[2]);

    try {
      const updates = await getRequestBody(req);
      const users = await readUsers();

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

      await writeUsers(users);

      const updatedField = allowedFields.find((field) => updates[field] !== undefined);
      res.statusCode = 200;
      res.end(JSON.stringify({ message: `User ${updatedField} updated successfully.` }));
    } catch (err) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Invalid JSON input.' }));
    }
    return;
  }

  // DELETE — DELETE /user/:id
  if (req.method === 'DELETE' && req.url.startsWith('/user/')) {
    const userId = Number(req.url.split('/')[2]);
    const users = await readUsers();

    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: 'User ID not found.' }));
      return;
    }

    users.splice(userIndex, 1);
    await writeUsers(users);

    res.statusCode = 200;
    res.end(JSON.stringify({ message: 'User deleted successfully.' }));
    return;
  }

  // FALLBACK — unmatched route
  res.statusCode = 404;
  res.end(JSON.stringify({ message: 'Route not found.' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});