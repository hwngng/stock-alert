using System;
using System.ComponentModel.DataAnnotations;

namespace CoreIdentity.Data.ViewModels
{
    public class WatchlistSymbolViewModel
    {
        [Required(ErrorMessage = "Id is required")]
        public long Id {get;set;}
        [Required(ErrorMessage = "Symbol is required")]
        public Stock Symbol {get;set;}
    }
}
