import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { Header } from '../components/Header';
import { TicketCard } from '../components/TicketCard';
import { StatusBadge } from '../components/StatusBadge';
import { orderService } from '../services/order.service';
import { formatEventDate, formatPrice } from '../services/event.service';
import { TicketOrder } from '../types';
import { useAuth } from '../context/AuthContext';

export const MyTicketsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'semua' | 'akan-datang' | 'selesai' | 'dibatalkan'>('semua');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketOrder | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await orderService.getMyOrders();
      setTickets(data);
    } catch (e: any) {
      console.warn('Gagal memuat tiket:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const handleSimulatePay = async (ticketCode: string) => {
    try {
      const res = await orderService.simulateSandboxPayment(ticketCode);
      Alert.alert('Sukses', res.message || 'Pembayaran berhasil dikonfirmasi! E-tiket Anda kini aktif.');
      fetchTickets();
    } catch (err: any) {
      Alert.alert('Pemberitahuan', err.message || 'Gagal memproses simulasi pembayaran.');
    }
  };

  const handleVerify = async (ticketCode: string) => {
    try {
      const res = await orderService.verifyPayment(ticketCode);
      Alert.alert('Status Terkini', res.message || 'Pemeriksaan status berhasil.');
      fetchTickets();
    } catch (err: any) {
      Alert.alert('Pemeriksaan Gagal', err.message || 'Gagal memeriksa status pembayaran.');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === 'akan-datang') {
      return t.status === 'PAID' || t.status === 'PENDING';
    }
    if (activeTab === 'selesai') {
      return t.status === 'USED';
    }
    if (activeTab === 'dibatalkan') {
      return t.status === 'CANCELLED';
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <Header
        title="Tiket Saya"
        rightAction={
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      {/* Tabs Filter */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('semua')}
          style={[styles.tabItem, activeTab === 'semua' && styles.tabItemActive]}
        >
          <Text style={[styles.tabText, activeTab === 'semua' && styles.tabTextActive]}>
            Semua ({tickets.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('akan-datang')}
          style={[styles.tabItem, activeTab === 'akan-datang' && styles.tabItemActive]}
        >
          <Text style={[styles.tabText, activeTab === 'akan-datang' && styles.tabTextActive]}>
            Aktif
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('selesai')}
          style={[styles.tabItem, activeTab === 'selesai' && styles.tabItemActive]}
        >
          <Text style={[styles.tabText, activeTab === 'selesai' && styles.tabTextActive]}>
            Selesai
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('dibatalkan')}
          style={[styles.tabItem, activeTab === 'dibatalkan' && styles.tabItemActive]}
        >
          <Text style={[styles.tabText, activeTab === 'dibatalkan' && styles.tabTextActive]}>
            Batal
          </Text>
        </TouchableOpacity>
      </View>

      {!user ? (
        <View style={styles.centerBox}>
          <Ionicons name="lock-closed-outline" size={54} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>Silakan Masuk Terlebih Dahulu</Text>
          <Text style={styles.emptyDesc}>
            Masuk dengan akun pembeli untuk melihat e-tiket konser Anda.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.actionBtn}
          >
            <Text style={styles.actionBtnText}>Masuk ke Akun</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat tiket konser Anda...</Text>
        </View>
      ) : filteredTickets.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="ticket-outline" size={54} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Belum Ada Tiket</Text>
          <Text style={styles.emptyDesc}>
            {activeTab === 'semua'
              ? 'Anda belum memesan tiket konser apapun. Temukan konser favorit Anda di beranda!'
              : `Tidak ada tiket dalam kategori ${activeTab}.`}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.actionBtn}
          >
            <Text style={styles.actionBtnText}>Jelajahi Konser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.id || item.ticketCode}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <TicketCard
              ticket={item}
              onPressDetail={() => setSelectedTicket(item)}
              onSimulatePay={() => handleSimulatePay(item.ticketCode)}
              onVerify={() => handleVerify(item.ticketCode)}
            />
          )}
        />
      )}

      {/* MODAL E-TIKET LENGKAP DENGAN QR CODE & BARCODE */}
      <Modal
        visible={!!selectedTicket}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTicket(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalBrand}>
                <Ionicons name="ticket" size={20} color={COLORS.primary} />
                <Text style={styles.modalBrandText}>E-TIKET RESMI CONCERTIFY</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedTicket(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              {selectedTicket && (
                <>
                  <Text style={styles.modalEventTitle}>{selectedTicket.eventTitle}</Text>
                  <View style={{ alignSelf: 'center', marginBottom: 16 }}>
                    <StatusBadge status={selectedTicket.status} />
                  </View>

                  {/* KOTAK KODE & QR/BARCODE */}
                  <View style={styles.qrContainer}>
                    <Text style={styles.qrLabel}>SCAN DI PINTU MASUK (VENUE)</Text>
                    {selectedTicket.qrCode && selectedTicket.qrCode.startsWith('data:image') ? (
                      <Image
                        source={{ uri: selectedTicket.qrCode }}
                        style={styles.qrImage}
                      />
                    ) : (
                      <View style={styles.qrPlaceholder}>
                        <Ionicons name="qr-code" size={130} color={COLORS.text} />
                      </View>
                    )}

                    <Text style={styles.qrTicketCode}>{selectedTicket.ticketCode}</Text>
                    <Text style={styles.qrHint}>Tunjukkan kode ini kepada petugas scanner konser</Text>
                  </View>

                  {/* DETAIL INFORMASI */}
                  <View style={styles.ticketDetailBox}>
                    <View style={styles.ticketDetailRow}>
                      <Text style={styles.detailTitle}>Kategori</Text>
                      <Text style={styles.detailContent}>{selectedTicket.categoryName}</Text>
                    </View>

                    <View style={styles.ticketDetailRow}>
                      <Text style={styles.detailTitle}>Jumlah</Text>
                      <Text style={styles.detailContent}>{selectedTicket.quantity} Tiket</Text>
                    </View>

                    <View style={styles.ticketDetailRow}>
                      <Text style={styles.detailTitle}>Tanggal Konser</Text>
                      <Text style={styles.detailContent}>{formatEventDate(selectedTicket.eventDate)}</Text>
                    </View>

                    <View style={styles.ticketDetailRow}>
                      <Text style={styles.detailTitle}>Lokasi</Text>
                      <Text style={styles.detailContent}>{selectedTicket.location || 'Indonesia Arena'}</Text>
                    </View>

                    <View style={styles.ticketDetailRow}>
                      <Text style={styles.detailTitle}>Total Bayar</Text>
                      <Text style={[styles.detailContent, { color: COLORS.primary, fontWeight: '900' }]}>
                        {formatPrice(selectedTicket.totalPrice)}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 14,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalBrandText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalEventTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  qrContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  qrLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  qrImage: {
    width: 170,
    height: 170,
    resizeMode: 'contain',
    backgroundColor: COLORS.white,
    padding: 8,
    borderRadius: 12,
  },
  qrPlaceholder: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  qrTicketCode: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 1.5,
    marginTop: 12,
  },
  qrHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  ticketDetailBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailContent: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
});
