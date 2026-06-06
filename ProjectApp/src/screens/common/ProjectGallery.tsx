import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, Dimensions, ScrollView } from 'react-native';
import { X, Image as ImageIcon, Filter, Maximize2, Calendar, Tag } from 'lucide-react-native';
import { useStore } from '../../../store';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

type PhotoSource = 'Logs' | 'Incidents' | 'Materials' | 'Documents';

interface GalleryItem {
  id: string;
  uri: string;
  timestamp: string;
  source: PhotoSource;
  title: string;
}

export default function ProjectGallery() {
  const { activeProject, dailyLogs, incidents, materialLogs, documents } = useStore();
  const { colors, isDark } = useTheme();
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | PhotoSource>('All');

  const galleryItems = useMemo(() => {
    if (!activeProject) return [];

    const items: GalleryItem[] = [];

    // 1. Daily Logs
    dailyLogs.filter(log => log.projectId === activeProject.id && log.photoUri).forEach(log => {
      items.push({
        id: log.id,
        uri: log.photoUri!,
        timestamp: log.timestamp,
        source: 'Logs',
        title: 'Site Progress'
      });
    });

    // 2. Incidents
    incidents.filter(inc => inc.projectId === activeProject.id && inc.photoUri).forEach(inc => {
      items.push({
        id: inc.id,
        uri: inc.photoUri!,
        timestamp: inc.timestamp,
        source: 'Incidents',
        title: `${inc.type.toUpperCase()} Incident`
      });
    });

    // 3. Material Logs (Photo + Receipt)
    materialLogs.filter(log => log.projectId === activeProject.id).forEach(log => {
      if (log.photoUri) {
        items.push({
          id: `${log.id}-photo`,
          uri: log.photoUri,
          timestamp: log.timestamp,
          source: 'Materials',
          title: 'Material Delivery'
        });
      }
      if (log.receiptUri) {
        items.push({
          id: `${log.id}-receipt`,
          uri: log.receiptUri,
          timestamp: log.timestamp,
          source: 'Materials',
          title: 'Delivery Receipt'
        });
      }
    });

    // 4. Documents
    documents.filter(doc => doc.projectId === activeProject.id).forEach(doc => {
      items.push({
        id: doc.id,
        uri: doc.uri,
        timestamp: doc.timestamp,
        source: 'Documents',
        title: doc.name
      });
    });

    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activeProject, dailyLogs, incidents, materialLogs, documents]);

  const filteredItems = galleryItems.filter(item => 
    activeTab === 'All' ? true : item.source === activeTab
  );

  const renderItem = ({ item }: { item: GalleryItem }) => (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={() => setSelectedItem(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      <View style={styles.sourceBadge}>
        <Text style={styles.sourceText}>{item.source.charAt(0)}</Text>
      </View>
    </TouchableOpacity>
  );

  const tabs: ('All' | PhotoSource)[] = ['All', 'Logs', 'Incidents', 'Materials', 'Documents'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Summary */}
      <View style={[styles.header, { backgroundColor: colors.accent }]}>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: isDark ? '#fff' : colors.text }]}>Project Gallery</Text>
          <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
            {galleryItems.length} Visual Records
          </Text>
        </View>
        <TouchableOpacity style={[styles.filterIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15, 23, 42, 0.05)' }]}>
           <Filter size={20} color={isDark ? '#fff' : colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[
                styles.tab, 
                { backgroundColor: isDark ? colors.card : '#F8FAFC', borderColor: colors.border },
                activeTab === tab && { backgroundColor: isDark ? colors.primary : '#0F172A', borderColor: isDark ? colors.primary : '#0F172A' }
              ]} 
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText, 
                { color: colors.textSecondary },
                activeTab === tab && { color: isDark ? '#0F172A' : '#fff' }
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ImageIcon size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No photos found in {activeTab === 'All' ? 'this project' : `the ${activeTab} category`}.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Full Screen Viewer Modal */}
      <Modal visible={!!selectedItem} transparent animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <View style={styles.modalOverlay}>
            {/* Header */}
            <View style={styles.modalHeader}>
                <View style={styles.modalHeaderInfo}>
                    <Text style={styles.modalTitle}>{selectedItem?.title}</Text>
                    <View style={styles.modalMeta}>
                        <Calendar size={12} color="#CBD5E1" />
                        <Text style={styles.modalDate}>
                            {selectedItem ? new Date(selectedItem.timestamp).toLocaleString() : ''}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedItem(null)}>
                    <X size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Image */}
            <View style={styles.imageContainer}>
                {selectedItem && (
                    <Image source={{ uri: selectedItem.uri }} style={styles.fullImage} resizeMode="contain" />
                )}
            </View>

            {/* Footer */}
            <View style={styles.modalFooter}>
                <View style={[styles.footerBadge, { backgroundColor: '#1E293B' }]}>
                    <Tag size={12} color="#94A3B8" />
                    <Text style={styles.footerBadgeText}>{selectedItem?.source.toUpperCase()}</Text>
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerInfo: {},
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  filterIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  tabWrapper: { paddingVertical: 16 },
  tabContent: { paddingHorizontal: 20, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1 },
  tabText: { fontSize: 13, fontWeight: '700' },

  listContent: { paddingBottom: 40 },
  itemContainer: { width: COLUMN_WIDTH, height: COLUMN_WIDTH, padding: 1 },
  thumbnail: { width: '100%', height: '100%', backgroundColor: '#E2E8F0' },
  sourceBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  sourceText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: -50 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 15, fontWeight: '500', lineHeight: 22 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  modalHeaderInfo: { flex: 1 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  modalMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  modalDate: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  closeBtn: { padding: 8 },
  
  imageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '100%' },

  modalFooter: { padding: 30, alignItems: 'center', paddingBottom: 40 },
  footerBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  footerBadgeText: { color: '#F1F5F9', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
});
