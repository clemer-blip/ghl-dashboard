import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from datetime import datetime, timezone
from typing import Iterator

GHL_BASE = "https://services.leadconnectorhq.com"
PAGE_SIZE = 20  # GHL max per page for /conversations/search


class GHLRateLimitError(Exception):
    pass


class GHLClient:
    def __init__(self, api_key: str, location_id: str):
        self.location_id = location_id
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Version": "2021-04-15",  # required by GHL
        }

    @retry(
        retry=retry_if_exception_type(GHLRateLimitError),
        wait=wait_exponential(multiplier=1, min=2, max=60),
        stop=stop_after_attempt(6),
    )
    def _get(self, path: str, params: dict = None) -> dict:
        with httpx.Client(timeout=30) as client:
            resp = client.get(
                f"{GHL_BASE}{path}",
                headers=self.headers,
                params=params or {},
            )
        if resp.status_code == 429:
            raise GHLRateLimitError("Rate limited")
        resp.raise_for_status()
        return resp.json()

    def iter_conversations(
        self, start_after_date: datetime | None = None
    ) -> Iterator[dict]:
        """
        Yields all conversations using cursor-based pagination.
        Uses ascending sort by last_message_date so startAfterDate
        always moves the window forward.
        """
        params = {
            "locationId": self.location_id,
            "limit": PAGE_SIZE,
            "sort": "asc",
            "sortBy": "last_message_date",
        }
        if start_after_date:
            params["startAfterDate"] = int(start_after_date.timestamp() * 1000)

        while True:
            data = self._get("/conversations/search", params)
            conversations = data.get("conversations", [])
            if not conversations:
                break

            yield from conversations

            if len(conversations) < PAGE_SIZE:
                break

            # Use last item as next cursor (+ lastId tiebreaker)
            last = conversations[-1]
            params["startAfterDate"] = last.get("lastMessageDate", 0)
            params["lastId"] = last.get("id")

    def get_messages(self, conversation_id: str) -> list[dict]:
        """Fetches all messages for a conversation, handling pagination."""
        all_messages = []
        params: dict = {"limit": 100}

        while True:
            data = self._get(f"/conversations/{conversation_id}/messages", params)
            messages = data.get("messages", {}).get("messages", [])
            all_messages.extend(messages)

            if not data.get("messages", {}).get("nextPage"):
                break

            if messages:
                params["lastMessageId"] = messages[-1]["id"]
            else:
                break

        return all_messages
