import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { Header } from '../components/Header';
import { orderService } from '../services/order.service';
import { formatPrice } from '../services/event.service';
import { useAuth } from '../context/AuthContext';

export const CheckoutScreen = ({ route, navigation }: any) => {
  const {
    eventId,
    categoryId,
    quantity,
    price,
    eventTitle,
    categoryName,
    location,
    poster,
  } = route.params;

  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<'MIDTRANS' | 'QRIS' | 'TRANSFER'>('MIDTRANS');
  const [autoVerifySandbox, setAutoVerifySandbox] = useState(true);
  const [loading, setLoading] = useState(false);

  const subtotal = Number(price) * Number(quantity);
  const adminFee = 5000;
  const grandTotal = subtotal + adminFee;

  const handlePayOrder = async () => {
    setLoading(true);
    try {
      const res = await orderService.createOrder({
        eventId,
        categoryId,
        quantity,
        paymentMethod: selectedMethod,
      });

      const ticketCode = res.ticketCode;

      // Jika user memilih auto-verify sandbox atau simulasi pembayaran instan
      if (autoVerifySandbox && ticketCode) {
        try {
          await orderService.simulateSandboxPayment(ticketCode);
        } catch (simErr) {
          console.warn('Gagal auto-verifikasi:', simErr);
        }
      }

      Alert.alert(
        'Pemesanan Berhasil!',
        `E-Tiket konser Anda dengan kode ${ticketCode} telah berhasil dibuat.${
          autoVerifySandbox ? ' Pembayaran telah diverifikasi LUNAS!' : ''
        }`,
        [
          {
            text: 'Lihat Tiket Saya',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { screen: 'MyTickets' } }],
              });
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Gagal Memesan', err.message || 'Terjadi kesalahan saat membuat pesanan tiket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        title="Konfirmasi Pesanan"
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Ringkasan Konser */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Ringkasan Tiket</Text>

          <Text style={styles.eventTitle}>{eventTitle}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{location || 'Indonesia'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Kategori Tiket</Text>
            <Text style={styles.valBold}>{categoryName}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Harga Satuan</Text>
            <Text style={styles.val}>{formatPrice(price)}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Jumlah Tiket</Text>
            <Text style={styles.val}>{quantity} Tiket</Text>
          </View>
        </View>

        {/* Data Pemesan */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Informasi Pembeli</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <Text style={styles.valBold}>{user?.name || '-'}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Email Konfirmasi</Text>
            <Text style={styles.val}>{user?.email || '-'}</Text>
          </View>
        </View>

        {/* Pilihan Metode Pembayaran */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Metode Pembayaran</Text>

          <TouchableOpacity
            onPress={() => setSelectedMethod('MIDTRANS')}
            style={[
              styles.methodOption,
              selectedMethod === 'MIDTRANS' && styles.methodOptionActive,
            ]}
          >
            <View style={styles.methodIcon}>
              <Ionicons name="card" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Midtrans Snap Gateway</Text>
              <Text style={styles.methodDesc}>GoPay, ShopeePay, Virtual Account, Kartu Kredit</Text>
            </View>
            <View style={[styles.radioCircle, selectedMethod === 'MIDTRANS' && styles.radioActive]} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedMethod('QRIS')}
            style={[
              styles.methodOption,
              selectedMethod === 'QRIS' && styles.methodOptionActive,
            ]}
          >
            <View style={styles.methodIcon}>
              <Ionicons name="qr-code" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>QRIS Dinamis</Text>
              <Text style={styles.methodDesc}>Scan QR instan dari semua aplikasi e-wallet</Text>
            </View>
            <View style={[styles.radioCircle, selectedMethod === 'QRIS' && styles.radioActive]} />
          </TouchableOpacity>

          {/* Opsi Sandbox Instant Verification */}
          <TouchableOpacity
            onPress={() => setAutoVerifySandbox(!autoVerifySandbox)}
            style={styles.sandboxBox}
          >
            <Ionicons
              name={autoVerifySandbox ? 'checkbox' : 'square-outline'}
              size={20}
              color={COLORS.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.sandboxTitle}>Simulasi Sandbox Langsung Lunas</Text>
              <Text style={styles.sandboxDesc}>
                Otomatis konfirmasi status PAID di backend untuk demo & pengujian
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Rincian Pembayaran */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Rincian Biaya</Text>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Subtotal Tiket</Text>
            <Text style={styles.val}>{formatPrice(subtotal)}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Biaya Layanan & Pajak</Text>
            <Text style={styles.val}>{formatPrice(adminFee)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Total Tagihan</Text>
            <Text style={styles.totalValue}>{formatPrice(grandTotal)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Total Tagihan</Text>
          <Text style={styles.bottomPrice}>{formatPrice(grandTotal)}</Text>
        </View>

        <TouchableOpacity
          onPress={handlePayOrder}
          disabled={loading}
          style={[styles.payBtn, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.payBtnText}>Konfirmasi & Bayar</Text>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  val: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  valBold: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 10,
    gap: 12,
  },
  methodOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBackground,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  methodDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
  },
  radioActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  sandboxBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 4,
  },
  sandboxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  sandboxDesc: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 2,
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
  bottomLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    ...SHADOWS.md,
  },
  payBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
