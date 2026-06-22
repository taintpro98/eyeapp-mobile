import { View, Text, TextInput, StyleSheet, Pressable, ViewStyle } from "react-native";
import { Search } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  style?: ViewStyle;
};

export function SymbolSearchBar({ value, onChangeText, onSubmit, placeholder = "Filter by symbol", style }: Props) {
  const c = useThemeColors();
  const { t } = useTranslation();

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
      <Pressable
        onPress={onSubmit}
        style={[styles.findBtn, { backgroundColor: c.brand }]}
      >
        <Text style={[styles.findText, { fontFamily: typography.familySemiBold }]}>
          {t("common.find")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 13,
    paddingRight: 4,
  },
  input: { flex: 1, fontSize: 13, padding: 0 },
  findBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9,
  },
  findText: { color: "#fff", fontSize: 13 },
});
