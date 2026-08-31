def create_sample_event(client):
    res = client.post(
        "/api/v1/events",
        json={
            "name": "Developer Meetup",
            "description": "Monthly developer meetup.",
            "date": "2026-09-20",
            "start_time": "18:00:00",
            "end_time": "20:00:00",
            "location": "Community Hub",
        },
    )
    return res.json()["id"]


def test_add_attendee(client):
    event_id = create_sample_event(client)
    res = client.post(
        f"/api/v1/events/{event_id}/attendees",
        json={
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "phone": "+1-555-0199",
            "organization": "Acme Corp",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Jane Doe"
    assert data["email"] == "jane.doe@example.com"
    assert data["event_id"] == event_id
    assert data["is_present"] is False


def test_prevent_duplicate_attendee_email(client):
    event_id = create_sample_event(client)
    client.post(
        f"/api/v1/events/{event_id}/attendees",
        json={
            "name": "Alex Smith",
            "email": "alex@example.com",
            "organization": "Tech Inc",
        },
    )
    # Attempting to add with the exact same email to the same event
    duplicate_res = client.post(
        f"/api/v1/events/{event_id}/attendees",
        json={
            "name": "Alex Smith Duplicate",
            "email": "alex@example.com",
            "organization": "Other Inc",
        },
    )
    assert duplicate_res.status_code == 400
    assert "already registered" in duplicate_res.json()["detail"]


def test_search_attendees(client):
    event_id = create_sample_event(client)
    client.post(
        f"/api/v1/events/{event_id}/attendees",
        json={"name": "Alice Wonderland", "email": "alice@story.com", "organization": "Fantasy Ltd"},
    )
    client.post(
        f"/api/v1/events/{event_id}/attendees",
        json={"name": "Bob Builder", "email": "bob@construction.com", "organization": "Build Co"},
    )

    # Search by name
    res = client.get(f"/api/v1/events/{event_id}/attendees?search=Alice")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["name"] == "Alice Wonderland"

    # Search by email
    res2 = client.get(f"/api/v1/events/{event_id}/attendees?search=construction.com")
    assert res2.status_code == 200
    assert len(res2.json()) == 1
    assert res2.json()[0]["name"] == "Bob Builder"
