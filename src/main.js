import Alpine from "alpinejs";

window.Alpine = Alpine;

document.addEventListener("alpine:init", () => {
  Alpine.data("board", () => ({
    cards: ["0"],
    discardPile: [],
    round: 1,
    playerCount: 0,
    players: [],
    playerTurnId: 1,
    bustedOrSkippedIds: new Set([]),
    roundOver: false,
    gameOver: false,
    gameStarted: false,
    winnerId: null,
    winnerScore: 0,
    cardsRemaining: 0,
    init() {
      for (let i = 1; i <= 12; i++) {
        for (let j = 1; j <= i; j++) {
          this.cards.push(i.toString());
        }
      }

      this.$watch("cards", () => {
        this.cardsRemaining = this.cards.length;
      });

      this.shuffle(this.cards);



      this.$watch("roundOver", (value) => {
        if (!value) {
          return;
        }

        // Calculate scores
        this.players = this.players.map((player) => {
          if (player.busted) {
            return player;
          }

          const score =
            player.score +
            player.hand.reduce((acc, curr) => acc + parseInt(curr), 0);
          player.score = score;

          if (score >= 200) {
            this.gameOver = true;

            if (score >= this.winnerScore) {
              this.winnerId = player.id;
              this.winnerScore = score;
            }
          }

          return player;
        });
      });
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
          array[randomIndex],
          array[currentIndex],
        ];
      }
    },
    isUnique(array) {
      return array.length === new Set(array).size;
    },
    handleHit() {
      if (this.roundOver) {
        return;
      }

      if (this.cards.length === 0) {
        this.cards = [...this.discardPile];
        this.discardPile = [];
        this.shuffle(this.cards);
      }

      const card = this.cards.pop();

      const player = this.players[this.playerTurnId - 1];
      player.hand.push(card);

      if (!this.isUnique(player.hand)) {
        player.busted = true;
        this.bustedOrSkippedIds.add(player.id);
      }

      if (player.hand.length === 7 && !player.busted) {
        this.roundOver = true;
        player.score += 15;
        this.players[this.playerTurnId - 1] = player;

        return;
      }

      this.players[this.playerTurnId - 1] = player;

      if (this.bustedOrSkippedIds.size === this.playerCount) {
        this.roundOver = true;
        return;
      }

      this.playerTurnId = this.getNextPlayerId(this.playerTurnId);
    },
    handleSkip() {
      if (this.roundOver) {
        return;
      }

      const player = this.players[this.playerTurnId - 1];
      player.skipped = true;
      this.bustedOrSkippedIds.add(player.id);

      if (this.bustedOrSkippedIds.size === this.playerCount) {
        // Round over
        this.roundOver = true;
        return;
      }

      this.players[this.playerTurnId - 1] = player;

      this.playerTurnId = this.getNextPlayerId(this.playerTurnId);
    },
    handleNextRoundClick() {
      this.round += 1;
      this.roundOver = false;
      this.bustedOrSkippedIds = new Set([]);

      this.discardCards();

      this.players = this.players.map((player) => {
        player.skipped = false;
        player.busted = false;

        if (this.cards.length === 0) {
          this.cards = [...this.discardPile];
          this.discardPile = [];
          this.shuffle(this.cards);
        }

        player.hand = [this.cards.pop()];

        return player;
      });
    },
    handleRestartClick() {
      // TODO: Implement proper restart logic
      window.location.reload();
    },
    handlePlayerCountClick(count) {
      this.playerCount = count;
      this.gameStarted = true;

      for (let i = 1; i <= count; i++) {
        this.players.push({
          id: i,
          hand: [this.cards.pop()],
          busted: false,
          skipped: false,
          score: 0,
        });
      }
    },
    discardCards() {
      this.players = this.players.map((player) => {
        this.discardPile.push(...player.hand);
        player.hand = [];
        return player;
      });
    },
    getNextPlayerId(currentPlayerId) {
      const next = (currentPlayerId % this.playerCount) + 1;

      if (this.bustedOrSkippedIds.has(next)) {
        return this.getNextPlayerId(next);
      }

      return next;
    },
  }));
});

Alpine.start();
