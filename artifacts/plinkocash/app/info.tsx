import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

type Section = 'about' | 'disclaimer' | 'privacy';

const CONTENT: Record<Section, { title: string; icon: string; body: string }> = {
  about: {
    title: 'Tentang PlinkoCash',
    icon: 'information-circle',
    body: `PlinkoCash adalah game plinko hiburan berbasis poin yang dapat ditukarkan dengan hadiah.

Cara bermain:
• Tekan DROP untuk menjatuhkan bola
• Bola akan memantul melalui paku dan mendarat di kotak hadiah
• Kumpulkan poin dari hadiah untuk ditukarkan
• Gunakan Spin Wheel untuk hadiah tambahan

Fitur:
• 20 kotak hadiah berbeda
• Spin Wheel dengan 10 segmen hadiah
• Sistem poin & hadiah
• Jatah 10 bola gratis per hari
• Mode AUTO untuk drop otomatis

Versi: 1.0.0
Paket: com.altomedia.plinkocash
Developer: ALTOMEDIA`,
  },
  disclaimer: {
    title: 'Disclaimer',
    icon: 'warning',
    body: `PlinkoCash adalah aplikasi hiburan semata.

PENTING:
• Hadiah dalam aplikasi ini berupa poin virtual
• Permainan ini ditujukan untuk hiburan semata
• Tidak ada jaminan keuntungan dari bermain game ini
• Permainan ini ditujukan untuk hiburan, bukan investasi
• Pengguna di bawah umur 17 tahun dilarang bermain
• Penggunaan berlebihan aplikasi tidak dianjurkan

Semua hasil permainan bersifat acak. Keberhasilan mendapatkan hadiah tidak dijamin. Pengembang tidak bertanggung jawab atas kerugian yang timbul akibat penggunaan aplikasi ini.`,
  },
  privacy: {
    title: 'Kebijakan Privasi',
    icon: 'shield-checkmark',
    body: `Kebijakan Privasi PlinkoCash

Data yang dikumpulkan:
• Data permainan (poin, riwayat, bola) disimpan lokal di perangkat Anda

Penggunaan data:
• Data digunakan semata-mata untuk keperluan fungsionalitas aplikasi
• Kami tidak menjual data pengguna kepada pihak ketiga

Penyimpanan data:
• Semua data permainan tersimpan di perangkat lokal Anda
• Data dapat dihapus dengan menghapus aplikasi

Hak pengguna:
• Anda dapat menghapus semua data dengan menghapus dan menginstall ulang aplikasi

Kontak:
• Email: altomediaindonesia@gmail.com
• Versi kebijakan: 1.0 (Juli 2026)`,
  },
};

export default function InfoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const [activeSection, setActiveSection] = useState<Section>('about');

  const sections: Section[] = ['about', 'disclaimer', 'privacy'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#0F063A', '#07041A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Section tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {sections.map((sec) => {
          const content = CONTENT[sec];
          const active = activeSection === sec;
          return (
            <TouchableOpacity
              key={sec}
              style={[
                styles.tabBtn,
                active && { backgroundColor: colors.gold + '22', borderColor: colors.gold },
              ]}
              onPress={() => setActiveSection(sec)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={content.icon as any}
                size={18}
                color={active ? colors.gold : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? colors.gold : colors.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {sec === 'about'
                  ? 'Tentang'
                  : sec === 'disclaimer'
                  ? 'Disclaimer'
                  : 'Privasi'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name={CONTENT[activeSection].icon as any}
              size={28}
              color={colors.gold}
            />
            <Text style={[styles.cardTitle, { color: colors.gold }]}>
              {CONTENT[activeSection].title}
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: colors.text }]}>
            {CONTENT[activeSection].body}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    padding: 8,
    gap: 6,
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  content: { padding: 16 },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    flex: 1,
  },
  bodyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
});
