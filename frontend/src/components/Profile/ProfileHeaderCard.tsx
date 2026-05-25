import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import AvatarPicker from './AvatarPicker';
import type { UserProfile } from '../../context/UserContext';
import { profileColors, profileShadow, profileLayout } from '../../styles/profileStyles';

const { screenWidth, vh } = profileLayout;

interface ProfileHeaderCardProps {
  user: UserProfile | null;
  getCreatedMonth: () => string;
  getCreatedYear: () => string;
  onAvatarUploaded: (url: string) => void;
}

const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  user,
  getCreatedMonth,
  getCreatedYear,
  onAvatarUploaded,
}) => {
  const memberSince = `${getCreatedMonth()} ${getCreatedYear()}`;

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
    backgroundColor: profileColors.white,
    borderRadius: 16,
    marginBottom: vh * 2.5,
    padding: screenWidth * 0.05,
    flexDirection: 'column',
    alignItems: 'center',
    ...profileShadow,
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
    color: profileColors.navy,
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
    color: profileColors.muted,
  },
});

export default ProfileHeaderCard;
