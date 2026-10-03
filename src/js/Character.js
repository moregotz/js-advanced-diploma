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
  constructor(level, type = 'generic') {
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
}
