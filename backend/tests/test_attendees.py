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


def valid_attendee(**overrides):
    data = {
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "phone_number": "+1-555-0199",
        "section": "A",
        "semester": "3",
    }
    data.update(overrides)
    return data


def test_create_attendee_with_five_fields(client):
    event_id = create_sample_event(client)
    res = client.post(
        f"/api/v1/events/{event_id}/attendees",
        json=valid_attendee(),
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Jane Doe"
    assert data["email"] == "jane.doe@example.com"
    assert data["phone_number"] == "+1-555-0199"
    assert data["section"] == "A"
    assert data["semester"] == "3"
    assert data["event_id"] == event_id
    assert data["is_present"] is False
    assert "organization" not in data
    assert "phone" not in data


def test_create_attendee_missing_fields_returns_422(client):
    event_id = create_sample_event(client)

    missing_name = valid_attendee()
    missing_name.pop("name")
    assert client.post(f"/api/v1/events/{event_id}/attendees", json=missing_name).status_code == 422

    missing_email = valid_attendee()
    missing_email.pop("email")
    assert client.post(f"/api/v1/events/{event_id}/attendees", json=missing_email).status_code == 422

    missing_phone = valid_attendee()
    missing_phone.pop("phone_number")
    assert client.post(f"/api/v1/events/{event_id}/attendees", json=missing_phone).status_code == 422

    missing_section = valid_attendee()
    missing_section.pop("section")
    assert client.post(f"/api/v1/events/{event_id}/attendees", json=missing_section).status_code == 422

    missing_semester = valid_attendee()
    missing_semester.pop("semester")
    assert client.post(f"/api/v1/events/{event_id}/attendees", json=missing_semester).status_code == 422


def test_create_attendee_invalid_email_returns_422(client):
    event_id = create_sample_event(client)
    res = client.post(
        f"/api/v1/events/{event_id}/attendees",
        json=valid_attendee(email="not-an-email"),
    )
    assert res.status_code == 422


def test_create_attendee_empty_required_fields_returns_422(client):
    event_id = create_sample_event(client)
    for field in ("name", "phone_number", "section", "semester"):
        payload = valid_attendee(**{field: ""})
        assert client.post(f"/api/v1/events/{event_id}/attendees", json=payload).status_code == 422, field


def test_prevent_duplicate_attendee_email(client):
    event_id = create_sample_event(client)
    client.post(f"/api/v1/events/{event_id}/attendees", json=valid_attendee(email="alex@example.com"))
    duplicate_res = client.post(
        f"/api/v1/events/{event_id}/attendees",
        json=valid_attendee(name="Alex Smith Duplicate", email="alex@example.com"),
    )
    assert duplicate_res.status_code == 400
    assert "already registered" in duplicate_res.json()["detail"]


def test_same_email_allowed_in_different_events(client):
    event1 = create_sample_event(client)
    event2 = create_sample_event(client)
    assert client.post(
        f"/api/v1/events/{event1}/attendees",
        json=valid_attendee(email="alex@example.com"),
    ).status_code == 201
    assert client.post(
        f"/api/v1/events/{event2}/attendees",
        json=valid_attendee(email="alex@example.com"),
    ).status_code == 201


def test_update_attendee(client):
    event_id = create_sample_event(client)
    created = client.post(
        f"/api/v1/events/{event_id}/attendees",
        json=valid_attendee(),
    ).json()
    res = client.put(
        f"/api/v1/attendees/{created['id']}",
        json={
            "phone_number": "+1-555-0000",
            "section": "B",
            "semester": "4",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["phone_number"] == "+1-555-0000"
    assert data["section"] == "B"
    assert data["semester"] == "4"
    assert data["name"] == "Jane Doe"


def test_search_attendees_by_name_email_and_phone(client):
    event_id = create_sample_event(client)
    client.post(
        f"/api/v1/events/{event_id}/attendees",
        json=valid_attendee(name="Alice Wonderland", email="alice@story.com", phone_number="9811111111"),
    )
    client.post(
        f"/api/v1/events/{event_id}/attendees",
        json=valid_attendee(name="Bob Builder", email="bob@construction.com", phone_number="9722222222"),
    )

    res = client.get(f"/api/v1/events/{event_id}/attendees?search=Alice")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["name"] == "Alice Wonderland"

    res2 = client.get(f"/api/v1/events/{event_id}/attendees?search=construction.com")
    assert res2.status_code == 200
    assert len(res2.json()) == 1
    assert res2.json()[0]["name"] == "Bob Builder"

    res3 = client.get(f"/api/v1/events/{event_id}/attendees?search=981111")
    assert res3.status_code == 200
    assert len(res3.json()) == 1
    assert res3.json()[0]["name"] == "Alice Wonderland"


def test_section_filter_case_insensitive(client):
    event_id = create_sample_event(client)
    client.post(f"/api/v1/events/{event_id}/attendees", json=valid_attendee(name="One", section="a"))
    client.post(f"/api/v1/events/{event_id}/attendees", json=valid_attendee(name="Two", section="B"))
    client.post(f"/api/v1/events/{event_id}/attendees", json=valid_attendee(name="Three", section="C"))

    res = client.get(f"/api/v1/events/{event_id}/attendees?section=A")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["name"] == "One"


def test_semester_filter_exact(client):
    event_id = create_sample_event(client)
    client.post(f"/api/v1/events/{event_id}/attendees", json=valid_attendee(name="One", semester="3"))
    client.post(f"/api/v1/events/{event_id}/attendees", json=valid_attendee(name="Two", semester="4"))

    res = client.get(f"/api/v1/events/{event_id}/attendees?semester=3")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["name"] == "One"

    res2 = client.get(f"/api/v1/events/{event_id}/attendees?semester=5")
    assert res2.status_code == 200
    assert len(res2.json()) == 0


def test_combined_section_and_semester_filter(client):
    event_id = create_sample_event(client)
    client.post(f"/api/v1/events/{event_id}/attendees", json=valid_attendee(name="One", section="A", semester="3"))
    client.post(f"/api/v1/events/{event_id}/attendees", json=valid_attendee(name="Two", section="A", semester="4"))
    client.post(f"/api/v1/events/{event_id}/attendees", json=valid_attendee(name="Three", section="B", semester="3"))

    res = client.get(f"/api/v1/events/{event_id}/attendees?section=A&semester=3")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["name"] == "One"
