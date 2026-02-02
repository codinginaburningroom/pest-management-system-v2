import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator } from 'react-native';
import * as DB from './services/database';
import { seedInitialData } from './services/seedData';

// Import Screens
import FarmListScreen from './screens/FarmListScreen';
import FarmDetailScreen from './screens/FarmDetailScreen';
import PlotDetailScreen from './screens/PlotDetailScreen';
import ApplicationScreen from './screens/ApplicationScreen';
import ProductListScreen from './screens/ProductListScreen';
import MoARotationScreen from './screens/MoARotationScreen';
import RecommendationScreen from './screens/RecommendationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function FarmStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FarmList" 
        component={FarmListScreen}
        options={{ title: 'ฟาร์มของฉัน' }}
      />
      <Stack.Screen 
        name="FarmDetail" 
        component={FarmDetailScreen}
        options={{ title: 'รายละเอียดฟาร์ม' }}
      />
      <Stack.Screen 
        name="PlotDetail" 
        component={PlotDetailScreen}
        options={{ title: 'แปลงเพาะปลูก' }}
      />
      <Stack.Screen 
        name="Application" 
        component={ApplicationScreen}
        options={{ title: 'บันทึกการใช้สารเคมี' }}
      />
      <Stack.Screen 
        name="Recommendation" 
        component={RecommendationScreen}
        options={{ title: 'คำแนะนำผลิตภัณฑ์' }}
      />
    </Stack.Navigator>
  );
}

function ProductStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProductList" 
        component={ProductListScreen}
        options={{ title: 'ผลิตภัณฑ์' }}
      />
    </Stack.Navigator>
  );
}

function MoAStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MoARotation" 
        component={MoARotationScreen}
        options={{ title: 'การหมุนเวียน MoA' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing database...');
      await DB.initDatabase();
      
      // Check if data exists
      const farms = await DB.getAllFarms();
      
      if (farms.length === 0) {
        console.log('No data found, seeding initial data...');
        await seedInitialData();
      }
      
      setIsDbReady(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>กำลังเตรียมข้อมูล...</Text>
      </View>
    );
  }

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>ไม่สามารถเริ่มต้นฐานข้อมูลได้</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Farms') {
                iconName = focused ? 'leaf' : 'leaf-outline';
              } else if (route.name === 'Products') {
                iconName = focused ? 'flask' : 'flask-outline';
              } else if (route.name === 'MoA') {
                iconName = focused ? 'refresh-circle' : 'refresh-circle-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4CAF50',
            tabBarInactiveTintColor: 'gray',
            headerShown: false
          })}
        >
          <Tab.Screen 
            name="Farms" 
            component={FarmStack}
            options={{ title: 'ฟาร์ม' }}
          />
          <Tab.Screen 
            name="Products" 
            component={ProductStack}
            options={{ title: 'ผลิตภัณฑ์' }}
          />
          <Tab.Screen 
            name="MoA" 
            component={MoAStack}
            options={{ title: 'MoA' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}