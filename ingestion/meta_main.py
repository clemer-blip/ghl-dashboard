"""
Sincroniza insights diários do Meta Ads para o Supabase.

Roda uma vez por dia (via GitHub Actions).
Busca os últimos LOOKBACK_DAYS para cada conta de anúncio e
filtra apenas as campanhas rastreadas (TRACKED_CAMPAIGNS).
"""

import os
from datetime import date, timedelta

from dotenv import load_dotenv
from supabase import create_client

from meta_client import MetaClient, ACCOUNT_LOCATION_MAP, TRACKED_CAMPAIGNS

load_dotenv()

LOOKBACK_DAYS = 30  # dias para buscar/atualizar


def main():
    token = os.environ["META_ACCESS_TOKEN"]
    supabase_url = os.environ["SUPABASE_URL"]
    supabase_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    client = MetaClient(token)
    supabase = create_client(supabase_url, supabase_key)

    since = date.today() - timedelta(days=LOOKBACK_DAYS)
    until = date.today()

    total_rows = 0
    for account_id in ACCOUNT_LOCATION_MAP:
        tracked_name = TRACKED_CAMPAIGNS.get(account_id)
        print(f"[{account_id}] buscando insights de {since} a {until}")

        rows = client.get_daily_insights(account_id, since, until)
        print(f"  → {len(rows)} linhas brutas retornadas pela API")

        # Filtra apenas a campanha rastreada
        if tracked_name:
            rows = [r for r in rows if r.get("campaign_name") == tracked_name]
            print(f"  → {len(rows)} linhas após filtro '{tracked_name}'")

        if not rows:
            print("  → nenhuma linha para inserir, pulando.")
            continue

        records = [client.parse_row(r, account_id) for r in rows]

        resp = (
            supabase.table("meta_daily_insights")
            .upsert(records, on_conflict="id")
            .execute()
        )
        count = len(resp.data) if resp.data else 0
        print(f"  → {count} registros salvos no Supabase")
        total_rows += count

    print(f"\nSync Meta concluído — {total_rows} registros no total.")


if __name__ == "__main__":
    main()
