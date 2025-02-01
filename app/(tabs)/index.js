import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  View,
  // Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import {
  Appbar,
  IconButton,
  Text,
  Snackbar,
  Surface,
  Button,
  MD2Colors,
  MD3Colors,
} from "react-native-paper";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";

import { DataTable, FAB } from "react-native-paper";

import * as CONST from "../common/const";
import RegistModal from "../components/attendance/RegistModal";

const { height } = Dimensions.get("window");

export default function HomeScreen() {
  // const router = useRouter();
  const { allDiligenceData, isRegistSuccess } = useLocalSearchParams();

  // 勤怠データ
  const [diligenceData, setDiligenceData] = useState([]);

  // 登録済みデータかどうか
  const [isRegistered, setIsRegistered] = useState(false);

  // 承認済みかどうか
  const [isApproved, setIsApproved] = useState(false);

  // 表示年月
  const [dispDate, setDispDate] = useState("");
  const [dispYear, setDispYear] = useState();
  const [dispMonth, setDispMonth] = useState();

  // 月末申請ボタン表示
  const [isDispApplyBtn, setIsDispApplyBtn] = useState(false);

  const [moveButton, setMoveButton] = useState(1); // 1:前の月に移動、2:次の月に移動

  const [isShowSnackbar, setIsShowSnackbar] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const dt = new Date();
      const year = dt.getFullYear();
      const month = dt.getMonth() + 1;
      setDispDate(`${year}年${month}月`);
      setDispYear(year);
      setDispMonth(month);
      if (isRegistSuccess) {
        setIsShowSnackbar(true);
      }
      if (allDiligenceData) {
        setDispDiligenceData(year, month);
      }
    }, [])
  );

  // 勤怠一覧にデータをセットする
  const setDispDiligenceData = (year, month) => {
    const stringYear = String(year);
    const stringMonth = String(month).padStart(2, "0");

    const lastDay = new Date(year, month, 0).getDate();
    let holidays = getHoliday(year, month);
    let result = [];

    let dt = new Date();
    let currentYear = dt.getFullYear();
    let currentMonth = dt.getMonth() + 1;
    let currentDay = dt.getDate();

    let dateCls = 0; // -1:先月以前,0:今月,1:来月以降
    let registeredata = [];
    let isApproved = false;

    if ((currentYear === year && currentMonth > month) || currentYear > year) {
      // 先月以前
      dateCls = -1;
    } else if (
      (currentYear === year && currentMonth < month) ||
      currentYear < year
    ) {
      // 来月以降
      dateCls = 1;
    }

    let json = JSON.parse(allDiligenceData).find(
      (d) => d.year === stringYear && d.month === stringMonth
    );
    if (json) {
      registeredata = JSON.parse(json.data);
      isApproved = json.isApproved;
      setIsRegistered(json.isRegistered);
    } else {
      registeredata = [];
      setIsRegistered(false);
    }
    for (let i = 1; i <= lastDay; i++) {
      let weekDay = new Date(year, month - 1, i).getDay();
      let weekStr = CONST.DAY_OF_WEEKSTR_JA[weekDay];
      let day = `${i}(${weekStr})`;

      let isHoliday = false;
      let fontColorCls = 0;
      if (holidays.includes(i)) {
        isHoliday = true;
        fontColorCls = 1;
      } else {
        if (weekDay === 0) {
          isHoliday = true;
          fontColorCls = 1;
        } else if (weekDay === 6) {
          isHoliday = true;
          fontColorCls = 2;
        }
      }

      let isToday = dateCls === 0 && i === currentDay ? true : false;

      let blankData = {
        day: i,
        dispDay: day,
        startTime: "",
        endTime: "",
        breakTime: "",
        workTime: "",
        overTime: "",
        paid: "",
        transExp: 0,
        remarks: "",
        isHoliday: isHoliday,
        isToday: isToday,
        fontColorCls: fontColorCls,
        isMinus: false,
      };

      if (registeredata.length > 0) {
        let filteredData = registeredata.find((d) => d.day === i);
        if (filteredData) {
          let data = {
            day: i,
            dispDay: day,
            startTime: filteredData.startTime,
            endTime: filteredData.endTime,
            breakTime: filteredData.breakTime,
            workTime: filteredData.workTime,
            overTime: filteredData.overTime,
            paid: filteredData.paid,
            transExp: filteredData.transExp,
            remarks: filteredData.remarks,
            isHoliday: isHoliday,
            isToday: isToday,
            fontColorCls: fontColorCls,
            isMinus: false,
          };
          result.push(data);
        } else {
          result.push(blankData);
        }
      } else {
        result.push(blankData);
      }
    }

    let bussDays = result.filter((d) => !d.isHoliday);
    let lastBussDay = String(bussDays[bussDays.length - 1].day);

    if (
      !isApproved &&
      new Date() >= new Date(`${year}/${month}/${lastBussDay}`)
    ) {
      setIsDispApplyBtn(true);
    } else {
      setIsDispApplyBtn(false);
    }
    setDiligenceData(result);
    setIsApproved(isApproved);
  };

  // 表示月の祝日を取得する
  const getHoliday = (year, month) => {
    let JapaneseHolidays = require("japanese-holidays");
    let result = JapaneseHolidays.getHolidaysOf(year)
      .filter((d) => d.month === month)
      .map((d) => d.date);
    return result;
  };

  // 前の月に移動
  const onClickBack = () => {
    let newYear = Number(dispYear);
    let newMonth = Number(dispMonth) - 1;
    if (newMonth === 0) {
      newYear--;
      newMonth = 12;
    }

    setDispDate(`${newYear}年${newMonth}月`);
    setDispYear(newYear);
    setDispMonth(newMonth);
    setDispDiligenceData(newYear, newMonth);
  };

  // 次の月に移動
  const onClickNext = () => {
    let newYear = Number(dispYear);
    let newMonth = Number(dispMonth) + 1;
    if (newMonth === 13) {
      newYear++;
      newMonth = 1;
    }

    setDispDate(`${newYear}年${newMonth}月`);
    setDispYear(newYear);
    setDispMonth(newMonth);
    setDispDiligenceData(newYear, newMonth);
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  // 🔹 モーダルが開いている間はタブを非表示にする
  useLayoutEffect(() => {
    if (isModalVisible) {
      navigation.setOptions({ tabBarStyle: { display: "none" } });
    } else {
      navigation.setOptions({ tabBarStyle: { display: "flex" } });
    }
  }, [isModalVisible, navigation]);

  // 🔹 画面がフォーカスされたときにタブを元の状態に戻す
  useFocusEffect(
    useCallback(() => {
      if (!isModalVisible) {
        navigation.setOptions({ tabBarStyle: { display: "flex" } });
      }
    }, [isModalVisible, navigation])
  );

  return (
    <>
      <Appbar.Header style={styles.header}>
        <Appbar.Action
          icon="cog"
          // onPress={() => {}}
        />
        <Appbar.Action
          icon="chevron-left"
          onPress={() => {
            let isEditing = false;
            // if (!isApproved) isEditing = checkEditing();
            if (isEditing) {
              setMoveButton(1);
              setIsShowMoveConfirm(true);
            } else {
              onClickBack();
            }
          }}
          style={{ marginLeft: 30 }}
        />
        <Appbar.Content title={dispDate} style={{ alignItems: "center" }} />
        <Appbar.Action
          icon="chevron-right"
          onPress={() => {
            let isEditing = false;
            // if (!isApproved) isEditing = checkEditing();
            if (isEditing) {
              setMoveButton(2);
              setIsShowMoveConfirm(true);
            } else {
              onClickNext();
            }
          }}
          style={{ marginRight: 30 }}
        />
        <Appbar.Action
          icon="cog"
          onPress={() => {
            // onPress={() => {}}
          }}
        />
      </Appbar.Header>
      <DataTable>
        <DataTable.Header style={styles.tableHeader}>
          <DataTable.Title style={{ flex: 2, alignItems: "center" }}>
            <Text style={styles.tableHeaderText}>日</Text>
          </DataTable.Title>
          <DataTable.Title style={{ flex: 3.5, alignItems: "center" }}>
            <Text style={styles.tableHeaderText}>勤務時間</Text>
          </DataTable.Title>
          <DataTable.Title style={{ flex: 2, alignItems: "center" }}>
            <Text style={styles.tableHeaderText}>休憩時間</Text>
          </DataTable.Title>
          <DataTable.Title style={{ flex: 2, alignItems: "center" }}>
            <Text style={styles.tableHeaderText}>実働</Text>
          </DataTable.Title>
          <DataTable.Title style={{ flex: 2, alignItems: "center" }}>
            <Text style={styles.tableHeaderText}>有給</Text>
          </DataTable.Title>
          <DataTable.Title style={{ flex: 1 }}></DataTable.Title>
        </DataTable.Header>
      </DataTable>
      <ScrollView bounces={false}>
        <DataTable>
          {diligenceData.map((data, index) => (
            <DataTable.Row
              key={index}
              style={
                data.isToday
                  ? styles.todayRow
                  : data.isHoliday
                  ? styles.hodidayRow
                  : styles.nomalRow
              }
            >
              <DataTable.Cell style={{ flex: 2 }}>
                <Text
                  style={
                    data.fontColorCls === 1
                      ? styles.redCell
                      : data.fontColorCls === 2
                      ? styles.blueCell
                      : styles.normalCell
                  }
                >
                  {data.dispDay}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell style={{ flex: 3.5 }}>
                <Text>
                  {data.startTime !== "" && data.startTime + "-" + data.endTime}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell style={{ flex: 2 }}>
                <Text>{data.breakTime}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={{ flex: 2 }}>
                <Text>{data.workTime}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={{ flex: 2 }}>
                <Text>{data.paid}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={{ flex: 1 }}>
                <IconButton
                  icon="chevron-right"
                  iconColor={MD3Colors.primary10}
                  size={20}
                  onPress={() => console.log(data)}
                />
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
        <Snackbar
          visible={isShowSnackbar}
          onDismiss={() => {
            setIsShowSnackbar(false);
          }}
          action={{
            label: "Undo",
            onPress: () => {
              // Do something
            },
          }}
        >
          登録しました
        </Snackbar>
      </ScrollView>
      <FAB
        icon="table-edit"
        style={styles.fab}
        // animated
        onPress={() => setModalVisible(true)}
      />
      {/* モーダル */}
      {isModalVisible && (
        <Animated.View
          style={[styles.modal]}
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
        >
          <RegistModal
            year={dispYear}
            month={dispMonth}
            isRegistered={isRegistered}
            json={JSON.stringify(diligenceData)}
            closeModal={() => setModalVisible(false)}
          />
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "skyblue", // ヘッダーの背景色
    // marginLeft: "auto",
  },
  column: {
    flex: 1,
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
  },
  tableHeaderText: {
    color: "#000",
    textAlign: "center",
  },
  hodidayRow: {
    backgroundColor: "#f5f5f5",
  },
  todayRow: {
    backgroundColor: "#ffff7f",
  },
  nomalRow: {
    backgroundColor: "#fff",
  },
  normalCell: {
    color: "#000",
  },
  blueCell: {
    color: "#3f51b5",
  },
  redCell: {
    color: "red",
  },

  flexContainer: {
    flexDirection: "row",
    backgroundColor: "aliceblue",
    justifyContent: "center",
    alignItems: "center", // 高さを揃える
    padding: 10,
    height: 50,
  },
  box: {
    // flex: 1,
    width: 100,
    // height: 70,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  surface: {
    padding: 8,
    margin: 10,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },

  modal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%", // モーダルの高さ
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
