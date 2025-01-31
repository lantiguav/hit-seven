import Alpine from 'alpinejs'
 
window.Alpine = Alpine

document.addEventListener('alpine:init', () => {
    Alpine.data('board', () => ({
        cards: ['0'],
        playerCount: 8,
        players: [],
        playerTurnId: 1,
        bustedOrSkippedIds: new Set([]),
        roundOver: false,
        init(){
          for(let i = 1; i <= 12; i++) {
            for (let j = 1; j <= i; j++) {
              this.cards.push(i.toString())
            }
          }

          this.shuffle(this.cards)

          for (let i =1; i <= this.playerCount; i++) {
            this.players.push({
              id: i,
              hand: [],
              busted: false
            })
          }
        },
        shuffle(array) {
          let currentIndex = array.length;

          // While there remain elements to shuffle...
          while (currentIndex != 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
              array[randomIndex], array[currentIndex]];
          }
        },
        isUnique(array){
          return array.length === new Set(array).size
        },
        handleHit() {
          if (this.roundOver) {
            return 
          }

          const card = this.cards.pop();
          
          const player = this.players[this.playerTurnId - 1]
          player.hand.push(card)

          if (!this.isUnique(player.hand)) {
            player.busted = true
            this.bustedOrSkippedIds.add(player.id)
          }

          if (player.hand.length === 7) {
            this.roundOver = true
          }

          this.players[this.playerTurnId -1] = player


          if (this.bustedOrSkippedIds.size === this.playerCount) {
            // Round over
            this.roundOver = true
            return;
          }
          
          this.playerTurnId = this.getNextPlayerId(this.playerTurnId)
        },
        handleSkip() {
          if (this.roundOver) {
            return 
          }

          const player = this.players[this.playerTurnId - 1]
          player.skipped = true;
          this.bustedOrSkippedIds.add(player.id)

          if (this.bustedOrSkippedIds.size === this.playerCount) {
            // Round over
            this.roundOver = true
            return;
          }

          this.players[this.playerTurnId -1] = player

          this.playerTurnId = this.getNextPlayerId(this.playerTurnId)
        },
        getNextPlayerId(currentPlayerId) {
          const next = (currentPlayerId % this.playerCount) + 1 
          
          if (this.bustedOrSkippedIds.has(next)) {
            return this.getNextPlayerId(next)

          }

          return next

        }
    }))
})

Alpine.start()
