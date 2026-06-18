import { jobFailed, jobFailureMessage } from './job';
import type { JobKind } from '../k8s/types';

const withStatus = (status: JobKind['status']): JobKind => ({ status });

describe('jobFailed', () => {
  it('is false for undefined / a running Job', () => {
    expect(jobFailed(undefined)).toBe(false);
    expect(jobFailed(withStatus({ active: 1 }))).toBe(false);
  });

  it('is true when failed pod count is positive', () => {
    expect(jobFailed(withStatus({ failed: 1 }))).toBe(true);
  });

  it('is true when a Failed condition is True', () => {
    expect(jobFailed(withStatus({ conditions: [{ type: 'Failed', status: 'True' }] }))).toBe(true);
  });

  it('is false when the Failed condition is not True', () => {
    expect(jobFailed(withStatus({ conditions: [{ type: 'Failed', status: 'False' }] }))).toBe(
      false,
    );
  });
});

describe('jobFailureMessage', () => {
  it('joins reason and message from the Failed condition', () => {
    const job = withStatus({
      conditions: [
        {
          type: 'Failed',
          status: 'True',
          reason: 'BackoffLimitExceeded',
          message: 'Job has reached the specified backoff limit',
        },
      ],
    });
    expect(jobFailureMessage(job)).toBe(
      'BackoffLimitExceeded: Job has reached the specified backoff limit',
    );
  });

  it('returns just the reason when there is no message', () => {
    expect(
      jobFailureMessage(
        withStatus({
          conditions: [{ type: 'Failed', status: 'True', reason: 'DeadlineExceeded' }],
        }),
      ),
    ).toBe('DeadlineExceeded');
  });

  it('returns empty string when the Job has not failed', () => {
    expect(jobFailureMessage(undefined)).toBe('');
    expect(jobFailureMessage(withStatus({ active: 1 }))).toBe('');
  });
});
