namespace LibraryServerApi.Models.Lockable
{
    public class LockResponse
    {
        public Lockable Lockable { get; set; }
        public string LockId { get; set; }
    }
}
