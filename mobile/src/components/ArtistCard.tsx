import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { Artist } from '../types';

interface ArtistCardProps {
  artist: Artist;
  isSelected?: boolean;
  onPress?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  isSelected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
      ]}
    >
      <View style={[styles.imageWrapper, isSelected && styles.selectedImageWrapper]}>
        <Image
          source={{
            uri:
              artist.photo ||
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
          }}
          style={styles.image}
        />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {artist.name}
      </Text>
      <Text style={styles.genre} numberOfLines={1}>
        {artist.genre || 'Artis Konser'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 86,
    marginRight: 14,
  },
  selectedContainer: {
    transform: [{ scale: 1.05 }],
  },
  imageWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  selectedImageWrapper: {
    borderColor: COLORS.primary,
    borderWidth: 2.5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: COLORS.borderLight,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 6,
    textAlign: 'center',
  },
  genre: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 1,
  },
});
