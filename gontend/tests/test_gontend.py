from django.shortcuts import resolve_url


def test_dashboard_renders(admin_client):
    resp = admin_client.get(resolve_url("dashboard"))
    assert resp.status_code == 200
    assert b"gontend.js" in resp.content
    assert b"id=\"root\"" in resp.content
