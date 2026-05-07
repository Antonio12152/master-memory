'use strict';

import dom from "./dom.js";
import elements from './elements.js';
import game from './game.js';
import data from './data.js';

function start_game() {
    const value = parseInt(elements.input.value);
    const pack = elements.pack.value;
    if (value && value >= 2 && value <= 10) {
        const packs = JSON.parse(localStorage.getItem('customDecks'))
        const packImages = packs[pack].filter(item => item.startsWith('http'));
        preloadImages(packImages);
        elements.section.innerHTML = '';
        game.count = 0;
        game.wrong = 0;
        game.active_el = null;
        game.show();
        game.find_best();
        game.stopTimer();
        game.startTimer();
        game.create_cards(value, pack, elements.bomb.checked);
    }
}
function delete_local() {
    game.clear_data();
    game.show_avarage();
    game.find_best();
}
function show_local() {
    elements.modal.style.display = "block";

    elements.data_list.innerHTML = '';

    game.get_data().forEach((el) => {
        dom.create(
            `
            <div class="game-item">
                <p>Cards: ${el.all}</p>
                <p>Time: ${el.time.toFixed(1)}s</p>
                <p>Correct: ${el.count}</p>
                <p>Wrong: ${el.wrong}</p>
            </div>
            `,
            'div',
            elements.data_list,
            'game-record',
            ''
        );
    });
}
function create_deck() {
    const name = elements.deckName.value.trim();
    const emojisText = elements.deckEmojis.value.trim();

    const standardPacks = ['fruits', 'animal', 'fish', 'nature', 'food', 'transport', 'sport', 'weather', 'flags', 'smiles'];

    if (!name || !emojisText) {
        alert('Fill all fields');
        return;
    }

    if (standardPacks.includes(name.toLowerCase())) {
        alert('Change name - this is a standard pack');
        return;
    }

    let emojis = emojisText
        .split(/[\s\n]+/)
        .filter(item => item.length > 0);

    if (emojis.length < 10) {
        alert(`Deck must contain at least 10 items. You have ${emojis.length}`);
        return;
    }

    const deckArray = emojis.slice(0, 10);

    let customDecks = localStorage.getItem('customDecks');
    customDecks = customDecks ? JSON.parse(customDecks) : {};

    customDecks[name.toLowerCase()] = deckArray;
    localStorage.setItem('customDecks', JSON.stringify(customDecks));

    elements.deckForm.reset();
    elements.createDeckModal.style.display = "none";

    data.packs = { ...data.packs, ...customDecks };

    draw_packs();

    alert(`Deck "${name}" created with ${deckArray.length} items!`);
}

function show_create_deck() {
    elements.createDeckModal.style.display = "block";
}

function close_create_deck() {
    elements.createDeckModal.style.display = "none";
}

function draw_packs() {
    elements.pack.innerHTML = '';

    let custom = JSON.parse(localStorage.getItem('customDecks'))
    for (const key in custom) {
        dom.create(key, 'option', elements.pack, '', '');
    }
}
function delete_deck() {
    localStorage.removeItem('customDecks');
    set_standart_card();
    draw_packs();
}
function set_standart_card() {
    localStorage.setItem('customDecks', JSON.stringify(data.packs));
}
function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}
const init = async () => {
    dom.mapping();
    if (!localStorage.getItem('customDecks')) {
        set_standart_card();
    }
    game.show_avarage();
    game.find_best();
    draw_packs();
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        start_game();
    });
    elements.btn_show_modal.addEventListener('click', (e) => {
        e.preventDefault();
        show_local();
    });
    elements.close_modal.addEventListener('click', (e) => {
        e.preventDefault();
        elements.modal.style.display = "none";
    });
    elements.btn_create_deck.addEventListener('click', (e) => {
        e.preventDefault();
        show_create_deck();
    });
    document.querySelector('#createDeckModal .close').addEventListener('click', (e) => {
        e.preventDefault();
        close_create_deck();
    });
    elements.btn_delete_deck.addEventListener('click', (e) => {
        e.preventDefault();
        delete_deck();
    });
    elements.deckForm.addEventListener('submit', (e) => {
        e.preventDefault();
        create_deck();
    });
    elements.btn_delete.addEventListener('click', (e) => {
        e.preventDefault();
        delete_local();
    });

    window.onclick = function (event) {
        if (event.target == elements.modal) {
            elements.modal.style.display = "none";
        }
    }

}

init();