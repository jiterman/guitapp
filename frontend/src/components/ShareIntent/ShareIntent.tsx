import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useShareIntent } from 'expo-share-intent';

const ShareIntent: React.FC = () => {
  const router = useRouter();
  const { shareIntent, hasShareIntent } = useShareIntent();

  useEffect(() => {
    console.log('Effect de ShareIntent');
    console.log('hasShareIntent', hasShareIntent);
    console.log('shareIntent.type', shareIntent.type);
    console.log('shareIntent.files?.[0]', shareIntent.files?.[0]);
    if (hasShareIntent && shareIntent.type === 'media' && shareIntent.files?.[0]) {
      const filePath = shareIntent.files[0].path;
      router.push({
        pathname: '/share-intent',
        params: { sharedFilePath: filePath },
      });
    }
  }, [hasShareIntent, shareIntent]);

  return null;
};

export default ShareIntent;
