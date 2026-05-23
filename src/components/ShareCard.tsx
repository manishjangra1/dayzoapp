import React from 'react';
import { View, Text, Modal, TouchableOpacity, Share, Platform } from 'react-native';
import { X, Flame, Share2, Award, Zap } from 'lucide-react-native';

interface ShareCardProps {
  visible: boolean;
  onClose: () => void;
  username: string;
  streak: number;
  xp: number;
  levelTitle: string;
  challengeTitle: string;
}

export default function ShareCard({
  visible,
  onClose,
  username,
  streak,
  xp,
  levelTitle,
  challengeTitle,
}: ShareCardProps) {
  
  const handleNativeShare = async () => {
    try {
      const message = `🔥 I just completed "${challengeTitle}" and saved my ${streak}-day streak on Dayzo! 🚀 Join me and win your day: http://dayzo.app/invite`;
      await Share.share({
        message,
        title: 'Dayzo Streak Share',
      });
    } catch (error) {
      console.warn('Sharing failed:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/95 justify-center items-center px-6 py-10">
        
        {/* Header Options */}
        <View className="w-full flex-row justify-between items-center mb-6">
          <Text className="text-white/60 text-sm font-black tracking-widest uppercase">
            Story Share Preview
          </Text>
          <TouchableOpacity onPress={onClose} className="p-2 bg-white/10 rounded-full">
            <X color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        {/* 9:16 Story Card Container */}
        <View className="w-full max-w-[360px] aspect-[9/16] bg-darkCard border-2 border-primaryOrange/30 rounded-3xl p-6 relative overflow-hidden justify-between shadow-2xl shadow-primaryOrange/20">
          
          {/* Subtle Background Glow Elements */}
          <View className="absolute -top-10 -right-10 w-40 h-40 bg-primaryOrange/10 rounded-full blur-3xl" />
          <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-xpPurple/10 rounded-full blur-3xl" />

          {/* Card Top: Branding */}
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white text-2xl font-black tracking-tighter">
                DAYZO
              </Text>
              <Text className="text-primaryOrange text-[10px] font-black uppercase tracking-widest">
                Win your day.
              </Text>
            </View>
            <View className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
              <Text className="text-white/70 text-[10px] font-bold">
                @{username}
              </Text>
            </View>
          </View>

          {/* Card Center: Streak Flame & Title */}
          <View className="items-center my-6">
            <View className="w-24 h-24 bg-primaryOrange/10 border-2 border-primaryOrange rounded-full justify-center items-center mb-4 shadow-lg shadow-primaryOrange/30">
              <Flame color="#FF4B2B" fill="#FF4B2B" size={48} />
            </View>
            <Text className="text-white/40 text-xs font-black tracking-widest uppercase mb-1">
              Daily Challenge Completed
            </Text>
            <Text className="text-white text-3xl font-black text-center tracking-tight px-4 leading-tight">
              {challengeTitle}
            </Text>
          </View>

          {/* Card Bottom: Metrics */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-row justify-around">
            <View className="items-center">
              <View className="flex-row items-center mb-0.5">
                <Flame color="#FF4B2B" size={14} className="mr-0.5" />
                <Text className="text-white text-lg font-black">{streak}</Text>
              </View>
              <Text className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                Day Streak
              </Text>
            </View>
            
            <View className="w-[1px] h-8 bg-white/10 align-middle" />

            <View className="items-center">
              <View className="flex-row items-center mb-0.5">
                <Zap color="#00F2FE" size={14} className="mr-0.5" />
                <Text className="text-white text-lg font-black">+{xp} XP</Text>
              </View>
              <Text className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                Earned
              </Text>
            </View>

            <View className="w-[1px] h-8 bg-white/10 align-middle" />

            <View className="items-center">
              <View className="flex-row items-center mb-0.5">
                <Award color="#8A2387" size={14} className="mr-0.5" />
                <Text className="text-white text-base font-black">{levelTitle}</Text>
              </View>
              <Text className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                Rank Title
              </Text>
            </View>
          </View>

          {/* Footer Callout */}
          <View className="items-center mt-4">
            <Text className="text-white/30 text-[9px] font-black uppercase tracking-widest text-center">
              Compete with friends. Save your streak.
            </Text>
          </View>
        </View>

        {/* Share Button CTA */}
        <TouchableOpacity
          onPress={handleNativeShare}
          className="w-full max-w-[360px] bg-primaryOrange py-4 rounded-2xl flex-row justify-center items-center mt-6 active:scale-95 transition-all shadow-xl shadow-primaryOrange/20"
        >
          <Share2 color="#fff" size={20} className="mr-2" />
          <Text className="text-white text-base font-black uppercase tracking-wider">
            Share to Instagram Story
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
