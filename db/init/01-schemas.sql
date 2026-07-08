-- Runs once, only against a fresh Postgres data volume (docker-entrypoint-initdb.d
-- semantics). Creates the per-service schemas introduced by the microservices split
-- (Fase 4+ of the migration plan). Existing dev volumes need the same statement run
-- manually once via `docker compose exec db psql -U postgres -d gprflow -c "..."`.
CREATE SCHEMA IF NOT EXISTS coin;
