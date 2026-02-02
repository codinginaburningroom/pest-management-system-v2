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
import { FAB, Card, Button, IconButton, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as DB from '../services/database';
import { useFocusEffect } from '@react-navigation/native';

export default function PlotDetailScreen({ route, navigation }) {
  const { plotId } = route.params;
  const [plot, setPlot] = useState(null);
  const [plotCrops, setPlotCrops] = useState([]);
  const [applicationLogs, setApplicationLogs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);

  useFocusEffect(
    useCallback(() => {
      loadPlotData();
      loadPlotCrops();
      loadCrops();
    }, [plotId])
  );

  const loadPlotData = async () => {
    try {
      const data = await DB.getPlotById(plotId);
      setPlot(data);
    } catch (error) {
      console.error('Error loading plot:', error);
    }
  };

  const loadPlotCrops = async () => {
    try {
      const data = await DB.getActivePlotCrops(plotId);
      setPlotCrops(data);
      
      if (data.length > 0) {
        loadApplicationLogs(data[0].plot_crop_id);
      }
    } catch (error) {
      console.error('Error loading plot crops:', error);
    }
  };

  const loadCrops = async () => {
    try {
      const data = await DB.getAllCrops();
      setCrops(data);
    } catch (error) {
      console.error('Error loading crops:', error);
    }
  };

  const loadApplicationLogs = async (plotCropId) => {
    try {
      const data = await DB.getApplicationLogsByPlotCrop(plotCropId);
      setApplicationLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleAddPlotCrop = async () => {
    if (!selectedCropId) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเลือกพืช');
      return;
    }

    try {
      await DB.createPlotCrop({
        plot_id: plotId,
        crop_id: parseInt(selectedCropId),
        planting_date: plantingDate,
        current_stage_id: null,
        status: 'active'
      });

      setIsModalVisible(false);
      setSelectedCropId('');
      loadPlotCrops();
      Alert.alert('สำเร็จ', 'เพิ่มการปลูกพืชเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error adding plot crop:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเพิ่มการปลูกพืชได้');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!plot) {
    return (
      <View style={styles.loadingContainer}>
        <Text>กำลังโหลด...</Text>
      </View>
    );
  }

  const activePlotCrop = plotCrops.length > 0 ? plotCrops[0] : null;

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.plotCard}>
          <Card.Content>
            <View style={styles.plotHeader}>
              <Ionicons name="grid" size={28} color="#4CAF50" />
              <Text style={styles.plotName}>{plot.plot_name}</Text>
            </View>

            {plot.plot_area && (
              <View style={styles.infoRow}>
                <Ionicons name="resize" size={18} color="#666" />
                <Text style={styles.infoText}>พื้นที่: {plot.plot_area} ไร่</Text>
              </View>
            )}

            {plot.soil_type && (
              <View style={styles.infoRow}>
                <Ionicons name="earth" size={18} color="#666" />
                <Text style={styles.infoText}>ชนิดดิน: {plot.soil_type}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {activePlotCrop ? (
          <>
            <Card style={styles.cropCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text style={styles.sectionTitle}>พืชที่ปลูกปัจจุบัน</Text>
                  <Chip
                    icon="check-circle"
                    style={styles.activeChip}
                    textStyle={{ color: '#4CAF50' }}
                  >
                    ปลูกอยู่
                  </Chip>
                </View>

                <View style={styles.cropInfo}>
                  <Ionicons name="leaf" size={24} color="#4CAF50" />
                  <View style={styles.cropDetails}>
                    <Text style={styles.cropName}>{activePlotCrop.crop_name_th}</Text>
                    <Text style={styles.cropDetail}>
                      ปลูก: {formatDate(activePlotCrop.planting_date)}
                    </Text>
                    {activePlotCrop.stage_name && (
                      <Text style={styles.cropDetail}>
                        ระยะ: {activePlotCrop.stage_name}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    icon="flask"
                    onPress={() =>
                      navigation.navigate('Recommendation', {
                        plotCropId: activePlotCrop.plot_crop_id
                      })
                    }
                    style={styles.actionButton}
                  >
                    คำแนะนำสาร
                  </Button>
                  <Button
                    mode="contained"
                    icon="plus"
                    onPress={() =>
                      navigation.navigate('Application', {
                        plotCropId: activePlotCrop.plot_crop_id
                      })
                    }
                    style={styles.actionButton}
                    buttonColor="#4CAF50"
                  >
                    บันทึกพ่น
                  </Button>
                </View>
              </Card.Content>
            </Card>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ประวัติการใช้สารเคมี</Text>

              {applicationLogs.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Card.Content>
                    <View style={styles.emptyContent}>
                      <Ionicons name="document-text-outline" size={48} color="#ccc" />
                      <Text style={styles.emptyText}>ยังไม่มีบันทึก</Text>
                    </View>
                  </Card.Content>
                </Card>
              ) : (
                applicationLogs.map((log) => (
                  <Card key={log.log_id} style={styles.logCard}>
                    <Card.Content>
                      <View style={styles.logHeader}>
                        <View style={styles.logDate}>
                          <Ionicons name="calendar" size={16} color="#4CAF50" />
                          <Text style={styles.logDateText}>
                            {formatDate(log.application_date)}
                          </Text>
                        </View>
                        {log.stage_name && (
                          <Chip style={styles.stageChip} textStyle={{ fontSize: 12 }}>
                            {log.stage_name}
                          </Chip>
                        )}
                      </View>

                      {log.application_method && (
                        <Text style={styles.logDetail}>
                          วิธีพ่น: {log.application_method}
                        </Text>
                      )}

                      {log.notes && (
                        <Text style={styles.logNotes}>{log.notes}</Text>
                      )}
                    </Card.Content>
                  </Card>
                ))
              )}
            </View>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContent}>
                <Ionicons name="leaf-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>ยังไม่มีการปลูกพืช</Text>
                <Text style={styles.emptySubText}>เพิ่มการปลูกพืชเพื่อเริ่มต้น</Text>
                <Button
                  mode="contained"
                  onPress={() => setIsModalVisible(true)}
                  style={styles.emptyButton}
                  buttonColor="#4CAF50"
                >
                  เริ่มปลูก
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {activePlotCrop && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() =>
            navigation.navigate('Application', {
              plotCropId: activePlotCrop.plot_crop_id
            })
          }
          color="white"
        />
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>เริ่มปลูกพืช</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setIsModalVisible(false)}
              />
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>เลือกพืช *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCropId}
                  onValueChange={(value) => setSelectedCropId(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="-- เลือกพืช --" value="" />
                  {crops.map((crop) => (
                    <Picker.Item
                      key={crop.crop_id}
                      label={crop.crop_name_th}
                      value={crop.crop_id.toString()}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>วันที่ปลูก</Text>
              <TextInput
                style={styles.input}
                value={plantingDate}
                onChangeText={setPlantingDate}
                placeholder="YYYY-MM-DD"
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setIsModalVisible(false)}
                style={styles.cancelButton}
              >
                ยกเลิก
              </Button>
              <Button
                mode="contained"
                onPress={handleAddPlotCrop}
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
  plotCard: {
    margin: 16,
    elevation: 2
  },
  plotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  plotName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14
  },
  cropCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  activeChip: {
    backgroundColor: '#E8F5E9'
  },
  cropInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  cropDetails: {
    marginLeft: 12,
    flex: 1
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  cropDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 80
  },
  logCard: {
    marginTop: 12,
    elevation: 1
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  logDate: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logDateText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  stageChip: {
    height: 28,
    backgroundColor: '#E3F2FD'
  },
  logDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 4
  },
  logNotes: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic'
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
  emptyButton: {
    marginTop: 16
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
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  picker: {
    height: 50
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