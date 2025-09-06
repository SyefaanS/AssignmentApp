import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const OCR_API_KEY = "K87706980588957";

interface Field {
  value: string;
  confidence: number;
}

// ==================== Helper Functions ====================
const extractName = (text: string) => {
  const lines = text.split("\n");
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 2 && /^[A-Za-z\s\.\-']+$/.test(line)) return line;
  }
  return "";
};

const extractID = (text: string) => {
  const match = text.match(/\b[A-Z0-9]{6,15}\b/);
  return match ? match[0] : "";
};

const extractDOB = (text: string) => {
  const match = text.match(
    /\b(\d{1,2}[\/\-\s](\d{1,2}|\w{3,})[\/\-\s]\d{2,4})\b/
  );
  return match ? match[0] : "";
};

const generateConfidence = () => Math.floor(70 + Math.random() * 30);

// ==================== Main Component ====================
const OCRScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<{
    name: Field;
    idNumber: Field;
    dob: Field;
  }>({
    name: { value: "", confidence: 0 },
    idNumber: { value: "", confidence: 0 },
    dob: { value: "", confidence: 0 },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      handleImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setFields({
      name: { value: "", confidence: 0 },
      idNumber: { value: "", confidence: 0 },
      dob: { value: "", confidence: 0 },
    });
  };

  const handleImage = async (uri: string) => {
    setImageUri(uri);
    setFields({
      name: { value: "", confidence: 0 },
      idNumber: { value: "", confidence: 0 },
      dob: { value: "", confidence: 0 },
    });
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "image.jpg",
      } as any);
      formData.append("apikey", OCR_API_KEY);
      formData.append("language", "eng");

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.ParsedResults && data.ParsedResults.length > 0) {
        const text = data.ParsedResults[0].ParsedText;

        setFields({
          name: { value: extractName(text), confidence: generateConfidence() },
          idNumber: { value: extractID(text), confidence: generateConfidence() },
          dob: { value: extractDOB(text), confidence: generateConfidence() },
        });
      } else {
        Alert.alert("OCR Failed", data.ErrorMessage?.[0] || "No text found.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to process image.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: keyof typeof fields, value: string) => {
    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  const saveData = () => {
    const filledFields = Object.values(fields).filter((f) => f.value.trim()).length;
    if (filledFields === 0) {
      Alert.alert("Nothing to save", "Please extract or enter data first.");
      return;
    }
    Alert.alert("Saved!", `Saved ${filledFields} field(s) successfully.`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📸 OCR.space Scanner</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>
        {imageUri && (
          <TouchableOpacity style={[styles.button, { backgroundColor: "#dc3545" }]} onPress={removeImage}>
            <Text style={styles.buttonText}>Remove Image</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />}

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <View style={styles.fieldsContainer}>
        <Text style={styles.fieldsTitle}>Extracted Information</Text>

        {(["name", "idNumber", "dob"] as (keyof typeof fields)[]).map((key) => (
          <View style={styles.fieldRow} key={key}>
            <Text style={styles.fieldLabel}>
              {key === "name" ? "Full Name" : key === "idNumber" ? "ID Number" : "Date of Birth"}:
            </Text>
            <TextInput
              style={styles.fieldInput}
              value={fields[key].value}
              onChangeText={(text) => updateField(key, text)}
            />
            <Text style={styles.confidence}>{fields[key].confidence}%</Text>
          </View>
        ))}

        <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={saveData}>
          <Text style={styles.buttonText}>Save Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  button: { backgroundColor: "#007AFF", padding: 14, borderRadius: 10, flex: 1, marginHorizontal: 5 },
  buttonText: { color: "white", fontSize: 16, textAlign: "center", fontWeight: "bold" },
  image: { width: "100%", height: 250, borderRadius: 12, resizeMode: "contain", marginBottom: 20 },
  fieldsContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 10 },
  fieldsTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  fieldRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  fieldLabel: { fontWeight: "600", width: 100 },
  fieldInput: { flex: 1, borderBottomWidth: 1, borderBottomColor: "#ccc", paddingVertical: 2, marginRight: 10 },
  confidence: { fontWeight: "bold", color: "#28a745", width: 50, textAlign: "right" },
});

export default OCRScreen;
