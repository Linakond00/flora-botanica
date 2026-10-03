document.addEventListener('DOMContentLoaded', () => {

  let favorites = [];

  const favCountElem = document.getElementById('fav-count');
  const favModalList = document.getElementById('fav-modal-list');
  const modalFavorites = document.getElementById('modal-favorites');
  const modalOrder = document.getElementById('modal-order');

  // --- 0. БУРГЕР МЕНЮ ---
  const burgerBtn = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');

  if (burgerBtn && navLinks) {
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('is-active');
      navLinks.classList.toggle('is-open');
    });

    // Закрываем меню при клике на любую ссылку
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.classList.remove('is-active');
        navLinks.classList.remove('is-open');
      });
    });
  }

  // --- 1. ТУМБЛЕР ИЗБРАННОГО НА ОБОРОТЕ КАРТОЧКИ ---
  const favBtns = document.querySelectorAll('.js-fav-btn');

  favBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.card');
      const itemData = {
        id: card.getAttribute('data-id'),
        title: card.getAttribute('data-title'),
        price: card.getAttribute('data-price'),
        img: card.getAttribute('data-img')
      };

      const existingIndex = favorites.findIndex(item => item.id === itemData.id);

      if (existingIndex > -1) {
        favorites.splice(existingIndex, 1);
        btn.classList.remove('is-active');
        btn.textContent = '♡';
      } else {
        favorites.push(itemData);
        btn.classList.add('is-active');
        btn.textContent = '♥';
      }

      updateFavCount();
    });
  });

  function updateFavCount() {
    favCountElem.textContent = favorites.length;
  }

  // --- 2. РЕНДЕР И ОТКРЫТИЕ ИЗБРАННОГО ---
  const openFavModalBtn = document.querySelector('.js-open-fav-modal');

  openFavModalBtn.addEventListener('click', () => {
    renderFavorites();
    modalFavorites.classList.add('is-open');
  });

  function renderFavorites() {
    favModalList.innerHTML = '';

    if (favorites.length === 0) {
      favModalList.innerHTML = '<p style="text-align:center; padding:2rem 0;">Ваш список избранного пока пуст 🌸</p>';
      return;
    }

    favorites.forEach(item => {
      const favCard = document.createElement('div');
      favCard.classList.add('fav-item');
      favCard.innerHTML = `
        <div class="fav-item__info">
          <img src="${item.img}" alt="${item.title}" class="fav-item__img">
          <div>
            <div class="fav-item__title">${item.title}</div>
            <div class="fav-item__price">${item.price}</div>
          </div>
        </div>
        <div class="fav-item__actions">
          <button class="btn btn--primary js-open-modal" data-product="${item.title}">Заказать</button>
          <button class="fav-item__remove" data-id="${item.id}" aria-label="Удалить">&times;</button>
        </div>
      `;
      favModalList.appendChild(favCard);
    });

    favModalList.querySelectorAll('.fav-item__remove').forEach(removeBtn => {
      removeBtn.addEventListener('click', () => {
        const id = removeBtn.getAttribute('data-id');
        favorites = favorites.filter(item => item.id !== id);
        
        const mainCardBtn = document.querySelector(`.card[data-id="${id}"] .js-fav-btn`);
        if (mainCardBtn) {
          mainCardBtn.classList.remove('is-active');
          mainCardBtn.textContent = '♡';
        }

        updateFavCount();
        renderFavorites();
      });
    });

    favModalList.querySelectorAll('.js-open-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        modalFavorites.classList.remove('is-open');
        openOrderModal(btn.getAttribute('data-product'));
      });
    });
  }

  // --- 3. ОБЩИЕ МОДАЛЬНЫЕ ОКНА ---
  const closeModalBtns = document.querySelectorAll('[data-close]');

  function openOrderModal(productName) {
    const productNameElem = document.getElementById('modal-product-name');
    if (productNameElem) productNameElem.textContent = productName || 'Букет';
    modalOrder.classList.add('is-open');
  }

  document.querySelectorAll('.js-open-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      openOrderModal(btn.getAttribute('data-product'));
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalFavorites.classList.remove('is-open');
      modalOrder.classList.remove('is-open');
    });
  });

  // --- 4. КАРАУСЕЛЬ ОТЗЫВОВ ---
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (track && prevBtn && nextBtn) {
    let currentPosition = 0;
    const cardWidth = 284; // ширина карточки с учетом gap

    nextBtn.addEventListener('click', () => {
      const maxScroll = -(track.children.length * cardWidth - track.parentElement.clientWidth);
      if (currentPosition > maxScroll) {
        currentPosition -= cardWidth;
        track.style.transform = `translateX(${currentPosition}px)`;
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentPosition < 0) {
        currentPosition += cardWidth;
        track.style.transform = `translateX(${currentPosition}px)`;
      }
    });
  }

  // --- 5. ОБРАБОТКА ФОРМЫ СВЯЗИ ---
  const formSubmit = document.querySelector('.js-form-submit');
  if (formSubmit) {
    formSubmit.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Спасибо! Ваш вопрос отправлен, мы скоро свяжемся с вами.');
      formSubmit.reset();
    });
  }

  // --- 6. ИНТЕРАКТИВНЫЙ CANVAS ФОН (ЛЕПЕСТКИ И ПЫЛИНКИ) ---
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 180,
      active: false
    };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    }, { passive: true });

    class Petal {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -30;
        this.size = Math.random() * 10 + 10;
        this.speedY = Math.random() * 0.8 + 0.5;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed = (Math.random() - 0.5) * 0.02;
        this.flip = Math.random() * Math.PI;
        this.flipSpeed = Math.random() * 0.03 + 0.01;
        this.color = Math.random() > 0.4 ? 'rgba(120, 20, 35, ' : 'rgba(160, 35, 55, ';
        this.opacity = Math.random() * 0.4 + 0.3;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.swayOffset = Math.random() * Math.PI * 2;
      }

      update() {
        this.swayOffset += this.swaySpeed;
        const currentSway = Math.sin(this.swayOffset) * 0.8;

        this.x += this.speedX + currentSway;
        this.y += this.speedY;
        this.angle += this.angularSpeed;
        this.flip += this.flipSpeed;

        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius) * 3;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force;
            this.y += Math.sin(angle) * force;
          }
        }

        if (this.y > height + 40 || this.x < -50 || this.x > width + 50) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.scale(Math.cos(this.flip), 1);

        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
        ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
        ctx.fill();

        ctx.restore();
      }
    }

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 10;
        this.radius = Math.random() * 2 + 1;
        this.speedY = -(Math.random() * 0.4 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.pulse = Math.random() * Math.PI;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.03;
        const currentOpacity = this.opacity + Math.sin(this.pulse) * 0.15;

        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius) * 2;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force;
            this.y += Math.sin(angle) * force;
          }
        }

        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset(false);
        }

        return currentOpacity;
      }

      draw(currentOpacity) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 130, ${Math.max(0, currentOpacity)})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const petalsCount = Math.floor(width < 768 ? 15 : 30);
    const particlesCount = Math.floor(width < 768 ? 20 : 45);

    const petals = Array.from({ length: petalsCount }, () => new Petal());
    const particles = Array.from({ length: particlesCount }, () => new Particle());

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        const opacity = p.update();
        p.draw(opacity);
      });

      petals.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

});