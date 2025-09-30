/* ============================================================
   1 - CONFIGURAÇÃO INICIAL
============================================================ */
const canvas = document.getElementById("canvas_animacao")
const context = canvas.getContext("2d")

let imagens, animacao, teclado, colisor, nave, criadorInimigos, painel, espaco, estrelas, nuvens
let totalImagens = 0,
  carregadas = 0
let musicaAcao
let confirmacaoSairAtiva = false

let overlay = null
const TOTAL_SLOTS = 3

/* ============================================================
   2 - CARREGAMENTO DE RECURSOS
============================================================ */
carregarImagens()
carregarMusicas()

/* ============================================================
   INICIALIZAÇÃO
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  criarOverlay()

  // Botão "Sair" - registra o clique
  const btnSair = document.getElementById("link_sair")
  if (btnSair) {
    btnSair.addEventListener("click", sairDoJogo)
  }

  // Botão "Salvar" - agora mostra diretamente os slots
  const btnSalvar = document.getElementById("link_salvar")
  if (btnSalvar) {
    btnSalvar.addEventListener("click", () => {
      pausarParaSalvar()
    })
  }

  // Botão "Carregar" - mostra slots com botões de exclusão
  const btnCarregar = document.getElementById("link_carregar")
  if (btnCarregar) {
    btnCarregar.addEventListener("click", () => {
      mostrarOverlayCarregar()
    })
  }

  // Atualizar interface do botão carregar na inicialização
  atualizarInterfaceCarregar()
})

/* ============================================================
   FUNÇÕES DE SALVAR E CARREGAR JOGO - MÚLTIPLOS SLOTS
============================================================ */

// Função para obter estado atual do jogo
function obterEstadoJogo() {
  return {
    pontuacao: painel.pontuacao,
    nivel: nave.nivel,
    vidas: nave.vidasExtras,
    velocidadeEspaco: espaco.velocidade,
    velocidadeEstrelas: estrelas.velocidade,
    velocidadeNuvens: nuvens.velocidade,
    dataSalvamento: new Date().toISOString(),
    posicaoNave: {
      x: nave.x,
      y: nave.y,
    },
  }
}

// Função para salvar o jogo em um slot específico
function salvarJogo(slot) {
  if (confirmacaoSairAtiva || !nave) {
    console.log("Não é possível salvar o jogo agora")
    return false
  }

  try {
    const estadoJogo = obterEstadoJogo()
    localStorage.setItem(`jogoSalvo_slot_${slot}`, JSON.stringify(estadoJogo))
    mostrarMensagemSalvamento(slot)
    console.log(`Jogo salvo no slot ${slot} com sucesso!`, estadoJogo)

    // Atualizar interface para mostrar que existe jogo salvo
    atualizarInterfaceCarregar()
    return true
  } catch (error) {
    console.error("Erro ao salvar jogo:", error)
    mostrarErroSalvamento()
    return false
  }
}

// Função para verificar se existe jogo salvo em algum slot
function existeJogoSalvo() {
  for (let i = 1; i <= TOTAL_SLOTS; i++) {
    if (localStorage.getItem(`jogoSalvo_slot_${i}`) !== null) {
      return true
    }
  }
  return false
}

// Função para verificar se um slot específico está ocupado
function slotOcupado(slot) {
  return localStorage.getItem(`jogoSalvo_slot_${slot}`) !== null
}

