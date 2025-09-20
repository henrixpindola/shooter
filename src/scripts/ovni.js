function Ovni(context, imagem, imgExplosao) {
  this.context = context;
  this.imagem = imagem;
  this.x = 0;
  this.y = 0;
  this.velocidade = 0;
  this.imgExplosao = imgExplosao;
}

Ovni.prototype = {
  atualizar: function () {
    this.y += this.velocidade * this.animacao.decorrido / 2000; // Ajuste de velocidade - NOVIDADE
    if (this.y > this.context.canvas.height) {
      this.animacao.excluirSprite(this);
      this.colisor.excluirSprite(this);
    }
  },
  desenhar: function () {
    let ctx = this.context;
    let img = this.imagem;
    ctx.drawImage(img, this.x, this.y, img.width, img.height);
  },
  retangulosColisao: function () {
    let rets = [
      { x: this.x + 20, y: this.y + 1, largura: 25, altura: 10 },
      { x: this.x + 2, y: this.y + 11, largura: 60, altura: 12 },
      { x: this.x + 20, y: this.y + 23, largura: 25, altura: 7 },
    ];

    return rets;
  },
  colidiuCom: function (outro) {
    if (outro instanceof Tiro) {
      this.animacao.excluirSprite(this);
      this.colisor.excluirSprite(this);
      this.animacao.excluirSprite(outro);
      this.colisor.excluirSprite(outro);

      let explosao = new Explosao(this.context, this.imgExplosao, this.x, this.y);
      this.animacao.novoSprite(explosao);
    }
  }
}