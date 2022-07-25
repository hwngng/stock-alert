Create table exchanges (
    id varchar(8) Primary key,
    name VARCHAR(200) null,
    description text null
);
insert into exchanges values
('10', 'HOSE'),
('02', 'HNX'),
('03', 'UPCOM');

CREATE TABLE stock_tickers (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(15) NOT NULL,
    exchange_code VARCHAR(8) NULL,
    name VARCHAR(200) NULL,
    description text null
    short_name VARCHAR(200) NULL,
    name_eng VARCHAR(200) NULL,
    top30 BOOLEAN NULL,
);
CREATE INDEX ON stock_tickers (symbol);
CREATE INDEX ON stock_tickers (exchange_code, symbol);

CREATE TABLE stock_prices (
    stock_id INTEGER NOT NULL,
    dt TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    open NUMERIC NOT NULL, 
    high NUMERIC NOT NULL,
    low NUMERIC NOT NULL,
    close NUMERIC NOT NULL, 
    volume NUMERIC NOT NULL,
    PRIMARY KEY (stock_id, dt),
    CONSTRAINT fk_stock_tickers FOREIGN KEY (stock_id) REFERENCES stock_tickers (id)
);

CREATE INDEX ON stock_prices (stock_id, dt DESC);

SELECT create_hypertable('stock_prices', 'dt');