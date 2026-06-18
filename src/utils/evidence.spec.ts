import {
  evidenceSchemaVersion,
  isEvidenceSchemaSupported,
  parseEvidence,
  type EvidenceRecord,
} from './evidence';

describe('parseEvidence', () => {
  it('parses a JSON evidence record', () => {
    expect(parseEvidence('{"verdict":"passed"}')).toEqual({ verdict: 'passed' });
  });

  it('returns undefined for missing or malformed JSON', () => {
    expect(parseEvidence(undefined)).toBeUndefined();
    expect(parseEvidence('not json')).toBeUndefined();
  });
});

describe('evidenceSchemaVersion', () => {
  it('treats a missing/blank schema as "1" (pre-stamp baseline)', () => {
    expect(evidenceSchemaVersion(undefined)).toBe('1');
    expect(evidenceSchemaVersion({})).toBe('1');
    expect(evidenceSchemaVersion({ schema: '   ' })).toBe('1');
  });

  it('returns the stamped schema', () => {
    expect(evidenceSchemaVersion({ schema: '2' })).toBe('2');
  });
});

describe('isEvidenceSchemaSupported', () => {
  it('tolerates a missing schema (older producer)', () => {
    expect(isEvidenceSchemaSupported(undefined, '1')).toBe(true);
    expect(isEvidenceSchemaSupported({}, '1')).toBe(true);
  });

  it('supports the same version', () => {
    expect(isEvidenceSchemaSupported({ schema: '1' }, '1')).toBe(true);
  });

  it('supports an older version', () => {
    expect(isEvidenceSchemaSupported({ schema: '1' }, '2')).toBe(true);
  });

  it('rejects a NEWER version this reader does not understand', () => {
    const rec: EvidenceRecord = { schema: '2' };
    expect(isEvidenceSchemaSupported(rec, '1')).toBe(false);
  });

  it('is best-effort (true) for a non-numeric version', () => {
    expect(isEvidenceSchemaSupported({ schema: 'beta' }, '1')).toBe(true);
  });
});
