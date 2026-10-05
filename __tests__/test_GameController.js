import GameController from '../src/js/GameController.js';
import GameStateService from '../src/js/GameStateService.js';
import GamePlay from '../src/js/GamePlay.js';
import cursors from '../src/js/cursors.js';

jest.mock('../src/js/GamePlay.js', () => {
    const mockGamePlay = jest.fn().mockImplementation(() => ({
        boardSize: 8,
        addNewGameListener: jest.fn(),
        addSaveGameListener: jest.fn(),
        addLoadGameListener: jest.fn(),
        addCellEnterListener: jest.fn(),
        addCellLeaveListener: jest.fn(),
        addCellClickListener: jest.fn(),
        drawUi: jest.fn(),
        redrawPositions: jest.fn(),
        blockBoard: jest.fn(),
        unblockBoard: jest.fn(),
        deselectCell: jest.fn(),
        selectCell: jest.fn(),
        showDamage: jest.fn(() => Promise.resolve()),
        setCursor: jest.fn(),
        showCellTooltip: jest.fn(),
        hideCellTooltip: jest.fn(),
    }));

    mockGamePlay.showMessage = jest.fn();
    mockGamePlay.showError = jest.fn();

    return { __esModule: true, default: mockGamePlay };
});

describe('GameController', () => {
    let controller;
    let gamePlay;
    let stateService;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        gamePlay = new GamePlay();
        stateService = new GameStateService();
        stateService.load = jest.fn(() => null);
        stateService.save = jest.fn();
        stateService.saveManual = jest.fn();
        stateService.loadManual = jest.fn(() => null);
        controller = new GameController(gamePlay, stateService);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('init()', () => {
        expect(gamePlay.addNewGameListener).toHaveBeenCalled();
        expect(gamePlay.addSaveGameListener).toHaveBeenCalled();
        expect(gamePlay.addLoadGameListener).toHaveBeenCalled();
        expect(gamePlay.addCellClickListener).toHaveBeenCalled();
    });

    test('new_game', () => {
        controller.onNewGame();
        expect(gamePlay.drawUi).toHaveBeenCalled();
        expect(stateService.save).toHaveBeenCalled();
    });

    test('load_game', () => {
        const savedState = {
            level: 2,
            theme: 'desert',
            positions: [],
            isGameOver: false,
            isGameComplete: false
        };
        stateService.load = jest.fn(() => savedState);
        new GameController(gamePlay, stateService);
        expect(gamePlay.drawUi).toHaveBeenCalledWith('desert');
    });

    test('maxScore', () => {
        controller.gameState.maxScore = 500;
        controller.onNewGame();
        expect(controller.gameState.maxScore).toBe(500);
        expect(controller.gameState.level).toBe(1);
        expect(gamePlay.drawUi).toHaveBeenCalled();
        expect(gamePlay.redrawPositions).toHaveBeenCalled();
    });

    test('save_game', () => {
        controller.onSaveGame();
        expect(stateService.saveManual).toHaveBeenCalled();
        expect(GamePlay.showMessage).toHaveBeenCalledWith('Игра сохранена!');
    });

    test('load_error', () => {
        controller.onLoadGame();
        expect(GamePlay.showError).toHaveBeenCalledWith('Нет сохранённой игры!');
    });

    test('load_manual_restores_state', () => {
        const savedState = {
            level: 3,
            theme: 'arctic',
            positions: [{
                position: 0,
                character: {
                    type: 'bowman',
                    level: 2,
                    health: 80,
                    attack: 30,
                    defence: 25,
                    moveRange: 4,
                    attackRange: 2
                }
            }],
            isGameOver: false,
            isGameComplete: false
        };
        stateService.loadManual = jest.fn(() => savedState);
        controller.onLoadGame();
        expect(GamePlay.showError).not.toHaveBeenCalled();
        expect(gamePlay.drawUi).toHaveBeenCalledWith('arctic');
        expect(controller.gameState.level).toBe(3);
        expect(controller.gameState.positions[0].character.level).toBe(2);
    });

    test('load_error_with_exception', () => {
        stateService.loadManual = jest.fn(() => {
            throw new Error('Test error');
        });
        controller.onLoadGame();
        expect(GamePlay.showError).toHaveBeenCalledWith('Ошибка загрузки: Test error');
    });

    test('spawnInitialPositions', () => {
        const positions = controller.spawnInitialPositions();
        expect(positions).toHaveLength(6);
        positions.forEach(pos => {
            expect(pos).toHaveProperty('position');
            expect(pos).toHaveProperty('character');
        });
    });

    test('distance_calculating', () => {
        expect(GameController.distance(0, 0, 8)).toBe(0);
        expect(GameController.distance(0, 1, 8)).toBe(1);
        expect(GameController.distance(0, 9, 8)).toBe(1);
        expect(GameController.distance(0, 16, 8)).toBe(2);
    });

    test('checkRoundEnd_victory', () => {
        controller.gameState.level = 4;
        controller.gameState.positions = [
            {
                position: 0,
                character: {
                    type: 'bowman',
                    health: 50,
                    level: 1,
                    attack: 25,
                    defence: 25,
                    levelUp: jest.fn()
                }
            }
        ];
        controller.checkRoundEnd();
        expect(controller.gameState.isGameComplete).toBe(true);
        expect(GamePlay.showMessage).toHaveBeenCalledWith('Игра окончена, вы победили!');
        expect(gamePlay.blockBoard).toHaveBeenCalled();
    });

    test('checkRoundEnd_gameover', () => {
        controller.gameState.positions = [
            { position: 63, character: { type: 'daemon', health: 50 } }
        ];
        controller.checkRoundEnd();
        expect(GamePlay.showMessage).toHaveBeenCalledWith('Игра окончена, вы проиграли!');
        expect(gamePlay.blockBoard).toHaveBeenCalled();
    });

    test('checkRoundEnd_level_up', () => {
        controller.gameState.level = 2;
        controller.gameState.positions = [
            {
                position: 0,
                character: {
                    type: 'bowman',
                    health: 50,
                    level: 1,
                    attack: 25,
                    defence: 25,
                    levelUp: jest.fn()
                }
            }
        ];
        controller.checkRoundEnd();
        expect(controller.gameState.level).toBe(3);
        expect(gamePlay.drawUi).toHaveBeenCalled();
        expect(gamePlay.redrawPositions).toHaveBeenCalled();
    });

    test('onCellClick_with_game_over', () => {
        controller.gameState.isGameOver = true;
        controller.onCellClick(0);
        expect(gamePlay.selectCell).not.toHaveBeenCalled();
    });

    test('onCellClick_with_game_complete', () => {
        controller.gameState.isGameComplete = true;
        controller.onCellClick(0);
        expect(gamePlay.selectCell).not.toHaveBeenCalled();
    });

    test('onCellEnter_with_game_over', () => {
        controller.gameState.isGameOver = true;
        controller.onCellEnter(0);
        expect(gamePlay.showCellTooltip).not.toHaveBeenCalled();
    });

    test('onCellEnter_with_game_complete', () => {
        controller.gameState.isGameComplete = true;
        controller.onCellEnter(0);
        expect(gamePlay.showCellTooltip).not.toHaveBeenCalled();
    });

    test('computerTurn_with_game_over', () => {
        controller.gameState.isGameOver = true;
        gamePlay.redrawPositions.mockClear();
        controller.computerTurn();
        expect(gamePlay.redrawPositions).not.toHaveBeenCalled();
    });

    test('computerTurn_with_game_complete', () => {
        controller.gameState.isGameComplete = true;
        gamePlay.redrawPositions.mockClear();
        controller.computerTurn();
        expect(gamePlay.redrawPositions).not.toHaveBeenCalled();
    });

    test('computerTurn_with_no_players', () => {
        controller.gameState.positions = [
            { position: 63, character: { type: 'daemon', health: 50, levelUp: jest.fn() } }
        ];
        controller.computerTurn();
        expect(controller.gameState.isGameOver).toBe(true);
    });

    test('computerTurn_handles_no_enemies_correctly', () => {
        controller.gameState.positions = [
            {
                position: 0,
                character: {
                    type: 'bowman',
                    health: 50,
                    attack: 25,
                    defence: 25,
                    levelUp: jest.fn()
                }
            }
        ];
        gamePlay.redrawPositions.mockClear();
        controller.computerTurn();
        expect(controller.gameState.isGameOver).toBe(false);
        expect(gamePlay.redrawPositions).toHaveBeenCalled();
    });

    test('computerTurn_with_attack', () => {
        controller.gameState.positions = [
            {
                position: 0,
                character: {
                    type: 'bowman',
                    health: 50,
                    attack: 25,
                    defence: 10
                }
            },
            {
                position: 1,
                character: {
                    type: 'daemon',
                    health: 50,
                    attack: 20,
                    defence: 10,
                    attackRange: 1
                }
            }
        ];
        controller.computerTurn();
        expect(controller.gameState.positions[0].character.health).toBeLessThan(50);
    });

    test('saveState', () => {
        controller.saveState();
        expect(stateService.save).toHaveBeenCalled();
    });

    test('tryLoadGame_with_saved_state', () => {
        const savedState = {
            level: 2,
            theme: 'desert',
            positions: [],
            isGameOver: false,
            isGameComplete: false
        };
        stateService.load = jest.fn(() => savedState);
        new GameController(gamePlay, stateService);
        expect(gamePlay.drawUi).toHaveBeenCalledWith('desert');
    });

    test('tryLoadGame_with_error', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        stateService.load = jest.fn(() => {
            throw new Error('Load error');
        });
        new GameController(gamePlay, stateService);
        expect(gamePlay.drawUi).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    test('characterFactory creates correct characters', () => {
        const bowman = controller.characterFactory('bowman', 1);
        expect(bowman.type).toBe('bowman');
        expect(bowman.level).toBe(1);

        const swordsman = controller.characterFactory('swordsman', 2);
        expect(swordsman.type).toBe('swordsman');

        const magician = controller.characterFactory('magician', 1);
        expect(magician.type).toBe('magician');

        const daemon = controller.characterFactory('daemon', 1);
        expect(daemon.type).toBe('daemon');

        const undead = controller.characterFactory('undead', 1);
        expect(undead.type).toBe('undead');

        const vampire = controller.characterFactory('vampire', 1);
        expect(vampire.type).toBe('vampire');
    });

    test('characterFactory throws on unknown type', () => {
        expect(() => controller.characterFactory('unknown', 1)).toThrow('Неизвестный тип персонажа');
    });

    test('players_select', () => {
        controller.gameState.positions = [
            { position: 0, character: { type: 'bowman', health: 50, attack: 25, defence: 25, moveRange: 2, attackRange: 2 } }
        ];
        controller.onCellClick(0);
        expect(gamePlay.selectCell).toHaveBeenCalledWith(0);
    });

    test('select_error', () => {
        controller.gameState.positions = [
            { position: 0, character: { type: 'daemon', health: 50, attack: 10, defence: 10, moveRange: 1, attackRange: 1 } }
        ];
        controller.onCellClick(0);
        expect(GamePlay.showError).toHaveBeenCalledWith('Выберите героя из своей команды');
    });

    test('select_move_character', () => {
        controller.gameState.positions = [
            { position: 0, character: { type: 'bowman', health: 50, attack: 25, defence: 25, moveRange: 2, attackRange: 2 } }
        ];
        controller.currentIndex = 0;
        gamePlay.selectCell.mockClear();
        controller.onCellClick(2);
        expect(gamePlay.redrawPositions).toHaveBeenCalled();
    });

    test('tooltip', () => {
        controller.gameState.positions = [
            { position: 0, character: { type: 'bowman', health: 50, level: 1, attack: 25, defence: 25 } }
        ];
        controller.onCellEnter(0);
        expect(gamePlay.showCellTooltip).toHaveBeenCalled();
    });

    test('highligths', () => {
        controller.gameState.positions = [
            { position: 0, character: { type: 'bowman', health: 50, attack: 25, defence: 25, moveRange: 2, attackRange: 2 } }
        ];
        controller.currentIndex = 0;
        controller.onCellEnter(2);
        expect(gamePlay.selectCell).toHaveBeenCalledWith(2, 'green');
    });

    test('crosshair', () => {
        controller.gameState.positions = [
            { position: 0, character: { type: 'bowman', health: 50, attack: 25, defence: 25, moveRange: 2, attackRange: 2 } },
            { position: 1, character: { type: 'daemon', health: 50, attack: 10, defence: 10, moveRange: 1, attackRange: 1 } }
        ];
        controller.currentIndex = 0;
        controller.onCellEnter(1);
        expect(gamePlay.selectCell).toHaveBeenCalledWith(1, 'red');
    });

    test('tooltip_hide', () => {
        controller.gameState.positions = [
            { position: 0, character: { type: 'bowman', health: 50, attack: 25, defence: 25 } }
        ];
        controller.onCellLeave(0);
        expect(gamePlay.hideCellTooltip).toHaveBeenCalledWith(0);
        expect(gamePlay.setCursor).toHaveBeenCalledWith(cursors.auto);
    });

    test('onLoadGame', () => {
        const savedState = {
            level: 1,
            theme: 'prairie',
            positions: [],
            isGameOver: false,
            isGameComplete: false
        };
        stateService.loadManual = jest.fn(() => savedState);
        controller.onLoadGame();
        expect(gamePlay.unblockBoard).toHaveBeenCalled();
    });

    test('onLoadGame_gameover', () => {
        const savedState = {
            level: 1,
            theme: 'prairie',
            positions: [],
            isGameOver: true,
            isGameComplete: false
        };
        stateService.loadManual = jest.fn(() => savedState);
        controller.onLoadGame();
        expect(gamePlay.blockBoard).toHaveBeenCalled();
    });

    test('constructor_localStorage', () => {
        const storage = new Map();
        const fakeStorage = {
            getItem: (k) => (storage.has(k) ? storage.get(k) : null),
            setItem: (k, v) => storage.set(k, v),
        };
        const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
        Object.defineProperty(globalThis, 'localStorage', {
            value: fakeStorage, configurable: true,
        });
        try {
            const c = new GameController(gamePlay);
            expect(c.gameStateService).toBeInstanceOf(GameStateService);
            c.saveState();
            expect(storage.get('state')).toContain('"level"');
        } finally {
            if (original) {
                Object.defineProperty(globalThis, 'localStorage', original);
            } else {
                delete globalThis.localStorage;
            }
        }
    });

    test('memory_storage', () => {
        const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
        Object.defineProperty(globalThis, 'localStorage', {
            value: undefined, configurable: true,
        });
        try {
            const c = new GameController(gamePlay);
            c.saveState();
            c.tryLoadGame();
            expect(gamePlay.drawUi).toHaveBeenCalled();
        } finally {
            if (original) {
                Object.defineProperty(globalThis, 'localStorage', original);
            } else {
                delete globalThis.localStorage;
            }
        }
    });

    test('tryLoadGame', () => {
        stateService.load = jest.fn(() => ({
            level: 1,
            theme: 'prairie',
            positions: [],
            isGameOver: true,
            isGameComplete: false,
        }));
        new GameController(gamePlay, stateService);
        expect(gamePlay.blockBoard).toHaveBeenCalled();
    });

    test('attack', async () => {
        controller.gameState.positions = [
            { position: 0, character: { type: 'bowman', health: 50, attack: 25, defence: 25, moveRange: 2, attackRange: 2 } },
            { position: 1, character: { type: 'daemon', health: 50, attack: 10, defence: 10, moveRange: 1, attackRange: 1 } },
        ];
        controller.onCellClick(0);
        controller.onCellClick(1);
        expect(gamePlay.showDamage).toHaveBeenCalledWith(1, expect.any(Number));
        await Promise.resolve();
        expect(controller.gameState.positions[1].character.health).toBeLessThan(50);
        expect(controller.currentIndex).toBeUndefined();
        expect(controller.currentTurn).toBe('computer');
        jest.runAllTimers();
        expect(controller.currentTurn).toBe('player');
    });

    test('select_reset', () => {
        controller.gameState.positions = [
            { position: 1, character: { type: 'daemon', health: 50, attack: 10, defence: 10 } },
        ];
        controller.currentIndex = 0;
        controller.onCellClick(1);
        expect(controller.currentIndex).toBeUndefined();
        expect(gamePlay.showDamage).not.toHaveBeenCalled();
    });

    test('another_select', () => {
        controller.gameState.positions = [
            { position: 0, character: { type: 'bowman', health: 50, attack: 25, defence: 25, moveRange: 2, attackRange: 2 } },
            { position: 9, character: { type: 'magician', health: 50, attack: 20, defence: 15, moveRange: 1, attackRange: 4 } },
        ];
        controller.onCellClick(0);
        controller.onCellClick(9);
        expect(gamePlay.deselectCell).toHaveBeenCalledWith(0);
        expect(gamePlay.selectCell).toHaveBeenLastCalledWith(9);
        expect(controller.currentIndex).toBe(9);
    });

    test('select_reset', () => {
        controller.gameState.positions = [
            { position: 1, character: { type: 'daemon', health: 50, attack: 10, defence: 10 } },
        ];
        controller.currentIndex = 5;
        gamePlay.redrawPositions.mockClear();
        controller.onCellClick(40);
        expect(controller.currentIndex).toBeUndefined();
        expect(gamePlay.redrawPositions).not.toHaveBeenCalled();
    });

    test('reset_select_and_cursor', () => {
        controller.gameState.positions = [
            { position: 1, character: { type: 'bowman', health: 50, attack: 25, defence: 25, moveRange: 2, attackRange: 2 } },
        ];
        controller.currentIndex = 7;
        controller.onCellEnter(3);
        expect(controller.currentIndex).toBeUndefined();
        expect(gamePlay.setCursor).toHaveBeenCalledWith(cursors.auto);
    });

    test('notallowed', () => {
        controller.gameState.positions = [
            { position: 0, character: { type: 'bowman', health: 50, attack: 25, defence: 25, moveRange: 2, attackRange: 2 } },
        ];
        controller.currentIndex = 0;
        gamePlay.selectCell.mockClear();
        controller.onCellEnter(60);
        expect(gamePlay.setCursor).toHaveBeenCalledWith(cursors.notallowed);
        expect(gamePlay.selectCell).not.toHaveBeenCalledWith(60, 'green');
    });

    test('pointer', () => {
        controller.gameState.positions = [
            { position: 0, character: { type: 'bowman', health: 50, attack: 25, defence: 25, moveRange: 2, attackRange: 2 } },
            { position: 9, character: { type: 'magician', health: 50, attack: 20, defence: 15, moveRange: 1, attackRange: 4 } },
        ];
        controller.currentIndex = 0;
        controller.onCellEnter(9);
        expect(gamePlay.setCursor).toHaveBeenCalledWith(cursors.pointer);
    });

    test('notallowed_enemy', () => {
        controller.gameState.positions = [
            { position: 0, character: { type: 'bowman', health: 50, attack: 25, defence: 25, moveRange: 2, attackRange: 2 } },
            { position: 63, character: { type: 'daemon', health: 50, attack: 10, defence: 10, moveRange: 1, attackRange: 1 } },
        ];
        controller.currentIndex = 0;
        gamePlay.selectCell.mockClear();
        controller.onCellEnter(63);
        expect(gamePlay.setCursor).toHaveBeenCalledWith(cursors.notallowed);
        expect(gamePlay.selectCell).not.toHaveBeenCalledWith(63, 'red');
    });
});
