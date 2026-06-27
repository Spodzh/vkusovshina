(function() {
    // ===== НАСТРОЙКИ TELEGRAM =====
    const TELEGRAM_BOT_TOKEN = '8752139780:AAEIbtDqq2F3FJ2TqFWcINLWg6Zml8UyAQI';
    const TELEGRAM_CHAT_ID = '7892506421';

    // ===== ДАННЫЕ БЛЮД =====
    const allDishes = [
        { name: 'Чай', emoji: '☕', price: '20 коп.', desc: 'Ароматный чёрный чай с бергамотом' },
        { name: 'Вафли', emoji: '🧇', price: '25 коп.', desc: 'Хрустящие вафли с варёной сгущёнкой' },
        { name: 'Конфеты', emoji: '🍬', price: '15 коп.', desc: 'Ассорти шоколадных конфет' },
        { name: 'Бутерброд с колбасой и батоном', emoji: '🥪', price: '30 коп.', desc: 'Классический бутерброд с докторской колбасой' },
        { name: 'Жареное яйцо', emoji: '🍳', price: '25 коп.', desc: 'Яичница-глазунья с зеленью' },
        { name: 'Вода', emoji: '💧', price: '10 коп.', desc: 'Питьевая вода без газа' },
        { name: 'Кола', emoji: '🥤', price: '20 коп.', desc: 'Освежающий газированный напиток' },
        { name: 'Яблоко', emoji: '🍏', price: '20 коп.', desc: 'Сочное яблоко (сорт «Гренни Смит»)' },
        { name: 'Квас', emoji: '🍺', price: '15 коп.', desc: 'Домашний квас на ржаном хлебе' },
        { name: 'Кофе', emoji: '☕', price: '15 коп.', desc: 'Чёрный кофе из свежемолотых зёрен' },
        { name: 'Картошка фри', emoji: '🍟', price: '30 коп.', desc: 'Золотистая картошка фри с солью' },
        { name: 'Гренки', emoji: '🍞', price: '20 коп.', desc: 'Хрустящие гренки с чесноком' },
        { name: 'Трубочки вафельные Вивайли', emoji: '🧇', price: '45 коп.', desc: 'Вафельные трубочки с кремовой начинкой' },
        { name: 'Пельмени', emoji: '🥟', price: '10 коп.', desc: 'Домашние пельмени с мясом, со сметаной' },
        { name: 'Чипсы', emoji: '🍟', price: '1 руб.', desc: 'Хрустящие картофельные чипсы (паприка)' },
        { name: 'Жвачка Love is', emoji: '🍬', price: '10 коп.', desc: 'Жевательная резинка со вкусом мяты' },
        { name: 'Булочки', emoji: '🥐', price: '50 коп.', desc: 'Сдобные булочки с маком' },
        { name: 'Жвачка арбузная', emoji: '🍉', price: '5 коп.', desc: 'Жевательная резинка со вкусом арбуза' },
        { name: 'Сок с трубочкой', emoji: '🧃', price: '30 коп.', desc: 'Яблочный сок с трубочкой' }
    ];

    const popularDishes = allDishes.filter(d => ['Трубочки вафельные Вивайли', 'Чипсы', 'Кофе', 'Чай', 'Кола'].includes(d.name));
    const menuDishes = allDishes.filter(d => !popularDishes.includes(d));

    // ===== КОРЗИНА =====
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        document.getElementById('cartCount').textContent = cart.length;
    }

    function addToCart(dishName) {
        const dish = allDishes.find(d => d.name === dishName);
        if (!dish) return;
        cart.push({ ...dish });
        saveCart();
        showNotification(`${dish.emoji} ${dish.name} добавлено в корзину!`);
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        saveCart();
        renderCartModal();
    }

    function clearCart() {
        cart = [];
        saveCart();
        renderCartModal();
    }

    function showNotification(text) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
            background: var(--bg-card); color: var(--text-primary);
            padding: 12px 24px; border-radius: 30px;
            border: 1px solid var(--accent);
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            z-index: 999; font-weight: 500;
            transition: opacity 0.5s;
        `;
        notif.textContent = text;
        document.body.appendChild(notif);
        setTimeout(() => {
            notif.style.opacity = '0';
            setTimeout(() => notif.remove(), 500);
        }, 2000);
    }

    // ===== TELEGRAM =====
    function sendTelegramMessage(message) {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            })
        })
        .then(r => r.json())
        .then(data => {
            if (!data.ok) throw new Error(data.description);
            console.log('✅ Сообщение отправлено');
        })
        .catch(err => console.error('❌ Ошибка:', err));
    }

    // ===== МОДАЛКА УСПЕШНОГО ЗАКАЗА =====
    function showOrderSuccess() {
        const modal = document.getElementById('orderSuccessModal');
        modal.classList.add('open');
        document.getElementById('closeSuccessBtn').onclick = function() {
            modal.classList.remove('open');
        };
        modal.onclick = function(e) {
            if (e.target === modal) modal.classList.remove('open');
        };
        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                modal.classList.remove('open');
                document.removeEventListener('keydown', esc);
            }
        });
    }

    function sendOrderFromCart() {
        if (cart.length === 0) {
            alert('Корзина пуста!');
            return;
        }
        const userName = localStorage.getItem('userName') || 'Гость';
        const dishesList = cart.map((d, i) => `${i+1}. ${d.emoji} ${d.name} (${d.price})`).join('\n');
        const total = cart.reduce((sum, d) => sum + parseFloat(d.price.replace(/\D/g,'')) || 0, 0);
        const msg = `🛒 Новый заказ из корзины!\n\n👤 Имя: ${userName}\n📋 Блюда:\n${dishesList}\n\n💰 Итого: ${total} коп.\n🕒 Время: ${new Date().toLocaleString('ru-RU')}`;
        sendTelegramMessage(msg);
        clearCart();
        document.getElementById('cartModal').classList.remove('open');
        showOrderSuccess();
    }

    // ===== КОРЗИНА МОДАЛКА =====
    function renderCartModal() {
        const container = document.getElementById('cartItems');
        const totalSpan = document.getElementById('cartTotal');
        if (cart.length === 0) {
            container.innerHTML = `<div class="empty-cart">Корзина пуста</div>`;
            totalSpan.textContent = 'Итого: 0 блюд';
            return;
        }
        let html = '';
        cart.forEach((item, idx) => {
            html += `
                <div class="cart-item">
                    <span class="name">${item.emoji} ${item.name} (${item.price})</span>
                    <button class="remove-btn" data-index="${idx}">✕</button>
                </div>
            `;
        });
        container.innerHTML = html;
        totalSpan.textContent = `Итого: ${cart.length} блюд`;
        container.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                removeFromCart(idx);
            });
        });
    }

    // ===== ОТРИСОВКА МЕНЮ =====
    function renderMenu() {
        const container = document.getElementById('menuGrid');
        container.innerHTML = menuDishes.map(d => `
            <div class="menu-item">
                <span class="emoji">${d.emoji}</span>
                <h3>${d.name}</h3>
                <span class="price">${d.price}</span>
                <p>${d.desc}</p>
                <button class="add-to-cart" data-name="${d.name}">Добавить в корзину</button>
            </div>
        `).join('');

        container.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                addToCart(this.dataset.name);
            });
        });
    }

    function renderPopular() {
        const container = document.querySelector('.popular-grid');
        container.innerHTML = popularDishes.map(d => `
            <div class="popular-item">
                <span class="emoji">${d.emoji}</span>
                <h3>${d.name}</h3>
                <span class="price">${d.price}</span>
                <p>${d.desc}</p>
                <button class="add-to-cart" data-name="${d.name}">Добавить в корзину</button>
            </div>
        `).join('');

        container.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                addToCart(this.dataset.name);
            });
        });
    }

    // ===== ТЕМА =====
    const themeToggle = document.getElementById('themeToggle');
    let lightMode = localStorage.getItem('lightMode') === 'true';
    if (lightMode) {
        document.body.classList.add('light');
        themeToggle.textContent = '🌙';
    } else {
        themeToggle.textContent = '☀️';
    }
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('light');
        const isLight = document.body.classList.contains('light');
        localStorage.setItem('lightMode', isLight);
        this.textContent = isLight ? '🌙' : '☀️';
    });

    // ===== КОЛЕСО ФОРТУНЫ =====
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const spinBtn = document.getElementById('spinBtn');
    const timerDiv = document.getElementById('wheelTimer');

    const wheelDishes = allDishes.map(d => ({ emoji: d.emoji }));
    const wheelColors = [
        '#c89b7b', '#8b5e3c', '#5a3d2b', '#b8957a', '#a67c5b',
        '#d4a88a', '#7a4f3a', '#e8c9b0', '#9b6b4a', '#bf8f6b',
        '#8a6b4a', '#c4a88a', '#6a4d3a', '#dbb89a', '#a07a5a',
        '#b08a6a', '#7a5a40', '#d4b09a', '#9a7a5a', '#c09a7a'
    ];

    let currentRotation = 0;
    let isSpinning = false;
    const LAST_SPIN_KEY = 'lastSpinTime';
    const SPIN_COOLDOWN = 24 * 60 * 60 * 1000;

    function getLastSpin() {
        return parseInt(localStorage.getItem(LAST_SPIN_KEY)) || 0;
    }
    function setLastSpin(time) {
        localStorage.setItem(LAST_SPIN_KEY, String(time));
    }
    function getRemainingTime() {
        const last = getLastSpin();
        if (last === 0) return 0;
        const elapsed = Date.now() - last;
        if (elapsed >= SPIN_COOLDOWN) return 0;
        return SPIN_COOLDOWN - elapsed;
    }

    function updateTimerDisplay() {
        const remaining = getRemainingTime();
        if (remaining <= 0) {
            timerDiv.innerHTML = 'Колесо готово к вращению! 🎡';
            spinBtn.disabled = false;
            return;
        }
        const hours = Math.floor(remaining / (60*60*1000));
        const mins = Math.floor((remaining % (60*60*1000)) / (60*1000));
        const secs = Math.floor((remaining % (60*1000)) / 1000);
        timerDiv.innerHTML = `⏳ Следующий прокрут через <span>${hours}ч ${mins}м ${secs}с</span>`;
        spinBtn.disabled = true;
    }

    function drawWheel(rotation) {
        const count = wheelDishes.length;
        const arc = (2 * Math.PI) / count;
        const radius = canvas.width / 2 - 10;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < count; i++) {
            const startAngle = i * arc + rotation;
            const endAngle = startAngle + arc;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = wheelColors[i % wheelColors.length];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            const midAngle = startAngle + arc / 2;
            const textRadius = radius * 0.65;
            const x = cx + Math.cos(midAngle) * textRadius;
            const y = cy + Math.sin(midAngle) * textRadius;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(midAngle + Math.PI/2);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px Roboto';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(wheelDishes[i].emoji, 0, 0);
            ctx.restore();
        }

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(cx, 10);
        ctx.lineTo(cx - 20, 30);
        ctx.lineTo(cx + 20, 30);
        ctx.closePath();
        ctx.fill();
    }

    function spinWheel() {
        if (isSpinning) return;
        if (getRemainingTime() > 0) {
            alert('Колесо можно крутить только раз в 24 часа!');
            return;
        }

        isSpinning = true;
        spinBtn.disabled = true;

        const spins = 5 + Math.random() * 5;
        const extra = Math.random() * 2 * Math.PI;
        const targetRotation = currentRotation + spins * 2 * Math.PI + extra;

        const duration = 4000;
        const startTime = performance.now();
        const startRotation = currentRotation;

        function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const rot = startRotation + (targetRotation - startRotation) * eased;
            drawWheel(rot);
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                currentRotation = targetRotation;
                isSpinning = false;
                spinBtn.disabled = false;
                const count = wheelDishes.length;
                const arc = (2 * Math.PI) / count;
                const pointerAngle = -Math.PI / 2;
                let angle = (pointerAngle - currentRotation) % (2 * Math.PI);
                if (angle < 0) angle += 2 * Math.PI;
                const index = Math.floor(angle / arc) % count;
                const selected = wheelDishes[index];
                setLastSpin(Date.now());
                showWheelResult(selected);
                updateTimerDisplay();
            }
        }
        requestAnimationFrame(animate);
    }

    function showWheelResult(dish) {
        const modal = document.getElementById('wheelResultModal');
        const dishSpan = document.getElementById('wheelResultDish');
        const nextTimerSpan = document.getElementById('wheelNextTimer');
        dishSpan.textContent = dish.emoji;
        const remaining = getRemainingTime();
        const hours = Math.floor(remaining / (60*60*1000));
        const mins = Math.floor((remaining % (60*60*1000)) / (60*1000));
        const secs = Math.floor((remaining % (60*1000)) / 1000);
        nextTimerSpan.textContent = `${hours}ч ${mins}м ${secs}с`;
        modal.classList.add('open');

        const fullDish = allDishes.find(d => d.emoji === dish.emoji);

        document.getElementById('wheelOrderBtn').onclick = function() {
            modal.classList.remove('open');
            const userName = localStorage.getItem('userName') || 'Гость';
            const msg = `🎡 Заказ с Колеса Вкуса!\n\n👤 Имя: ${userName}\n🍽️ Блюдо: ${fullDish ? fullDish.emoji + ' ' + fullDish.name : dish.emoji}\n🕒 Время: ${new Date().toLocaleString('ru-RU')}`;
            sendTelegramMessage(msg);
            showOrderSuccess();
        };
        document.getElementById('wheelCancelBtn').onclick = function() {
            modal.classList.remove('open');
        };
    }

    // ===== БУРГЕР =====
    const toggle = document.getElementById('menuToggle');
    const links = document.getElementById('navLinks');
    const nav = document.querySelector('.nav');

    if (toggle && links) {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            links.classList.toggle('open');
        });
        links.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                toggle.classList.remove('active');
                links.classList.remove('open');
            });
        });
        document.addEventListener('click', function(e) {
            if (nav && !nav.contains(e.target)) {
                toggle.classList.remove('active');
                links.classList.remove('open');
            }
        });
    }

    // ===== КНОПКА НАВЕРХ =====
    const backBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backBtn.classList.add('visible');
        } else {
            backBtn.classList.remove('visible');
        }
    });
    backBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== КОРЗИНА =====
    document.getElementById('cartBtn').addEventListener('click', function() {
        renderCartModal();
        document.getElementById('cartModal').classList.add('open');
    });
    document.getElementById('closeCartBtn').addEventListener('click', function() {
        document.getElementById('cartModal').classList.remove('open');
    });
    document.getElementById('cartModal').addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });
    document.getElementById('orderCartBtn').addEventListener('click', sendOrderFromCart);

    // ===== ИМЯ =====
    let userName = localStorage.getItem('userName') || '';
    function askForName() {
        const modal = document.getElementById('nameModal');
        const input = document.getElementById('userNameInput');
        const saveBtn = document.getElementById('saveNameBtn');
        modal.classList.add('open');
        input.focus();

        function saveName() {
            const name = input.value.trim();
            if (name.length < 2) {
                alert('Пожалуйста, введите имя (минимум 2 символа)');
                return;
            }
            userName = name;
            localStorage.setItem('userName', userName);
            modal.classList.remove('open');
        }
        saveBtn.addEventListener('click', saveName);
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') saveName();
        });
    }
    if (!userName) {
        setTimeout(askForName, 300);
    }

    // ===== ВСЁ, ЧТО СВЯЗАНО С ЗАКРЫТИЕМ ОВЕРЛЕЯ – УДАЛЕНО =====
    // Оверлей теперь всегда виден, и его нельзя закрыть

    // ===== ИНИЦИАЛИЗАЦИЯ =====
    renderMenu();
    renderPopular();
    updateCartUI();
    updateTimerDisplay();
    drawWheel(0);
    spinBtn.addEventListener('click', spinWheel);
    setInterval(updateTimerDisplay, 1000);

})();
