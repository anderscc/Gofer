import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SearchBar from '../../../components/ui/SearchBar';
import Section from '../../../components/ui/Section';

import CategoryCard from '../../../components/ui/cards/CategoryCard';
import TaskCard from '../../../components/ui/cards/TaskCard';
import ProviderCard from '../../../components/ui/cards/ProviderCard';
import Button from '../../../components/ui/buttons/Button';
import { 
  serviceCategories,
  popularTasks,
  topTaskProviders,
} from '../../../data/mockData';
import { colors, spacing, typography, shadows } from '../../../constants/theme';

const HomeScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, James</Text>
            <Text style={styles.headerText}>What can we help you with today?</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation?.navigate('Profile')}
          >
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <SearchBar 
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFilterPress={() => navigation?.navigate('Filters')}
          />
        </View>
        
        {/* Hero Section */}
        <TouchableOpacity 
          style={styles.heroContainer}
          activeOpacity={0.9}
          onPress={() => navigation?.navigate('TaskCreate')}
        >
          <LinearGradient
            colors={['#4E7DF1', '#8A62F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Need something done?</Text>
              <Text style={styles.heroDescription}>
                Post a task and get instant help from qualified taskers
              </Text>
              <Button 
                title="Post a Task" 
                onPress={() => navigation?.navigate('TaskCreate')}
                variant="outlined"
                size="small"
                style={styles.heroButton}
                textStyle={styles.heroButtonText}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Categories Section */}
        <Section title="Categories">
          <FlatList
            data={serviceCategories}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
            renderItem={({ item }) => (
              <CategoryCard 
                category={item} 
                onPress={() => navigation?.navigate('CategoryDetails', { category: item })}
              />
            )}
          />
        </Section>
        
        {/* Popular Tasks Section */}
        <Section 
          title="Popular Tasks" 
          onSeeAll={() => navigation?.navigate('PopularTasks')}
        >
          <FlatList
            data={popularTasks}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tasksContainer}
            renderItem={({ item }) => (
              <TaskCard 
                task={item} 
                onPress={() => navigation?.navigate('TaskDetails', { task: item })}
              />
            )}
          />
        </Section>
        
        {/* Top Taskers Section */}
        <Section 
          title="Top Taskers"
          onSeeAll={() => navigation?.navigate('TopTaskers')}
        >
          <FlatList
            data={topTaskProviders}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.providersContainer}
            renderItem={({ item }) => (
              <ProviderCard 
                provider={item} 
                onPress={() => navigation?.navigate('ProviderProfile', { provider: item })}
              />
            )}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  headerText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...shadows.sm,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  searchBarContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  heroContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  heroGradient: {
    width: '100%',
    height: 160,
  },
  heroContent: {
    padding: spacing.lg,
    height: '100%',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.background,
    marginBottom: spacing.xs,
  },
  heroDescription: {
    fontSize: typography.fontSize.md,
    color: colors.background,
    opacity: 0.9,
    marginBottom: spacing.md,
    width: '80%',
  },
  heroButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: colors.background,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: colors.background,
  },
  categoriesContainer: {
    paddingLeft: spacing.md,
  },
  tasksContainer: {
    paddingLeft: spacing.md,
  },
  providersContainer: {
    paddingLeft: spacing.md,
  },
});

export default HomeScreen;
