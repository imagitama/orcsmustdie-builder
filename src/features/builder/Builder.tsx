import React, { useState } from "react";
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";

import skullIconUrl from "../../assets/images/skull.webp";
import { ReactComponent as SwordIcon } from "../../assets/images/sword.svg";
import { ReactComponent as TrapIcon } from "../../assets/images/trap.svg";
import { ReactComponent as TrinketIcon } from "../../assets/images/trinket.svg";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import items, {
  characters,
  getItemByName,
  getItemsByType,
  getUpgradeByName,
  Item,
  itemType,
  Upgrade,
} from "../../items";
import {
  buyItem,
  buyUpgrade,
  highlightItem,
  myItemsTabName,
  selectHighlightedItems,
  selectItem,
  selectPurchasedItems,
  selectPurchasedUpgrades,
  selectSearchTerm,
  selectSelectedItem,
  selectSelectedItems,
  selectSelectedTab,
  selectSkullCount,
  selectTab,
  sellItem,
  sellUpgrade,
  setSearchTerm,
  setSkullCount,
  unhighlightItem,
} from "./builderSlice";
import { getUrlFriendlyState } from "../../app/store";

const SkullCount = ({
  count,
  usedCount,
  big = false,
}: {
  count: number;
  usedCount?: number;
  big?: boolean;
}) => (
  <div
    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
  >
    <img src={skullIconUrl} width={big ? 75 : 25} />{" "}
    <span
      style={{
        fontSize: big ? "200%" : "150%",
        fontWeight: "bold",
        marginLeft: big ? "1rem" : "0.5rem",
        textShadow: big ? "0 0 10px red" : "1px 1px 1px #000",
      }}
    >
      {usedCount !== undefined ? `${usedCount} / ` : ""}
      {count}
    </span>
  </div>
);

const getUsedSkullCount = (
  itemNames: string[],
  upgradeNames: string[]
): number => {
  const itemsCost = itemNames
    .map((name) => getItemByName(name).unlockCost)
    .reduce((tally, cost) => tally + cost, 0);

  const upgradesCost = upgradeNames
    .map((name) => getUpgradeByName(name).unlockCost)
    .reduce((tally, cost) => tally + cost, 0);

  return itemsCost + upgradesCost;
};

const Skulls = () => {
  const skullCount = useAppSelector(selectSkullCount);
  const purchasedItems = useAppSelector(selectPurchasedItems);
  const purchasedUpgrades = useAppSelector(selectPurchasedUpgrades);
  const dispatch = useAppDispatch();
  const [skullCountValue, setSkullCountValue] = useState<string>("");

  const usedSkullCount = getUsedSkullCount(purchasedItems, purchasedUpgrades);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "1rem",
        alignItems: "center",
      }}
    >
      <SkullCount count={skullCount} usedCount={usedSkullCount} big />
      <TextField
        style={{ marginLeft: "1rem" }}
        value={skullCountValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setSkullCountValue(newValue);

          const intValue = parseInt(newValue);

          if (intValue > 0) {
            dispatch(setSkullCount(intValue));
          }
        }}
        type="number"
      />
    </div>
  );
};

const ItemIcon = ({
  name,
  withName = false,
}: {
  name: string;
  withName?: boolean;
}) => {
  const { imageUrl } = getItemByName(name);
  const dispatch = useAppDispatch();
  const onClickItem = () => dispatch(selectItem(name));

  return (
    <div
      onClick={() => onClickItem()}
      style={{ width: "150px", padding: "0.5rem", cursor: "pointer" }}
    >
      <img src={imageUrl} style={{ width: "100%", maxHeight: "150px" }} />
      {withName ? <div style={{ marginTop: "0.25rem" }}>{name}</div> : ""}
    </div>
  );
};

