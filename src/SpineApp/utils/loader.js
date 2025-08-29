import { Assets } from "pixi.js";

// { alias: "spineboyData", src: "./assets/spineboy-pro.skel" }

export const loadAssets = async (assetsData = []) => {
  assetsData.forEach((asset) => {
    Assets.add(asset);
  });

  await Assets.load(assetsData.map((asset) => asset.alias));
};