// Função para carregar jogo de um slot específico
function carregarJogo(slot) {
  if (!slotOcupado(slot)) {
    console.log(`Nenhum jogo salvo encontrado no slot ${slot}`)
    return false
  }

  try {
    const estadoJogo = JSON.parse(localStorage.getItem(`jogoSalvo_slot_${slot}`))

    // Restaurar estado do jogo
    painel.pontuacao = estadoJogo.pontuacao || 0
    nave.nivel = estadoJogo.nivel || 1
    nave.vidasExtras = estadoJogo.vidas || 3

    // Restaurar velocidades
    espaco.velocidade = estadoJogo.velocidadeEspaco || 70
    estrelas.velocidade = estadoJogo.velocidadeEstrelas || 160
    nuvens.velocidade = estadoJogo.velocidadeNuvens || 510

    // Restaurar posição da nave se existir
    if (estadoJogo.posicaoNave) {
      nave.x = estadoJogo.posicaoNave.x
      nave.y = estadoJogo.posicaoNave.y
    } else {
      nave.posicionar()
    }

    // Limpar inimigos existentes e recriar com nível apropriado
    removerInimigos()

    console.log(`Jogo carregado do slot ${slot} com sucesso!`, estadoJogo)
    mostrarMensagemCarregamento(slot)

    // Se o jogo não estava rodando, iniciar após carregar
    if (!animacao.ligado) {
      iniciarJogoAposCarregar()
    }

    return true
  } catch (error) {
    console.error("Erro ao carregar jogo:", error)
    mostrarErroCarregamento()
    return false
  }
}

// Função para obter informações de um slot
function obterInfoSlot(slot) {
  const dados = localStorage.getItem(`jogoSalvo_slot_${slot}`)
  if (!dados) return null

  try {
    const estado = JSON.parse(dados)
    return {
      slot: slot,
      pontuacao: estado.pontuacao,
      nivel: estado.nivel,
      vidas: estado.vidas,
      data: new Date(estado.dataSalvamento),
      ocupado: true,
    }
  } catch (error) {
    console.error("Erro ao ler dados do slot:", error)
    return null
  }
}

// Função para obter informações de todos os slots
function obterTodosSlots() {
  const slots = []
  for (let i = 1; i <= TOTAL_SLOTS; i++) {
    slots.push(obterInfoSlot(i) || { slot: i, ocupado: false })
  }
  return slots
}

function deletarSlot(slot) {
  try {
    localStorage.removeItem(`jogoSalvo_slot_${slot}`)
    console.log(`Slot ${slot} deletado com sucesso`)

    // Atualizar interface do botão carregar
    atualizarInterfaceCarregar()

    return true
  } catch (error) {
    console.error("Erro ao deletar slot:", error)
    return false
  }
}

/* ============================================================
   OVERLAYS DE SLOTS
============================================================ */

function removerTodosOverlays() {
  const overlays = document.querySelectorAll(".overlay:not(#overlay-sair)")
  overlays.forEach((overlay) => overlay.remove())
}

// Nova função para pausar o jogo antes de mostrar a tela de salvar
function pausarParaSalvar() {
  if (confirmacaoSairAtiva || !nave) return
  
  // Pausa o jogo antes de mostrar a tela de salvar
  if (animacao.ligado) {
    animacao.desligar()
    musicaAcao.pause()
    ativarTiro(false)
  }
  
  mostrarOverlaySalvar()
}

function mostrarOverlaySalvar() {
  if (confirmacaoSairAtiva || !nave) return

  // Remove qualquer overlay anterior
  removerTodosOverlays()

  const overlaySalvar = document.createElement("div")
  overlaySalvar.className = "overlay"
  overlaySalvar.id = "overlay-salvar"
  overlaySalvar.innerHTML = `
        <div class="overlay-box">
            <h2>Salvar Jogo</h2>
            <p>Escolha um slot para salvar seu progresso:</p>
            <div class="slots-container" id="slotsSalvar">
                ${gerarHTMLSlots("salvar")}
            </div>
            <div class="overlay-acoes">
                <button id="btnContinuarJogandoSalvar" class="btn-continuar-overlay">Continuar Jogando</button>
            </div>
        </div>
    `
  document.body.appendChild(overlaySalvar)

  // Adicionar eventos aos slots
  const slots = document.querySelectorAll("#slotsSalvar .slot-item")
  slots.forEach((slot) => {
    slot.addEventListener("click", function () {
      const slotNum = Number.parseInt(this.dataset.slot)

      // Se o slot já estiver ocupado, mostrar confirmação
      if (slotOcupado(slotNum)) {
        mostrarConfirmacaoSobrescrever(slotNum)
      } else {
        // Slot vazio, salvar diretamente
        if (salvarJogo(slotNum)) {
          overlaySalvar.remove()
          // Não retoma o jogo automaticamente - usuário precisa pressionar "Continuar Jogando"
        }
      }
    })
  })

  // Evento para o botão "Continuar Jogando"
  document.getElementById("btnContinuarJogandoSalvar").addEventListener("click", () => {
    overlaySalvar.remove()
    retomarJogoAposSalvar()
  })

  // Evento para o botão voltar
  document.getElementById("btnVoltarSalvar").addEventListener("click", () => {
    overlaySalvar.remove()
    retomarJogoAposSalvar()
  })
}

