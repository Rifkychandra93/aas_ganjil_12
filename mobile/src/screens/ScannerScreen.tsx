import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { Header } from '../components/Header';
import { orderService } from '../services/order.service';
import { formatEventDate } from '../services/event.service';
import { useAuth } from '../context/AuthContext';

export const ScannerScreen = () => {
  const { user } = useAuth();
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScanTicket = async (codeToVerify?: string) => {
    const code = (codeToVerify || ticketInput).trim();
    if (!code) {
      setErrorMsg('Masukkan kode tiket atau scan QR terlebih dahulu');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setScanResult(null);

    try {
      const res = await orderService.scanTicket(code);
      setScanResult(res);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Tiket tidak valid atau tidak ditemukan';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Scanner Tiket Konser" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Ionicons name="scan-circle" size={40} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Pemeriksaan Tiket Pintu Masuk</Text>
            <Text style={styles.bannerDesc}>
              Validasi keabsahan tiket penonton konser secara instan & aman.
            </Text>
          </View>
        </View>

        {/* Input Kode Tiket */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verifikasi Kode Tiket</Text>
          <Text style={styles.cardDesc}>
            Ketik atau tempel kode tiket penonton (contoh: TIK-XXXXXX)
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Masukkan Kode Tiket..."
              placeholderTextColor={COLORS.textMuted}
              value={ticketInput}
              onChangeText={(text) => {
                setTicketInput(text);
                setErrorMsg('');
              }}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              onPress={() => handleScanTicket()}
              disabled={loading}
              style={[styles.verifyBtn, loading && { opacity: 0.6 }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="search" size={18} color={COLORS.white} />
              )}
            </TouchableOpacity>
          </View>

          {errorMsg.length > 0 && (
            <View style={styles.errorBox}>
              <Ionicons name="close-circle" size={18} color={COLORS.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}
        </View>

        {/* Hasil Scan Tiket */}
        {scanResult && (
          <View style={styles.resultCard}>
            <View
              style={[
                styles.resultStatusBadge,
                {
                  backgroundColor: scanResult.success ? COLORS.successLight : COLORS.dangerLight,
                  borderColor: scanResult.success ? COLORS.successBorder : COLORS.dangerBorder,
                },
              ]}
            >
              <Ionicons
                name={scanResult.success ? 'checkmark-circle' : 'alert-circle'}
                size={22}
                color={scanResult.success ? COLORS.success : COLORS.danger}
              />
              <Text
                style={[
                  styles.resultStatusText,
                  { color: scanResult.success ? COLORS.success : COLORS.danger },
                ]}
              >
                {scanResult.message || (scanResult.success ? 'TIKET VALID & DITERIMA' : 'TIKET TIDAK VALID')}
              </Text>
            </View>

            {scanResult.data && (
              <View style={styles.resultDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Kode Tiket</Text>
                  <Text style={styles.detailValBold}>{scanResult.data.ticketCode}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Konser</Text>
                  <Text style={styles.detailVal}>{scanResult.data.eventTitle || 'Konser Musik'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Kategori</Text>
                  <Text style={styles.detailVal}>{scanResult.data.categoryName || '-'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status Tiket</Text>
                  <Text
                    style={[
                      styles.detailValBold,
                      { color: scanResult.data.status === 'PAID' ? COLORS.success : COLORS.primary },
                    ]}
                  >
                    {scanResult.data.status}
                  </Text>
                </View>

                {scanResult.data.eventDate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tanggal</Text>
                    <Text style={styles.detailVal}>{formatEventDate(scanResult.data.eventDate)}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Petunjuk Guard */}
        <View style={styles.hintBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.hintText}>
            Petugas pemeriksa hanya mengizinkan tiket dengan status LUNAS (PAID) untuk memasuki area konser. Tiket yang sudah pernah di-scan otomatis berganti status menjadi SUDAH DIGUNAKAN (USED).
          </Text>
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
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    ...SHADOWS.sm,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  bannerDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  verifyBtn: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerLight,
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
    flex: 1,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  resultStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 14,
  },
  resultStatusText: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  resultDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailValBold: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  hintBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.primaryBackground,
    padding: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 18,
  },
});
