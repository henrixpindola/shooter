import { Animacao } from './scripts/animacao.js';
import { Colisor } from './scripts/colisor.js';
import { Explosao } from './scripts/explosao.js';
import { Fundo } from './scripts/fundo.js';
import { Nave } from './scripts/nave.js';
import { Ovni } from './scripts/ovni.js';
import { Painel } from './scripts/painel.js';
import { Teclado, ESPACO } from './scripts/teclado.js';
import { Tiro } from './scripts/tiro.js';

console.log('main.js: Módulo iniciado.');

// 1. CONFIGURAÇÃO INICIAL
const canvas = document.getElementById('canvas_animacao');
const context = canvas.getContext('2d');

const btnJogar = document.getElementById('link_jogar');
const btnVoltar = document.getElementById('link_voltar');
const btnVolume = document.getElementById('link_volume');
const btnPausar = document.getElementById('link_pausar');
const btnSair = document.getElementById('link_sair');
const overlay = criarOverlay();

let animacao, teclado, colisor, nave, painel;
let musicaAcao;
let confirmacaoSairAtiva = false;
let criadorInimigos;

const imagens = {
  espaco: '/assets/img/fundo-espaco.png',
  estrelas: '/assets/img/fundo-estrelas.png',
  nuvens: '/assets/img/fundo-nuvens.png',
  nave: '/assets/img/1quadrado.png',
  ovni: '/assets/img/ovni.png',
  explosao: '/assets/img/explosao.png',
};
const sons = {
  acao: '/assets/snd/musica-acao.wav',
};

// 2. LÓGICA PRINCIPAL
document.addEventListener('DOMContentLoaded', () => {
  console.log('main.js: DOMContentLoaded disparado.');
  carregarAssets();
  vincularEventosUI();
});

function carregarAssets() {
  console.log('main.js: Iniciando carregamento de assets.');
  let imagensCarregadas = 0;
  const totalImagens = Object.keys(imagens).length;

  desenharTelaLoading('Carregando recursos...');

  for (const key in imagens) {
    const img = new Image();
    img.src = imagens[key];
    img.onload = () => {
      imagensCarregadas++;
      console.log(`main.js: Imagem carregada (${imagensCarregadas}/${totalImagens}): ${key}`);
      desenharTelaLoading();
      if (imagensCarregadas === totalImagens) {
        console.log('main.js: Todas as imagens foram carregadas. Preparando para jogar.');
        // A música será carregada em segundo plano, não bloqueando a UI.
        musicaAcao = new Audio(sons.acao);
        musicaAcao.volume = 0.5;
        musicaAcao.loop = true;
        musicaAcao.load();
        prepararParaJogar();
      }
    };
    img.onerror = () => {
        console.error(`main.js: Falha ao carregar imagem: ${key} em ${imagens[key]}`);
    };
    imagens[key] = img;
  }
}

