'use strict';

import elements from './elements.js';
import game from './game.js';

const dom = {
    create(
        content = null,
        type = 'div',
        parent = null,
        className = null,
        index = null
    ) {
        const el = document.createElement(type);
        if (className) el.className = className;
        if (parent) parent.append(el);
        if (index) el.setAttribute("id", index);
        if (parent == elements.section) {
            el.clickHandler = () => game.check_active(el);
            el.addEventListener('click', el.clickHandler);
        }
        if (content) {
            if (parent == elements.pack) {
                el.innerHTML = content;
                el.value = content;
            } else if (parent == elements.section) {
                if (content.startsWith('http')) {
                    el.style.backgroundImage = `url('${content}')`;
                } else {
                    el.innerHTML = content;
                }

            } else {
                el.value = content;
            }
        }
        return el;
    },
    mapping() {
        elements.main = document.querySelector('main');
        elements.section = document.querySelector('section');
        elements.form = document.querySelector('#gameForm');
        elements.input = document.querySelector('#gameInput');
        elements.bomb = document.querySelector('#bomb');
        elements.timer = document.querySelector('#timer');
        elements.show = document.querySelector('#show');
        elements.avarage = document.querySelector('#avarage');
        elements.best = document.querySelector('#best');
        elements.pack = document.querySelector('#pack');

        elements.btn_show_modal = document.querySelector('#btn_show');
        elements.modal = document.querySelector("#myModal");
        elements.close_modal = document.querySelector(".close");
        elements.data_list = document.querySelector(".data-list");
        elements.btn_delete = document.querySelector('#btn_delete');

        elements.btn_create_deck = document.querySelector('#btn_create_deck');
        elements.createDeckModal = document.querySelector('#createDeckModal');
        elements.deckForm = document.querySelector('#deckForm');
        elements.deckName = document.querySelector('#deckName');
        elements.deckEmojis = document.querySelector('#deckEmojis');
        elements.btn_delete_deck = document.querySelector('#btn_delete_deck');
    }
}

export default dom;