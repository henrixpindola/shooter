// Canvas e Context
const canvas = document.getElementById('canvas_animacao');
const context = canvas.getContext('2d');

// Variáveis principais
let imagens, animacao, teclado, colisor, nave, criadorInimigos;
let totalImagens = 0, carregadas = 0;
let musicaAcao;

// Variáveis para mudança automática da imagem da nave
let ultimaMudancaImagem = 0;
let intervaloMudancaImagem = 30000; // 30 segundos inicialmente

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
    // NOVAS IMAGENS DE FORMATO
    quadrado: "1quadrado.png",
    triangulo: "2triangulo.png",
    circulo: "3circulo.png",
    losango: "4losango.png"
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
  musicaAcao.volume = 0.5;
  musicaAcao.loop = true;
}

// Função para calcular o intervalo de mudança de imagem baseado no nível
function calcularIntervaloMudancaImagem(nivel) {
  if (nivel >= 1 && nivel <= 10) {
    return 10000
  } else if (nivel >= 11 && nivel <= 20) {
    return 8000; 
  } else if (nivel >= 21) {
    return 5000; 
  }
  return 2000; 
}

// Função para mudar a imagem da nave automaticamente
function mudarImagemNaveAutomaticamente() {
  if (!nave || !nave.imagensFormatos) {
    console.log("Nave ou imagensFormatos não disponível");
    return;
  }
  
  // Calcular novo intervalo baseado no nível atual
  intervaloMudancaImagem = calcularIntervaloMudancaImagem(nave.nivel);
  
  let agora = new Date().getTime();
  let decorrido = agora - ultimaMudancaImagem;
  
  if (decorrido >= intervaloMudancaImagem) {
    // Escolher uma imagem aleatória entre as 4 disponíveis
    let formatoAleatorio = Math.floor(Math.random() * 4); // 0, 1, 2 ou 3
    
    // Aplicar a mudança de formato
    nave.formatoAtual = formatoAleatorio;
    
    switch (formatoAleatorio) {
      case 0:
        nave.imagem = nave.imagensFormatos.quadrado;
        break;
      case 1:
        nave.imagem = nave.imagensFormatos.triangulo;
        break;
      case 2:
        nave.imagem = nave.imagensFormatos.circulo;
        break;
      case 3:
        nave.imagem = nave.imagensFormatos.losango;
        break;
    }
    
    nave.largura = nave.imagem.width;
    nave.altura = nave.imagem.height;
    
    nave.spritesheet.imagem = nave.imagem;
    
    ultimaMudancaImagem = agora;
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

  animacao.novoProcessamento({
    processar: function() {
      mudarImagemNaveAutomaticamente();
    }
  });

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

  // Inicializar propriedades de formato da nave
  nave.formatoAtual = 0;
  nave.nivel = 1;
  nave.imagensFormatos = {
    quadrado: imagens.quadrado,
    triangulo: imagens.triangulo,
    circulo: imagens.circulo,
    losango: imagens.losango
  };
  
  // Definir a imagem inicial da nave
  nave.imagem = nave.imagensFormatos.quadrado;
  nave.largura = nave.imagem.width;
  nave.altura = nave.imagem.height;
  
  // Log para debug
  console.log("🚀 Nave inicializada com imagem:", nave.imagem.src);
  console.log("📋 Imagens disponíveis:", nave.imagensFormatos);

  // Sistema de mudança automática de imagem implementado acima

  // Inimigos
  criacaoInimigos();

  // Game Over
  nave.acabaramVidas = function () {
    animacao.desligar();
    gameOver();
  }

  // Pontuação - CORRIGIDO: removida chamada problemática
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

  // Processamento para subir de nível - REMOVIDO para evitar duplicação
  // A lógica de subir de nível já está sendo tratada no colisor
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
    // Reinicializar tempo da última mudança de imagem ao despausar
    ultimaMudancaImagem = new Date().getTime();
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

// Inicia jogo
function iniciarJogo() {
  criadorInimigos.ultimoOvni = new Date().getTime();
  // Inicializar tempo da última mudança de imagem
  ultimaMudancaImagem = new Date().getTime();
  // Tiro
  ativarTiro(true);
  // Pausa
  teclado.disparou(ENTER, pausarJogo);

  document.getElementById('link_jogar').style.display = "none";

  musicaAcao.play();
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