function mostrarOverlayCarregar() {
  // Remove qualquer overlay anterior
  removerTodosOverlays()

  const overlayCarregar = document.createElement("div")
  overlayCarregar.className = "overlay"
  overlayCarregar.id = "overlay-carregar"
  overlayCarregar.innerHTML = `
        <div class="overlay-box">
            <h2>Carregar Jogo</h2>
            <p>Escolha um slot para carregar:</p>
            <div class="slots-container" id="slotsCarregar">
                ${gerarHTMLSlots("carregar")}
            </div>
            <div class="overlay-acoes">
                <button id="btnVoltarCarregar" class="btn-voltar-overlay">Voltar</button>
            </div>
        </div>
    `
  document.body.appendChild(overlayCarregar)

  // Adicionar eventos aos slots para carregar
  const slots = document.querySelectorAll("#slotsCarregar .slot-item")
  slots.forEach((slot) => {
    if (!slot.classList.contains("vazio")) {
      slot.addEventListener("click", function (e) {
        // Verifica se o clique não foi no botão de deletar
        if (!e.target.classList.contains("btn-deletar-slot")) {
          const slotNum = Number.parseInt(this.dataset.slot)
          if (carregarJogo(slotNum)) {
            overlayCarregar.remove()
          }
        }
      })
    }
  })

  // Adicionar eventos aos botões de exclusão
  const botoesDeletar = document.querySelectorAll("#slotsCarregar .btn-deletar-slot")
  botoesDeletar.forEach((botao) => {
    botao.addEventListener("click", function (e) {
      e.stopPropagation() // Impede que o clique no botão dispare o evento do slot
      const slotNum = Number.parseInt(this.dataset.slot)
      if (confirm(`Tem certeza que deseja deletar o slot ${slotNum}?`)) {
        if (deletarSlot(slotNum)) {
          // Recarregar o overlay para mostrar as mudanças
          mostrarOverlayCarregar()
        }
      }
    })
  })

  // Evento para o botão voltar
  document.getElementById("btnVoltarCarregar").addEventListener("click", () => {
    overlayCarregar.remove()
  })
}

function mostrarConfirmacaoSobrescrever(slot) {
  // Remove overlay de salvar
  const overlaySalvar = document.getElementById("overlay-salvar")
  if (overlaySalvar) {
    overlaySalvar.remove()
  }

  const overlayConfirmacao = document.createElement("div")
  overlayConfirmacao.className = "overlay"
  overlayConfirmacao.id = "overlay-confirmacao"
  overlayConfirmacao.innerHTML = `
        <div class="overlay-box">
            <h2>Slot Ocupado</h2>
            <p>O slot ${slot} já contém um jogo salvo. Deseja sobrescrevê-lo?</p>
            <div class="overlay-botoes">
                <button id="btnCancelarSobrescrever">Cancelar</button>
                <button id="btnConfirmarSobrescrever">Sobrescrever</button>
            </div>
        </div>
    `
  document.body.appendChild(overlayConfirmacao)

  document.getElementById("btnCancelarSobrescrever").addEventListener("click", () => {
    overlayConfirmacao.remove()
    // Volta para o overlay de salvar
    mostrarOverlaySalvar()
  })

  document.getElementById("btnConfirmarSobrescrever").addEventListener("click", () => {
    if (salvarJogo(slot)) {
      overlayConfirmacao.remove()
      // Não retoma o jogo automaticamente - usuário precisa pressionar "Continuar Jogando"
    }
  })
}

