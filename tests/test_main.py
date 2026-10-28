import pytest

from app.main import app, tasks


@pytest.fixture
def client():
    app.config["TESTING"] = True

    original_tasks = [task.copy() for task in tasks]
    original_next_id = __import__("app.main", fromlist=["next_id"]).next_id

    with app.test_client() as test_client:
        yield test_client

    tasks.clear()
    tasks.extend(original_tasks)

    import app.main as main_module
    main_module.next_id = original_next_id


def test_home_page(client):
    response = client.get("/")

    assert response.status_code == 200
    assert b"Panel de tareas" in response.data


def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json == {"status": "ok"}


def test_list_tasks(client):
    response = client.get("/api/tasks")

    assert response.status_code == 200
    assert len(response.json) == 3


def test_create_task(client):
    response = client.post(
        "/api/tasks",
        json={
            "title": "Probar CI/CD",
            "description": "Crear pipeline automatizado",
            "priority": "high",
        },
    )

    assert response.status_code == 201
    assert response.json["title"] == "Probar CI/CD"
    assert response.json["status"] == "pending"


def test_create_task_requires_title(client):
    response = client.post("/api/tasks", json={"title": "  "})

    assert response.status_code == 400


def test_update_task_status(client):
    response = client.patch(
        "/api/tasks/1",
        json={"status": "completed"},
    )

    assert response.status_code == 200
    assert response.json["status"] == "completed"


def test_update_task_rejects_invalid_status(client):
    response = client.patch(
        "/api/tasks/1",
        json={"status": "unknown"},
    )

    assert response.status_code == 400


def test_delete_task(client):
    response = client.delete("/api/tasks/1")

    assert response.status_code == 200
    assert len(client.get("/api/tasks").json) == 2


def test_delete_missing_task(client):
    response = client.delete("/api/tasks/9999")

    assert response.status_code == 404
