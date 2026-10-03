import Bowman from './characters/Bowman.js';
import Swordsman from './characters/Swordsman.js';
import Magician from './characters/Magician.js';
import Vampire from './characters/Vampire.js';
import Undead from './characters/Undead.js';
import Daemon from './characters/Daemon.js';
import PositionedCharacter from './PositionedCharacter.js';
import { generateTeam } from './generators.js';
import themes from './themes.js';
import GamePlay from './GamePlay.js';
import cursors from './cursors.js';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.currentTurn = 'player';
  }

  init() {
    const game = this.gamePlay;
    game.drawUi(themes.prairie);

    const board = game.boardSize;

    const allowedTypes = [Bowman, Swordsman, Magician];
    const allowedEvilTypes = [Vampire, Undead, Daemon];

    const maxLvl = 4;
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
      positions.push(new PositionedCharacter(character, i));
    }

    for (const character of evilTeam) {
      let i;
      do {
        i = evilPositions[Math.floor(Math.random() * evilPositions.length)];
      } while (occupiedCells.includes(i));

      occupiedCells.push(i);
      positions.push(new PositionedCharacter(character, i));
    }

    this.positions = positions;

    game.redrawPositions(positions);
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  distance(index1, index2, boardSize) {
    const row1 = Math.floor(index1 / boardSize);
    const col1 = index1 % boardSize;
    const row2 = Math.floor(index2 / boardSize);
    const col2 = index2 % boardSize;

    const rowDiff = Math.abs(row2 - row1);
    const colDiff = Math.abs(col2 - col1);

    return Math.max(rowDiff, colDiff);
  }

  onCellClick(index) {
    const game = this.gamePlay;
    const characterFind = this.positions.find(item => item.position === index);

    if (characterFind) {
      const char = characterFind.character;
      if (char.type !== 'bowman' && char.type !== 'swordsman' && char.type !== 'magician') {
        if (this.currentIndex !== undefined) {
          const selectedChar = this.positions.find(item => item.position === this.currentIndex).character;
          const dist = this.distance(this.currentIndex, index, this.gamePlay.boardSize);

          if (dist <= selectedChar.attackRange) {
            const damage = Math.max(
              selectedChar.attack - char.defence,
              selectedChar.attack * 0.1
            );
            char.health -= damage;
            game.showDamage(index, damage).then(() => {
              if (char.health <= 0) {
                this.positions = this.positions.filter(item => item !== characterFind);
              }
              game.redrawPositions(this.positions);
              for (let i = 0; i < 64; i++) {
                game.deselectCell(i);
              }
              this.currentIndex = undefined;
              this.currentTurn = 'computer';
              this.computerTurn();
            });
          } return;
        }
        GamePlay.showError('Выберите героя из своей команды');
        return;
      }

      const lastIndex = this.currentIndex;
      this.currentIndex = index;
      if (lastIndex !== undefined) {
        game.deselectCell(lastIndex);
      }
      game.selectCell(index);
    } else {
      if (this.currentIndex !== undefined) {
        const selectedChar = this.positions.find(item => item.position === this.currentIndex).character;
        const dist = this.distance(this.currentIndex, index, this.gamePlay.boardSize);

        if (dist <= selectedChar.moveRange) {
          const selectedPosition = this.positions.find(item => item.position === this.currentIndex);
          selectedPosition.position = index;
          game.redrawPositions(this.positions);

          for (let i = 0; i < 64; i++) {
            game.deselectCell(i);
          }
          this.currentIndex = undefined;
        }
      }
    }
  }

  onCellEnter(index) {
    const game = this.gamePlay;
    const characterFind = this.positions.find(item => item.position === index);

    if (characterFind) {
      function characterTag(strings, level, attack, defence, health) {
        return `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`;
      }
      const char = characterFind.character;
      const result = characterTag`${char.level} ${char.attack} ${char.defence} ${char.health}`;
      game.showCellTooltip(result, index);
    }

    if (this.currentIndex !== undefined) {
      const selectedChar = this.positions.find(item => item.position === this.currentIndex).character;

      for (let i = 0; i < 64; i++) {
        if (i !== this.currentIndex) {
          game.deselectCell(i);
        }
      }

      if (!characterFind) {
        const dist = this.distance(this.currentIndex, index, this.gamePlay.boardSize);
        if (dist <= selectedChar.moveRange) {
          game.selectCell(index, 'green');
          game.setCursor(cursors.pointer);
        } else {
          game.setCursor(cursors.notallowed);
        }
      } else {
        const char = characterFind.character;

        if (char.type === 'bowman' || char.type === 'swordsman' || char.type === 'magician') {
          game.setCursor(cursors.pointer);
        } else {
          const dist = this.distance(this.currentIndex, index, this.gamePlay.boardSize);
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
    const characterFind = this.positions.find(item => item.position === index);
    if (characterFind) {
      this.gamePlay.hideCellTooltip(index);
    }
  }

    computerTurn() {
      const evils = this.positions.filter(item =>
        item.character.type === 'vampire' || item.character.type === 'undead' || item.character.type === 'daemon'
      );
      const players = this.positions.filter(item =>
        item.character.type === 'bowman' || item.character.type === 'swordsman' || item.character.type === 'magician'
      );

      if (players.length === 0) {
        GamePlay.showMessage('Вы проиграли!');
        return;
      }

      for (const evil of evils) {
        for (const player of players) {
          const dist = this.distance(evil.position, player.position, this.gamePlay.boardSize);

          if (dist <= evil.character.attackRange) {
            const damage = Math.max(
              evil.character.attack - player.character.defence,
              evil.character.attack * 0.1
            );
            player.character.health -= damage;

            if (player.character.health <= 0) {
              this.positions = this.positions.filter(item => item !== player);
            }
            break;
          }
        }
      }

      this.gamePlay.redrawPositions(this.positions);

      setTimeout(() => {
        this.currentTurn = 'player';
      }, 1000);
    }
  }
