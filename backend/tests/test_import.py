import io

from openpyxl import Workbook


def make_spreadsheet(headers, rows):
    """Build an in-memory .xlsx file and return its bytes."""
    wb = Workbook()
    ws = wb.active
    ws.append(headers)
    for row in rows:
        ws.append(row)
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf.getvalue()


def upload_file(content, filename="registrations.xlsx"):
    return {"file": (filename, content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}


def create_event(client):
    res = client.post(
        "/api/v1/events",
        json={
            "name": "Import Event",
            "date": "2026-12-10",
            "start_time": "09:00:00",
            "end_time": "12:00:00",
            "location": "Campus Hall",
        },
    )
    return res.json()["id"]


GOOGLE_HEADERS = [
    "Timestamp",
    "Email Address",
    "Name",
    "Phone Number",
    "Section",
    "Semester",
    "Gender",
    "College ID",
    "Food Preference",
]


def test_preview_valid_google_forms_style(client):
    event_id = create_event(client)
    content = make_spreadsheet(
        GOOGLE_HEADERS,
        [
            ["2026-01-01", "ram@gmail.com", "Ram Sharma", "9811111111", "A", "3", "Male", "C1", "Veg"],
            ["2026-01-01", "sita@gmail.com", "Sita Thapa", "9722222222", "B", "4", "Female", "C2", "Non-veg"],
        ],
    )
    res = client.post(
        f"/api/v1/events/{event_id}/attendees/import/preview",
        files=upload_file(content),
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_rows"] == 2
    assert data["valid_count"] == 2
    assert data["invalid_count"] == 0
    assert data["ignored_column_count"] == 4  # Timestamp, Gender, College ID, Food Preference
    assert set(data["detected_columns"]) == {"name", "email", "phone_number", "section", "semester"}
    assert data["rows"][0]["name"] == "Ram Sharma"
    assert data["rows"][0]["email"] == "ram@gmail.com"
    assert data["rows"][0]["section"] == "A"
    assert data["rows"][0]["semester"] == "3"


def test_preview_ignores_extra_columns_and_only_five_fields(client):
    event_id = create_event(client)
    content = make_spreadsheet(
        ["Name", "Email", "Phone Number", "Section", "Semester", "Address", "Department"],
        [
            ["A", "a@x.com", "1", "A", "3", "addr", "CS"],
            ["B", "b@x.com", "2", "B", "4", "addr2", "EE"],
        ],
    )
    res = client.post(
        f"/api/v1/events/{event_id}/attendees/import/preview",
        files=upload_file(content),
    )
    assert res.status_code == 200
    data = res.json()
    assert data["ignored_column_count"] == 2
    assert data["valid_count"] == 2
    row = data["rows"][0]
    assert set(row.keys()) == {"row_number", "name", "email", "phone_number", "section", "semester", "errors"}


def test_missing_required_excel_column_fails_preview(client):
    event_id = create_event(client)
    content = make_spreadsheet(
        ["Name", "Email", "Phone Number", "Section"],
        [["A", "a@x.com", "1", "A"]],
    )
    res = client.post(
        f"/api/v1/events/{event_id}/attendees/import/preview",
        files=upload_file(content),
    )
    assert res.status_code == 400
    assert "Semester" in res.json()["detail"]


def test_case_insensitive_semester_column_detection(client):
    event_id = create_event(client)
    content = make_spreadsheet(
        ["Name", "email address", "Phone Number", "Section", " SEMESTER "],
        [["A", "a@x.com", "1", "A", "3"]],
    )
    res = client.post(
        f"/api/v1/events/{event_id}/attendees/import/preview",
        files=upload_file(content),
    )
    assert res.status_code == 200
    assert res.json()["valid_count"] == 1


def test_preview_reports_invalid_email_and_missing_value(client):
    event_id = create_event(client)
    content = make_spreadsheet(
        ["Name", "Email", "Phone Number", "Section", "Semester"],
        [
            ["Valid", "ok@x.com", "1", "A", "3"],
            ["Bad Email", "nope", "2", "A", "3"],
            ["Missing Phone", "p@x.com", "", "A", "3"],
        ],
    )
    res = client.post(
        f"/api/v1/events/{event_id}/attendees/import/preview",
        files=upload_file(content),
    )
    assert res.status_code == 200
    assert res.json()["valid_count"] == 1
    assert res.json()["invalid_count"] == 2
    errors_by_row = {r["row_number"]: (r["errors"] or []) for r in res.json()["rows"]}
    assert "Invalid email" in errors_by_row[3]
    assert "Missing phone number" in errors_by_row[4]


def test_duplicate_rows_inside_excel_detected(client):
    event_id = create_event(client)
    content = make_spreadsheet(
        ["Name", "Email", "Phone Number", "Section", "Semester"],
        [
            ["A", "a@x.com", "1", "A", "3"],
            ["A Again", "a@x.com", "9", "A", "3"],
            ["B", "b@x.com", "2", "B", "4"],
        ],
    )
    res = client.post(
        f"/api/v1/events/{event_id}/attendees/import/preview",
        files=upload_file(content),
    )
    assert res.status_code == 200
    data = res.json()
    assert data["valid_count"] == 2
    assert data["duplicate_count"] == 1
    assert data["rows"][1]["errors"] == ["Duplicate email in spreadsheet"]


def test_existing_participant_detected(client):
    event_id = create_event(client)
    client.post(
        f"/api/v1/events/{event_id}/attendees",
        json={"name": "Existing", "email": "a@x.com", "phone_number": "1", "section": "A", "semester": "3"},
    )
    content = make_spreadsheet(
        ["Name", "Email", "Phone Number", "Section", "Semester"],
        [["A", "a@x.com", "1", "A", "3"]],
    )
    res = client.post(
        f"/api/v1/events/{event_id}/attendees/import/preview",
        files=upload_file(content),
    )
    assert res.status_code == 200
    data = res.json()
    assert data["existing_count"] == 1
    assert data["rows"][0]["errors"] == ["Email already registered for this event"]


def test_successful_confirmed_import(client):
    event_id = create_event(client)
    content = make_spreadsheet(
        ["Name", "Email", "Phone Number", "Section", "Semester"],
        [["A", "a@x.com", "1", "A", "3"]],
    )
    res = client.post(
        f"/api/v1/events/{event_id}/attendees/import",
        files=upload_file(content),
    )
    assert res.status_code == 200
    data = res.json()
    assert data["imported"] == 1
    assert data["invalid_skipped"] == 0
    assert data["existing_skipped"] == 0

    listing = client.get(f"/api/v1/events/{event_id}/attendees").json()
    assert len(listing) == 1
    assert listing[0]["name"] == "A"
    assert listing[0]["section"] == "A"
    assert listing[0]["semester"] == "3"
    assert "organization" not in listing[0]


def test_confirmed_import_skips_invalid_and_existing(client):
    event_id = create_event(client)
    client.post(
        f"/api/v1/events/{event_id}/attendees",
        json={"name": "Existing", "email": "existing@x.com", "phone_number": "1", "section": "A", "semester": "3"},
    )
    content = make_spreadsheet(
        ["Name", "Email", "Phone Number", "Section", "Semester"],
        [
            ["New", "new@x.com", "1", "A", "3"],
            ["Bad", "bad-email", "2", "A", "3"],
            ["Existing", "existing@x.com", "3", "A", "3"],
            ["Again", "new@x.com", "4", "A", "3"],
        ],
    )
    res = client.post(
        f"/api/v1/events/{event_id}/attendees/import",
        files=upload_file(content),
    )
    assert res.status_code == 200
    data = res.json()
    assert data["imported"] == 1
    assert data["invalid_skipped"] == 1
    assert data["existing_skipped"] == 1
    assert data["duplicate_skipped"] == 1


def test_only_five_fields_reach_database(client):
    event_id = create_event(client)
    content = make_spreadsheet(
        ["Timestamp", "Name", "Email", "Phone Number", "Section", "Semester", "Secret Column"],
        [["t1", "A", "a@x.com", "1", "A", "3", "SHOULD_NOT_STORE"]],
    )
    res = client.post(
        f"/api/v1/events/{event_id}/attendees/import",
        files=upload_file(content),
    )
    assert res.status_code == 200
    listing = client.get(f"/api/v1/events/{event_id}/attendees").json()
    assert len(listing) == 1
    row = listing[0]
    assert set(row.keys()) == {
        "id", "event_id", "event_name", "name", "email", "phone_number",
        "section", "semester", "is_present",
    }
    assert row["phone_number"] == "1"
    assert row["section"] == "A"
    assert row["semester"] == "3"


def test_empty_spreadsheet(client):
    event_id = create_event(client)
    content = make_spreadsheet(["Name", "Email", "Phone Number", "Section", "Semester"], [])
    res = client.post(
        f"/api/v1/events/{event_id}/attendees/import/preview",
        files=upload_file(content),
    )
    assert res.status_code == 200
    assert res.json()["total_rows"] == 0


def test_unsupported_file_type(client):
    event_id = create_event(client)
    res = client.post(
        f"/api/v1/events/{event_id}/attendees/import/preview",
        files={"file": ("doc.txt", b"hello", "text/plain")},
    )
    assert res.status_code == 400
    assert "Unsupported file type" in res.json()["detail"]


def test_import_is_event_isolated(client):
    event1 = create_event(client)
    event2 = create_event(client)
    content = make_spreadsheet(
        ["Name", "Email", "Phone Number", "Section", "Semester"],
        [["A", "a@x.com", "1", "A", "3"]],
    )
    assert client.post(
        f"/api/v1/events/{event1}/attendees/import",
        files=upload_file(content),
    ).status_code == 200
    # Same email to a different event is allowed
    assert client.post(
        f"/api/v1/events/{event2}/attendees/import",
        files=upload_file(content),
    ).status_code == 200
    assert len(client.get(f"/api/v1/events/{event1}/attendees").json()) == 1
    assert len(client.get(f"/api/v1/events/{event2}/attendees").json()) == 1


def test_attendance_and_cascade_after_import(client):
    event_id = create_event(client)

    # Import one, then create another via the API and mark attendance.
    content = make_spreadsheet(
        ["Name", "Email", "Phone Number", "Section", "Semester"],
        [["Imported", "imp@x.com", "1", "A", "3"]],
    )
    client.post(f"/api/v1/events/{event_id}/attendees/import", files=upload_file(content))

    imp_id = client.get(f"/api/v1/events/{event_id}/attendees").json()[0]["id"]
    mark = client.put(
        f"/api/v1/events/{event_id}/attendees/{imp_id}/attendance",
        json={"is_present": True},
    )
    assert mark.status_code == 200
    assert mark.json()["is_present"] is True

    stats = client.get(f"/api/v1/events/{event_id}").json()
    assert stats["total_attendees"] == 1
    assert stats["present_count"] == 1

    # Event deletion cascades to the imported attendee and attendance records.
    assert client.delete(f"/api/v1/events/{event_id}").status_code == 204
    assert client.get(f"/api/v1/events/{event_id}").status_code == 404
    assert client.get(f"/api/v1/events/{event_id}/attendees").status_code == 200
    assert len(client.get(f"/api/v1/events/{event_id}/attendees").json()) == 0


def test_import_preview_on_missing_event_returns_404(client):
    content = make_spreadsheet(
        ["Name", "Email", "Phone Number", "Section", "Semester"],
        [["A", "a@x.com", "1", "A", "3"]],
    )
    res = client.post("/api/v1/events/999999/attendees/import/preview", files=upload_file(content))
    assert res.status_code == 404
