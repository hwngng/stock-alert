using System;

namespace CoreIdentity.API.Helpers
{
    public class Utils
    {
        public static long GetEpochTimeSec (DateTime dt) {
            if (dt.Kind != DateTimeKind.Utc)
                dt = dt.ToUniversalTime();
            var tOffset = dt - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            return (long)tOffset.TotalSeconds;
        }
    }
}