// Gerar HTML dos slots
function gerarHTMLSlots(tipo) {
  const slots = obterTodosSlots()
  return slots
    .map((slot) => {
      if (slot.ocupado) {
        const dataFormatada = slot.data.toLocaleDateString("pt-BR")
        const horaFormatada = slot.data.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })

        return `
                <div class="slot-item ${tipo === "carregar" ? "slot-carregavel" : ""}" data-slot="${slot.slot}">
                    <div class="slot-header">
                        <span class="slot-numero">Slot ${slot.slot}</span>
                        <span class="slot-data">${dataFormatada} ${horaFormatada}</span>
                        ${tipo === "carregar" ? '<button class="btn-deletar-slot" data-slot="' + slot.slot + '" title="Deletar slot">×</button>' : ""}
                    </div>
                    <div class="slot-info">
                        <span class="slot-pontuacao">Pontos: ${slot.pontuacao}</span>
                        <span class="slot-nivel">Nível: ${slot.nivel}</span>
                        <span class="slot-vidas">Vidas: ${slot.vidas}</span>
                    </div>
                </div>
            `
      } else {
        if (tipo === "salvar") {
          return `
                    <div class="slot-item" data-slot="${slot.slot}">
                        <div class="slot-header">
                            <span class="slot-numero">Slot ${slot.slot}</span>
                            <span class="slot-data">Vazio</span>
                        </div>
                        <div class="slot-vazio">Clique para salvar novo jogo</div>
                    </div>
                `
        } else {
          return `
                    <div class="slot-item vazio" data-slot="${slot.slot}">
                        <div class="slot-header">
                            <span class="slot-numero">Slot ${slot.slot}</span>
                            <span class="slot-data">Vazio</span>
                        </div>
                        <div class="slot-vazio">Slot vazio</div>
                    </div>
                `
        }
      }
    })
    .join("")
}

// Nova função para retomar o jogo após salvar
function retomarJogoAposSalvar() {
  if (!confirmacaoSairAtiva) {
    animacao.ligar()
    if (musicaAcao && !musicaAcao.muted) musicaAcao.play()
    ativarTiro(true)
    atualizarBotaoPausar()
  }
}

// Função para iniciar jogo após carregar
function iniciarJogoAposCarregar() {
  animacao.ligar()
  if (!musicaAcao.muted) musicaAcao.play()
  ativarTiro(true)
  mostrarBotoesControle()
  esconderLinkJogar()
  esconderBotaoVoltar()
  esconderOverlay()
  confirmacaoSairAtiva = false
  atualizarBotaoPausar()
}

// Atualizar interface do botão carregar
function atualizarInterfaceCarregar() {
  const btnCarregar = document.getElementById("link_carregar")
  const btnJogar = document.getElementById("link_jogar")
  if (!btnCarregar || !btnJogar) return

  if (!btnJogar.classList.contains("hidden")) {
    btnCarregar.classList.remove("hidden")
    btnCarregar.disabled = false
  } else {
    btnCarregar.classList.add("hidden")
  }
}

