let selectedCards = [];
let cardMap = {};
let currentBit = 0;
let answerBits = 0;
const maxBits = 5;
let fullDeck = [];

const cardPickContainer = document.getElementById("card-pick");
const groupContainer = document.getElementById("card-group");
const revealContainer = document.getElementById("revealed-card");

// Fetch cards from the Deck of Cards API
async function fetchCards() {
    try {
        const res = await fetch("https://deckofcardsapi.com/api/deck/new/draw/?count=52");
        const data = await res.json();

        fullDeck = data.cards;
        selectedCards = fullDeck.slice(0, 20); // Use first 20 cards for the trick

        // Assign binary values to each card (1-20)
        selectedCards.forEach((card, i) => {
            card.binaryValue = i + 1;
            cardMap[card.binaryValue] = card;
        });

        // Add cards to the initial selection display
        selectedCards.forEach((card) => {
            const img = document.createElement("img");
            img.src = card.image;
            img.alt = `${card.value} of ${card.suit}`;
            cardPickContainer.appendChild(img);
        });

        fanCards(cardPickContainer);
    } catch (error) {
        console.error("Error fetching cards:", error);
    }
}

// Create fan effect for cards
function fanCards(container) {
    const cards = container.querySelectorAll("img");
    const total = cards.length;
    const spacing = 5; // Angle spacing between cards
    const startAngle = -Math.floor(total / 2) * spacing;

    cards.forEach((card, i) => {
        const angle = startAngle + i * spacing;
        const offset = (i - total / 2) * 30 - 20;
        card.style.transform = `rotate(${angle}deg)`;
        card.style.left = `calc(50% + ${offset}px)`;
        card.style.bottom = '0';
        card.style.zIndex = i;
    });
}

// Begin the trick
function startTrick() {
    document.getElementById("step-1").classList.add("hidden");
    document.getElementById("main-title").classList.add("hidden");
    document.getElementById("step-2").classList.remove("hidden");
    showNextGroup();
}

// Show the next group of cards based on binary position
function showNextGroup() {
    groupContainer.innerHTML = "";

    const bit = 1 << currentBit;
    const group = selectedCards.filter((card) => (card.binaryValue & bit) !== 0);

    // Get some extra cards that weren't in the selection to fill out the display
    const availableExtras = fullDeck.filter((c) => !selectedCards.includes(c));
    const shuffledExtras = availableExtras.sort(() => Math.random() - 0.5);
    const extras = shuffledExtras.slice(0, 14 - group.length);

    // Combine and shuffle
    const combined = [...group, ...extras].sort(() => Math.random() - 0.5);

    combined.forEach((card) => {
        const img = document.createElement("img");
        img.src = card.image;
        img.alt = `${card.value} of ${card.suit}`;
        groupContainer.appendChild(img);
    });

    fanCards(groupContainer);
}

// Process the user's answer
function answer(isYes) {
    if (isYes) answerBits += 1 << currentBit;
    currentBit++;

    if (currentBit >= maxBits) {
        revealCard();
    } else {
        showNextGroup();
    }
}

// Reveal the selected card with animation
function revealCard() {
    document.getElementById("step-2").classList.add("hidden");
    document.getElementById("step-3").classList.remove("hidden");

    const card = cardMap[answerBits];

    if (card) {
        // Create the main center card first
        const mainCard = document.createElement("img");
        mainCard.src = card.image;
        mainCard.alt = `${card.value} of ${card.suit}`;
        mainCard.className = "main-card"; // Special class for center card
        revealContainer.appendChild(mainCard);

        // Create floating background cards with delay
        setTimeout(() => {
            // Create multiple floating cards (12 copies)
            for (let i = 0; i < 12; i++) {
                const img = document.createElement("img");
                img.src = card.image;
                img.alt = `${card.value} of ${card.suit}`;

                // Randomize starting positions
                const randomLeft = Math.random() * 100; // Random horizontal position (0-100%)
                const randomDelay = Math.random() * 5; // Random animation delay (0-5s)
                const randomDuration = 8 + Math.random() * 7; // Random animation duration (8-15s)

                img.style.left = `${randomLeft}%`;
                img.style.animationDelay = `${randomDelay}s`;
                img.style.animationDuration = `${randomDuration}s`;

                revealContainer.appendChild(img);
            }
        }, 800); // Delay the floating cards
    } else {
        revealContainer.innerHTML = `<div class="error-message">Card not found. Try again!</div>`;
    }
}

// Reset the trick
function shuffleDeck() {
    document.getElementById("step-3").classList.add("hidden");
    document.getElementById("main-title").classList.remove("hidden");
    document.getElementById("step-1").classList.remove("hidden");

    cardPickContainer.innerHTML = "";
    groupContainer.innerHTML = "";
    revealContainer.innerHTML = "";

    currentBit = 0;
    answerBits = 0;
    selectedCards = [];
    cardMap = {};

    fetchCards();
}

const isThumbnail = window.location.href.includes("pen") && !window.location.href.includes("edit");
if (isThumbnail) {
    window.addEventListener("load", () => {
        startTrick();
        for (let i = 0; i < maxBits; i++) {
            setTimeout(() => {
                answer(Math.random() < 0.5);
            }, i * 800);
        }
    });
} else {
    fetchCards();
}