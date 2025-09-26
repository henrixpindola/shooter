import { Spritesheet } from './spritesheet.js';

export class Painel {
  constructor(context, nave) {
    this.context = context;
    this.nave = nave;
    this.spritesheet = new Spritesheet(context, nave.imagem, 3, 2);
    this.pontuacao = 0;
    this.nave.nivel = 1; // Nível
  }

  atualizar() {
    // A lógica de atualização pode ser adicionada aqui se necessário
  }

  desenhar() {
    const ctx = this.context;

    // Desenhar vidas extras
    ctx.save();
    ctx.scale(0.5, 0.5);
    let x = 20;
    const y = 20;
    for (let i = 1; i <= this.nave.vidasExtras; i++) {
      this.spritesheet.desenhar(x, y);
      x += 40;
    }
    ctx.restore();

    // Desenhar pontuação
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.font = '18px sans-serif';
    ctx.fillText(this.pontuacao, 100, 27);
    ctx.restore();

    // Desenhar nível
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Nível: ${this.nave.nivel}`, 200, 27);
    ctx.restore();
  }
}
