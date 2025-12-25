/** Add receipt screen for uploading and processing receipts */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import apiClient from "../api/client";
import { API_ENDPOINTS } from "../config/env";
import { Receipt } from "../types";
import { ReceiptCard } from "../components/ReceiptCard";
import { useQueryClient } from "@tanstack/react-query";
import { ProgressBar } from "../components/ProgressBar";
import Logger from "../utils/logger";

export const AddReceiptScreen: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const queryClient = useQueryClient();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photos to upload receipts."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setReceipt(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your camera to take photos."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setReceipt(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const [progress, setProgress] = useState(0);

  const uploadReceipt = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    setUploading(true);
    setProgress(0);

    // Simulate OCR progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.9) return prev;
        return prev + 0.1;
      });
    }, 400);

    try {
      // Create FormData
      const formData = new FormData();
      const filename = image.split("/").pop() || "receipt.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri: image,
        name: filename,
        type,
      } as any);

      Logger.info("Uploading receipt...", { filename, uri: image, type });

      // Upload to backend
      const response = await apiClient.axiosInstance.post<Receipt>(
        API_ENDPOINTS.RECEIPTS.UPLOAD,
        formData,
        {
          headers: {
            // "Content-Type": "multipart/form-data", // Let Axios set this automatically with boundary
            Accept: "application/json",
          },
          transformRequest: (data, headers) => {
            // React Native FormData fix
            return data;
          }
        }
      );

      clearInterval(progressInterval);
      setProgress(1.0);
      Logger.info("Receipt processed successfully", { id: response.data.id });

      // Short delay to show 100%
      setTimeout(() => {
        setReceipt(response.data);
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["analytics"] });
        setUploading(false);
        Alert.alert("Success", "Receipt processed successfully!");
      }, 500);

    } catch (error: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setUploading(false);
      const message = error.response?.data?.detail || "Failed to process receipt";
      Logger.error("Receipt upload failed", { error: message });

      Alert.alert(
        "Processing Error",
        message
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add Receipt</Text>

        {!image ? (
          <View style={styles.imagePicker}>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>📷 Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.buttonText}>📸 Take Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.imageActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setImage(null);
                  setReceipt(null);
                }}
              >
                <Text style={styles.secondaryButtonText}>Change Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={uploadReceipt}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Process Receipt</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {uploading && (
          <View style={styles.processingContainer}>
            <Text style={styles.processingTitle}>Analyze Receipt</Text>
            <ProgressBar
              progress={progress}
              label={progress < 1 ? "Extracting text & data..." : "Complete!"}
            />
            <Text style={styles.processingText}>
              This may take a few seconds depending on the image clarity.
            </Text>
          </View>
        )}

        {receipt && (
          <View style={styles.receiptContainer}>
            <Text style={styles.receiptTitle}>Parsed Receipt</Text>
            <ReceiptCard receipt={receipt} />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 24,
  },
  imagePicker: {
    gap: 16,
  },
  button: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  imageContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: "contain",
    backgroundColor: "#f0f0f0",
  },
  imageActions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  primaryButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2e7d32",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  processingContainer: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  processingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#888",
    textAlign: 'center'
  },
  receiptContainer: {
    marginTop: 16,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
});

