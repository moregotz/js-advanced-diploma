import Character from '../src/js/Character.js';
import { characterGenerator } from '../src/js/generators.js';
import Bowman from '../src/js/characters/Bowman.js';
import Swordsman from '../src/js/characters/Swordsman.js';
import Magician from '../src/js/characters/Magician.js';
import Vampire from '../src/js/characters/Vampire.js';
import Undead from '../src/js/characters/Undead.js';
import Daemon from '../src/js/characters/Daemon.js';
import { generateTeam } from '../src/js/generators.js';

test('character_creating_error', () => {
    expect(() => new Character()).toThrow("Объект Character не создаётся напрямую");
    expect(() => new Bowman(1)).not.toThrow();
    expect(() => new Swordsman(1)).not.toThrow();
    expect(() => new Magician(1)).not.toThrow();
    expect(() => new Vampire(1)).not.toThrow();
    expect(() => new Undead(1)).not.toThrow();
    expect(() => new Daemon(1)).not.toThrow();
})

test('character_stats_bowman', () => {
    const char = new Bowman(1);
    const lvl = char.level;
    const attack = char.attack;
    const defence = char.defence;

    expect(lvl).toBe(1);
    expect(attack).toBe(25);
    expect(defence).toBe(25);
})

test('character_stats_swordsman', () => {
    const char = new Swordsman(1);
    const lvl = char.level;
    const attack = char.attack;
    const defence = char.defence;

    expect(lvl).toBe(1);
    expect(attack).toBe(40);
    expect(defence).toBe(10);
})

test('character_stats_magician', () => {
    const char = new Magician(1);
    const lvl = char.level;
    const attack = char.attack;
    const defence = char.defence;

    expect(lvl).toBe(1);
    expect(attack).toBe(10);
    expect(defence).toBe(40);
})

test('character_stats_vampire', () => {
    const char = new Vampire(1);
    const lvl = char.level;
    const attack = char.attack;
    const defence = char.defence;

    expect(lvl).toBe(1);
    expect(attack).toBe(25);
    expect(defence).toBe(25);
})

test('character_stats_undead', () => {
    const char = new Undead(1);
    const lvl = char.level;
    const attack = char.attack;
    const defence = char.defence;

    expect(lvl).toBe(1);
    expect(attack).toBe(40);
    expect(defence).toBe(10);
})

test('character_stats_daemon', () => {
    const char = new Daemon(1);
    const lvl = char.level;
    const attack = char.attack;
    const defence = char.defence;

    expect(lvl).toBe(1);
    expect(attack).toBe(10);
    expect(defence).toBe(10);
})

test('characters_random_generate', () => {
    const heroes = [Bowman, Swordsman, Magician];
    const generator = characterGenerator(heroes, 4);
    const received = generator.next().value;
    expect(heroes.some(type => received instanceof type)).toBe(true);
})

test('villains_random_generate', () => {
    const evil = [Vampire, Undead, Daemon];
    const generator = characterGenerator(evil, 4);
    const received = generator.next().value;
    expect(evil.some(type => received instanceof type)).toBe(true);
})

test('heroes_team_generate', () => {
    const heroes = [Bowman, Swordsman, Magician];
    const team = generateTeam(heroes, 4, 3);
    for (char of team) {
        expect(char.level).toBeGreaterThanOrEqual(1);
        expect(char.level).toBeLessThanOrEqual(4);
    }
    expect(team.length).toBe(3);
})

test('villains_team_generate', () => {
    const evil = [Vampire, Undead, Daemon];
    const team = generateTeam(evil, 10, 15);
    for (char of team) {
        expect(char.level).toBeGreaterThanOrEqual(1);
        expect(char.level).toBeLessThanOrEqual(10);
    }
    expect(team.length).toBe(15);
})