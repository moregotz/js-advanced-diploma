import Character from '../Character.js';

export default class Vampire extends Character {
  constructor(level) {
    super(level, 'vampire');
    this.level = level;
    this.attack = 25;
    this.defence = 25;
    this.moveRange = 2;
    this.attackRange = 2;
  }
}
