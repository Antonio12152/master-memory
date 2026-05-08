'use strict';

import elements from './elements.js';
import data from './data.js';
import dom from './dom.js';
const game = {
    active_el: null,
    count: 0,
    wrong: 0,
    all: 0,
    bomb: false,
    time: null,
    interval: null,
    isLocked: false,
    check_active(el = null) {
        if (this.isLocked) return;
        console.log(data.cards)
        if (el && data.cards[parseInt(el.id) - 1].bomb) {
            data.cards[parseInt(el.id) - 1].flipped = true;
            data.cards[parseInt(el.id) - 1].success = true;

            el.innerHTML = '💣';
            el.className = 'card flipped success';

            this.active_el = null;
            this.redraw();
            return;
        }
        if (this.active_el == null && el) {
            this.active_el = el;
            const cardIndex = parseInt(this.active_el.id) - 1;
            const card = data.cards[cardIndex];

            card.flipped = true;

            if (card.content.startsWith('http')) {
                this.active_el.style.backgroundImage = `url('${card.content}')`;
            } else {
                this.active_el.innerHTML = card.content;
            }

            this.active_el.className = 'card flipped';

        } else if (this.active_el && el && this.active_el != el) {
            const prevIndex = parseInt(this.active_el.id) - 1;
            const currIndex = parseInt(el.id) - 1;
            const prevCard = data.cards[prevIndex];
            const currCard = data.cards[currIndex];

            currCard.flipped = true;

            if (currCard.content.startsWith('http')) {
                el.style.backgroundImage = `url('${currCard.content}')`;
            } else {
                el.innerHTML = currCard.content;
            }

            el.className = 'card flipped';

            if (prevCard.content === currCard.content) {
                prevCard.success = true;
                currCard.success = true;

                this.active_el.className = 'card flipped success';
                el.className = 'card flipped success';
                this.active_el.removeEventListener("click", this.active_el.clickHandler);
                el.removeEventListener("click", el.clickHandler);
                this.check_win();

            } else {
                this.isLocked = true;
                this.wrong++;
                const prev = this.active_el;

                setTimeout(() => {
                    prev.innerHTML = '';
                    prev.style.backgroundImage = '';
                    el.innerHTML = '';
                    el.style.backgroundImage = '';
                    prev.className = 'card';
                    el.className = 'card';

                    prevCard.flipped = false;
                    currCard.flipped = false;

                    this.isLocked = false;
                }, 1000);
            }
            this.active_el = null;
        }
        this.show()
    },
    check_win() {
        this.count++
        if (this.count >= this.all) {
            this.stopTimer();
            game.save_data(this.all, this.interval, this.count, this.wrong, this.bomb);
            game.show_avarage();
            game.find_best();
            alert('You won!');
        }
    },
    create_cards(ci, pack = null, bomb = false) {

        data.cards = []
        if (pack) {
            let allpack = JSON.parse(localStorage.getItem('customDecks'))
            let cpack = this.shuffle(allpack[pack]);
            for (let i = 0; i < ci; i++) {
                data.cards.push(cpack[i]);
                data.cards.push(cpack[i]);
            }
        } else {
            for (let i = 1; i <= ci; i++) {
                data.cards.push(i);
                data.cards.push(i);
            }
        }
        this.bomb = bomb;
        if (bomb) {
            data.cards.push('bomb');
        }

        data.cards = this.shuffle(data.cards);
        data.cards = data.cards.map((content, index) => ({
            id: index + 1,
            content: content,
            flipped: false,
            success: false,
            bomb: content === 'bomb'
        }));
        data.cards.forEach((el, index) => {
            dom.create('', 'div', elements.section, 'card', index + 1)
        });
        this.all = ci;
    },
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    redraw() {
        data.cards = this.shuffle(data.cards);
        elements.section.innerHTML = '';

        data.cards.forEach((el, index) => {
            let card_class = 'card'
            let content = '';
            if (el.success) {
                card_class += ' flipped success';
                content = el.content;
            }

            let card = dom.create(content, 'div', elements.section, card_class, index + 1)
            if (el.bomb && el.success) {
                card.innerHTML = '💣';
            }
        });
    },
    startTimer() {
        this.time = Date.now();
        this.interval = setInterval(() => {
            let elapsedTime = Date.now() - this.time;
            elements.timer.textContent = `Time: ${(elapsedTime / 1000).toFixed(1)}`;
        }, 100);
    },
    stopTimer() {
        clearInterval(this.interval);
        let elapsedTime = Date.now() - this.time;
        this.interval = Number((elapsedTime / 1000).toFixed(1));
    },
    save_data(all, time, count, wrong, bomb = false) {
        console.log(time)
        let item = { all: all, time: time, count: count, wrong: wrong, bomb: bomb }
        const old = game.get_data();
        old.push(item);
        localStorage.setItem("games", JSON.stringify(old));
    },
    clear_data() {
        localStorage.removeItem("games");
    },
    get_data() {
        return JSON.parse(localStorage.getItem("games", "[]")) || [];
    },
    show() {
        elements.show.innerHTML = `Correct:${this.count}, Wrong:${this.wrong}, Total:${this.all}`
    },
    show_avarage() {
        const data = game.get_data();

        if (data.length === 0) {
            elements.avarage.innerHTML = 'Avarage total:0, Time:0.0, Correct/Wrong:0%';
            return;
        }

        let totalTime = 0;
        let totalCorrect = 0;
        let totalWrong = 0;
        let totalAll = 0;

        data.forEach((el) => {
            totalTime += el.time;
            totalCorrect += el.count;
            totalWrong += el.wrong;
            totalAll += el.all;
        });

        let avgTime = totalTime / data.length;
        let avgAll = totalAll / data.length;
        let wrongPercent = (totalWrong / totalAll) * 100;
        let totalAttempts = totalCorrect + totalWrong;
        let correctPercent = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

        elements.avarage.innerHTML = `
        Avarage total: ${avgAll.toFixed(1)},
        Time: ${avgTime.toFixed(1)}s,
        Correct/Wrong: ${correctPercent.toFixed(1)}%
    `;
    },
    find_best() {
        const data = game.get_data();

        if (data.length === 0) {
            elements.best.innerHTML = 'Best time:0.0, Wrong:0, Total:0';
            return;
        }
        let time = 0;
        let correct = 0;
        let wrong = 0;
        let all = 0;

        let best = data[0];

        data.forEach((el) => {
            if (el.all > best.all) {
                best = el;
            }
            else if (el.time < best.time) {
                best = el;
            }
            else if (el.time === best.time && el.wrong < best.wrong) {
                best = el;
            }
        });

        elements.best.innerHTML = `
        Best time: ${best.time.toFixed(1)}s, 
        Wrong: ${best.wrong}, 
        Total: ${best.all}
    `;
    },

}

export default game;