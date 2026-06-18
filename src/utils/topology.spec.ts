import { classifyKbsUrl, detectClusterTee, teeTypeForNode } from './topology';
import { SNP_NODE_LABEL, TDX_NODE_LABEL } from '../k8s/resources';
import type { NodeKind } from '../k8s/types';

const node = (labels: Record<string, string>): NodeKind => ({ metadata: { labels } });

describe('teeTypeForNode', () => {
  it('reads the TDX NFD label', () => {
    expect(teeTypeForNode(node({ [TDX_NODE_LABEL]: 'true' }))).toBe('tdx');
  });

  it('reads the SNP NFD label', () => {
    expect(teeTypeForNode(node({ [SNP_NODE_LABEL]: 'true' }))).toBe('snp');
  });

  it('returns none for an unlabeled node', () => {
    expect(teeTypeForNode(node({}))).toBe('none');
    expect(teeTypeForNode(undefined)).toBe('none');
  });
});

describe('detectClusterTee', () => {
  it('returns null when no node carries a TEE label', () => {
    expect(detectClusterTee([node({}), node({ foo: 'bar' })])).toBeNull();
    expect(detectClusterTee([])).toBeNull();
  });

  it('detects TDX from a labeled node among unlabeled ones', () => {
    expect(detectClusterTee([node({}), node({ [TDX_NODE_LABEL]: 'true' })])).toBe('tdx');
  });

  it('detects SNP', () => {
    expect(detectClusterTee([node({ [SNP_NODE_LABEL]: 'true' })])).toBe('snp');
  });

  it('returns the first TEE found when scanning', () => {
    const tdxFirst = [node({ [TDX_NODE_LABEL]: 'true' }), node({ [SNP_NODE_LABEL]: 'true' })];
    expect(detectClusterTee(tdxFirst)).toBe('tdx');
  });
});

describe('classifyKbsUrl', () => {
  it('classifies the in-cluster Service host as local', () => {
    expect(classifyKbsUrl('http://kbs-service.ns.svc:8080', 'kbs-service').target).toBe('local');
  });

  it('classifies an external Route host as remote', () => {
    expect(classifyKbsUrl('https://kbs.apps.example.com', 'kbs-service').target).toBe('remote');
  });
});
