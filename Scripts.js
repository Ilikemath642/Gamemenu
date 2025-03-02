// Game states
const MENU = 'menu', BLACKJACK = 'blackjack', TIENLEN = 'tienlen';
let currentState = MENU;
let deck = [], playerHand = [], dealerHand = [], aiHand = [], blackjackScore = 0, tienLenWins = 0;
let selectedCardIndex = -1;

// Card class
class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
        this.power = "23456789TJQKA".indexOf(value) + 2;
    }
    toString() { return `${this.value} of ${this.suit}`; }
}

// Deck creation
function createDeck() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    return suits.flatMap(suit => values.map(value => new Card(suit, value)));
}

// Switch game state
function startGame(game) {
    currentState = game;
    document.querySelectorAll('.game-section').forEach(section => 
        section.classList.toggle('active', section.id === game));
    if (game === BLACKJACK) initBlackjack();
    else if (game === TIENLEN) initTienLen();
}

function backToMenu() {
    currentState = MENU;
    document.querySelectorAll('.game-section').forEach(section => 
        section.classList.toggle('active', section.id === MENU));
    updateScores();
}

// Blackjack logic
function initBlackjack() {
    deck = createDeck();
    shuffle(deck);
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    document.getElementById('hit-btn').disabled = false;
    document.getElementById('stand-btn').disabled = false;
    document.getElementById('bj-result').textContent = '';
    renderBlackjack();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getBlackjackValue(hand) {
    let value = 0, aces = 0;
    for (const card of hand) {
        if (card.value === 'A') aces++;
        else value += Math.min(10, "23456789TJQK".indexOf(card.value) + 2);
    }
    for (let i = 0; i < aces; i++) value += (value + 11 <= 21) ? 11 : 1;
    return value;
}

function renderBlackjack() {
    const dealerDiv = document.getElementById('dealer-hand');
    const playerDiv = document.getElementById('player-hand');
    dealerDiv.innerHTML = dealerHand.map((card, i) => 
        `<div class="card${i > 0 && getBlackjackValue(playerHand) <= 21 ? ' hidden' : ''}">${card}</div>`).join('');
    playerDiv.innerHTML = playerHand.map(card => `<div class="card">${card}</div>`).join('');
    document.getElementById('player-value').textContent = getBlackjackValue(playerHand);
    document.getElementById('dealer-value').textContent = 
        getBlackjackValue(playerHand) > 21 ? getBlackjackValue(dealerHand) : '?';
}

function playerHit() {
    playerHand.push(deck.pop());
    renderBlackjack();
    if (getBlackjackValue(playerHand) > 21) endBlackjack('Bust! You lose!');
}

function playerStand() {
    while (getBlackjackValue(dealerHand) < 17) dealerHand.push(deck.pop()); // AI logic
    renderBlackjack();
    const playerVal = getBlackjackValue(playerHand);
    const dealerVal = getBlackjackValue(dealerHand);
    if (dealerVal > 21 || playerVal > dealerVal) {
        blackjackScore++;
        endBlackjack('You win!');
    } else if (playerVal === dealerVal) endBlackjack('Push!');
    else endBlackjack('Dealer wins!');
}

function endBlackjack(message) {
    document.getElementById('bj-result').textContent = message;
    document.getElementById('hit-btn').disabled = true;
    document.getElementById('stand-btn').disabled = true;
}

// Tien Len logic
function initTienLen() {
    deck = createDeck();
    shuffle(deck);
    playerHand = deck.splice(0, 13).sort((a, b) => a.power - b.power);
    aiHand = deck.splice(0, 13).sort((a, b) => a.power - b.power);
    selectedCardIndex = -1;
    renderTienLen();
}

function renderTienLen() {
    const aiDiv = document.getElementById('ai-hand');
    const playerDiv = document.getElementById('player-tl-hand');
    aiDiv.innerHTML = aiHand.map(() => `<div class="card hidden">X</div>`).join('');
    playerDiv.innerHTML = playerHand.map((card, i) => 
        `<div class="card${i === selectedCardIndex ? ' selected' : ''}" data-index="${i}">${card}</div>`).join('');
    document.getElementById('player-tl-count').textContent = playerHand.length;
    document.getElementById('ai-tl-count').textContent = aiHand.length;
    checkTienLenWinner();
}

function selectCard(event) {
    const index = event.target.dataset.index;
    if (index !== undefined) {
        selectedCardIndex = parseInt(index);
        renderTienLen();
    }
}

function playSelectedCard() {
    if (selectedCardIndex >= 0 && playerHand.length) {
        playerHand.splice(selectedCardIndex, 1);
        selectedCardIndex = -1;
        aiPlay();
        renderTienLen();
    }
}

function passTurn() {
    if (aiHand.length) aiPlay();
    renderTienLen();
}

function aiPlay() {
    if (aiHand.length) {
        aiHand.shift(); // Simple AI: plays lowest card
    }
}

function checkTienLenWinner() {
    if (!playerHand.length) {
        tienLenWins++;
        document.getElementById('tl-result').textContent = 'You win!';
    } else if (!aiHand.length) {
        document.getElementById('tl-result').textContent = 'AI wins!';
    }
}

function updateScores() {
    document.getElementById('bj-score').textContent = blackjackScore;
    document.getElementById('tl-wins').textContent = tienLenWins;
}

// Initial render
updateScores();
