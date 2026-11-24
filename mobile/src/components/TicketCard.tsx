import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { StatusBadge } from './StatusBadge';
import { TicketOrder } from '../types';
import { formatEventDate, formatPrice } from '../services/event.service';

interface TicketCardProps {
  ticket: TicketOrder;
  onPressDetail: () => void;
  onPay?: () => void;
  onSimulatePay?: () => void;
  onVerify?: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onPressDetail,
  onPay,
  onSimulatePay,
  onVerify,
}) => {
  const isPaid = ticket.status === 'PAID' || ticket.status === 'USED';
  const isPending = ticket.status === 'PENDING';

  return (
    <View style={styles.card}>
      {/* Bagian Atas Tiket */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View style={styles.codeContainer}>
            <Ionicons name="pricetag-outline" size={13} color={COLORS.primary} />
            <Text style={styles.ticketCode}>{ticket.ticketCode}</Text>
          </View>
          <StatusBadge status={ticket.status} />
        </View>

        <Text style={styles.eventTitle}>{ticket.eventTitle}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{formatEventDate(ticket.eventDate)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{ticket.location || 'Indonesia Arena'}</Text>
        </View>
      </View>

      {/* Garis Perforasi Tiket Konser */}
      <View style={styles.perforationWrapper}>
        <View style={styles.notchLeft} />
        <View style={styles.dashedLine} />
        <View style={styles.notchRight} />
      </View>

      {/* Bagian Bawah Tiket */}
      <View style={styles.bottomSection}>
        <View style={styles.categoryRow}>
          <View>
            <Text style={styles.detailLabel}>KATEGORI</Text>
            <Text style={styles.detailValue}>{ticket.categoryName}</Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.detailLabel}>TOTAL BIAYA</Text>
            <Text style={styles.priceValue}>{formatPrice(ticket.totalPrice)}</Text>
          </View>
        </View>

        {/* Tombol Aksi */}
        <View style={styles.actionsContainer}>
          {isPaid ? (
            <TouchableOpacity
              onPress={onPressDetail}
              style={[styles.btn, styles.btnPrimary]}
            >
              <Ionicons name="qr-code-outline" size={16} color={COLORS.white} />
              <Text style={styles.btnPrimaryText}>Tampilkan E-Tiket & Barcode</Text>
            </TouchableOpacity>
          ) : isPending ? (
            <View style={styles.pendingActionGrid}>
              {onSimulatePay && (
                <TouchableOpacity
                  onPress={onSimulatePay}
                  style={[styles.btn, styles.btnSuccess]}
                >
                  <Ionicons name="flash-outline" size={15} color={COLORS.white} />
                  <Text style={styles.btnSuccessText}>Simulasi Bayar Cepat</Text>
                </TouchableOpacity>
              )}

              <View style={styles.secondaryActions}>
                {onPay && (
                  <TouchableOpacity
                    onPress={onPay}
                    style={[styles.btn, styles.btnOutline]}
                  >
                    <Ionicons name="card-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.btnOutlineText}>Bayar Midtrans</Text>
                  </TouchableOpacity>
                )}

                {onVerify && (
                  <TouchableOpacity
                    onPress={onVerify}
                    style={[styles.btn, styles.btnLight]}
                  >
                    <Ionicons name="refresh-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.btnLightText}>Cek Status</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={onPressDetail}
              style={[styles.btn, styles.btnLight]}
            >
              <Text style={styles.btnLightText}>Detail Pesanan</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  topSection: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primaryBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ticketCode: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  perforationWrapper: {
    position: 'relative',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notchLeft: {
    position: 'absolute',
    left: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  notchRight: {
    position: 'absolute',
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  dashedLine: {
    width: '85%',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bottomSection: {
    padding: 16,
    paddingTop: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  actionsContainer: {
    marginTop: 4,
  },
  pendingActionGrid: {
    gap: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  btnSuccess: {
    backgroundColor: COLORS.success,
  },
  btnSuccessText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  btnOutlineText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  btnLight: {
    flex: 1,
    backgroundColor: COLORS.borderLight,
  },
  btnLightText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
