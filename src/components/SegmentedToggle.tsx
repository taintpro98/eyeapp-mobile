import { View, Text, Pressable, StyleSheet } from "react-native";
import { Lock } from "lucide-react-native";
import { useThemeColors } from "@/theme/useTheme";

type Option = {
  label: string;
  value: number;
  locked?: boolean;
};

type Props = {
  options: Option[];
  selected: number;
  onSelect: (value: number) => void;
};

export function SegmentedToggle({ options, selected, onSelect }: Props) {
  const c = useThemeColors();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        {options.map((opt) => {
          const active = opt.value === selected;
          const locked = opt.locked ?? false;

          return (
            <Pressable
              key={opt.value}
              onPress={() => { if (!locked) onSelect(opt.value); }}
              style={[
                styles.segment,
                active && !locked && { backgroundColor: c.brand },
                locked && { backgroundColor: c.chipBg },
              ]}
            >
              {locked && <Lock size={11} color={c.textFaint} />}
              <Text
                style={[
                  styles.segmentText,
                  { color: active && !locked ? "#fff" : locked ? c.textFaint : c.textMuted },
                  active && !locked && { fontWeight: "600" },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-start",
  },
  container: {
    flexDirection: "row",
    gap: 3,
    borderWidth: 1,
    borderRadius: 11,
    padding: 3,
    overflow: "hidden",
  },
  segment: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
