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
  TouchableOpacity,
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

  const deletePhoto = (index: number) => {
    setImageUris(prevUris => {
      const newUris = [...prevUris];
      newUris.splice(index, 1);
      return newUris;
    });
  };

  const handlePhotoPress = (index: number) => {
    // Show delete options
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Delete Photo'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            deletePhoto(index);
          }
        }
      );
    } else {
      // For Android
      Alert.alert(
        'Photo Options',
        'What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: () => deletePhoto(index), style: 'destructive' }
        ],
        { cancelable: true }
      );
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
                renderItem={({ item, index }) => (
                  <View style={styles.imageContainer}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onLongPress={() => handlePhotoPress(index)}
                      delayLongPress={500}
                    >
                      <Galeria.Image index={index}>
                        <Image
                          source={{ uri: item }}
                          style={styles.image}
                          contentFit="cover"
                        />
                      </Galeria.Image>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(uri) => uri}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
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
    paddingTop: 50,
  },
  buttonContainer: {
    marginVertical: 10,
    maxWidth: 250,
    alignSelf: 'center',
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
  flatListContent: {
    alignItems: 'center',
  },
});