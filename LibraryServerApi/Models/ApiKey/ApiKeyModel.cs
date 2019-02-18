using System;

namespace LibraryServerApi.Models.ApiKey
{
    /// <summary>
    /// Repersents an ApiKey used for validating requests.
    /// </summary>
    public class ApiKeyModel : BaseEntity
    {
        /// <summary>
        /// Gets or sets the key.
        /// </summary>
        /// <value>
        /// The value.
        /// </value>
        public string Key { get; set; }

        /// <summary>
        /// Gets or sets the date/time the key was created.
        /// </summary>
        /// <value>
        /// The created.
        /// </value>
        public DateTime? Created { get; set; }

        /// <summary>
        /// Gets or sets the date/time the key should expire.
        /// </summary>
        /// <value>
        /// The expires.
        /// </value>
        public DateTime? Expires { get; set; }

        /// <summary>
        /// Determines whether this instance is expired.
        /// </summary>
        /// <returns>
        ///   <c>true</c> if this instance is expired; otherwise, <c>false</c>.
        /// </returns>
        public bool IsExpired()
        {
            if (Expires.HasValue)
                return Expires.Value > DateTime.Now;
            else
                return false;
        }
    }
}
