using System.ComponentModel.DataAnnotations;

namespace CoreIdentity.Data.ViewModels
{
    public class AlertTypeViewModel
    {
        [Key]
        public string TypeKey {get;set;}
        public string Title {get;set;}
        public string Parent {get;set;}
    }
}