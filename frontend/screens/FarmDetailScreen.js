import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { FAB, Card, Button, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/database';
import { useFocusEffect } from '@react-navigation/native';

export default function FarmDetailScreen({ route, navigation }) {
  const { farmId } = route.params;
  const [farm, setFarm] = useState(null);
  const [plots, setPlots] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [plotName, setPlotName] = useState('');
  const [plotArea, setPlotArea] = useState('');
  const [soilType, setSoilType] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadFarmData();
      loadPlots();
    }, [farmId])
  );

  const loadFarmData = async () => {
    try {
      const data = await DB.getFarmById(farmId);
      setFarm(data);
    } catch (error) {
      console.error('Error loading farm:', error);
    }
  };

  const loadPlots = async () => {
    try {
      const data = await DB.getPlotsByFarm(farmId);
      setPlots(data);
    } catch (error) {
      console.error('Error loading plots:', error);
    }
  };

  const handleAddPlot = async () => {
    if (!plotName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อแปลง');
      return;
    }

    try {
      await DB.createPlot({
        farm_id: farmId,
        plot_name: plotName,
        plot_area: plotArea ? parseFloat(plotArea) : null,
        soil_type: soilType
      });

      setIsModalVisible(false);
      clearForm();
      loadPlots();
      Alert.alert('สำเร็จ', 'เพิ่มแปลงเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error adding plot:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเพิ่มแปลงได้');
    }
  };

  const clearForm = () => {
    setPlotName('');
    setPlotArea('');
    setSoilType('');
  };

  if (!farm) {
    return (
      <View style={styles.loadingContainer}>
        <Text>กำลังโหลด...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.farmCard}>
          <Card.Content>
            <View style={styles.farmHeader}>
              <Ionicons name="leaf" size={32} color="#4CAF50" />
              <Text style={styles.farmName}>{farm.farm_name}</Text>
            </View>

            {farm.province && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#666" />
                <Text style={styles.infoText}>
                  {farm.district && `${farm.district}, `}{farm.province}
                </Text>
              </View>
            )}

            {farm.location && (
              <View style={styles.infoRow}>
                <Ionicons name="map" size={20} color="#666" />
                <Text style={styles.infoText}>{farm.location}</Text>
              </View>
            )}

            {farm.total_area && (
              <View style={styles.infoRow}>
                <Ionicons name="resize" size={20} color="#666" />
                <Text style={styles.infoText}>พื้นที่รวม: {farm.total_area} ไร่</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>แปลงเพาะปลูก</Text>
            <Text style={styles.plotCount}>({plots.length} แปลง)</Text>
          </View>

          {plots.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <View style={styles.emptyContent}>
                  <Ionicons name="grid-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>ยังไม่มีแปลง</Text>
                  <Text style={styles.emptySubText}>เพิ่มแปลงเพื่อเริ่มจัดการ</Text>
                </View>
              </Card.Content>
            </Card>
          ) : (
            plots.map((plot) => (
              <Card
                key={plot.plot_id}
                style={styles.plotCard}
                onPress={() => navigation.navigate('PlotDetail', { plotId: plot.plot_id })}
              >
                <Card.Content>
                  <View style={styles.plotHeader}>
                    <View style={styles.plotInfo}>
                      <Ionicons name="grid" size={20} color="#4CAF50" />
                      <Text style={styles.plotName}>{plot.plot_name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </View>

                  {plot.plot_area && (
                    <Text style={styles.plotDetail}>พื้นที่: {plot.plot_area} ไร่</Text>
                  )}

                  {plot.soil_type && (
                    <Text style={styles.plotDetail}>ชนิดดิน: {plot.soil_type}</Text>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="เพิ่มแปลง"
        onPress={() => setIsModalVisible(true)}
        color="white"
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>เพิ่มแปลงใหม่</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => {
                  setIsModalVisible(false);
                  clearForm();
                }}
              />
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>ชื่อแปลง *</Text>
              <TextInput
                style={styles.input}
                value={plotName}
                onChangeText={setPlotName}
                placeholder="เช่น แปลง A1"
              />

              <Text style={styles.label}>พื้นที่ (ไร่)</Text>
              <TextInput
                style={styles.input}
                value={plotArea}
                onChangeText={setPlotArea}
                placeholder="เช่น 3"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>ชนิดดิน</Text>
              <TextInput
                style={styles.input}
                value={soilType}
                onChangeText={setSoilType}
                placeholder="เช่น ดินร่วนปนทราย"
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setIsModalVisible(false);
                  clearForm();
                }}
                style={styles.cancelButton}
              >
                ยกเลิก
              </Button>
              <Button
                mode="contained"
                onPress={handleAddPlot}
                style={styles.saveButton}
                buttonColor="#4CAF50"
              >
                บันทึก
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  farmCard: {
    margin: 16,
    elevation: 2
  },
  farmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  farmName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333',
    flex: 1
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  infoText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 15
  },
  section: {
    padding: 16,
    paddingTop: 0
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  plotCount: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8
  },
  emptyCard: {
    elevation: 1
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4
  },
  plotCard: {
    marginBottom: 12,
    elevation: 2
  },
  plotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  plotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  plotName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333'
  },
  plotDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  formContainer: {
    padding: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 6
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 0
  },
  cancelButton: {
    flex: 1,
    marginRight: 8
  },
  saveButton: {
    flex: 1,
    marginLeft: 8
  }
});