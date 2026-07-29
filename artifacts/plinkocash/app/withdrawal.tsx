import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';
import {
  WITHDRAWAL_NOMINALS,
  POINTS_PER_RUPIAH,
  formatRupiah,
} from '@/constants/game';

export default function WithdrawalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const { points, withdrawalHistory, gameHistory, addWithdrawal } = useGame();

  const [selectedNominal, setSelectedNominal] = useState<number | null>(null);
  const [danaName, setDanaName] = useState('');
  const [danaNumber, setDanaNumber] = useState('');
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');

  const pointsNeeded = selectedNominal ? selectedNominal * POINTS_PER_RUPIAH : 0;
  const canWithdraw =
    selectedNominal !== null &&
    danaName.trim().length >= 3 &&
    danaNumber.trim().length >= 8 &&
    points >= pointsNeeded;

  const handleWithdraw = () => {
    if (!canWithdraw || selectedNominal === null) return;
    Alert.alert(
      'Konfirmasi Penarikan',
      `Tarik ${formatRupiah(selectedNominal)} ke DANA\nAtas nama: ${danaName}\nNomor: ${danaNumber}\n\nKamu akan menggunakan ${pointsNeeded} poin`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Konfirmasi',
          onPress: () => {
            addWithdrawal({
              amount: selectedNominal,
              points: pointsNeeded,
              danaName: danaName.trim(),
              danaNumber: danaNumber.trim(),
            });
            setSelectedNominal(null);
            setDanaName('');
            setDanaNumber('');
            Alert.alert(
              'Berhasil!',
              'Permintaan penarikan telah dikirim. Akan diproses dalam 24 jam.',
            );
            // Switch to history tab so user sees the new "Menunggu" record
            setActiveTab('history');
          },
        },
      ],
    );
  };

  const balanceRp = Math.floor(points / POINTS_PER_RUPIAH);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#0F063A', '#07041A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Balance card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FontAwesome5 name="wallet" size={28} color={colors.gold} />
          <View style={styles.balanceInfo}>
            <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>
              Saldo Poin
            </Text>
            <Text style={[styles.balancePoints, { color: colors.gold }]}>{points} poin</Text>
            <Text style={[styles.balanceRp, { color: colors.neon }]}>
              ≈ {formatRupiah(balanceRp)}
            </Text>
          </View>
          <View style={[styles.rateTag, { backgroundColor: colors.muted }]}>
            <Text style={[styles.rateText, { color: colors.mutedForeground }]}>
              1000 pts = Rp10
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.muted }]}>
          {(['withdraw', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? colors.gold : colors.mutedForeground },
                ]}
              >
                {tab === 'withdraw' ? 'Penarikan' : 'Riwayat'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'withdraw' && (
          <>
            {/* Nominal selection */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Pilih Nominal
            </Text>
            <View style={styles.nominalsGrid}>
              {WITHDRAWAL_NOMINALS.map((nom) => {
                const ptsNeeded = nom * POINTS_PER_RUPIAH;
                const affordable = points >= ptsNeeded;
                const selected = selectedNominal === nom;
                return (
                  <TouchableOpacity
                    key={nom}
                    style={[
                      styles.nomBtn,
                      {
                        backgroundColor: selected
                          ? colors.gold
                          : affordable
                          ? colors.card
                          : colors.muted,
                        borderColor: selected
                          ? colors.gold
                          : affordable
                          ? colors.border
                          : 'transparent',
                        opacity: affordable ? 1 : 0.5,
                      },
                    ]}
                    onPress={() => affordable && setSelectedNominal(nom)}
                    disabled={!affordable}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.nomLabel,
                        { color: selected ? '#07041A' : colors.text },
                      ]}
                    >
                      {formatRupiah(nom)}
                    </Text>
                    <Text
                      style={[
                        styles.nomPts,
                        { color: selected ? '#07041A80' : colors.mutedForeground },
                      ]}
                    >
                      {ptsNeeded} pts
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* DANA Form */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Akun DANA
            </Text>
            <View style={[styles.inputGroup, { borderColor: colors.border }]}>
              <MaterialIcons name="person" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nama lengkap pemilik DANA"
                placeholderTextColor={colors.mutedForeground}
                value={danaName}
                onChangeText={setDanaName}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputGroup, { borderColor: colors.border }]}>
              <MaterialIcons name="phone" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nomor HP DANA (08xx...)"
                placeholderTextColor={colors.mutedForeground}
                value={danaNumber}
                onChangeText={setDanaNumber}
                keyboardType="phone-pad"
              />
            </View>

            {selectedNominal && (
              <View style={[styles.summaryBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
                  Akan ditarik:{' '}
                  <Text style={{ color: colors.gold, fontFamily: 'Inter_700Bold' }}>
                    {formatRupiah(selectedNominal)}
                  </Text>
                </Text>
                <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
                  Poin digunakan:{' '}
                  <Text style={{ color: colors.danger, fontFamily: 'Inter_700Bold' }}>
                    -{pointsNeeded}
                  </Text>
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.withdrawBtn,
                {
                  backgroundColor: canWithdraw ? colors.gold : colors.muted,
                  shadowColor: canWithdraw ? colors.gold : 'transparent',
                },
              ]}
              onPress={handleWithdraw}
              disabled={!canWithdraw}
              activeOpacity={0.8}
            >
              <FontAwesome5 name="paper-plane" size={16} color={canWithdraw ? '#07041A' : colors.mutedForeground} />
              <Text
                style={[
                  styles.withdrawBtnText,
                  { color: canWithdraw ? '#07041A' : colors.mutedForeground },
                ]}
              >
                TARIK SALDO
              </Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'history' && (
          <>
            {/* Withdrawal history */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Riwayat Penarikan
            </Text>
            {withdrawalHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="history" size={36} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Belum ada penarikan
                </Text>
              </View>
            ) : (
              withdrawalHistory.map((w) => {
                const isSukses = w.status === 'sukses';
                return (
                  <View
                    key={w.id}
                    style={[styles.historyItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={styles.historyLeft}>
                      <Text style={[styles.historyAmount, { color: colors.gold }]}>
                        {formatRupiah(w.amount)}
                      </Text>
                      <Text style={[styles.historyMeta, { color: colors.mutedForeground }]}>
                        {w.danaName} · {w.danaNumber}
                      </Text>
                      <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                        {new Date(w.timestamp).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isSukses
                            ? 'rgba(0,180,80,0.15)'
                            : 'rgba(204,136,0,0.15)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: isSukses ? '#00C853' : '#CC8800' },
                        ]}
                      >
                        {isSukses ? 'SUKSES' : 'MENUNGGU'}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}

            {/* Game history */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
              Riwayat Permainan
            </Text>
            {gameHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="sports-baseball" size={36} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Belum ada permainan
                </Text>
              </View>
            ) : (
              gameHistory.slice(0, 30).map((g) => (
                <View
                  key={g.id}
                  style={[styles.gameItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Text
                    style={[
                      styles.gamePrize,
                      {
                        color:
                          g.prize === 'zonk'
                            ? colors.mutedForeground
                            : g.prize === 'ads'
                            ? colors.neon
                            : colors.gold,
                      },
                    ]}
                  >
                    {g.prize === 'zonk'
                      ? 'ZONK'
                      : g.prize === 'ads'
                      ? 'ADS +1 Bola'
                      : `+${g.prize} pts`}
                  </Text>
                  <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                    {new Date(g.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  balanceInfo: { flex: 1, gap: 2 },
  balanceLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  balancePoints: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  balanceRp: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  rateTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  rateText: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 2,
  },
  nominalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nomBtn: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 2,
  },
  nomLabel: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  nomPts: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  summaryBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  summaryText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 30,
    marginTop: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  withdrawBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  historyLeft: { flex: 1, gap: 2 },
  historyAmount: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  historyMeta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  historyDate: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  gameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  gamePrize: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
