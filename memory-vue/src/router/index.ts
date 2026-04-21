import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
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
      meta: { requiresAuth: true },
    },
    {
      path: "/data-entry/:id",
      name: "dataEntryEdit",
      component: () => import("../views/DataEntryView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 未登录，跳转到登录页面，并记录原目标地址
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  } else {
    next();
  }
});

export default router;
