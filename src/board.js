import Card from "./card.js";

export default class Board {
  constructor(container) {
    this.container = container;
    this.columns = ["To Do", "In Progress", "Done"];
    this.state = JSON.parse(localStorage.getItem("boardState")) || this.initState();
    this.render();
    this.addEventListeners();
    this.addDnDEvents();
  }

  initState() {
    const state = {};
    this.columns.forEach((col) => (state[col] = []));
    return state;
  }

  render() {
    this.container.innerHTML = "";
    this.columns.forEach((colName) => {
      const col = document.createElement("div");
      col.className = "column";
      col.dataset.name = colName;

      const title = document.createElement("h3");
      title.textContent = colName;

      const cardsContainer = document.createElement("div");
      cardsContainer.className = "cards-container";

      this.state[colName].forEach((cardData) => {
        const card = new Card(cardData.text, cardData.id);
        cardsContainer.append(card.element);
      });

      const addBtn = document.createElement("button");
      addBtn.className = "add-card";
      addBtn.textContent = "Add another card";

      col.append(title, cardsContainer, addBtn);
      this.container.append(col);
    });
  }

  addEventListeners() {
    this.container.addEventListener("click", (e) => {
      if (!e.target.classList.contains("add-card")) return;

      const col = e.target.closest(".column");
      if (col.querySelector(".new-card-wrapper")) return;

      e.target.style.display = "none";

      const inputWrapper = document.createElement("div");
      inputWrapper.className = "new-card-wrapper";

      inputWrapper.innerHTML = `
        <input type="text" class="new-card-input" placeholder="Enter card text" />
        <div class="new-card-buttons">
          <button class="save-card">Add card</button>
          <button class="cancel-card">Cancel</button>
        </div>
      `;

      col.append(inputWrapper);
      const input = inputWrapper.querySelector(".new-card-input");
      input.focus();

      const saveBtn = inputWrapper.querySelector(".save-card");
      const cancelBtn = inputWrapper.querySelector(".cancel-card");

      const removeWrapper = () => {
        inputWrapper.remove();
        e.target.style.display = "block";
      };

      saveBtn.addEventListener("click", () => {
        const text = input.value.trim();
        if (text) {
          const card = new Card(text);
          col.querySelector(".cards-container").append(card.element);
          this.saveState();
        }
        removeWrapper();
      });

      cancelBtn.addEventListener("click", removeWrapper);

      input.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter") saveBtn.click();
        if (evt.key === "Escape") removeWrapper();
      });
    });

    document.addEventListener("card-deleted", () => this.saveState());
  }

  saveState() {
    this.state = {};
    this.columns.forEach((colName) => {
      const cards = Array.from(
        this.container.querySelectorAll(`.column[data-name="${colName}"] .cards-container .card`)
      );
      this.state[colName] = cards.map((card) => ({
        text: card.querySelector(".card-text").textContent,
        id: card.dataset.id,
      }));
    });
    localStorage.setItem("boardState", JSON.stringify(this.state));
  }

  addDnDEvents() {
    let draggedCard = null;
    let placeholder = null;

    this.container.addEventListener("dragstart", (e) => {
      if (!e.target.classList.contains("card")) return;
      draggedCard = e.target;
      placeholder = document.createElement("div");
      placeholder.className = "card placeholder";
      e.dataTransfer.effectAllowed = "move";
      e.target.classList.add("dragging");
    });

    this.container.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!draggedCard) return;

      const container = e.target.closest(".cards-container") || 
                        (e.target.classList.contains("column") ? e.target.querySelector(".cards-container") : null);
      if (!container) return;

      const targetCard = e.target.closest(".card:not(.dragging)");
      if (!container.contains(placeholder)) container.appendChild(placeholder);

      if (!targetCard) {
        container.appendChild(placeholder);
      } else {
        const rect = targetCard.getBoundingClientRect();
        const after = e.clientY > rect.top + rect.height / 2;
        container.insertBefore(placeholder, after ? targetCard.nextSibling : targetCard);
      }
    });

    this.container.addEventListener("drop", () => {
      if (!draggedCard || !placeholder) return;
      placeholder.replaceWith(draggedCard);
      draggedCard.classList.remove("dragging");
      draggedCard = null;
      placeholder = null;
      this.saveState();
    });

    this.container.addEventListener("dragend", () => {
      if (draggedCard) {
        draggedCard.classList.remove("dragging");
        if (placeholder && placeholder.parentNode) placeholder.remove();
        draggedCard = null;
        placeholder = null;
        this.saveState();
      }
    });
  }
}
