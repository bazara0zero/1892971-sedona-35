'use strict';

const FAVORITES_KEY = 'sedona-favorites';

const readFavorites = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    return [];
  }
};

const writeFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

const cardData = (card) => ({
  id: card.dataset.hotelId,
  name: card.dataset.hotelName,
  type: card.dataset.hotelType,
  price: card.dataset.hotelPrice,
  rating: card.dataset.hotelRating,
  stars: card.dataset.hotelStars,
  image: card.dataset.hotelImage,
});

const updateCounters = (count) => {
  document.querySelectorAll('.number-favs').forEach((counter) => {
    counter.textContent = String(count);
  });
};

const createFavoriteCard = (hotel) => {
  const card = document.createElement('article');
  card.className = 'housing-card';
  card.dataset.hotelId = hotel.id;
  card.innerHTML = `
    <img src="${hotel.image}" width="300" height="211" alt="${hotel.name}." loading="lazy">
    <h3 class="housing-title">${hotel.name}</h3>
    <span class="housing-type">${hotel.type}</span>
    <span class="housing-price">От ${hotel.price} ₽</span>
    <a class="button details basic-button" href="catalog.html#hotel-${hotel.id}">Подробнее</a>
    <button class="button selected-button add-to-favs" type="button">Удалить</button>
    <div class="stars stars-${hotel.stars}"><span class="visually-hidden">${hotel.stars} звезды</span></div>
    <p class="raiting">Рейтинг: ${hotel.rating}</p>
  `;
  return card;
};

document.addEventListener('DOMContentLoaded', () => {
  const modalContainer = document.querySelector('.modal-container');
  const closeButton = document.querySelector('.modal-close-button');
  const openButtons = document.querySelectorAll('.want-button, .booking-button');

  const closeModal = () => {
    if (!modalContainer) return;
    modalContainer.classList.add('modal-container-close');
    document.body.classList.remove('modal-open');
  };

  const openModal = (event) => {
    if (!modalContainer) return;
    event.preventDefault();
    modalContainer.classList.remove('modal-container-close');
    document.body.classList.add('modal-open');
    modalContainer.querySelector('input')?.focus();
  };

  openButtons.forEach((button) => button.addEventListener('click', openModal));
  closeButton?.addEventListener('click', closeModal);
  modalContainer?.addEventListener('click', (event) => {
    if (event.target === modalContainer) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  if (modalContainer && window.location.hash === '#search') {
    modalContainer.classList.remove('modal-container-close');
    document.body.classList.add('modal-open');
  }

  let favorites = readFavorites();
  const catalogCards = [...document.querySelectorAll('.housing-card[data-hotel-id]')];
  if (catalogCards.length && !localStorage.getItem(FAVORITES_KEY)) {
    favorites = catalogCards
      .filter((card) => card.querySelector('.add-to-favs')?.classList.contains('selected-button'))
      .map(cardData);
    writeFavorites(favorites);
  }

  updateCounters(favorites.length);
  catalogCards.forEach((card) => {
    const button = card.querySelector('.add-to-favs');
    const selected = favorites.some((hotel) => hotel.id === card.dataset.hotelId);
    button?.classList.toggle('selected-button', selected);
    button?.classList.toggle('second-button', !selected);
    if (button) button.textContent = selected ? 'В избранном' : 'В избранное';
    button?.addEventListener('click', () => {
      const index = favorites.findIndex((hotel) => hotel.id === card.dataset.hotelId);
      if (index >= 0) favorites.splice(index, 1);
      else favorites.push(cardData(card));
      writeFavorites(favorites);
      const isSelected = index < 0;
      button.classList.toggle('selected-button', isSelected);
      button.classList.toggle('second-button', !isSelected);
      button.textContent = isSelected ? 'В избранном' : 'В избранное';
      updateCounters(favorites.length);
    });
  });

  const favoritesList = document.querySelector('[data-favorites-list]');
  const emptyMessage = document.querySelector('[data-favorites-empty]');
  if (favoritesList) {
    favoritesList.replaceChildren(...favorites.map(createFavoriteCard));
    if (emptyMessage) emptyMessage.hidden = favorites.length > 0;
    favoritesList.querySelectorAll('.add-to-favs').forEach((button) => {
      button.addEventListener('click', () => {
        const card = button.closest('[data-hotel-id]');
        favorites = favorites.filter((hotel) => hotel.id !== card.dataset.hotelId);
        writeFavorites(favorites);
        card.remove();
        updateCounters(favorites.length);
        if (emptyMessage) emptyMessage.hidden = favorites.length > 0;
      });
    });
  }

  document.querySelectorAll('.guests-button').forEach((button) => {
    button.addEventListener('click', () => {
      const field = button.closest('.field-group')?.querySelector('input[type="number"]');
      if (!field) return;
      const current = Number(field.value) || 0;
      field.value = String(button.classList.contains('more') ? current + 1 : Math.max(0, current - 1));
    });
  });

  document.querySelectorAll('form.newsletter-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let status = form.querySelector('.form-status');
      if (!status) {
        status = document.createElement('p');
        status.className = 'form-status';
        form.append(status);
      }
      status.textContent = 'Спасибо! Мы добавили вас в список рассылки.';
      form.reset();
    });
  });

  document.querySelector('.search-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    let status = event.currentTarget.querySelector('.form-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'form-status';
      event.currentTarget.append(status);
    }
    status.textContent = 'Параметры поиска сохранены. Выберите гостиницу в каталоге.';
  });
});
