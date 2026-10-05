import GameStateService from '../src/js/GameStateService.js';

describe('GameStateService', () => {
    let storage;
    let service;

    beforeEach(() => {
        storage = new Map();
        const mockStorage = {
            getItem: jest.fn((key) => storage.get(key) || null),
            setItem: jest.fn((key, value) => storage.set(key, value)),
        };
        service = new GameStateService(mockStorage);
    });

    test('save() сохраняет состояние в хранилище', () => {
        const state = { level: 2, score: 100 };
        service.save(state);
        expect(storage.get('state')).toBe(JSON.stringify(state));
    });

    test('saveManual() сохраняет состояние в хранилище с ключом state-save', () => {
        const state = { level: 3, score: 200 };
        service.saveManual(state);
        expect(storage.get('state-save')).toBe(JSON.stringify(state));
    });

    test('load()', () => {
        const state = { level: 2, score: 100 };
        storage.set('state', JSON.stringify(state));
        const loaded = service.load();
        expect(loaded).toEqual(state);
    });

    test('return_null_if_no_data', () => {
        const loaded = service.load();
        expect(loaded).toBeNull();
    });

    test('load_error', () => {
        storage.set('state', 'invalid json{{{');
        expect(() => service.load()).toThrow('Invalid state');
    });

    test('loadManual()', () => {
        const state = { level: 3, score: 200 };
        storage.set('state-save', JSON.stringify(state));
        const loaded = service.loadManual();
        expect(loaded).toEqual(state);
    });

    test('loadManual()_null_if_no_data', () => {
        const loaded = service.loadManual();
        expect(loaded).toBeNull();
    });

    test('loadManual()_error', () => {
        storage.set('state-save', 'invalid json{{{');
        expect(() => service.loadManual()).toThrow('Invalid state');
    });
});