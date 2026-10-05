import Bowman from '../src/js/characters/bowman.js';
import Swordsman from '../src/js/characters/Swordsman.js';
import Magician from '../src/js/characters/magician.js';
import Vampire from '../src/js/characters/Vampire.js';
import Undead from '../src/js/characters/Undead.js';
import Daemon from '../src/js/characters/daemon.js';

describe('classes', () => {
    test('Bowman', () => {
        const char = new Bowman();
        expect(char.level).toBe(1);
        expect(char.type).toBe('bowman');
    });

    test('Swordsman', () => {
        const char = new Swordsman();
        expect(char.level).toBe(1);
        expect(char.type).toBe('swordsman');
    });

    test('Magician', () => {
        const char = new Magician();
        expect(char.level).toBe(1);
        expect(char.type).toBe('magician');
    });

    test('Undead', () => {
        const char = new Undead();
        expect(char.level).toBe(1);
        expect(char.type).toBe('undead');
    });

    test('Vampire', () => {
        const char = new Vampire();
        expect(char.level).toBe(1);
        expect(char.type).toBe('vampire');
    });

    test('Daemon', () => {
        const char = new Daemon();
        expect(char.level).toBe(1);
        expect(char.type).toBe('daemon');
    });
})