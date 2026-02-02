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
                <Chip style={styles.moaChipIRAC}>4A (Neonicotinoids)</Chip>
              </View>
              <Ionicons name="arrow-down" size={24} color="#4CAF50" />
              <View style={styles.rotationStep}>
                <Text style={styles.rotationStepNumber}>ครั้งที่ 2</Text>
                <Chip style={styles.moaChipIRAC}>28 (Diamides)</Chip>
              </View>
              <Ionicons name="arrow-down" size={24} color="#4CAF50" />
              <View style={styles.rotationStep}>
                <Text style={styles.rotationStepNumber}>ครั้งที่ 3</Text>
                <Chip style={styles.moaChipIRAC}>5 (Spinosyns)</Chip>
              </View>
              <Ionicons name="arrow-down" size={24} color="#4CAF50" />
              <View style={styles.rotationStep}>
                <Text style={styles.rotationStepNumber}>ครั้งที่ 4</Text>
                <Chip style={styles.moaChipIRAC}>4A (Neonicotinoids)</Chip>
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
            <DataTable.Header>
              <DataTable.Title style={styles.codeColumn}>รหัส</DataTable.Title>
              <DataTable.Title style={styles.nameColumn}>กลุ่ม MoA</DataTable.Title>
              <DataTable.Title style={styles.riskColumn}>ความเสี่ยง</DataTable.Title>
            </DataTable.Header>

            {iracGroups.map((group) => (
              <DataTable.Row key={group.moa_group_id}>
                <DataTable.Cell style={styles.codeColumn}>
                  <Chip
                    style={styles.codeChip}
                    textStyle={{ fontSize: 11, fontWeight: 'bold' }}
                  >
                    {group.moa_code}
                  </Chip>
                </DataTable.Cell>
                <DataTable.Cell style={styles.nameColumn}>
                  <Text style={styles.tableCellText}>
                    {group.moa_name_th.length > 30
                      ? group.moa_name_th.substring(0, 30) + '...'
                      : group.moa_name_th}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.riskColumn}>
                  <Chip
                    style={[
                      styles.riskChip,
                      { backgroundColor: getRiskColor(group.resistance_risk) }
                    ]}
                    textStyle={{ color: 'white', fontSize: 10 }}
                  >
                    {getRiskLabel(group.resistance_risk)}
                  </Chip>
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
            <DataTable.Header>
              <DataTable.Title style={styles.codeColumn}>รหัส</DataTable.Title>
              <DataTable.Title style={styles.nameColumn}>กลุ่ม MoA</DataTable.Title>
              <DataTable.Title style={styles.riskColumn}>ความเสี่ยง</DataTable.Title>
            </DataTable.Header>

            {fracGroups.map((group) => (
              <DataTable.Row key={group.moa_group_id}>
                <DataTable.Cell style={styles.codeColumn}>
                  <Chip
                    style={[styles.codeChip, { backgroundColor: '#4CAF50' }]}
                    textStyle={{ fontSize: 11, fontWeight: 'bold', color: 'white' }}
                  >
                    {group.moa_code}
                  </Chip>
                </DataTable.Cell>
                <DataTable.Cell style={styles.nameColumn}>
                  <Text style={styles.tableCellText}>
                    {group.moa_name_th.length > 30
                      ? group.moa_name_th.substring(0, 30) + '...'
                      : group.moa_name_th}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.riskColumn}>
                  <Chip
                    style={[
                      styles.riskChip,
                      { backgroundColor: getRiskColor(group.resistance_risk) }
                    ]}
                    textStyle={{ color: 'white', fontSize: 10 }}
                  >
                    {getRiskLabel(group.resistance_risk)}
                  </Chip>
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
    backgroundColor: '#f5f5f5'
  },
  headerCard: {
    margin: 16,
    backgroundColor: '#E3F2FD',
    elevation: 2
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  paragraph: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24
  },
  bold: {
    fontWeight: 'bold',
    color: '#333'
  },
  principleBox: {
    marginTop: 12
  },
  principleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  principleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
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
    fontSize: 14,
    color: '#555',
    lineHeight: 20
  },
  exampleBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F1F8E9',
    borderRadius: 8
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#558B2F',
    marginBottom: 12
  },
  rotationExample: {
    alignItems: 'center'
  },
  rotationStep: {
    alignItems: 'center',
    marginVertical: 4
  },
  rotationStepNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  moaChipIRAC: {
    backgroundColor: '#2196F3'
  },
  comparisonBox: {
    marginTop: 8
  },
  comparisonItem: {
    paddingVertical: 12
  },
  iracBadge: {
    backgroundColor: '#2196F3',
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  fracBadge: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  comparisonTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  comparisonDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  comparisonExample: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic'
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12
  },
  tableCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2
  },
  codeColumn: {
    flex: 1
  },
  nameColumn: {
    flex: 3
  },
  riskColumn: {
    flex: 1.2
  },
  codeChip: {
    backgroundColor: '#2196F3',
    height: 24
  },
  tableCellText: {
    fontSize: 12,
    color: '#333'
  },
  riskChip: {
    height: 22
  },
  tipCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#FFF3E0',
    elevation: 2
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginLeft: 8
  },
  tipList: {
    marginTop: 8
  },
  tipItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20
  },
  bottomSpacing: {
    height: 30
  }
});