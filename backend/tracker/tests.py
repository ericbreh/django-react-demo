import json
import os
import tempfile
from unittest.mock import patch

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient


class ActionAPITests(TestCase):

    def setUp(self):
        # Create a temp file and patch DATA_FILE to point at it
        self.temp_file = tempfile.NamedTemporaryFile(delete=False)
        patcher = patch("tracker.file_utils.DATA_FILE", self.temp_file.name)
        patcher.start()
        self.addCleanup(patcher.stop)

        with open(self.temp_file.name, "w") as f:
            json.dump([], f)

        self.client = APIClient()

    def tearDown(self):
        os.unlink(self.temp_file.name)

    # ---------- helper ----------
    def _post(self, payload):
        return self.client.post("/api/actions/", payload, format="json")

    # ---------- tests -----------
    def test_create_action(self):
        resp = self._post(
            {"action": "Recycling", "date": "2025-01-08", "points": 25}
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["id"], 1)
        self.assertEqual(resp.data["points"], 25)

    def test_list_actions(self):
        self._post({"action": "Ride bike", "date": "2025-01-09", "points": 15})
        resp = self.client.get("/api/actions/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_retrieve_action(self):
        self._post({"action": "Ride bike", "date": "2025-01-09", "points": 15})
        resp = self.client.get("/api/actions/1/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["action"], "Ride bike")

    def test_update_action(self):
        self._post({"action": "Ride bike", "date": "2025-01-09", "points": 15})
        resp = self.client.patch(
            "/api/actions/1/", {"points": 20}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["points"], 20)

    def test_delete_action(self):
        self._post({"action": "Ride bike", "date": "2025-01-09", "points": 15})
        del_resp = self.client.delete("/api/actions/1/")
        self.assertEqual(del_resp.status_code, status.HTTP_204_NO_CONTENT)
        list_resp = self.client.get("/api/actions/")
        self.assertEqual(list_resp.data, [])

    def test_validation_error(self):
        resp = self._post({"date": "2025-01-09", "points": 10})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("action", resp.data)
