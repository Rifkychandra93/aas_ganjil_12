import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { Header } from '../components/Header';
import { eventService, formatPrice } from '../services/event.service';
import { EventItem, TicketCategory } from '../types';
import { useAuth } from '../context/AuthContext';

export const EventDetailScreen = ({ route, navigation }: any) => {
  const { eventId } = route.params;
  const { user } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await eventService.getEventById(eventId);
        setEvent(data);
        const categories = data.ticketCategories || data.ticketTypes || [];
        if (categories.length > 0) {
          setSelectedCategory(categories[0]);
        }
      } catch (err: any) {
        Alert.alert('Pemberitahuan', err.message || 'Gagal memuat detail konser');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleProceedToCheckout = () => {
    if (!selectedCategory || !event) {
      Alert.alert('Perhatian', 'Silakan pilih kategori tiket terlebih dahulu.');
      return;
    }

    if (!user) {
      Alert.alert(
        'Login Diperlukan',
        'Anda harus masuk terlebih dahulu untuk melakukan pemesanan tiket.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Masuk Sekarang', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    navigation.navigate('Checkout', {
      eventId: event.id,
      categoryId: selectedCategory.id,
      quantity,
      price: selectedCategory.price,
      eventTitle: event.title,
      categoryName: selectedCategory.name,
      location: event.location,
      eventDate: event.eventDate,
      poster: event.poster || event.imageUrl,
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat detail konser...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
        <Text style={styles.notFoundText}>Konser tidak ditemukan</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categories = event.ticketCategories || event.ticketTypes || [];
  const totalPrice = (selectedCategory?.price || 0) * quantity;

  return (
    <View style={styles.container}>
      <Header
        showBack
        title="Detail Konser"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Gambar Poster Konser */}
        <View style={styles.posterContainer}>
          <Image
            source={{
              uri:
                event.poster ||
                event.imageUrl ||
                'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80',
            }}
            style={styles.posterImage}
          />
          <View style={styles.posterGradient} />
          <View style={styles.badgeOpen}>
            <Text style={styles.badgeOpenText}>TIKET TERSEDIA</Text>
          </View>
        </View>

        {/* Informasi Utama */}
        <View style={styles.mainInfo}>
          <Text style={styles.title}>{event.title}</Text>

          {event.artist?.name && (
            <View style={styles.artistPill}>
              <Ionicons name="mic-outline" size={14} color={COLORS.primary} />
              <Text style={styles.artistPillText}>{event.artist.name}</Text>
            </View>
          )}

          <View style={styles.metaCardsContainer}>
            <View style={styles.metaCard}>
              <Ionicons name="calendar" size={18} color={COLORS.primary} />
              <View>
                <Text style={styles.metaLabel}>WAKTU KONSER</Text>
                <Text style={styles.metaValue}>{event.formattedDate || 'Segera Hadir'}</Text>
              </View>
            </View>

            <View style={styles.metaCard}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <View>
                <Text style={styles.metaLabel}>LOKASI VENUE</Text>
                <Text style={styles.metaValue}>{event.location}</Text>
              </View>
            </View>
          </View>

          {/* Deskripsi */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Tentang Konser</Text>
            <Text style={styles.description}>
              {event.description ||
                'Saksikan penampilan luar biasa panggung megah konser musik terlengkap. Rasakan tata suara imersif dan visual memukau bersama ribuan penonton lainnya.'}
            </Text>
          </View>

          {/* Pilihan Kategori Tiket */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Pilih Kategori Tiket</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                const remaining =
                  cat.remainingQuota !== undefined ? cat.remainingQuota : cat.quota;
                const isAvailable = remaining > 0;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    disabled={!isAvailable}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardSelected,
                      !isAvailable && styles.categoryCardDisabled,
                    ]}
                  >
                    <View style={styles.categoryHeader}>
                      <Text
                        style={[
                          styles.categoryName,
                          isSelected && styles.categoryNameSelected,
                        ]}
                      >
                        {cat.name}
                      </Text>
                      <View
                        style={[
                          styles.quotaBadge,
                          isSelected && styles.quotaBadgeSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.quotaText,
                            isSelected && styles.quotaTextSelected,
                          ]}
                        >
                          Sisa {remaining}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.categoryPrice,
                        isSelected && styles.categoryPriceSelected,
                      ]}
                    >
                      {formatPrice(cat.price)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Pemilihan Jumlah Tiket */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Jumlah Tiket</Text>
            <View style={styles.quantityContainer}>
              <View>
                <Text style={styles.quantityTitle}>Maks. 5 tiket per pesanan</Text>
                <Text style={styles.quantitySubtitle}>
                  {selectedCategory?.name || 'Pilih kategori'}
                </Text>
              </View>

              <View style={styles.counterBox}>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={[styles.counterBtn, quantity <= 1 && styles.counterBtnDisabled]}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={18} color={quantity <= 1 ? COLORS.textMuted : COLORS.text} />
                </TouchableOpacity>

                <Text style={styles.counterValue}>{quantity}</Text>

                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.min(5, q + 1))}
                  style={[styles.counterBtn, quantity >= 5 && styles.counterBtnDisabled]}
                  disabled={quantity >= 5}
                >
                  <Ionicons name="add" size={18} color={quantity >= 5 ? COLORS.textMuted : COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total Pembayaran</Text>
          <Text style={styles.bottomTotalPrice}>{formatPrice(totalPrice)}</Text>
        </View>

        <TouchableOpacity
          onPress={handleProceedToCheckout}
          style={styles.checkoutBtn}
        >
          <Text style={styles.checkoutBtnText}>Lanjut Pesan</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  posterContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    backgroundColor: COLORS.borderLight,
  },
  posterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  posterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  badgeOpen: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeOpenText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainInfo: {
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    lineHeight: 28,
  },
  artistPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  artistPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  metaCardsContainer: {
    marginTop: 16,
    gap: 10,
  },
  metaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  section: {
    marginTop: 22,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  categoryGrid: {
    gap: 10,
  },
  categoryCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  categoryCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBackground,
  },
  categoryCardDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.borderLight,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  categoryNameSelected: {
    color: COLORS.primaryDark,
  },
  quotaBadge: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  quotaBadgeSelected: {
    backgroundColor: COLORS.primaryLightest,
  },
  quotaText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  quotaTextSelected: {
    color: COLORS.primaryDark,
  },
  categoryPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
  },
  categoryPriceSelected: {
    color: COLORS.primaryDark,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  quantitySubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  counterBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    opacity: 0.4,
  },
  counterValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    width: 32,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  bottomTotalPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    ...SHADOWS.md,
  },
  checkoutBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
