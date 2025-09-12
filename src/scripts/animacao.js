function Animacao(context) {
   this.context = context;
   this.sprites = [];
   this.ligado = false;
   this.processamentos = [];
   this.spritesExcluir = [];
   this.processamentosExcluir = [];
   this.ultimoCiclo = 0;
   this.decorrido = 0;

}

Animacao.prototype = {
   novoSprite: function(sprite) {
      this.sprites.push(sprite);
      sprite.animacao = this;
   },
   ligar: function() {
      this.ultimoCiclo = 0;
      this.ligado = true;
      this.proximoFrame();
   },
   desligar: function() {
      this.ligado = false;
   },
   proximoFrame: function() {
      // Posso continuar?
      if ( ! this.ligado ) return;

      // A cada ciclo, limpamos a tela ou desenhamos um fundo
      //this.limparTela();

      let agora = new Date().getTime();
      if (this.ultimoCiclo == 0) this.ultimoCiclo = agora;
      
      this.decorrido = agora - this.ultimoCiclo;

      // Atualizamos o estado dos sprites
      for (let i in this.sprites)
         this.sprites[i].atualizar();

      // Desenhamos os sprites
      for (let i in this.sprites)
         this.sprites[i].desenhar();

      // Processamentos gerais
      for(let i in this.processamentos)
         this.processamentos[i].processar();

      // Processamento de exclusões
      this.processarExclusoes();

      // Atualizar o instante do último ciclo
      this.ultimoCiclo = agora;

      // Chamamos o próximo ciclo
      let animacao = this;
      requestAnimationFrame(function() {
         animacao.proximoFrame();
      });
   },
   // limparTela: function() {
   //    let ctx = this.context;
   //    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
   // },
   novoProcessamento: function (processamento) {
      this.processamentos.push(processamento);
      processamento.animacao = this;
   },
   excluirSprite: function (sprite) {
      this.spritesExcluir.push(sprite);
   },
   excluirProcessamento: function (processamento) {
      this.processamentosExcluir.push(processamento);
   },
   processarExclusoes: function () {
      let novoSprites = [];
      let novoProcessamentos = [];
      for (let i in this.sprites) {
         if (this.spritesExcluir.indexOf(this.sprites[i]) == -1)
            novoSprites.push(this.sprites[i]);
      }
      for (let i in this.processamentos) {
         if (this.processamentosExcluir.indexOf(this.processamentos[i]) == -1)
            novoProcessamentos.push(this.processamentos[i]);
      }
      this.spritesExcluir = [];
      this.processamentosExcluir = [];

      this.sprites = novoSprites;
      this.processamentos = novoProcessamentos;
   }
}
