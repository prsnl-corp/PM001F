import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet } from "react-native";

const TextAare = (props) => {
  const {
    value,
    setValue,
    textInputRef,
    type,
    width,
    height,
    maxLength,
    numberOfLines,
  } = props;

  const [dispValue, setDispValue] = useState("");
  const [includesCommaLength, setIncludesCommaLength] = useState(0);

  useEffect(() => {
    setDispValue(value);
    if (type === "numeric") {
      const commaCount = Math.max(0, Math.floor((maxLength - 1) / 3));
      setIncludesCommaLength(maxLength + commaCount);
    }
  }, []);

  const handleChange = (text) => {
    if (type === "numeric") {
      const numericValue = text.replace(/[^0-9]/g, "");
      const formattedValue = formatNumberWithCommas(numericValue);
      setDispValue(formattedValue);
    } else {
      setDispValue(text);
    }
    setValue(text);
  };

  // カンマ区切りにフォーマット
  const formatNumberWithCommas = (number) => {
    // 数値を正規表現でカンマ区切りにフォーマット
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={textInputRef}
          style={[{ width: width, height: height }, styles.input]}
          value={dispValue}
          onChangeText={(text) => {
            handleChange(text);
          }}
          maxLength={maxLength && includesCommaLength}
          returnKeyType="done"
          keyboardType={type}
          multiline={numberOfLines && true}
          numberOfLines={numberOfLines}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1を削除して、中央に配置する方法に変更
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5, // 複数のコンポーネントが重ならないように余白を追加
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // 横方向に中央揃え
  },
  input: {
    fontSize: 18,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    padding: 10,
  },
});

export default TextAare;
