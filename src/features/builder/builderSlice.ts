import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { getItemByName } from "../../items";

export interface BuilderState {
  highlightedItems: string[];
  skullCount: number;
  selectedTab: string;
  selectedItem: string | null;
  purchasedItems: string[];
  purchasedUpgrades: string[];
  selectedItems: string[];
}

export const myItemsTabName = "myitems";

const initialState: BuilderState = {
  // build
  highlightedItems: [],
  // shop
  selectedTab: myItemsTabName,
  selectedItem: null,
  skullCount: 0,
  purchasedItems: [],
  purchasedUpgrades: [],
  // build
  selectedItems: [],
};

export const builderSlice = createSlice({
  name: "builder",
  initialState,
  reducers: {
    // build
    highlightItem: (state, action: PayloadAction<string>) => {
      state.highlightedItems = [...state.highlightedItems, action.payload];
    },
    unhighlightItem: (state, action: PayloadAction<string>) => {
      state.highlightedItems = state.highlightedItems.filter(
        (id) => id !== action.payload
      );
    },

    // skulls
    setSkullCount: (state, action: PayloadAction<number>) => {
      state.skullCount = action.payload;
    },
    // shop
    selectTab: (state, action: PayloadAction<string>) => {
      state.selectedTab = action.payload;
      state.selectedItem = null;
    },
    selectItem: (state, action: PayloadAction<string>) => {
      state.selectedItem = action.payload;
    },
    buyItem: (state, action: PayloadAction<string>) => {
      state.purchasedItems = [...state.purchasedItems, action.payload];
    },
    sellItem: (state, action: PayloadAction<string>) => {
      state.purchasedItems = state.purchasedItems.filter(
        (id) => id !== action.payload
      );

      const { upgrades } = getItemByName(action.payload);

      state.purchasedUpgrades = state.purchasedUpgrades.filter(
        (name) =>
          upgrades.find((upgrade) => upgrade.name === name) === undefined
      );
    },
    buyUpgrade: (state, action: PayloadAction<string>) => {
      state.purchasedUpgrades = [...state.purchasedUpgrades, action.payload];
    },
    sellUpgrade: (state, action: PayloadAction<string>) => {
      state.purchasedUpgrades = state.purchasedUpgrades.filter(
        (id) => id !== action.payload
      );
    },
    // build
    // selectItem: (state, action: PayloadAction<string>) => {
    //   state.selectedItems = [...state.selectedItems, action.payload];
    // },
    // unselectItem: (state, action: PayloadAction<string>) => {
    //   state.selectedItems = state.selectedItems.filter(
    //     (id) => id !== action.payload
    //   );
    // },
  },
});

export const {
  buyItem,
  buyUpgrade,
  sellItem,
  sellUpgrade,
  setSkullCount,
  selectItem,
  selectTab,
  highlightItem,
  unhighlightItem,
} = builderSlice.actions;

export const selectHighlightedItems = (state: RootState) =>
  state.builder.highlightedItems;

export const selectSkullCount = (state: RootState) => state.builder.skullCount;

export const selectSelectedTab = (state: RootState) =>
  state.builder.selectedTab;

export const selectSelectedItem = (state: RootState) =>
  state.builder.selectedItem;

export const selectPurchasedItems = (state: RootState) =>
  state.builder.purchasedItems;

export const selectPurchasedUpgrades = (state: RootState) =>
  state.builder.purchasedUpgrades;

export const selectSelectedItems = (state: RootState) =>
  state.builder.selectedItems;

export default builderSlice.reducer;
