def test_mark_attendance_and_stats(client):
    # 1. Create event
    event_res = client.post(
        "/api/v1/events",
        json={
            "name": "Quarterly All-Hands",
            "description": "Company wide quarterly review.",
            "date": "2026-10-15",
            "start_time": "10:00:00",
            "end_time": "12:00:00",
            "location": "Auditorium & Live Stream",
        },
    )
    event_id = event_res.json()["id"]

    # 2. Add 2 attendees
    att1_res = client.post(
        f"/api/v1/events/{event_id}/attendees",
        json={"name": "Attendee One", "email": "one@company.com"},
    )
    att1_id = att1_res.json()["id"]

    att2_res = client.post(
        f"/api/v1/events/{event_id}/attendees",
        json={"name": "Attendee Two", "email": "two@company.com"},
    )
    att2_id = att2_res.json()["id"]

    # 3. Mark Attendee One as present
    mark_res = client.put(
        f"/api/v1/events/{event_id}/attendees/{att1_id}/attendance",
        json={"is_present": True},
    )
    assert mark_res.status_code == 200
    assert mark_res.json()["is_present"] is True

    # 4. Check Event Statistics
    event_stats = client.get(f"/api/v1/events/{event_id}").json()
    assert event_stats["total_attendees"] == 2
    assert event_stats["present_count"] == 1
    assert event_stats["absent_count"] == 1
    assert event_stats["attendance_rate"] == 50.0

    # 5. Check Dashboard Overview
    overview = client.get("/api/v1/dashboard/overview").json()
    assert overview["total_attendees"] >= 2
    assert overview["total_present"] >= 1
