export class Colisor {
  constructor() {
    this.sprites = [];
    this.aoColidir = null;
    this.spritesExcluir = [];
  }

  novoSprite(sprite) {
    this.sprites.push(sprite);
    sprite.colisor = this;
  }

  processar() {
    for (let i = 0; i < this.sprites.length; i++) {
      for (let j = i + 1; j < this.sprites.length; j++) {
        const sprite1 = this.sprites[i];
        const sprite2 = this.sprites[j];

        this.testarColisao(sprite1, sprite2);
      }
    }
    this.processarExclusoes();
  }

  testarColisao(sprite1, sprite2) {
    const rets1 = sprite1.retangulosColisao();
    const rets2 = sprite2.retangulosColisao();

    for (const ret1 of rets1) {
      for (const ret2 of rets2) {
        if (this.retangulosColidem(ret1, ret2)) {
          sprite1.colidiuCom(sprite2);
          sprite2.colidiuCom(sprite1);

          if (this.aoColidir) {
            this.aoColidir(sprite1, sprite2);
          }
          return; // Evita múltiplas colisões entre os mesmos sprites no mesmo frame
        }
      }
    }
  }

  retangulosColidem(ret1, ret2) {
    return (
      ret1.x + ret1.largura > ret2.x &&
      ret1.x < ret2.x + ret2.largura &&
      ret1.y + ret1.altura > ret2.y &&
      ret1.y < ret2.y + ret2.altura
    );
  }

  excluirSprite(sprite) {
    this.spritesExcluir.push(sprite);
  }

  processarExclusoes() {
    if (this.spritesExcluir.length > 0) {
      this.sprites = this.sprites.filter(
        (sprite) => !this.spritesExcluir.includes(sprite)
      );
      this.spritesExcluir = [];
    }
  }
}