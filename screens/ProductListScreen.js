import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { Card, Chip, Searchbar, SegmentedButtons } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/database';

export default function ProductListScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedType]);

  const loadProducts = async () => {
    try {
      const data = await DB.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedType !== 'all') {
      filtered = filtered.filter((p) => p.product_type === selectedType);
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
      <Card.Content>
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
              fontSize: 11
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
                  fontSize: 11
                }}
              >
                {item.classification_system}
              </Chip>
              <Chip
                style={[
                  styles.moaCodeChip,
                  {
                    backgroundColor: getMoASystemColor(item.classification_system)
                  }
                ]}
                textStyle={{ color: 'white', fontWeight: 'bold' }}
              >
                {item.moa_code}
              </Chip>
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

        <View style={styles.resultInfo}>
          <Text style={styles.resultText}>
            พบ {filteredProducts.length} รายการ
          </Text>
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
  resultInfo: {
    marginTop: 8
  },
  resultText: {
    fontSize: 13,
    color: '#666'
  },
  listContainer: {
    padding: 16
  },
  productCard: {
    marginBottom: 16,
    elevation: 2
  },
  productHeader: {
    marginBottom: 12
  },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  productTitleInfo: {
    flex: 1
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2
  },
  manufacturer: {
    fontSize: 13,
    color: '#666'
  },
  typeChip: {
    alignSelf: 'flex-start',
    height: 24
  },
  ingredientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8
  },
  activeIngredient: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '600',
    flex: 1
  },
  concentrationRow: {
    marginBottom: 8
  },
  concentration: {
    fontSize: 13,
    color: '#666'
  },
  moaSection: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8
  },
  moaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  moaSystemChip: {
    height: 24,
    marginRight: 8
  },
  moaCodeChip: {
    height: 28
  },
  moaName: {
    fontSize: 13,
    color: '#2E7D32',
    fontStyle: 'italic'
  },
  rateSection: {
    marginTop: 8
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rateText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500'
  },
  phiSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 6
  },
  phiText: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
    fontWeight: '500'
  },
  registration: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic'
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
    marginTop: 16
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8
  }
});