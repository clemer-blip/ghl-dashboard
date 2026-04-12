import httpx
from datetime import date, timedelta
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

META_BASE = "https://graph.facebook.com/v21.0"

# Mapeamento conta de anúncio → location_id do GHL
ACCOUNT_LOCATION_MAP = {
    "act_302662054932190":  "uFiluYqG2MhvdLi1qRNj",  # Goiânia
    "act_1248379052810436": "NpYMLlXhYhsazq0i03ZV",  # São Paulo
}

# Apenas estas campanhas são rastreadas (filtro por nome exato)
TRACKED_CAMPAIGNS: dict[str, str] = {
    "act_302662054932190":  "Engajamento - WPP - 62 99153-6357",
    "act_1248379052810436": "Engajamento | 20.01",
}

INSIGHT_FIELDS = (
    "date_start,campaign_id,campaign_name,"
    "spend,impressions,reach,clicks,actions"
)

ACTION_KEYS = {
    "conversations_started": "onsite_conversion.messaging_conversation_started_7d",
    "messaging_replies":     "onsite_conversion.messaging_first_reply",
}


class MetaRateLimitError(Exception):
    pass


class MetaClient:
    def __init__(self, access_token: str):
        self.token = access_token

    @retry(
        retry=retry_if_exception_type(MetaRateLimitError),
        wait=wait_exponential(multiplier=2, min=5, max=120),
        stop=stop_after_attempt(5),
    )
    def _get(self, path: str, params: dict) -> dict:
        params["access_token"] = self.token
        with httpx.Client(timeout=30) as client:
            resp = client.get(f"{META_BASE}{path}", params=params)
        if resp.status_code == 429:
            raise MetaRateLimitError("Rate limited by Meta")
        resp.raise_for_status()
        return resp.json()

    def get_daily_insights(
        self,
        account_id: str,
        since: date,
        until: date,
    ) -> list[dict]:
        """Retorna insights diários por campanha para o período."""
        rows = []
        params = {
            "fields": INSIGHT_FIELDS,
            "level": "campaign",
            "time_increment": "1",
            "time_range": f'{{"since":"{since}","until":"{until}"}}',
            "limit": 500,
        }

        while True:
            data = self._get(f"/{account_id}/insights", params)
            rows.extend(data.get("data", []))

            paging = data.get("paging", {})
            next_url = paging.get("next")
            if not next_url:
                break

            # Extrai cursor para próxima página
            cursors = paging.get("cursors", {})
            if cursors.get("after"):
                params["after"] = cursors["after"]
            else:
                break

        return rows

    def parse_row(self, row: dict, account_id: str) -> dict:
        """Transforma um row da API em dict pronto para o Supabase."""
        actions = {
            a["action_type"]: int(float(a["value"]))
            for a in row.get("actions", [])
        }

        campaign_id = row["campaign_id"]
        row_date    = row["date_start"]
        location_id = ACCOUNT_LOCATION_MAP.get(account_id, account_id)

        return {
            "id":                    f"{account_id}_{campaign_id}_{row_date}",
            "account_id":            account_id,
            "campaign_id":           campaign_id,
            "campaign_name":         row.get("campaign_name"),
            "location_id":           location_id,
            "date":                  row_date,
            "spend":                 float(row.get("spend", 0)),
            "impressions":           int(row.get("impressions", 0)),
            "reach":                 int(row.get("reach", 0)),
            "clicks":                int(row.get("clicks", 0)),
            "conversations_started": actions.get(ACTION_KEYS["conversations_started"], 0),
            "messaging_replies":     actions.get(ACTION_KEYS["messaging_replies"], 0),
        }
