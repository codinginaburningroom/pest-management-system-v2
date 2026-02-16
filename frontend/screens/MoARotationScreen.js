import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import { Card, Chip, DataTable } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/database';

export default function MoARotationScreen() {
  const [moaGroups, setMoaGroups] = useState([]);
  const [iracGroups, setIracGroups] = useState([]);
  const [fracGroups, setFracGroups] = useState([]);

  useEffect(() => {
    loadMoAGroups();
  }, []);

  const loadMoAGroups = async () => {
    try {
      const all = await DB.getAllMoAGroups();
      setMoaGroups(all);

      const irac = await DB.getMoAGroupsBySystem('IRAC');
      setIracGroups(irac);

      const frac = await DB.getMoAGroupsBySystem('FRAC');
      setFracGroups(frac);
    } catch (error) {
      console.error('Error loading MoA groups:', error);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const getRiskLabel = (risk) => {
    switch (risk) {
      case 'high':
        return 'สูง';
      case 'medium':
        return 'ปานกลาง';
      case 'low':
        return 'ต่ำ';
      default:
        return '-';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <Ionicons name="information-circle" size={32} color="#2196F3" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>MoA คืออะไร?</Text>
              <Text style={styles.headerSubtitle}>
                Mode of Action - กลไกการออกฤทธิ์ของสารเคมี
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📚 ความหมาย</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Mode of Action (MoA)</Text> คือ
            กลไกการทำงานของสารเคมีกำจัดศัตรูพืชต่อจุดเป้าหมายในร่างกายแมลงหรือเชื้อรา
            การเข้าใจ MoA จะช่วยให้เราสามารถหมุนเวียนการใช้สารเคมีอย่างถูกต้อง
            เพื่อป้องกันการดื้อยา
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🔄 หลักการหมุนเวียน MoA</Text>
          
          <View style={styles.principleBox}>
            <View style={styles.principleItem}>
              <View style={styles.principleNumber}>
                <Text style={styles.principleNumberText}>1</Text>
              </View>
              <Text style={styles.principleText}>
                <Text style={styles.bold}>ไม่ใช้ MoA เดิมติดต่อกัน</Text>
                {'\n'}หลีกเลี่ยงการใช้สารที่มีกลไกเดียวกันซ้ำๆ
              </Text>
            </View>

            <View style={styles.principleItem}>
              <View style={styles.principleNumber}>
                <Text style={styles.principleNumberText}>2</Text>
              </View>
              <Text style={styles.principleText}>
                <Text style={styles.bold}>สลับกลุ่ม MoA</Text>
                {'\n'}ใช้สารที่มีกลไกต่างกันอย่างน้อย 2-3 กลุ่ม
              </Text>
            </View>

            <View style={styles.principleItem}>
              <View style={styles.principleNumber}>
                <Text style={styles.principleNumberText}>3</Text>
              </View>
              <Text style={styles.principleText}>
                <Text style={styles.bold}>จำกัดจำนวนครั้ง</Text>
                {'\n'}ใช้ MoA เดียวกันไม่เกิน 2-3 ครั้งต่อฤดูกาล
              </Text>
            </View>
          </View>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleTitle}>ตัวอย่างการหมุนเวียน</Text>
            <View style={styles.rotationExample}>
              <View style={styles.rotationStep}>
                <Text style={styles.rotationStepNumber}>ครั้งที่ 1</Text>
                <Chip style={styles.moaChipIRAC} textStyle={styles.moaChipText}>4A (Neonicotinoids)</Chip>
              </View>
              <Ionicons name="arrow-down" size={24} color="#4CAF50" />
              <View style={styles.rotationStep}>
                <Text style={styles.rotationStepNumber}>ครั้งที่ 2</Text>
                <Chip style={styles.moaChipIRAC} textStyle={styles.moaChipText}>28 (Diamides)</Chip>
              </View>
              <Ionicons name="arrow-down" size={24} color="#4CAF50" />
              <View style={styles.rotationStep}>
                <Text style={styles.rotationStepNumber}>ครั้งที่ 3</Text>
                <Chip style={styles.moaChipIRAC} textStyle={styles.moaChipText}>5 (Spinosyns)</Chip>
              </View>
              <Ionicons name="arrow-down" size={24} color="#4CAF50" />
              <View style={styles.rotationStep}>
                <Text style={styles.rotationStepNumber}>ครั้งที่ 4</Text>
                <Chip style={styles.moaChipIRAC} textStyle={styles.moaChipText}>4A (Neonicotinoids)</Chip>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🎯 IRAC vs FRAC</Text>
          
          <View style={styles.comparisonBox}>
            <View style={styles.comparisonItem}>
              <Chip
                style={styles.iracBadge}
                textStyle={{ color: 'white', fontWeight: 'bold' }}
              >
                IRAC
              </Chip>
              <Text style={styles.comparisonTitle}>
                Insecticide Resistance Action Committee
              </Text>
              <Text style={styles.comparisonDesc}>
                จัดกลุ่มสารกำจัดแมลง ตามกลไกการออกฤทธิ์
              </Text>
              <Text style={styles.comparisonExample}>
                ตัวอย่าง: 4A, 28, 3A, 1B
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.comparisonItem}>
              <Chip
                style={styles.fracBadge}
                textStyle={{ color: 'white', fontWeight: 'bold' }}
              >
                FRAC
              </Chip>
              <Text style={styles.comparisonTitle}>
                Fungicide Resistance Action Committee
              </Text>
              <Text style={styles.comparisonDesc}>
                จัดกลุ่มสารกำจัดเชื้อรา ตามกลไกการออกฤทธิ์
              </Text>
              <Text style={styles.comparisonExample}>
                ตัวอย่าง: 11, 7, 3, M
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.tableCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>
            📋 กลุ่ม IRAC (สารกำจัดแมลง)
          </Text>
          <DataTable>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title style={styles.codeColumnHeader}>รหัส</DataTable.Title>
              <DataTable.Title style={styles.nameColumnHeader}>กลุ่ม MoA</DataTable.Title>
              <DataTable.Title style={styles.riskColumnHeader}>ความเสี่ยง</DataTable.Title>
            </DataTable.Header>

            {iracGroups.map((group) => (
              <DataTable.Row key={group.moa_group_id} style={styles.tableRow}>
                <DataTable.Cell style={styles.codeColumn}>
                  <Chip
                    style={styles.codeChip}
                    textStyle={styles.codeChipText}
                  >
                    {group.moa_code}
                  </Chip>
                </DataTable.Cell>
                <DataTable.Cell style={styles.nameColumn}>
                  <Text style={styles.tableCellText} numberOfLines={0}>
                    {group.moa_name_th}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.riskColumn}>
                  <View
                    style={[
                      styles.riskChip,
                      { backgroundColor: getRiskColor(group.resistance_risk) }
                    ]}
                  >
                    <Text style={styles.riskChipText}>
                      {getRiskLabel(group.resistance_risk)}
                    </Text>
                  </View>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>

      <Card style={styles.tableCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>
            📋 กลุ่ม FRAC (สารกำจัดเชื้อรา)
          </Text>
          <DataTable>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title style={styles.codeColumnHeader}>รหัส</DataTable.Title>
              <DataTable.Title style={styles.nameColumnHeader}>กลุ่ม MoA</DataTable.Title>
              <DataTable.Title style={styles.riskColumnHeader}>ความเสี่ยง</DataTable.Title>
            </DataTable.Header>

            {fracGroups.map((group) => (
              <DataTable.Row key={group.moa_group_id} style={styles.tableRow}>
                <DataTable.Cell style={styles.codeColumn}>
                  <Chip
                    style={[styles.codeChip, { backgroundColor: '#4CAF50' }]}
                    textStyle={styles.codeChipText}
                  >
                    {group.moa_code}
                  </Chip>
                </DataTable.Cell>
                <DataTable.Cell style={styles.nameColumn}>
                  <Text style={styles.tableCellText} numberOfLines={0}>
                    {group.moa_name_th}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.riskColumn}>
                  <View
                    style={[
                      styles.riskChip,
                      { backgroundColor: getRiskColor(group.resistance_risk) }
                    ]}
                  >
                    <Text style={styles.riskChipText}>
                      {getRiskLabel(group.resistance_risk)}
                    </Text>
                  </View>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>

      <Card style={styles.tipCard}>
        <Card.Content>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={24} color="#FF9800" />
            <Text style={styles.tipTitle}>💡 เคล็ดลับ</Text>
          </View>
          <View style={styles.tipList}>
            <Text style={styles.tipItem}>
              ✅ ตรวจดูรหัส MoA ที่ฉลากผลิตภัณฑ์
            </Text>
            <Text style={styles.tipItem}>
              ✅ บันทึกการใช้สารทุกครั้ง
            </Text>
            <Text style={styles.tipItem}>
              ✅ วางแผนการหมุนเวียนล่วงหน้า
            </Text>
            <Text style={styles.tipItem}>
              ✅ ใช้ความรู้แทนการพ่นซ้ำๆ
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6'
  },

  /* ===== Header ===== */
  headerCard: {
    margin: 16,
    backgroundColor: '#E3F2FD',
    elevation: 4,
    borderRadius: 12
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    marginLeft: 12,
    flex: 1
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#374151',
    marginTop: 4
  },

  /* ===== Cards ===== */
  infoCard: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12
  },
  tableCard: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12
  },
  tipCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#FFF7ED',
    elevation: 4,
    borderRadius: 12
  },

  /* ===== Text ===== */
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12
  },
  paragraph: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26
  },
  bold: {
    fontWeight: 'bold',
    color: '#111827'
  },

  /* ===== Principle ===== */
  principleBox: {
    marginTop: 12
  },
  principleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  principleNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  principleNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  principleText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22
  },

  /* ===== Example ===== */
  exampleBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 10
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 12
  },
  rotationExample: {
    alignItems: 'center'
  },
  rotationStep: {
    alignItems: 'center',
    marginVertical: 6
  },
  rotationStepNumber: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4
  },
  moaChipIRAC: {
    backgroundColor: '#2563EB',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  moaChipText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  /* ===== Comparison ===== */
  comparisonBox: {
    marginTop: 8
  },
  comparisonItem: {
    paddingVertical: 12
  },
  iracBadge: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  fracBadge: {
    backgroundColor: '#16A34A',
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  comparisonTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  comparisonDesc: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4
  },
  comparisonExample: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic'
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12
  },

  /* ===== Table ===== */
  tableHeader: {
    backgroundColor: '#F3F4F6'
  },
  tableRow: {
    minHeight: 60,
    paddingVertical: 6
  },
  codeColumnHeader: {
    flex: 1.2,
    justifyContent: 'center'
  },
  nameColumnHeader: {
    flex: 2.8,
    justifyContent: 'center'
  },
  riskColumnHeader: {
    flex: 2.0,
    justifyContent: 'center'
  },
  codeColumn: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 6
  },
  nameColumn: {
    flex: 2.8,
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  riskColumn: {
    flex: 2.0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 6
  },
  codeChip: {
    backgroundColor: '#2563EB',
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 55
  },
  codeChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  tableCellText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 22,
    width: '100%'
  },
  riskChip: {
    minHeight: 26,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5
  },
  riskChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    lineHeight: 16,        // ✅ กัน text ถูก crop บน Android
    textAlignVertical: 'center'
  },

  /* ===== Tips ===== */
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9A3412',
    marginLeft: 8
  },
  tipList: {
    marginTop: 8
  },
  tipItem: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 22
  },

  bottomSpacing: {
    height: 32
  }
});