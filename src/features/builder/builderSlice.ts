import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { getItemByName } from "../../items";

export interface BuilderState {
  searchTerm: string;
  highlightedItems: string[];
  skullCount: number;
  selectedTab: string | null;
  selectedItem: string | null;
  purchasedItems: string[];
  purchasedUpgrades: string[];
  selectedItems: string[];
}

export const myItemsTabName = "myitems";

const initialState: BuilderState = {
  // search
  searchTerm: "",
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
    // search
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.selectedTab = null;
      state.selectedItem = null;
    },

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
      state.searchTerm = "";
    },
    selectItem: (state, action: PayloadAction<string>) => {
      state.selectedItem = action.payload;
      state.searchTerm = "";
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
  },
});

export const {
  setSearchTerm,
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

export const selectSearchTerm = (state: RootState) => state.builder.searchTerm;

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
