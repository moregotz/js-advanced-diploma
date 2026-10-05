import { calcTileType, calcHealthLevel } from '../src/js/utils.js';

test('cell_top', () => {
    expect(calcTileType(3, 5)).toBe('top');
});

test('cell_left', () => {
    expect(calcTileType(4, 4)).toBe('left');
});

test('cell_right', () => {
    expect(calcTileType(14, 5)).toBe('right');
});

test('cell_bottom', () => {
    expect(calcTileType(31, 6)).toBe('bottom');
});

test('cell_center', () => {
    expect(calcTileType(12, 5)).toBe('center');
});

test('cell_top-left', () => {
    expect(calcTileType(0, 3)).toBe('top-left');
});

test('cell_top-right', () => {
    expect(calcTileType(7, 8)).toBe('top-right');
});

test('cell_bottom-left', () => {
    expect(calcTileType(20, 5)).toBe('bottom-left');
});

test('cell_bottom-right', () => {
    expect(calcTileType(63, 8)).toBe('bottom-right');
});


describe('calcHealthLevel', () => {
    test('crit_health', () => {
        expect(calcHealthLevel(10)).toBe('critical');
        expect(calcHealthLevel(0)).toBe('critical');
    });

    test('normal_health', () => {
        expect(calcHealthLevel(15)).toBe('normal');
        expect(calcHealthLevel(30)).toBe('normal');
        expect(calcHealthLevel(49)).toBe('normal');
    });

    test('high_health', () => {
        expect(calcHealthLevel(50)).toBe('high');
        expect(calcHealthLevel(80)).toBe('high');
        expect(calcHealthLevel(100)).toBe('high');
    });
});