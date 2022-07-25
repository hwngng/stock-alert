SELECT "id", "symbol", "exchange_code", "dt", "open", "high", "low", "close", "volume"
	FROM "stock_tickers" as st join "stock_prices" as sp on st.id=sp.stock_id
    where
    symbol='AAA' and ('2021-04-19T00:00:00.000Z' <= dt and  dt <= '2022/05/20')
    order by symbol, dt;
    
SELECT "id", "symbol", "exchange_code", "dt", "open", "high", "low", "close", "volume"
	FROM "stock_tickers" as st join "stock_prices" as sp on st.id=sp.stock_id
    where
    symbol='HCM ' or 1=1 -- ' and exchange_code and ('2021-05-20' <= dt and  dt <= '2022-05-20');

CREATE OR REPLACE procedure select_multi(
  
)
language plpgsql    
as $$
BEGIN
  SELECT "id", "symbol", "exchange_code", "dt", "open", "high", "low", "close", "volume"
	FROM "stock_tickers" as st join "stock_prices" as sp on st.id=sp.stock_id
    where
    symbol='AAA' and ('2021-05-20' <= dt and  dt <= '2022-05-20');
    
return(SELECT "id", "symbol", "exchange_code", "dt", "open", "high", "low", "close", "volume"
	FROM "stock_tickers" as st join "stock_prices" as sp on st.id=sp.stock_id
    where
    symbol='HCM' and ('2021-05-20' <= dt and  dt <= '2022-05-20');)
END;$$;

call select_multi();

select count(*) from stock_prices;

SELECT *
FROM stock_prices
WHERE dt > (now() - interval '14 days')
ORDER BY stock_id, dt;

select * from stock_tickers where symbol = ANY (array['MWG','TCB','NVL']);

select * from exchanges;


insert into stock_prices ("stock_id", "dt", "open", "high", "low", "close", "volume")
values
(1825, '2022-06-01', 24.3, 24.35, 22.7, 22.83, 10000000),
(1825, '2022-06-02', 22.83, 23.24, 22.75, 23.24, 10000000),
(1825, '2022-06-03', 23.45, 23.9, 23.4, 23.85, 1000000),
(1825, '2022-06-06', 23.5, 24.2, 23.45, 24.1, 10000000),
(1825, '2022-06-07', 24.5, 24.6, 22, 22.5, 10000000);

SELECT "id", "symbol", "exchange_code", "dt", "open", "high", "low", "close", "volume"
	FROM "stock_tickers" as st join "stock_prices" as sp on st.id=sp.stock_id
    where
    symbol like 'test%' AND dt >= '2000-1-1';
	
UPDATE "stock_prices" SET "open" = '8.9',"high" = '9.6',"low" = '8.9',"close" = '9.2',"volume" = '17066' WHERE "stock_id" = '1977' AND "dt" = '2022-07-20';

select * from stock_tickers order by id desc limit 100;

UPDATE "stock_prices" SET "low" = '8.7',"close" = '10.3',"volume" = '15084' WHERE "stock_id" = '1977' AND "dt" = '2022-07-18';
UPDATE "stock_prices" SET "open" = '9.4',"high" = '10.1',"low" = '9',"close" = '9.9',"volume" = '25025' WHERE "stock_id" = '1977' AND "dt" = '2022-07-22';
UPDATE "stock_prices" SET "open" = '8.9',"high" = '9.6',"low" = '8.9',"close" = '9.2',"volume" = '17066' WHERE "stock_id" = '1977' AND "dt" = '2022-07-20';