// Overlay para informar que não há jogos salvos
function mostrarOverlayNenhumSalvo() {
  const overlayNenhumSalvo = document.createElement("div")
  overlayNenhumSalvo.className = "overlay"
  overlayNenhumSalvo.innerHTML = `
        <div class="overlay-box">
            <h2>Nenhum Jogo Salvo</h2>
            <p>Não foi encontrado nenhum jogo salvo. Inicie um novo jogo e salve seu progresso!</p>
            <div class="overlay-botoes">
                <button id="btnFecharNenhumSalvo">Fechar</button>
            </div>
        </div>
    `
  document.body.appendChild(overlayNenhumSalvo)

  document.getElementById("btnFecharNenhumSalvo").addEventListener("click", () => {
    overlayNenhumSalvo.remove()
  })
}

/* ============================================================
   MENSAGENS DE FEEDBACK
============================================================ */

function mostrarMensagemSalvamento(slot) {
  context.save()
  context.fillStyle = "rgba(0, 255, 0, 0.8)"
  context.fillRect(canvas.width / 2 - 120, canvas.height / 2 - 25, 240, 50)
  context.fillStyle = "white"
  context.font = "bold 16px sans-serif"
  context.textAlign = "center"
  context.fillText(`JOGO SALVO! (Slot ${slot})`, canvas.width / 2, canvas.height / 2)
  context.restore()

  setTimeout(() => {
    if (animacao.ligado) {
      animacao.processar()
      animacao.desenhar()
    }
  }, 2000)
}

function mostrarMensagemCarregamento(slot) {
  context.save()
  context.fillStyle = "rgba(0, 150, 255, 0.8)"
  context.fillRect(canvas.width / 2 - 140, canvas.height / 2 - 25, 280, 50)
  context.fillStyle = "white"
  context.font = "bold 16px sans-serif"
  context.textAlign = "center"
  context.fillText(`JOGO CARREGADO! (Slot ${slot})`, canvas.width / 2, canvas.height / 2)
  context.restore()

  setTimeout(() => {
    if (animacao.ligado) {
      animacao.processar()
      animacao.desenhar()
    }
  }, 2000)
}

function mostrarErroSalvamento() {
  context.save()
  context.fillStyle = "rgba(255, 0, 0, 0.8)"
  context.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 25, 300, 50)
  context.fillStyle = "white"
  context.font = "bold 16px sans-serif"
  context.textAlign = "center"
  context.fillText("ERRO AO SALVAR JOGO!", canvas.width / 2, canvas.height / 2)
  context.restore()

  setTimeout(() => {
    if (animacao.ligado) {
      animacao.processar()
      animacao.desenhar()
    }
  }, 2000)
}

function mostrarErroCarregamento() {
  context.save()
  context.fillStyle = "rgba(255, 0, 0, 0.8)"
  context.fillRect(canvas.width / 2 - 160, canvas.height / 2 - 25, 320, 50)
  context.fillStyle = "white"
  context.font = "bold 16px sans-serif"
  context.textAlign = "center"
  context.fillText("ERRO AO CARREGAR JOGO!", canvas.width / 2, canvas.height / 2)
  context.restore()

  setTimeout(() => {
    if (animacao.ligado) {
      animacao.processar()
      animacao.desenhar()
    }
  }, 2000)
}

/* ============================================================
   ATUALIZAÇÃO DO OVERLAY
============================================================ */

function criarOverlay() {
  if (overlay) return

  overlay = document.createElement("div")
  overlay.className = "overlay hidden"
  overlay.id = "overlay-sair"
  overlay.innerHTML = `
        <div class="overlay-box">
            <h2>Deseja realmente sair do jogo?</h2>
            <p>Esta ação encerrará a partida atual e você perderá seu progresso.</p>
            <div class="overlay-botoes">
                <button id="btnContinuar">Continuar Jogando</button>
                <button id="btnSairConfirmar">Sair do Jogo</button>
            </div>
        </div>
    `
  document.body.appendChild(overlay)

  document.getElementById("btnContinuar").addEventListener("click", continuarJogando)
  document.getElementById("btnSairConfirmar").addEventListener("click", confirmarSaida)
}

// Mostrar/ocultar overlay
function mostrarOverlay() {
  if (!overlay || confirmacaoSairAtiva) return
  overlay.classList.remove("hidden")
}

