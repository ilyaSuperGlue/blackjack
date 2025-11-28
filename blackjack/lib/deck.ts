import _ from "lodash";
type IKind = "spade" | "heart" | "club" | "diamond";
type ICard =
  | "a"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "j"
  | "q"
  | "k";
export type IDecks = `${ICard}-${IKind}`;

const get = (card: IDecks): [number, number] => {
  const [cardValue] = card.split("-") as [ICard, IKind];
  if (cardValue === "a") {
    return [1, 11];
  }
  if (cardValue === "j" || cardValue === "k" || cardValue === "q") {
    return [10, 10];
  }
  return [Number(cardValue), Number(cardValue)];
};

const arr: ICard[] = Array.from(
  {
    length: 13,
  },
  (_, i) => {
    const num = String(i + 1);
    if (num === "1") {
      return "a";
    }
    if (num === "11") {
      return "j";
    }
    if (num === "12") {
      return "q";
    }
    if (num === "13") {
      return "k";
    }
    return num as ICard;
  }
);

const getTotal = (decks: IDecks[]) => {
  const values = decks.map((c) => get(c));
  const valueA = _.sum(values.map((c) => c[0]));
  const valueB = _.sum(values.map((c) => c[1]));
  const isMaxA = valueA > valueB;
  if (isMaxA) {
    if (valueA > 21) {
      return valueB;
    }
    return valueA;
  }

  if (valueB > 21) {
    return valueA;
  }
  return valueB;
};

const kinds: IKind[] = ["spade", "heart", "club", "diamond"];

const fresh = () => {
  const cards: IDecks[] = kinds.flatMap((item) => {
    return arr.map((i) => (i + "-" + item) as IDecks);
  });
  return cards;
};

const shuffle = (cards: IDecks[]) => {
  return _.shuffle(cards);
};

const shuffledDeck = () => {
  const brandNewCard = fresh();
  return shuffle(brandNewCard);
};

const draw = ({ count, deck }: { count: number; deck: IDecks[] }) => {
  const drawedCards = deck.filter((_, i) => i < count);
  const remainingCards = deck.filter((_, i) => i >= count);
  return {
    drawedCards,
    remainingCards,
  };
};

const deck = {
  fresh,
  shuffledDeck,
  shuffle,
  draw,
  get,
  getTotal,
};

export default deck;
