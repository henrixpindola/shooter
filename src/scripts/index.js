import '../styles/main.css';

function updateApp(message) {
  const app = document.getElementById('app');
  if (app) {
    app.textContent = message;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateApp('Carregando...');
  fetch('/api/hello')
    .then((r) => r.json())
    .then((data) => {
      updateApp(data.message || 'Olá!');
    })
    .catch(() => updateApp('Não foi possível carregar a mensagem.'));
});


