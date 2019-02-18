namespace LibraryServerApi.Models.Lockable
{
    public class UnlockRequest
    {
        public string LockableId { get; set; }
        public string LockId { get; set; }
    }
}
