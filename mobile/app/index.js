import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Platform } from 'react-native';
import { AuthContext } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../src/api/axios';
import { toMediaUrl } from '../src/api/axios';

export default function HomeScreen() {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
    if (user) {
      fetchComplaints();
    }
  }, [user, authLoading]);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-yellow-100 text-yellow-800';
      case 'Assigned': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) return <ActivityIndicator size="large" className="flex-1" />;
  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" style={{ flex: 1, minHeight: Platform.OS === 'web' ? '100vh' : undefined }}>
      <View className="p-6 bg-white border-b border-gray-200 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">Hi, {user.name}</Text>
          <Text className="text-sm text-gray-500">CiviTrack Campus</Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-3 bg-gray-100 px-3 py-2 rounded-lg"
            onPress={logout}
          >
            <Text className="text-gray-700 font-semibold">Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push('/profile')}
          >
            {user.profile_picture_url ? (
              <Image
                source={{ uri: toMediaUrl(user.profile_picture_url) }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center">
                <Text className="text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {user.role === 'authority' && (
        <TouchableOpacity 
          className="m-4 bg-purple-600 p-4 rounded-xl flex-row items-center justify-center"
          onPress={() => router.push('/authority')}
        >
          <Text className="text-white font-bold text-lg">Authority Dashboard</Text>
        </TouchableOpacity>
      )}

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 140, flexGrow: 1 }}
        data={complaints}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchComplaints}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white p-5 rounded-2xl mb-4 border border-gray-100 shadow-sm"
            onPress={() => router.push(`/complaint/${item.id}`)}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-bold text-gray-900 flex-1">{item.title}</Text>
              <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status).split(' ')[0]}`}>
                 <Text className={`text-xs font-semibold ${getStatusColor(item.status).split(' ')[1]}`}>
                   {item.status}
                 </Text>
              </View>
            </View>
            
            <Text className="text-gray-600 mb-3" numberOfLines={2}>
              {item.description}
            </Text>
            
            <View className="flex-row justify-between items-center border-t border-gray-100 pt-3 mt-1">
              <Text className="text-sm text-gray-500 font-medium">{item.category}</Text>
              <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
                <Text className="text-blue-600 font-bold mr-1">{item.support_count}</Text>
                <Text className="text-blue-600 text-xs">Supports</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center mt-20">
            <Text className="text-gray-400 text-lg">No complaints found.</Text>
          </View>
        )}
      />

      {user.role === 'student' && (
        <View
          className="bg-white border-t border-gray-200"
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 }}
        >
          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-xl items-center shadow-md"
            onPress={() => router.push('/create-complaint')}
          >
            <Text className="text-white font-bold text-lg">+ Create Complaint</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
