def test_create_event(client):
    response = client.post(
        "/api/v1/events",
        json={
            "name": "Tech Innovators Summit 2026",
            "description": "Annual gathering of tech pioneers.",
            "date": "2026-09-15",
            "start_time": "09:00:00",
            "end_time": "17:00:00",
            "location": "Moscone Center, San Francisco",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Tech Innovators Summit 2026"
    assert data["id"] is not None
    assert data["total_attendees"] == 0


def test_get_events(client):
    # Create an event first
    client.post(
        "/api/v1/events",
        json={
            "name": "Design Systems Workshop",
            "description": "Deep dive into scalable UI tokens.",
            "date": "2026-10-01",
            "start_time": "10:00:00",
            "end_time": "12:00:00",
            "location": "Design Lab 4B",
        },
    )
    response = client.get("/api/v1/events")
    assert response.status_code == 200
    events = response.json()
    assert len(events) >= 1


def test_get_event_by_id(client):
    create_res = client.post(
        "/api/v1/events",
        json={
            "name": "AI Architecture Keynote",
            "description": "Next generation generative models.",
            "date": "2026-11-20",
            "start_time": "14:00:00",
            "end_time": "16:00:00",
            "location": "Main Auditorium",
        },
    )
    event_id = create_res.json()["id"]

    response = client.get(f"/api/v1/events/{event_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "AI Architecture Keynote"


def test_update_event(client):
    create_res = client.post(
        "/api/v1/events",
        json={
            "name": "Draft Event",
            "description": "Draft",
            "date": "2026-12-01",
            "start_time": "13:00:00",
            "end_time": "14:00:00",
            "location": "Room 101",
        },
    )
    event_id = create_res.json()["id"]

    update_res = client.put(
        f"/api/v1/events/{event_id}",
        json={"name": "Finalized Event Title", "location": "Grand Hall"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Finalized Event Title"
    assert update_res.json()["location"] == "Grand Hall"


def test_delete_event(client):
    create_res = client.post(
        "/api/v1/events",
        json={
            "name": "Temporary Event",
            "description": "To be deleted",
            "date": "2026-12-05",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
            "location": "Virtual",
        },
    )
    event_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/events/{event_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/v1/events/{event_id}")
    assert get_res.status_code == 404