function desenharTelaLoading(texto = "Acabe com estes OVNIS!") {
  context.save();
  if (imagens.espaco instanceof HTMLImageElement && imagens.espaco.complete) {
    context.drawImage(imagens.espaco, 0, 0, canvas.width, canvas.height);
  } else {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.fillStyle = 'white';
  context.strokeStyle = 'black';
  context.font = '30px sans-serif';
  context.textAlign = 'center';
  context.fillText(texto, canvas.width / 2, 100);
  context.restore();
}

let jogoPronto = false;
function prepararParaJogar() {
    if (jogoPronto) return; // Prevenir chamada dupla
    jogoPronto = true;
    console.log('main.js: Jogo está pronto. Iniciando objetos e mostrando link para jogar.');
    desenharTelaLoading();
    iniciarObjetos();
    mostrarLinkJogar();
    esconderBotoesControle();
    esconderBotaoVoltar();
}

function vincularEventosUI() {
  console.log('main.js: Vinculando eventos da UI.');
  btnVolume.addEventListener('click', toggleAudio);
  btnPausar.addEventListener('click', pausarJogoBotao);
  btnSair.addEventListener('click', sairDoJogo);
  btnJogar.addEventListener('click', iniciarJogo);
  btnVoltar.addEventListener('click', voltarTelaCarregamento);
}

// 3. INICIALIZAÇÃO DOS OBJETOS DO JOGO
function iniciarObjetos() {
  console.log('main.js: Iniciando objetos do jogo (Animação, Teclado, etc.).');
  animacao = new Animacao(context);
  teclado = new Teclado(document);
  colisor = new Colisor();

  const fundoEspaco = new Fundo(context, imagens.espaco);
  const fundoEstrelas = new Fundo(context, imagens.estrelas);
  const fundoNuvens = new Fundo(context, imagens.nuvens);

  nave = new Nave(context, teclado, imagens.nave, imagens.explosao);
  painel = new Painel(context, nave);

  animacao.novoSprite(fundoEspaco);
  animacao.novoSprite(fundoEstrelas);
  animacao.novoSprite(fundoNuvens);
  animacao.novoSprite(painel);
  animacao.novoSprite(nave);

  colisor.novoSprite(nave);
  animacao.novoProcessamento(colisor);

  configuracoesIniciais(fundoEspaco, fundoEstrelas, fundoNuvens);
}

function configuracoesIniciais(espaco, estrelas, nuvens) {
  console.log('main.js: Aplicando configurações iniciais.');
  espaco.velocidade = 70;
  estrelas.velocidade = 160;
  nuvens.velocidade = 510;
  nave.posicionar();
  nave.velocidade = 210;

  nave.acabaramVidas = () => {
    animacao.desligar();
    gameOver();
  };

  colisor.aoColidir = (o1, o2) => {
    if ((o1 instanceof Tiro && o2 instanceof Ovni) || (o1 instanceof Ovni && o2 instanceof Tiro)) {
      painel.pontuacao += 10;
      const novoNivel = Math.floor(painel.pontuacao / 20) + 1;

      if (novoNivel > nave.nivel) {
        nave.nivel = novoNivel;
        espaco.velocidade += 5;
        estrelas.velocidade += 8;
        nuvens.velocidade += 12;

        for (const sprite of animacao.sprites) {
          if (sprite instanceof Ovni) {
            sprite.velocidade += 20;
          }
        }
      }
    }
  };

  criadorInimigos = {
    ultimoOvni: 0,
    processar: function () {
      const agora = new Date().getTime();
      if (agora - this.ultimoOvni > 1000) {
        novoOvni();
        this.ultimoOvni = agora;
      }
    },
  };
  animacao.novoProcessamento(criadorInimigos);
}

// 4. INIMIGOS (OVNIS)
function novoOvni() {
  const ovni = new Ovni(context, imagens.ovni, imagens.explosao);
  ovni.velocidade = Math.floor(500 + Math.random() * 501);
  ovni.x = Math.floor(Math.random() * (canvas.width - imagens.ovni.width + 1));
  ovni.y = -imagens.ovni.height;

  animacao.novoSprite(ovni);
  colisor.novoSprite(ovni);
}

function removerInimigos() {
  for (let i = animacao.sprites.length - 1; i >= 0; i--) {
    if (animacao.sprites[i] instanceof Ovni) {
      animacao.excluirSprite(animacao.sprites[i]);
    }
  }
}

// 5. CONTROLES DO JOGO E UI
function iniciarJogo() {
  console.log('main.js: Jogo iniciado.');
  if (animacao) {
    nave.vidasExtras = 3;
    painel.pontuacao = 0;
    nave.nivel = 1;
    nave.posicionar();

    const fundos = animacao.sprites.filter(s => s instanceof Fundo);
    if (fundos[0]) fundos[0].velocidade = 70;
    if (fundos[1]) fundos[1].velocidade = 160;
    if (fundos[2]) fundos[2].velocidade = 510;

    removerInimigos();

    if (!animacao.sprites.includes(nave)) animacao.novoSprite(nave);
    if (!colisor.sprites.includes(nave)) colisor.novoSprite(nave);
  }

  animacao.ligar();
  if (!musicaAcao.muted) musicaAcao.play();

  ativarTiro(true);
  mostrarBotoesControle();
  esconderLinkJogar();
  esconderBotaoVoltar();
  esconderOverlay();
  confirmacaoSairAtiva = false;
  atualizarBotaoPausar();
}

function pausarJogo() {
  if (confirmacaoSairAtiva) return;
  if (animacao.ligado) {
    animacao.desligar();
    musicaAcao.pause();
    ativarTiro(false);

    context.save();
    context.fillStyle = 'rgba(0,0,0,0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.strokeStyle = 'black';
    context.font = '50px sans-serif';
    context.textAlign = 'center';
    context.fillText('PAUSADO', canvas.width / 2, canvas.height / 2);
    context.restore();
  } else {
    criadorInimigos.ultimoOvni = new Date().getTime();
    animacao.ligar();
    if (!musicaAcao.muted) musicaAcao.play();
    ativarTiro(true);
  }
}

function pausarJogoBotao() {
  pausarJogo();
  atualizarBotaoPausar();
}

function sairDoJogo() {
  if (confirmacaoSairAtiva) return;
  confirmacaoSairAtiva = true;
  if (animacao) animacao.desligar();
  if (musicaAcao) musicaAcao.pause();
  ativarTiro(false);
  esconderBotoesControle();
  mostrarOverlay();
}

function gameOver() {
  animacao.desligar();
  musicaAcao.pause();
  musicaAcao.currentTime = 0;
  ativarTiro(false);

  context.save();
  context.fillStyle = 'rgba(0,0,0,0.7)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'white';
  context.strokeStyle = 'black';
  context.font = 'bold 40px sans-serif';
  context.textAlign = 'center';
  context.fillText('GAME OVER', canvas.width / 2, 180);
  context.strokeText('GAME OVER', canvas.width / 2, 180);
  context.font = '24px sans-serif';
  context.fillText(`Pontuação: ${painel.pontuacao}`, canvas.width / 2, 230);
  context.font = '20px sans-serif';
  context.fillText("Clique em 'Voltar' para recomeçar", canvas.width / 2, 280);
  context.restore();

  esconderBotoesControle();
  mostrarBotaoVoltar();
  esconderLinkJogar();
  esconderOverlay();
}

function voltarTelaCarregamento() {
  animacao.desligar();
  musicaAcao.pause();
  musicaAcao.currentTime = 0;

  esconderBotaoVoltar();
  esconderBotoesControle();
  esconderOverlay();
  mostrarLinkJogar();

  desenharTelaLoading();
}

// 6. FUNÇÕES AUXILIARES DE UI
function mostrarBotoesControle() {
  btnPausar.style.display = 'inline-block';
  btnSair.style.display = 'inline-block';
}
function esconderBotoesControle() {
  btnPausar.style.display = 'none';
  btnSair.style.display = 'none';
}
function mostrarLinkJogar() {
  console.log('main.js: Mostrando o botão de jogar.');
  btnJogar.classList.remove('hidden');
}
function esconderLinkJogar() {
  btnJogar.classList.add('hidden');
}
function mostrarBotaoVoltar() {
  btnVoltar.classList.remove('hidden');
}
function esconderBotaoVoltar() {
  btnVoltar.classList.add('hidden');
}
function atualizarBotaoPausar() {
  btnPausar.textContent = animacao.ligado ? 'Pausar' : 'Continuar';
}
function toggleAudio() {
  musicaAcao.muted = !musicaAcao.muted;
  btnVolume.textContent = musicaAcao.muted ? 'Áudio: off' : 'Áudio: on';
  btnVolume.classList.toggle('muted', musicaAcao.muted);
}
function ativarTiro(ativar) {
  if (ativar) {
    teclado.disparou(ESPACO, () => {
      if (!confirmacaoSairAtiva) {
        nave.atirar();
      }
    });
  } else {
    teclado.disparou(ESPACO, null);
  }
}

// Overlay de confirmação de saída
function criarOverlay() {
  const overlayDiv = document.createElement('div');
  overlayDiv.className = 'overlay hidden';
  overlayDiv.innerHTML = `
        <div class="overlay-box">
            <h2>Deseja realmente sair do jogo?</h2>
            <p>Esta ação encerrará a partida atual e você perderá seu progresso.</p>
            <div class="overlay-botoes">
                <button id="btnContinuar">Continuar Jogando</button>
                <button id="btnSairConfirmar">Sair do Jogo</button>
            </div>
        </div>
    `;
  document.body.appendChild(overlayDiv);

  document.getElementById('btnContinuar').addEventListener('click', () => {
    confirmacaoSairAtiva = false;
    esconderOverlay();
    mostrarBotoesControle();
    animacao?.ligar();
    if (!musicaAcao.muted) musicaAcao.play();
    ativarTiro(true);
    atualizarBotaoPausar();
  });

  document.getElementById('btnSairConfirmar').addEventListener('click', () => {
    confirmacaoSairAtiva = false;
    esconderOverlay();
    musicaAcao?.pause();
    if(musicaAcao) musicaAcao.currentTime = 0;
    gameOver();
    atualizarBotaoPausar();
  });

  return overlayDiv;
}

function mostrarOverlay() {
  if (overlay) overlay.classList.remove('hidden');
}
function esconderOverlay() {
  if (overlay) overlay.classList.add('hidden');
}