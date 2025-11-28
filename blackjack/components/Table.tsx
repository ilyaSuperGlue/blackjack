import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import deck from "../lib/deck";
import { TState } from "..";
import Card from "./Card";
import Animated, {
  Easing,
  interpolateColor,
  Keyframe,
  SequencedTransition,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { useConfetti } from "@hikaaam/react-native-reanimated-confetti";

const winnerKey = new Keyframe({
  0: {
    transform: [{ scale: 0 }],
  },
  45: {
    transform: [{ scale: 2 }],
    easing: Easing.exp,
  },
  100: {
    transform: [{ scale: 1 }],
  },
});

const Table = ({
  state,
  setState,
}: {
  state: TState;
  setState: React.Dispatch<React.SetStateAction<TState>>;
}) => {
  const [bet, setBet] = useState(state.bet);
  const [winner, setWinner] = useState<"player" | "dealer" | "draw">();
  const [dealerTurn, setDealerTurn] = useState<number>();
  const { RenderConfetti, startconfetti } = useConfetti({ duration: 3000 });

  useEffect(() => {
    if (winner === "player") {
      startconfetti();
      setState((prev) => ({
        ...prev,
        balance: prev.balance + bet * 2,
      }));
    }
    if (winner === "draw") {
      setState((prev) => ({
        ...prev,
        balance: prev.balance + bet,
      }));
    }
  }, [winner]);

  const isDealerHaveAce = useMemo(() => {
    return state.dealer?.[0]?.split?.("-")?.[0]?.includes?.("a");
  }, [state.dealer]);

  useEffect(() => {
    if (isDealerHaveAce) {
      setReveal(true);
    }
  }, [isDealerHaveAce]);

  const [reveal, setReveal] = useState(isDealerHaveAce);

  const isMystery = useMemo(() => {
    if (reveal) {
      return false;
    }
    if (!isDealerHaveAce) {
      return true;
    }
    return winner == null;
  }, [isDealerHaveAce, winner, reveal]);

  const playerCount = useMemo(() => {
    return deck.getTotal(state.player);
  }, [state.player]);

  const onDealerTurn = useCallback(() => {
    const dealerCards = state.dealer;
    const totalDealer = deck.getTotal(dealerCards);
    const playerCard = state.player;
    const totalPlayer = deck.getTotal(playerCard);

    const forceDraw = () => {
      return totalDealer < totalPlayer;
    };

    if (forceDraw()) {
      setState((prev) => {
        const { drawedCards, remainingCards } = deck.draw({
          count: 1,
          deck: prev.deck,
        });
        return {
          ...prev,
          deck: remainingCards,
          dealer: [...prev.dealer, ...drawedCards],
          usedDeck: [prev.usedDeck, ...drawedCards],
        } as TState;
      });
      setDealerTurn(new Date().getSeconds());
      return;
    }

    if (totalDealer > 21) {
      setWinner("player");
      return;
    }

    const win = totalPlayer > totalDealer ? "player" : "dealer";
    setWinner(totalPlayer === totalDealer ? "draw" : win);
  }, [state.dealer, state.player]);

  useEffect(() => {
    if (playerCount > 21) {
      setReveal(true);
      setWinner("dealer");
      return;
    }
    if (dealerTurn || playerCount === 21) {
      setReveal(true);
      setTimeout(() => {
        onDealerTurn();
      }, 1000);
    }
  }, [dealerTurn, onDealerTurn, playerCount]);

  const onPlayAgain = useCallback(() => {
    setBet(0);
    setReveal(false);
    setDealerTurn(undefined);
    setWinner(undefined);
    setState((prev) => {
      return {
        ...prev,
        bet: 0,
        player: [],
        dealer: [],
      };
    });
  }, []);

  const onHit = useCallback(() => {
    setState((prev) => {
      const { drawedCards, remainingCards } = deck.draw({
        count: 1,
        deck: prev.deck,
      });

      return {
        ...prev,
        deck: remainingCards,
        player: [...prev.player, ...drawedCards],
        usedDeck: [prev.usedDeck, ...drawedCards],
      } as TState;
    });
  }, [setState]);

  const onBetConfirm = useCallback(() => {
    setState((prev) => {
      const balance = prev.balance - bet;
      const { drawedCards, remainingCards } = deck.draw({
        count: 4,
        deck: prev.deck,
      });
      return {
        ...prev,
        balance,
        player: [drawedCards[0], drawedCards[1]],
        dealer: [drawedCards[2], drawedCards[3]],
        deck: remainingCards,
        usedDeck: [...prev.usedDeck, ...drawedCards],
        bet,
      };
    });
  }, [setState, bet]);

  if (state.bet <= 0) {
    return (
      <View style={styles.betContainer}>
        <Text style={styles.textWhite}>Input your bet amount</Text>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}
        >
          <Animated.View layout={SequencedTransition}>
            <TouchableOpacity
              disabled={bet <= 0}
              onPress={() => setBet((prev) => prev - 10)}
            >
              <Text style={styles.textIcon}>-</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.Text
            layout={SequencedTransition}
            style={[
              styles.textWhite,
              {
                marginHorizontal: 20,
              },
            ]}
          >
            ${bet}
          </Animated.Text>
          <Animated.View layout={SequencedTransition}>
            <TouchableOpacity
              disabled={bet >= state.balance}
              onPress={() => setBet((prev) => prev + 10)}
            >
              <Text style={styles.textIcon}>+</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <Animated.View entering={ZoomIn.springify(500)} exiting={ZoomOut}>
          <TouchableOpacity
            disabled={bet <= 0}
            onPress={onBetConfirm}
            style={[
              styles.btnConfirm,
              {
                backgroundColor: interpolateColor(
                  bet,
                  [0, 1],
                  ["#888", "#fff"]
                ),
              },
            ]}
          >
            <Text>Confirm</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }
  return (
    <View style={styles.tableContainer}>
      <RenderConfetti />
      <View style={styles.cardContainer}>
        {state.dealer.map((item, i) => (
          <Card card={item} isMystery={isMystery && i == 1} key={item} />
        ))}
      </View>
      {winner != null && (
        <Animated.View style={styles.winner} entering={winnerKey}>
          <Text
            style={[
              styles.textWhite,
              {
                fontSize: 25,
                textAlign: "center",
                lineHeight: 40,
              },
            ]}
          >
            {winner == "player"
              ? "You win"
              : winner === "dealer"
              ? "You lose"
              : "Draw"}
            !
          </Text>
        </Animated.View>
      )}
      <View>
        <View style={styles.cardContainer}>
          {state.player.map((item) => (
            <Card card={item} key={item} />
          ))}
        </View>
        {winner && (
          <Animated.View
            entering={ZoomIn}
            exiting={ZoomOut}
            style={[
              styles.cardContainer,
              {
                marginTop: 20,
              },
            ]}
          >
            <TouchableOpacity style={styles.btnPlayAgain} onPress={onPlayAgain}>
              <Text style={styles.textWhite}>play again!</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {!winner && playerCount != 21 && !dealerTurn && (
          <Animated.View
            exiting={ZoomOut}
            style={[
              styles.cardContainer,
              {
                marginTop: 20,
              },
            ]}
          >
            <TouchableOpacity style={styles.btnText} onPress={onHit}>
              <Text style={styles.textWhite}>hit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnText}
              onPress={() => {
                setReveal(true);
                setDealerTurn(new Date().getSeconds());
              }}
            >
              <Text style={styles.textWhite}>stand</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

export default Table;

const styles = StyleSheet.create({
  betContainer: {
    width: "100%",
    backgroundColor: "#007E6E",
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  textWhite: {
    color: "white",
    fontWeight: "600",
    fontSize: 20,
    letterSpacing: 1.2,
  },
  textIcon: {
    color: "white",
    fontWeight: "600",
    fontSize: 30,
    letterSpacing: 1.2,
  },
  btnConfirm: {
    paddingVertical: 8,
    padding: 20,
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 5,
  },
  tableContainer: {
    width: "100%",
    backgroundColor: "#007E6E",
    height: 400,
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  cardContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  btnPlayAgain: {
    backgroundColor: "black",
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  btnText: {
    backgroundColor: "black",
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  winner: {
    position: "absolute",
    alignSelf: "center",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
