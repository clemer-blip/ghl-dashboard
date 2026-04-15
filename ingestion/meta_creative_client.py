"""
Client para buscar insights no nível de ad (criativo) + thumbnails.
Separado do meta_client.py (que opera no nível de campanha).
"""

import httpx
from datetime import date
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from meta_client import MetaRateLimitError, ACCOUNT_LOCATION_MAP, META_BASE

# Campos base (sempre disponíveis)
FIELDS_BASE = (
    "ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,"
    "spend,impressions,reach,inline_link_clicks"
)

# Campos extras de vídeo (só disponíveis em campanhas de vídeo)
FIELDS_VIDEO = "video_3_sec_watched_actions,video_p75_watched_actions"

CREATIVE_INSIGHT_FIELDS        = f"{FIELDS_BASE},{FIELDS_VIDEO}"
CREATIVE_INSIGHT_FIELDS_NOVIDEO = FIELDS_BASE


def _sum_actions(action_list: list | None) -> int:
    """Soma todos os valores de uma lista de actions do Meta."""
    if not action_list:
        return 0
    return sum(int(float(item.get("value", 0))) for item in action_list)


class MetaCreativeClient:
    def __init__(self, access_token: str):
        self.token = access_token

    @retry(
        retry=retry_if_exception_type(MetaRateLimitError),
        wait=wait_exponential(multiplier=2, min=5, max=120),
        stop=stop_after_attempt(5),
    )
    def _get(self, path: str, params: dict) -> dict:
        params = {**params, "access_token": self.token}
        with httpx.Client(timeout=30) as client:
            resp = client.get(f"{META_BASE}{path}", params=params)
        if resp.status_code == 429:
            raise MetaRateLimitError("Rate limited by Meta")
        resp.raise_for_status()
        return resp.json()

    def _paginate(self, path: str, params: dict) -> list[dict]:
        """Pagina todos os resultados de um endpoint."""
        rows = []
        while True:
            data = self._get(path, params)
            rows.extend(data.get("data", []))
            paging = data.get("paging", {})
            if not paging.get("next"):
                break
            cursors = paging.get("cursors", {})
            if cursors.get("after"):
                params["after"] = cursors["after"]
            else:
                break
        return rows

    def get_ad_insights(self, account_id: str, since: date, until: date) -> list[dict]:
        """Retorna insights diários no nível de ad.
        Tenta primeiro com métricas de vídeo; se a conta não suportar (400),
        retorna sem os campos de vídeo (campos zerados)."""
        base_params = {
            "level": "ad",
            "time_increment": "1",
            "time_range": f'{{"since":"{since}","until":"{until}"}}',
            "limit": 500,
        }
        # Tentativa com campos de vídeo
        try:
            rows = self._paginate(
                f"/{account_id}/insights",
                {**base_params, "fields": CREATIVE_INSIGHT_FIELDS},
            )
            return rows
        except Exception as e:
            if "400" in str(e):
                print(f"  [INFO] campos de vídeo não disponíveis para {account_id}, usando campos base.")
                return self._paginate(
                    f"/{account_id}/insights",
                    {**base_params, "fields": CREATIVE_INSIGHT_FIELDS_NOVIDEO},
                )
            raise

    def get_ad_thumbnail(self, ad_id: str) -> str | None:
        """Busca a URL da thumbnail do criativo de um ad."""
        try:
            data = self._get(
                f"/{ad_id}",
                {"fields": "creative{thumbnail_url,image_url}"},
            )
            creative = data.get("creative", {})
            return creative.get("thumbnail_url") or creative.get("image_url")
        except Exception as e:
            print(f"  [WARN] thumbnail não encontrado para ad {ad_id}: {e}")
            return None

    def parse_insight_row(self, row: dict, account_id: str) -> dict:
        """Converte um row de insight em dict pronto para o Supabase."""
        ad_id    = row["ad_id"]
        row_date = row["date_start"]
        location_id = ACCOUNT_LOCATION_MAP.get(account_id, account_id)

        return {
            "id":                 f"{account_id}_{ad_id}_{row_date}",
            "account_id":         account_id,
            "ad_id":              ad_id,
            "location_id":        location_id,
            "date":               row_date,
            "spend":              float(row.get("spend", 0)),
            "impressions":        int(row.get("impressions", 0)),
            "reach":              int(row.get("reach", 0)),
            "inline_link_clicks": int(row.get("inline_link_clicks", 0)),
            "video_3sec_watched": _sum_actions(row.get("video_3_sec_watched_actions")),
            "video_p75_watched":  _sum_actions(row.get("video_p75_watched_actions")),
        }

    def parse_creative_row(
        self, row: dict, account_id: str, thumbnail_url: str | None
    ) -> dict:
        """Converte um row de insight em dict de criativo (catálogo)."""
        return {
            "ad_id":        row["ad_id"],
            "ad_name":      row.get("ad_name"),
            "account_id":   account_id,
            "campaign_id":  row.get("campaign_id"),
            "campaign_name": row.get("campaign_name"),
            "adset_id":     row.get("adset_id"),
            "adset_name":   row.get("adset_name"),
            "thumbnail_url": thumbnail_url,
        }
