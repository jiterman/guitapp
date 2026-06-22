import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import {
  transactionFormStyles as styles,
  ICON_SIZES,
  ICON_COLORS,
} from '../../styles/transactionFormStyles';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  label: string;
  scrollViewRef?: React.RefObject<ScrollView | null>;
  scrollYRef?: React.RefObject<number>;
  onRemove?: () => void;
}

const ExpandableTextInput: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder,
  label,
  scrollViewRef,
  scrollYRef: externalScrollYRef,
  onRemove,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardHeightRef = useRef(0);
  const isFocusedRef = useRef(false);
  const internalScrollYRef = useRef(0);
  const scrollYRef = externalScrollYRef ?? internalScrollYRef;
  const containerRef = useRef<View>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', e => {
      keyboardHeightRef.current = e.endCoordinates.height;
      setKeyboardHeight(e.endCoordinates.height);
      if (!isFocusedRef.current || !scrollViewRef?.current || !containerRef.current) return;
      const screenHeight = Dimensions.get('window').height;
      containerRef.current.measure((_x, _y, _w, h, _pageX, pageY) => {
        const fieldBottomOnScreen = pageY + h;
        const keyboardTop = screenHeight - keyboardHeightRef.current;
        const overlap = fieldBottomOnScreen - keyboardTop + 32;
        if (overlap > 0) {
          scrollViewRef.current?.scrollTo({
            y: scrollYRef.current + overlap,
            animated: true,
          });
        }
      });
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [scrollViewRef, scrollYRef]);

  return (
    <>
      {onRemove ? (
        <View style={styles.expandableLabelRow}>
          <Text style={[styles.label, styles.expandableLabelText]}>{label}</Text>
          <TouchableOpacity onPress={onRemove} hitSlop={8}>
            <Ionicons name="close" size={18} color="#90A4AE" />
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
      <View
        ref={containerRef}
        style={[styles.inputWithIcon, expanded && { alignItems: 'flex-start' }]}
        collapsable={false}
      >
        <View style={styles.inputIconContainer}>
          <Ionicons name="document-text-outline" size={ICON_SIZES.small} color={ICON_COLORS.gray} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          style={[
            styles.textInput,
            expanded && styles.textInputMultiline,
            { textAlignVertical: expanded ? 'top' : 'center' },
          ]}
          placeholderTextColor="#B0BEC5"
          maxLength={255}
          multiline={expanded}
          numberOfLines={expanded ? undefined : 1}
          onFocus={() => {
            isFocusedRef.current = true;
            if (!expanded) setExpanded(true);
          }}
          onBlur={() => {
            isFocusedRef.current = false;
          }}
        />
        <TouchableOpacity
          onPress={() => setExpanded(e => !e)}
          hitSlop={8}
          style={expanded ? { paddingTop: 9 } : undefined}
        >
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#999" />
        </TouchableOpacity>
      </View>
      {keyboardHeight > 0 && <View style={{ height: keyboardHeight - 125 }} />}
    </>
  );
};

export default ExpandableTextInput;
