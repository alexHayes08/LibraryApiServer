namespace LibraryServerApi.Models
{
    /// <summary>
    /// A wrapper class for requests.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class BaseRequest<T>
    {
        public string OwnerToken { get; set; }

        public T Data { get; set; }
    }
}
