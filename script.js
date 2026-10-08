[object Object]
const searchInput = document.getElementById('siteSearch');
const cards = [...document.querySelectorAll('.article-card')];
searchInput?.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  cards.forEach(card => {
    card.hidden = q && !card.textContent.toLowerCase().includes(q);
  });
});
