import { StyleSheet } from "react-native";
import { FAB, useTheme } from "react-native-paper";

type FABProps = {
  iconName: string
}

export default function FloatingButton({ iconName }: FABProps) {
  const theme = useTheme();
  return (

    <FAB
      icon={iconName}
      style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      color={theme.colors.onPrimary}
      onPress={() => console.log("FAB pressed")}
    />
  )
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 60,
    borderRadius: 28,
    elevation: 4,
  },
});