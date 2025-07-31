import React, { useState } from 'react';
import {
  Button,
  StyleSheet,
  View,
  Platform,
  ActionSheetIOS,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Galeria } from '@nandorojo/galeria';

export default function App() {
  const [imageUris, setImageUris] = useState<string[]>([]);

  const takePhoto = async () => {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to take photos!');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageUris(prevUris => [...prevUris, result.assets[0].uri]);
    }
  };

  const pickImageFromGallery = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need media library permissions to make this work!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newUris = result.assets.map(asset => asset.uri);
      setImageUris(prevUris => [...prevUris, ...newUris]);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          }
        }
      );
    } else {
      // For Android, we'll use a simple alert with buttons
      Alert.alert(
        'Add Photo',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Library', onPress: pickImageFromGallery },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Add Photo" onPress={showImageOptions} />
        {imageUris.length > 0 ? (
          <View style={styles.galleryContainer}>
            <Galeria urls={imageUris}>
              <FlatList
                data={imageUris}
                renderItem={({ item, index }) => {
                  return (
                    <View key={item} style={styles.imageContainer}>
                      <Galeria.Image index={index}>
                        <Image
                          source={{ uri: item }}
                          style={styles.image}
                          contentFit="cover"
                        />
                      </Galeria.Image>
                    </View>
                  )
                }}
                numColumns={2}
                keyExtractor={(item, index) => item + index.toString()}
             />
            </Galeria>
          </View>
        ) : null}
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const imageWidth = (width - 50) / 2; // Accounting for container padding and gap

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  galleryContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  imageContainer: {
    width: imageWidth,
    aspectRatio: 1,
    margin: 5,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});