import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bg = COLORS.warningLight;
  let text = COLORS.warning;
  let border = COLORS.warningBorder;
  let label = 'PENDING';

  const s = (status || '').toUpperCase();

  if (s === 'PAID') {
    bg = COLORS.successLight;
    text = COLORS.success;
    border = COLORS.successBorder;
    label = 'LUNAS (PAID)';
  } else if (s === 'USED') {
    bg = COLORS.infoLight;
    text = COLORS.info;
    border = COLORS.infoBorder;
    label = 'SUDAH DIGUNAKAN';
  } else if (s === 'CANCELLED') {
    bg = COLORS.dangerLight;
    text = COLORS.danger;
    border = COLORS.dangerBorder;
    label = 'DIBATALKAN';
  } else {
    bg = COLORS.warningLight;
    text = COLORS.warning;
    border = COLORS.warningBorder;
    label = 'MENUNGGU PEMBAYARAN';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <View style={[styles.dot, { backgroundColor: text }]} />
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
