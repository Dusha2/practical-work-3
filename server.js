const express = require("express");
const app = express();
const PORT = 3000;

// Маршрут для перевірки
app.get("/", (req, res) => {
  res.send("Hello World! The server is running.");
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
