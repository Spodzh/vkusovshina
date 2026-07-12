// cart.js - общая логика корзины и Telegram

// ===== НАСТРОЙКИ TELEGRAM =====
const TELEGRAM_BOT_TOKEN = '8752139780:AAEIbtDqq2F3FJ2TqFWcINLWg6Zml8UyAQI';
const TELEGRAM_CHAT_ID = '7892506421';

// ===== КОРЗИНА =====
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const countElements = document.querySelectorAll('.cart-count');
    countElements.forEach(el => el.textContent = cart.length);
}

function addToCart(dishName, allDishes) {
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
        background: #1a0f0f; color: #f5efe8;
        padding: 14px 24px; border-radius: 30px;
        border: 1px solid #c9a96e;
        box-shadow: 0 4px 20px rgba(0,0,0,0.6);
        z-index: 999; font-weight: 500;
        transition: opacity 0.5s;
        max-width: 90%;
        text-align: center;
        font-size: 1rem;
    `;
    notif.textContent = text;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 500);
    }, 2500);
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

// ===== МОДАЛКА КОРЗИНЫ =====
function renderCartModal() {
    const container = document.getElementById('cartItems');
    const totalSpan = document.getElementById('cartTotal');
    if (!container) return;
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

function showOrderSuccess() {
    const modal = document.getElementById('orderSuccessModal');
    if (modal) {
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
    } else {
        alert('Заказ отправлен! Ожидайте, скоро будет готово.');
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initCart() {
    updateCartUI();
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const orderCartBtn = document.getElementById('orderCartBtn');

    if (cartBtn && cartModal) {
        cartBtn.addEventListener('click', function() {
            renderCartModal();
            cartModal.classList.add('open');
        });
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', function() {
                cartModal.classList.remove('open');
            });
        }
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) cartModal.classList.remove('open');
        });
        if (orderCartBtn) {
            orderCartBtn.addEventListener('click', sendOrderFromCart);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initCart();
});

// Делаем функции глобальными для использования в других скриптах
window.addToCart = addToCart;
window.sendTelegramMessage = sendTelegramMessage;
window.showOrderSuccess = showOrderSuccess;
window.showNotification = showNotification;
window.allDishes = [];
