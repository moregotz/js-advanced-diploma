import Character from '../src/js/Character.js';

describe('Character', () => {
  test('нельзя создать экземпляр Character напрямую', () => {
    expect(() => new Character()).toThrow('Объект Character не создаётся напрямую');
  });

  test('lvl1_character', () => {
    class TestChar extends Character {}
    const char = new TestChar();
    expect(char.level).toBe(1);
    expect(char.health).toBe(50);
    expect(char.attack).toBe(0);
    expect(char.defence).toBe(0);
  });

  test('levelup', () => {
    class TestChar extends Character {}
    const char = new TestChar();
    char.attack = 10;
    char.defence = 10;
    char.levelUp();
    expect(char.level).toBe(2);
  });

  test('health_limit', () => {
    class TestChar extends Character {}
    const char = new TestChar();
    char.levelUp();
    expect(char.health).toBe(100);
  });

  test('health_healing', () => {
    class TestChar extends Character {}
    const char = new TestChar();
    char.health = 10;
    char.attack = 10;
    char.defence = 10;
    char.levelUp();
    expect(char.health).toBe(90);
  });

  test('attack_levelup', () => {
    class TestChar extends Character {}
    const char = new TestChar();
    char.health = 50;
    char.attack = 20;
    char.defence = 20;
    char.levelUp();
    expect(char.attack).toBe(26);
  });

  test('stable_attack', () => {
    class TestChar extends Character {}
    const char = new TestChar();
    char.health = 1;
    char.attack = 100;
    char.defence = 100;
    char.levelUp();
    expect(char.attack).toBe(100);
  });

  test('toJSON', () => {
    class TestChar extends Character {}
    const char = new TestChar(1, 'bowman');
    char.attack = 25;
    char.defence = 25;
    char.health = 50;
    char.moveRange = 2;
    char.attackRange = 2;
    const json = char.toJSON();
    expect(json).toEqual({
      type: 'bowman',
      level: 1,
      health: 50,
      attack: 25,
      defence: 25,
      moveRange: 2,
      attackRange: 2
    });
  });
});