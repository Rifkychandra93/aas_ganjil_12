import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { Header } from '../components/Header';
import { EventCard } from '../components/EventCard';
import { ArtistCard } from '../components/ArtistCard';
import { eventService } from '../services/event.service';
import { EventItem, Artist } from '../types';

export const HomeScreen = ({ navigation }: any) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const GENRES = ['Semua', 'Pop Rock', 'Indie', 'Pop', 'Pop Idol', 'Folk'];

  const loadData = useCallback(async () => {
    try {
      const [fetchedEvents, fetchedArtists] = await Promise.all([
        eventService.getEvents(),
        eventService.getArtists(),
      ]);
      setEvents(fetchedEvents);
      setArtists(fetchedArtists);
    } catch (e) {
      console.warn('Gagal memuat data konser & artis:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Banner Hero / Promo */}
        <View style={styles.heroBanner}>
          <View style={styles.heroGlow} />
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={12} color="#FDE047" />
            <Text style={styles.heroBadgeText}>LIVE CONCERT 2026</Text>
          </View>
          <Text style={styles.heroTitle}>Rasakan Getaran Musik Favoritmu</Text>
          <Text style={styles.heroDesc}>
            Beli tiket konser musisi ternama Indonesia & dunia dengan mudah, aman, dan instan.
          </Text>
        </View>

        {/* Input Pencarian */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari konser, artis, atau kota..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Kategori Genre Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreList}
        >
          {GENRES.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <TouchableOpacity
                key={genre}
                onPress={() => setSelectedGenre(genre)}
                style={[styles.genrePill, isSelected && styles.genrePillActive]}
              >
                <Text
                  style={[styles.genreText, isSelected && styles.genreTextActive]}
                >
                  {genre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Artis Populer */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Artis Populer</Text>
            <Text style={styles.sectionSubtitle}>Musisi favorit yang sedang tur</Text>
          </View>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={artists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.artistList}
          renderItem={({ item }) => (
            <ArtistCard
              artist={item}
              onPress={() => {
                setSearchQuery(item.name);
              }}
            />
          )}
        />

        {/* Section Konser Mendatang */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View>
            <Text style={styles.sectionTitle}>Konser Mendatang</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredEvents.length} konser tersedia di Concertify
            </Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.syncBtn}>
            <Ionicons name="sync-outline" size={14} color={COLORS.primary} />
            <Text style={styles.syncBtnText}>Sinkron</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventsContainer}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Memuat konser terbaru...</Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="musical-notes-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Tidak ada konser ditemukan</Text>
              <Text style={styles.emptyDesc}>
                Coba kata kunci lain atau tarik ke bawah untuk memperbarui daftar.
              </Text>
            </View>
          ) : (
            filteredEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onPress={() => navigation.navigate('EventDetail', { eventId: evt.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroBanner: {
    margin: 16,
    padding: 20,
    borderRadius: 22,
    backgroundColor: COLORS.primaryDark,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  heroGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.35,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
    lineHeight: 28,
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  genreList: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  genrePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  genrePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genreText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  genreTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.primaryBackground,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  artistList: {
    paddingHorizontal: 16,
  },
  eventsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
