/* ============================================================
   1 - CONFIGURAÇÃO INICIAL
============================================================ */
// Canvas e contexto do jogo
const canvas = document.getElementById('canvas_animacao');
const context = canvas.getContext('2d');

// Variáveis principais
let imagens, animacao, teclado, colisor, nave, criadorInimigos;
let totalImagens = 0, carregadas = 0;
let musicaAcao;


/* ============================================================
   2 - CARREGAMENTO DE RECURSOS
============================================================ */
// Inicia carregamento de imagens e músicas
carregarImagens();
carregarMusicas();

// Carregar imagens do jogo
function carregarImagens() {
  imagens = {
    espaco: "fundo-espaco.png",
    estrelas: "fundo-estrelas.png",
    nuvens: "fundo-nuvens.png",
    nave: "1quadrado.png",
    ovni: "ovni.png",
    explosao: "explosao.png",
  };

  for (let i in imagens) {
    let img = new Image();
    img.src = "assets/img/" + imagens[i];
    img.onload = carregando;
    totalImagens++;
    imagens[i] = img; // Troca string pela imagem carregada
  }
}

// Carregar música de fundo
function carregarMusicas() {
  musicaAcao = new Audio();
  musicaAcao.src = "assets/sounds/musica-acao.mp3";
  musicaAcao.load();
  musicaAcao.volume = 0.5;
  musicaAcao.muted = false;
  musicaAcao.loop = true;

  atualizarInterfaceAudio();
}

// Atualiza o estado do botão de áudio
function atualizarInterfaceAudio() {
  const linkVolume = document.getElementById('link_volume');

  if (musicaAcao.muted) {
    linkVolume.textContent = "Áudio: off";
    linkVolume.classList.add('muted');
  } else {
    linkVolume.textContent = "Áudio: on";
    linkVolume.classList.remove('muted');
  }
}


/* ============================================================
   3 - TELA DE LOADING
============================================================ */
function carregando() {
  context.save();
  context.drawImage(imagens.espaco, 0, 0, canvas.width, canvas.height);
  context.fillStyle = 'white';
  context.strokeStyle = 'black';
  context.font = '30px sans-serif';
  context.fillText("Acabe com estes OVNIS!", 50, 100);
  carregadas++;
  context.restore();

  if (carregadas == totalImagens) {
    iniciarObjetos();
    mostrarLinkJogar();
  }
}


/* ============================================================
   4 - OBJETOS DO JOGO
============================================================ */
function iniciarObjetos() {
  // Núcleo do jogo
  animacao = new Animacao(context);
  teclado = new Teclado(document);
  colisor = new Colisor();

  // Fundos
  espaco = new Fundo(context, imagens.espaco);
  estrelas = new Fundo(context, imagens.estrelas);
  nuvens = new Fundo(context, imagens.nuvens);

  // Player e HUD
  nave = new Nave(context, teclado, imagens.nave, imagens.explosao);
  painel = new Painel(context, nave);

  // Adiciona sprites na animação
  animacao.novoSprite(espaco);
  animacao.novoSprite(estrelas);
  animacao.novoSprite(nuvens);
  animacao.novoSprite(painel);
  animacao.novoSprite(nave);

  // Colisões
  colisor.novoSprite(nave);
  animacao.novoProcessamento(colisor);

  configuracoesIniciais();
}

// Configurações padrão do jogo
function configuracoesIniciais() {
  // Velocidade dos fundos
  espaco.velocidade = 70;
  estrelas.velocidade = 160;
  nuvens.velocidade = 510;

  // Nave
  nave.posicionar();
  nave.velocidade = 210;

  // Inimigos
  criacaoInimigos();

  // Game Over ao perder todas vidas
  nave.acabaramVidas = function () {
    animacao.desligar();
    gameOver();
  };

  /* ============================================================
     5 - PONTUAÇÃO E COLISÕES
  ============================================================ */
  // Pontuação e progressão de nível
  colisor.aoColidir = function (o1, o2) {
    if ((o1 instanceof Tiro && o2 instanceof Ovni) ||
        (o1 instanceof Ovni && o2 instanceof Tiro)) {

      painel.pontuacao += 10;

      // Calcula nível atual
      let novoNivel = Math.floor(painel.pontuacao / 20) + 1;
      if (novoNivel > nave.nivel) {
        nave.nivel = novoNivel;

        // Aumenta velocidades
        espaco.velocidade += 5;
        estrelas.velocidade += 8;
        nuvens.velocidade += 12;

        // Acelera inimigos já em tela
        for (let i = 0; i < animacao.sprites.length; i++) {
          if (animacao.sprites[i] instanceof Ovni) {
            animacao.sprites[i].velocidade += 20;
          }
        }

        console.log("Subiu para nível:", nave.nivel);
      }
    }
  };
}


