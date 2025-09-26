import {
  SETA_ESQUERDA,
  SETA_DIREITA,
  SETA_CIMA,
  SETA_BAIXO,
} from './teclado.js';
import { Spritesheet } from './spritesheet.js';
import { Tiro } from './tiro.js';
import { Ovni } from './ovni.js';
import { Explosao } from './explosao.js';

export class Nave {
  constructor(context, teclado, imagem, imgExplosao) {
    this.context = context;
    this.teclado = teclado;
    this.imagem = imagem;
    this.imgExplosao = imgExplosao;
    this.x = 0;
    this.y = 0;
    this.velocidade = 0;
    this.spritesheet = new Spritesheet(context, imagem, 3, 2);
    this.spritesheet.linha = 0;
    this.spritesheet.intervalo = 100;
    this.acabaramVidas = null;
    this.vidasExtras = 3;
  }

  atualizar() {
    const incremento = (this.velocidade * this.animacao.decorrido) / 1000;
    const canvasWidth = this.context.canvas.width;
    const canvasHeight = this.context.canvas.height;

    if (this.teclado.pressionada(SETA_ESQUERDA) && this.x > 0) {
      this.x -= incremento;
    }
    if (
      this.teclado.pressionada(SETA_DIREITA) &&
      this.x < canvasWidth - 36
    ) {
      this.x += incremento;
    }
    if (this.teclado.pressionada(SETA_CIMA) && this.y > 0) {
      this.y -= incremento;
    }
    if (
      this.teclado.pressionada(SETA_BAIXO) &&
      this.y < canvasHeight - 48
    ) {
      this.y += incremento;
    }
  }

  desenhar() {
    if (this.teclado.pressionada(SETA_ESQUERDA)) {
      this.spritesheet.linha = 1;
    } else if (this.teclado.pressionada(SETA_DIREITA)) {
      this.spritesheet.linha = 2;
    } else {
      this.spritesheet.linha = 0;
    }

    this.spritesheet.desenhar(this.x, this.y);
    this.spritesheet.proximoQuadro();
  }

  atirar() {
    const tiro = new Tiro(this.context, this);
    this.animacao.novoSprite(tiro);
    this.colisor.novoSprite(tiro);
  }

  retangulosColisao() {
    return [
      { x: this.x + 2, y: this.y + 19, largura: 9, altura: 13 },
      { x: this.x + 13, y: this.y + 3, largura: 10, altura: 33 },
      { x: this.x + 25, y: this.y + 19, largura: 9, altura: 13 },
    ];
  }

  colidiuCom(outro) {
    if (outro instanceof Ovni) {
      this.animacao.excluirSprite(this);
      this.animacao.excluirSprite(outro);
      this.colisor.excluirSprite(this);
      this.colisor.excluirSprite(outro);

      const exp1 = new Explosao(
        this.context,
        this.imgExplosao,
        this.x,
        this.y
      );
      const exp2 = new Explosao(
        this.context,
        this.imgExplosao,
        outro.x,
        outro.y
      );

      this.animacao.novoSprite(exp1);
      this.animacao.novoSprite(exp2);

      exp1.fimDaExplosao = () => {
        this.vidasExtras--;
        if (this.vidasExtras < 1) {
          if (this.acabaramVidas) this.acabaramVidas();
        } else {
          this.colisor.novoSprite(this);
          this.animacao.novoSprite(this);
          this.posicionar();
        }
      };
    }
  }

  posicionar() {
    const canvas = this.context.canvas;
    this.x = canvas.width / 2 - 18;
    this.y = canvas.height - 48;
  }
}