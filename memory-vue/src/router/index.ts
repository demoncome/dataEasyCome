import { createRouter, createWebHistory } from "vue-router";
import PlanListView from "../views/PlanListView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "planList",
      component: PlanListView,
    },
    {
      path: "/plan/:id",
      name: "planDetail",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/data-entry",
      name: "dataEntry",
      component: () => import("../views/DataEntryView.vue"),
    },
  ],
});

export default router;
