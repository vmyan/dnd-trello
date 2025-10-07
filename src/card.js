export default class Card {
  constructor(text, id = Date.now()) {
    this.text = text;
    this.id = id;
    this.element = this.createElement();
  }

  createElement() {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.id = this.id;

    card.innerHTML = `
      <div class="card-text">${this.text}</div>
      <button class="delete-card">✖</button>
    `;

    const deleteBtn = card.querySelector(".delete-card");
    deleteBtn.addEventListener("click", () => {
      card.remove();
      document.dispatchEvent(new CustomEvent("card-deleted"));
    });

    return card;
  }
}
