using MongoDB.Bson.Serialization.Attributes;

namespace LibraryServerApi.Models.RandomData
{
    public class RandomDataItem : BaseEntity
    {
        [BsonElement("UsedRecently")]
        public bool UsedRecently { get; set; }

        [BsonElement("Data")]
        public object Data { get; set; }
    }
}
