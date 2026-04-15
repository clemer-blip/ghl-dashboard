"""
Sincroniza insights diários no nível de ad + catálogo de criativos (thumbnails).

Roda uma vez por dia via GitHub Actions, junto com o sync de campanha.
Busca os últimos LOOKBACK_DAYS para cada conta de anúncio.
"""

import os
from datetime import date, timedelta

from dotenv import load_dotenv
from supabase import create_client

from meta_client import ACCOUNT_LOCATION_MAP
from meta_creative_client import MetaCreativeClient

load_dotenv()

LOOKBACK_DAYS = 30


def main():
    token        = os.environ["META_ACCESS_TOKEN"]
    supabase_url = os.environ["SUPABASE_URL"]
    supabase_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    client   = MetaCreativeClient(token)
    supabase = create_client(supabase_url, supabase_key)

    since = date.today() - timedelta(days=LOOKBACK_DAYS)
    until = date.today()

    total_insights  = 0
    total_creatives = 0

    for account_id in ACCOUNT_LOCATION_MAP:
        print(f"\n[{account_id}] buscando ad insights {since} → {until}")

        rows = client.get_ad_insights(account_id, since, until)
        print(f"  → {len(rows)} linhas brutas")

        if not rows:
            print("  → nenhuma linha, pulando.")
            continue

        # Debug: mostrar chaves da primeira linha
        print(f"  → chaves da primeira linha: {list(rows[0].keys())}")
        print(f"  → exemplo: {rows[0]}")

        # Upsert métricas diárias por ad
        insight_records = [client.parse_insight_row(r, account_id) for r in rows]
        supabase.table("meta_ad_insights").upsert(
            insight_records, on_conflict="id"
        ).execute()
        print(f"  → {len(insight_records)} insights salvos")
        total_insights += len(insight_records)

        # Atualiza catálogo de criativos (um registro por ad_id único)
        seen: dict[str, dict] = {}
        for r in rows:
            ad_id = r["ad_id"]
            if ad_id not in seen:
                seen[ad_id] = r

        print(f"  → buscando thumbnails e vídeos de {len(seen)} ads únicos…")
        creative_records = []
        for ad_id, row in seen.items():
            thumb, video, vid_id = client.get_ad_creative_urls(ad_id)
            creative_records.append(
                client.parse_creative_row(row, account_id, thumb, video, vid_id)
            )

        supabase.table("meta_ad_creatives").upsert(
            creative_records, on_conflict="ad_id"
        ).execute()
        print(f"  → {len(creative_records)} criativos upsertados")
        total_creatives += len(creative_records)

    print(
        f"\nSync criativos concluído — "
        f"{total_insights} insights, {total_creatives} criativos."
    )


if __name__ == "__main__":
    main()
