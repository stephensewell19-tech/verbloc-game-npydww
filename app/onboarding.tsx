
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  androidIcon: string;
  color: string;
  details: string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to VERBLOC',
    description: 'A social word puzzle game where every word changes the board',
    icon: 'sparkles',
    androidIcon: 'auto-awesome',
    color: colors.primary,
    details: [
      'Form words from adjacent tiles',
      'Each word transforms the puzzle',
      'Strategic gameplay meets word mastery',
    ],
  },
  {
    id: 2,
    title: 'Word Mechanics',
    description: 'Your words have power - they actively change the game board',
    icon: 'wand.and.stars',
    androidIcon: 'psychology',
    color: colors.secondary,
    details: [
      'Palindromes reverse nearby tiles',
      'Rare letters unlock special effects',
      'Action verbs shift rows and columns',
      'Plan your moves strategically',
    ],
  },
  {
    id: 3,
    title: 'Multiple Game Modes',
    description: 'Play solo, challenge friends, or compete in daily events',
    icon: 'gamecontroller.fill',
    androidIcon: 'sports-esports',
    color: colors.highlight,
    details: [
      'Solo Mode: Practice and master puzzles',
      'Multiplayer: Turn-based battles',
      'Daily Challenges: Compete globally',
      'Special Events: Limited-time puzzles',
    ],
  },
  {
    id: 4,
    title: 'Progression System',
    description: 'Level up, earn XP, and unlock achievements',
    icon: 'star.fill',
    androidIcon: 'star',
    color: colors.accent,
    details: [
      'Earn XP from every game',
      'Level up to unlock rewards',
      'Maintain daily streaks',
      'Climb the leaderboards',
    ],
  },
  {
    id: 5,
    title: 'Ready to Play!',
    description: 'Start your VERBLOC journey and become a word master',
    icon: 'flag.checkered',
    androidIcon: 'flag',
    color: colors.success,
    details: [
      'All difficulties available from start',
      'Free to play with optional premium',
      'No pay-to-win mechanics',
      'Join thousands of players worldwide',
    ],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({
        x: nextStep * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleFinish();
  };

  const handleFinish = async () => {
    console.log('[Onboarding] User completed onboarding');
    const { markOnboardingComplete } = await import('@/utils/onboarding');
    await markOnboardingComplete();
    router.replace('/(tabs)');
  };

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const progressPercentage = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <LinearGradient
          colors={[colors.background, colors.backgroundAlt]}
          style={styles.gradient}
        >
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                entering={FadeIn}
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: step.color,
                  },
                ]}
              />
            </View>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
          >
            {ONBOARDING_STEPS.map((stepItem, index) => (
              <View key={stepItem.id} style={styles.stepContainer}>
                {index === currentStep && (
                  <Animated.View
                    entering={SlideInRight}
                    exiting={SlideOutLeft}
                    style={styles.stepContent}
                  >
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: stepItem.color }]}>
                      <IconSymbol
                        ios_icon_name={stepItem.icon}
                        android_material_icon_name={stepItem.androidIcon}
                        size={80}
                        color="#FFFFFF"
                      />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{stepItem.title}</Text>

                    {/* Description */}
                    <Text style={styles.description}>{stepItem.description}</Text>

                    {/* Details */}
                    <View style={styles.detailsContainer}>
                      {stepItem.details.map((detail, detailIndex) => (
                        <Animated.View
                          key={detailIndex}
                          entering={FadeIn.delay(detailIndex * 100)}
                          style={styles.detailItem}
                        >
                          <View style={[styles.detailBullet, { backgroundColor: stepItem.color }]} />
                          <Text style={styles.detailText}>{detail}</Text>
                        </Animated.View>
                      ))}
                    </View>
                  </Animated.View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Navigation Dots */}
          <View style={styles.dotsContainer}>
            {ONBOARDING_STEPS.map((_, index) => {
              const isActive = index === currentStep;
              const dotColor = isActive ? step.color : colors.textSecondary;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: dotColor,
                      width: isActive ? 24 : 8,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[step.color, step.color + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? "Let's Play!" : 'Next'}
              </Text>
              <IconSymbol
                ios_icon_name={isLastStep ? 'play.fill' : 'chevron.right'}
                android_material_icon_name={isLastStep ? 'play-arrow' : 'chevron-right'}
                size={24}
                color="#FFFFFF"
              />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  detailsContainer: {
    width: '100%',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detailText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    marginHorizontal: 32,
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
