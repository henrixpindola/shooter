import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Define o diretório raiz do projeto, onde o index.html está localizado.
  root: '.',
  // Define o diretório para assets estáticos. 'public' é o padrão.
  publicDir: 'public',
  server: {
    // Porta para o servidor de desenvolvimento
    port: 3000,
    // Abre o navegador automaticamente ao iniciar o servidor.
    open: true,
  },
  build: {
    // Diretório de saída para o build de produção.
    outDir: 'dist',
  },
});