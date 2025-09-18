
# Shooter Game Fullstack

## Tecnologias Utilizadas

- **Frontend:**
	- HTML5, CSS3
	- JavaScript (ES6+)
	- Vite (build e dev server)

- **Backend:**
	- Node.js
	- Express.js

- **Ferramentas de Desenvolvimento:**
	- Nodemon (hot reload do backend)
	- Concurrently (executa frontend e backend juntos)
	- Cross-env (variáveis de ambiente multiplataforma)

## Estrutura do Projeto

- `src/scripts/`: Código JavaScript do jogo (lógica, animações, colisões, controles, etc)
- `src/styles/`: CSS do jogo
- `assets/`: Imagens e sons
- `pages/`: Páginas HTML
- `server/`: Backend Node.js/Express
- `package.json`: Gerencia dependências e scripts
- `vite.config.js`: Configuração do Vite

## Como Funciona

- O frontend é servido pelo Vite, que compila e entrega os arquivos HTML, CSS e JS.
- O backend Express roda em paralelo, servindo rotas de API (exemplo: `/api/hello`).
- O comando `npm run dev` executa ambos simultaneamente.
- O jogo roda no navegador, usando canvas e scripts JS para animação, controles e lógica.
- Recursos (imagens, sons) são carregados da pasta `assets`.

## Como Rodar Localmente

1. Instale as dependências:
	 ```sh
	 npm install
	 ```
2. Inicie o ambiente de desenvolvimento:
	 ```sh
	 npm run dev
	 ```
3. Acesse o jogo em [http://localhost:3000](http://localhost:3000)

## Exemplo de Rota Backend

- `GET /api/hello` retorna uma mensagem JSON do backend.

---

Se precisar de mais detalhes sobre o funcionamento interno ou de algum arquivo específico, consulte os scripts em `src/scripts/` ou peça uma explicação detalhada.

