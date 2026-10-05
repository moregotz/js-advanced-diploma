import Character from '../Character.js';

export default class Vampire extends Character {
  constructor(level = 1) {
    super(1, 'vampire');
    this.attack = 25;
    this.defence = 25;
    this.moveRange = 2;
    this.attackRange = 2;

    for (let i = 1; i < level; i++) {
      this.levelUp();
    }
  }
}
