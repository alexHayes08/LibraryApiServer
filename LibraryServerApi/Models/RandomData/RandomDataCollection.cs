using System.Collections.Generic;
using MongoDB.Bson.Serialization.Attributes;

namespace LibraryServerApi.Models.RandomData
{
    public class RandomDataCollection : BaseEntity
    {
        public RandomDataCollection()
        {
            Items = new List<RandomDataItem>();
        }

        [BsonElement("Group")]
        public string Group { get; set; }

        [BsonElement("Item")]
        public IList<RandomDataItem> Items { get; set; }
    }
}
