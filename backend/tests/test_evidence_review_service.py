from backend.app.application.evidence_review_service import EvidenceReviewService
from backend.app.domain.evidence import is_releasable


class FakeReviewRepository:
    def __init__(self):
        self.reviews = []

    def list(self):
        return self.reviews

    def add(self, review):
        self.reviews.append(review)

    def replace(self, review):
        for index, current in enumerate(self.reviews):
            if current["id"] == review["id"]:
                self.reviews[index] = review
                return
        raise KeyError(review["id"])


def valid_submission():
    return {
        "source": {
            "id": "public-source-1",
            "title": "Открытая статья о ПАВ",
            "url": "https://example.test/article",
        },
        "formulation": {
            "name": "ПАВ-X + полимер",
            "surfactant_class": "анионный",
            "concentration_wt_pct": 0.4,
        },
        "conditions": {
            "temperature_c": 80,
            "salinity_g_l": 45,
            "rock_type": "карбонат",
            "permeability_md": 120,
        },
        "method": "Core flood после заводнения с химической оторочкой.",
        "result": {
            "label": "дополнительная нефтеотдача",
            "value": 9.2,
            "unit": "% OOIP",
        },
        "citation": {
            "location": "стр. 10, табл. 3",
            "excerpt": "При 80 °C дополнительная нефтеотдача составила 9,2 % OOIP.",
        },
    }


def test_submitted_experiment_is_hidden_until_a_reviewer_approves_it():
    service = EvidenceReviewService(FakeReviewRepository())

    submitted = service.submit(valid_submission())

    assert submitted["quality"]["release_status"] == "pending_review"
    assert submitted["review"]["status"] == "pending_review"
    assert submitted["source"]["public_source_id"] == "public-source-1"
    assert is_releasable(submitted) is False

    approved = service.approve(submitted["id"])

    assert approved["quality"]["release_status"] == "released"
    assert approved["quality"]["source_fragment_verified"] is True
    assert approved["review"]["status"] == "released"
    assert approved["review"]["approved_at"]
    assert is_releasable(approved) is True
