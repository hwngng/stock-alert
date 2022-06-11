CREATE INDEX "UserLocalIdIdIndex" ON "Watchlists" ("UserLocalId", "Id") INCLUDE ("Name");
CREATE INDEX "IdIndex" ON "Watchlists" ("Id") INCLUDE ("SymbolJson");

select relname, indisclustered, indrelid::regclass as tabname
from pg_index i
join pg_class c on c.oid = indexrelid
where indrelid::regclass = '"Watchlists"'::regclass;

DELETE FROM "Watchlists";

select 1 from "Watchlists" where "UserLocalId" = 2;

update "RefreshTokens" set "CreatedAt" = NOW

select "Id", "Name", "UserLocalId"
from "Watchlists"
where "UserLocalId" = 2