import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Appbar, Portal, PaperProvider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import TimePicker from "../common/TimePicker";
import TextAare from "../common/TextAare";
import ComfirmDialog from "../common/ConfirmDialog";
import { calcTime } from "../../common/const";

const RegistModal = (props) => {
  const { year, month, isRegistered, json, closeModal } = props;
  const navigation = useNavigation();

  const stringYear = String(year);
  const stringMonth = String(month).padStart(2, "0");
  const currentMonth = `${stringYear}-${stringMonth}`;
  const diligenceData = JSON.parse(json);

  const [markedDates, setMarkedDates] = useState({});

  // キーボードを閉じる処理
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    let markedDateData = {};
    for (let i = 0; i < diligenceData.length; i++) {
      let data = diligenceData[i];
      let day =
        stringYear +
        "-" +
        stringMonth +
        "-" +
        String(data.day).padStart(2, "0");
      let addData = {};
      if (data.startTime !== "" || data.paid !== "") {
        addData["marked"] = true;
        addData["dotColor"] = "orange";
      }
      if (data.isToday) {
        addData["selected"] = true;
        addData["selectedColor"] = "blue";
      }
      if (data.fontColorCls === 1) {
        addData["customStyles"] = { text: { color: "red" } };
      }
      if (data.fontColorCls === 2) {
        addData["customStyles"] = { text: { color: "blue" } };
      }
      markedDateData[day] = addData;
    }
    setMarkedDates(markedDateData);
  }, []);

  const onDayPress = (day) => {
    const dateString = day.dateString;

    setMarkedDates((prevMarkedDates) => {
      const isSelected = prevMarkedDates[dateString]?.selected;

      // 選択状態をトグル
      return {
        ...prevMarkedDates,
        [dateString]: {
          ...prevMarkedDates[dateString],
          selected: !isSelected,
          selectedColor: "blue",
        },
      };
    });
  };

  // TextInputの参照
  const startHourInputRef = useRef(null);
  const startMinuteInputRef = useRef(null);
  const endHourInputRef = useRef(null);
  const endMinuteInputRef = useRef(null);
  const breakHourInputRef = useRef(null);
  const breakMinuteInputRef = useRef(null);
  const paidInputRef = useRef(null);
  const transExpInputRef = useRef(null);

  // 開始時間
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");

  // 開始時間
  const [endHour, setEndHour] = useState("18");
  const [endMinute, setEndMinute] = useState("00");

  // 休憩時間
  const [breakHour, setBreakHour] = useState("01");
  const [breakMinute, setBreakMinute] = useState("00");

  // 有給
  const [paidHour, setPaidHour] = useState("00");

  // 交通費
  const [transExp, setTransExp] = useState(0);

  // 備考
  const [remarks, setRemarks] = useState("");

  // キーボード表示状態
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // キーボードの表示を検知
    const showSubscription = Keyboard.addListener("keyboardWillShow", () => {
      setKeyboardVisible(true);
    });

    // キーボードの非表示を検知
    const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardVisible(false);
    });

    // クリーンアップ
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const [visible, setVisible] = useState(false);

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  const onPressRegist = () => {
    setKeyboardVisible(false);
    dismissKeyboard();
    showDialog();
  };

  const registData = () => {
    let newData = diligenceData.map((obj) => {
      const { check, dispDay, isToday, fontColorCls, ...newObj } = obj;
      return newObj;
    });
    let time = calcTime(
      startHour,
      startMinute,
      endHour,
      endMinute,
      breakHour,
      breakMinute
    );
    let workTime = time.workTime;
    let overTime = time.overTime;
    let isMinus = time.isMinus;
    Object.entries(markedDates).forEach((data) => {
      if (data[1].selected) {
        let date = new Date(data[0]);
        let day = date.getDate();
        newData[day - 1].startTime = startHour + ":" + startMinute;
        newData[day - 1].endTime = endHour + ":" + endMinute;
        newData[day - 1].breakTime = breakHour + ":" + breakMinute;
        newData[day - 1].workTime = workTime;
        newData[day - 1].overTime = overTime;
        newData[day - 1].paid = paidHour === "00" ? "" : paidHour + ":00";
        newData[day - 1].transExp = transExp;
        newData[day - 1].remarks = remarks;
        newData[day - 1].isMinus = isMinus;
      }
    });
    const params = {
      user: "00000002",
      year: stringYear,
      month: stringMonth,
      data: JSON.stringify(newData),
      isRegistered: isRegistered,
    };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    };
    fetch("http://localhost:5001" + "/saveAtndData", requestOptions)
      .then((res) => res.json())
      .then((json) => {
        hideDialog();
        navigation.navigate("(tabs)", {
          screen: "index",
          params: { isRegistSuccess: true },
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
    // hideDialog();
    // navigation.navigate("(tabs)", {
    //   screen: "index",
    //   params: { isRegistSuccess: true },
    // });
  };

  return (
    <PaperProvider>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <Appbar.Header style={styles.header}>
            <Text style={styles.buttonText} onPress={() => closeModal(false)}>
              キャンセル
            </Text>
            <Appbar.Content style={{ color: "black" }} title="勤務時間登録" />
            <Text
              style={[{ textAlign: "right" }, styles.buttonText]}
              onPress={onPressRegist}
            >
              登録
            </Text>
          </Appbar.Header>
          {!isKeyboardVisible && (
            <Calendar
              current={currentMonth}
              monthFormat={"yyyy年 M月"}
              // 日付がタップされたときに状態を更新
              onDayPress={onDayPress}
              markedDates={markedDates}
              // // 他のカスタマイズ例
              theme={{
                todayColor: "red",
                // arrowColor: "blue",
                // selectedDayBackgroundColor: "blue",
                // selectedDayTextColor: "white",
              }}
              hideArrows={true} // 月変更ボタン（矢印）を非表示にする
              firstDay={0} // 日曜始まり
              dayNamesShort={["日", "月", "火", "水", "木", "金", "土"]}
            />
          )}
          <View style={styles.content}>
            <View style={styles.rowFlexContainer}>
              <View style={styles.columnFlexContainer}>
                <Text>開始時間</Text>
                <TimePicker
                  hour={startHour}
                  setHour={setStartHour}
                  minute={startMinute}
                  setMinute={setStartMinute}
                  hourInputRef={startHourInputRef}
                  minuteInputRef={startMinuteInputRef}
                />
              </View>
              <View style={[{ marginLeft: 15 }, styles.columnFlexContainer]}>
                <Text>開始時間</Text>
                <TimePicker
                  hour={endHour}
                  setHour={setEndHour}
                  minute={endMinute}
                  setMinute={setEndMinute}
                  hourInputRef={endHourInputRef}
                  minuteInputRef={endMinuteInputRef}
                />
              </View>
            </View>
            <View style={styles.rowFlexContainer}>
              <View style={styles.columnFlexContainer}>
                <Text>休憩時間</Text>
                <TimePicker
                  hour={breakHour}
                  setHour={setBreakHour}
                  minute={breakMinute}
                  setMinute={setBreakMinute}
                  hourInputRef={breakHourInputRef}
                  minuteInputRef={breakMinuteInputRef}
                />
              </View>
              <View style={[{ marginLeft: 15 }, styles.columnFlexContainer]}>
                <Text>有給</Text>
                <View style={styles.rowFlexContainer}>
                  <TimePicker
                    hour={paidHour}
                    setHour={setPaidHour}
                    hourInputRef={paidInputRef}
                    isDispMin={false}
                  />
                  <View style={styles.labelContainer}>
                    <Text style={{ fontSize: 20, marginLeft: 5 }}>h</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.rowFlexContainer}>
              <View style={styles.columnFlexContainer}>
                <Text>交通費</Text>
                <TextAare
                  value={transExp}
                  setValue={setTransExp}
                  textInputRef={transExpInputRef}
                  type={"numeric"}
                  width={100}
                  maxLength={6}
                />
              </View>
            </View>
            <View style={styles.rowFlexContainer}>
              <View style={styles.columnFlexContainer}>
                <Text>備考</Text>
                <TextAare
                  value={remarks}
                  setValue={setRemarks}
                  textInputRef={transExpInputRef}
                  type={"default"}
                  width={"100%"}
                  height={100}
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>
          {/* ダイアログ */}
          <Portal>
            <ComfirmDialog
              visible={visible}
              onPressCancel={hideDialog}
              onPressOK={registData}
              message={"勤務時間を登録します。\nよろしいですか？"}
            />
          </Portal>
        </View>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // ヘッダーの背景色
  },
  header: {
    backgroundColor: "skyblue", // ヘッダーの背景色
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    color: "blue",
    padding: 10,
    fontSize: 18,
    width: 100,
  },
  rowFlexContainer: {
    flexDirection: "row",
  },
  labelContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center", // 横方向に中央揃え
    marginRight: 10,
  },
  columnFlexContainer: {
    flexDirection: "column",
  },
});

export default RegistModal;
