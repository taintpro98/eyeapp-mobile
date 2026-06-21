import { View, TextInput, StyleSheet, ViewStyle } from "react-native";
import { Search } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  style?: ViewStyle;
};

export function SymbolSearchBar({ value, onChangeText, onSubmit, placeholder = "Filter by symbol", style }: Props) {
  const c = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: c.card, borderColor: c.cardBorder }, style]}>
      <Search size={17} color={c.textFaint} />
      <TextInput
        style={[styles.input, { color: c.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={c.textFaint}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    height: 42,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 13,
  },
  input: { flex: 1, fontSize: 13, padding: 0 },
});
