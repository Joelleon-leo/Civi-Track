import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../src/api/axios';

export default function ComplaintDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" className="flex-1" />;
  if (!complaint) return <View className="flex-1 justify-center items-center"><Text>Not found</Text></View>;

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="bg-white p-6 pb-8 shadow-sm">
        <TouchableOpacity className="mb-4" onPress={() => router.back()}>
            <Text className="text-blue-600 font-semibold text-lg">← Back</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-900 mb-2">{complaint.title}</Text>
        <View className="flex-row items-center space-x-2 mb-4">
          <Text className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold mr-2">
            {complaint.category}
          </Text>
          <Text className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">
            {complaint.department}
          </Text>
        </View>
        <Text className="text-gray-700 text-base leading-relaxed mb-4">{complaint.description}</Text>
        
        <View className="flex-row items-center">
            <Text className="text-sm text-gray-500 mr-2">Reported by:</Text>
            <Text className="font-semibold text-gray-800">{complaint.reporter_name}</Text>
        </View>
      </View>

      <View className="p-6">
        <Text className="text-xl font-bold text-gray-900 mb-4">Status Timeline</Text>
        <View className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            {complaint.logs?.map((log, index) => (
                <View key={log.id} className="flex-row mb-4">
                    <View className="mr-4 items-center">
                        <View className="w-4 h-4 bg-blue-500 rounded-full z-10" />
                        {index !== complaint.logs.length - 1 && (
                            <View className="w-0.5 bg-gray-200 flex-1 -mt-1" />
                        )}
                    </View>
                    <View className="flex-1 pb-2">
                        <Text className="text-base font-bold text-gray-800">{log.status}</Text>
                        <Text className="text-xs text-gray-400 mt-1">
                            {new Date(log.timestamp).toLocaleString()}
                        </Text>
                        {!!log.note && (
                            <Text className="text-sm text-gray-600 mt-2 bg-slate-50 p-3 rounded-lg">
                                {log.note}
                            </Text>
                        )}
                    </View>
                </View>
            ))}
        </View>
      </View>
    </ScrollView>
  );
}
