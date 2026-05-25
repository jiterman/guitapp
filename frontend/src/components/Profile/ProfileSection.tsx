import React from 'react';
import { View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { profileSharedStyles } from '../../styles/profileStyles';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => {
  return (
    <>
      {!!title && <Text style={profileSharedStyles.sectionTitle}>{title}</Text>}
      <View style={profileSharedStyles.menuCard}>{children}</View>
    </>
  );
};

export default ProfileSection;