const IconForBuild = ({ name }: { name: string }) => {
  const { imageUrl } = getItemByName(name);
  const dispatch = useAppDispatch();
  const onClickItem = () => dispatch(selectItem(name));

  return (
    <div
      onClick={() => onClickItem()}
      style={{ width: "100px", cursor: "pointer" }}
    >
      <img src={imageUrl} style={{ width: "100%", maxHeight: "100px" }} />
    </div>
  );
};

const EmptyItemIcon = () => {
  return (
    <div
      style={{
        width: "100px",
        height: "100px",
        background: "rgb(0, 0, 0)",
      }}
    ></div>
  );
};

const ItemTileUpgrade = ({
  upgrades,
  upgrade: { name, type, description },
  isPurchased,
}: {
  upgrades: Upgrade[];
  upgrade: Upgrade;
  isPurchased: boolean;
}) => {
  const allUpgradesForType = upgrades.filter(
    (upgrade) => upgrade.type === type
  );
  const thisIndex = allUpgradesForType.findIndex(
    (upgrade) => upgrade.name === name
  );

  const label = `${type.substring(0, 1)}${thisIndex + 1}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginRight: "1.5rem",
        opacity: isPurchased ? 1 : 0.2,
      }}
      title={description}
    >
      {label}{" "}
      {isPurchased ? (
        <span style={{ marginLeft: "0.25rem" }}>
          <PurchasedIcon tiny />
        </span>
      ) : (
        ""
      )}
    </div>
  );
};

const ItemTileUpgrades = ({ upgrades }: { upgrades: Upgrade[] }) => {
  const allPurchasedUpgrades = useAppSelector(selectPurchasedUpgrades);
  const purchaseStatuses = upgrades.map(({ name }) =>
    allPurchasedUpgrades.includes(name)
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginTop: "0.5rem",
        justifyContent: "right",
      }}
    >
      {upgrades.map((upgrade, idx) => (
        <ItemTileUpgrade
          key={upgrade.name}
          upgrades={upgrades}
          upgrade={upgrade}
          isPurchased={purchaseStatuses[idx]}
        />
      ))}
    </div>
  );
};

const ItemTile = ({ name }: { name: string }) => {
  const purchasedItems = useAppSelector(selectPurchasedItems);
  const dispatch = useAppDispatch();
  const onClick = () => dispatch(selectItem(name));

  const {
    imageUrl,
    unlockCost,
    shortDescription,
    upgrades,
    passive,
    active,
    primary,
    secondary,
  } = getItemByName(name);

  const isPurchasedWithSkulls = purchasedItems.includes(name);
  const isStartingItem = unlockCost === 0;

  return (
    <div
      style={{
        width: "100%",
        height: "150px",
        position: "relative",
        padding: "1rem",
      }}
    >
      {isPurchasedWithSkulls || isStartingItem ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            transform: "translate(25%, -25%)",
            zIndex: 100,
          }}
        >
          <PurchasedIcon small hollow={isStartingItem} />
        </div>
      ) : null}
      <div
        style={{
          background: "rgb(75, 75, 75",
          display: "flex",
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginRight: "0.5rem",
            padding: "0.5rem",
          }}
        >
          <img src={imageUrl} width={100} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SkullCount count={unlockCost} />
          </div>
        </div>
        <div style={{ width: "100%", padding: "0.5rem" }}>
          <div
            style={{
              fontSize: "125%",
              fontWeight: "bold",
              color: "rgb(255, 255, 0)",
              marginBottom: "0.5rem",
            }}
          >
            {name}
          </div>
          {shortDescription}
          {passive ? (
            <div>
              <strong>Passive:</strong> {passive}
            </div>
          ) : null}
          {active ? (
            <div>
              <strong>Active:</strong> {active}
            </div>
          ) : null}
          {primary ? (
            <div>
              <strong>Primary:</strong> {primary}
            </div>
          ) : null}
          {secondary ? (
            <div>
              <strong>Secondary:</strong> {secondary}
            </div>
          ) : null}
          <ItemTileUpgrades upgrades={upgrades} />
        </div>
      </div>
    </div>
  );
};

const Build = () => {
  const highlightedItems = useAppSelector(selectHighlightedItems);
  const dispatch = useAppDispatch();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
        <div style={{ margin: "0.25rem" }}>
          {highlightedItems[idx] ? (
            <IconForBuild name={highlightedItems[idx]} />
          ) : (
            <EmptyItemIcon />
          )}
        </div>
      ))}
    </div>
  );
};

const ItemTiles = ({ children }: { children: React.ReactElement[] }) => (
  <div style={{ display: "flex", flexWrap: "wrap" }}>
    {React.Children.map(children, (child) => (
      <div style={{ width: "50%", padding: "0.25rem" }}>{child}</div>
    ))}
  </div>
);

const MyItems = () => {
  const purchasedItems = useAppSelector(selectPurchasedItems);
  const itemNames = [
    ...purchasedItems,
    ...items.filter((item) => item.unlockCost === 0).map((item) => item.name),
  ];
  return (
    <ItemTiles>
      {itemNames.map((itemName) => (
        <ItemTile name={itemName} />
      ))}
    </ItemTiles>
  );
};

const sortItems = (
  itemA: Item,
  itemB: Item,
  selectedItems: string[]
): number => {
  if (itemA.unlockCost === 0 || selectedItems.includes(itemA.name)) {
    if (itemB.unlockCost === 0 || selectedItems.includes(itemB.name)) {
      if (itemB.name.localeCompare(itemA.name)) {
        return 1;
      } else {
        return -1;
      }
    }

    return -1;
  }

  if (itemB.unlockCost === 0 || selectedItems.includes(itemB.name)) {
    return 1;
  }

  return 0;
};

const ItemsByType = ({ type }: { type: string }) => {
  const selectedItems = useAppSelector(selectSelectedItems);
  return (
    <ItemTiles>
      {getItemsByType(type)
        .sort((...args) => sortItems(...args, selectedItems))
        .map((item) => (
          <ItemTile name={item.name} />
        ))}
    </ItemTiles>
  );
};

const Tab = ({
  isSelected,
  onClick,
  icon: Icon,
  label,
}: {
  isSelected: boolean;
  onClick: () => void;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "1rem",
        background: isSelected ? "rgb(150, 100, 100)" : "rgb(100, 50, 50)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "1rem",
        cursor: "pointer",
      }}
    >
      <span
        style={{ marginBottom: "0.5rem", fontWeight: "bold", fontSize: "150%" }}
      >
        {label}
      </span>
      <Icon />
    </div>
  );
};

const ShopTab = ({
  isSelected,
  type,
  onClick,
}: {
  isSelected: boolean;
  type: string;
  onClick: () => void;
}) => {
  return (
    <Tab
      isSelected={isSelected}
      onClick={onClick}
      label={type}
      icon={
        type === itemType.Trap
          ? TrapIcon
          : type === itemType.Weapon
          ? SwordIcon
          : type === itemType.Trinket
          ? TrinketIcon
          : SwordIcon
      }
    />
  );
};

const UpgradeTile = ({
  item: { upgrades, imageUrl },
  upgrade: { name, type, description, unlockCost },
  isAvailable,
}: {
  item: Item;
  upgrade: Upgrade;
  isAvailable: boolean;
}) => {
  const purchasedUpgrades = useAppSelector(selectPurchasedUpgrades);
  const dispatch = useAppDispatch();

  const isPurchased = purchasedUpgrades.includes(name);
  const toggleSelected = () =>
    dispatch(isPurchased ? sellUpgrade(name) : buyUpgrade(name));

  const allUpgradesForType = upgrades.filter(
    (upgrade) => upgrade.type === type
  );
  const thisIndex = allUpgradesForType.findIndex(
    (upgrade) => upgrade.name === name
  );

  const label = `${type} ${thisIndex + 1}`;

  return (
    <div
      style={{
        width: "100%",
        background: isPurchased ? "rgb(100, 100, 75)" : "rgb(75, 75, 75",
        display: "flex",
        cursor: "pointer",
        marginBottom: "0.5rem",
        outline: isPurchased ? "1px solid yellow" : "",
        opacity: isAvailable ? 1 : 0.5,
      }}
      onClick={() => toggleSelected()}
    >
      <div style={{ marginRight: "0.5rem", padding: "0.5rem" }}>
        <img src={imageUrl} width={100} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SkullCount count={unlockCost} />
        </div>
      </div>
      <div style={{ width: "100%" }}>
        <div
          style={{
            fontSize: "125%",
            fontWeight: "bold",
            marginBottom: "0.5rem",
          }}
        >
          {label}
        </div>
        {description}
      </div>
    </div>
  );
};

const PurchasedIcon = ({
  small = false,
  tiny = false,
  hollow = false,
}: {
  small?: boolean;
  tiny?: boolean;
  hollow?: boolean;
}) => (
  <div
    style={{
      width: small ? "50px" : tiny ? "15px" : "100px",
      height: small ? "50px" : tiny ? "15px" : "100px",
      background: hollow
        ? "none"
        : tiny
        ? "rgb(100, 100, 0)"
        : "rgb(150, 150, 0)",
      color: "#FFF",
      borderRadius: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: tiny || hollow ? 0.5 : 0,
    }}
  >
    <DoneIcon style={{ fontSize: small ? "250%" : tiny ? "75%" : "500%" }} />
  </div>
);

const InfoBlock = ({
  children,
  style = {},
}: {
  children: any;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      padding: "1rem 0 0 1rem",
      ...style,
    }}
  >
    {children}
  </div>
);

const ItemView = ({ name }: { name: string }) => {
  const item = getItemByName(name);
  const {
    buildCost,
    unlockCost,
    upgrades,
    imageUrl,
    character,
    shortDescription,
    passive,
    active,
    primary,
    secondary,
  } = item;
  const dispatch = useAppDispatch();

  const purchasedItems = useAppSelector(selectPurchasedItems);
  const isPurchased = purchasedItems.includes(name) || unlockCost === 0;
  const togglePurchased = () =>
    dispatch(isPurchased ? sellItem(name) : buyItem(name));

  const highlightedItems = useAppSelector(selectHighlightedItems);
  const isHighlighted = highlightedItems.includes(name);
  const toggleHighlighted = () =>
    dispatch(isHighlighted ? unhighlightItem(name) : highlightItem(name));

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "50%" }}>
        {upgrades.map((upgrade) => (
          <UpgradeTile
            item={item}
            upgrade={upgrade}
            isAvailable={isPurchased}
          />
        ))}
      </div>
      <div style={{ width: "50%", padding: "1rem", position: "relative" }}>
        {isPurchased ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
            }}
          >
            <PurchasedIcon />
          </div>
        ) : null}
        <img src={imageUrl} width="100%" />
        <InfoBlock>Build cost: {buildCost}</InfoBlock>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          <SkullCount count={unlockCost} />
          <Button
            variant="contained"
            size="large"
            style={{ marginLeft: "1rem" }}
            onClick={() => togglePurchased()}
          >
            {isPurchased ? "Sell" : "Buy"}
          </Button>
          <Button
            variant="contained"
            size="large"
            style={{ marginLeft: "1rem" }}
            onClick={() => toggleHighlighted()}
            disabled={!isPurchased}
          >
            {isHighlighted ? "Remove" : "Add"}
          </Button>
        </div>
        {shortDescription}
        {passive ? (
          <InfoBlock>
            <strong>Passive:</strong> {passive}
          </InfoBlock>
        ) : null}
        {active ? (
          <InfoBlock>
            <strong>Active:</strong> {active}
          </InfoBlock>
        ) : null}
        {primary ? (
          <InfoBlock>
            <strong>Primary:</strong> {primary}
          </InfoBlock>
        ) : null}
        {secondary ? (
          <InfoBlock>
            <strong>Secondary:</strong> {secondary}
          </InfoBlock>
        ) : null}
        {character === characters.Sorceress ||
        character === characters.WarMage ? (
          <InfoBlock>This item is restricted to a starting character</InfoBlock>
        ) : null}
      </div>
    </div>
  );
};

const MyItemsTab = ({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <Tab
      isSelected={isSelected}
      onClick={onClick}
      label="My Items"
      icon={() => null}
    />
  );
};

const Shop = () => {
  const selectedTab = useAppSelector(selectSelectedTab);
  const selectedItem = useAppSelector(selectSelectedItem);
  const searchTerm = useAppSelector(selectSearchTerm);
  const dispatch = useAppDispatch();

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "30%" }}>
        <MyItemsTab
          isSelected={selectedTab === myItemsTabName}
          onClick={() => dispatch(selectTab(myItemsTabName))}
        />
        {Object.values(itemType).map((itemTypeItem) => (
          <ShopTab
            isSelected={selectedTab === itemTypeItem}
            type={itemTypeItem}
            onClick={() => dispatch(selectTab(itemTypeItem))}
          />
        ))}
      </div>
      <div style={{ width: "100%" }}>
        {searchTerm ? (
          <Search />
        ) : selectedItem ? (
          <ItemView name={selectedItem} />
        ) : selectedTab === myItemsTabName ? (
          <MyItems />
        ) : selectedTab ? (
          <ItemsByType type={selectedTab} />
        ) : null}
      </div>
    </div>
  );
};

const Search = () => {
  const searchTerm = useAppSelector(selectSearchTerm);
  const searchTermLower = searchTerm.toLowerCase();

  const results = items.filter(
    ({ shortDescription, passive, active, primary, secondary, upgrades }) => {
      const subResult = [
        shortDescription,
        passive,
        active,
        primary,
        secondary,
      ].find((item) => item?.toLowerCase().includes(searchTermLower));

      if (subResult) {
        return true;
      }

      const upgradeResult = upgrades.find(
        ({ description: upgradeDescription }) =>
          upgradeDescription.toLowerCase().includes(searchTermLower)
      );

      if (upgradeResult) {
        return true;
      }

      return false;
    }
  );

  if (!results.length) {
    return (
      <div
        style={{
          color: "rgb(255, 100, 100)",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        No results found
      </div>
    );
  }

  return (
    <ItemTiles>
      {results.map((item) => (
        <ItemTile key={item.name} name={item.name} />
      ))}
    </ItemTiles>
  );
};

const Exporter = () => {
  const [exportedUrl, setExportedUrl] = useState("");

  const updateExportedUrl = () => {
    const urlFriendly = getUrlFriendlyState();
    const newUrl = `${window.location.href}?state=${urlFriendly}`;
    setExportedUrl(newUrl);
  };

  const copy = () => {
    navigator.clipboard.writeText(exportedUrl);
  };

  return (
    <>
      <TextField value={exportedUrl} /> <Button onClick={copy}>Copy</Button>
      <br />
      <br />
      <Button onClick={updateExportedUrl}>Export</Button>
    </>
  );
};

const SearchInput = () => {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector(selectSearchTerm);

  return (
    <div style={{ padding: "1rem" }}>
      <TextField
        value={searchTerm}
        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
        placeholder="Search..."
      />
    </div>
  );
};

export function Builder() {
  return (
    <div>
      <div style={{ display: "flex" }}>
        <div>
          <SearchInput />
        </div>
        <div style={{ width: "100%" }}>
          <Skulls />
        </div>
      </div>
      <Build />
      <Shop />
      <hr />
      <Exporter />
      <hr />
      <Button
        onClick={() => {
          window.localStorage.clear();
          window.location.href = window.location.href.split("?")[0];
        }}
      >
        Reset
      </Button>
    </div>
  );
}