/* ============================================================
   6 - INIMIGOS (OVNIS)
============================================================ */
// Geração contínua de inimigos
function criacaoInimigos() {
  criadorInimigos = {
    ultimoOvni: new Date().getTime(),

    processar: function () {
      let agora = new Date().getTime();
      let decorrido = agora - this.ultimoOvni;
      if (decorrido > 1000) {
        novoOvni();
        this.ultimoOvni = agora;
      }
    }
  };

  animacao.novoProcessamento(criadorInimigos);
}

// Criar inimigo
function novoOvni() {
  let imgOvni = imagens.ovni;
  let ovni = new Ovni(context, imgOvni, imagens.explosao);

  ovni.velocidade = Math.floor(500 + Math.random() * (1000 - 500 + 1));
  ovni.x = Math.floor(Math.random() * (canvas.width - imgOvni.width + 1));
  ovni.y = -imgOvni.height;

  animacao.novoSprite(ovni);
  colisor.novoSprite(ovni);
}


/* ============================================================
   7 - CONTROLES E INTERFACE
============================================================ */
// Pausar ou retomar jogo
function pausarJogo() {
  if (animacao.ligado) {
    animacao.desligar();
    musicaAcao.pause();
    ativarTiro(false);

    context.save();
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.font = "50px sans-serif";
    context.fillText("PAUSADO", 130, 250);
    context.restore();
  } else {
    criadorInimigos.ultimoOvni = new Date().getTime();
    animacao.ligar();
    musicaAcao.play();
    ativarTiro(true);
  }
}

// Alternar texto do botão Pausar
function pausarJogoBotao() {
  pausarJogo();
  const botaoPausar = document.getElementById('link_pausar');
  botaoPausar.textContent = animacao.ligado ? "Pausar" : "Continuar";
}

// Sair e encerrar
function sairDoJogo() {
  animacao.desligar();
  musicaAcao.pause();
  musicaAcao.currentTime = 0.0;
  gameOver();
}


/* ============================================================
   8 - TIROS
============================================================ */
// Ativar ou desativar tiro
function ativarTiro(ativar) {
  if (ativar) {
    teclado.disparou(ESPACO, function () {
      nave.atirar();
    });
  } else {
    teclado.disparou(ESPACO, null);
  }
}


/* ============================================================
   9 - INÍCIO E FIM DO JOGO
============================================================ */
// Exibir botão Jogar
function mostrarLinkJogar() {
  document.getElementById('link_jogar').style.display = "block";
}

// Alternar áudio on/off
function toggleAudio() {
  musicaAcao.muted = !musicaAcao.muted;
  atualizarInterfaceAudio();
}

// Função unificada para iniciar/reiniciar o jogo
function iniciarJogo() {
  // Resetar estado do jogo se for um reinício
  if (animacao) {
    // Resetar nave e painel
    nave.vidasExtras = 3;
    painel.pontuacao = 0;
    nave.nivel = 1;
    nave.formatoAtual = 0;
    nave.imagem = imagens.nave;
    nave.largura = nave.imagem.width;
    nave.altura = nave.imagem.height;
    nave.posicionar();

    // Resetar velocidades dos fundos
    espaco.velocidade = 70;
    estrelas.velocidade = 160;
    nuvens.velocidade = 510;

    // Remover inimigos existentes
    removerInimigos();

    // Garantir que a nave está na animação e colisor
    if (!animacao.sprites.includes(nave)) {
      animacao.novoSprite(nave);
    }
    if (!colisor.sprites.includes(nave)) {
      colisor.novoSprite(nave);
    }
  }

  // Configurações comuns para iniciar e reiniciar
  criadorInimigos.ultimoOvni = new Date().getTime();

  ativarTiro(true);
  teclado.disparou(ENTER, pausarJogo);

  document.getElementById('link_jogar').style.display = "none";

  if (!musicaAcao.muted) {
    musicaAcao.currentTime = 0.0;
    musicaAcao.play();
  }
  
  animacao.ligar();
}

// Fim de jogo
function gameOver() {
  ativarTiro(false);
  teclado.disparou(ENTER, null);

  musicaAcao.pause();
  musicaAcao.currentTime = 0.0;

  context.drawImage(imagens.espaco, 0, 0, canvas.width, canvas.height);

  context.save();
  context.fillStyle = 'white';
  context.font = '70px sans-serif';
  context.fillText('GAME OVER', 40, 200);
  context.fillText('Pontos: ' + painel.pontuacao, 70, 280);
  context.restore();

  mostrarLinkJogar();
  esconderBotoesControle();
}

// Limpa inimigos restantes
function removerInimigos() {
  if (!animacao || !animacao.sprites) return;
  
  for (let i = animacao.sprites.length - 1; i >= 0; i--) {
    if (animacao.sprites[i] instanceof Ovni) {
      animacao.excluirSprite(animacao.sprites[i]);
    }
  }
}

// Esconder botões de controle (função adicionada para completar o código)
function esconderBotoesControle() {
  // Implementação para esconder botões de controle se necessário
}