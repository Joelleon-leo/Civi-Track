import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView, Image, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { toMediaUrl } from '../src/api/axios';

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const uploadProfilePicture = async (imageUri) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('profile_picture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile_' + Date.now() + '.jpg',
      });

      const res = await updateProfile({}, formData);
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          router.replace('/login');
        }
      }
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        <View className="px-6 py-8">
          <TouchableOpacity className="mb-4" onPress={() => router.back()}>
            <Text className="text-blue-600 font-semibold text-lg">← Back</Text>
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-blue-800 mb-8">My Profile</Text>

          {/* Profile Picture Section */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <View className="items-center mb-6">
              {user.profile_picture_url ? (
                <Image
                  source={{ uri: toMediaUrl(user.profile_picture_url) }}
                  className="w-48 h-48 rounded-full mb-4"
                />
              ) : (
                <View className="w-48 h-48 rounded-full bg-gray-300 items-center justify-center mb-4">
                  <Text className="text-gray-600 text-center text-lg">No Photo</Text>
                </View>
              )}
              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-lg"
                onPress={pickImage}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Change Photo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Information Section */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-900 mb-4">Account Information</Text>
            
            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-1">Name</Text>
              <Text className="text-gray-800 text-lg font-semibold">{user.name}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-1">Email</Text>
              <Text className="text-gray-800 text-lg font-semibold">{user.email}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-1">Role</Text>
              <Text className="text-gray-800 text-lg font-semibold capitalize">{user.role}</Text>
            </View>

            {user.created_at && (
              <View>
                <Text className="text-gray-500 text-sm mb-1">Member Since</Text>
                <Text className="text-gray-800 text-lg font-semibold">
                  {new Date(user.created_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            className="bg-red-600 py-4 rounded-xl items-center shadow-sm mb-8"
            onPress={handleLogout}
          >
            <Text className="text-white font-semibold text-lg">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
