/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level = 1, type = 'generic') {
    if (new.target === Character) {
      throw new Error('Объект Character не создаётся напрямую');
    }
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.moveRange = 0;
    this.attackRange = 0;
    this.type = type;
  }

  levelUp() {
    this.level += 1;
    const currHealth = this.health;
    this.health = Math.min(100, this.health + 80);
    const multiplier = (80 + currHealth) / 100;
    this.attack = Math.max(this.attack, Math.floor(this.attack * multiplier));
    this.defence = Math.max(this.defence, Math.floor(this.defence * multiplier));
  }

  toJSON() {
    return {
      type: this.type,
      level: this.level,
      health: this.health,
      attack: this.attack,
      defence: this.defence,
      moveRange: this.moveRange,
      attackRange: this.attackRange,
    };
  }
}
