import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../src/api/axios';
import * as ImagePicker from 'expo-image-picker';

export default function CreateComplaintScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Sanitation');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [complaintImage, setComplaintImage] = useState(null);
  const router = useRouter();

  const buildUploadFile = (uri, prefix) => {
    const match = uri?.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    const ext = (match?.[1] || 'jpg').toLowerCase();
    const type =
      ext === 'png' ? 'image/png' :
      ext === 'heic' ? 'image/heic' :
      ext === 'webp' ? 'image/webp' :
      'image/jpeg';
    return {
      uri,
      type,
      name: `${prefix}_${Date.now()}.${ext}`,
    };
  };

  const pickComplaintImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        setComplaintImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const captureComplaintImage = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to capture an image.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        setComplaintImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!complaintImage) {
        Alert.alert('Picture Required', 'Please add a complaint picture before submitting.');
        return;
      }

      // Dummy lat/long for now if Map is hard to setup on web/emulator right away
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('latitude', latitude || '12.9716');
      formData.append('longitude', longitude || '77.5946');
      formData.append('images', {
        ...buildUploadFile(complaintImage, 'complaint'),
      });
      
      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.message) {
        Alert.alert('Duplicate Found', res.data.message);
      } else {
        Alert.alert('Success', 'Complaint submitted successfully!');
      }
      router.back();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to submit complaint');
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6">
      <TouchableOpacity className="mb-4" onPress={() => router.back()}>
        <Text className="text-blue-600 font-semibold text-lg">← Back</Text>
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-gray-900 mb-6">New Complaint</Text>
      
      <View className="space-y-4 mb-8">
        <View>
          <Text className="text-gray-700 font-semibold mb-2">Title</Text>
          <TextInput
            className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-800"
            placeholder="E.g., Broken Streetlight"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View>
          <Text className="text-gray-700 font-semibold mb-2">Description</Text>
          <TextInput
            className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-800 h-32"
            placeholder="Describe the issue in detail"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View>
          <Text className="text-gray-700 font-semibold mb-2">Complaint Picture</Text>
          <View className="flex-row">
            <TouchableOpacity
              className="flex-1 bg-white px-4 py-3 rounded-xl border border-gray-200 mr-2"
              onPress={pickComplaintImage}
            >
              <Text className="text-blue-600 font-semibold text-center">Select Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-white px-4 py-3 rounded-xl border border-gray-200 ml-2"
              onPress={captureComplaintImage}
            >
              <Text className="text-blue-600 font-semibold text-center">Capture Image</Text>
            </TouchableOpacity>
          </View>
          {complaintImage ? (
            <View className="w-full h-48 rounded-xl mt-3 overflow-hidden bg-white">
              <Image
                source={{ uri: complaintImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          ) : (
            <Text className="text-gray-500 text-sm mt-2">Add a clear photo of the issue.</Text>
          )}
        </View>
        
        <View>
          <Text className="text-gray-700 font-semibold mb-2">Category</Text>
          <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {Platform.OS === 'web' ? (
              <select 
                className="w-full p-3 bg-transparent outline-none text-gray-800"
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Electrical">Electrical</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Hostel">Hostel</option>
                <option value="IT">IT</option>
                <option value="Other">Other</option>
              </select>
            ) : (
                <TextInput
                  className="bg-white px-4 py-3 text-gray-800"
                  placeholder="Sanitation, Electrical, Hostel..."
                  value={category}
                  onChangeText={setCategory}
                />
            )}
          </View>
        </View>

        <View className="flex-row space-x-2">
            <View className="flex-1">
              <Text className="text-gray-700 font-semibold mb-2">Latitude</Text>
              <TextInput
                className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-800"
                placeholder="12.9716"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 font-semibold mb-2">Longitude</Text>
              <TextInput
                className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-800"
                placeholder="77.5946"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
              />
            </View>
        </View>

      </View>
      
      <TouchableOpacity 
        className="bg-blue-600 py-4 rounded-xl items-center shadow-md mb-10"
        onPress={handleSubmit}
      >
        <Text className="text-white font-bold text-lg">Submit Complaint</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
