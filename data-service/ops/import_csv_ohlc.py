#!/usr/bin/python

import sys
import getopt
# Module Imports
import psycopg2
import datetime
import pandas as pd
import psycopg2.extras


def standardize_dt(dtstr):
    year = int(dtstr[:4])
    month = int(dtstr[4:6])
    day = int(dtstr[6:])
    dt = datetime.date(year, month, day)
    return dt


def df_insert(cur, df, table):
    if len(df) <= 0:
        return
    df_columns = list(df)
    # create (col1,col2,...)
    columns = ",".join(df_columns)
    # create VALUES('%s', '%s",...) one '%s' per column
    values = "VALUES({})".format(",".join(['%s' for _ in df_columns]))
    # create INSERT INTO table (columns) VALUES('%s',...)
    insert_stmt = "INSERT INTO {} ({}) {} ON CONFLICT (stock_id, dt) DO UPDATE SET open=EXCLUDED.open, high=EXCLUDED.high, low=EXCLUDED.low, close=EXCLUDED.close, volume=EXCLUDED.volume".format(
        table, columns, values)
    # print(insert_stmt)
    # insert_stmt = "INSERT INTO {} ({}) {} ON CONFLICT (stock_id, dt) DO NOTHING".format(table,columns,values)
    psycopg2.extras.execute_batch(cur, insert_stmt, df.values)


def importOHLCV(path):
    try:
        conn = psycopg2.connect(
            user="postgres",
            password="Thanos123",
            host="localhost",
            database="msig_stock_alert"
        )
    # Get Cursor
    except psycopg2.Error as e:
        print(f"Error connecting to PostgreSQL Platform: {e}")
        sys.exit(-1)
    conn.autocommit = True

    # prepare stock id
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("""SELECT * from stock_tickers order by id""")
    rows = cur.fetchall()
    db_stock_id_dict = {}
    for row in rows:
        db_stock_id_dict[row['symbol']] = row['id']
    db_current_max_idx = rows[-1]['id']
    # read csv
    df = pd.read_csv(path, dtype={'<DTYYYYMMDD>': str})
    df = df.rename(columns={
        '<Ticker>': 'symbol',
        '<DTYYYYMMDD>': 'dt',
        '<Open>': 'open',
        '<High>': 'high',
        '<Low>': 'low',
        '<Close>': 'close',
        '<Volume>': 'volume'
    })
    g = df.groupby(['symbol'])
    file_symbols = list(g.groups)
    # determine new symbols
    new_stocks = {}
    for symbol in file_symbols:
        if symbol not in db_stock_id_dict:
            db_current_max_idx += 1
            db_stock_id_dict[symbol] = db_current_max_idx
            new_stocks[symbol] = db_current_max_idx
    print('New stocks found: ', new_stocks)
    # prepare for inserting to db
    df['stock_id'] = df['symbol'].map(db_stock_id_dict)
    df['dt'] = df['dt'].map(standardize_dt)
    # import content to db
    i = 1
    no_symbol = len(file_symbols)
    for symbol in file_symbols:
        progress = '{0} of {1}'.format(i, no_symbol)
        if symbol in new_stocks:
            print('Importing new symbol {0} ({1})'.format(symbol, progress))
            values = "VALUES ('{}','{}')".format(
                db_stock_id_dict[symbol], symbol)
            insert_stmt = "INSERT INTO {} ({}) {} ON CONFLICT (id) DO UPDATE SET id=EXCLUDED.id, symbol=EXCLUDED.symbol, ".format(
                'stock_tickers', 'id,symbol', values)
            cur.execute(insert_stmt)
        else:
            print('Updating symbol {0} ({1})'.format(symbol, progress))
        gdf = g.get_group(symbol)
        df_insert(cur, gdf[['stock_id', 'dt', 'open', 'high',
                  'low', 'close', 'volume']], 'stock_prices')
        i += 1
    cur.close()
    conn.close()

def main(argv):
    try:
        opts, args = getopt.getopt(argv, "h", ["help="])
    except getopt.GetoptError:
        print('test.py <csv_file>')
        sys.exit(2)
    for opt, arg in opts:
        if opt in ('-h', '--help'):
            print('test.py <csv_file>')
            sys.exit()
    if (len(args) < 1):
        sys.exit(-1)
    path = args[0]
    importOHLCV(path)


if __name__ == "__main__":
    main(sys.argv[1:])
