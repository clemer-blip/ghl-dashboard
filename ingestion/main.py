import os
import traceback
from datetime import datetime, timezone
from dotenv import load_dotenv

from ghl_client import GHLClient
from supabase_writer import SupabaseWriter

load_dotenv()


def run_sync():
    location_id = os.environ["GHL_LOCATION_ID"]

    ghl = GHLClient(
        api_key=os.environ["GHL_API_KEY"],
        location_id=location_id,
    )
    writer = SupabaseWriter(
        url=os.environ["SUPABASE_URL"],
        service_key=os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )

    cursor = writer.get_cursor(location_id)
    print(f"[sync] Starting | location={location_id} | cursor={cursor}")

    conv_count = 0
    msg_count = 0
    last_seen_at = cursor

    for conv in ghl.iter_conversations(start_after_date=cursor):
        messages = ghl.get_messages(conv["id"])

        writer.upsert_conversation(conv, messages)
        written = writer.upsert_messages(conv["id"], location_id, messages)

        conv_count += 1
        msg_count += written

        conv_ts = conv.get("lastMessageDate")
        if conv_ts:
            conv_dt = datetime.fromtimestamp(conv_ts / 1000, tz=timezone.utc)
            if last_seen_at is None or conv_dt > last_seen_at:
                last_seen_at = conv_dt

        if conv_count % 10 == 0:
            print(f"[sync] Progress | conversations={conv_count} | messages={msg_count}")

        # Save cursor every 100 conversations so we can resume on timeout
        if conv_count % 100 == 0 and last_seen_at and last_seen_at != cursor:
            writer.save_cursor(location_id, last_seen_at, conv_count, msg_count)
            print(f"[sync] Cursor saved at {last_seen_at}")

    if last_seen_at and last_seen_at != cursor:
        writer.save_cursor(location_id, last_seen_at, conv_count, msg_count)

    print(f"[sync] Done | conversations={conv_count} | messages={msg_count}")


if __name__ == "__main__":
    try:
        run_sync()
    except Exception as e:
        print(f"[sync] ERROR: {e}")
        traceback.print_exc()

        # Persist the error so it's visible in the dashboard
        location_id = os.environ.get("GHL_LOCATION_ID", "unknown")
        try:
            writer = SupabaseWriter(
                url=os.environ["SUPABASE_URL"],
                service_key=os.environ["SUPABASE_SERVICE_ROLE_KEY"],
            )
            writer.save_error(location_id, str(e))
        except Exception:
            pass

        raise SystemExit(1)
