# importing the requests library
import requests
import psycopg2
import sys
import datetime
import pandas as pd
import psycopg2.extras

# Connect to MariaDB Platform
try:
    conn = psycopg2.connect(
        user="postgres",
        password="Thanos123",
        host="localhost",
        database="msig_stock_alert"

    )
except psycopg2.Error as e:
    print(f"Error connecting to MariaDB Platform: {e}")
    sys.exit(1)
conn.autocommit = True
  
# api-endpoint
URL = "https://api-finfo.vndirect.com.vn/v4/stocks"
  

headers = {'User-Agent': 'PostmanRuntime/7.29.0',
'Accept': '*/*',
'Postman-Token': '2088c0f2-0689-4d18-aa74-ed7d91eb5926',
'Host': 'api-finfo.vndirect.com.vn',
'Accept-Encoding': 'gzip, deflate, br',
'Connection': 'keep-alive'}  
# defining a params dict for the parameters to be sent to the API
params = {'q':'type:IFC,ETF,STOCK~status:LISTED',
		'fields':'code,companyName,companyNameEng,shortName,floor,industryName,top30',
		'size': 3000}

# sending get request and saving the response as response object
r = requests.get(url = URL, params = params, headers=headers)
  
# extracting data in json format
data = r.json()
companyLst = data['data']
updateDict = []
exchangeDict = {'HOSE': '10', 'HNX': '02', 'UPCOM': '03', None:None}
def getValDictDefault (d, k, default):
	if k in d:
		return d[k]
	else:
		return default

for company in companyLst:
	updateDict.append({
		'symbol': company['code'],
		'exchange_code': exchangeDict[getValDictDefault(company, 'floor', None)],
		'name': getValDictDefault(company, 'companyName', None),
		'name_eng': getValDictDefault(company, 'companyNameEng', None),
		'short_name': getValDictDefault(company, 'shortName', None)
	})
cur = conn.cursor()
cur.executemany(
    '''
        UPDATE stock_tickers 
        SET
            "exchange_code" = %(exchange_code)s,
            "name" = %(name)s,
            "name_eng" = %(name_eng)s,
            "short_name" = %(short_name)s
        WHERE
            "symbol" = %(symbol)s
    ''',
    updateDict
)
cur.close()
