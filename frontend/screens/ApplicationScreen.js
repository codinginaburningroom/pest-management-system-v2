import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { Button, Card, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as DB from '../services/database';

export default function ApplicationScreen({ route, navigation }) {
  const { plotCropId } = route.params;
  const [plotCrop, setPlotCrop] = useState(null);
  const [targets, setTargets] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [dosageRate, setDosageRate] = useState('');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [applicationMethod, setApplicationMethod] = useState('spray');
  const [weather, setWeather] = useState('sunny');
  const [temperature, setTemperature] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [moaWarning, setMoaWarning] = useState(null);

  useEffect(() => {
    loadData();
  }, [plotCropId]);

  useEffect(() => {
    if (selectedTargetId) {
      loadProductsForTarget();
      checkMoARotation();
    }
  }, [selectedTargetId]);

  useEffect(() => {
    if (selectedProductId && selectedTargetId) {
      const product = products.find(p => p.product_id.toString() === selectedProductId);
      if (product && product.recommended_rate_min) {
        setDosageRate(product.recommended_rate_min.toString());
      }
    }
  }, [selectedProductId]);

  const loadData = async () => {
    try {
      const allTargets = await DB.getAllTargets();
      setTargets(allTargets);
      
      const cropData = await DB.getActivePlotCrops(plotCropId);
      if (cropData.length > 0) {
        setPlotCrop(cropData[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadProductsForTarget = async () => {
    if (!selectedTargetId) return;
    
    try {
      const data = await DB.getProductsForTarget(parseInt(selectedTargetId));
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const checkMoARotation = async () => {
    if (!selectedTargetId || !plotCropId) return;
    
    try {
      const result = await DB.checkMoARotation(plotCropId, parseInt(selectedTargetId));
      setMoaWarning(result);
    } catch (error) {
      console.error('Error checking MoA:', error);
    }
  };

  const handleAddItem = () => {
    if (!selectedTargetId || !selectedProductId || !dosageRate) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    const product = products.find(p => p.product_id.toString() === selectedProductId);
    const target = targets.find(t => t.target_id.toString() === selectedTargetId);

    const newItem = {
      product_id: parseInt(selectedProductId),
      target_id: parseInt(selectedTargetId),
      product_name: product.product_name,
      target_name: target.target_name_th,
      moa_code: product.moa_code,
      moa_name: product.moa_name_th,
      dosage_rate: parseFloat(dosageRate),
      dosage_unit: product.rate_unit || 'ml/20L'
    };

    setSelectedItems([...selectedItems, newItem]);
    
    setSelectedProductId('');
    setDosageRate('');
  };

  const handleRemoveItem = (index) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเพิ่มสารเคมีอย่างน้อย 1 รายการ');
      return;
    }

    try {
      const logId = await DB.createApplicationLog({
        plot_crop_id: plotCropId,
        application_date: applicationDate,
        application_time: new Date().toTimeString().split(' ')[0],
        weather_condition: weather,
        temperature: temperature ? parseFloat(temperature) : null,
        application_method: applicationMethod,
        notes: notes
      });

      for (const item of selectedItems) {
        await DB.createApplicationItem({
          log_id: logId,
          product_id: item.product_id,
          target_id: item.target_id,
          dosage_rate: item.dosage_rate,
          dosage_unit: item.dosage_unit
        });
      }

      Alert.alert('สำเร็จ', 'บันทึกการใช้สารเคมีเรียบร้อยแล้ว', [
        {
          text: 'ตกลง',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Error saving application:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  const selectedProduct = products.find(p => p.product_id.toString() === selectedProductId);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {plotCrop && (
          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.infoHeader}>
                <Ionicons name="leaf" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>
                  {plotCrop.crop_name_th} - {plotCrop.plot_name}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>ข้อมูลการพ่น</Text>

            <Text style={styles.label}>วันที่พ่น</Text>
            <TextInput
              style={styles.input}
              value={applicationDate}
              onChangeText={setApplicationDate}
            />

            <Text style={styles.label}>วิธีพ่น</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={applicationMethod}
                onValueChange={setApplicationMethod}
                style={styles.picker}
              >
                <Picker.Item label="พ่นสาร" value="spray" />
                <Picker.Item label="ราดดิน" value="drench" />
                <Picker.Item label="ทาลำต้น" value="paint" />
                <Picker.Item label="รมควัน" value="fog" />
              </Picker>
            </View>

            <Text style={styles.label}>สภาพอากาศ</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={weather}
                onValueChange={setWeather}
                style={styles.picker}
              >
                <Picker.Item label="☀️ แดดจัด" value="sunny" />
                <Picker.Item label="⛅ มีเมฆบ้าง" value="partly_cloudy" />
                <Picker.Item label="☁️ มีเมฆมาก" value="cloudy" />
                <Picker.Item label="🌤️ อากาศดี" value="clear" />
              </Picker>
            </View>

            <Text style={styles.label}>อุณหภูมิ (°C)</Text>
            <TextInput
              style={styles.input}
              value={temperature}
              onChangeText={setTemperature}
              keyboardType="decimal-pad"
              placeholder="เช่น 32"
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>เลือกสารเคมี</Text>

            <Text style={styles.label}>ศัตรูพืชเป้าหมาย *</Text>
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

            {moaWarning && moaWarning.warning && (
              <Card style={styles.warningCard}>
                <Card.Content>
                  <View style={styles.warningHeader}>
                    <Ionicons name="warning" size={20} color="#f44336" />
                    <Text style={styles.warningTitle}>คำเตือน MoA</Text>
                  </View>
                  <Text style={styles.warningText}>{moaWarning.message}</Text>
                  <Text style={styles.warningDetail}>
                    ควรเลือกสารที่มีกลุ่ม MoA ต่างจาก {moaWarning.currentMoA}
                  </Text>
                </Card.Content>
              </Card>
            )}

            {selectedTargetId && (
              <>
                <Text style={styles.label}>ผลิตภัณฑ์ *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedProductId}
                    onValueChange={setSelectedProductId}
                    style={styles.picker}
                  >
                    <Picker.Item label="-- เลือกผลิตภัณฑ์ --" value="" />
                    {products.map((product) => (
                      <Picker.Item
                        key={product.product_id}
                        label={`${product.product_name} (${product.moa_code})`}
                        value={product.product_id.toString()}
                      />
                    ))}
                  </Picker>
                </View>

                {selectedProduct && (
                  <View style={styles.productInfo}>
                    <View style={styles.moaBadge}>
                      <Text style={styles.moaCode}>{selectedProduct.moa_code}</Text>
                      <Text style={styles.moaName}>{selectedProduct.moa_name_th}</Text>
                    </View>
                    <Text style={styles.productDetail}>
                      อัตรา: {selectedProduct.recommended_rate_min}-
                      {selectedProduct.recommended_rate_max} {selectedProduct.rate_unit}
                    </Text>
                  </View>
                )}

                <Text style={styles.label}>อัตราการใช้ *</Text>
                <TextInput
                  style={styles.input}
                  value={dosageRate}
                  onChangeText={setDosageRate}
                  keyboardType="decimal-pad"
                  placeholder={selectedProduct ? `${selectedProduct.rate_unit}` : 'ระบุอัตรา'}
                />

                <Button
                  mode="outlined"
                  onPress={handleAddItem}
                  icon="plus"
                  style={styles.addButton}
                >
                  เพิ่มรายการ
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        {selectedItems.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>รายการที่เลือก ({selectedItems.length})</Text>

              {selectedItems.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemProduct}>{item.product_name}</Text>
                      <Text style={styles.itemTarget}>
                        เป้าหมาย: {item.target_name}
                      </Text>
                      <View style={styles.itemMoa}>
                        <Chip style={styles.moaChip} textStyle={{ fontSize: 11 }}>
                          {item.moa_code}
                        </Chip>
                        <Text style={styles.itemDosage}>
                          {item.dosage_rate} {item.dosage_unit}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                      <Ionicons name="trash" size={24} color="#f44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>หมายเหตุ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="บันทึกเพิ่มเติม..."
              multiline
              numberOfLines={3}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          buttonColor="#4CAF50"
          disabled={selectedItems.length === 0}
        >
          บันทึกการใช้สาร
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollView: {
    flex: 1
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 1
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
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
  textArea: {
    height: 80,
    textAlignVertical: 'top'
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
  warningCard: {
    backgroundColor: '#FFEBEE',
    marginTop: 12,
    elevation: 0
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    marginLeft: 8
  },
  warningText: {
    fontSize: 14,
    color: '#c62828',
    marginBottom: 4
  },
  warningDetail: {
    fontSize: 13,
    color: '#d32f2f',
    fontStyle: 'italic'
  },
  productInfo: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginTop: 8
  },
  moaBadge: {
    marginBottom: 8
  },
  moaCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32'
  },
  moaName: {
    fontSize: 13,
    color: '#388E3C',
    marginTop: 2
  },
  productDetail: {
    fontSize: 13,
    color: '#1B5E20'
  },
  addButton: {
    marginTop: 16
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  itemInfo: {
    flex: 1
  },
  itemProduct: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  itemTarget: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6
  },
  itemMoa: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  moaChip: {
    height: 24,
    backgroundColor: '#E3F2FD',
    marginRight: 8
  },
  itemDosage: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600'
  },
  bottomBar: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8
  },
  submitButton: {
    paddingVertical: 4
  }
});