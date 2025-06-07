import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from './Button';
import { Card } from './Card';
import { colors, spacing, typography } from '../theme';
import type { CreateTaskInput } from '@gofer/api-client';

export interface CreateTaskFormProps {
  onSubmit: (task: CreateTaskInput) => Promise<void>;
  isLoading?: boolean;
}

export function CreateTaskForm({ onSubmit, isLoading }: CreateTaskFormProps) {
  const [formData, setFormData] = useState<Partial<CreateTaskInput>>({
    category: 'OTHER',
    budget: { currency: 'USD', amount: 0 },
  });
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.location) {
      // TODO: Show validation error
      return;
    }

    await onSubmit({
      ...formData,
      images,
    } as CreateTaskInput);
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card title="Create New Task">
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you need help with?"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide details about your task"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          {/* TODO: Add category picker component */}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Budget</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flex1]}
              placeholder="Amount"
              keyboardType="numeric"
              value={formData.budget?.amount.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  budget: { ...formData.budget!, amount: parseFloat(text) || 0 },
                })
              }
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Images</Text>
          <Button
            variant="outline"
            onPress={handleImagePick}
            leftIcon={<Text>📷</Text>}
          >
            Add Images
          </Button>
        </View>

        <View style={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            Create Task
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 6,
    padding: spacing.sm,
    fontSize: typography.fontSizes.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  actions: {
    marginTop: spacing.xl,
  },
});
