import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { FAB, Card, Button, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/database';
import { useFocusEffect } from '@react-navigation/native';

export default function FarmListScreen({ navigation }) {
  const [farms, setFarms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState('');
  const [totalArea, setTotalArea] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadFarms();
    }, [])
  );

  const loadFarms = async () => {
    try {
      const data = await DB.getAllFarms();
      setFarms(data);
    } catch (error) {
      console.error('Error loading farms:', error);
    }
  };

  const handleAddFarm = async () => {
    if (!farmName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อฟาร์ม');
      return;
    }

    try {
      await DB.createFarm({
        farm_name: farmName,
        location: location,
        total_area: totalArea ? parseFloat(totalArea) : null,
        province: province,
        district: district
      });

      setIsModalVisible(false);
      clearForm();
      loadFarms();
      Alert.alert('สำเร็จ', 'เพิ่มฟาร์มเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error adding farm:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเพิ่มฟาร์มได้');
    }
  };

  const clearForm = () => {
    setFarmName('');
    setLocation('');
    setTotalArea('');
    setProvince('');
    setDistrict('');
  };

  const handleDeleteFarm = (farmId, farmName) => {
    Alert.alert(
      'ยืนยันการลบ',
      `คุณต้องการลบฟาร์ม "${farmName}" หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await DB.deleteFarm(farmId);
              loadFarms();
              Alert.alert('สำเร็จ', 'ลบฟาร์มเรียบร้อยแล้ว');
            } catch (error) {
              console.error('Error deleting farm:', error);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบฟาร์มได้');
            }
          }
        }
      ]
    );
  };

  const renderFarmItem = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('FarmDetail', { farmId: item.farm_id })}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.farmInfo}>
            <Ionicons name="leaf" size={24} color="#4CAF50" />
            <Text style={styles.farmName}>{item.farm_name}</Text>
          </View>
          <IconButton
            icon="delete"
            size={20}
            iconColor="#f44336"
            onPress={() => handleDeleteFarm(item.farm_id, item.farm_name)}
          />
        </View>
        
        {item.province && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.district && `${item.district}, `}{item.province}
            </Text>
          </View>
        )}
        
        {item.total_area && (
          <View style={styles.infoRow}>
            <Ionicons name="resize-outline" size={16} color="#666" />
            <Text style={styles.infoText}>พื้นที่: {item.total_area} ไร่</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {farms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="leaf-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>ยังไม่มีฟาร์ม</Text>
          <Text style={styles.emptySubText}>เริ่มต้นด้วยการเพิ่มฟาร์มแรกของคุณ</Text>
        </View>
      ) : (
        <FlatList
          data={farms}
          renderItem={renderFarmItem}
          keyExtractor={(item) => item.farm_id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
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
              <Text style={styles.modalTitle}>เพิ่มฟาร์มใหม่</Text>
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
              <Text style={styles.label}>ชื่อฟาร์ม *</Text>
              <TextInput
                style={styles.input}
                value={farmName}
                onChangeText={setFarmName}
                placeholder="เช่น สวนมะม่วงบ้านสวน"
              />

              <Text style={styles.label}>จังหวัด</Text>
              <TextInput
                style={styles.input}
                value={province}
                onChangeText={setProvince}
                placeholder="เช่น จันทบุรี"
              />

              <Text style={styles.label}>อำเภอ/เขต</Text>
              <TextInput
                style={styles.input}
                value={district}
                onChangeText={setDistrict}
                placeholder="เช่น เมืองจันทบุรี"
              />

              <Text style={styles.label}>ที่อยู่/สถานที่</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="เช่น หมู่ 5 ต.คลองนารายณ์"
                multiline
              />

              <Text style={styles.label}>พื้นที่ (ไร่)</Text>
              <TextInput
                style={styles.input}
                value={totalArea}
                onChangeText={setTotalArea}
                placeholder="เช่น 15"
                keyboardType="decimal-pad"
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
                onPress={handleAddFarm}
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
  listContainer: {
    padding: 16
  },
  card: {
    marginBottom: 12,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  farmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  farmName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  infoText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8
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
    maxHeight: '80%',
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