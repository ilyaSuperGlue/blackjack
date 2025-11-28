import { View, Text, Pressable, TouchableOpacity, Button } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import deck, { IDecks } from "./lib/deck";
import _ from "lodash";
import Table from "./components/Table";

export interface TState {
  deck: IDecks[];
  usedDeck: IDecks[];
  dealer: IDecks[];
  player: IDecks[];
  bet: number;
  balance: number;
}

const FirstState = ({ onPress }: { onPress: () => void }) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#007E6E",
        padding: 20,
        paddingVertical: 10,
        borderRadius: 10,
      }}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "600",
          fontSize: 25,
          lineHeight: 30,
          letterSpacing: 1.2,
        }}
      >
        play blackjack
      </Text>
    </Pressable>
  );
};

const Index = () => {
  const [play, setPlay] = useState(false);
  const [state, setState] = useState<TState>({
    balance: 1000,
    bet: 0,
    dealer: [],
    player: [],
    deck: deck.shuffledDeck(),
    usedDeck: [],
  });

  if (!play) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <FirstState onPress={() => setPlay(true)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Table state={state} setState={setState} />
      <View style={{ width: "100%", padding: 20 }}>
        <Text
          style={{
            fontWeight: "600",
            fontSize: 16,
            textAlign: "center",
          }}
        >
          Balance : ${state.balance}
        </Text>
      </View>
    </View>
  );
};

export default Index;
