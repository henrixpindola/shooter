// Canvas e Context
const canvas = document.getElementById('canvas_animacao');
const context = canvas.getContext('2d');

// Variáveis principais
let imagens, animacao, teclado, colisor, nave, criadorInimigos;
let totalImagens = 0, carregadas = 0;
let musicaAcao;

// Começa carregando as imagens
carregarImagens();
carregarMusicas();

function carregarImagens() {
  // Objeto contendo os nomes das imagens
  imagens = {
    espaco: "fundo-espaco.png",
    estrelas: "fundo-estrelas.png",
    nuvens: "fundo-nuvens.png",
    nave: "1quadrado.png",
    ovni: "ovni.png",
    explosao: "explosao.png",

  };
  // Carregar todas
  for (let i in imagens) {
    let img = new Image();
    img.src = "assets/img/" + imagens[i];
    img.onload = carregando;
    totalImagens++;

    // Substituir o nome pela imagem
    imagens[i] = img;
  }
}

function carregarMusicas() {
  musicaAcao = new Audio();
  musicaAcao.src = "assets/sounds/musica-acao.mp3";
  musicaAcao.load();
  //agora terá controle de volume e desativação de som
  musicaAcao.volume = 0.5;
  musicaAcao.muted = false;
  musicaAcao.loop = true;
    
  // Atualizar a interface com o estado inicial do áudio
  atualizarInterfaceAudio();
}

// Função para atualizar a interface do áudio
function atualizarInterfaceAudio() {
  const linkVolume = document.getElementById('link_volume');
  
  if (musicaAcao.muted) {
    linkVolume.textContent = "Áudio desligado";
    linkVolume.classList.add('muted');
  } else {
    linkVolume.textContent = "Áudio ligado";
    linkVolume.classList.remove('muted');
  }
}

// Função que mostra o progresso do carregamento
function carregando() {
  context.save();
  // Background
  context.drawImage(imagens.espaco, 0, 0, canvas.width, canvas.height);
  // Texto "Carregando"
  context.fillStyle = 'white';
  context.strokeStyle = 'black';
  context.font = '50px sans-serif';
  context.fillText("Carregando...", 100, 200);
  // Barra de loading
  carregadas++;
  let tamanhoTotal = 300;
  let tamanho = carregadas / totalImagens * tamanhoTotal;
  context.fillStyle = 'yellow';
  context.fillRect(100, 250, tamanho, 50);

  context.restore();

  if (carregadas == totalImagens) {
    iniciarObjetos();
    mostrarLinkJogar();
  }
}

// Função que inicia os objetos todos
function iniciarObjetos() {
  // Objetos principais
  animacao = new Animacao(context);
  teclado = new Teclado(document);
  colisor = new Colisor();
  espaco = new Fundo(context, imagens.espaco);
  estrelas = new Fundo(context, imagens.estrelas);
  nuvens = new Fundo(context, imagens.nuvens);
  nave = new Nave(context, teclado, imagens.nave, imagens.explosao);
  painel = new Painel(context, nave);

  // Ligações entre objetos
  animacao.novoSprite(espaco);
  animacao.novoSprite(estrelas);
  animacao.novoSprite(nuvens);
  animacao.novoSprite(painel);
  animacao.novoSprite(nave);

  colisor.novoSprite(nave);
  animacao.novoProcessamento(colisor);

  configuracoesIniciais();
}

// Velocidades, posições iniciais, controles, etc
function configuracoesIniciais() {
  // Fundos
  espaco.velocidade = 70;
  estrelas.velocidade = 160;
  nuvens.velocidade = 510;

  // Nave
  nave.posicionar();
  nave.velocidade = 210;

  // Inimigos
  criacaoInimigos();

  // Game Over
  nave.acabaramVidas = function () {
    animacao.desligar();
    gameOver();
  }

  // Pontuação - MODIFICADO PARA SUBIR DE NÍVEL
  colisor.aoColidir = function (o1, o2) {
    if ((o1 instanceof Tiro && o2 instanceof Ovni) ||
      (o1 instanceof Ovni && o2 instanceof Tiro)) {

      painel.pontuacao += 10;

      // Apenas atualiza o nível - SEM modificar formato para evitar travamento
      let novoNivel = Math.floor(painel.pontuacao / 20) + 1;
      if (novoNivel > nave.nivel) {
        nave.nivel = novoNivel;

        // Aumentar velocidades gradualmente
        espaco.velocidade += 5;
        estrelas.velocidade += 8;
        nuvens.velocidade += 12;

        // Aumentar a velocidade dos inimigos existentes
        for (let i = 0; i < animacao.sprites.length; i++) {
          if (animacao.sprites[i] instanceof Ovni) {
            animacao.sprites[i].velocidade += 20;
          }
        }

        console.log("Subiu para nível:", nave.nivel);
      }
    }
  }

}