function esconderOverlay() {
  if (!overlay) return
  overlay.classList.add("hidden")
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
  }

  for (const i in imagens) {
    const img = new Image()
    img.src = "assets/img/" + imagens[i]
    img.onload = carregando
    totalImagens++
    imagens[i] = img
  }
}

// Carregar música
function carregarMusicas() {
  musicaAcao = new Audio()
  musicaAcao.src = "assets/sounds/musica-acao.wav"
  musicaAcao.load()
  musicaAcao.volume = 0.5
  musicaAcao.muted = false
  musicaAcao.loop = true

  atualizarInterfaceAudio()
}

// Atualizar botão de áudio
function atualizarInterfaceAudio() {
  const linkVolume = document.getElementById("link_volume")
  if (!linkVolume) return

  if (musicaAcao.muted) {
    linkVolume.textContent = "Áudio: off"
    linkVolume.classList.add("muted")
  } else {
    linkVolume.textContent = "Áudio: on"
    linkVolume.classList.remove("muted")
  }
}

/* ============================================================
   3 - TELA DE LOADING
============================================================ */
function carregando() {
  context.save()
  context.drawImage(imagens.espaco, 0, 0, canvas.width, canvas.height)
  context.fillStyle = "white"
  context.strokeStyle = "black"
  context.font = "30px sans-serif"
  context.fillText("Acabe com estes ETs!", 50, 100)
  carregadas++
  context.restore()

  if (carregadas == totalImagens) {
    iniciarObjetos()
    mostrarLinkJogar()
    esconderBotoesControle()
    esconderBotaoVoltar()
  }
}

/* ============================================================
   4 - OBJETOS DO JOGO
============================================================ */
function iniciarObjetos() {
  animacao = new Animacao(context)
  teclado = new Teclado(document)
  colisor = new Colisor()

  espaco = new Fundo(context, imagens.espaco)
  estrelas = new Fundo(context, imagens.estrelas)
  nuvens = new Fundo(context, imagens.nuvens)

  nave = new Nave(context, teclado, imagens.nave, imagens.explosao)
  painel = new Painel(context, nave)

  animacao.novoSprite(espaco)
  animacao.novoSprite(estrelas)
  animacao.novoSprite(nuvens)
  animacao.novoSprite(painel)
  animacao.novoSprite(nave)

  colisor.novoSprite(nave)
  animacao.novoProcessamento(colisor)

  configuracoesIniciais()
}

function configuracoesIniciais() {
  espaco.velocidade = 70
  estrelas.velocidade = 160
  nuvens.velocidade = 510

  nave.posicionar()
  nave.velocidade = 210
  nave.girando = false

  criacaoInimigos()

  nave.acabaramVidas = () => {
    animacao.desligar()
    gameOver()
  }

  colisor.aoColidir = (o1, o2) => {
    if ((o1 instanceof Tiro && o2 instanceof Ovni) || (o1 instanceof Ovni && o2 instanceof Tiro)) {
      painel.pontuacao += 10
      const novoNivel = Math.floor(painel.pontuacao / 20) + 1

      if (novoNivel > nave.nivel) {
        nave.nivel = novoNivel
        espaco.velocidade += 5
        estrelas.velocidade += 8
        nuvens.velocidade += 12

        for (let i = 0; i < animacao.sprites.length; i++) {
          if (animacao.sprites[i] instanceof Ovni) {
            animacao.sprites[i].velocidade += 20
          }
        }
        console.log("Subiu para nível:", nave.nivel)
      }
    }
  }
}

/* ============================================================
   5 - INIMIGOS (OVNIS)
============================================================ */
function criacaoInimigos() {
  criadorInimigos = {
    ultimoOvni: new Date().getTime(),

    processar: function () {
      const agora = new Date().getTime()
      const decorrido = agora - this.ultimoOvni
      if (decorrido > 1000) {
        novoOvni()
        this.ultimoOvni = agora
      }
    },
  }
  animacao.novoProcessamento(criadorInimigos)
}

