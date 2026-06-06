import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Package, ClipboardList, Clipboard, Camera, X, Plus, ArrowLeft, ArrowUpRight, ArrowDownRight, History as HistoryIcon, AlertCircle, Search } from 'lucide-react-native';
import { useStore, Material, MaterialLog, DocumentRecord } from '../../../store';
import { useTheme } from '../../hooks/useTheme';
import { v4 as uuidv4 } from 'uuid';

const COMMON_MATERIALS = [
  { name: 'Cement', unit: 'Bags (50kg)' },
  { name: 'Ready-mix Concrete', unit: 'Cubic Meters' },
  { name: 'Concrete Blocks', unit: 'Pieces' },
  { name: 'Hollow Blocks', unit: 'Pieces' },
  { name: 'Bricks', unit: 'Pieces' },
  { name: 'Interlocking Blocks', unit: 'Pieces' },
  { name: 'Machine Cut Stones', unit: 'Pieces' },
  { name: 'Sand (Building Sand)', unit: 'Cubic Meters' },
  { name: 'River Sand', unit: 'Cubic Meters' },
  { name: 'Gravel / Ballast', unit: 'Cubic Meters' },
  { name: 'Hardcore', unit: 'Cubic Meters' },
  { name: 'Quarry Dust', unit: 'Cubic Meters' },
  { name: 'Crusher Run', unit: 'Cubic Meters' },
  { name: 'Steel Rebar', unit: 'Tonnes' },
  { name: 'Binding Wire', unit: 'Kg' },
  { name: 'Steel Mesh / BRC Mesh', unit: 'Sheets' },
  { name: 'Steel Plates', unit: 'Sheets' },
  { name: 'Steel Beams', unit: 'Lengths' },
  { name: 'Steel Angles', unit: 'Lengths' },
  { name: 'Steel Channels', unit: 'Lengths' },
  { name: 'Steel Pipes', unit: 'Lengths' },
  { name: 'Timber / Wood', unit: 'Lengths' },
  { name: 'Timber Planks', unit: 'Pieces' },
  { name: 'Timber Battens', unit: 'Pieces' },
  { name: 'Plywood', unit: 'Sheets' },
  { name: 'Marine Plywood', unit: 'Sheets' },
  { name: 'MDF Boards', unit: 'Sheets' },
  { name: 'Chipboard', unit: 'Sheets' },
  { name: 'Gypsum Boards', unit: 'Sheets' },
  { name: 'Ceiling Boards', unit: 'Sheets' },
  { name: 'Ceramic Tiles', unit: 'Square Meters' },
  { name: 'Floor Tiles', unit: 'Square Meters' },
  { name: 'Wall Tiles', unit: 'Square Meters' },
  { name: 'Tile Adhesive', unit: 'Bags' },
  { name: 'Tile Grout', unit: 'Kg' },
  { name: 'Tile Spacers', unit: 'Packs' },
  { name: 'Paint', unit: 'Litres' },
  { name: 'Primer', unit: 'Litres' },
  { name: 'Sealer / Undercoat', unit: 'Litres' },
  { name: 'Putty / Filler', unit: 'Kg' },
  { name: 'Varnish / Wood Polish', unit: 'Litres' },
  { name: 'Roofing Sheets', unit: 'Pieces' },
  { name: 'Roofing Nails', unit: 'Kg' },
  { name: 'Ridge Caps', unit: 'Pieces' },
  { name: 'Fascia Boards', unit: 'Pieces' },
  { name: 'Gutters', unit: 'Meters' },
  { name: 'Downpipes', unit: 'Meters' },
  { name: 'Waterproof Membrane', unit: 'Rolls' },
  { name: 'DPC Membrane', unit: 'Rolls' },
  { name: 'Polyethylene Sheet', unit: 'Rolls' },
  { name: 'Nails', unit: 'Kg' },
  { name: 'Screws', unit: 'Boxes' },
  { name: 'Bolts', unit: 'Kg' },
  { name: 'Nuts', unit: 'Kg' },
  { name: 'Washers', unit: 'Kg' },
  { name: 'Anchors / Rawl Bolts', unit: 'Boxes' },
  { name: 'Wall Plugs', unit: 'Packs' },
  { name: 'Rivets', unit: 'Boxes' },
  { name: 'Hinges', unit: 'Pieces' },
  { name: 'Locks / Latches', unit: 'Pieces' },
  { name: 'Door Handles', unit: 'Pieces' },
  { name: 'Doors', unit: 'Pieces' },
  { name: 'Window Frames', unit: 'Pieces' },
  { name: 'Glass Panels', unit: 'Square Meters' },
  { name: 'Plumbing Pipes', unit: 'Meters' },
  { name: 'Pipe Fittings', unit: 'Pieces' },
  { name: 'Pipe Elbows', unit: 'Pieces' },
  { name: 'Pipe Tees', unit: 'Pieces' },
  { name: 'Pipe Reducers', unit: 'Pieces' },
  { name: 'Valves', unit: 'Pieces' },
  { name: 'Taps / Faucets', unit: 'Pieces' },
  { name: 'Sanitary Ware', unit: 'Pieces' },
  { name: 'Toilets', unit: 'Pieces' },
  { name: 'Basins / Sinks', unit: 'Pieces' },
  { name: 'Water Tanks', unit: 'Pieces' },
  { name: 'Plumbing Seal Tape', unit: 'Rolls' },
  { name: 'PVC Solvent Cement', unit: 'Litres' },
  { name: 'Electrical Cables', unit: 'Meters' },
  { name: 'Electrical Wire', unit: 'Meters' },
  { name: 'Conduit Pipes', unit: 'Meters' },
  { name: 'Conduit Fittings', unit: 'Pieces' },
  { name: 'Switches', unit: 'Pieces' },
  { name: 'Socket Outlets', unit: 'Pieces' },
  { name: 'Light Fixtures', unit: 'Pieces' },
  { name: 'Bulbs / Lamps', unit: 'Pieces' },
  { name: 'Circuit Breakers', unit: 'Pieces' },
  { name: 'Distribution Boards', unit: 'Pieces' },
  { name: 'Trunking / Cable Tray', unit: 'Meters' },
  { name: 'Cable Ties', unit: 'Packs' },
  { name: 'Electrical Tape', unit: 'Rolls' },
  { name: 'Earthing Rods', unit: 'Pieces' },
  { name: 'Earthing Cable', unit: 'Meters' },
  { name: 'Transformer Oil', unit: 'Litres' },
  { name: 'Fasteners (mixed)', unit: 'Boxes' },
  { name: 'Formwork Plywood', unit: 'Sheets' },
  { name: 'Formwork Timber', unit: 'Lengths' },
  { name: 'Prop Stands', unit: 'Pieces' },
  { name: 'Scaffolding Pipes', unit: 'Lengths' },
  { name: 'Scaffolding Couplers', unit: 'Pieces' },
  { name: 'Shuttering Oil', unit: 'Litres' },
  { name: 'Expansion Joint Material', unit: 'Meters' },
  { name: 'Sealant / Silicone', unit: 'Cartridges' },
  { name: 'Foam Insulation', unit: 'Sheets' },
  { name: 'Rock Wool Insulation', unit: 'Rolls' },
  { name: 'Polystyrene Insulation', unit: 'Sheets' },
  { name: 'Screed Material', unit: 'Bags' },
  { name: 'Plaster / Render Mix', unit: 'Bags' },
  { name: 'Lime', unit: 'Bags' },
  { name: 'Gypsum Plaster', unit: 'Bags' },
  { name: 'Mortar Mix', unit: 'Bags' },
  { name: 'Grout', unit: 'Kg' },
  { name: 'Adhesive', unit: 'Kg' },
  { name: 'Epoxy Resin', unit: 'Litres' },
  { name: 'Cleaning Solvent', unit: 'Litres' },
  { name: 'Diesel', unit: 'Litres' },
  { name: 'Petrol', unit: 'Litres' },
  { name: 'Generator Oil', unit: 'Litres' },
  { name: 'Hydraulic Oil', unit: 'Litres' },
  { name: 'Grease', unit: 'Kg' },
  { name: 'PPE Gloves', unit: 'Pairs' },
  { name: 'Safety Boots', unit: 'Pairs' },
  { name: 'Helmets', unit: 'Pieces' },
  { name: 'Safety Glasses', unit: 'Pieces' },
  { name: 'Reflective Vests', unit: 'Pieces' },
  { name: 'Dust Masks', unit: 'Pieces' },
  { name: 'Earplugs', unit: 'Pairs' },
  { name: 'Tarpaulins', unit: 'Pieces' },
  { name: 'Rope / Cord', unit: 'Meters' },
  { name: 'Rope / Wire Rope', unit: 'Meters' },
  { name: 'Chain', unit: 'Meters' },
  { name: 'Sandpaper', unit: 'Sheets' },
  { name: 'Abrasive Discs', unit: 'Pieces' },
  { name: 'Drill Bits', unit: 'Pieces' },
  { name: 'Cutting Discs', unit: 'Pieces' },
  { name: 'Saw Blades', unit: 'Pieces' },
];

