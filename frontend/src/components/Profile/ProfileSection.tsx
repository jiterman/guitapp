import React from 'react';
import { View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { profileSharedStyles } from '../../styles/profileStyles';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => {
  const childArray = React.Children.toArray(children);

  return (
    <>
      {!!title && <Text style={profileSharedStyles.sectionTitle}>{title}</Text>}
      <View style={profileSharedStyles.menuCard}>
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {index > 0 && <View style={profileSharedStyles.menuCardDivider} />}
            {child}
          </React.Fragment>
        ))}
      </View>
    </>
  );
};

export default ProfileSection;
