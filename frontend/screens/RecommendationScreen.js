import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Card, Chip, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as DB from '../services/database';

export default function RecommendationScreen({ route, navigation }) {
  const { plotCropId } = route.params;
  const [targets, setTargets] = useState([]);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [moaHistory, setMoaHistory] = useState([]);
  const [usedMoACodes, setUsedMoACodes] = useState([]);

  useEffect(() => {
    loadTargets();
  }, []);

  useEffect(() => {
    if (selectedTargetId) {
      loadRecommendations();
      loadMoAHistory();
    }
  }, [selectedTargetId]);

  const loadTargets = async () => {
    try {
      const data = await DB.getAllTargets();
      setTargets(data);
    } catch (error) {
      console.error('Error loading targets:', error);
    }
  };

  const loadMoAHistory = async () => {
    if (!selectedTargetId) return;

    try {
      const history = await DB.getMoAUsageHistory(
        plotCropId,
        parseInt(selectedTargetId),
        5
      );
      setMoaHistory(history);

      const recentMoACodes = history
        .slice(0, 2)
        .map((h) => h.moa_code_snapshot)
        .filter((code) => code);
      setUsedMoACodes([...new Set(recentMoACodes)]);
    } catch (error) {
      console.error('Error loading MoA history:', error);
    }
  };

  const loadRecommendations = async () => {
    if (!selectedTargetId) return;

    try {
      const recentMoA = usedMoACodes.length > 0 ? usedMoACodes : [];
      const products = await DB.getRecommendedProducts(
        parseInt(selectedTargetId),
        plotCropId,
        recentMoA
      );
      setRecommendedProducts(products);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const getMoAStatusColor = (product) => {
    if (product.recently_used === 1) {
      return '#FFEBEE';
    }
    return '#E8F5E9';
  };

  const getMoAStatusText = (product) => {
    if (product.recently_used === 1) {
      return '⚠️ ใช้ไปแล้ว';
    }
    return '✅ แนะนำ';
  };

  const renderProductCard = (product, index) => (
    <Card
      key={product.product_id}
      style={[
        styles.productCard,
        { backgroundColor: getMoAStatusColor(product) }
      ]}
    >
      <Card.Content>
        <View style={styles.productHeader}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.product_name}</Text>
            <Text style={styles.activeIngredient}>
              {product.active_ingredient}
            </Text>
          </View>
        </View>

        <View style={styles.productDetails}>
          <View style={styles.moaSection}>
            <Chip
              style={styles.moaChip}
              textStyle={styles.moaChipText}
              icon="atom"
            >
              {product.moa_code}
            </Chip>
            <Text style={styles.moaName}>{product.moa_name_th}</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusText}>
              {getMoAStatusText(product)}
            </Text>
            {product.efficacy_rating && (
              <View style={styles.efficacyBadge}>
                <Ionicons name="star" size={14} color="#FFA000" />
                <Text style={styles.efficacyText}>
                  {product.efficacy_rating}/5
                </Text>
              </View>
            )}
          </View>

          {product.recommended_rate_min && (
            <Text style={styles.rateText}>
              อัตรา: {product.recommended_rate_min}-
              {product.recommended_rate_max} {product.rate_unit}
            </Text>
          )}

          {product.phi_days && (
            <Text style={styles.phiText}>
              PHI: {product.phi_days} วัน
            </Text>
          )}
        </View>

        {product.recently_used === 0 && (
          <View style={styles.reasonSection}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.reasonText}>
              ช่วยลดความเสี่ยงการดื้อยา เพราะใช้กลุ่ม MoA ต่างจากครั้งก่อน
            </Text>
          </View>
        )}

        {product.recently_used === 1 && (
          <View style={styles.warningSection}>
            <Ionicons name="warning" size={16} color="#f44336" />
            <Text style={styles.warningText}>
              ไม่ควรใช้ติดต่อกัน เพื่อป้องกันการดื้อยา
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <Ionicons name="bulb" size={28} color="#FF9800" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>คำแนะนำสารเคมี</Text>
                <Text style={styles.headerSubtitle}>
                  ตามหลัก MoA Rotation
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.selectorCard}>
          <Card.Content>
            <Text style={styles.label}>เลือกศัตรูพืชเป้าหมาย</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedTargetId}
                onValueChange={setSelectedTargetId}
                style={styles.picker}
              >
                <Picker.Item label="-- เลือกศัตรูพืช --" value="" />
                {targets.map((target) => (
                  <Picker.Item
                    key={target.target_id}
                    label={`${target.target_name_th} (${target.target_type})`}
                    value={target.target_id.toString()}
                  />
                ))}
              </Picker>
            </View>
          </Card.Content>
        </Card>

        {selectedTargetId && moaHistory.length > 0 && (
          <Card style={styles.historyCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>
                ประวัติการใช้ MoA (5 ครั้งล่าสุด)
              </Text>
              {moaHistory.map((history, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyDate}>
                    <Ionicons name="calendar" size={14} color="#666" />
                    <Text style={styles.historyDateText}>
                      {new Date(history.application_date).toLocaleDateString('th-TH')}
                    </Text>
                  </View>
                  <Chip
                    style={styles.historyMoaChip}
                    textStyle={{ fontSize: 12 }}
                  >
                    {history.moa_code_snapshot}
                  </Chip>
                  <Text style={styles.historyProduct}>
                    {history.product_name_snapshot}
                  </Text>
                </View>
              ))}

              {usedMoACodes.length > 0 && (
                <View style={styles.usedMoaSection}>
                  <Text style={styles.usedMoaTitle}>
                    MoA ที่ใช้ล่าสุด (ควรหลีกเลี่ยง):
                  </Text>
                  <View style={styles.usedMoaTags}>
                    {usedMoACodes.map((code, index) => (
                      <Chip
                        key={index}
                        style={styles.usedMoaChip}
                        textStyle={{ color: '#f44336', fontSize: 12 }}
                        icon="close-circle"
                      >
                        {code}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {selectedTargetId && recommendedProducts.length > 0 && (
          <View style={styles.recommendationsSection}>
            <View style={styles.recommendationsHeader}>
              <Text style={styles.recommendationsTitle}>
                ผลิตภัณฑ์ที่แนะนำ
              </Text>
              <Chip
                style={styles.countChip}
                textStyle={{ fontSize: 12, color: '#4CAF50' }}
              >
                {recommendedProducts.filter((p) => p.recently_used === 0).length} รายการ
              </Chip>
            </View>

            {recommendedProducts.map((product, index) =>
              renderProductCard(product, index)
            )}
          </View>
        )}

        {selectedTargetId && recommendedProducts.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContent}>
                <Ionicons name="flask-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>ไม่พบคำแนะนำ</Text>
                <Text style={styles.emptySubText}>
                  ยังไม่มีผลิตภัณฑ์สำหรับศัตรูพืชนี้
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#FFF3E0',
    elevation: 2
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    marginLeft: 12
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  selectorCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  picker: {
    height: 50
  },
  historyCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100
  },
  historyDateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  },
  historyMoaChip: {
    height: 24,
    backgroundColor: '#E3F2FD',
    marginRight: 8
  },
  historyProduct: {
    fontSize: 13,
    color: '#666',
    flex: 1
  },
  usedMoaSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8
  },
  usedMoaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c62828',
    marginBottom: 8
  },
  usedMoaTags: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  usedMoaChip: {
    backgroundColor: '#FFCDD2',
    marginRight: 8,
    marginBottom: 4,
    height: 28
  },
  recommendationsSection: {
    padding: 16,
    paddingTop: 8
  },
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  countChip: {
    backgroundColor: '#E8F5E9',
    height: 28
  },
  productCard: {
    marginBottom: 16,
    elevation: 3
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  activeIngredient: {
    fontSize: 13,
    color: '#666'
  },
  productDetails: {
    marginTop: 8
  },
  moaSection: {
    marginBottom: 8
  },
  moaChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#2196F3',
    marginBottom: 6
  },
  moaChipText: {
    color: 'white',
    fontWeight: 'bold'
  },
  moaName: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic'
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  efficacyBadge: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  efficacyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8F00',
    marginLeft: 4
  },
  rateText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4
  },
  phiText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2
  },
  reasonSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#C8E6C9',
    padding: 10,
    borderRadius: 8,
    marginTop: 12
  },
  reasonText: {
    fontSize: 13,
    color: '#2E7D32',
    marginLeft: 8,
    flex: 1
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFCDD2',
    padding: 10,
    borderRadius: 8,
    marginTop: 12
  },
  warningText: {
    fontSize: 13,
    color: '#c62828',
    marginLeft: 8,
    flex: 1
  },
  emptyCard: {
    margin: 16,
    elevation: 1
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40
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