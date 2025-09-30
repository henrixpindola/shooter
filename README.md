# 🚀 Shooter Geometric

Um jogo de nave **2D com estilo geométrico**, desenvolvido em **HTML5 Canvas** e **JavaScript**.
Controle sua nave espacial, destrua inimigos e suba de nível enquanto desvia de obstáculos em um universo em movimento!

---

## 🎮 Descrição

Shooter Geometric é um arcade onde você pilota uma nave pelo cosmos enfrentando ondas de inimigos geométricos. O projeto foi pensado para ser tanto divertido quanto didático — ótimo para aprender e demonstrar conceitos de animação, colisão, física simples e interação com o usuário.

---

## ✨ Características Principais

* 🎯 **Controles Precisos** — setas do teclado + espaço para atirar
* 🚀 **Sistema de Níveis** — velocidade/dificuldade aumentam conforme a pontuação
* 💫 **Universo Dinâmico** — fundo em parallax com múltiplas camadas
* 💾 **Sistema de Save/Load** — múltiplos slots com overlay de gerenciamento
* 🎵 **Áudio Imersivo** — trilha e efeitos via Web Audio API
* 📱 **Design Responsivo** — funciona em desktops, tablets e smartphones

---

## 🎯 Como Jogar

**Controles**

* ← ↑ ↓ → : mover a nave
* **Espaço** : atirar
* **P** : pausar / continuar

**Objetivo**

* Destrua OVNIs inimigos para ganhar pontos.
* A cada **20 pontos** você sobe de nível.
* Evite colisões para não perder vidas.
* Sobreviva o máximo possível para alcançar a maior pontuação.

---

## 💾 Sistema de Save/Load

* **3 slots** disponíveis para salvar progresso.
* **Dados salvos**: pontuação, nível, vidas, posição da nave e velocidades do cenário.
* **Overlay** intuitivo para salvar, carregar e deletar slots.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:**

  * HTML5, CSS3
  * JavaScript (ES6+)
  * Vite (build e dev server)

* **Backend:**

  * Node.js
  * Express.js

* **Ferramentas de Desenvolvimento:**

  * Nodemon (hot reload do backend)
  * Concurrently (executa frontend e backend juntos)
  * Cross-env (variáveis de ambiente multiplataforma)

---

## 📂 Estrutura do Projeto

```
📦 shooter-geometric
 ┣ 📂 src
 ┃ ┣ 📂 scripts      # Código JavaScript do jogo (lógica, animações, colisões, controles, etc)
 ┃ ┗ 📂 styles       # CSS do jogo
 ┣ 📂 assets         # Imagens e sons
 ┣ 📂 pages          # Páginas HTML (sobre, contato, etc)
 ┃ ┣📜 index.html
 ┃ ┣📜 sobre.html
 ┃ ┗📜 contato.html
 ┣ 📂 server         # Backend Node.js/Express
 ┣ ┣ package.json    # Gerencia dependências e scripts
 ┣ ┗ vite.config.js  # Configuração do Vite
```

---

## ⚙️ Como Funciona

* O frontend é servido pelo **Vite**, que compila e entrega HTML/CSS/JS rápidos no dev server.
* O backend **Express** roda em paralelo (por exemplo para APIs simples ou servir assets).
* O comando `npm run dev` inicia frontend e backend simultaneamente (via **concurrently**).
* O jogo roda no navegador usando **Canvas** + scripts JS para animação, entradas e lógica.
* Recursos (imagens, sprites, sons) são carregados da pasta `assets`.
* Salvamentos persistem em **localStorage** no cliente (slots configuráveis).

---

## 🧭 Como Rodar Localmente

1. Instale as dependências:

```sh
npm install
```

2. Inicie o ambiente de desenvolvimento:

```sh
npm run dev
```

3. Abra no navegador:

```
http://localhost:3000
```

> Exemplo de `scripts` úteis no `package.json` (sugestão):

```json
"scripts": {
  "dev": "concurrently \"vite\" \"cross-env NODE_ENV=development nodemon server/index.js\"",
  "build": "vite build",
  "preview": "vite preview",
  "start": "node server/index.js"
}
```

---

## 🔌 Exemplo de Rota Backend

* `GET /api/hello` — retorna algo como:

```json
{
  "message": "Olá do backend!"
}
```

(use Express para criar essa rota em `server/index.js`)

---

## 🎨 Recursos Visuais & Áudio

* Sprites geométricos personalizados e efeitos de explosão.
* Fundo em parallax (várias camadas, velocidades diferentes).
* Trilha sonora em loop + efeitos para disparo, colisão e aumento de nível.
* Controles visuais para volume/mute na UI.

---

## 🧾 Autores

* [Henrique Espindola](https://github.com/henrixpindola)
* [Franciele Ávila](https://github.com/franavila15)

---

## 📜 Licença

MIT — sinta-se livre para usar, modificar e contribuir.

---

## 🤝 Contribuições

Pull requests são bem-vindas! Para maiores mudanças, abra uma issue primeiro para discutir o que pretende alterar. Sugestões de melhorias (novos inimigos, power-ups, ranking online) são muito bem-vindas.
