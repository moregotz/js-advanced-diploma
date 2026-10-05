import Bowman from './characters/bowman.js';
import Swordsman from './characters/swordsman.js';
import Magician from './characters/magician.js';
import Vampire from './characters/vampire.js';
import Undead from './characters/undead.js';
import Daemon from './characters/daemon.js';
import { generateTeam } from './generators.js';
import themes from './themes.js';
import GamePlay from './GamePlay.js';
import cursors from './cursors.js';
import GameState from './GameState.js';
import GameStateService from './GameStateService.js';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.currentTurn = 'player';
    if (stateService) {
      this.gameStateService = stateService;
    } else if (typeof localStorage !== 'undefined') {
      this.gameStateService = new GameStateService(localStorage);
    } else {
      const memoryStorage = new Map();
      this.gameStateService = new GameStateService({
        getItem: (key) => memoryStorage.get(key) || null,
        setItem: (key, value) => memoryStorage.set(key, value),
      });
    }

    this.gameState = new GameState();
    this.currentIndex = undefined;

    this.characterFactory = (type, level) => {
      switch (type) {
        case 'bowman': return new Bowman(level);
        case 'swordsman': return new Swordsman(level);
        case 'magician': return new Magician(level);
        case 'daemon': return new Daemon(level);
        case 'undead': return new Undead(level);
        case 'vampire': return new Vampire(level);
        default: throw new Error(`Неизвестный тип персонажа: ${type}`);
      }
    };

    this.init();
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.gamePlay.addNewGameListener(() => this.onNewGame());
    this.gamePlay.addSaveGameListener(() => this.onSaveGame());
    this.gamePlay.addLoadGameListener(() => this.onLoadGame());
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.tryLoadGame();
  }

  tryLoadGame() {
    try {
      const saved = this.gameStateService.load();
      if (saved) {
        this.gameState = GameState.from(saved, this.characterFactory);
        this.gamePlay.drawUi(this.gameState.theme);
        this.gamePlay.redrawPositions(this.gameState.positions);
        if (this.gameState.isGameOver || this.gameState.isGameComplete) {
          this.gamePlay.blockBoard();
        }
      } else {
        this.startNewGame();
      }
    } catch (e) {
      console.warn('Не удалось загрузить сохранение:', e);
      this.startNewGame();
    }
  }

  startNewGame() {
    this.gameState = new GameState();
    this.gamePlay.drawUi(this.gameState.theme);
    this.gameState.positions = this.spawnInitialPositions();
    this.gamePlay.redrawPositions(this.gameState.positions);
    this.saveState();
  }

  onNewGame() {
    const savedMaxScore = this.gameState.maxScore;
    this.gameState = new GameState();
    this.gameState.maxScore = savedMaxScore;
    this.gamePlay.drawUi(this.gameState.theme);
    this.gameState.positions = this.spawnInitialPositions();
    this.gamePlay.redrawPositions(this.gameState.positions);
    this.gamePlay.unblockBoard();
    this.saveState();
  }

  onSaveGame() {
    this.gameStateService.saveManual(this.gameState);
    GamePlay.showMessage('Игра сохранена!');
  }

  onLoadGame() {
    try {
      const saved = this.gameStateService.loadManual();
      if (!saved) {
        GamePlay.showError('Нет сохранённой игры!');
        return;
      }
      this.gameState = GameState.from(saved, this.characterFactory);
      this.gamePlay.drawUi(this.gameState.theme);
      this.gamePlay.redrawPositions(this.gameState.positions);
      if (this.gameState.isGameOver || this.gameState.isGameComplete) {
        this.gamePlay.blockBoard();
      } else {
        this.gamePlay.unblockBoard();
      }
    } catch (e) {
      GamePlay.showError(`Ошибка загрузки: ${e.message}`);
    }
  }

  saveState() {
    this.gameStateService.save(this.gameState);
  }

  spawnInitialPositions() {
    const board = this.gamePlay.boardSize;
    const allowedTypes = [Bowman, Swordsman, Magician];
    const allowedEvilTypes = [Vampire, Undead, Daemon];
    const maxLvl = 1;
    const characterCount = 3;

    const team = generateTeam(allowedTypes, maxLvl, characterCount);
    const playerPositions = [];
    for (let row = 0; row < board; row += 1) {
      playerPositions.push(row * board + 0);
      playerPositions.push(row * board + 1);
    }

    const evilTeam = generateTeam(allowedEvilTypes, maxLvl, characterCount);
    const evilPositions = [];
    for (let row = 0; row < board; row += 1) {
      evilPositions.push(row * board + (board - 2));
      evilPositions.push(row * board + (board - 1));
    }

    const occupiedCells = [];
    const positions = [];

    for (const character of team) {
      let i;
      do {
        i = playerPositions[Math.floor(Math.random() * playerPositions.length)];
      } while (occupiedCells.includes(i));
      occupiedCells.push(i);
      positions.push({ position: i, character });
    }

    for (const character of evilTeam) {
      let i;
      do {
        i = evilPositions[Math.floor(Math.random() * evilPositions.length)];
      } while (occupiedCells.includes(i));
      occupiedCells.push(i);
      positions.push({ position: i, character });
    }

    return positions;
  }

  spawnEnemiesForLevel(level) {
    const board = this.gamePlay.boardSize;
    const allowedEvilTypes = [Vampire, Undead, Daemon];
    const characterCount = 3;
    const evilTeam = generateTeam(allowedEvilTypes, level, characterCount);
    const evilPositions = [];
    for (let row = 0; row < board; row += 1) {
      evilPositions.push(row * board + (board - 2));
      evilPositions.push(row * board + (board - 1));
    }

    const occupiedCells = this.gameState.positions.map((p) => p.position);
    const newPositions = [];

    for (const character of evilTeam) {
      let i;
      do {
        i = evilPositions[Math.floor(Math.random() * evilPositions.length)];
      } while (occupiedCells.includes(i));
      occupiedCells.push(i);
      newPositions.push({ position: i, character });
    }

    return newPositions;
  }

  static distance(index1, index2, boardSize) {
    const row1 = Math.floor(index1 / boardSize);
    const col1 = index1 % boardSize;
    const row2 = Math.floor(index2 / boardSize);
    const col2 = index2 % boardSize;
    return Math.max(Math.abs(row2 - row1), Math.abs(col2 - col1));
  }

  checkRoundEnd() {
    const players = this.gameState.positions.filter(
      (p) => p.character.type === 'bowman' || p.character.type === 'swordsman' || p.character.type === 'magician',
    );
    const evils = this.gameState.positions.filter(
      (p) => p.character.type === 'vampire' || p.character.type === 'undead' || p.character.type === 'daemon',
    );

    this.gameState.positions = this.gameState.positions.filter(
      (p) => p.character.health > 0,
    );

    const selectedStillAlive = this.gameState.positions.find(
      (p) => p.position === this.currentIndex,
    );
    if (!selectedStillAlive) {
      this.currentIndex = undefined;
    }

    this.gamePlay.redrawPositions(this.gameState.positions);

    if (evils.length === 0) {
      if (this.gameState.level >= 4) {
        this.gameState.isGameComplete = true;
        this.gamePlay.blockBoard();
        GamePlay.showMessage('Игра окончена, вы победили!');
      } else {
        players.forEach((p) => p.character.levelUp());
        this.gameState.level += 1;
        const themeKeys = Object.keys(themes);
        this.gameState.theme = themeKeys[this.gameState.level - 1];
        this.gamePlay.drawUi(this.gameState.theme);
        const newEnemies = this.spawnEnemiesForLevel(this.gameState.level);
        this.gameState.positions = [...this.gameState.positions, ...newEnemies];
        this.gamePlay.redrawPositions(this.gameState.positions);
      }
    } else if (players.length === 0) {
      this.gameState.isGameOver = true;
      this.gamePlay.blockBoard();
      GamePlay.showMessage('Игра окончена, вы проиграли!');
    }

    this.saveState();
  }

  onCellClick(index) {
    if (this.gameState.isGameOver || this.gameState.isGameComplete) return;

    const game = this.gamePlay;
    const characterFind = this.gameState.positions
      .find((item) => item.position === index);

    if (characterFind) {
      const char = characterFind.character;
      const isPlayer = char.type === 'bowman'
        || char.type === 'swordsman'
        || char.type === 'magician';

      if (!isPlayer) {
        if (this.currentIndex !== undefined) {
          const selectedPosition = this.gameState.positions
            .find((item) => item.position === this.currentIndex);
          if (!selectedPosition) {
            this.currentIndex = undefined;
            return;
          }
          const selectedChar = selectedPosition.character;
          const dist = GameController.distance(this.currentIndex, index, this.gamePlay.boardSize);

          if (dist <= selectedChar.attackRange) {
            const damage = Math.floor(Math.max(
              selectedChar.attack - char.defence,
              selectedChar.attack * 0.1,
            ));
            char.health = Math.floor(char.health - damage);
            game.showDamage(index, damage).then(() => {
              this.checkRoundEnd();
              for (let i = 0; i < 64; i++) {
                game.deselectCell(i);
              }
              this.currentIndex = undefined;
              this.currentTurn = 'computer';
              setTimeout(() => this.computerTurn(), 1000);
            });
          }
        } else {
          GamePlay.showError('Выберите героя из своей команды');
        }
        return;
      }

      const lastIndex = this.currentIndex;
      this.currentIndex = index;
      if (lastIndex !== undefined) {
        game.deselectCell(lastIndex);
      }
      game.selectCell(index);
    } else if (this.currentIndex !== undefined) {
      const selectedPosition = this.gameState.positions.find(
        (item) => item.position === this.currentIndex,
      );
      if (!selectedPosition) {
        this.currentIndex = undefined;
        return;
      }
      const selectedChar = selectedPosition.character;
      const dist = GameController.distance(this.currentIndex, index, this.gamePlay.boardSize);

      if (dist <= selectedChar.moveRange) {
        selectedPosition.position = index;
        game.redrawPositions(this.gameState.positions);

        for (let i = 0; i < 64; i++) {
          game.deselectCell(i);
        }
        this.currentIndex = undefined;
        this.currentTurn = 'computer';
        setTimeout(() => this.computerTurn(), 1000);
      }
    }
  }

  onCellEnter(index) {
    if (this.gameState.isGameOver || this.gameState.isGameComplete) return;

    const game = this.gamePlay;
    const characterFind = this.gameState.positions.find(
      (item) => item.position === index,
    );

    if (characterFind) {
      const char = characterFind.character;
      const result = `🎖${char.level} ${char.attack} 🛡${char.defence} ❤${char.health}`;
      game.showCellTooltip(result, index);
    }

    if (this.currentIndex !== undefined) {
      const selectedPosition = this.gameState.positions.find(
        (item) => item.position === this.currentIndex,
      );

      if (!selectedPosition) {
        this.currentIndex = undefined;
        game.setCursor(cursors.auto);
        return;
      }

      const selectedChar = selectedPosition.character;

      for (let i = 0; i < 64; i++) {
        if (i !== this.currentIndex) {
          game.deselectCell(i);
        }
      }

      if (!characterFind) {
        const dist = GameController.distance(this.currentIndex, index, this.gamePlay.boardSize);
        if (dist <= selectedChar.moveRange) {
          game.selectCell(index, 'green');
          game.setCursor(cursors.pointer);
        } else {
          game.setCursor(cursors.notallowed);
        }
      } else {
        const char = characterFind.character;
        const isPlayer = char.type === 'bowman' || char.type === 'swordsman' || char.type === 'magician';

        if (isPlayer) {
          game.setCursor(cursors.pointer);
        } else {
          const dist = GameController.distance(this.currentIndex, index, this.gamePlay.boardSize);
          if (dist <= selectedChar.attackRange) {
            game.selectCell(index, 'red');
            game.setCursor(cursors.crosshair);
          } else {
            game.setCursor(cursors.notallowed);
          }
        }
      }
    }
  }

  onCellLeave(index) {
    const game = this.gamePlay;
    game.setCursor(cursors.auto);
    const characterFind = this.gameState.positions.find((item) => item.position === index);
    if (characterFind) {
      this.gamePlay.hideCellTooltip(index);
    }
  }

  computerTurn() {
    if (this.gameState.isGameOver || this.gameState.isGameComplete) return;

    const evils = this.gameState.positions.filter((item) => item.character.type === 'vampire' || item.character.type === 'undead' || item.character.type === 'daemon');
    const players = this.gameState.positions.filter((item) => item.character.type === 'bowman' || item.character.type === 'swordsman' || item.character.type === 'magician');

    if (players.length === 0) {
      this.checkRoundEnd();
      return;
    }

    for (const evil of evils) {
      for (const player of players) {
        const dist = GameController.distance(
          evil.position,
          player.position,
          this.gamePlay.boardSize,
        );

        if (dist <= evil.character.attackRange) {
          const damage = Math.floor(Math.max(
            evil.character.attack - player.character.defence,
            evil.character.attack * 0.1,
          ));
          player.character.health = Math.floor(player.character.health - damage);
          break;
        }
      }
    }

    this.checkRoundEnd();
    this.currentTurn = 'player';
  }
}
