import path from "path";
import fs from "fs";

const ROUTES = function (routepath:any) {
  let routefile = "";
  try {
    if (process.env.GP_ROUTEFILE) {
      routefile = path.join(process.cwd(), process.env.GP_ROUTEFILE).toString();
    } else {
      if (routepath)
        routefile = path.join(routepath, "routes-dev.json").toString();
      else throw "configpath required";
    }
    const data:any = fs.readFileSync(routefile);
    const routes = JSON.parse(data);
    return routes;
  } catch (error) {
    throw error;
  }
};

export default ROUTES;
