export class Animacao {
  constructor(context) {
    this.context = context;
    this.sprites = [];
    this.ligado = false;
    this.processamentos = [];
    this.spritesExcluir = [];
    this.processamentosExcluir = [];
    this.ultimoCiclo = 0;
    this.decorrido = 0;
  }

  novoSprite(sprite) {
    this.sprites.push(sprite);
    sprite.animacao = this;
  }

  ligar() {
    this.ultimoCiclo = 0;
    this.ligado = true;
    this.proximoFrame();
  }

  desligar() {
    this.ligado = false;
  }

  proximoFrame() {
    if (!this.ligado) return;

    const agora = new Date().getTime();
    if (this.ultimoCiclo === 0) this.ultimoCiclo = agora;
    this.decorrido = agora - this.ultimoCiclo;

    for (const sprite of this.sprites) {
      sprite.atualizar();
    }

    for (const sprite of this.sprites) {
      sprite.desenhar();
    }

    for (const processamento of this.processamentos) {
      processamento.processar();
    }

    this.processarExclusoes();

    this.ultimoCiclo = agora;

    requestAnimationFrame(() => {
      this.proximoFrame();
    });
  }

  novoProcessamento(processamento) {
    this.processamentos.push(processamento);
    processamento.animacao = this;
  }

  excluirSprite(sprite) {
    this.spritesExcluir.push(sprite);
  }

  excluirProcessamento(processamento) {
    this.processamentosExcluir.push(processamento);
  }

  processarExclusoes() {
    if (this.spritesExcluir.length > 0) {
      this.sprites = this.sprites.filter(
        (sprite) => !this.spritesExcluir.includes(sprite)
      );
      this.spritesExcluir = [];
    }

    if (this.processamentosExcluir.length > 0) {
      this.processamentos = this.processamentos.filter(
        (proc) => !this.processamentosExcluir.includes(proc)
      );
      this.processamentosExcluir = [];
    }
  }
}
