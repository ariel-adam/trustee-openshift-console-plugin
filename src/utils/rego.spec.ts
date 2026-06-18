import {
  PERMISSIVE_RESOURCE_POLICY,
  RESTRICTED_ATTESTATION_POLICY,
  RESTRICTED_RESOURCE_POLICY,
  regoTemplatesForPolicy,
  validateRego,
} from './rego';

describe('validateRego', () => {
  it('accepts the shipped permissive template', () => {
    expect(validateRego(PERMISSIVE_RESOURCE_POLICY)).toBeUndefined();
  });

  it('accepts the shipped restricted templates (balanced braces)', () => {
    expect(validateRego(RESTRICTED_RESOURCE_POLICY)).toBeUndefined();
    expect(validateRego(RESTRICTED_ATTESTATION_POLICY)).toBeUndefined();
  });

  it('rejects an empty policy', () => {
    expect(validateRego('')).toMatch(/empty/i);
    expect(validateRego('   \n  ')).toMatch(/empty/i);
  });

  it('rejects a policy with no package clause', () => {
    expect(validateRego('default allow = true')).toMatch(/package/i);
  });

  it('rejects unbalanced braces', () => {
    expect(validateRego('package policy\nallow {\n  x == 1\n')).toMatch(/unbalanced|missing/i);
  });

  it('rejects a stray closing bracket', () => {
    expect(validateRego('package policy\nallow }\n')).toMatch(/unbalanced/i);
  });

  it('ignores braces inside strings and comments', () => {
    const policy = `package policy

# a comment with an unbalanced { brace
default msg = "a string with } and { inside"
`;
    expect(validateRego(policy)).toBeUndefined();
  });

  it('rejects an unterminated string', () => {
    expect(validateRego('package policy\nx = "oops\n')).toMatch(/string/i);
  });

  it('handles escaped quotes inside strings', () => {
    expect(validateRego('package policy\nx = "a \\" quote"\n')).toBeUndefined();
  });
});

describe('regoTemplatesForPolicy', () => {
  it('returns Permissive + Restricted resource-policy templates', () => {
    const tpls = regoTemplatesForPolicy('resource-policy');
    expect(tpls.map((t) => t.id)).toEqual(['permissive', 'restricted']);
    expect(tpls[0].value).toBe(PERMISSIVE_RESOURCE_POLICY);
  });

  it('returns attestation templates for CPU/GPU policies', () => {
    const cpu = regoTemplatesForPolicy('attestation-policy-cpu');
    const gpu = regoTemplatesForPolicy('attestation-policy-gpu');
    expect(cpu.map((t) => t.id)).toEqual(['permissive', 'restricted']);
    expect(gpu).toEqual(cpu);
  });
});
