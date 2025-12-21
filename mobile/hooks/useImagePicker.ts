import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

const IMAGE_PICKER_OPTIONS = {
  allowsEditing: true,
  aspect: [1, 1] as [number, number],
  quality: 1.0,
};

export const useImagePicker = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const requestPermission = async (
    type: "camera" | "library"
  ): Promise<boolean> => {
    const { status } =
      type === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Cần quyền truy cập trên thiết bị",
        type === "camera"
          ? "Vui lòng cấp quyền sử dụng camera"
          : "Vui lòng cấp quyền truy cập thư viện ảnh"
      );
      return false;
    }

    return true;
  };

  const pickImage = async () => {
    if (!(await requestPermission("library"))) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      ...IMAGE_PICKER_OPTIONS,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (!(await requestPermission("camera"))) return;

    const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS);

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  return {
    selectedImage,
    pickImage,
    takePhoto,
    clearImage,
  };
};
