import { cocoRoutesPresent, crossPluginHref } from './crossPlugin';

describe('cocoRoutesPresent', () => {
  it('is true only when the CoCo flag resolved true', () => {
    expect(cocoRoutesPresent(true)).toBe(true);
  });

  it('is false when the flag is false (CoCo gating CRD absent)', () => {
    expect(cocoRoutesPresent(false)).toBe(false);
  });

  it('is false while the flag is still resolving (undefined) — avoid a brief 404 link', () => {
    expect(cocoRoutesPresent(undefined)).toBe(false);
  });
});

describe('crossPluginHref', () => {
  const href = '/confidential-containers/workloads/new';

  it('returns the href when CoCo routes are present (renders a link)', () => {
    expect(crossPluginHref(href, true)).toBe(href);
  });

  it('returns undefined when routes are absent (renders plain text, no dead link)', () => {
    expect(crossPluginHref(href, false)).toBeUndefined();
  });

  it('passes through an undefined href unchanged', () => {
    expect(crossPluginHref(undefined, true)).toBeUndefined();
  });
});
