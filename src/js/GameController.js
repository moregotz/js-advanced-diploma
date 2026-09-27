import Bowman from './characters/Bowman.js';
import Swordsman from './characters/Swordsman.js';
import Magician from './characters/Magician.js';
import Vampire from './characters/Vampire.js';
import Undead from './characters/Undead.js';
import Daemon from './characters/Daemon.js';
import PositionedCharacter from './PositionedCharacter.js';
import { generateTeam } from './generators.js';
import themes from './themes.js';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
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

    game.redrawPositions(positions);
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