function novoOvni() {
  const imgOvni = imagens.ovni
  const ovni = new Ovni(context, imgOvni, imagens.explosao)

  ovni.velocidade = Math.floor(500 + Math.random() * 501)
  ovni.x = Math.floor(Math.random() * (canvas.width - imgOvni.width + 1))
  ovni.y = -imgOvni.height

  animacao.novoSprite(ovni)
  colisor.novoSprite(ovni)
}

/* ============================================================
   6 - CONTROLES E INTERFACE
============================================================ */
function pausarJogo() {
  if (confirmacaoSairAtiva) return

  if (animacao.ligado) {
    animacao.desligar()
    musicaAcao.pause()
    ativarTiro(false)

    context.save()
    context.fillStyle = "white"
    context.strokeStyle = "black"
    context.font = "50px sans-serif"
    context.fillText("PAUSADO", 130, 250)
    context.restore()
  } else {
    criadorInimigos.ultimoOvni = new Date().getTime()
    animacao.ligar()
    musicaAcao.play()
    ativarTiro(true)
  }
}

function pausarJogoBotao() {
  pausarJogo()
  atualizarBotaoPausar()
}

function atualizarBotaoPausar() {
  const botaoPausar = document.getElementById("link_pausar")
  if (!botaoPausar) return
  botaoPausar.textContent = animacao.ligado ? "Pausar" : "Continuar"
}

function mostrarBotoesControle() {
  const btnPausar = document.getElementById("link_pausar")
  const btnSair = document.getElementById("link_sair")
  const btnSalvar = document.getElementById("link_salvar")
  const btnCarregar = document.getElementById("link_carregar")

  if (btnPausar) btnPausar.style.display = "inline-block"
  if (btnSair) btnSair.style.display = "inline-block"
  if (btnSalvar) btnSalvar.style.display = "inline-block"
  if (btnCarregar) {
    // Durante o jogo, o botão Carregar fica escondido
    btnCarregar.classList.add("hidden")
  }
}

function esconderBotoesControle() {
  const btnPausar = document.getElementById("link_pausar")
  const btnSair = document.getElementById("link_sair")
  const btnSalvar = document.getElementById("link_salvar")

  if (btnPausar) btnPausar.style.display = "none"
  if (btnSair) btnSair.style.display = "none"
  if (btnSalvar) btnSalvar.style.display = "none"
}

function mostrarBotaoVoltar() {
  const btnVoltar = document.getElementById("link_voltar")
  const btnCarregar = document.getElementById("link_carregar")

  if (btnVoltar) btnVoltar.classList.remove("hidden")
  if (btnCarregar) btnCarregar.classList.add("hidden")
}

function esconderBotaoVoltar() {
  const btnVoltar = document.getElementById("link_voltar")
  if (btnVoltar) btnVoltar.classList.add("hidden")
}

function sairDoJogo() {
  if (confirmacaoSairAtiva) return

  confirmacaoSairAtiva = true

  // Pausa animação e música
  if (animacao) animacao.desligar()
  if (musicaAcao) musicaAcao.pause()
  ativarTiro(false)

  esconderBotoesControle()

  // Remove classe hidden para mostrar overlay
  if (overlay) overlay.classList.remove("hidden")
}

function continuarJogando() {
  confirmacaoSairAtiva = false
  esconderOverlay()
  mostrarBotoesControle()

  if (animacao) animacao.ligar()
  if (musicaAcao && !musicaAcao.muted) musicaAcao.play()
  ativarTiro(true)

  atualizarBotaoPausar()
}

// CONFIRMAR SAÍDA
function confirmarSaida() {
  confirmacaoSairAtiva = false
  esconderOverlay()

  musicaAcao?.pause()
  musicaAcao.currentTime = 0

  gameOver()
  atualizarBotaoPausar()
}

