import { View, Text, Pressable, StyleSheet } from "react-native";
import { useThemeColors } from "@/theme/useTheme";

type Props = {
  options: { label: string; value: number }[];
  selected: number;
  onSelect: (value: number) => void;
};

export function SegmentedToggle({ options, selected, onSelect }: Props) {
  const c = useThemeColors();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.card, borderColor: c.cardBorder },
      ]}
    >
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <Pressable key={opt.value} onPress={() => onSelect(opt.value)}>
            <View
              style={[
                styles.segment,
                active && { backgroundColor: c.brand },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: active ? "#fff" : c.textMuted },
                  active && { fontWeight: "600" },
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
  container: {
    flexDirection: "row",
    gap: 3,
    borderWidth: 1,
    borderRadius: 11,
    padding: 3,
  },
  segment: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
