import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, serverUrl, updateServerUrl, logout } = useAuth();
  const [customUrl, setCustomUrl] = useState(serverUrl);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');

  const handleSaveServerUrl = async () => {
    if (!customUrl.trim()) {
      Alert.alert('Perhatian', 'URL Server tidak boleh kosong.');
      return;
    }

    try {
      await updateServerUrl(customUrl);
      Alert.alert('Berhasil', 'URL Server backend berhasil diperbarui.');
      testConnection();
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal menyimpan URL server.');
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('IDLE');
    try {
      const res = await api.get('/events');
      if (res.status === 200) {
        setConnectionStatus('SUCCESS');
        Alert.alert('Koneksi Berhasil!', 'Aplikasi mobile berhasil terhubung langsung ke backend Concertify.');
      } else {
        setConnectionStatus('FAILED');
      }
    } catch (err: any) {
      setConnectionStatus('FAILED');
      Alert.alert(
        'Koneksi Gagal',
        `Tidak dapat menghubungi backend di ${serverUrl}.\nPastikan backend sedang berjalan dan perangkat berada dalam satu jaringan Wi-Fi.`
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Akun & Pengaturan" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        {user ? (
          <View style={styles.userCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={12} color={COLORS.primaryDark} />
                <Text style={styles.roleText}>{user.role || 'CUSTOMER'}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <Ionicons name="person-circle-outline" size={50} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.guestTitle}>Mode Tamu</Text>
              <Text style={styles.guestDesc}>Masuk untuk menikmati pengalaman penuh memesan konser.</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginBtnSmall}
            >
              <Text style={styles.loginBtnSmallText}>Masuk</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Server & Backend Configuration (PENTING untuk kelancaran koneksi) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="server-outline" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Koneksi Backend Server</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Aplikasi terhubung ke backend Concertify yang sama dengan website.
          </Text>

          <View style={styles.urlInputBox}>
            <TextInput
              style={styles.urlInput}
              value={customUrl}
              onChangeText={setCustomUrl}
              placeholder="http://192.168.1.19:5000/api"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.serverActionRow}>
            <TouchableOpacity
              onPress={testConnection}
              disabled={testingConnection}
              style={[styles.btnOutline, testingConnection && { opacity: 0.6 }]}
            >
              {testingConnection ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Ionicons name="pulse" size={16} color={COLORS.primary} />
                  <Text style={styles.btnOutlineText}>Uji Sambungan</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSaveServerUrl} style={styles.btnSolid}>
              <Ionicons name="save-outline" size={16} color={COLORS.white} />
              <Text style={styles.btnSolidText}>Simpan URL</Text>
            </TouchableOpacity>
          </View>

          {connectionStatus === 'SUCCESS' && (
            <View style={styles.statusBannerSuccess}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.statusSuccessText}>Terkoneksi Aktif dengan Backend (Online)</Text>
            </View>
          )}

          {connectionStatus === 'FAILED' && (
            <View style={styles.statusBannerFailed}>
              <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
              <Text style={styles.statusFailedText}>Gagal Terhubung ke Backend (Offline)</Text>
            </View>
          )}
        </View>

        {/* Menu Pilihan */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderLabel}>TENTANG APLIKASI</Text>

          <View style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.menuLabel}>Versi Aplikasi</Text>
            <Text style={styles.menuValue}>Concertify Mobile v1.0.0</Text>
          </View>

          <View style={styles.menuItem}>
            <Ionicons name="sync" size={20} color={COLORS.textSecondary} />
            <Text style={styles.menuLabel}>Sinkronisasi Web</Text>
            <Text style={[styles.menuValue, { color: COLORS.success }]}>Aktif</Text>
          </View>
        </View>

        {/* Logout Button */}
        {user && (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
            <Text style={styles.logoutText}>Keluar dari Akun</Text>
          </TouchableOpacity>
        )}
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
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
    ...SHADOWS.sm,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  guestCard: {
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
  guestTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  guestDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  loginBtnSmall: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  loginBtnSmallText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 12,
    lineHeight: 16,
  },
  urlInputBox: {
    marginBottom: 12,
  },
  urlInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 13,
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  serverActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: 6,
  },
  btnOutlineText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  btnSolid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    gap: 6,
  },
  btnSolidText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  statusBannerSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.successLight,
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  statusSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  statusBannerFailed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerLight,
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  statusFailedText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  sectionHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 10,
  },
  menuLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
});
