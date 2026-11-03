import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("despedida-manu", "routes/manuel.tsx"),
] satisfies RouteConfig;
