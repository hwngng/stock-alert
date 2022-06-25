namespace AlertService.Services.Common
{
    public static class CacheKey
    {
        public static string LockGetStockData = "lock_stock_data_{0}";
        public static string StockData = "stock_data_{0}";
        public static int StockDataExpire = -1;
    }
}