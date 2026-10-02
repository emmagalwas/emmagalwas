import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "zp5pg0oe",
    dataset: "production",
  },
  studioHost: "emmagalwas",
  deployment: {
    appId: "z86qylq1snrratvpsmft371w",
    autoUpdates: true,
  },
});
