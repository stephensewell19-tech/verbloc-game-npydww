
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Modal } from '@/components/button';

export default function WordMechanicsInfo() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.infoButton}
        onPress={() => setShowModal(true)}
      >
        <IconSymbol
          ios_icon_name="info.circle"
          android_material_icon_name="info"
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        title="Word Mechanics Guide"
        message=""
        onClose={() => setShowModal(false)}
        type="info"
      >
        <ScrollView style={styles.modalContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Word Length Effects</Text>
            
            <View style={styles.effectItem}>
              <Text style={styles.effectLabel}>3-4 Letters</Text>
              <Text style={styles.effectDescription}>
                Standard placement with minor board interaction
              </Text>
            </View>
            
            <View style={styles.effectItem}>
              <Text style={styles.effectLabel}>5-6 Letters</Text>
              <Text style={styles.effectDescription}>
                Bonus effect: reveal tiles, shift ownership, weaken locks
              </Text>
            </View>
            
            <View style={styles.effectItem}>
              <Text style={styles.effectLabel}>7+ Letters</Text>
              <Text style={styles.effectDescription}>
                Major effect: unlock vaults, rotate board sections, large state changes
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rare Letter Effects</Text>
            <Text style={styles.sectionSubtitle}>Q, Z, X, J</Text>
            
            <View style={styles.effectItem}>
              <Text style={styles.effectDescription}>
                • Instantly break locked tiles
              </Text>
              <Text style={styles.effectDescription}>
                • Amplify triggered puzzle effects
              </Text>
              <Text style={styles.effectDescription}>
                • Allow limited rule exceptions
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pattern Effects</Text>
            
            <View style={styles.effectItem}>
              <Text style={styles.effectLabel}>Palindromes</Text>
              <Text style={styles.effectDescription}>
                Reverse a defined board region (e.g., LEVEL, RADAR)
              </Text>
            </View>
            
            <View style={styles.effectItem}>
              <Text style={styles.effectLabel}>Repeated Letters</Text>
              <Text style={styles.effectDescription}>
                Duplicate the previously triggered effect (e.g., BOOK, HAPPY)
              </Text>
            </View>
            
            <View style={styles.effectItem}>
              <Text style={styles.effectLabel}>All Vowels</Text>
              <Text style={styles.effectDescription}>
                Reveal fogged or hidden tiles (e.g., AREA, IDEA)
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Effects</Text>
            
            <View style={styles.effectItem}>
              <Text style={styles.effectLabel}>Action Verbs</Text>
              <Text style={styles.effectDescription}>
                Move or rotate tiles (e.g., MOVE, ROTATE, SHIFT, BREAK)
              </Text>
            </View>
            
            <View style={styles.effectItem}>
              <Text style={styles.effectLabel}>Emotion Words</Text>
              <Text style={styles.effectDescription}>
                Change tile ownership or state (e.g., HAPPY, LOVE, FEAR)
              </Text>
            </View>
            
            <View style={styles.effectItem}>
              <Text style={styles.effectLabel}>Direction Words</Text>
              <Text style={styles.effectDescription}>
                Shift rows or columns (e.g., NORTH, SOUTH, EAST, WEST)
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Balance Rules</Text>
            
            <View style={styles.effectItem}>
              <Text style={styles.effectDescription}>
                • Only ONE major effect per turn
              </Text>
              <Text style={styles.effectDescription}>
                • Chain reactions limited to a single level
              </Text>
              <Text style={styles.effectDescription}>
                • No single word can instantly end a match
              </Text>
              <Text style={styles.effectDescription}>
                • Trailing players receive slightly improved letter draws
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strategy Tips</Text>
            
            <View style={styles.effectItem}>
              <Text style={styles.effectDescription}>
                • Plan ahead: longer words trigger more powerful effects
              </Text>
              <Text style={styles.effectDescription}>
                • Use rare letters strategically to break locks
              </Text>
              <Text style={styles.effectDescription}>
                • Palindromes can reverse unfavorable board states
              </Text>
              <Text style={styles.effectDescription}>
                • Direction words help you control board flow
              </Text>
              <Text style={styles.effectDescription}>
                • Repeated letters let you duplicate powerful effects
              </Text>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  infoButton: {
    padding: 8,
  },
  modalContent: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  effectItem: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  effectLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  effectDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
