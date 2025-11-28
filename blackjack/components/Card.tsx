import { View, Text, StyleSheet, Easing, Dimensions } from "react-native";
import React from "react";
import { IDecks } from "../lib/deck";
import Animated, {
  Keyframe,
  SequencedTransition,
} from "react-native-reanimated";

const keyframe = new Keyframe({
  0: {
    transform: [{ skewY: "0deg" }, { translateX: 300 }],
  },
  45: {
    transform: [{ skewY: "45deg" }, { translateX: 0 }],
  },
  100: {
    transform: [{ skewY: "0deg" }, { translateX: 0 }],
  },
});

const Card = ({ card, isMystery }: { card: IDecks; isMystery?: boolean }) => {
  return (
    <Animated.View
      key={card}
      layout={SequencedTransition}
      entering={keyframe}
      style={[
        styles.card,
        {
          backgroundColor: isMystery ? "black" : "white",
        },
      ]}
    >
      <Text
        style={{
          color: isMystery ? "white" : "black",
        }}
      >
        {isMystery ? "?" : card}
      </Text>
    </Animated.View>
  );
};

export default Card;

const styles = StyleSheet.create({
  card: {
    width: 50,
    height: 70,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eaeaeaaa",
  },
});
