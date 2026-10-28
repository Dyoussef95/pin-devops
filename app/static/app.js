const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search");
const filterSelect = document.querySelector("#filter");
const modal = document.querySelector("#task-modal");
const form = document.querySelector("#task-form");
const formError = document.querySelector("#form-error");

const labels = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completada",
  high: "Alta",
  medium: "Media",
  low: "Baja"
};

let tasks = [];

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "No se pudo completar la operación");
  }

  return data;
}

function makePill(text, className) {
  const pill = document.createElement("span");
  pill.className = `pill ${className}`;
  pill.textContent = text;
  return pill;
}

function renderStats() {
  document.querySelector("#total-count").textContent = tasks.length;
  document.querySelector("#pending-count").textContent =
    tasks.filter(task => task.status === "pending").length;
  document.querySelector("#progress-count").textContent =
    tasks.filter(task => task.status === "in_progress").length;
  document.querySelector("#completed-count").textContent =
    tasks.filter(task => task.status === "completed").length;
  document.querySelector("#task-total").textContent =
    `${tasks.length} ${tasks.length === 1 ? "tarea" : "tareas"}`;
}

function renderTasks() {
  const query = searchInput.value.trim().toLocaleLowerCase("es");
  const status = filterSelect.value;

  const filtered = tasks.filter(task => {
    const matchesQuery =
      `${task.title} ${task.description}`.toLocaleLowerCase("es").includes(query);
    return matchesQuery && (status === "all" || task.status === status);
  });

  taskList.replaceChildren();
  emptyState.hidden = filtered.length > 0;

  for (const task of filtered) {
    const row = document.createElement("article");
    row.className = "task-row";

    const content = document.createElement("div");
    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;

    const description = document.createElement("div");
    description.className = "task-description";
    description.textContent = task.description || "Sin descripción";

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.append(
      makePill(labels[task.status], `status-${task.status}`),
      makePill(`Prioridad ${labels[task.priority].toLowerCase()}`,
        `priority-${task.priority}`)
    );

    content.append(title, description, meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const statusControl = document.createElement("select");
    statusControl.setAttribute("aria-label", `Estado de ${task.title}`);

    for (const value of ["pending", "in_progress", "completed"]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = labels[value];
      option.selected = task.status === value;
      statusControl.append(option);
    }

    statusControl.addEventListener("change", async () => {
      try {
        await api(`/api/tasks/${task.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: statusControl.value })
        });
        await loadTasks();
      } catch (error) {
        alert(error.message);
        renderTasks();
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Eliminar ${task.title}`);

    deleteButton.addEventListener("click", async () => {
      if (!confirm(`¿Querés eliminar "${task.title}"?`)) return;

      try {
        await api(`/api/tasks/${task.id}`, { method: "DELETE" });
        await loadTasks();
      } catch (error) {
        alert(error.message);
      }
    });

    actions.append(statusControl, deleteButton);
    row.append(content, actions);
    taskList.append(row);
  }

  renderStats();
}

async function loadTasks() {
  try {
    tasks = await api("/api/tasks");
    renderTasks();
  } catch (error) {
    taskList.textContent = `No se pudieron cargar las tareas: ${error.message}`;
  }
}

document.querySelector("#open-modal").addEventListener("click", () => {
  form.reset();
  formError.textContent = "";
  modal.showModal();
  document.querySelector("#title").focus();
});

function closeModal() {
  modal.close();
}

document.querySelector("#close-modal").addEventListener("click", closeModal);
document.querySelector("#cancel-modal").addEventListener("click", closeModal);

form.addEventListener("submit", async event => {
  event.preventDefault();
  formError.textContent = "";

  const payload = {
    title: form.elements.title.value.trim(),
    description: form.elements.description.value.trim(),
    priority: form.elements.priority.value
  };

  try {
    await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    closeModal();
    form.reset();
    await loadTasks();
  } catch (error) {
    formError.textContent = error.message;
  }
});

searchInput.addEventListener("input", renderTasks);
filterSelect.addEventListener("change", renderTasks);

loadTasks();
