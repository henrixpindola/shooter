import { Tiro } from './tiro.js';
import { Explosao } from './explosao.js';

export class Ovni {
  constructor(context, imagem, imgExplosao) {
    this.context = context;
    this.imagem = imagem;
    this.imgExplosao = imgExplosao;
    this.x = 0;
    this.y = 0;
    this.velocidade = 0;
  }

  atualizar() {
    this.y += (this.velocidade * this.animacao.decorrido) / 2000; // Ajuste de velocidade
    if (this.y > this.context.canvas.height) {
      this.animacao.excluirSprite(this);
      this.colisor.excluirSprite(this);
    }
  }

  desenhar() {
    const ctx = this.context;
    const img = this.imagem;
    ctx.drawImage(img, this.x, this.y, img.width, img.height);
  }

  retangulosColisao() {
    return [
      { x: this.x + 20, y: this.y + 1, largura: 25, altura: 10 },
      { x: this.x + 2, y: this.y + 11, largura: 60, altura: 12 },
      { x: this.x + 20, y: this.y + 23, largura: 25, altura: 7 },
    ];
  }

  colidiuCom(outro) {
    if (outro instanceof Tiro) {
      this.animacao.excluirSprite(this);
      this.colisor.excluirSprite(this);
      this.animacao.excluirSprite(outro);
      this.colisor.excluirSprite(outro);

      const explosao = new Explosao(
        this.context,
        this.imgExplosao,
        this.x,
        this.y
      );
      this.animacao.novoSprite(explosao);
    }
  }
}