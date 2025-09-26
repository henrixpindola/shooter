/* ============================================================
   1 - CONFIGURAÇÃO INICIAL
============================================================ */
const canvas = document.getElementById('canvas_animacao');
const context = canvas.getContext('2d');

let imagens, animacao, teclado, colisor, nave, criadorInimigos;
let totalImagens = 0, carregadas = 0;
let musicaAcao;
let confirmacaoSairAtiva = false;

let overlay = null;

/* ============================================================
   2 - CARREGAMENTO DE RECURSOS
============================================================ */
carregarImagens();
carregarMusicas();

document.addEventListener('DOMContentLoaded', function() {
  criarOverlay();

  // Botão "Sair" - registra o clique
  const btnSair = document.getElementById('link_sair');
  if (btnSair) {
      btnSair.addEventListener('click', sairDoJogo);
  }
});


// Cria overlay (sempre escondido)
function criarOverlay() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'overlay hidden';
    overlay.innerHTML = `
        <div class="overlay-box">
            <h2>Deseja realmente sair do jogo?</h2>
            <p>Esta ação encerrará a partida atual e você perderá seu progresso.</p>
            <div class="overlay-botoes">
                <button id="btnContinuar">Continuar Jogando</button>
                <button id="btnSairConfirmar">Sair do Jogo</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btnContinuar').addEventListener('click', continuarJogando);
    document.getElementById('btnSairConfirmar').addEventListener('click', confirmarSaida);
}

// Mostrar/ocultar overlay
function mostrarOverlay() {
    if (!overlay || confirmacaoSairAtiva) return;
    overlay.classList.remove('hidden');
}

function esconderOverlay() {
    if (!overlay) return;
    overlay.classList.add('hidden');
}

// Carregar imagens
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
        imagens[i] = img;
    }
}

// Carregar música
function carregarMusicas() {
    musicaAcao = new Audio();
    musicaAcao.src = "assets/sounds/musica-acao.wav";
    musicaAcao.load();
    musicaAcao.volume = 0.5;
    musicaAcao.muted = false;
    musicaAcao.loop = true;

    atualizarInterfaceAudio();
}

// Atualizar botão de áudio
function atualizarInterfaceAudio() {
    const linkVolume = document.getElementById('link_volume');
    if (!linkVolume) return;

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
        esconderBotoesControle();
        esconderBotaoVoltar();
    }
}

/* ============================================================
   4 - OBJETOS DO JOGO
============================================================ */
function iniciarObjetos() {
    animacao = new Animacao(context);
    teclado = new Teclado(document);
    colisor = new Colisor();

    espaco = new Fundo(context, imagens.espaco);
    estrelas = new Fundo(context, imagens.estrelas);
    nuvens = new Fundo(context, imagens.nuvens);

    nave = new Nave(context, teclado, imagens.nave, imagens.explosao);
    painel = new Painel(context, nave);

    animacao.novoSprite(espaco);
    animacao.novoSprite(estrelas);
    animacao.novoSprite(nuvens);
    animacao.novoSprite(painel);
    animacao.novoSprite(nave);

    colisor.novoSprite(nave);
    animacao.novoProcessamento(colisor);

    configuracoesIniciais();
}

function configuracoesIniciais() {
    espaco.velocidade = 70;
    estrelas.velocidade = 160;
    nuvens.velocidade = 510;

    nave.posicionar();
    nave.velocidade = 210;
    nave.girando = false;

    criacaoInimigos();

    nave.acabaramVidas = function () {
        animacao.desligar();
        gameOver();
    };

    colisor.aoColidir = function (o1, o2) {
        if ((o1 instanceof Tiro && o2 instanceof Ovni) ||
            (o1 instanceof Ovni && o2 instanceof Tiro)) {

            painel.pontuacao += 10;
            let novoNivel = Math.floor(painel.pontuacao / 20) + 1;

            if (novoNivel > nave.nivel) {
                nave.nivel = novoNivel;
                espaco.velocidade += 5;
                estrelas.velocidade += 8;
                nuvens.velocidade += 12;

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
   5 - INIMIGOS (OVNIS)
============================================================ */
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

function novoOvni() {
    let imgOvni = imagens.ovni;
    let ovni = new Ovni(context, imgOvni, imagens.explosao);

    ovni.velocidade = Math.floor(500 + Math.random() * 501);
    ovni.x = Math.floor(Math.random() * (canvas.width - imgOvni.width + 1));
    ovni.y = -imgOvni.height;

    animacao.novoSprite(ovni);
    colisor.novoSprite(ovni);
}

/* ============================================================
   6 - CONTROLES E INTERFACE
============================================================ */
function pausarJogo() {
    if (confirmacaoSairAtiva) return;

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

function pausarJogoBotao() {
    pausarJogo();
    atualizarBotaoPausar();
}

function atualizarBotaoPausar() {
    const botaoPausar = document.getElementById('link_pausar');
    if (!botaoPausar) return;
    botaoPausar.textContent = animacao.ligado ? "Pausar" : "Continuar";
}

function mostrarBotoesControle() {
    const btnPausar = document.getElementById('link_pausar');
    const btnSair = document.getElementById('link_sair');

    if (btnPausar) btnPausar.style.display = "inline-block";
    if (btnSair) btnSair.style.display = "inline-block";
}

function esconderBotoesControle() {
    const btnPausar = document.getElementById('link_pausar');
    const btnSair = document.getElementById('link_sair');

    if (btnPausar) btnPausar.style.display = "none";
    if (btnSair) btnSair.style.display = "none";
}

function mostrarBotaoVoltar() {
    const btnVoltar = document.getElementById('link_voltar');
    if (btnVoltar) btnVoltar.classList.remove('hidden');
}

function esconderBotaoVoltar() {
    const btnVoltar = document.getElementById('link_voltar');
    if (btnVoltar) btnVoltar.classList.add('hidden');
}

function sairDoJogo() {
  if (confirmacaoSairAtiva) return;

  confirmacaoSairAtiva = true;

  // Pausa animação e música
  if (animacao) animacao.desligar();
  if (musicaAcao) musicaAcao.pause();
  ativarTiro(false);

  esconderBotoesControle();

  // Remove classe hidden para mostrar overlay
  if (overlay) overlay.classList.remove('hidden');
}

// CONTINUAR JOGANDO
function continuarJogando() {
    confirmacaoSairAtiva = false;
    esconderOverlay();
    mostrarBotoesControle();

    animacao?.ligar();
    if (!musicaAcao.muted) musicaAcao.play();
    ativarTiro(true);

    atualizarBotaoPausar();
}

// CONFIRMAR SAÍDA
function confirmarSaida() {
    confirmacaoSairAtiva = false;
    esconderOverlay();

    musicaAcao?.pause();
    musicaAcao.currentTime = 0;

    gameOver();
    atualizarBotaoPausar();
}

/* ============================================================
   7 - TIROS
============================================================ */
function ativarTiro(ativar) {
    if (ativar) {
        teclado.disparou(ESPACO, function () {
            if (!confirmacaoSairAtiva) {
                nave.atirar();
            }
        });
    } else {
        teclado.disparou(ESPACO, null);
    }
}

/* ============================================================
   8 - INÍCIO E FIM DO JOGO
============================================================ */
function mostrarLinkJogar() {
    const btnJogar = document.getElementById('link_jogar');
    if (btnJogar) btnJogar.classList.remove('hidden');
}

function esconderLinkJogar() {
    const btnJogar = document.getElementById('link_jogar');
    if (btnJogar) btnJogar.classList.add('hidden');
}

function toggleAudio() {
    musicaAcao.muted = !musicaAcao.muted;
    atualizarInterfaceAudio();
}

function iniciarJogo() {
    if (animacao) {
        nave.vidasExtras = 3;
        painel.pontuacao = 0;
        nave.nivel = 1;
        nave.formatoAtual = 0;
        nave.imagem = imagens.nave;
        nave.largura = nave.imagem.width;
        nave.altura = nave.imagem.height;
        nave.girando = false;
        nave.posicionar();

        espaco.velocidade = 70;
        estrelas.velocidade = 160;
        nuvens.velocidade = 510;

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

function removerInimigos() {
    if (!animacao || !animacao.sprites) return;
    for (let i = animacao.sprites.length - 1; i >= 0; i--) {
        if (animacao.sprites[i] instanceof Ovni) animacao.excluirSprite(animacao.sprites[i]);
    }

    if (!colisor || !colisor.sprites) return;
    for (let i = colisor.sprites.length - 1; i >= 0; i--) {
        if (colisor.sprites[i] instanceof Ovni) colisor.excluirSprite(colisor.sprites[i]);
    }
}

function gameOver() {
    animacao.desligar();
    musicaAcao.pause();
    musicaAcao.currentTime = 0;

    context.save();
    context.fillStyle = 'rgba(0,0,0,0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.strokeStyle = 'black';
    context.font = 'bold 40px sans-serif';
    context.textAlign = 'center';
    context.fillText("GAME OVER", canvas.width/2, 180);
    context.strokeText("GAME OVER", canvas.width/2, 180);

    context.font = '24px sans-serif';
    context.fillText("Pontuação: " + painel.pontuacao, canvas.width/2, 230);

    context.font = '20px sans-serif';
    context.fillText("Clique em 'Voltar' para recomeçar", canvas.width/2, 280);
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

    carregando();
}
