import "@pixi/spine-pixi";
import { Application } from "pixi.js";

export default class SpineApp extends Application {
  static _instance;
  testNumber;
  constructor(number) {
    super();
    this.testNumber = number;
  }

  static getInstance(test) {
    if (!SpineApp._instance) {
      SpineApp._instance = new SpineApp(test);
    }
    return SpineApp._instance;
  }
}

export const init = (elementId) => async () => {
  console.log("Initializing SpineApp...");
  const app = SpineApp.getInstance(123);
  const appElement = document.getElementById(elementId);
  if (!appElement) {
    throw new Error("appElement not found");
  }
  await app.init({
    background: "#1099bb",
    resizeTo: appElement, //window
  });
  appElement.appendChild(app.canvas);
  console.log("SpineApp initialized successfully.");
};

// WORKING METHOD 1
// (() => {
//   window.onload = initApp;
// })();
