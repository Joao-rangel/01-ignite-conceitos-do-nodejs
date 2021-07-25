const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const userIndex = users.findIndex((user) => user?.username === username);

  request.user = {userIndex, ...users[userIndex]};
  if (userIndex >= 0) next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userExists = users.find((user) => user?.username === username);
  if (userExists) {
    return response.status(400).json({error: 'usuário já cadastrado'});
  };

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {todos} = request.user;

  return response.status(201).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {userIndex} = request.user;

  const todo = {
    title,
    deadline,
    id: uuidv4(),
    done: false,
    created_at: new Date(),
  };

  users[userIndex].todos.push(todo)

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {userIndex, todos} = request.user;
  const todoPartial = request.body;

  const todoIndex = todos.findIndex((todo) => todo?.id === id)
  if (todoIndex < 0){
   return response.status(404).json({error: 'Todo não localizado'});
  }
  Object.assign(users[userIndex].todos[todoIndex], {...todoPartial});

  return response.status(201).json(users[userIndex].todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {userIndex, todos} = request.user;

  const todoIndex = todos.findIndex((todo) => todo?.id === id)
  if (todoIndex < 0){
    return response.status(404).json({error: 'Todo não localizado'});
  }
  users[userIndex].todos[todoIndex].done = true;

  return response.status(201).json(users[userIndex].todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {userIndex, todos} = request.user;

  const todoIndex = todos.findIndex((todo) => todo?.id === id)
  if (todoIndex < 0){
    return response.status(404).json({error: 'Todo não localizado'});
  }
  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).json(users[userIndex]);
});

module.exports = app;