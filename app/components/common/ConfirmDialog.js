import { Button, Text, Dialog, Portal } from "react-native-paper";

const ComfirmDialog = (props) => {
  const { visible, hideDialog, message, onPressCancel, onPressOK } = props;
  return (
    <Dialog visible={visible} style={{ backgroundColor: "white" }}>
      <Dialog.Title style={{ color: "black" }}>確認</Dialog.Title>
      <Dialog.Content>
        <Text variant="bodyMedium" style={{ color: "black" }}>
          {message}
        </Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onPressCancel}>キャンセル</Button>
        <Button onPress={onPressOK}>OK</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default ComfirmDialog;
