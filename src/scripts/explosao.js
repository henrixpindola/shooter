import { Spritesheet } from './spritesheet.js';

const SOM_EXPLOSAO = new Audio();
SOM_EXPLOSAO.src = '/assets/snd/explosao.mp3';
SOM_EXPLOSAO.volume = 0.3;
SOM_EXPLOSAO.load();

export class Explosao {
  constructor(context, imagem, x, y) {
    this.context = context;
    this.imagem = imagem;
    this.x = x;
    this.y = y;
    this.spritesheet = new Spritesheet(context, imagem, 1, 5);
    this.spritesheet.intervalo = 75;
    this.fimDaExplosao = null;

    this.spritesheet.fimDoCiclo = () => {
      this.animacao.excluirSprite(this);
      if (this.fimDaExplosao) {
        this.fimDaExplosao();
      }
    };

    SOM_EXPLOSAO.currentTime = 0.0;
    SOM_EXPLOSAO.play();
  }

  atualizar() {
    // A lógica de atualização está no `proximoQuadro` do spritesheet
  }

  desenhar() {
    this.spritesheet.desenhar(this.x, this.y);
    this.spritesheet.proximoQuadro();
  }
}