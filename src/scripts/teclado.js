// Códigos de teclas
export const SETA_ESQUERDA = 37;
export const SETA_CIMA = 38;
export const SETA_DIREITA = 39;
export const SETA_BAIXO = 40;
export const ESPACO = 32;
export const ENTER = 13;

export class Teclado {
  constructor(elemento) {
    this.elemento = elemento;
    this.pressionadas = [];
    this.disparadas = [];
    this.funcoesDisparo = [];

    elemento.addEventListener('keydown', (evento) => {
      const tecla = evento.keyCode;
      this.pressionadas[tecla] = true;

      if (this.funcoesDisparo[tecla] && !this.disparadas[tecla]) {
        this.disparadas[tecla] = true;
        this.funcoesDisparo[tecla]();
      }
    });

    elemento.addEventListener('keyup', (evento) => {
      this.pressionadas[evento.keyCode] = false;
      this.disparadas[evento.keyCode] = false;
    });
  }

  pressionada(tecla) {
    return this.pressionadas[tecla];
  }

  disparou(tecla, callback) {
    this.funcoesDisparo[tecla] = callback;
  }
}