/* ============================================================
   7 - TIROS
============================================================ */
function ativarTiro(ativar) {
  const ESPACO = 32 // Declare ESPACO variable here
  if (ativar) {
    teclado.disparou(ESPACO, () => {
      if (!confirmacaoSairAtiva) {
        nave.atirar()
      }
    })
  } else {
    teclado.disparou(ESPACO, null)
  }
}

/* ============================================================
   8 - INÍCIO E FIM DO JOGO
============================================================ */
function mostrarLinkJogar() {
  const btnJogar = document.getElementById("link_jogar")
  const btnCarregar = document.getElementById("link_carregar")

  if (btnJogar) btnJogar.classList.remove("hidden")

  // Atualiza a visibilidade do botão Carregar
  atualizarInterfaceCarregar()
}

function esconderLinkJogar() {
  const btnJogar = document.getElementById("link_jogar")
  const btnCarregar = document.getElementById("link_carregar")

  if (btnJogar) btnJogar.classList.add("hidden")
  if (btnCarregar) btnCarregar.classList.add("hidden")
}

function toggleAudio() {
  musicaAcao.muted = !musicaAcao.muted
  atualizarInterfaceAudio()
}

function iniciarJogo() {
  if (animacao) {
    // Sempre inicia um jogo novo, não carrega automaticamente
    nave.vidasExtras = 3
    painel.pontuacao = 0
    nave.nivel = 1
    nave.formatoAtual = 0
    nave.imagem = imagens.nave
    nave.largura = nave.imagem.width
    nave.altura = nave.imagem.height
    nave.girando = false
    nave.posicionar()

    espaco.velocidade = 70
    estrelas.velocidade = 160
    nuvens.velocidade = 510

    removerInimigos()

    if (!animacao.sprites.includes(nave)) animacao.novoSprite(nave)
    if (!colisor.sprites.includes(nave)) colisor.novoSprite(nave)
  }

  animacao.ligar()
  if (!musicaAcao.muted) musicaAcao.play()

  ativarTiro(true)
  mostrarBotoesControle()
  esconderLinkJogar()
  esconderBotaoVoltar()
  esconderOverlay()
  confirmacaoSairAtiva = false

  atualizarBotaoPausar()
}

function removerInimigos() {
  if (!animacao || !animacao.sprites) return
  for (let i = animacao.sprites.length - 1; i >= 0; i--) {
    if (animacao.sprites[i] instanceof Ovni) animacao.excluirSprite(animacao.sprites[i])
  }

  if (!colisor || !colisor.sprites) return
  for (let i = colisor.sprites.length - 1; i >= 0; i--) {
    if (colisor.sprites[i] instanceof Ovni) colisor.excluirSprite(colisor.sprites[i])
  }
}

function gameOver() {
  animacao.desligar()
  musicaAcao.pause()
  musicaAcao.currentTime = 0

  context.save()
  context.fillStyle = "rgba(0,0,0,0.7)"
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = "white"
  context.strokeStyle = "black"
  context.font = "bold 40px sans-serif"
  context.textAlign = "center"
  context.fillText("GAME OVER", canvas.width / 2, 180)
  context.strokeText("GAME OVER", canvas.width / 2, 180)

  context.font = "24px sans-serif"
  context.fillText("Pontuação: " + painel.pontuacao, canvas.width / 2, 230)

  context.font = "20px sans-serif"
  context.fillText("Clique em 'Voltar' para recomeçar", canvas.width / 2, 280)
  context.restore()

  esconderBotoesControle()
  mostrarBotaoVoltar()
  esconderLinkJogar()
  esconderOverlay()
}

function voltarTelaCarregamento() {
  animacao.desligar()
  musicaAcao.pause()
  musicaAcao.currentTime = 0

  esconderBotaoVoltar()
  esconderBotoesControle()
  esconderOverlay()
  mostrarLinkJogar()

  carregando()
}