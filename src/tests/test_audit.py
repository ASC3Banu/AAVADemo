from src.resources.audit import log_action, retrieve_logs

def test_log_and_retrieve():
    log_action("demo", "test-action", {"ssn": "123-45-6789"})
    logs = retrieve_logs("demo")
    assert len(logs) > 0
    assert logs[-1]["action"] == "test-action"
    assert logs[-1]["details"]["ssn"] == "***"
