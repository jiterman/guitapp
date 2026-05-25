import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import AvatarPicker from './AvatarPicker';
import type { UserProfile } from '../../context/UserContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const vh = screenHeight / 100;

interface ProfileHeaderCardProps {
  user: UserProfile | null;
  memberSince: string;
  onAvatarUploaded: (url: string) => void;
}

const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  user,
  memberSince,
  onAvatarUploaded,
}) => {
  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <AvatarPicker avatarUrl={user?.avatarUrl} onUploaded={onAvatarUploaded} />
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>
          {user?.firstName} {user?.lastName}
        </Text>

        <View style={styles.memberRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b8aa1" />
          <Text style={styles.memberText}>Miembro desde {memberSince}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: vh * 2.5,
    padding: screenWidth * 0.05,
    flexDirection: 'column',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003366',
    alignSelf: 'center',
    width: '100%',
    textAlign: 'center',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  memberText: {
    fontSize: 13,
    color: '#6b8aa1',
  },
});

export default ProfileHeaderCard;
