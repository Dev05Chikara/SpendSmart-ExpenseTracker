using System.Collections.Generic;

namespace SpendSmart.Report.API.DTOs
{
    public class ApiResponseContainer<T> where T : class
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
    }
}
