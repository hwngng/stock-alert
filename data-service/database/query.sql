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