// server.js
const express = require("express");
// Імпортуємо дані (users, documents, employees)
const { users, documents, employees } = require("./data");

const app = express();
const PORT = 3000;

// Парсинг JSON
app.use(express.json());

/* --- MIDDLEWARE: LOGGING (глобально) --- */
const loggingMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress;

  // Лог у форматі: [ISO] IP METHOD URL
  console.log(`[${timestamp}] ${ip} ${method} ${url}`);

  // Для детального логування можна також надати тіло запиту (опціонально)
  // але не рекомендовано для продакшену, бо може містити секрети:
  // console.log('Body:', req.body);

  next();
};

// Глобально застосовуємо логер — ОБОВ'ЯЗКОВО перед усіма маршрутами
app.use(loggingMiddleware);

/* --- MIDDLEWARE: AUTHENTICATION --- */
const authMiddleware = (req, res, next) => {
  const login = req.headers["x-login"];
  const password = req.headers["x-password"];

  if (!login || !password) {
    return res.status(401).json({
      message:
        "Authentication failed. Please provide valid credentials in headers X-Login and X-Password.",
    });
  }

  const user = users.find((u) => u.login === login && u.password === password);

  if (!user) {
    return res.status(401).json({
      message:
        "Authentication failed. Please provide valid credentials in headers X-Login and X-Password.",
    });
  }

  req.user = user;
  next();
};

/* --- MIDDLEWARE: AUTHORIZATION (ADMIN ONLY) --- */
const adminOnlyMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin role required." });
  }
  next();
};

/* --- ROUTES --- */

// До /documents потрібна тільки аутентифікація
app.get("/documents", authMiddleware, (req, res) => {
  res.status(200).json(documents);
});

app.post("/documents", authMiddleware, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res
      .status(400)
      .json({
        message: 'Bad Request. Fields "title" and "content" are required.',
      });
  }

  const newDocument = {
    id: Date.now(),
    title,
    content,
  };

  documents.push(newDocument);
  res.status(201).json(newDocument);
});

// /employees вимагає аутентифікації + роль admin
app.get("/employees", authMiddleware, adminOnlyMiddleware, (req, res) => {
  res.status(200).json(employees);
});

// Додатково: обробка неіснуючих маршрутів
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
