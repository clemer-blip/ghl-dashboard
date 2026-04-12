from supabase import create_client, Client
from datetime import datetime, timezone


def _compute_first_response_seconds(messages: list[dict]) -> int | None:
    """
    Returns seconds between the first inbound message and the first
    outbound reply that comes after it. Returns None if no valid pair.
    """
    def to_int(v):
        try:
            return int(v)
        except (TypeError, ValueError):
            return 0

    sorted_msgs = sorted(messages, key=lambda m: to_int(m.get("dateAdded", 0)))

    first_inbound_ts = None
    for m in sorted_msgs:
        direction = (m.get("direction") or "").lower()
        ts = to_int(m.get("dateAdded", 0))
        if direction == "inbound" and first_inbound_ts is None:
            first_inbound_ts = ts
        elif direction == "outbound" and first_inbound_ts is not None:
            if ts > first_inbound_ts:
                return int((ts - first_inbound_ts) / 1000)

    return None


def _ms_to_iso(ms_timestamp) -> str | None:
    if not ms_timestamp:
        return None
    try:
        return datetime.fromtimestamp(int(ms_timestamp) / 1000, tz=timezone.utc).isoformat()
    except (ValueError, OSError):
        # Already an ISO string
        return str(ms_timestamp)


class SupabaseWriter:
    def __init__(self, url: str, service_key: str):
        # Service role key — bypasses RLS for writes
        self.client: Client = create_client(url, service_key)

    def upsert_conversation(self, ghl_conv: dict, messages: list[dict]) -> None:
        first_response = _compute_first_response_seconds(messages)

        # Resolve status from different GHL response shapes
        status = ghl_conv.get("status")
        if not status and isinstance(ghl_conv.get("inbox"), dict):
            status = ghl_conv["inbox"].get("status")

        # Tags podem vir na conversa diretamente ou dentro do objeto contact
        raw_tags = ghl_conv.get("tags") or ghl_conv.get("contact", {}).get("tags") or []
        tags = [t for t in raw_tags if isinstance(t, str) and t.strip()]

        row = {
            "id": ghl_conv["id"],
            "location_id": ghl_conv.get("locationId"),
            "contact_id": ghl_conv.get("contactId"),
            "contact_name": ghl_conv.get("fullName") or ghl_conv.get("contactName"),
            "contact_email": ghl_conv.get("email"),
            "contact_phone": ghl_conv.get("phone"),
            "channel": ghl_conv.get("type"),
            "status": status,
            "last_message_at": _ms_to_iso(ghl_conv.get("lastMessageDate")),
            "first_response_seconds": first_response,
            "tags": tags,
            "raw": ghl_conv,
        }

        self.client.table("conversations").upsert(row, on_conflict="id").execute()

    def upsert_messages(
        self, conversation_id: str, location_id: str, messages: list[dict]
    ) -> int:
        if not messages:
            return 0

        rows = [
            {
                "id": m["id"],
                "conversation_id": conversation_id,
                "location_id": location_id,
                "direction": (m.get("direction") or "").lower(),
                "message_type": m.get("messageType") or m.get("type"),
                "body": m.get("body"),
                "sent_at": _ms_to_iso(m.get("dateAdded")),
                "user_id": m.get("userId"),
                "source": m.get("source"),  # 'workflow' = bot, None = humano
                "raw": m,
            }
            for m in messages
        ]

        self.client.table("messages").upsert(rows, on_conflict="id").execute()
        return len(rows)

    def get_cursor(self, location_id: str) -> datetime | None:
        try:
            result = (
                self.client.table("ingestion_state")
                .select("last_synced_at")
                .eq("location_id", location_id)
                .execute()
            )
            if result and result.data:
                raw = result.data[0].get("last_synced_at")
                if raw:
                    return datetime.fromisoformat(raw.replace("Z", "+00:00"))
        except Exception:
            pass
        return None

    def save_cursor(
        self,
        location_id: str,
        last_synced_at: datetime,
        convs: int,
        msgs: int,
    ) -> None:
        self.client.table("ingestion_state").upsert(
            {
                "location_id": location_id,
                "last_synced_at": last_synced_at.isoformat(),
                "last_run_at": datetime.now(timezone.utc).isoformat(),
                "conversations_synced": convs,
                "messages_synced": msgs,
            },
            on_conflict="location_id",
        ).execute()

    def save_error(self, location_id: str, error: str) -> None:
        self.client.table("ingestion_state").upsert(
            {
                "location_id": location_id,
                "last_run_at": datetime.now(timezone.utc).isoformat(),
                "last_error": error,
            },
            on_conflict="location_id",
        ).execute()
