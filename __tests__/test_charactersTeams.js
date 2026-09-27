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

test('', () => {

})

test('', () => {

})