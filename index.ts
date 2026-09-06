import { storage } from "@vendetta/plugin";
import { findByProps, findByStoreName, findByName } from "@vendetta/metro";
import { after, before } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";

const { FormSection, FormInput, FormRow, FormDivider, FormIcon } = Forms;
const { View, Text, Image, ScrollView, TouchableOpacity } = ReactNative;

// Storage structure example:
// storage.badges = {
//   "123456789012345678": [
//     { image: "https://i.imgur.com/example.png", tooltip: "Cool Badge" }
//   ]
// }

if (!storage.badges) storage.badges = {};

const patches: (() => void)[] = [];

export default {
  onLoad() {
    console.log("[LocalBadges] Plugin loaded");

    // NOTE:
    // The exact module that renders profile badges changes often.
    // You will likely need to update the finders below after Discord updates.
    // Use tools like Action Sheet Finder or metro searching to locate the current component.

    try {
      // Attempt to find badge-related modules
      const profileModules = findByProps("getBadges") || findByProps("BADGE_KEYS");
      // You can add more patches here once you identify the correct component
    } catch (e) {
      console.log("[LocalBadges] Could not find badge modules:", e);
    }
  },

  onUnload() {
    patches.forEach((unpatch) => unpatch());
    console.log("[LocalBadges] Plugin unloaded");
  },

  settings: () => {
    const [userId, setUserId] = React.useState("");
    const [imageUrl, setImageUrl] = React.useState("");
    const [tooltip, setTooltip] = React.useState("");
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    const addBadge = () => {
      const id = userId.trim();
      const url = imageUrl.trim();

      if (!id || !url) {
        showToast("User ID and Image URL are required");
        return;
      }

      if (!storage.badges[id]) storage.badges[id] = [];

      storage.badges[id].push({
        image: url,
        tooltip: tooltip.trim() || "Custom Badge",
      });

      setUserId("");
      setImageUrl("");
      setTooltip("");
      forceUpdate();
      showToast("Badge added successfully!");
    };

    const removeBadge = (uid: string, index: number) => {
      storage.badges[uid].splice(index, 1);
      if (storage.badges[uid].length === 0) {
        delete storage.badges[uid];
      }
      forceUpdate();
      showToast("Badge removed");
    };

    const clearAll = () => {
      storage.badges = {};
      forceUpdate();
      showToast("All badges cleared");
    };

    return React.createElement(
      ScrollView,
      { style: { flex: 1, padding: 16 } },
      React.createElement(
        FormSection,
        { title: "Add Custom Badge" },
        React.createElement(FormInput, {
          title: "User ID",
          value: userId,
          onChange: setUserId,
          placeholder: "123456789012345678",
        }),
        React.createElement(FormInput, {
          title: "Image URL (direct link)",
          value: imageUrl,
          onChange: setImageUrl,
          placeholder: "https://i.imgur.com/....png",
        }),
        React.createElement(FormInput, {
          title: "Tooltip (optional)",
          value: tooltip,
          onChange: setTooltip,
          placeholder: "Cool Badge",
        }),
        React.createElement(FormRow, {
          label: "Add Badge",
          onPress: addBadge,
        })
      ),
      React.createElement(
        FormSection,
        { title: "Current Badges" },
        Object.keys(storage.badges || {}).length === 0
          ? React.createElement(Text, { style: { color: "#aaa", padding: 8 } }, "No badges added yet.")
          : Object.entries(storage.badges || {}).map(([uid, badges]: [string, any[]]) =>
              React.createElement(
                View,
                { key: uid, style: { marginBottom: 12 } },
                React.createElement(
                  Text,
                  { style: { color: "#fff", fontWeight: "bold", marginBottom: 6, marginLeft: 8 } },
                  `User: ${uid}`
                ),
                badges.map((badge: any, i: number) =>
                  React.createElement(FormRow, {
                    key: i,
                    label: badge.tooltip,
                    subLabel: badge.image,
                    onPress: () => removeBadge(uid, i),
                    trailing: React.createElement(Text, { style: { color: "#f04747" } }, "Remove"),
                  })
                ),
                React.createElement(FormDivider, null)
              )
            )
      ),
      React.createElement(
        FormSection,
        { title: "Danger Zone" },
        React.createElement(FormRow, {
          label: "Clear All Badges",
          onPress: clearAll,
          style: { color: "#f04747" },
        })
      )
    );
  },
};
