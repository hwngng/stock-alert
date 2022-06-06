using System;
using System.Text;

namespace AlertService.Common
{
    public class Constants
    {

        public static ArraySegment<byte> PING = Encoding.ASCII.GetBytes("2");

        public static ArraySegment<byte> PONG = Encoding.ASCII.GetBytes("3");
    }
}