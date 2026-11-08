from app.doctor import _gemini_fix, _is_access_error

OUT_OF_CREDITS = "Gemini embedding request failed: 402 RESOURCE_EXHAUSTED. prepayment credits are depleted"


def test_out_of_credit_ai_studio_key_points_at_the_service_account_key() -> None:
    fix = _gemini_fix(OUT_OF_CREDITS, "AI Studio key")
    assert "out of credits" in fix
    assert "gcp-key.json" in fix
    assert "gcloud" not in fix


def test_service_account_failure_does_not_suggest_a_personal_login() -> None:
    fix = _gemini_fix(
        "403 PERMISSION_DENIED", "Vertex AI, project stuffaroo, service-account key"
    )
    assert "gcloud" not in fix
    assert "gcp-key.json" in fix


def test_personal_login_failure_suggests_gcloud() -> None:
    fix = _gemini_fix(
        "403 PERMISSION_DENIED", "Vertex AI, project stuffaroo, your Google login"
    )
    assert "gcloud auth application-default login" in fix


def test_access_errors_are_told_apart_from_model_config_errors() -> None:
    assert _is_access_error(OUT_OF_CREDITS)
    assert not _is_access_error(
        "404 NOT_FOUND model gemini-x not found in location us-central1"
    )