// Cria os inimigos a cada 1 segundo
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

// Implementa um novo inimigo
function novoOvni() {
  let imgOvni = imagens.ovni;
  let ovni = new Ovni(context, imgOvni, imagens.explosao);
  // Mínimo: 500; máximo: 1000
  ovni.velocidade = Math.floor(500 + Math.random() * (1000 - 500 + 1));
  // Mínimo: 0; máximo: largura do canvas - largura do ovni
  ovni.x = Math.floor(Math.random() * (canvas.width - imgOvni.width + 1));
  // Descontar a altura
  ovni.y = -imgOvni.height;

  animacao.novoSprite(ovni);
  colisor.novoSprite(ovni);
}

// Pausa jogo
function pausarJogo() {
  if (animacao.ligado) {
    animacao.desligar();
    musicaAcao.pause();
    ativarTiro(false);
    // Escrever PAUSADO
    context.save();
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.font = "50px sans-serif";
    context.fillText("PAUSADO", 130, 250);
    context.restore();
  }
  else {
    criadorInimigos.ultimoOvni = new Date().getTime();
    animacao.ligar();
    musicaAcao.play();
    ativarTiro(true);
  }
}

// Atirar
function ativarTiro(ativar) {
  if (ativar) {
    teclado.disparou(ESPACO, function () {
      nave.atirar();
    });
  }
  else
    teclado.disparou(ESPACO, null);
}

// Mostra botão de início de jogo
function mostrarLinkJogar() {
  document.getElementById('link_jogar').style.display = "block";
}

// Função para alternar o estado do áudio
        function toggleAudio() {
        musicaAcao.muted = !musicaAcao.muted;
        atualizarInterfaceAudio(); // Usar a função correta
}

// Inicia jogo
function iniciarJogo() {
  criadorInimigos.ultimoOvni = new Date().getTime();
  // Tiro
  ativarTiro(true);
  // Pausa
  teclado.disparou(ENTER, pausarJogo);

  document.getElementById('link_jogar').style.display = "none";

  musicaAcao.play();
  animacao.ligar();

  // Iniciar música apenas se não estiver mudo
  if (!musicaAcao.muted) {
    musicaAcao.play();
  }
  animacao.ligar();
}

function gameOver() {
  // Tiro
  ativarTiro(false);
  // Pausa
  teclado.disparou(ENTER, null);
  // Parar música e rebobinar
  musicaAcao.pause();
  musicaAcao.currentTime = 0.0;
  // Fundo
  context.drawImage(imagens.espaco, 0, 0, canvas.width, canvas.height);
  // Texto Game Over
  context.save();
  context.fillStyle = 'white';
  context.font = '70px sans-serif';
  context.fillText('GAME OVER', 40, 200);
  context.fillText('Pontos: ' + painel.pontuacao, 70, 280);
  context.restore();
  // Voltar o link "Jogar"
  mostrarLinkJogar();
  // Restaurar as condições da nave
  nave.vidasExtras = 3;
  painel.pontuacao = 0;
  nave.nivel = 1;
  nave.formatoAtual = 0;
  nave.imagem = imagens.nave; // Voltar para imagem original
  nave.largura = nave.imagem.width;
  nave.altura = nave.imagem.height;
  nave.posicionar();
  animacao.novoSprite(nave);
  colisor.novoSprite(nave);
  // Restaurar velocidades dos fundos
  espaco.velocidade = 70;
  estrelas.velocidade = 160;
  nuvens.velocidade = 510;
  // Tirar todos os inimigos da tela
  removerInimigos();
}

function removerInimigos() {
  for (let i in animacao.sprites) {
    if (animacao.sprites[i] instanceof Ovni)
      animacao.excluirSprite(animacao.sprites[i]);
  }
}