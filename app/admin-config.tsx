
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useRemoteConfig } from '@/contexts/RemoteConfigContext';
import { Modal } from '@/components/button';
import { authenticatedGet, authenticatedPost, authenticatedPut } from '@/utils/api';

interface FeatureFlag {
  id: string;
  flagName: string;
  isEnabled: boolean;
  description?: string;
  rolloutPercentage: number;
  targetUserIds?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ABTest {
  id: string;
  testName: string;
  isEnabled: boolean;
  variants: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminConfigScreen() {
  const router = useRouter();
  const { config, loading, refresh } = useRemoteConfig();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [editingTest, setEditingTest] = useState<ABTest | null>(null);
  const [createType, setCreateType] = useState<'flag' | 'test'>('flag');
  const [adminLoading, setAdminLoading] = useState(false);
  const [allFlags, setAllFlags] = useState<FeatureFlag[]>([]);
  const [allTests, setAllTests] = useState<ABTest[]>([]);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seedingConfig, setSeedingConfig] = useState(false);

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    flagName: '',
    testName: '',
    isEnabled: false,
    description: '',
    rolloutPercentage: 100,
    variants: ['control', 'variant_a'],
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setAdminLoading(true);
      const [flagsData, testsData] = await Promise.all([
        authenticatedGet<FeatureFlag[]>('/api/admin/feature-flags'),
        authenticatedGet<ABTest[]>('/api/admin/ab-tests'),
      ]);
      setAllFlags(flagsData);
      setAllTests(testsData);
      console.log('[AdminConfig] Loaded admin data:', { flags: flagsData, tests: testsData });
    } catch (error) {
      console.error('[AdminConfig] Failed to load admin data:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('User tapped Refresh Config button');
    await refresh();
    await loadAdminData();
    setShowSuccessModal(true);
  };

  const handleSeedConfig = async () => {
    try {
      setSeedingConfig(true);
      await authenticatedPost('/api/admin/seed-config', {});
      console.log('[AdminConfig] Seeded configuration successfully');
      await loadAdminData();
      await refresh();
      setShowSeedModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('[AdminConfig] Failed to seed config:', error);
      alert('Failed to seed configuration. Please try again.');
    } finally {
      setSeedingConfig(false);
    }
  };

  const handleToggleFlag = async (flag: FeatureFlag) => {
    try {
      const updatedFlag = await authenticatedPut(`/api/admin/feature-flags/${flag.flagName}`, {
        isEnabled: !flag.isEnabled,
      });
      console.log('[AdminConfig] Toggled flag:', updatedFlag);
      await loadAdminData();
      await refresh();
    } catch (error) {
      console.error('[AdminConfig] Failed to toggle flag:', error);
      alert('Failed to update feature flag. Please try again.');
    }
  };

  const handleToggleTest = async (test: ABTest) => {
    try {
      const updatedTest = await authenticatedPut(`/api/admin/ab-tests/${test.testName}`, {
        isEnabled: !test.isEnabled,
      });
      console.log('[AdminConfig] Toggled test:', updatedTest);
      await loadAdminData();
      await refresh();
    } catch (error) {
      console.error('[AdminConfig] Failed to toggle test:', error);
      alert('Failed to update A/B test. Please try again.');
    }
  };

  const handleEditFlag = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setFormData({
      ...formData,
      flagName: flag.flagName,
      isEnabled: flag.isEnabled,
      description: flag.description || '',
      rolloutPercentage: flag.rolloutPercentage,
    });
    setShowEditModal(true);
  };

  const handleEditTest = (test: ABTest) => {
    setEditingTest(test);
    setFormData({
      ...formData,
      testName: test.testName,
      isEnabled: test.isEnabled,
      description: test.description || '',
      variants: test.variants,
    });
    setShowEditModal(true);
  };

  const handleCreateFlag = () => {
    setCreateType('flag');
    setFormData({
      flagName: '',
      testName: '',
      isEnabled: false,
      description: '',
      rolloutPercentage: 100,
      variants: ['control', 'variant_a'],
    });
    setShowCreateModal(true);
  };

