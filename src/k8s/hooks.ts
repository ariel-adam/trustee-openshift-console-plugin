import { useEffect, useRef } from 'react';
import { useActiveNamespace, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { KbsConfigGVK, NamespaceGVK, TRUSTEE_NAMESPACE, TrusteeConfigGVK } from './resources';
import type { KbsConfigKind, NamespaceKind, TrusteeConfigKind } from './types';

/** Console "All Projects" sentinel (ALL_NAMESPACES_KEY). */
const ALL_NAMESPACES = '#ALL_NS#';

/**
 * Default the console's active project to the Trustee operator namespace when it
 * exists — so the namespaced TrusteeConfigs list and the TrusteeConfig tab links
 * aren't empty — otherwise fall back to All Projects. Applies once per mount; the
 * user can still change the project afterward.
 */
export const useTrusteeDefaultProject = (): void => {
  const [, setActiveNamespace] = useActiveNamespace();
  const [, nsLoaded, nsError] = useK8sWatchResource<NamespaceKind>({
    groupVersionKind: NamespaceGVK,
    name: TRUSTEE_NAMESPACE,
  });
  const applied = useRef(false);
  useEffect(() => {
    if (applied.current) return;
    if (nsLoaded) {
      setActiveNamespace(TRUSTEE_NAMESPACE);
      applied.current = true;
    } else if (nsError) {
      setActiveNamespace(ALL_NAMESPACES);
      applied.current = true;
    }
  }, [nsLoaded, nsError, setActiveNamespace]);
};

/** All TrusteeConfig CRs on the cluster (the user-facing attestation resource). */
export const useTrusteeConfigs = (): [TrusteeConfigKind[], boolean] => {
  const [data, loaded] = useK8sWatchResource<TrusteeConfigKind[]>({
    groupVersionKind: TrusteeConfigGVK,
    isList: true,
  });
  return [data ?? [], loaded];
};

/** All KbsConfig CRs (operator-generated; surfaced for advanced management). */
export const useKbsConfigs = (): [KbsConfigKind[], boolean] => {
  const [data, loaded] = useK8sWatchResource<KbsConfigKind[]>({
    groupVersionKind: KbsConfigGVK,
    isList: true,
  });
  return [data ?? [], loaded];
};
