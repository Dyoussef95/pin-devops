from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

tasks = [
    {
        "id": 1,
        "title": "Preparar entorno de desarrollo",
        "description": "Instalar y verificar las herramientas necesarias",
        "status": "completed",
        "priority": "high",
    },
    {
        "id": 2,
        "title": "Configurar pipeline CI/CD",
        "description": "Automatizar pruebas y construcción de la aplicación",
        "status": "in_progress",
        "priority": "high",
    },
    {
        "id": 3,
        "title": "Configurar monitoreo",
        "description": "Integrar Prometheus y Grafana",
        "status": "pending",
        "priority": "medium",
    },
]

next_id = 4


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/tasks")
def list_tasks():
    return jsonify(tasks)


@app.post("/api/tasks")
def create_task():
    global next_id

    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    priority = data.get("priority", "medium")

    if not title:
        return jsonify({"error": "El título es obligatorio"}), 400

    if priority not in ("low", "medium", "high"):
        return jsonify({"error": "Prioridad inválida"}), 400

    task = {
        "id": next_id,
        "title": title[:120],
        "description": description[:500],
        "status": "pending",
        "priority": priority,
    }

    next_id += 1
    tasks.append(task)

    return jsonify(task), 201


@app.patch("/api/tasks/<int:task_id>")
def update_task(task_id):
    data = request.get_json(silent=True) or {}
    task = next((item for item in tasks if item["id"] == task_id), None)

    if task is None:
        return jsonify({"error": "Tarea no encontrada"}), 404

    if "status" in data:
        if data["status"] not in ("pending", "in_progress", "completed"):
            return jsonify({"error": "Estado inválido"}), 400
        task["status"] = data["status"]

    return jsonify(task)


@app.delete("/api/tasks/<int:task_id>")
def delete_task(task_id):
    task = next((item for item in tasks if item["id"] == task_id), None)

    if task is None:
        return jsonify({"error": "Tarea no encontrada"}), 404

    tasks.remove(task)
    return jsonify({"message": "Tarea eliminada"})


@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
