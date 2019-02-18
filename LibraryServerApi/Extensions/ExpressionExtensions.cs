using System;
using System.Linq.Expressions;

namespace LibraryServerApi.Extensions
{
    /// <summary>
    /// Contains extensions for <c>Expression</c>s.
    /// </summary>
    public static class ExpressionExtensions
    {
        /// <summary>
        /// Gets the name from lambda expression.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="V"></typeparam>
        /// <param name="expression">The expression.</param>
        /// <returns></returns>
        /// <exception cref="System.NotImplementedException">
        /// Thrown if the expression body is neither a MemberExpression nor
        /// UnaryExpression.
        /// </exception>
        public static string GetNameFromLambdaExpression<T, V>(
            this Expression<Func<T, V>> expression)
        {
            var memberExpression = expression.Body as MemberExpression;

            if (memberExpression == null)
            {
                if (expression.Body is UnaryExpression unaryExpression)
                    memberExpression = unaryExpression.Operand as MemberExpression;

                if (memberExpression == null)
                    throw new NotImplementedException();
            }

            return memberExpression.Member.Name;
        }
    }
}
