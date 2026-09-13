const PUBLIC_API_URL = "";

const state = {
  characters: [],
};

function renderCount() {
  const count = document.querySelector("#public-count");
  const total = state.characters.length;
  count.textContent = `${total} nhân vật`;
}

function renderArchive() {
  const emptyState = document.querySelector("#empty-state");
  const grid = document.querySelector("#character-grid");

  renderCount();
  emptyState.hidden = state.characters.length > 0;
  grid.hidden = state.characters.length === 0;
}

async function loadPublishedCharacters() {
  if (!PUBLIC_API_URL) {
    renderArchive();
    return;
  }

  // Kết nối API chỉ-đọc sẽ được bổ sung sau khi backend Admin có endpoint
  // công khai đã được kiểm tra quyền và CORS.
  renderArchive();
}

loadPublishedCharacters();
