using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LibraryServerApi.Models
{
    /// <summary>
    /// Base class for models that have an id property.
    /// </summary>
    public class BaseEntity
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
    }
}
