namespace LibraryServerApi.Models.ApiKey
{
    /// <summary>
    /// Response used for validating api keys.
    /// </summary>
    public class ApiKeyValidationResponse
    {
        /// <summary>
        /// True if the key was valid.
        /// </summary>
        /// <value>
        ///   <c>true</c> if this instance is valid; otherwise, <c>false</c>.
        /// </value>
        public bool IsValid { get; set; }

        /// <summary>
        /// If the key is valid this will be null, otherwise this will contain
        /// the reason the key was rejected.
        /// </summary>
        /// <value>
        /// The reason.
        /// </value>
        public string Reason { get; set; }
    }
}
