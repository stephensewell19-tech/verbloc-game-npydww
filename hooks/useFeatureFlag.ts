
import { useRemoteConfig } from '@/contexts/RemoteConfigContext';
import { FeatureFlags } from '@/utils/remoteConfig';

/**
 * Hook to check if a feature flag is enabled
 * 
 * @param flagName - Name of the feature flag to check
 * @returns boolean indicating if the feature is enabled
 * 
 * @example
 * const isRankedModeEnabled = useFeatureFlag('rankedMode');
 * 
 * if (isRankedModeEnabled) {
 *   return <RankedModeScreen />;
 * }
 */
export function useFeatureFlag(flagName: keyof FeatureFlags): boolean {
  const { isFeatureEnabled } = useRemoteConfig();
  return isFeatureEnabled(flagName);
}

/**
 * Hook to get A/B test variant for the current user
 * 
 * @param testName - Name of the A/B test
 * @returns string variant name or null if test is not active
 * 
 * @example
 * const buttonColorVariant = useABTest('buttonColorTest');
 * 
 * const buttonColor = buttonColorVariant === 'variant_a' ? 'blue' : 'green';
 */
export function useABTest(testName: string): string | null {
  const { getABTestVariant } = useRemoteConfig();
  return getABTestVariant(testName);
}
