using System.ComponentModel.DataAnnotations;

namespace CoreIdentity.Data.Models
{
    public class AlertType
    {
        [Key]
        public string TypeKey {get;set;}
        public string Title {get;set;}
        public string Parent {get;set;}
    }
}