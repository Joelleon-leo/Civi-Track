import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, Platform, Image, ScrollView } from 'react-native';
import { AuthContext } from '../src/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [profileImage, setProfileImage] = useState(null);
  const { register } = useContext(AuthContext);
  const router = useRouter();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const handleRegister = async () => {
    try {
      let formData = null;
      if (profileImage) {
        formData = new FormData();
        formData.append('profile_picture', {
          uri: profileImage,
          type: 'image/jpeg',
          name: 'profile_' + Date.now() + '.jpg',
        });
      }

      await register(name, email, password, role, formData);
      router.replace('/');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        <View className="flex-1 justify-center px-6 py-8">
          <Text className="text-3xl font-bold text-blue-800 mb-6">Create Account</Text>
          
          {/* Profile Picture Section */}
          <View className="items-center mb-8">
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                className="w-32 h-32 rounded-full mb-4"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-gray-300 items-center justify-center mb-4">
                <Text className="text-gray-600 text-center">No Photo</Text>
              </View>
            )}
            <TouchableOpacity
              className="bg-blue-600 px-6 py-2 rounded-lg"
              onPress={pickImage}
            >
              <Text className="text-white font-semibold">Add Photo</Text>
            </TouchableOpacity>
            <Text className="text-gray-500 text-sm mt-2">Profile picture (optional)</Text>
          </View>
          
          <View className="space-y-4 mb-6">
            <TextInput
              className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-800"
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-800"
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-800"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {Platform.OS === 'web' ? (
                <select 
                  className="w-full p-3 bg-transparent outline-none"
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="authority">Authority</option>
                </select>
              ) : (
                <TextInput 
                  className="bg-white px-4 py-3 text-gray-800"
                  placeholder="Role: student | authority"
                  value={role}
                  onChangeText={(text) => setRole(text.toLowerCase().trim())}
                />
              )}
            </View>
          </View>
          
          <TouchableOpacity 
            className="bg-blue-600 py-4 rounded-xl items-center shadow-sm"
            onPress={handleRegister}
          >
            <Text className="text-white font-semibold text-lg">Sign up</Text>
          </TouchableOpacity>
          
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-semibold">Log in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
