import express, { Request, Response } from 'express';
import { LockableService } from '../services/lockable-service';
import { container, TYPES } from '../dependency-registrar';
import { Lockable } from '../models/lockable';

export const taskController = express.Router({
  mergeParams: true
});

const lockableService: LockableService =
  container.get<LockableService>(TYPES.LockableService);

taskController.get('/tasks', (req: Request, res: Response) => {
  res.json({ test: 'hello world' });
});

taskController.all('/tasks/check-locks', async (req: Request, res: Response) => {
  res.status(200);
  for await (const lockable of getLockedLockables()) {

    for (const lock of lockable.locks) {

      // Check if the max lease date is greater than the locked at date.
      if (lock.lockedAt >= lock.maxLeaseDate) {
        lockableService.unlock(lockable, lock.id);
      }
    }
  }
});

taskController.get('tasks/check-locks-test', async (req: Request, res: Response) => {
  const results: Lockable[] = [];

  try {
    for await (const lockable of getLockedLockables()) {
      results.push(lockable);
    }
  }
  catch (error) {
    console.error(error);
  }

  res.json({
    results: results.map(r => r.name)
  });
});

async function* getLockedLockables (): AsyncIterableIterator<Lockable> {
  let query = await lockableService.paginate({
    limit: 10,
    filters: [
      {
        field: 'locks',
        comparator: 'elemMatch',
        value: { isShared: false }
      }
    ]
  });

  for (const result of query.results) {
    yield result;
  }

  while (query.next) {
    query = await lockableService.paginate(query.next);

    for (const result of query.results) {
      yield result;
    }
  }
}
