/**
 * Entry point of app: don't change this
 */
import GamePlay from './GamePlay';
import GameController from './GameController';
import GameStateService from './GameStateService';
var gamePlay = new GamePlay();
gamePlay.bindToDOM(document.querySelector('#game-container'));
var stateService = new GameStateService(localStorage);
var gameCtrl = new GameController(gamePlay, stateService);
gameCtrl.init();

// don't write your code here