const CONSTRUCTION_PHASES = [
  { name: 'Site Preparation', unit: 'Sq Meters' },
  { name: 'Foundation / Footing', unit: 'Cubic Meters' },
  { name: 'Concrete Pouring', unit: 'Cubic Meters' },
  { name: 'Wall Construction', unit: 'Sq Meters' },
  { name: 'Roofing', unit: 'Sq Meters' },
  { name: 'Plastering / Rendering', unit: 'Sq Meters' },
  { name: 'Flooring / Tiling', unit: 'Sq Meters' },
  { name: 'Painting', unit: 'Sq Meters' },
  { name: 'Plumbing', unit: 'Linear Meters' },
  { name: 'Electrical', unit: 'Linear Meters' },
  { name: 'Carpentry / Joinery', unit: 'Pieces' },
  { name: 'Landscaping', unit: 'Sq Meters' },
  { name: 'General / Other', unit: 'Units' }
];

type TabView = 'stock' | 'logs';

export default function Materials() {
  const activeProject = useStore(state => state.activeProject);
  const currentUser = useStore(state => state.currentUser);
  const materials = useStore(state => state.materials);
  const materialLogs = useStore(state => state.materialLogs);
  const users = useStore(state => state.users);
  const addMaterial = useStore(state => state.addMaterial);
  const logMaterialTransaction = useStore(state => state.logMaterialTransaction);
  const { colors, isDark } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  
  const [activeTab, setActiveTab] = useState<TabView>('stock');
  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
    if (route.params?.openLogModal) {
      setModalVisible(true);
      if (route.params?.logType) {
        setLogType(route.params.logType);
      }
    }
  }, [route.params]);
  
  // Form State
  const [isNewMaterial, setIsNewMaterial] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialUnit, setNewMaterialUnit] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  
  const [workPhase, setWorkPhase] = useState('');
  const [workScale, setWorkScale] = useState('');
  const [workScaleUnit, setWorkScaleUnit] = useState('');
  
  const [logType, setLogType] = useState<'delivery'|'usage'|'damage'>('delivery');
  const [amount, setAmount] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryPhotoUri, setDeliveryPhotoUri] = useState<string | null>(null);
  const [receiptPhotoUri, setReceiptPhotoUri] = useState<string | null>(null);

  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null | undefined>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  const projectMaterials = materials.filter(m => m.projectId === activeProject?.id);
  const projectLogs = materialLogs.filter(l => l.projectId === activeProject?.id).reverse();

  const pickImage = async (imageType: 'delivery' | 'receipt') => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      if (imageType === 'delivery') setDeliveryPhotoUri(result.assets[0].uri);
      else setReceiptPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!activeProject || !currentUser) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
       Alert.alert('Error', 'Please enter a valid amount.');
       return;
    }

    let materialId = selectedMaterialId;

    if (isNewMaterial) {
       if (!newMaterialName.trim() || !newMaterialUnit.trim()) {
           Alert.alert('Error', 'Please select a material type.');
           return;
       }
       materialId = uuidv4();
       const newMat: Material = {
           id: materialId,
           projectId: activeProject.id,
           name: newMaterialName.trim(),
           unit: newMaterialUnit.trim(),
           quantity: 0
       };
       addMaterial(newMat);
    } else {
       if (!materialId) {
           Alert.alert('Error', 'Please select a material.');
           return;
       }
    }

    let logLocation = null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
         const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
         logLocation = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      }
    } catch (e) {
      console.log('Location capture failed:', e);
    }

    const log: MaterialLog = {
       id: uuidv4(),
       projectId: activeProject.id,
       materialId,
       type: logType,
       amount: numAmount,
       timestamp: new Date().toISOString(),
       notes: notes.trim(),
       supervisorId: currentUser.id,
       photoUri: deliveryPhotoUri,
       receiptUri: receiptPhotoUri,
       location: logLocation,
       costPerUnit: logType === 'delivery' && costPerUnit ? parseFloat(costPerUnit) : undefined,
       workPhase: logType === 'usage' && workPhase ? workPhase : null,
       workScale: logType === 'usage' && workScale ? parseFloat(workScale) : null,
       workScaleUnit: logType === 'usage' && workPhase ? workScaleUnit : null
    };

    logMaterialTransaction(log);
    
    // Auto-create document record for delivery receipts
    if (logType === 'delivery' && receiptPhotoUri) {
       const matName = isNewMaterial ? newMaterialName : materials.find(m => m.id === selectedMaterialId)?.name;
       const receiptDoc: DocumentRecord = {
          id: uuidv4(),
          projectId: activeProject.id,
          uploaderId: currentUser.id,
          name: `Receipt: ${matName || 'Material'} Delivery`,
          uri: receiptPhotoUri,
          category: 'Receipt',
          timestamp: new Date().toISOString()
       };
       useStore.getState().addDocument(receiptDoc);
    }

    setAmount('');
    setCostPerUnit('');
    setNotes('');
    setDeliveryPhotoUri(null);
    setReceiptPhotoUri(null);
    setIsNewMaterial(false);
    setNewMaterialName('');
    setSelectedMaterialId('');
    setMaterialSearch('');
    setWorkPhase('');
    setWorkScale('');
    setWorkScaleUnit('');
    setModalVisible(false);
    
    setActiveTab('logs');
  };

  const renderMaterial = ({ item }: { item: Material }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => setDetailMaterial(item)}
      activeOpacity={0.7}
    >
       <View>
          <Text style={[styles.materialName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.materialUnit, { color: colors.textSecondary }]}>Unit: {item.unit}</Text>
       </View>
       <View style={[styles.stockBox, { backgroundColor: isDark ? colors.background : '#EEF2FF' }]}>
          <Text style={[styles.stockNum, { color: isDark ? colors.primary : '#4F46E5' }]}>{item.quantity}</Text>
          <Text style={[styles.stockLabel, { color: colors.textMuted }]}>in stock</Text>
       </View>
    </TouchableOpacity>
  );

  const renderLog = ({ item }: { item: MaterialLog }) => {
     const material = materials.find(m => m.id === item.materialId);
     const supervisor = users.find(u => u.id === item.supervisorId);
     const isPositive = item.type === 'delivery';
     const amountColor = isPositive ? colors.success : (item.type === 'damage' ? colors.danger : (isDark ? colors.text : '#3B82F6'));
     const sign = isPositive ? '+' : '-';
     
     return (
       <TouchableOpacity 
         style={[styles.logCard, { backgroundColor: colors.card }]}
         activeOpacity={1}
       >
          <View style={styles.logHeader}>
             <View>
                <Text style={[styles.logMaterial, { color: colors.text }]}>{material?.name || 'Unknown Material'}</Text>
                <Text style={[styles.logDate, { color: colors.textMuted }]}>{new Date(item.timestamp).toLocaleString()}</Text>
             </View>
             <View style={{ alignItems: 'flex-end' }}>
               <Text style={[styles.logAmount, { color: amountColor }]}>{sign}{item.amount} {material?.unit}</Text>
             </View>
          </View>
          <View style={styles.logDetailsRow}>
             <Text style={[styles.logTypeBadge, { backgroundColor: colors.background, color: colors.textSecondary }]}>{item.type.toUpperCase()}</Text>
             <Text style={[styles.logSupervisor, { color: colors.textSecondary }]}>Logged by {supervisor?.name || item.supervisorId}</Text>
          </View>
          {item.notes ? <Text style={[styles.logNotes, { color: colors.textMuted }]}>Notes: {item.notes}</Text> : null}
          {(item.photoUri || item.receiptUri) && (
              <View style={styles.logPhotosRow}>
                  {item.receiptUri && (
                    <TouchableOpacity onPress={() => setPreviewImage(item.receiptUri)}>
                      <Image source={{uri: item.receiptUri}} style={[styles.miniPhoto, { borderColor: colors.border }]} />
                    </TouchableOpacity>
                  )}
                  {item.photoUri && (
                    <TouchableOpacity onPress={() => setPreviewImage(item.photoUri)}>
                      <Image source={{uri: item.photoUri}} style={[styles.miniPhoto, { borderColor: colors.border }]} />
                    </TouchableOpacity>
                  )}
              </View>
          )}
       </TouchableOpacity>
     );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Visual Header / Summary */}
      <View style={[styles.summaryHeader, { backgroundColor: colors.accent }]}>
          <Text style={[styles.title, { color: isDark ? '#fff' : colors.text }]}>Project Materials</Text>
          <View style={[styles.summaryMetrics, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.background }]}>
             <View style={styles.metric}>
               <Text style={[styles.metricBig, { color: isDark ? '#fff' : colors.text }]}>{projectMaterials.length}</Text>
               <Text style={[styles.metricSmall, { color: isDark ? '#D1D5DB' : colors.textSecondary }]}>MATERIALS TRACKED</Text>
             </View>
             <View style={styles.metric}>
               <Text style={[styles.metricBig, { color: isDark ? '#fff' : colors.text }]}>{projectLogs.length}</Text>
               <Text style={[styles.metricSmall, { color: isDark ? '#D1D5DB' : colors.textSecondary }]}>TOTAL LOGS</Text>
             </View>
          </View>
      </View>


      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: isDark ? colors.card : '#E5E7EB' }]}>
         <TouchableOpacity style={[styles.tabBtn, activeTab === 'stock' && (isDark ? {backgroundColor: colors.background} : styles.tabBtnActive)]} onPress={() => setActiveTab('stock')}>
            <View style={styles.tabInner}>
              <Package size={14} color={activeTab === 'stock' ? (isDark ? '#fff' : '#0F172A') : colors.textMuted} />
              <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'stock' && { color: isDark ? '#fff' : '#0F172A' }]}> Stock</Text>
            </View>
         </TouchableOpacity>
         <TouchableOpacity style={[styles.tabBtn, activeTab === 'logs' && (isDark ? {backgroundColor: colors.background} : styles.tabBtnActive)]} onPress={() => setActiveTab('logs')}>
            <View style={styles.tabInner}>
              <ClipboardList size={14} color={activeTab === 'logs' ? (isDark ? '#fff' : '#0F172A') : colors.textMuted} />
              <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'logs' && { color: isDark ? '#fff' : '#0F172A' }]}> Usage Logs</Text>
            </View>
         </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'stock' ? (
           projectMaterials.length === 0 ? (
              <View style={styles.emptyBox}>
                 <Package size={50} color="#9CA3AF" style={styles.emptyIcon} />
                 <Text style={styles.emptyText}>No materials tracked yet.</Text>
              </View>
            ) : (
              <FlatList
                data={projectMaterials}
                keyExtractor={(item) => item.id}
                renderItem={renderMaterial}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            )
        ) : (
           projectLogs.length === 0 ? (
              <View style={styles.emptyBox}>
                 <Clipboard size={50} color="#9CA3AF" style={styles.emptyIcon} />
                 <Text style={styles.emptyText}>No activity logs yet.</Text>
              </View>
            ) : (
              <FlatList
                data={projectLogs}
                keyExtractor={(item) => item.id}
                renderItem={renderLog}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            )
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: isDark ? colors.primary : '#0F172A' }]} onPress={() => setModalVisible(true)}>
          <Plus size={30} color={isDark ? colors.accent : "#fff"} />
      </TouchableOpacity>

      {/* Add Log Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
         <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1 }]}>
               <ScrollView>
                 <Text style={[styles.modalTitle, { color: colors.text }]}>Log Activity</Text>
                 
                  <View style={[styles.switchRow, { backgroundColor: isDark ? colors.background : '#E5E7EB' }]}>
                      <TouchableOpacity style={[styles.switchBtn, !isNewMaterial && { backgroundColor: colors.card }]} onPress={() => setIsNewMaterial(false)}>
                          <Text style={[styles.switchTxt, { color: colors.text }]}>Existing Material</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.switchBtn, isNewMaterial && { backgroundColor: colors.card }]} onPress={() => setIsNewMaterial(true)}>
                          <Text style={[styles.switchTxt, { color: colors.text }]}>New Material</Text>
                      </TouchableOpacity>
                  </View>

                  {isNewMaterial ? (
                    <>
                      <Text style={[styles.label, { color: colors.textSecondary }]}>Select Material Type</Text>
                      
                      <View style={[styles.searchInputContainer, { backgroundColor: isDark ? colors.background : '#F9FAFB', borderColor: colors.border }]}>
                        <Search size={18} color={colors.textMuted} />
                        <TextInput
                          style={[styles.searchInput, { color: colors.text }]}
                          placeholder="Search materials..."
                          placeholderTextColor={colors.textMuted}
                          value={materialSearch}
                          onChangeText={setMaterialSearch}
                        />
                      </View>

                      <View style={styles.pickerContainer}>
                         {materialSearch.trim() === '' && !newMaterialName && (
                            <Text style={{color: colors.textMuted, fontStyle: 'italic', paddingVertical: 10, paddingHorizontal: 5}}>Start typing to search materials...</Text>
                         )}
                         {COMMON_MATERIALS.filter(m => materialSearch.trim() === '' ? m.name === newMaterialName : m.name.toLowerCase().includes(materialSearch.toLowerCase())).map(m => (
                             <TouchableOpacity 
                                key={m.name} 
                                style={[
                                  styles.matOption, 
                                  { borderColor: colors.border },
                                  newMaterialName === m.name && { backgroundColor: isDark ? colors.primary : '#0F172A', borderColor: isDark ? colors.primary : '#0F172A' }
                                ]}
                                onPress={() => {
                                  setNewMaterialName(m.name);
                                  setNewMaterialUnit(m.unit);
                                  setMaterialSearch(m.name);
                                }}
                             >
                                <Text style={newMaterialName === m.name ? {color: isDark ? '#0F172A' : '#fff'} : {color: colors.text}}>{m.name} ({m.unit})</Text>
                             </TouchableOpacity>
                         ))}
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.label, { color: colors.textSecondary }]}>Select Material</Text>
                      {projectMaterials.length === 0 ? (
                         <Text style={{color:colors.danger, marginBottom:15, fontStyle: 'italic'}}>No existing materials. Switch to "New Material".</Text>
                      ) : (
                         <>
                           <View style={[styles.searchInputContainer, { backgroundColor: isDark ? colors.background : '#F9FAFB', borderColor: colors.border }]}>
                             <Search size={18} color={colors.textMuted} />
                             <TextInput
                               style={[styles.searchInput, { color: colors.text }]}
                               placeholder="Search inventory..."
                               placeholderTextColor={colors.textMuted}
                               value={materialSearch}
                               onChangeText={setMaterialSearch}
                             />
                           </View>
                           <View style={styles.pickerContainer}>
                              {materialSearch.trim() === '' && !selectedMaterialId && (
                                 <Text style={{color: colors.textMuted, fontStyle: 'italic', paddingVertical: 10, paddingHorizontal: 5}}>Start typing to search inventory...</Text>
                              )}
                              {projectMaterials.filter(m => materialSearch.trim() === '' ? m.id === selectedMaterialId : m.name.toLowerCase().includes(materialSearch.toLowerCase())).map(m => (
                                 <TouchableOpacity 
                                    key={m.id} 
                                    style={[
                                      styles.matOption, 
                                      { borderColor: colors.border },
                                      selectedMaterialId === m.id && { backgroundColor: isDark ? colors.primary : '#0F172A', borderColor: isDark ? colors.primary : '#0F172A' }
                                    ]}
                                    onPress={() => {
                                      setSelectedMaterialId(m.id);
                                      setMaterialSearch(m.name);
                                    }}
                                 >
                                    <Text style={selectedMaterialId === m.id ? {color: isDark ? '#0F172A' : '#fff'} : {color: colors.text}}>{m.name}</Text>
                                 </TouchableOpacity>
                             ))}
                           </View>
                         </>
                      )}
                    </>
                  )}

                  <Text style={[styles.label, { color: colors.textSecondary }]}>Activity Type</Text>
                  <View style={styles.typeRow}>
                     <TouchableOpacity style={[styles.typeBtn, { borderColor: colors.border }, logType === 'delivery' && {backgroundColor: colors.success, borderColor: colors.success}]} onPress={() => setLogType('delivery')}>
                         <Text style={logType === 'delivery' ? {color:'#fff'} : {color: colors.text}}>Delivery (+)</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={[styles.typeBtn, { borderColor: colors.border }, logType === 'usage' && {backgroundColor: isDark ? colors.primary : '#3B82F6', borderColor: isDark ? colors.primary : '#3B82F6'}]} onPress={() => setLogType('usage')}>
                         <Text style={logType === 'usage' ? {color: isDark ? '#0F172A' : '#fff'} : {color: colors.text}}>Usage (-)</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={[styles.typeBtn, { borderColor: colors.border }, logType === 'damage' && {backgroundColor: colors.danger, borderColor: colors.danger}]} onPress={() => setLogType('damage')}>
                         <Text style={logType === 'damage' ? {color:'#fff'} : {color: colors.text}}>Damage (-)</Text>
                     </TouchableOpacity>
                  </View>

                  {logType === 'usage' && (
                    <>
                      <Text style={[styles.label, { color: colors.textSecondary }]}>Task / Phase</Text>
                      <View style={{ marginBottom: 15 }}>
                         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 10, paddingBottom: 5}}>
                           {CONSTRUCTION_PHASES.map(phase => (
                               <TouchableOpacity 
                                  key={phase.name} 
                                  style={[
                                    styles.matOption, 
                                    { borderColor: colors.border },
                                    workPhase === phase.name && { backgroundColor: isDark ? colors.primary : '#0F172A', borderColor: isDark ? colors.primary : '#0F172A' }
                                  ]}
                                  onPress={() => {
                                    setWorkPhase(phase.name);
                                    setWorkScaleUnit(phase.unit);
                                  }}
                               >
                                  <Text style={workPhase === phase.name ? {color: isDark ? '#0F172A' : '#fff'} : {color: colors.text}}>{phase.name}</Text>
                               </TouchableOpacity>
                           ))}
                         </ScrollView>
                      </View>
                      
                      {workPhase ? (
                         <>
                           <Text style={[styles.label, { color: colors.textSecondary }]}>Task Scale ({workScaleUnit})</Text>
                           <TextInput 
                             style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#F9FAFB', marginBottom: 15 }]} 
                             placeholder={`e.g. 50`} 
                             placeholderTextColor={colors.textMuted}
                             keyboardType="numeric" 
                             value={workScale} 
                             onChangeText={setWorkScale} 
                           />
                         </>
                      ) : null}
                    </>
                  )}

                  <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#F9FAFB' }]} 
                    placeholder="0" 
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric" 
                    value={amount} 
                    onChangeText={setAmount} 
                  />
                  
                  {logType === 'delivery' && (
                    <>
                      <Text style={[styles.label, { color: colors.textSecondary }]}>Cost Per Unit (KSh)</Text>
                      <TextInput 
                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#F9FAFB' }]} 
                        placeholder="0.00" 
                        placeholderTextColor={colors.textMuted}
                        keyboardType="numeric" 
                        value={costPerUnit} 
                        onChangeText={setCostPerUnit} 
                      />
                    </>
                  )}
                  
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Notes (Optional)</Text>
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#F9FAFB', height: 80 }]} 
                    placeholder="Receipt numbers, reasons, etc." 
                    placeholderTextColor={colors.textMuted}
                    multiline 
                    value={notes} 
                    onChangeText={setNotes} 
                  />

                 {logType === 'delivery' && (
                   <>
                     <Text style={[styles.label, { color: colors.textSecondary }]}>Attachments (Optional)</Text>
                     
                     <View style={{flexDirection: 'row', gap: 10, marginBottom: 15}}>
                        {receiptPhotoUri ? (
                           <View style={{flex: 1, position: 'relative'}}>
                              <Image source={{ uri: receiptPhotoUri }} style={{ width: '100%', height: 100, borderRadius: 8 }} />
                              <TouchableOpacity style={styles.deletePhotoBtn} onPress={() => setReceiptPhotoUri(null)}>
                                  <X size={14} color="#fff" />
                              </TouchableOpacity>
                              <Text style={styles.photoThumbLabel}>Receipt</Text>
                           </View>
                        ) : (
                           <TouchableOpacity style={[styles.uploadBtn, {flex: 1, backgroundColor: colors.background}]} onPress={() => pickImage('receipt')}>
                              <Camera size={18} color={colors.textSecondary} />
                              <Text style={[styles.uploadBtnText, { color: colors.textSecondary }]}> Receipt</Text>
                           </TouchableOpacity>
                        )}

                        {deliveryPhotoUri ? (
                           <View style={{flex: 1, position: 'relative'}}>
                              <Image source={{ uri: deliveryPhotoUri }} style={{ width: '100%', height: 100, borderRadius: 8 }} />
                              <TouchableOpacity style={styles.deletePhotoBtn} onPress={() => setDeliveryPhotoUri(null)}>
                                  <X size={14} color="#fff" />
                              </TouchableOpacity>
                              <Text style={styles.photoThumbLabel}>Material</Text>
                           </View>
                        ) : (
                           <TouchableOpacity style={[styles.uploadBtn, {flex: 1, backgroundColor: colors.background}]} onPress={() => pickImage('delivery')}>
                              <Camera size={18} color={colors.textSecondary} />
                              <Text style={[styles.uploadBtnText, { color: colors.textSecondary }]}> Material</Text>
                           </TouchableOpacity>
                        )}
                     </View>
                   </>
                 )}

                  <View style={styles.modalActions}>
                      <TouchableOpacity style={[styles.modalBtn, {backgroundColor: colors.textMuted}]} onPress={() => setModalVisible(false)}>
                          <Text style={styles.modalBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.modalBtn, {backgroundColor: isDark ? colors.primary : '#0F172A'}]} onPress={handleSubmit}>
                          <Text style={[styles.modalBtnText, { color: isDark ? '#0F172A' : '#fff' }]}>Save Log</Text>
                      </TouchableOpacity>
                  </View>
               </ScrollView>
            </View>
         </View>
      </Modal>

      {/* Full Screen Material Detail Dashboard */}
      <Modal 
        animationType="slide" 
        transparent={false} 
        visible={!!detailMaterial} 
        onRequestClose={() => setDetailMaterial(null)}
      >
        {detailMaterial && (() => {
          const materialHistory = materialLogs.filter(l => l.materialId === detailMaterial.id).reverse();
          const totalIn = materialHistory.filter(l => l.type === 'delivery').reduce((sum, l) => sum + l.amount, 0);
          const totalOut = materialHistory.filter(l => l.type !== 'delivery').reduce((sum, l) => sum + l.amount, 0);

          // Dynamic Data Aggregation based on Timeframe
          let displayData: { date: string, label: string, amount: number }[] = [];
          
          if (timeframe === 'week' || timeframe === 'month') {
            const daysToFetch = timeframe === 'week' ? 7 : 30;
            const days = [...Array(daysToFetch)].map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - i);
              return d.toISOString().split('T')[0];
            }).reverse();

            displayData = days.map(date => {
              const dayAmount = materialHistory
                .filter(l => l.type !== 'delivery' && l.timestamp.split('T')[0] === date)
                .reduce((sum, l) => sum + l.amount, 0);
              return {
                date,
                label: timeframe === 'week' ? 
                  new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0) : 
                  new Date(date).getDate().toString(),
                amount: dayAmount
              };
            });
          } else {
            // Last 12 Months
            const months = [...Array(12)].map((_, i) => {
              const d = new Date();
              d.setMonth(d.getUTCMonth() - i);
              return d.toISOString().substring(0, 7); // YYYY-MM
            }).reverse();

            displayData = months.map(monthStr => {
              const monthAmount = materialHistory
                .filter(l => l.type !== 'delivery' && l.timestamp.startsWith(monthStr))
                .reduce((sum, l) => sum + l.amount, 0);
              return {
                date: monthStr,
                label: new Date(monthStr).toLocaleDateString('en-US', { month: 'short' }).charAt(0),
                amount: monthAmount
              };
            });
          }

          const maxUsage = Math.max(...displayData.map(d => d.amount), 5);
          const avgBurn = totalOut > 0 ? (totalOut / (materialHistory.length || 1)).toFixed(1) : 0;

          return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
              {/* Header */}
              <View style={[styles.detailHeader, { backgroundColor: colors.accent }]}>
                <TouchableOpacity onPress={() => setDetailMaterial(null)}>
                  <ArrowLeft size={28} color={isDark ? '#fff' : colors.text} />
                </TouchableOpacity>
                <View>
                  <Text style={[styles.detailTitle, { color: isDark ? '#fff' : colors.text }]}>{detailMaterial.name}</Text>
                  <Text style={[styles.detailSubtitle, { color: isDark ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                    Full Inventory Lifecycle & Audit Trail
                  </Text>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Hero Metrics Dashboard */}
                <View style={styles.heroStats}>
                   <View style={[styles.statCard, { backgroundColor: isDark ? colors.card : '#F0FDF4' }]}>
                    <Text style={[styles.statVal, { color: colors.success }]}>{totalIn}</Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Received</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: isDark ? colors.card : '#EFF6FF' }]}>
                    <Text style={[styles.statVal, { color: isDark ? colors.primary : '#3B82F6' }]}>{detailMaterial.quantity}</Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Available</Text>
                  </View>
                 
                  <View style={[styles.statCard, { backgroundColor: isDark ? colors.card : '#FEF2F2' }]}>
                    <Text style={[styles.statVal, { color: colors.danger }]}>{totalOut}</Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Used</Text>
                  </View>
                </View>

                {/* Usage Trend Visualization */}
                <View style={[styles.chartSection, { backgroundColor: colors.card }]}>
                  <View style={styles.chartHeader}>
                    <View>
                      <Text style={[styles.chartTitle, { color: colors.text }]}>Usage Trend</Text>
                      <View style={styles.timeframePills}>
                        {(['week', 'month', 'year'] as const).map((t) => (
                           <TouchableOpacity 
                             key={t} 
                             onPress={() => setTimeframe(t)}
                             style={[styles.pill, timeframe === t && { backgroundColor: isDark ? colors.primary : '#0F172A' }]}
                           >
                             <Text style={[styles.pillText, { color: colors.textMuted }, timeframe === t && { color: isDark ? '#0F172A' : '#fff' }]}>
                               {t.toUpperCase()}
                             </Text>
                           </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <View style={styles.burnBadge}>
                      <Text style={styles.burnRateLabel}>AVG BURN RATE</Text>
                      <Text style={[styles.burnRateVal, { color: colors.text }]}>{avgBurn} {detailMaterial.unit}/day</Text>
                    </View>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                    <View style={[styles.chartContainer, { minWidth: timeframe === 'month' ? 600 : (timeframe === 'year' ? 300 : '100%') }]}>
                      {displayData.map((d, i) => (
                        <View key={i} style={styles.chartBarWrapper}>
                          <View style={styles.barBackground}>
                            <View 
                              style={[
                                styles.barFill, 
                                { 
                                  height: `${(d.amount / maxUsage) * 100}%`, 
                                  backgroundColor: d.amount > (parseFloat(avgBurn as string) * 1.5) ? colors.danger : colors.primary 
                                }
                              ]} 
                            />
                          </View>
                          <Text style={[styles.barLabel, { color: colors.textMuted }]}>{d.label}</Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* History Section */}
                <View style={styles.historyHeader}>
                  <HistoryIcon size={18} color={colors.secondary} />
                  <Text style={[styles.historyTitle, { color: colors.text }]}>Usage & Delivery History</Text>
                </View>

                {materialHistory.length === 0 ? (
                  <View style={styles.emptyHistory}>
                    <Package size={40} color={colors.textMuted} />
                    <Text style={[styles.emptyHistoryText, { color: colors.textMuted }]}>No records found for this item.</Text>
                  </View>
                ) : (
                  materialHistory.map((item) => {
                    const isDelivery = item.type === 'delivery';
                    const supervisor = users.find(u => u.id === item.supervisorId);
                    
                    return (
                      <View key={item.id} style={[styles.timelineItem, { backgroundColor: colors.card }]}>
                        <View style={[
                          styles.timelineIcon, 
                          { backgroundColor: isDelivery ? '#DCFCE7' : (item.type === 'damage' ? '#FEE2E2' : '#DBEAFE') }
                        ]}>
                          {isDelivery ? (
                            <ArrowUpRight size={20} color={colors.success} />
                          ) : (
                            <ArrowDownRight size={20} color={item.type === 'damage' ? colors.danger : '#3B82F6'} />
                          )}
                        </View>
                        
                        <View style={styles.timelineMain}>
                          <Text style={[styles.timelineName, { color: colors.text }]}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </Text>
                          <Text style={[styles.timelineMeta, { color: colors.textMuted }]}>
                            {new Date(item.timestamp).toLocaleDateString()} • {supervisor?.name || 'Admin'}
                          </Text>
                        </View>

                        <View style={styles.timelineAmount}>
                          <Text style={[
                            styles.timelineVal, 
                            { color: isDelivery ? colors.success : (item.type === 'damage' ? colors.danger : colors.text) }
                          ]}>
                            {isDelivery ? '+' : '-'}{item.amount}
                          </Text>
                          <Text style={[styles.timelineUnit, { color: colors.textMuted }]}>{detailMaterial.unit}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          );
        })()}
      </Modal>

      {/* Image Preview Modal */}
      <Modal visible={!!previewImage} transparent={false} animationType="fade">
        <View style={styles.previewOverlay}>
          <TouchableOpacity style={styles.closePreview} onPress={() => setPreviewImage(null)}>
            <X size={30} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: previewImage || undefined }} style={styles.fullImage} />
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryHeader: { padding: 20, paddingTop: 20, paddingBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  summaryMetrics: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, borderRadius: 12 },
  metric: { alignItems: 'center' },
  metricBig: { fontSize: 24, fontWeight: 'bold' },
  metricSmall: { fontSize: 10, marginTop: 4, fontWeight: '700' },

  tabContainer: { flexDirection: 'row', margin: 20, borderRadius: 8, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  tabInner: { flexDirection: 'row', alignItems: 'center' },
  tabText: { fontWeight: 'bold' },
  
  
  // Detail Modal Styles
  detailHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, gap: 15 },
  detailTitle: { fontSize: 22, fontWeight: 'bold' },
  detailSubtitle: { fontSize: 13, marginTop: 2 },
  
  heroStats: { flexDirection: 'row', padding: 20, gap: 15 },
  statCard: { flex: 1, padding: 15, borderRadius: 16, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 15, marginTop: 10 },
  historyTitle: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  
  timelineItem: { flexDirection: 'row', padding: 15, borderRadius: 12, marginBottom: 10, marginHorizontal: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  timelineIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  timelineMain: { flex: 1 },
  timelineName: { fontSize: 15, fontWeight: 'bold' },
  timelineMeta: { fontSize: 11, marginTop: 2 },
  timelineAmount: { alignItems: 'flex-end' },
  timelineVal: { fontSize: 16, fontWeight: 'bold' },
  timelineUnit: { fontSize: 10, fontWeight: '600' },
  
  emptyHistory: { alignItems: 'center', padding: 40, opacity: 0.5 },
  emptyHistoryText: { marginTop: 10, fontSize: 14, fontWeight: '600' },

  // Chart Styles
  chartSection: { margin: 20, padding: 20, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  chartTitle: { fontSize: 17, fontWeight: 'bold' },
  chartSubtitle: { fontSize: 12, marginTop: 2 },
  burnBadge: { alignItems: 'flex-end' },
  burnRateLabel: { fontSize: 9, fontWeight: '800', color: '#9CA3AF', letterSpacing: 0.5 },
  burnRateVal: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingHorizontal: 5 },
  chartBarWrapper: { alignItems: 'center', flex: 1 },
  barBackground: { width: 12, height: '100%', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, marginTop: 8, fontWeight: '600' },

  timeframePills: { flexDirection: 'row', gap: 5, marginTop: 10 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)' },
  pillText: { fontSize: 9, fontWeight: 'bold' },
  
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyIcon: { marginBottom: 15 },
  emptyText: { fontSize: 16 },
  
  card: { padding: 20, borderRadius: 12, marginHorizontal: 20, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  materialName: { fontSize: 18, fontWeight: 'bold' },
  materialUnit: { fontSize: 14, marginTop: 4 },
  stockBox: { padding: 10, borderRadius: 8, alignItems: 'center', minWidth: 80 },
  stockNum: { fontSize: 22, fontWeight: 'bold' },
  stockLabel: { fontSize: 10 },

  logCard: { padding: 15, borderRadius: 12, marginHorizontal: 20, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  logMaterial: { fontSize: 16, fontWeight: 'bold' },
  logDate: { fontSize: 12, marginTop: 2 },
  logAmount: { fontSize: 18, fontWeight: 'bold' },
  logDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  logTypeBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  logSupervisor: { fontSize: 12, fontStyle: 'italic' },
  logNotes: { marginTop: 10, fontSize: 13, fontStyle: 'italic' },
  logPhotosRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  miniPhoto: { width: 40, height: 40, borderRadius: 6, borderWidth: 1 },

  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 5 
  },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 15 },
  
  switchRow: { flexDirection: 'row', marginBottom: 20, borderRadius: 8, padding: 4 },
  switchBtn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 6 },
  switchTxt: { fontWeight: 'bold' },

  searchInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 15, height: 45 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  matOption: { borderWidth: 1, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 },

  typeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 15 },
  typeBtn: { flex: 1, borderWidth: 1, padding: 10, alignItems: 'center', borderRadius: 8 },

  uploadBtn: { padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderStyle: 'dotted', justifyContent: 'center', flexDirection: 'row' },
  uploadBtnText: { fontWeight: 'bold', fontSize: 13 },
  deletePhotoBtn: {position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center'},
  photoThumbLabel: {position: 'absolute', bottom: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden'},

  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 15, marginBottom: 40 },
  modalBtn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  modalBtnText: { fontWeight: 'bold', fontSize: 16 },

  // Image Preview Style
  previewOverlay: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '80%', resizeMode: 'contain' },
  closePreview: { position: 'absolute', top: 50, right: 30, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 25 }
});
