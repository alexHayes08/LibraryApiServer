using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LibraryServerApi.Service;
using Microsoft.Extensions.Hosting;

namespace LibraryServerApi.Tasks
{
    public class CheckLockableLeasesTask : IHostedService, IDisposable
    {
        #region Fields

        private readonly ILockableService lockableService;

        private Timer timer;

        #endregion

        #region Constructor

        public CheckLockableLeasesTask(ILockableService lockableService)
        {
            this.lockableService = lockableService;
        }

        #endregion

        #region Methods

        public Task StartAsync(CancellationToken cancellationToken)
        {
            timer = new Timer(
                ExecuteAsync,
                null,
                TimeSpan.FromSeconds(0),
                TimeSpan.FromHours(1));

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            timer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }

        private void ExecuteAsync(object state)
        {
            var now = DateTime.Now;

            var lockables = lockableService.Query()
                .Where(l => l.Locks.Any(_l => _l.MaxLeaseDate <= now))
                .ToList();

            if (lockables.Any())
            {
                foreach (var lockable in lockables)
                {
                    var tasks = new List<Task>();
                    var overDueLocks = lockable.Locks
                        .Where(l => l.MaxLeaseDate >= now)
                        .ToList();

                    // Remove over due locks.
                    foreach (var overDueLock in overDueLocks)
                    {
                        var _overDueLock = overDueLock;

                        tasks.Add(
                            new Task(() => lockableService.UnlockAsync(
                                lockable,
                                _overDueLock.Id)));
                    }
                }
            }
        }

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    timer?.Dispose();
                }

                // TODO: free unmanaged resources (unmanaged objects) and override a finalizer below.
                // TODO: set large fields to null.

                disposedValue = true;
            }
        }

        // TODO: override a finalizer only if Dispose(bool disposing) above has code to free unmanaged resources.
        // ~CheckLockableLeasesTask() {
        //   // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
        //   Dispose(false);
        // }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
            // TODO: uncomment the following line if the finalizer is overridden above.
            // GC.SuppressFinalize(this);
        }
        #endregion

        #endregion
    }
}
