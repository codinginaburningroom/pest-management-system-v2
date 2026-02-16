import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Card, Chip, Searchbar, SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/database';

export default function ProductListScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMoAGroup, setSelectedMoAGroup] = useState(null);
  const [moaGroups, setMoaGroups] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null); // เปลี่ยนเป็น target
  const [targets, setTargets] = useState([]); // เก็บรายการศัตรูพืช
  const [productTargets, setProductTargets] = useState({}); // เก็บความสัมพันธ์ product-target

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const runFilter = async () => {
      await filterProducts();
    };
    runFilter();
  }, [products, searchQuery, selectedType, selectedMoAGroup, selectedTarget]);

  const loadProducts = async () => {
    try {
      const data = await DB.getAllProducts();
      setProducts(data);
      
      // ดึง MoA groups ที่ไม่ซ้ำจากผลิตภัณฑ์
      const uniqueMoAs = [];
      const moaMap = new Map();
      
      data.forEach(product => {
        if (product.moa_code && !moaMap.has(product.moa_code)) {
          moaMap.set(product.moa_code, {
            moa_code: product.moa_code,
            classification_system: product.classification_system,
            moa_name_th: product.moa_name_th
          });
        }
      });
      
      setMoaGroups(Array.from(moaMap.values()));
      
      // ดึงรายการศัตรูพืชทั้งหมด
      const allTargets = await DB.getAllTargets();
      setTargets(allTargets);
      
      // ดึงความสัมพันธ์ product-target สำหรับแต่ละผลิตภัณฑ์
      const productTargetMap = {};
      for (const product of data) {
        const targetsForProduct = await DB.getTargetsForProduct(product.product_id);
        productTargetMap[product.product_id] = targetsForProduct;
      }
      setProductTargets(productTargetMap);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const filterProducts = async () => {
    let filtered = products;

    if (selectedType !== 'all') {
      filtered = filtered.filter((p) => p.product_type === selectedType);
    }

    // กรองตาม MoA group ถ้ามีการเลือก
    if (selectedMoAGroup) {
      filtered = filtered.filter((p) => p.moa_code === selectedMoAGroup);
    }

    // กรองตามศัตรูพืช (target)
    if (selectedTarget) {
      try {
        const targetProducts = await DB.getProductsForTarget(selectedTarget);
        const targetProductIds = new Set(targetProducts.map(p => p.product_id));
        filtered = filtered.filter((p) => targetProductIds.has(p.product_id));
      } catch (error) {
        console.error('Error filtering by target:', error);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.active_ingredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.moa_code && p.moa_code.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredProducts(filtered);
  };

  const getProductTypeIcon = (type) => {
    switch (type) {
      case 'insecticide':
        return 'bug';
      case 'fungicide':
        return 'leaf';
      case 'herbicide':
        return 'flower';
      default:
        return 'flask';
    }
  };

  const getProductTypeLabel = (type) => {
    switch (type) {
      case 'insecticide':
        return 'ฆ่าแมลง';
      case 'fungicide':
        return 'ฆ่าเชื้อรา';
      case 'herbicide':
        return 'ฆ่าวัชพืช';
      default:
        return 'อื่นๆ';
    }
  };

  const getProductTypeColor = (type) => {
    switch (type) {
      case 'insecticide':
        return '#FF6B6B';
      case 'fungicide':
        return '#4ECDC4';
      case 'herbicide':
        return '#95E1D3';
      default:
        return '#95A5A6';
    }
  };

  // เพิ่ม function สำหรับกรองตาม MoA group
  const filterByMoAGroup = (moaCode) => {
    if (selectedMoAGroup === moaCode) {
      setSelectedMoAGroup(null); // ยกเลิกการกรองถ้ากดซ้ำ
    } else {
      setSelectedMoAGroup(moaCode); // กรองตาม MoA code ที่เลือก
    }
  };

  // เพิ่ม function สำหรับกรองตามศัตรูพืช
  const filterByTarget = (targetId) => {
    if (selectedTarget === targetId) {
      setSelectedTarget(null); // ยกเลิกการกรองถ้ากดซ้ำ
    } else {
      setSelectedTarget(targetId); // กรองตาม target_id ที่เลือก
    }
  };

  // Helper function สำหรับสี icon ของศัตรูพืชตามประเภท
  const getTargetColor = (targetType) => {
    switch (targetType) {
      case 'insect':
        return '#E74C3C';
      case 'fungus':
        return '#27AE60';
      case 'weed':
        return '#F39C12';
      default:
        return '#95A5A6';
    }
  };

  const getMoASystemColor = (system) => {
    switch (system) {
      case 'IRAC':
        return '#2196F3';
      case 'FRAC':
        return '#4CAF50';
      case 'HRAC':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const renderProductItem = ({ item }) => (
    <Card style={styles.productCard}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.productHeader}>
          <View style={styles.productTitleRow}>
            <View
              style={[
                styles.typeIcon,
                { backgroundColor: getProductTypeColor(item.product_type) }
              ]}
            >
              <Ionicons
                name={getProductTypeIcon(item.product_type)}
                size={20}
                color="white"
              />
            </View>
            <View style={styles.productTitleInfo}>
              <Text style={styles.productName}>{item.product_name}</Text>
              <Text style={styles.manufacturer}>{item.manufacturer}</Text>
            </View>
          </View>
          <Chip
            style={[
              styles.typeChip,
              { backgroundColor: getProductTypeColor(item.product_type) + '30' }
            ]}
            textStyle={{
              color: getProductTypeColor(item.product_type),
              fontSize: 12,
              lineHeight: 16,
              includeFontPadding: false
            }}
          >
            {getProductTypeLabel(item.product_type)}
          </Chip>
        </View>

        <View style={styles.ingredientSection}>
          <Ionicons name="flask-outline" size={16} color="#666" />
          <Text style={styles.activeIngredient}>{item.active_ingredient}</Text>
        </View>

        {item.concentration && (
          <View style={styles.concentrationRow}>
            <Text style={styles.concentration}>
              ความเข้มข้น: {item.concentration}
            </Text>
          </View>
        )}

        {item.moa_code && (
          <View style={styles.moaSection}>
            <View style={styles.moaHeader}>
              <Chip
                style={[
                  styles.moaSystemChip,
                  {
                    backgroundColor:
                      getMoASystemColor(item.classification_system) + '20'
                  }
                ]}
                textStyle={{
                  color: getMoASystemColor(item.classification_system),
                  fontWeight: 'bold',
                  fontSize: 12,
                  lineHeight: 16,
                  includeFontPadding: false
                }}
              >
                {item.classification_system}
              </Chip>
              <TouchableOpacity onPress={() => filterByMoAGroup(item.moa_code)}>
                <Chip
                  style={[
                    styles.moaCodeChip,
                    {
                      backgroundColor: getMoASystemColor(item.classification_system),
                      opacity: selectedMoAGroup === item.moa_code ? 1 : 0.9
                    }
                  ]}
                  textStyle={{ 
                    color: 'white', 
                    fontWeight: 'bold', 
                    fontSize: 13,
                    lineHeight: 18,
                    includeFontPadding: false
                  }}
                >
                  {item.moa_code}
                </Chip>
              </TouchableOpacity>
            </View>
            <Text style={styles.moaName}>{item.moa_name_th}</Text>
          </View>
        )}

        {item.recommended_rate_min && (
          <View style={styles.rateSection}>
            <View style={styles.rateRow}>
              <Ionicons name="water-outline" size={16} color="#4CAF50" />
              <Text style={styles.rateText}>
                อัตราการใช้: {item.recommended_rate_min}-
                {item.recommended_rate_max} {item.rate_unit}
              </Text>
            </View>
          </View>
        )}

        {item.phi_days && (
          <View style={styles.phiSection}>
            <Ionicons name="time-outline" size={16} color="#FF9800" />
            <Text style={styles.phiText}>
              ระยะเว้นการเก็บเกี่ยว (PHI): {item.phi_days} วัน
            </Text>
          </View>
        )}

        {item.registration_number && (
          <Text style={styles.registration}>
            ทะเบียน: {item.registration_number}
          </Text>
        )}

        {productTargets[item.product_id] && productTargets[item.product_id].length > 0 && (
          <View style={styles.targetSection}>
            <View style={styles.targetHeader}>
              <Ionicons name="bug-outline" size={16} color="#666" />
              <Text style={styles.targetHeaderText}>ใช้กับ:</Text>
            </View>
            <View style={styles.targetChipsContainer}>
              {productTargets[item.product_id].map((target) => (
                <TouchableOpacity
                  key={target.target_id}
                  onPress={() => filterByTarget(target.target_id)}
                >
                  <Chip
                    style={[
                      styles.targetChip,
                      {
                        backgroundColor: selectedTarget === target.target_id
                          ? getTargetColor(target.target_type)
                          : getTargetColor(target.target_type) + '15'
                      }
                    ]}
                    textStyle={{
                      color: '#fff',
                      fontSize: 11,
                      lineHeight: 16,
                      includeFontPadding: false
                    }}
                  >
                    {target.target_name_th}
                    {target.efficacy_rating && ` ⭐${target.efficacy_rating}`}
                  </Chip>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="ค้นหาผลิตภัณฑ์, สารออกฤทธิ์, MoA..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <SegmentedButtons
          value={selectedType}
          onValueChange={setSelectedType}
          buttons={[
            { value: 'all', label: 'ทั้งหมด' },
            {
              value: 'insecticide',
              label: 'ฆ่าแมลง',
              icon: 'bug'
            },
            {
              value: 'fungicide',
              label: 'ฆ่าเชื้อรา',
              icon: 'leaf'
            }
          ]}
          style={styles.segmentedButtons}
        />

        {moaGroups.length > 0 && (
          <View style={styles.moaFilterSection}>
            <Text style={styles.moaFilterTitle}>กรองตามกลุ่ม MoA:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.moaFilterScroll}
            >
              {moaGroups.map((moa) => (
                <TouchableOpacity
                  key={moa.moa_code}
                  onPress={() => filterByMoAGroup(moa.moa_code)}
                  style={styles.moaFilterChipContainer}
                >
                  <Chip
                    selected={selectedMoAGroup === moa.moa_code}
                    style={[
                      styles.moaFilterChip,
                      {
                        backgroundColor: selectedMoAGroup === moa.moa_code
                          ? getMoASystemColor(moa.classification_system)
                          : getMoASystemColor(moa.classification_system) + '20'
                      }
                    ]}
                    textStyle={{
                      color: selectedMoAGroup === moa.moa_code ? 'white' : getMoASystemColor(moa.classification_system),
                      fontWeight: 'bold',
                      fontSize: 13,
                      lineHeight: 18,
                      includeFontPadding: false
                    }}
                  >
                    {moa.classification_system} {moa.moa_code}
                  </Chip>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {targets.length > 0 && (
          <View style={styles.targetFilterSection}>
            <Text style={styles.moaFilterTitle}>กรองตามศัตรูพืช:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.moaFilterScroll}
            >
              {targets.map((target) => (
                <TouchableOpacity
                  key={target.target_id}
                  onPress={() => filterByTarget(target.target_id)}
                  style={styles.moaFilterChipContainer}
                >
                  <Chip
                    selected={selectedTarget === target.target_id}
                    style={[
                      styles.moaFilterChip,
                      {
                        backgroundColor: selectedTarget === target.target_id
                          ? getTargetColor(target.target_type)
                          : getTargetColor(target.target_type) + '20'
                      }
                    ]}
                    textStyle={{
                      color: selectedTarget === target.target_id ? 'white' : getTargetColor(target.target_type),
                      fontWeight: '600',
                      fontSize: 12,
                      lineHeight: 18,
                      includeFontPadding: false
                    }}
                  >
                    {target.target_name_th}
                  </Chip>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.resultInfo}>
          <Text style={styles.resultText}>
            พบ {filteredProducts.length} รายการ
            {selectedMoAGroup && ` (MoA: ${selectedMoAGroup})`}
            {selectedTarget && ` (${targets.find(t => t.target_id === selectedTarget)?.target_name_th})`}
          </Text>
          {(selectedMoAGroup || selectedTarget) && (
            <TouchableOpacity
              onPress={() => {
                setSelectedMoAGroup(null);
                setSelectedTarget(null);
              }}
              style={styles.clearFilterButton}
            >
              <Text style={styles.clearFilterText}>ล้างตัวกรอง</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.product_id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="flask-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>ไม่พบผลิตภัณฑ์</Text>
            <Text style={styles.emptySubText}>ลองค้นหาด้วยคำอื่น</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingBottom: 8,
    elevation: 2
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5'
  },
  segmentedButtons: {
    marginTop: 12
  },
  moaFilterSection: {
    marginTop: 12
  },
  moaFilterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8
  },
  moaFilterScroll: {
    flexDirection: 'row'
  },
  moaFilterChipContainer: {
    marginRight: 8
  },
  moaFilterChip: {
    minHeight: 32,
    justifyContent: 'center'
  },
  targetFilterSection: {
    marginTop: 12
  },
  resultInfo: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resultText: {
    fontSize: 13,
    color: '#666',
    flex: 1
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 12
  },
  clearFilterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  listContainer: {
    padding: 16
  },
  productCard: {
    marginBottom: 12,
    elevation: 2
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 12
  },
  productHeader: {
    marginBottom: 6
  },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  productTitleInfo: {
    flex: 1
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    lineHeight: 20,
    includeFontPadding: false
  },
  manufacturer: {
    fontSize: 13,
    color: '#666',
    lineHeight: 16,
    includeFontPadding: false
  },
  typeChip: {
    alignSelf: 'flex-start',
    minHeight: 26,
    justifyContent: 'center'
  },
  ingredientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8
  },
  activeIngredient: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18
  },
  concentrationRow: {
    marginBottom: 6
  },
  concentration: {
    fontSize: 13,
    color: '#666',
    lineHeight: 16
  },
  moaSection: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 8,
    marginVertical: 6
  },
  moaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  moaSystemChip: {
    minHeight: 26,
    marginRight: 8,
    justifyContent: 'center'
  },
  moaCodeChip: {
    minHeight: 28,
    justifyContent: 'center'
  },
  moaName: {
    fontSize: 13,
    color: '#2E7D32',
    fontStyle: 'italic',
    lineHeight: 16
  },
  rateSection: {
    marginTop: 6
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rateText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
    lineHeight: 18
  },
  phiSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 6
  },
  phiText: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
    fontWeight: '500',
    lineHeight: 16
  },
  registration: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 16
  },
  targetSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5'
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  targetHeaderText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600'
  },
  targetChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  targetChip: {
    minHeight: 24,
    marginRight: 6,
    marginBottom: 4
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    lineHeight: 24
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    lineHeight: 20
  }
});