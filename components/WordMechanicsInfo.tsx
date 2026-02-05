
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal as RNModal,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface WordMechanicsInfoProps {
  visible: boolean;
  onClose: () => void;
}

export default function WordMechanicsInfo({ visible, onClose }: WordMechanicsInfoProps) {
  const [activeTab, setActiveTab] = useState<'length' | 'letters' | 'patterns' | 'categories'>('length');

  const lengthEffectsText = '3-4 letters: Standard placement with minor board interaction.\n\n5-6 letters: Trigger bonus puzzle effects like revealing tiles, shifting ownership, or weakening locks.\n\n7+ letters: Trigger major puzzle effects like unlocking vaults, rotating board sections, or large state changes.';
  
  const rareLettersText = 'Q, Z, X, J are rare letters with special powers:\n\n• Instantly break locked tiles\n• Amplify triggered puzzle effects\n• Allow limited rule exceptions\n\nUse these strategically to overcome obstacles!';
  
  const patternsText = 'Palindromes (e.g., LEVEL, RADAR):\n• Reverse a defined board region\n\nRepeated Letters (e.g., BOOK, LETTER):\n• Duplicate the previously triggered effect\n\nAll Vowels (e.g., AREA, IDEA):\n• Reveal fogged or hidden tiles';
  
  const categoriesText = 'Action Verbs (MOVE, ROTATE, SHIFT):\n• Move or rotate tiles on the board\n\nEmotion Words (HAPPY, SAD, LOVE):\n• Change tile ownership or state\n\nDirection Words (NORTH, SOUTH, EAST, WEST):\n• Shift rows or columns in that direction';

  const renderContent = () => {
    let contentText = '';
    let contentTitle = '';
    
    if (activeTab === 'length') {
      contentTitle = 'Word Length Effects';
      contentText = lengthEffectsText;
    } else if (activeTab === 'letters') {
      contentTitle = 'Rare Letter Effects';
      contentText = rareLettersText;
    } else if (activeTab === 'patterns') {
      contentTitle = 'Pattern Effects';
      contentText = patternsText;
    } else if (activeTab === 'categories') {
      contentTitle = 'Category Effects';
      contentText = categoriesText;
    }
    
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.contentTitle}>{contentTitle}</Text>
        <Text style={styles.contentText}>{contentText}</Text>
      </View>
    );
  };

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Word Mechanics Guide</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="close"
                size={28}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Words are strategic actions that manipulate the board
          </Text>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'length' && styles.tabActive]}
              onPress={() => setActiveTab('length')}
            >
              <Text style={[styles.tabText, activeTab === 'length' && styles.tabTextActive]}>
                Length
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'letters' && styles.tabActive]}
              onPress={() => setActiveTab('letters')}
            >
              <Text style={[styles.tabText, activeTab === 'letters' && styles.tabTextActive]}>
                Rare Letters
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'patterns' && styles.tabActive]}
              onPress={() => setActiveTab('patterns')}
            >
              <Text style={[styles.tabText, activeTab === 'patterns' && styles.tabTextActive]}>
                Patterns
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'categories' && styles.tabActive]}
              onPress={() => setActiveTab('categories')}
            >
              <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>
                Categories
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView}>
            {renderContent()}

            {/* Strategy Tip */}
            <View style={styles.tipContainer}>
              <View style={styles.tipHeader}>
                <IconSymbol
                  ios_icon_name="lightbulb.fill"
                  android_material_icon_name="lightbulb"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.tipTitle}>Strategy Tip</Text>
              </View>
              <Text style={styles.tipText}>
                Win by strategy and timing, not memorization. Word choice matters more than vocabulary size!
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButtonBottom} onPress={onClose}>
            <Text style={styles.closeButtonText}>Got It!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  contentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  tipContainer: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  closeButtonBottom: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
