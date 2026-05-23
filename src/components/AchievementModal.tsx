import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Award, Zap, Flame } from 'lucide-react-native';

interface AchievementModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'LEVEL_UP' | 'BADGE';
  title: string;
  subtitle: string;
  icon?: string;
}

export default function AchievementModal({
  visible,
  onClose,
  type,
  title,
  subtitle,
  icon,
}: AchievementModalProps) {
  const isLevelUp = type === 'LEVEL_UP';

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/90 justify-center items-center px-6">
        
        {/* Glowing Celebration Box */}
        <View className="w-full max-w-[340px] bg-darkCard border border-white/10 rounded-3xl p-8 items-center relative overflow-hidden shadow-2xl">
          
          {/* Glowing Accents */}
          <View className={`absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl ${isLevelUp ? 'bg-xpPurple/20' : 'bg-primaryOrange/20'}`} />
          
          {/* Header Tag */}
          <Text className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6 ${isLevelUp ? 'bg-xpPurple/20 text-xpPink' : 'bg-primaryOrange/20 text-primaryOrange'}`}>
            {isLevelUp ? 'Level Unlocked 🚀' : 'New Badge Earned 🏆'}
          </Text>

          {/* Core Visual */}
          <View className="w-28 h-28 bg-white/5 border border-white/10 rounded-full justify-center items-center mb-6 relative">
            {isLevelUp ? (
              <Zap color="#8A2387" size={56} />
            ) : (
              <Text className="text-6xl">{icon || '🏅'}</Text>
            )}
          </View>

          {/* Title */}
          <Text className="text-white text-3xl font-black tracking-tight text-center mb-2 leading-tight">
            {title}
          </Text>

          {/* Subtitle */}
          <Text className="text-white/60 text-sm font-medium text-center mb-8 px-2 leading-relaxed">
            {subtitle}
          </Text>

          {/* Action CTA */}
          <TouchableOpacity
            onPress={onClose}
            className={`w-full py-4 rounded-2xl justify-center items-center active:scale-95 transition-all ${isLevelUp ? 'bg-xpPurple' : 'bg-primaryOrange'}`}
          >
            <Text className="text-white text-base font-black uppercase tracking-wider">
              Lets Go! 🔥
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
