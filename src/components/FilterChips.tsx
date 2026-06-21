import { View, Text, Pressable, StyleSheet } from "react-native";
import { useThemeColors } from "@/theme/useTheme";
import { typography } from "@/theme/tokens";

type Props<T extends string> = {
  options: { label: string; value: T }[];
  selected: T;
  onSelect: (value: T) => void;
};

export function FilterChips<T extends string>({
  options,
  selected,
  onSelect,
}: Props<T>) {
  const c = useThemeColors();
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <Pressable key={opt.value} onPress={() => onSelect(opt.value)}>
            <View
              style={[
                styles.chip,
                active
                  ? { backgroundColor: c.chipActiveBg }
                  : {
                      backgroundColor: c.chipBg,
                      borderWidth: 1,
                      borderColor: c.chipBorder,
                    },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: active ? c.chipActiveText : c.textMuted,
                    fontWeight: active ? "600" : "500",
                    fontFamily: active
                      ? typography.familySemiBold
                      : typography.familyMedium,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 7,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 11.5,
  },
});
