const path = require('path');
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001; // API na 3001; Vite na 3000

// Body parser
app.use(express.json());

// Auto-carregamento de rotas da pasta server/routes
const routesDir = path.resolve(__dirname, 'routes');
if (fs.existsSync(routesDir)) {
  fs.readdirSync(routesDir)
    .filter((file) => file.endsWith('.js'))
    .forEach((file) => {
      const registerRoutes = require(path.join(routesDir, file));
      if (typeof registerRoutes === 'function') {
        registerRoutes(app);
      }
    });
}

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});


