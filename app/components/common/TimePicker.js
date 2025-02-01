import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const TimePicker = (props) => {
  const {
    hour,
    setHour,
    minute,
    setMinute,
    hourInputRef,
    minuteInputRef,
    isDispMin = true,
  } = props;

  const [bkHour, setBkHour] = useState(hour);
  const [bkMinute, setBkMinute] = useState(minute);

  // 時間（hour）のバリデーション
  const handleStartHourChange = (text) => {
    if (text.length === 1 && Number(text) > 2) {
      setHour("0" + text.substr(-1));
      if (isDispMin) minuteInputRef.current.focus();
    } else if (Number(text) > 24) {
      setHour("0" + text.substr(-1));
      if (isDispMin) minuteInputRef.current.focus();
    } else {
      setHour(text);
      if (text.length === 2) {
        if (isDispMin) minuteInputRef.current.focus();
      }
    }
  };

  // 分（minute）のバリデーション
  const handleStartMinuteChange = (text) => {
    if (text.length === 1 && Number(text) > 5) {
      setMinute("0" + text.substr(-1));
    } else if (Number(text) > 59) {
      setMinute("0" + text.substr(-1));
    } else {
      setMinute(text);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* 時間入力 */}
        <TextInput
          ref={hourInputRef}
          style={styles.input}
          value={hour}
          onChangeText={(text) => {
            handleStartHourChange(text);
          }}
          placeholder="00"
          keyboardType="numeric"
          maxLength={2} // 2桁まで
          returnKeyType="done"
          onFocus={() => {
            setBkHour(hour);
            setHour("");
          }}
          onBlur={() => {
            if (hour.length == 0) {
              setHour(bkHour);
            } else if (hour.length == 1) {
              setHour("0" + hour);
            }
          }}
        />
        {isDispMin && (
          <>
            <Text style={styles.colon}>:</Text>
            {/* 分入力 */}
            <TextInput
              ref={minuteInputRef}
              style={styles.input}
              value={minute}
              onChangeText={(text) => {
                handleStartMinuteChange(text);
              }}
              placeholder="00"
              keyboardType="numeric"
              maxLength={2} // 2桁まで
              returnKeyType="done"
              onFocus={() => {
                setBkMinute(minute);
                setMinute("");
              }}
              onBlur={() => {
                if (minute.length == 0) {
                  console.log(bkMinute);
                  setMinute(bkMinute);
                } else if (minute.length == 1) {
                  setMinute("0" + minute);
                }
              }}
            />
          </>
        )}
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // 横方向に中央揃え
  },
  input: {
    width: 50,
    height: 40,
    fontSize: 20,
    textAlign: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  colon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 5, // コロン間の余白を調整
  },
});

export default TimePicker;