  const handleCreateTest = () => {
    setCreateType('test');
    setFormData({
      flagName: '',
      testName: '',
      isEnabled: false,
      description: '',
      rolloutPercentage: 100,
      variants: ['control', 'variant_a'],
    });
    setShowCreateModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (editingFlag) {
        await authenticatedPut(`/api/admin/feature-flags/${editingFlag.flagName}`, {
          isEnabled: formData.isEnabled,
          description: formData.description,
          rolloutPercentage: formData.rolloutPercentage,
        });
      } else if (editingTest) {
        await authenticatedPut(`/api/admin/ab-tests/${editingTest.testName}`, {
          isEnabled: formData.isEnabled,
          description: formData.description,
          variants: formData.variants,
        });
      }
      await loadAdminData();
      await refresh();
      setShowEditModal(false);
      setEditingFlag(null);
      setEditingTest(null);
    } catch (error) {
      console.error('[AdminConfig] Failed to save edit:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleCreate = async () => {
    try {
      if (createType === 'flag') {
        await authenticatedPost('/api/admin/feature-flags', {
          flagName: formData.flagName,
          isEnabled: formData.isEnabled,
          description: formData.description,
          rolloutPercentage: formData.rolloutPercentage,
        });
      } else {
        await authenticatedPost('/api/admin/ab-tests', {
          testName: formData.testName,
          isEnabled: formData.isEnabled,
          description: formData.description,
          variants: formData.variants,
        });
      }
      await loadAdminData();
      await refresh();
      setShowCreateModal(false);
    } catch (error) {
      console.error('[AdminConfig] Failed to create:', error);
      alert('Failed to create. Please try again.');
    }
  };

  if ((loading || adminLoading) && !config) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'Remote Configuration',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading configuration...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Remote Configuration',
          headerShown: true,
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <IconSymbol
            ios_icon_name="gear"
            android_material_icon_name="settings"
            size={48}
            color={colors.primary}
          />
          <Text style={styles.title}>Remote Configuration</Text>
          <Text style={styles.subtitle}>
            Manage feature flags, A/B tests, and game configuration
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={loading || adminLoading}
          >
            <IconSymbol
              ios_icon_name="arrow.clockwise"
              android_material_icon_name="refresh"
              size={20}
              color="#fff"
            />
            <Text style={styles.refreshButtonText}>
              {loading || adminLoading ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.seedButton}
            onPress={() => setShowSeedModal(true)}
            disabled={seedingConfig}
          >
            <IconSymbol
              ios_icon_name="leaf.fill"
              android_material_icon_name="eco"
              size={20}
              color="#fff"
            />
            <Text style={styles.refreshButtonText}>
              {seedingConfig ? 'Seeding...' : 'Seed Config'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feature Flags Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Feature Flags</Text>
              <Text style={styles.sectionDescription}>
                Toggle features remotely without app updates
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleCreateFlag}
            >
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={32}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          
          {allFlags.length > 0 ? (
            allFlags.map((flag) => {
              const statusColor = flag.isEnabled ? colors.success : colors.textSecondary;
              
              return (
                <TouchableOpacity
                  key={flag.id}
                  style={styles.flagItem}
                  onPress={() => handleEditFlag(flag)}
                >
                  <View style={styles.flagInfo}>
                    <Text style={styles.flagName}>{flag.flagName}</Text>
                    {flag.description && (
                      <Text style={styles.flagDescription}>{flag.description}</Text>
                    )}
                    <Text style={[styles.flagStatus, { color: statusColor }]}>
                      {flag.isEnabled ? 'Enabled' : 'Disabled'} • {flag.rolloutPercentage}% rollout
                    </Text>
                  </View>
                  <Switch
                    value={flag.isEnabled}
                    onValueChange={() => handleToggleFlag(flag)}
                    trackColor={{ false: colors.backgroundAlt, true: colors.primary }}
                    thumbColor={flag.isEnabled ? colors.success : colors.textSecondary}
                  />
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No feature flags configured</Text>
          )}
        </View>

        {/* A/B Tests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>A/B Tests</Text>
              <Text style={styles.sectionDescription}>
                Experiments for feature optimization
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleCreateTest}
            >
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={32}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          
          {allTests.length > 0 ? (
            allTests.map((test) => {
              const enabledColor = test.isEnabled ? colors.success : colors.textSecondary;
              
              return (
                <TouchableOpacity
                  key={test.id}
                  style={styles.testItem}
                  onPress={() => handleEditTest(test)}
                >
                  <View style={styles.testInfo}>
                    <Text style={styles.testName}>{test.testName}</Text>
                    {test.description && (
                      <Text style={styles.testDescription}>{test.description}</Text>
                    )}
                    <Text style={styles.testVariant}>
                      Variants: {test.variants.join(', ')}
                    </Text>
                  </View>
                  <View style={styles.testActions}>
                    <Text style={[styles.testStatus, { color: enabledColor }]}>
                      {test.isEnabled ? 'Active' : 'Inactive'}
                    </Text>
                    <Switch
                      value={test.isEnabled}
                      onValueChange={() => handleToggleTest(test)}
                      trackColor={{ false: colors.backgroundAlt, true: colors.primary }}
                      thumbColor={test.isEnabled ? colors.success : colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No A/B tests configured</Text>
          )}
        </View>

        {/* Game Config Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Configuration</Text>
          <Text style={styles.sectionDescription}>
            Dynamic game parameters and settings
          </Text>
          
          {config && Object.entries(config.gameConfig).map(([key, value]) => {
            let displayValue = '';
            
            if (typeof value === 'object' && value !== null) {
              displayValue = JSON.stringify(value, null, 2);
            } else {
              displayValue = String(value);
            }
            
            return (
              <View key={key} style={styles.configItem}>
                <Text style={styles.configKey}>{key}</Text>
                <Text style={styles.configValue}>{displayValue}</Text>
              </View>
            );
          })}
        </View>

        {/* Last Fetched */}
        {config && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Last updated: {new Date(config.lastFetched).toLocaleString()}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Configuration Updated"
      >
        <Text style={styles.modalText}>
          Remote configuration has been successfully updated.
        </Text>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => setShowSuccessModal(false)}
        >
          <Text style={styles.modalButtonText}>OK</Text>
        </TouchableOpacity>
      </Modal>

      {/* Seed Config Modal */}
      <Modal
        visible={showSeedModal}
        onClose={() => setShowSeedModal(false)}
        title="Seed Configuration"
      >
        <Text style={styles.modalText}>
          This will initialize the remote configuration with default feature flags and game settings. Continue?
        </Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.textSecondary, marginRight: 8 }]}
            onPress={() => setShowSeedModal(false)}
          >
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, { marginLeft: 8 }]}
            onPress={handleSeedConfig}
            disabled={seedingConfig}
          >
            <Text style={styles.modalButtonText}>
              {seedingConfig ? 'Seeding...' : 'Seed'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingFlag(null);
          setEditingTest(null);
        }}
        title={editingFlag ? 'Edit Feature Flag' : 'Edit A/B Test'}
      >
        <View style={styles.formContainer}>
          <Text style={styles.formLabel}>Name</Text>
          <Text style={styles.formValue}>
            {editingFlag ? editingFlag.flagName : editingTest?.testName}
          </Text>

          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            style={styles.formInput}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter description"
            placeholderTextColor={colors.textSecondary}
            multiline
          />

          {editingFlag && (
            <>
              <Text style={styles.formLabel}>Rollout Percentage</Text>
              <TextInput
                style={styles.formInput}
                value={formData.rolloutPercentage.toString()}
                onChangeText={(text) => setFormData({ ...formData, rolloutPercentage: parseInt(text) || 0 })}
                placeholder="0-100"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </>
          )}

          {editingTest && (
            <>
              <Text style={styles.formLabel}>Variants (comma-separated)</Text>
              <TextInput
                style={styles.formInput}
                value={formData.variants.join(', ')}
                onChangeText={(text) => setFormData({ ...formData, variants: text.split(',').map(v => v.trim()) })}
                placeholder="control, variant_a, variant_b"
                placeholderTextColor={colors.textSecondary}
              />
            </>
          )}

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Enabled</Text>
            <Switch
              value={formData.isEnabled}
              onValueChange={(value) => setFormData({ ...formData, isEnabled: value })}
              trackColor={{ false: colors.backgroundAlt, true: colors.primary }}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.textSecondary, marginRight: 8 }]}
              onPress={() => {
                setShowEditModal(false);
                setEditingFlag(null);
                setEditingTest(null);
              }}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { marginLeft: 8 }]}
              onPress={handleSaveEdit}
            >
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={createType === 'flag' ? 'Create Feature Flag' : 'Create A/B Test'}
      >
        <View style={styles.formContainer}>
          <Text style={styles.formLabel}>Name</Text>
          <TextInput
            style={styles.formInput}
            value={createType === 'flag' ? formData.flagName : formData.testName}
            onChangeText={(text) => 
              createType === 'flag' 
                ? setFormData({ ...formData, flagName: text })
                : setFormData({ ...formData, testName: text })
            }
            placeholder={createType === 'flag' ? 'e.g., newFeature' : 'e.g., buttonColorTest'}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            style={styles.formInput}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter description"
            placeholderTextColor={colors.textSecondary}
            multiline
          />

          {createType === 'flag' && (
            <>
              <Text style={styles.formLabel}>Rollout Percentage</Text>
              <TextInput
                style={styles.formInput}
                value={formData.rolloutPercentage.toString()}
                onChangeText={(text) => setFormData({ ...formData, rolloutPercentage: parseInt(text) || 0 })}
                placeholder="0-100"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </>
          )}

          {createType === 'test' && (
            <>
              <Text style={styles.formLabel}>Variants (comma-separated)</Text>
              <TextInput
                style={styles.formInput}
                value={formData.variants.join(', ')}
                onChangeText={(text) => setFormData({ ...formData, variants: text.split(',').map(v => v.trim()) })}
                placeholder="control, variant_a, variant_b"
                placeholderTextColor={colors.textSecondary}
              />
            </>
          )}

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Enabled</Text>
            <Switch
              value={formData.isEnabled}
              onValueChange={(value) => setFormData({ ...formData, isEnabled: value })}
              trackColor={{ false: colors.backgroundAlt, true: colors.primary }}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.textSecondary, marginRight: 8 }]}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { marginLeft: 8 }]}
              onPress={handleCreate}
            >
              <Text style={styles.modalButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  seedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addButton: {
    padding: 4,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  flagInfo: {
    flex: 1,
    marginRight: 12,
  },
  flagName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  flagDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  flagStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  flagIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  testInfo: {
    flex: 1,
    marginRight: 12,
  },
  testActions: {
    alignItems: 'flex-end',
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  testVariant: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  testStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  configItem: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  configKey: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  configValue: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  formValue: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
});
