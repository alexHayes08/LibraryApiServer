namespace LibraryServerApi.Models.Lockable
{
    public class LockRequest
    {
        public string LockableId { get; set; }
        public Lock.Lock Lock { get; set; }
    }
}
